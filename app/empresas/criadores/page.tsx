import { Metadata } from 'next';
import PMEsCriadoresLP from './PMEsCriadoresLP';

export const metadata: Metadata = {
  title: 'Criadores Locais para Seu Negócio | crIAdores',
  description: 'Visibilidade real com criadores da sua cidade. 4 microinfluenciadores por mês, curadoria completa, aprovação de conteúdo e resultados mensuráveis.',
  keywords: 'influenciadores locais, microinfluenciadores, marketing de influência, criadores de conteúdo',
  authors: [{ name: 'crIAdores' }],
  openGraph: {
    title: 'Criadores Locais para Seu Negócio | crIAdores',
    description: 'Conecte-se com criadores da sua região. 4 microinfluenciadores/mês com curadoria e aprovação completa. Últimas 6 vagas para dezembro.',
    url: 'https://criadores.app/empresas/criadores',
    siteName: 'crIAdores',
    images: [
      {
        url: '/assets/og-pmes-criadores.jpg',
        width: 1200,
        height: 630,
        alt: 'Criadores Locais crIAdores',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Criadores Locais para Seu Negócio | crIAdores',
    description: 'Visibilidade local com 4 microinfluenciadores/mês. Curadoria + aprovação + resultados.',
    images: ['/assets/og-pmes-criadores.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://criadores.app/empresas/criadores',
  },
};

export default function CriadoresPage() {
  return <PMEsCriadoresLP />;
}

