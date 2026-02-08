import type { Metadata } from 'next';

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
  return children;
}
