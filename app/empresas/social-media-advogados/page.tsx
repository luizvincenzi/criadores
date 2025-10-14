import { Metadata } from 'next';
import { landingPagesService } from '@/lib/services/landingPagesService';
import DynamicLPv2 from '../components/DynamicLPv2';
import { notFound } from 'next/navigation';

// ⚡ IMPORTANTE: Desabilitar cache para sempre buscar dados frescos do banco
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Gerar metadata dinâmico do banco
export async function generateMetadata(): Promise<Metadata> {
  const lp = await landingPagesService.getLandingPageBySlug('empresas/social-media-advogados');

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
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: `https://criadores.app/${lp.slug}`,
    },
  };
}

export default async function SocialMediaAdvogadosPage() {
  const lp = await landingPagesService.getLandingPageBySlug('empresas/social-media-advogados');

  if (!lp) {
    notFound();
  }

  console.log('📄 Página Advogados - LP carregada:', {
    slug: lp.slug,
    version: lp.version_number,
    hero_title: lp.variables?.hero?.title?.substring(0, 50),
  });

  return <DynamicLPv2 lp={lp} />;
}

