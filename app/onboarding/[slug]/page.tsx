import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OnboardingPresentation } from './OnboardingPresentation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  // Fetch creator details if assigned
  let creator = null;
  if (onboarding.creator_id) {
    const { data: creatorData } = await supabase
      .from('creators')
      .select('id, name, slug, social_media, profile_info')
      .eq('id', onboarding.creator_id)
      .single();
    creator = creatorData;
  }

  return { business, onboarding, creator };
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
      creator={data.creator}
    />
  );
}
