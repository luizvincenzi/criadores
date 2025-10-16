import { Metadata } from 'next';
import RaioXDaMinhaEmpresaLP from './components/RaioXDaMinhaEmpresaLP';

// Metadata estática para SEO
export const metadata: Metadata = {
  title: 'Raio-X da Minha Empresa - Diagnóstico Gratuito de Marketing | crIAdores',
  description: 'Receba um diagnóstico completo do seu marketing digital. Descubra pontos fortes e fracos + 1h de consultoria gratuita. 100% confidencial.',
  keywords: ['raio-x empresa', 'diagnóstico marketing', 'marketing digital', 'consultoria marketing', 'análise marketing', 'avaliação negócio'],
  authors: [{ name: 'crIAdores' }],
  openGraph: {
    title: 'Raio-X da Minha Empresa - Diagnóstico Gratuito de Marketing | crIAdores',
    description: 'Receba um diagnóstico completo do seu marketing digital. Descubra pontos fortes e fracos + 1h de consultoria gratuita.',
    url: 'https://criadores.app/raioxdaminhaempresa',
    siteName: 'crIAdores',
    images: [
      {
        url: 'https://criadores.app/images/relatorio360-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Raio-X da Minha Empresa - crIAdores',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raio-X da Minha Empresa - Diagnóstico Gratuito de Marketing | crIAdores',
    description: 'Receba um diagnóstico completo do seu marketing digital.',
    images: ['https://criadores.app/images/relatorio360-og.jpg'],
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
    canonical: 'https://criadores.app/raioxdaminhaempresa',
  },
};

export default function RaioXDaMinhaEmpresaPage() {
  return <RaioXDaMinhaEmpresaLP />;
}