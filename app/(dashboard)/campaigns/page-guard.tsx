'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * Guard para bloquear acesso de creators à página /campaigns
 * Creators devem usar /campaigns_creator
 */
export function CampaignsPageGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Verificar se é creator (role principal ou em roles array)
    const isCreator = user.role === 'creator' || (user.roles && user.roles.includes('creator'));
    
    // Se for APENAS creator (não tem outras roles como marketing_strategist)
    const isOnlyCreator = user.role === 'creator' && (!user.roles || user.roles.length === 1 || (user.roles.length === 1 && user.roles[0] === 'creator'));

    if (isOnlyCreator) {
      console.log('🚫 Creator tentando acessar /campaigns - redirecionando para /campaigns_creator');
      router.push('/campaigns_creator');
    }
  }, [user, router]);

  return <>{children}</>;
}

