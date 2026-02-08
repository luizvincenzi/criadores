import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Social Media Estrategico para Empresas',
  description: 'Tenha um estrategista de social media dedicado ao seu negocio. Conteudo profissional, presencial e semanal para suas redes sociais.',
  keywords: 'social media empresas, gestao redes sociais, estrategista social media, conteudo profissional, marketing redes sociais',
  openGraph: {
    title: 'Social Media Estrategico para Empresas | crIAdores',
    description: 'Estrategista dedicado para cuidar do marketing digital do seu negocio.',
    url: 'https://www.criadores.app/chatcriadores-social-media',
    siteName: 'crIAdores',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.criadores.app/chatcriadores-social-media',
  },
};

export default function ChatCriadoresSocialMediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
