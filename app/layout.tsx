import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/kanban.css";
import { ToastContainer } from "@/components/ui/ToastContainer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAnalyticsPageTracker from "@/components/GoogleAnalyticsPageTracker";
import GoogleAnalyticsVerifier from "@/components/GoogleAnalyticsVerifier";
import GoogleTagManager from "@/components/GoogleTagManager";
import GoogleTagManagerNoScript from "@/components/GoogleTagManagerNoScript";
import { OrganizationSchema, WebSiteSchema, SoftwareApplicationSchema } from "@/components/seo/JsonLd";
import WebVitalsReporter from "@/components/WebVitalsReporter";

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
    default: "crIAdores - Social Media Estratégico Para Empresas | Conteúdo Presencial Toda Semana",
    template: "%s | crIAdores"
  },
  description: "Tenha um estrategista de social media dedicado ao seu negócio. Produção de conteúdo presencial toda semana, planejamento estratégico e crescimento real nas redes sociais.",
  keywords: [
    // Primary - Social Media Estratégico
    "social media estratégico",
    "social media estrategico",
    "social media para empresas",
    "gestão de redes sociais",
    "gerenciamento de redes sociais",
    "estrategista de marketing digital",
    "social media presencial",
    "agência de social media",
    // Nicho
    "social media para médicos",
    "social media para advogados",
    "social media para restaurantes",
    "social media para clínicas",
    // Terciário
    "mentoria de marketing",
    "criadores de conteúdo",
    "micro influenciadores",
    "marketing local",
    // Suporte
    "contratar social media",
    "quanto custa social media",
    "marketing digital para pequenas empresas",
    "conteúdo para redes sociais",
    "Instagram empresas",
    "TikTok empresas",
    "Brasil"
  ],
  authors: [{ name: "crIAdores", url: "https://www.criadores.app" }],
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
  alternates: {
    canonical: "https://www.criadores.app",
    types: {
      'application/rss+xml': [
        { url: 'https://www.criadores.app/feed.xml', title: 'Blog crIAdores RSS Feed' }
      ]
    }
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "crIAdores - Social Media Estratégico Para Empresas",
    description: "Estrategista de social media dedicado ao seu negócio. Conteúdo presencial toda semana com planejamento estratégico e resultados reais.",
    type: "website",
    locale: "pt_BR",
    url: "https://www.criadores.app",
    siteName: "crIAdores",
  },
  twitter: {
    card: "summary_large_image",
    title: "crIAdores - Social Media Estratégico Para Empresas",
    description: "Tenha um estrategista de social media dedicado ao seu negócio. Conteúdo presencial toda semana.",
  },
  metadataBase: new URL("https://www.criadores.app")
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
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
        {/* Google Tag Manager */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManager GTM_ID={process.env.NEXT_PUBLIC_GTM_ID} />
        )}

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
        {/* Google Tag Manager (noscript) */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <GoogleTagManagerNoScript GTM_ID={process.env.NEXT_PUBLIC_GTM_ID} />
        )}

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
            <GoogleAnalyticsPageTracker />
          </>
        )}

        {/* Google Analytics Verifier - Só em desenvolvimento */}
        <GoogleAnalyticsVerifier />

        {/* Dados Estruturados JSON-LD para SEO/AEO/GEO */}
        <OrganizationSchema />
        <WebSiteSchema />
        <SoftwareApplicationSchema />

        {/* Core Web Vitals Reporting */}
        <WebVitalsReporter />

        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
