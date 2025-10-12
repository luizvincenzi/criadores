import { Metadata } from 'next';
import PMEsConversationalLP from './PMEsConversationalLP';

export const metadata: Metadata = {
  title: 'crIAdores para PMEs | Descubra Como Crescer com Criadores Locais',
  description: 'Plataforma intuitiva que conecta PMEs a criadores locais. Veja como funciona, calcule seu ROI e comece em minutos. Sem complicação.',
  keywords: [
    'plataforma criadores PME',
    'marketing influenciadores simples',
    'criadores locais',
    'gestão campanhas fácil',
    'ROI marketing influência',
    'pequenas empresas marketing',
  ],
  alternates: {
    canonical: 'https://www.criadores.app/pmes',
  },
  openGraph: {
    title: 'crIAdores | Conecte Sua PME a Criadores Locais',
    description: 'Plataforma intuitiva para PMEs crescerem com marketing de criadores. Veja como funciona e comece hoje.',
    url: 'https://www.criadores.app/pmes',
    type: 'website',
    images: [
      {
        url: '/og-pmes-conversational.jpg',
        width: 1200,
        height: 630,
        alt: 'crIAdores - Simples e Eficaz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'crIAdores | Conecte Sua PME a Criadores Locais',
    description: 'Plataforma intuitiva para crescer com marketing de criadores.',
    images: ['/og-pmes-conversational.jpg'],
  },
};

export default function PMEsConversationalPage() {
  return <PMEsConversationalLP />;
}

