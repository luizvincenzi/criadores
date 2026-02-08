import type { Metadata } from 'next';
import { ProfessionalServiceSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Marketing Juridico para Advogados e Escritorios',
  description: 'Construa autoridade e atraia clientes qualificados com marketing juridico estrategico. Conteudo profissional para advogados e escritorios de advocacia.',
  keywords: 'marketing juridico, marketing advogados, marketing escritorio advocacia, atrair clientes advocacia, social media advogados',
  openGraph: {
    title: 'Marketing Juridico para Advogados | crIAdores',
    description: 'Marketing juridico estrategico para construir autoridade e atrair clientes.',
    url: 'https://www.criadores.app/chatcriadores-advogados',
    siteName: 'crIAdores',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.criadores.app/chatcriadores-advogados',
  },
};

export default function ChatCriadoresAdvogadosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.criadores.app' },
        { name: 'Marketing Juridico', url: 'https://www.criadores.app/chatcriadores-advogados' },
      ]} />
      <ProfessionalServiceSchema
        name="Marketing Juridico para Advogados e Escritorios"
        description="Marketing juridico estrategico para construir autoridade e atrair clientes qualificados. Conteudo profissional para advogados."
        url="https://www.criadores.app/chatcriadores-advogados"
        serviceType="Marketing Juridico"
        audience="Advogados e Escritorios de Advocacia"
      />
      {children}
    </>
  );
}
