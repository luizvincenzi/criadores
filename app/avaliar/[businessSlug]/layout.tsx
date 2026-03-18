import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Avaliação',
  description: 'Avalie sua experiência',
};

export default function AvaliarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
