import type { Metadata } from 'next';
import { ServiceSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Marketing Digital para Empresas Locais',
  description: 'Potencialize seu negocio com criadores de conteudo da sua regiao. Estrategias de marketing digital presencial com resultados reais para empresas locais.',
  keywords: 'marketing digital empresas, social media empresas, criadores de conteudo, marketing local, micro influenciadores empresas',
  openGraph: {
    title: 'Marketing Digital para Empresas Locais | crIAdores',
    description: 'Conecte seu negocio aos melhores criadores de conteudo da sua regiao.',
    url: 'https://www.criadores.app/chatcriadores-empresas',
    siteName: 'crIAdores',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.criadores.app/chatcriadores-empresas',
  },
};

export default function ChatCriadoresEmpresasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.criadores.app' },
        { name: 'Marketing para Empresas', url: 'https://www.criadores.app/chatcriadores-empresas' },
      ]} />
      <ServiceSchema
        name="Marketing Digital para Empresas Locais"
        description="Estrategias de marketing digital presencial com criadores de conteudo locais. Resultados reais para empresas da sua regiao."
        url="https://www.criadores.app/chatcriadores-empresas"
        category="Marketing Digital"
      />
      {children}
    </>
  );
}
