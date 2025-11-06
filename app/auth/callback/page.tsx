'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // O Supabase Auth retorna dados no hash fragment (#)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const accessToken = params.get('access_token');
    const tokenType = params.get('type');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    console.log('🔐 [Auth Callback] Processando callback...', {
      hasAccessToken: !!accessToken,
      tokenType,
      error,
      errorDescription
    });

    // Se houver erro, redirecionar para login com mensagem
    if (error) {
      console.error('❌ [Auth Callback] Erro no callback:', error, errorDescription);
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    // Se for um convite (type=invite), redirecionar para onboarding
    if (tokenType === 'invite' && accessToken) {
      console.log('🎉 [Auth Callback] Convite detectado, redirecionando para onboarding');
      router.push(`/onboarding${window.location.hash}`);
      return;
    }

    // Se for um recovery (type=recovery), redirecionar para reset de senha
    if (tokenType === 'recovery' && accessToken) {
      console.log('🔑 [Auth Callback] Recovery detectado, redirecionando para reset de senha');
      router.push(`/reset-password${window.location.hash}`);
      return;
    }

    // Se for um login normal, redirecionar para dashboard
    if (accessToken && !tokenType) {
      console.log('✅ [Auth Callback] Login detectado, redirecionando para dashboard');
      router.push('/dashboard');
      return;
    }

    // Caso padrão: redirecionar para login
    console.log('⚠️ [Auth Callback] Caso não tratado, redirecionando para login');
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-surface-dim flex items-center justify-center px-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-on-surface-variant">Processando autenticação...</p>
      </div>
    </div>
  );
}

