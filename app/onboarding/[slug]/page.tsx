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

  // Resolve Instagram profile pics for each creator
  for (let i = 0; i < creators.length; i++) {
    const cr = creators[i];
    // If photo_url is an IG profile URL, try to resolve actual pic
    const igUser = cr.instagram_username || extractInstagramUsername(cr.photo_url);
    if (igUser && (!cr.photo_url || cr.photo_url.includes('instagram.com/'))) {
      const { data: igProfile } = await supabase
        .from('business_instagram_profiles')
        .select('profile_pic_url')
        .eq('username', igUser)
        .limit(1)
        .maybeSingle();
      if (igProfile?.profile_pic_url) {
        creators[i] = { ...cr, photo_url: igProfile.profile_pic_url };
      }
    }
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
