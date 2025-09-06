import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'crIAvoz - Conecte-se com crIAdores',
  description: 'Conecte seu negócio aos melhores criadores da sua região',
  icons: {
    icon: '/faviconcriadoresA3.png',
  },
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
