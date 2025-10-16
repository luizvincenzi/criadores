'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import ContentPlanningView from '@/components/ContentPlanningView';
import PageSidebar, { SidebarItem } from '@/components/PageSidebar';
import MobileNavDrawer, { MobileNavItem } from '@/components/MobileNavDrawer';
import MobileNavButton from '@/components/MobileNavButton';

function ConteudoPageContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔒 VERIFICAR ACESSO - Apenas usuários internos do CRM
  useEffect(() => {
    async function checkCRMAccess() {
      if (!user) {
        router.push('/login');
        return;
      }

      // ✅ PERMITIR APENAS: admin, manager, ops, vendas (users table - CRM interno)
      const allowedRoles = ['admin', 'manager', 'ops', 'vendas', 'user'];
      const isInternalUser = allowedRoles.includes(user.role);

      // ❌ BLOQUEAR: strategist, creator, business_owner (platform_users table)
      const blockedRoles = ['marketing_strategist', 'creator', 'business_owner'];
      const isExternalUser = blockedRoles.includes(user.role) ||
        (user.roles && user.roles.some((r: string) => blockedRoles.includes(r)));

      if (isExternalUser || !isInternalUser) {
        console.log('❌ Acesso negado à página /conteudo (CRM):', {
          role: user.role,
          roles: user.roles,
          email: user.email
        });

        // Redirecionar para página apropriada
        if (user.role === 'marketing_strategist' || (user.roles && user.roles.includes('marketing_strategist'))) {
          router.push('/conteudo-estrategista');
        } else if (user.role === 'business_owner' || (user.roles && user.roles.includes('business_owner'))) {
          router.push('/conteudo-empresa');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      console.log('✅ Acesso concedido à página /conteudo (CRM):', {
        role: user.role,
        email: user.email
      });

      setHasAccess(true);
      setIsLoading(false);
    }

    checkCRMAccess();
  }, [user, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Access denied
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">
            Esta página é exclusiva para a equipe interna do CRM.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

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

