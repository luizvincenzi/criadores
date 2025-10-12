import { Metadata } from 'next';
import PMEsMentoriaLP from './PMEsMentoriaLP';

export const metadata: Metadata = {
  title: 'Mentoria Estratégica de Marketing | crIAdores',
  description: 'Domine o marketing do seu negócio com mentoria estratégica. Encontros semanais, +35 mentorias gravadas, comunidade exclusiva e aplicação prática com Gabriel D\'Ávila.',
  keywords: 'mentoria marketing, mentoria empresas, gabriel d\'ávila, estratégia marketing, marketing digital',
  authors: [{ name: 'crIAdores' }],
  openGraph: {
    title: 'Mentoria Estratégica de Marketing | crIAdores',
    description: 'Aprenda marketing com quem faz acontecer. Mentoria com Gabriel D\'Ávila, fundador de 4 empresas de sucesso e mentor de +40 empresários.',
    url: 'https://criadores.app/empresas/mentoria',
    siteName: 'crIAdores',
    images: [
      {
        url: '/assets/og-empresas-mentoria.jpg',
        width: 1200,
        height: 630,
        alt: 'Mentoria Estratégica crIAdores',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mentoria Estratégica de Marketing | crIAdores',
    description: 'Domine o marketing do seu negócio com mentoria estratégica. Últimas 8 vagas para dezembro.',
    images: ['/assets/og-empresas-mentoria.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://criadores.app/empresas/mentoria',
  },
};

export default function MentoriaPage() {
  return <PMEsMentoriaLP />;
}

