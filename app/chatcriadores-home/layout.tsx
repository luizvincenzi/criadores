import type { Metadata, Viewport } from 'next';
import { ServiceSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Fale com a crIAdores - Consultoria Gratuita',
  description: 'Descubra como potencializar seu negocio com criadores de conteudo locais. Responda algumas perguntas e receba uma proposta personalizada em ate 24h.',
  keywords: 'consultoria marketing gratuita, marketing digital empresas, criadores de conteudo, influenciadores locais, proposta marketing',
  openGraph: {
    title: 'Fale com a crIAdores - Consultoria Gratuita',
    description: 'Descubra como potencializar seu negocio com criadores de conteudo locais.',
    url: 'https://www.criadores.app/chatcriadores-home',
    siteName: 'crIAdores',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.criadores.app/chatcriadores-home',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b3553',
};

export default function CriavozLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        fontFamily: 'Onest, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.criadores.app' },
        { name: 'Consultoria Gratuita', url: 'https://www.criadores.app/chatcriadores-home' },
      ]} />
      <ServiceSchema
        name="Consultoria de Marketing Digital Gratuita"
        description="Descubra como potencializar seu negocio com criadores de conteudo locais. Responda algumas perguntas e receba uma proposta personalizada."
        url="https://www.criadores.app/chatcriadores-home"
        category="Consultoria de Marketing"
        priceRange="Gratuito"
      />
      {children}
    </div>
  );
}
