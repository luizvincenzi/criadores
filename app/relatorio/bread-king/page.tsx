import { Metadata, Viewport } from 'next';
import BreadKingReport from './BreadKingReport';

export const metadata: Metadata = {
  title: 'Bread King Londrina - Relatorio de Atividades | crIAdores',
  description: 'Relatorio consolidado de atividades digitais da Bread King Londrina. Planejamento estrategico, social media, marketing de influencia e mentoria.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b3553',
};

export default function BreadKingReportPage() {
  return <BreadKingReport />;
}
