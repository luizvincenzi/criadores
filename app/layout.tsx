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
  title: "crIAdores - Plataforma de Gestão de Campanhas",
  description: "Gerencie suas campanhas de influenciadores de forma profissional. Organize eventos, acompanhe criadores e otimize resultados.",
  keywords: "campanhas, influenciadores, marketing, gestão, eventos, criadores",
  authors: [{ name: "crIAdores Team" }],
  creator: "crIAdores",
  publisher: "crIAdores",
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
    title: "crIAdores - Plataforma de Gestão de Campanhas",
    description: "Gerencie suas campanhas de influenciadores de forma profissional.",
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
