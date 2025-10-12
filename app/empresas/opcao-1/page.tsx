import { Metadata } from 'next';
import PMEsStorytellingLP from './PMEsStorytellingLP';

export const metadata: Metadata = {
  title: 'crIAdores para PMEs | A Nova Forma de Crescer com Marketing de Criadores',
  description: 'Encontre, gerencie e escale campanhas com influenciadores que vendem de verdade. Plataforma completa para PMEs crescerem com marketing de criadores locais.',
  keywords: [
    'marketing de influência para PMEs',
    'criadores de conteúdo locais',
    'influenciadores locais',
    'marketing para pequenas empresas',
    'plataforma de influenciadores',
    'gestão de campanhas',
    'ROI marketing digital',
    'micro influenciadores',
  ],
  alternates: {
    canonical: 'https://www.criadores.app/pmes',
  },
  openGraph: {
    title: 'crIAdores para PMEs | Cresça com Marketing de Criadores',
    description: 'A plataforma que conecta PMEs aos melhores criadores locais. Encontre, gerencie e escale suas campanhas em um só lugar.',
    url: 'https://www.criadores.app/pmes',
    type: 'website',
    images: [
      {
        url: '/og-pmes.jpg',
        width: 1200,
        height: 630,
        alt: 'crIAdores - Marketing de Criadores para PMEs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'crIAdores para PMEs | Cresça com Marketing de Criadores',
    description: 'Encontre, gerencie e escale campanhas com influenciadores que vendem de verdade.',
    images: ['/og-pmes.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PMEsPage() {
  return <PMEsStorytellingLP />;
}

