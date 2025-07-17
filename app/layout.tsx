import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/kanban.css";
import { ToastContainer } from "@/components/ui/ToastContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM crIAdores - Gestão Inteligente de Influenciadores",
  description: "Sistema completo de gestão de influenciadores, campanhas e negócios. Controle total do seu pipeline de criadores de conteúdo.",
  keywords: "CRM, influenciadores, criadores, campanhas, gestão, marketing digital",
  authors: [{ name: "Luiz Vincenzi" }],
  creator: "Luiz Vincenzi",
  publisher: "CRM crIAdores",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "64x64" }
    ],
    shortcut: "/favicon.svg",
    apple: "/icon.svg"
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "CRM crIAdores - Gestão Inteligente de Influenciadores",
    description: "Sistema completo de gestão de influenciadores, campanhas e negócios.",
    type: "website",
    locale: "pt_BR"
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#00629B',
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
