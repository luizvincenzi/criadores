import { Metadata } from 'next';
import PMEsDataDrivenLP from './PMEsDataDrivenLP';

export const metadata: Metadata = {
  title: 'crIAdores para PMEs | ROI Comprovado em Marketing de Influência',
  description: 'Plataforma de marketing de influência com ROI médio de 380%. Reduza custos em 70% e aumente vendas com criadores locais verificados.',
  keywords: [
    'ROI marketing de influência',
    'plataforma influenciadores PME',
    'marketing performance',
    'criadores verificados',
    'gestão campanhas influenciadores',
    'métricas marketing digital',
    'redução custos marketing',
  ],
  alternates: {
    canonical: 'https://www.criadores.app/pmes',
  },
  openGraph: {
    title: 'crIAdores | ROI de 380% em Marketing de Influência para PMEs',
    description: 'Reduza custos em 70% e aumente vendas com nossa plataforma de gestão de campanhas com criadores locais.',
    url: 'https://www.criadores.app/pmes',
    type: 'website',
    images: [
      {
        url: '/og-pmes-data.jpg',
        width: 1200,
        height: 630,
        alt: 'crIAdores - ROI Comprovado',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'crIAdores | ROI de 380% em Marketing de Influência',
    description: 'Reduza custos em 70% e aumente vendas com criadores locais verificados.',
    images: ['/og-pmes-data.jpg'],
  },
};

export default function PMEsDataPage() {
  return <PMEsDataDrivenLP />;
}

