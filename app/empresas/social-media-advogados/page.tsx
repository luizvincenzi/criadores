import { Metadata } from 'next';
import SocialMediaAdvogadosLP from './SocialMediaAdvogadosLP';

export const metadata: Metadata = {
  title: 'Marketing Jurídico para Advogados e Escritórios | crIAdores',
  description: 'Construa autoridade e atraia clientes qualificados para seu escritório. Social media especializada para advogados com compliance OAB.',
  keywords: 'marketing jurídico, marketing para advogados, social media jurídica, marketing para escritórios, advocacia digital, OAB',
  authors: [{ name: 'crIAdores' }],
  openGraph: {
    title: 'Marketing Jurídico para Advogados e Escritórios | crIAdores',
    description: 'Construa autoridade e atraia clientes qualificados. Compliance total com OAB.',
    url: 'https://criadores.app/empresas/social-media-advogados',
    siteName: 'crIAdores',
    images: [
      {
        url: '/assets/og-advogados.jpg',
        width: 1200,
        height: 630,
        alt: 'crIAdores - Marketing Jurídico para Advogados',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marketing Jurídico para Advogados e Escritórios | crIAdores',
    description: 'Construa autoridade e atraia clientes qualificados para seu escritório.',
    images: ['/assets/og-advogados.jpg'],
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
    canonical: 'https://criadores.app/empresas/social-media-advogados',
  },
};

export default function SocialMediaAdvogadosPage() {
  return <SocialMediaAdvogadosLP />;
}

