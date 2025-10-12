import { Metadata } from 'next';
import PMEsSocialMediaLP from './PMEsSocialMediaLP';

export const metadata: Metadata = {
  title: 'Estrategista de Marketing + Social Media | crIAdores',
  description: 'Seu estrategista dedicado de marketing digital. 2 Reels por semana, stories diários, reuniões semanais e planejamento completo. Terceirize com quem entende.',
  keywords: 'social media, estrategista marketing, gestão redes sociais, marketing digital pmes',
  authors: [{ name: 'crIAdores' }],
  openGraph: {
    title: 'Estrategista de Marketing + Social Media | crIAdores',
    description: 'Profissional dedicado à sua empresa. 2 Reels/semana + stories diários + reuniões semanais. Apenas 5 vagas disponíveis.',
    url: 'https://criadores.app/empresas/social-media',
    siteName: 'crIAdores',
    images: [
      {
        url: '/assets/og-pmes-social-media.jpg',
        width: 1200,
        height: 630,
        alt: 'Estrategista de Marketing crIAdores',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Estrategista de Marketing + Social Media | crIAdores',
    description: 'Terceirize seu marketing com profissional dedicado. Apenas 5 vagas para dezembro.',
    images: ['/assets/og-pmes-social-media.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://criadores.app/empresas/social-media',
  },
};

export default function SocialMediaPage() {
  return <PMEsSocialMediaLP />;
}

