'use client';

import React, { Suspense, useState } from 'react';
import ContentPlanningView from '@/components/ContentPlanningView';
import PageSidebar, { SidebarItem } from '@/components/PageSidebar';
import MobileNavDrawer, { MobileNavItem } from '@/components/MobileNavDrawer';
import MobileNavButton from '@/components/MobileNavButton';

function ConteudoPageContent() {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Definir itens da sidebar
  const sidebarItems: SidebarItem[] = [
    {
      id: 'conteudo',
      label: 'Conteúdo',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      active: true,
      href: '/conteudo'
    },
    {
      id: 'blog',
      label: 'Blog',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      active: false,
      href: '/blog'
    }
  ];

  // Definir itens do mobile drawer
  const mobileNavItems: MobileNavItem[] = [
    {
      id: 'conteudo',
      label: 'Conteúdo',
      icon: '',
      active: true,
      href: '/conteudo'
    },
    {
      id: 'blog',
      label: 'Blog',
      icon: '',
      active: false,
      href: '/blog'
    }
  ];

  return (
    <div className="bg-[#f5f5f5] min-h-screen pt-[4px]">
      {/* Sidebar Desktop - Fixo à esquerda */}
      <div className="hidden md:block">
        <PageSidebar items={sidebarItems} />
      </div>

      {/* Mobile Navigation */}
      <MobileNavDrawer
        items={mobileNavItems}
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        title="Navegação"
      />
      <MobileNavButton
        onClick={() => setIsMobileDrawerOpen(true)}
        activeLabel="Conteúdo"
      />

      {/* Conteúdo Principal - Com margem para o sidebar */}
      <div className="md:ml-[68px] px-6">
        <div className="max-w-[1400px] mx-auto">
          <ContentPlanningView />
        </div>
      </div>
    </div>
  );
}

export default function ConteudoPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conteúdo...</p>
        </div>
      </div>
    }>
      <ConteudoPageContent />
    </Suspense>
  );
}

