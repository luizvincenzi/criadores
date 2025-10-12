import { Metadata } from 'next';
import SocialMediaMedicosLP from './SocialMediaMedicosLP';

export const metadata: Metadata = {
  title: 'Marketing Digital para Médicos e Clínicas | crIAdores',
  description: 'Atraia mais pacientes com marketing digital ético e profissional. Social media especializada para médicos, clínicas e consultórios.',
  keywords: 'marketing médico, marketing para médicos, social media médica, marketing para clínicas, marketing digital saúde, CFM',
  authors: [{ name: 'crIAdores' }],
  openGraph: {
    title: 'Marketing Digital para Médicos e Clínicas | crIAdores',
    description: 'Atraia mais pacientes com marketing digital ético e profissional. Compliance total com CFM.',
    url: 'https://criadores.app/empresas/social-media-medicos',
    siteName: 'crIAdores',
    images: [
      {
        url: '/assets/og-medicos.jpg',
        width: 1200,
        height: 630,
        alt: 'crIAdores - Marketing Digital para Médicos',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marketing Digital para Médicos e Clínicas | crIAdores',
    description: 'Atraia mais pacientes com marketing digital ético e profissional.',
    images: ['/assets/og-medicos.jpg'],
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
    canonical: 'https://criadores.app/empresas/social-media-medicos',
  },
};

export default function SocialMediaMedicosPage() {
  return <SocialMediaMedicosLP />;
}

