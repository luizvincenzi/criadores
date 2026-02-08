import type { Metadata } from 'next';

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
  return children;
}
