import type { Metadata } from 'next';
import { ServiceSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Seja um Criador de Conteudo Local',
  description: 'Junte-se a maior comunidade de criadores de conteudo local do Brasil. Conecte-se com empresas da sua regiao e monetize seu talento.',
  keywords: 'criador de conteudo, influenciador local, monetizar instagram, parcerias empresas, comunidade criadores',
  openGraph: {
    title: 'Seja um Criador de Conteudo Local | crIAdores',
    description: 'Monetize seu talento conectando-se com empresas locais.',
    url: 'https://www.criadores.app/chatcriadores-criadores',
    siteName: 'crIAdores',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.criadores.app/chatcriadores-criadores',
  },
};

export default function ChatCriadoresCriadoresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.criadores.app' },
        { name: 'Seja um Criador', url: 'https://www.criadores.app/chatcriadores-criadores' },
      ]} />
      <ServiceSchema
        name="Plataforma para Criadores de Conteudo Local"
        description="Junte-se a maior comunidade de criadores de conteudo local. Conecte-se com empresas e monetize seu talento."
        url="https://www.criadores.app/chatcriadores-criadores"
        category="Plataforma de Criadores"
      />
      {children}
    </>
  );
}
