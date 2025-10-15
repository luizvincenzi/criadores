'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ContentPlanningView from '@/components/ContentPlanningView';
import PageSidebar, { SidebarItem } from '@/components/PageSidebar';
import MobileNavDrawer, { MobileNavItem } from '@/components/MobileNavDrawer';
import MobileNavButton from '@/components/MobileNavButton';

function ConteudoEstrategistaPageContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // 🔒 VERIFICAR ACESSO - Apenas marketing strategists relacionados a um business
  useEffect(() => {
    async function checkStrategistAccess() {
      if (!user) {
        router.push('/login');
        return;
      }

      // Verificar se é marketing strategist
      const isStrategist = user.role === 'marketing_strategist' ||
        (user.roles && user.roles.includes('marketing_strategist'));

      if (!isStrategist) {
        console.log('❌ Usuário não é marketing strategist');
        router.push('/dashboard');
        return;
      }

      // Verificar se tem creator_id (strategist é um creator)
      if (!user.creator_id) {
        console.log('❌ Marketing strategist sem creator_id');
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // Buscar business relacionado ao strategist
      const { data: business, error } = await supabase
        .from('businesses')
        .select('id, name, has_strategist')
        .eq('strategist_id', user.creator_id)
        .eq('has_strategist', true)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar business:', error);
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      if (!business) {
        console.log('❌ Strategist não está relacionado a nenhum business');
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      console.log('✅ Acesso concedido ao business:', business.name);
      setBusinessId(business.id);
      setHasAccess(true);
      setIsLoading(false);
    }

    checkStrategistAccess();
  }, [user, router]);

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
      href: '/conteudo-estrategista'
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
      href: '/conteudo-estrategista'
    },
    {
      id: 'blog',
      label: 'Blog',
      icon: '',
      active: false,
      href: '/blog'
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-6">
              Você precisa estar relacionado a um business como estrategista para acessar esta página.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          {/* TODO: Passar businessId para ContentPlanningView para filtrar conteúdo */}
          <ContentPlanningView />
        </div>
      </div>
    </div>
  );
}

export default function ConteudoEstrategistaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conteúdo...</p>
        </div>
      </div>
    }>
      <ConteudoEstrategistaPageContent />
    </Suspense>
  );
}

