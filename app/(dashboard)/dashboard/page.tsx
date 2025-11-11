'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Redirecionar baseado no role do usuário
    switch (user.role) {
      case 'business_owner':
        // Business owners vão direto para conteúdo (dashboard temporariamente desabilitado)
        router.push('/conteudo-empresa');
        break;

      case 'manager':
        // Managers vão para o dashboard empresarial
        router.push('/dashboard/empresa');
        break;

      case 'creator':
        // ❌ Creators NÃO têm acesso ao dashboard personalizado
        // Redirecionar para página apropriada baseada em roles adicionais
        if (user.roles && user.roles.includes('marketing_strategist')) {
          // Se tem strategist, priorizar estrategista
          router.push('/conteudo-estrategista');
        } else {
          // Creator puro - redirecionar para campanhas
          router.push('/campanhas-criador');
        }
        break;

      case 'creator_strategist':
        // Criadores estrategistas vão para o dashboard de criadores
        router.push('/dashboard/criador');
        break;

      case 'marketing_strategist':
        // Marketing strategists vão para conteúdo estrategista
        router.push('/conteudo-estrategista');
        break;

      case 'admin':
        // Admins vão para o dashboard administrativo
        router.push('/dashboard/admin');
        break;

      default:
        // Usuários sem role específico vão para o dashboard geral
        router.push('/dashboard/geral');
        break;
    }
  }, [user, router]);

  // Mostrar loading enquanto redireciona
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Redirecionando para seu dashboard...</p>
      </div>
    </div>
  );
}




