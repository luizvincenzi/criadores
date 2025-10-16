'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import BusinessContentPlanningView from '@/components/business-content/BusinessContentPlanningView';

function ConteudoEmpresaPageContent() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string>('');

  // 🔒 VERIFICAR ACESSO - Apenas business owners
  useEffect(() => {
    async function checkBusinessOwnerAccess() {
      if (!user) {
        router.push('/login');
        return;
      }

      // ✅ VERIFICAR: role business_owner
      const isBusinessOwner = user.role === 'business_owner' ||
        (user.roles && user.roles.includes('business_owner'));

      if (!isBusinessOwner) {
        console.log('❌ Acesso negado à página /conteudo-empresa:', {
          role: user.role,
          roles: user.roles,
          email: user.email
        });

        // Redirecionar para página apropriada
        if (user.role === 'marketing_strategist' || (user.roles && user.roles.includes('marketing_strategist'))) {
          router.push('/conteudo-estrategista');
        } else if (['admin', 'manager', 'ops', 'vendas', 'user'].includes(user.role)) {
          router.push('/conteudo');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      // ✅ VERIFICAR: business_id existe
      if (!user.business_id) {
        console.error('❌ Business owner sem business_id:', user.email);
        setHasAccess(false);
        setIsLoading(false);
        return;
      }

      // ✅ BUSCAR informações do business
      try {
        const response = await fetch(`/api/businesses/${user.business_id}`);

        if (!response.ok) {
          console.error('❌ Business não encontrado:', user.business_id);
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        const business = await response.json();

        if (!business || !business.name) {
          console.error('❌ Business sem nome:', user.business_id);
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        console.log('✅ Acesso concedido à página /conteudo-empresa:', {
          role: user.role,
          email: user.email,
          businessId: user.business_id,
          businessName: business.name
        });

        setBusinessId(user.business_id);
        setBusinessName(business.name);
        setHasAccess(true);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Erro ao buscar business:', error);
        setHasAccess(false);
        setIsLoading(false);
      }
    }

    checkBusinessOwnerAccess();
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
            Esta página é exclusiva para proprietários de empresas (business owners).
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

  // No business ID
  if (!businessId || !businessName) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Empresa Não Encontrada</h1>
          <p className="text-gray-600 mb-6">
            Não foi possível encontrar sua empresa. Entre em contato com o suporte.
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

  // ✅ RENDER: Business Content Planning View
  return (
    <div className="bg-[#f5f5f5] min-h-screen">
      <BusinessContentPlanningView
        businessId={businessId}
        businessName={businessName}
      />
    </div>
  );
}

export default function ConteudoEmpresaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conteúdo...</p>
        </div>
      </div>
    }>
      <ConteudoEmpresaPageContent />
    </Suspense>
  );
}

