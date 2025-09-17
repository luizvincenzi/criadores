import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'crIAdores - Links',
  description: 'Conecte seu negócio aos melhores criadores de conteúdo da sua região. Campanhas de marketing que geram resultados reais!',
  keywords: [
    'criadores de conteúdo',
    'marketing local',
    'micro influenciadores',
    'campanhas de marketing',
    'negócios locais',
    'influencer marketing',
    'redes sociais',
    'Instagram',
    'TikTok',
    'Brasil'
  ],
  authors: [{ name: 'crIAdores', url: 'https://criadores.app' }],
  creator: 'crIAdores',
  publisher: 'crIAdores',
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
  icons: {
    icon: [
      { url: '/faviconcriadoresA3.png', type: 'image/png' },
      { url: '/faviconcriadoresA3.png', type: 'image/png', sizes: '32x32' }
    ],
    shortcut: '/faviconcriadoresA3.png',
    apple: '/faviconcriadoresA3.png'
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'crIAdores - Links',
    description: 'Conecte seu negócio aos melhores criadores de conteúdo da sua região. Campanhas de marketing que geram resultados reais!',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://criadores.app/linkcriadores',
    siteName: 'crIAdores',
    images: [
      {
        url: '/faviconcriadoresA3.png',
        width: 400,
        height: 400,
        alt: 'crIAdores - Conectando Negócios Locais a Criadores de Conteúdo'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'crIAdores - Links',
    description: 'Conecte seu negócio aos melhores criadores de conteúdo da sua região.',
    images: ['/faviconcriadoresA3.png']
  },
  alternates: {
    canonical: 'https://criadores.app/linkcriadores'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0b3553',
  colorScheme: 'light'
};

export default function CrialinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      style={{ 
        backgroundColor: '#f5f5f5', 
        minHeight: '100vh', 
        fontFamily: 'Onest, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
      }}
    >
      {children}
    </div>
  );
}
