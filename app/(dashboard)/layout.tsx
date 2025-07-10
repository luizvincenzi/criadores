'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('businesses');

  // Determinar seção ativa baseada na URL
  React.useEffect(() => {
    if (pathname.includes('businesses')) setActiveSection('businesses');
    else if (pathname.includes('creators')) setActiveSection('creators');
    else if (pathname.includes('campaigns')) setActiveSection('campaigns');
    else if (pathname.includes('jornada')) setActiveSection('jornada');
    else setActiveSection('businesses');
  }, [pathname]);

  const navigationItems = [
    {
      id: 'businesses',
      label: 'Negócios',
      icon: '🏢',
      href: '/businesses',
      count: 12
    },
    {
      id: 'creators',
      label: 'Criadores',
      icon: '👥',
      href: '/creators',
      count: 8
    },
    {
      id: 'campaigns',
      label: 'Campanhas',
      icon: '📢',
      href: '/campaigns',
      count: 5
    },
    {
      id: 'jornada',
      label: 'Jornada',
      icon: '🛤️',
      href: '/jornada',
      count: 12
    }
  ];

  return (
    <div className="min-h-screen bg-surface-dim">
      {/* Top Header */}
      <header className="bg-surface shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-on-surface">CRM Criadores</h1>
              <span className="text-sm text-on-surface-variant">Gestão Inteligente</span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-on-primary text-sm font-medium">U</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span>{item.label}</span>
                <span className="ml-2 text-xs bg-surface-container-high px-2 py-1 rounded-full">
                  {item.count}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
