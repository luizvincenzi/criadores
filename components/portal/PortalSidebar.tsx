'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PortalUser } from '@/hooks/usePortalAuth';
import { cn } from '@/lib/utils';

interface PortalSidebarProps {
  user: PortalUser;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  allowedUserTypes: ('empresa' | 'criador')[];
}

export default function PortalSidebar({ user }: PortalSidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/portal-dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Visão geral e métricas',
      allowedUserTypes: ['empresa', 'criador']
    },
    {
      name: 'Campanhas',
      href: '/portal/campanhas',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      description: user.user_type === 'empresa' ? 'Suas campanhas ativas' : 'Campanhas participando',
      allowedUserTypes: ['empresa', 'criador']
    },
    {
      name: 'Performance',
      href: '/portal/performance',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: user.user_type === 'empresa' ? 'Métricas das campanhas' : 'Sua performance',
      allowedUserTypes: ['empresa', 'criador']
    },
    {
      name: 'Criadores',
      href: '/portal/criadores',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Criadores colaborando',
      allowedUserTypes: ['empresa'] // Apenas empresas veem esta seção
    },
    {
      name: 'Financeiro',
      href: '/portal/financeiro',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: user.user_type === 'empresa' ? 'Investimentos e ROI' : 'Pagamentos recebidos',
      allowedUserTypes: ['empresa', 'criador']
    }
  ];

  // Filtrar itens baseado no tipo de usuário
  const filteredNavItems = navItems.filter(item => 
    item.allowedUserTypes.includes(user.user_type)
  );

  return (
    <aside className="w-64 bg-surface border-r border-outline-variant">
      <div className="p-6">
        {/* User Type Badge */}
        <div className="mb-6">
          <div className="bg-primary-container text-on-primary-container px-3 py-2 rounded-xl text-sm font-medium flex items-center space-x-2">
            <span>{user.user_type === 'empresa' ? '🏢' : '🎨'}</span>
            <span>{user.user_type === 'empresa' ? 'Empresa' : 'Criador'}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface hover:bg-surface-container hover:text-on-surface'
                )}
              >
                <span className={cn(
                  'transition-colors',
                  isActive ? 'text-on-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                )}>
                  {item.icon}
                </span>
                <div className="flex-1">
                  <div className={cn(
                    'font-medium text-sm',
                    isActive ? 'text-on-primary' : 'text-on-surface'
                  )}>
                    {item.name}
                  </div>
                  <div className={cn(
                    'text-xs',
                    isActive ? 'text-on-primary/80' : 'text-on-surface-variant'
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-surface-container rounded-xl">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-on-surface">Precisa de ajuda?</span>
          </div>
          <p className="text-xs text-on-surface-variant mb-3">
            Entre em contato com nossa equipe para suporte.
          </p>
          <button className="text-xs text-primary hover:text-primary/80 transition-colors">
            Falar com suporte →
          </button>
        </div>
      </div>
    </aside>
  );
}
