import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentoria de Marketing Digital',
  description: 'Domine o marketing do seu negocio com mentoria estrategica personalizada. Aprenda a criar conteudo, gerenciar redes sociais e atrair clientes.',
  keywords: 'mentoria marketing, consultoria marketing digital, mentoria negocios, marketing estrategico, Gabriel DAvila mentoria',
  openGraph: {
    title: 'Mentoria de Marketing Digital | crIAdores',
    description: 'Mentoria estrategica personalizada para dominar o marketing do seu negocio.',
    url: 'https://www.criadores.app/chatcriadores-mentoria',
    siteName: 'crIAdores',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.criadores.app/chatcriadores-mentoria',
  },
};

export default function ChatCriadoresMentoriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
