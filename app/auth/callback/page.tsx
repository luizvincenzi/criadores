'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      // O Supabase Auth retorna dados no hash fragment (#)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);

      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const tokenType = params.get('type');
      const error = params.get('error');
      const errorDescription = params.get('error_description');

      console.log('🔐 [Auth Callback] Processando callback...', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
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

      // Se for um convite (type=invite), criar sessão persistente e redirecionar para onboarding
      if (tokenType === 'invite' && accessToken && refreshToken) {
        console.log('🎉 [Auth Callback] Convite detectado, criando sessão persistente...');

        try {
          const supabase = createClient();

          // Criar sessão persistente no Supabase
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('❌ [Auth Callback] Erro ao criar sessão:', sessionError);
            router.push(`/login?error=${encodeURIComponent('Erro ao processar convite')}`);
            return;
          }

          console.log('✅ [Auth Callback] Sessão criada com sucesso, redirecionando para onboarding');

          const userEmail = sessionData.session?.user?.email || '';

          // Armazenar flag indicando que é um onboarding pendente
          localStorage.setItem('onboarding_pending', 'true');
          localStorage.setItem('onboarding_email', userEmail);
          localStorage.setItem('invite_email', userEmail); // Para recuperar em caso de link expirado

          console.log('📧 [Auth Callback] Email armazenado:', userEmail);

          // Redirecionar para onboarding SEM o hash (sessão já está criada)
          router.push('/onboarding');
          return;
        } catch (err) {
          console.error('❌ [Auth Callback] Erro inesperado:', err);
          router.push(`/login?error=${encodeURIComponent('Erro ao processar convite')}`);
          return;
        }
      }

      // Se for um recovery (type=recovery), verificar se é onboarding ou reset de senha
      if (tokenType === 'recovery' && accessToken && refreshToken) {
        console.log('🔑 [Auth Callback] Recovery detectado, verificando se é onboarding ou reset...');

        try {
          const supabase = createClient();

          // Criar sessão para poder verificar o usuário
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('❌ [Auth Callback] Erro ao criar sessão:', sessionError);
            router.push(`/login?error=${encodeURIComponent('Erro ao processar link')}`);
            return;
          }

          const userEmail = sessionData.session?.user?.email || '';
          console.log('📧 [Auth Callback] Email do usuário:', userEmail);

          // Verificar se o usuário já tem senha (onboarding completo)
          const checkResponse = await fetch('/api/platform/auth/check-onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail })
          });

          const checkData = await checkResponse.json();

          if (checkData.completed) {
            // Usuário já tem senha -> Reset de senha
            console.log('🔑 [Auth Callback] Usuário já tem senha, redirecionando para reset de senha');
            router.push(`/reset-password${window.location.hash}`);
            return;
          } else {
            // Usuário não tem senha -> Onboarding
            console.log('🎉 [Auth Callback] Usuário sem senha, redirecionando para onboarding');

            // Armazenar flags de onboarding
            localStorage.setItem('onboarding_pending', 'true');
            localStorage.setItem('onboarding_email', userEmail);
            localStorage.setItem('invite_email', userEmail);

            router.push('/onboarding');
            return;
          }
        } catch (err) {
          console.error('❌ [Auth Callback] Erro ao processar recovery:', err);
          router.push(`/login?error=${encodeURIComponent('Erro ao processar link')}`);
          return;
        }
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
    };

    handleCallback();
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

