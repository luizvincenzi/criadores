import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/kanban.css";
import { ToastContainer } from "@/components/ui/ToastContainer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAnalyticsPageTracker from "@/components/GoogleAnalyticsPageTracker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Onest será carregada via CSS para melhor performance
const onest = {
  variable: "--font-onest",
};

export const metadata: Metadata = {
  title: {
    default: "crIAdores - Conectando Negócios Locais a Criadores de Conteúdo",
    template: "%s | crIAdores"
  },
  description: "Plataforma que conecta negócios locais a criadores de conteúdo autênticos. Campanhas de marketing com micro influenciadores que geram resultados reais para pequenas e médias empresas.",
  keywords: [
    "micro influenciadores",
    "marketing local",
    "criadores de conteúdo",
    "campanhas de marketing",
    "influencer marketing",
    "negócios locais",
    "pequenas empresas",
    "marketing digital",
    "redes sociais",
    "Instagram",
    "TikTok",
    "Brasil"
  ],
  authors: [{ name: "crIAdores", url: "https://criadores.app" }],
  creator: "crIAdores",
  publisher: "crIAdores",
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
      { url: "/faviconcriadoresA3.png", type: "image/png" },
      { url: "/faviconcriadoresA3.png", type: "image/png", sizes: "32x32" }
    ],
    shortcut: "/faviconcriadoresA3.png",
    apple: "/faviconcriadoresA3.png"
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "crIAdores - Conectando Negócios Locais a Criadores de Conteúdo",
    description: "Plataforma que conecta negócios locais a criadores de conteúdo autênticos. Campanhas de marketing com micro influenciadores que geram resultados reais.",
    type: "website",
    locale: "pt_BR",
    url: "https://criadores.app",
    siteName: "crIAdores",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "crIAdores - Conectando Negócios Locais a Criadores de Conteúdo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "crIAdores - Conectando Negócios Locais a Criadores de Conteúdo",
    description: "Plataforma que conecta negócios locais a criadores de conteúdo autênticos.",
    images: ["/og-image.jpg"]
  },
  alternates: {
    canonical: "https://criadores.app"
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b3553',
  colorScheme: 'light'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Onest:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} ${onest.variable} font-onest antialiased`}
      >
        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            <GoogleAnalyticsPageTracker />
          </>
        )}

        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
