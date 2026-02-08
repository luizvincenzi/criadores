import type { Metadata } from 'next';
import { ProfessionalServiceSchema, BreadcrumbSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Marketing Digital para Medicos e Clinicas',
  description: 'Atraia mais pacientes com marketing digital etico e profissional. Estrategias de conteudo para clinicas, consultorios e profissionais da saude.',
  keywords: 'marketing medico, marketing clinica, marketing digital saude, social media medicos, atrair pacientes',
  openGraph: {
    title: 'Marketing Digital para Medicos e Clinicas | crIAdores',
    description: 'Marketing digital etico e profissional para profissionais da saude.',
    url: 'https://www.criadores.app/chatcriadores-medicos',
    siteName: 'crIAdores',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.criadores.app/chatcriadores-medicos',
  },
};

export default function ChatCriadoresMedicosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.criadores.app' },
        { name: 'Marketing para Medicos', url: 'https://www.criadores.app/chatcriadores-medicos' },
      ]} />
      <ProfessionalServiceSchema
        name="Marketing Digital para Medicos e Clinicas"
        description="Marketing digital etico e profissional para atrair pacientes. Estrategias de conteudo para clinicas e consultorios."
        url="https://www.criadores.app/chatcriadores-medicos"
        serviceType="Marketing Medico"
        audience="Medicos, Clinicas e Profissionais da Saude"
      />
      {children}
    </>
  );
}
