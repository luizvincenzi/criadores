'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

function OnboardingForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setIsAuthenticated } = useAuthStore();

  // Extrair dados do hash fragment (access_token, etc.)
  useEffect(() => {
    // O Supabase Auth retorna dados no hash fragment (#)
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const expiresIn = params.get('expires_in');
    const tokenType = params.get('type');

    console.log('🔐 [Onboarding] Hash params:', {
      accessToken: accessToken ? '✅ Presente' : '❌ Ausente',
      refreshToken: refreshToken ? '✅ Presente' : '❌ Ausente',
      type: tokenType,
      expiresIn
    });

    if (!accessToken || tokenType !== 'invite') {
      console.error('❌ [Onboarding] Token inválido ou tipo incorreto');
      setError('Link de convite inválido ou expirado');
      return;
    }

    // Decodificar JWT para extrair dados do usuário
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      console.log('📋 [Onboarding] Dados do token:', payload);

      const userMetadata = payload.user_metadata || {};
      
      setUserData({
        email: payload.email,
        fullName: userMetadata.full_name || '',
        businessName: userMetadata.business_name || '',
        businessId: userMetadata.business_id || '',
        role: userMetadata.role || 'business_owner',
        entityType: userMetadata.entity_type || 'business'
      });

      setTokenData({
        accessToken,
        refreshToken,
        expiresIn: parseInt(expiresIn || '3600')
      });

    } catch (err) {
      console.error('❌ [Onboarding] Erro ao decodificar token:', err);
      setError('Erro ao processar convite');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validações
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (!tokenData || !userData) {
      setError('Dados do convite não encontrados');
      setLoading(false);
      return;
    }

    console.log('🔐 [Onboarding] Criando senha para:', userData.email);

    try {
      // Chamar API para criar senha e ativar usuário
      const response = await fetch('/api/platform/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: password,
          accessToken: tokenData.accessToken,
          userData: userData
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ [Onboarding] Senha criada com sucesso');
        console.log('⏳ [Onboarding] Aguardando 1 segundo antes do login...');

        // Aguardar 1 segundo para garantir que a senha foi salva
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('🔐 [Onboarding] Iniciando login automático via Supabase Auth...');

        // Tentar login via Supabase Auth primeiro
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

          const supabase = createClient(supabaseUrl, supabaseAnonKey);

          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: userData.email,
            password: password,
          });

          if (authError) {
            console.error('❌ [Onboarding] Erro no login Supabase Auth:', authError);
            throw authError;
          }

          console.log('✅ [Onboarding] Login Supabase Auth realizado');
          console.log('📋 [Onboarding] User ID:', authData.user?.id);

          // Agora buscar dados do usuário em platform_users
          const loginResponse = await fetch('/api/platform/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: userData.email,
              password: password,
            }),
          });

          console.log('📊 [Onboarding] Status do login platform:', loginResponse.status);

          const loginData = await loginResponse.json();
          console.log('📋 [Onboarding] Resposta do login platform:', loginData);

          if (loginData.success) {
            console.log('✅ [Onboarding] Login completo realizado');

            // Atualizar store
            setUser(loginData.user);
            setIsAuthenticated(true);

            // Redirecionar para dashboard
            router.push('/dashboard');
          } else {
            console.error('❌ [Onboarding] Erro no login platform:', loginData.error);
            setError('Senha criada, mas erro no login. Tente fazer login manualmente.');
          }
        } catch (err) {
          console.error('❌ [Onboarding] Erro no login automático:', err);
          setError('Senha criada com sucesso! Faça login manualmente.');
        }
      } else {
        console.error('❌ [Onboarding] Erro ao criar senha:', data.error);
        setError(data.error || 'Erro ao criar senha');
      }
    } catch (err) {
      console.error('❌ [Onboarding] Erro inesperado:', err);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state enquanto processa o token
  if (!userData && !error) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Processando convite...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error && !userData) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-surface rounded-2xl shadow-sm border-0 p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-on-surface mb-2">Convite Inválido</h1>
              <p className="text-on-surface-variant">{error}</p>
            </div>
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dim flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-on-surface mb-2">Bem-vindo! 🎉</h1>
          <p className="text-on-surface-variant">Configure sua senha para acessar a plataforma</p>
        </div>

        {/* Card de Onboarding */}
        <div className="bg-surface rounded-2xl shadow-sm border-0 p-8">
          {/* Informações do Usuário */}
          <div className="mb-6 p-4 bg-primary-container rounded-xl">
            <p className="text-sm text-on-primary-container mb-1">
              <strong>Nome:</strong> {userData?.fullName}
            </p>
            <p className="text-sm text-on-primary-container mb-1">
              <strong>Email:</strong> {userData?.email}
            </p>
            {userData?.businessName && (
              <p className="text-sm text-on-primary-container">
                <strong>Empresa:</strong> {userData.businessName}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nova Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-2">
                Nova Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-outline bg-surface-variant text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Mínimo 8 caracteres"
                disabled={loading}
              />
            </div>

            {/* Campo Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-on-surface mb-2">
                Confirmar Senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-outline bg-surface-variant text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="Digite a senha novamente"
                disabled={loading}
              />
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Botão Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Criando senha...' : 'Criar Senha e Acessar'}
            </Button>
          </form>

          {/* Dicas de Senha */}
          <div className="mt-6 p-4 bg-surface-variant rounded-xl">
            <p className="text-xs text-on-surface-variant mb-2">
              <strong>Dicas para uma senha segura:</strong>
            </p>
            <ul className="text-xs text-on-surface-variant space-y-1">
              <li>• Mínimo de 8 caracteres</li>
              <li>• Use letras maiúsculas e minúsculas</li>
              <li>• Inclua números e caracteres especiais</li>
              <li>• Evite informações pessoais óbvias</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
 return (
   <Suspense fallback={
     <div className="min-h-screen bg-surface-dim flex items-center justify-center px-4">
       <div className="text-center">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
         <p className="text-on-surface-variant">Carregando...</p>
       </div>
     </div>
   }>
     <OnboardingForm />
   </Suspense>
 );
}

