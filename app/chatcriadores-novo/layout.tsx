import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CriaVoz - Potencialize seu Negócio com Criadores | crIAdores',
  description: 'Descubra como potencializar seu negócio com nossa IA especializada em marketing de influência. Conecte-se com criadores ideais para sua empresa.',
  keywords: 'marketing digital, influenciadores, criadores de conteúdo, parcerias, influencer marketing, vendas',
  openGraph: {
    title: 'CriaVoz - Potencialize seu Negócio | crIAdores',
    description: 'Potencialize seu negócio com criadores de conteúdo. Nossa IA encontra os parceiros ideais para sua empresa.',
    url: 'https://criadores.app/chatcriadores-novo',
    siteName: 'crIAdores',
    images: [
      {
        url: 'https://criadores.app/og-criavoz.jpg',
        width: 1200,
        height: 630,
        alt: 'CriaVoz - Marketing de Influência',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CriaVoz - Potencialize seu Negócio | crIAdores',
    description: 'Potencialize seu negócio com criadores de conteúdo.',
    images: ['https://criadores.app/og-criavoz.jpg'],
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
    canonical: 'https://criadores.app/chatcriadores-novo',
  },
};

export default function CriavozNovoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
