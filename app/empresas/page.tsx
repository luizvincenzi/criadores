import { Metadata } from 'next';
import EmpresasLP from './EmpresasLP';

export const metadata: Metadata = {
  title: 'Transforme Sua Empresa Numa Referência Regional | crIAdores',
  description: 'Mentoria estratégica, social media profissional e criadores locais. Escolha a solução ideal para seu negócio crescer no digital.',
  keywords: 'marketing para empresas, criadores de conteúdo, influenciadores locais, mentoria marketing, social media, estratégia digital',
  authors: [{ name: 'crIAdores' }],
  openGraph: {
    title: 'Transforme Sua Empresa Numa Referência Regional | crIAdores',
    description: 'Mentoria + Social Media + Criadores Locais. Escolha a solução ideal ou combine todas e economize 22%.',
    url: 'https://criadores.app/empresas',
    siteName: 'crIAdores',
    images: [
      {
        url: '/assets/og-empresas.jpg',
        width: 1200,
        height: 630,
        alt: 'crIAdores - Soluções de Marketing para Empresas',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Transforme Sua Empresa Numa Referência Regional | crIAdores',
    description: 'Mentoria + Social Media + Criadores Locais. Escolha sua solução ideal.',
    images: ['/assets/og-empresas.jpg'],
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
    canonical: 'https://criadores.app/empresas',
  },
};

export default function EmpresasPage() {
  return <EmpresasLP />;
}

