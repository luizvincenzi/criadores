import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingPresentation } from './OnboardingPresentation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Extract Instagram username from a URL like https://www.instagram.com/username/
function extractInstagramUsername(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/([A-Za-z0-9_.]+)/);
  return match ? match[1] : null;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getOnboardingData(slug: string) {
  const supabase = createClient();

  // Fetch business by slug
  const { data: business, error: bizError } = await supabase
    .from('businesses')
    .select('id, name, slug, contact_info, address')
    .eq('slug', slug)
    .eq('organization_id', '00000000-0000-0000-0000-000000000001')
    .single();

  if (bizError || !business) return null;

  // Fetch onboarding data
  const { data: onboarding, error: onbError } = await supabase
    .from('business_onboardings')
    .select('*')
    .eq('business_id', business.id)
    .eq('status', 'published')
    .single();

  if (onbError || !onboarding) return null;

  // Build creators list from new `creators` JSONB array or legacy single creator
  let creators: any[] = onboarding.creators || [];

  // Legacy backward compat: if no creators array but has creator_id
  if (creators.length === 0 && onboarding.creator_id) {
    const { data: creatorData } = await supabase
      .from('creators')
      .select('id, name, slug, social_media, profile_info')
      .eq('id', onboarding.creator_id)
      .single();
    if (creatorData) {
      creators = [{
        id: creatorData.id,
        name: creatorData.name,
        instagram_username: creatorData.social_media?.instagram?.username || '',
        photo_url: onboarding.creator_photo_url || '',
        match_description: onboarding.match_description || '',
      }];
    }
  }

  // Resolve profile pics + IG username for each creator from DB + ScrapeCreators
  for (let i = 0; i < creators.length; i++) {
    const cr = creators[i];
    let resolvedPhoto = '';
    let resolvedIg = cr.instagram_username || '';

    // 1) Look up the actual creator in DB to get reliable IG username + profile pic
    if (cr.id) {
      const { data: creatorRow } = await supabase
        .from('creators')
        .select('social_media, profile_info')
        .eq('id', cr.id)
        .maybeSingle();

      if (creatorRow) {
        if (!resolvedIg) {
          resolvedIg = creatorRow.social_media?.instagram?.username || '';
        }
        if (creatorRow.profile_info?.profile_pic_url) {
          resolvedPhoto = creatorRow.profile_info.profile_pic_url;
        }
      }
    }

    // 2) Fallback: use photo_url from onboarding (skip expired fbcdn URLs)
    if (!resolvedPhoto && cr.photo_url && cr.photo_url.startsWith('http')
        && !cr.photo_url.includes('fbcdn.net') && !cr.photo_url.includes('cdninstagram.com')) {
      resolvedPhoto = cr.photo_url;
    }

    // 3) Last resort: fetch from ScrapeCreators API if we have IG username but no photo
    if (!resolvedPhoto && resolvedIg) {
      try {
        const apiKey = process.env.SCRAPECREATORS_API_KEY;
        if (apiKey) {
          const scRes = await fetch(
            `https://api.scrapecreators.com/v1/instagram/basic-info?handle=${encodeURIComponent(resolvedIg)}`,
            { headers: { 'x-api-key': apiKey }, next: { revalidate: 86400 } } // cache 24h
          );
          if (scRes.ok) {
            const scData = await scRes.json();
            if (scData?.data?.profile_pic_url) {
              resolvedPhoto = scData.data.profile_pic_url;
              // Also save to creators table for future use
              await supabase
                .from('creators')
                .update({ profile_info: { profile_pic_url: resolvedPhoto } })
                .eq('id', cr.id);
            }
          }
        }
      } catch {
        // ScrapeCreators failed, continue without photo
      }
    }

    creators[i] = {
      ...cr,
      photo_url: resolvedPhoto,
      instagram_username: resolvedIg,
    };
  }

  return { business, onboarding, creators };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getOnboardingData(slug);

  if (!data) {
    return { title: 'Onboarding - crIAdores' };
  }

  const { business, onboarding } = data;
  const title = onboarding.og_title || `Bem-vindo ${business.name} - crIAdores`;
  const description = onboarding.og_description || `Conheça a social media selecionada para ${business.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(onboarding.og_image_url ? { images: [{ url: onboarding.og_image_url }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(onboarding.og_image_url ? { images: [onboarding.og_image_url] } : {}),
    },
  };
}

export default async function OnboardingPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getOnboardingData(slug);

  if (!data) {
    notFound();
  }

  return (
    <OnboardingPresentation
      business={data.business}
      onboarding={data.onboarding}
      creators={data.creators}
    />
  );
}
