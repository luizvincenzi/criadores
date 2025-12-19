import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'criAvoz - Conecte-se com crIAdores',
  description: 'Conecte seu negócio aos melhores criadores da sua região',
  icons: {
    icon: '/faviconcriadoresA3.png',
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
      {children}
    </div>
  );
}
