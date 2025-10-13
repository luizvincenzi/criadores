import { Metadata } from 'next';
import { landingPagesService } from '@/lib/services/landingPagesService';
import DynamicLP from '../components/DynamicLP';
import { notFound } from 'next/navigation';

// Gerar metadata dinâmico do banco
export async function generateMetadata(): Promise<Metadata> {
  const lp = await landingPagesService.getLandingPageBySlug('empresas/social-media');

  if (!lp) {
    return {
      title: 'Página não encontrada | crIAdores',
    };
  }

  return {
    title: lp.seo.title,
    description: lp.seo.description,
    keywords: lp.seo.keywords?.join(', '),
    authors: [{ name: 'crIAdores' }],
    openGraph: {
      title: lp.seo.title,
      description: lp.seo.description,
      url: `https://criadores.app/${lp.slug}`,
      siteName: 'crIAdores',
      images: lp.seo.og_image ? [
        {
          url: lp.seo.og_image,
          width: 1200,
          height: 630,
          alt: lp.name,
        },
      ] : [],
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: lp.seo.title,
      description: lp.seo.description,
      images: lp.seo.og_image ? [lp.seo.og_image] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://criadores.app/${lp.slug}`,
    },
  };
}

export default async function SocialMediaPage() {
  const lp = await landingPagesService.getLandingPageBySlug('empresas/social-media');

  if (!lp) {
    notFound();
  }

  return <DynamicLP lp={lp} />;
}

