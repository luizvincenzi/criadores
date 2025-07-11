'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import AuthGuard from '@/components/AuthGuard';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('businesses');
  const { user } = useAuthStore();

  // Determinar seção ativa baseada na URL
  React.useEffect(() => {
    if (pathname.includes('dashboard')) setActiveSection('dashboard');
    else if (pathname.includes('businesses')) setActiveSection('businesses');
    else if (pathname.includes('creators')) setActiveSection('creators');
    else if (pathname.includes('campaigns')) setActiveSection('campaigns');
    else if (pathname.includes('jornada')) setActiveSection('jornada');
    else setActiveSection('dashboard');
  }, [pathname]);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <rect x="3" y="3" width="7" height="9"/>
          <rect x="14" y="3" width="7" height="5"/>
          <rect x="14" y="12" width="7" height="9"/>
          <rect x="3" y="16" width="7" height="5"/>
        </svg>
      ),
      href: '/dashboard',
      count: 0,
      color: 'primary'
    },
    {
      id: 'jornada',
      label: 'Jornada',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
      href: '/jornada',
      count: 12,
      color: 'primary'
    },
    {
      id: 'businesses',
      label: 'Negócios',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M3 21h18"/>
          <path d="M5 21V7l8-4v18"/>
          <path d="M19 21V11l-6-4"/>
        </svg>
      ),
      href: '/businesses',
      count: 12,
      color: 'primary'
    },
    {
      id: 'creators',
      label: 'Criadores',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      href: '/creators',
      count: 8,
      color: 'secondary'
    },
    {
      id: 'campaigns',
      label: 'Campanhas',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M3 11l18-5v12L3 14v-3z"/>
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
        </svg>
      ),
      href: '/campaigns',
      count: 5,
      color: 'tertiary'
    }
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-surface-dim">
      {/* Top Header - Fixo e Compacto */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-outline-variant">
        <div className="px-6 py-3 pb-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-on-surface">CRM crIAdores</h1>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-on-surface">
                  {user?.name}
                </div>
                <div className="text-xs text-on-surface-variant">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                </div>
              </div>
              <Button
                variant="text"
                size="sm"
                onClick={() => {
                  const { logout } = useAuthStore.getState();
                  logout();
                  window.location.href = '/login';
                }}
                className="text-xs text-tertiary hover:bg-tertiary-container"
              >
                Sair
              </Button>
            </div>
          </div>

          {/* Navigation Tabs - Centralizado e Estendido */}
          <nav className="flex justify-center -mx-6">
            <div className="flex">
              {navigationItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setActiveSection(item.id)}
                  className={`nav-tab ${activeSection === item.id ? 'active' : ''}`}
                  style={{
                    paddingTop: '12px',
                    paddingBottom: '16px',
                    minHeight: '48px'
                  }}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.count > 0 && (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                      activeSection === item.id
                        ? 'bg-white text-gray-700 border border-gray-300'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Area - Com padding-top para compensar header fixo */}
      <main style={{ paddingTop: '140px' }} className="p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      </div>
    </AuthGuard>
  );
}
