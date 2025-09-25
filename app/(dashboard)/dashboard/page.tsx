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
      case 'manager':
        // Empresas vão para o dashboard empresarial
        router.push('/dashboard/empresa');
        break;

      case 'creator':
      case 'creator_strategist':
        // Criadores vão para o dashboard de criadores
        router.push('/dashboard/criador');
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




