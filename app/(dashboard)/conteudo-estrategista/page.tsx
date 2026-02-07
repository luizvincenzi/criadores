'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import StrategistContentPlanningView from '@/components/strategist-content/StrategistContentPlanningView';
import { Business } from '@/components/strategist-content/BusinessSelector';

function ConteudoEstrategistaPageContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [strategistId, setStrategistId] = useState<string | null>(null);

  // 🔒 VERIFICAR ACESSO - Apenas marketing strategists relacionados a um business
  // Usa 3 fontes: managed_businesses[], platform_user_id, creator_id (legacy)
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

      // Precisa de pelo menos um identificador para buscar businesses
      const hasCreatorId = !!user.creator_id;
      const hasManagedBusinesses = user.managed_businesses && user.managed_businesses.length > 0;
      const hasPlatformUserId = !!user.id;

      if (!hasCreatorId && !hasManagedBusinesses && !hasPlatformUserId) {
        console.log('❌ Marketing strategist sem nenhum identificador válido');
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // Construir URL com todos os identificadores disponíveis
      const params = new URLSearchParams();
      if (user.creator_id) {
        params.set('strategist_id', user.creator_id);
      }
      if (user.id) {
        params.set('platform_user_id', user.id);
      }
      if (user.managed_businesses && user.managed_businesses.length > 0) {
        params.set('managed_businesses', JSON.stringify(user.managed_businesses));
      }

      console.log('🔍 Buscando businesses para strategist:', {
        creator_id: user.creator_id,
        platform_user_id: user.id,
        managed_businesses: user.managed_businesses
      });

      const response = await fetch(`/api/strategist/businesses?${params.toString()}`);
      const data = await response.json();

      console.log('📦 Resposta da API:', data);

      if (!data.success || !data.businesses || data.businesses.length === 0) {
        console.log('❌ Strategist não está relacionado a nenhum business');
        console.log('❌ Dados recebidos:', data);
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      console.log(`✅ Acesso concedido a ${data.businesses.length} business(es):`, data.businesses);
      setBusinesses(data.businesses);
      // Para criação de conteúdo, manter creator_id quando disponível (compatibilidade)
      // Se não tiver creator_id, usar user.id como fallback
      setStrategistId(user.creator_id || user.id);
      setHasAccess(true);
      setIsLoading(false);
    }

    checkStrategistAccess();
  }, [user, router]);

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
    <StrategistContentPlanningView
      businesses={businesses}
      strategistId={strategistId || ''}
    />
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

