import { Metadata } from 'next';

// Metadata estática para SEO
export const metadata: Metadata = {
  title: 'Relatório 360º de Marketing Gratuito | crIAdores',
  description: 'Receba um diagnóstico completo do seu marketing digital. Descubra pontos fortes e fracos + 1h de consultoria gratuita. 100% confidencial.',
  keywords: ['relatório marketing', 'diagnóstico marketing', 'marketing digital', 'consultoria marketing', 'análise marketing'],
  authors: [{ name: 'crIAdores' }],
  openGraph: {
    title: 'Relatório 360º de Marketing Gratuito | crIAdores',
    description: 'Receba um diagnóstico completo do seu marketing digital. Descubra pontos fortes e fracos + 1h de consultoria gratuita.',
    url: 'https://criadores.app/relatorio360',
    siteName: 'crIAdores',
    images: [
      {
        url: 'https://criadores.app/images/relatorio360-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Relatório 360º de Marketing - crIAdores',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Relatório 360º de Marketing Gratuito | crIAdores',
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
    canonical: 'https://criadores.app/relatorio360',
  },
};

export default function Relatorio360Page() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-on-surface mb-4">
          Página em Desenvolvimento
        </h1>
        <p className="text-on-surface-variant">
          A página Relatório 360º estará disponível em breve.
        </p>
      </div>
    </div>
  );
}