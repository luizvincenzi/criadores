'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { default as AuthGuard } from '@/components/AuthGuard';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { usePermissions } from '@/hooks/usePermissions';
import { TasksSidebar } from '@/components/TasksSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('businesses');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTasksSidebarOpen, setIsTasksSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const { getAccessibleMenuItems, hasPermission } = usePermissions();

  // Determinar seção ativa baseada na URL
  React.useEffect(() => {
    if (pathname.includes('dashboard')) setActiveSection('dashboard');
    else if (pathname.includes('businesses')) setActiveSection('businesses');
    else if (pathname.includes('deals')) setActiveSection('deals');
    else if (pathname.includes('creators')) setActiveSection('creators');
    else if (pathname.includes('campaigns')) setActiveSection('campaigns');
    else if (pathname.includes('jornada')) setActiveSection('jornada');

    else setActiveSection('dashboard');
  }, [pathname]);

  // Fechar menu mobile quando clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.mobile-nav-container')) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Definir todos os itens de navegação possíveis
  const allNavigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      resource: 'dashboard' as const,
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
      resource: 'jornada' as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      ),
      href: '/jornada',
      count: 0,
      color: 'primary'
    },
    {
      id: 'businesses',
      label: 'Empresas',
      resource: 'businesses' as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M3 21h18"/>
          <path d="M5 21V7l8-4v18"/>
          <path d="M19 21V11l-6-4"/>
        </svg>
      ),
      href: '/businesses',
      count: 0,
      color: 'primary'
    },
    {
      id: 'deals',
      label: 'Negócios',
      resource: 'deals' as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>
      ),
      href: '/deals',
      count: 0,
      color: 'primary'
    },
    {
      id: 'creators',
      label: 'Criadores',
      resource: 'creators' as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
      href: '/creators',
      count: 0,
      color: 'secondary'
    },
    {
      id: 'campaigns',
      label: 'Campanhas',
      resource: 'campaigns' as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
          <path d="M3 11l18-5v12L3 14v-3z"/>
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
        </svg>
      ),
      href: '/campaigns',
      count: 0,
      color: 'tertiary'
    }
  ];

  // Filtrar itens de navegação baseado nas permissões do usuário
  const navigationItems = allNavigationItems.filter(item =>
    hasPermission(item.resource, 'read')
  );

  return (
    <div className="min-h-screen bg-surface-dim">
      {/* Top Header - Fixo e Compacto */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-outline-variant">
        <div className="px-6 py-3 pb-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-on-surface">crIAdores</h1>
            </div>
          </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-on-surface">
                  {user?.name || user?.email || 'Usuário'}
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

          {/* Navigation - Desktop: Tabs, Mobile: Menu */}
          <div className="relative">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex justify-between items-center -mx-6">
              <div className="flex justify-center flex-1">
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
              </div>

              {/* Tasks Icon - Always on the far right */}
              <div className="flex items-center">
                <button
                  onClick={() => setIsTasksSidebarOpen(!isTasksSidebarOpen)}
                  className={`p-2 rounded-lg transition-colors relative ${
                    isTasksSidebarOpen
                      ? 'bg-primary-container text-primary'
                      : 'hover:bg-surface-container text-on-surface-variant'
                  }`}
                  title="Tarefas"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M3 6h18"/>
                    <path d="M3 12h18"/>
                    <path d="M3 18h18"/>
                  </svg>
                  {/* Badge de notificação */}
                  <span className="absolute -top-1 -right-1 bg-error text-on-error text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    3
                  </span>
                </button>
              </div>
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden mobile-nav-container">
              {/* Mobile Menu Button */}
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center space-x-3">
                  {navigationItems.find(item => item.id === activeSection)?.icon}
                  <span className="font-medium text-sm text-on-surface">
                    {navigationItems.find(item => item.id === activeSection)?.label}
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-lg hover:bg-surface-container transition-colors"
                >
                  <svg
                    className={`w-5 h-5 text-on-surface transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Mobile Dropdown Menu */}
              {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-t border-outline-variant shadow-lg z-50">
                  <div className="py-2">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => {
                          setActiveSection(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center px-6 py-3 hover:bg-surface-container transition-colors ${
                          activeSection === item.id ? 'bg-primary-container text-primary' : 'text-on-surface'
                        }`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.count > 0 && (
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                            activeSection === item.id
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            {item.count}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area - Com padding-top para compensar header fixo e padding-right para sidebar */}
      <main
        style={{ paddingTop: '140px' }}
        className={`p-6 transition-all duration-300 ${isTasksSidebarOpen ? 'pr-[400px]' : ''}`}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Tasks Sidebar */}
      <TasksSidebar
        isOpen={isTasksSidebarOpen}
        onClose={() => setIsTasksSidebarOpen(false)}
      />
    </div>
  );
}
