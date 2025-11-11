'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteExpired, setInviteExpired] = useState(false);
  const [resendingInvite, setResendingInvite] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const router = useRouter();
  const { login, isAuthenticated, setLoading: setAuthLoading } = useAuthStore();

  // Detectar convite expirado ou erro de acesso
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const tokenType = params.get('type');
    const accessToken = params.get('access_token');
    const errorType = params.get('error');
    const errorCode = params.get('error_code');
    const errorDescription = params.get('error_description');

    console.log('🔍 [Login] Hash detectado:', {
      tokenType,
      hasAccessToken: !!accessToken,
      errorType,
      errorCode,
      hashLength: hash.length
    });

    // Detectar link de convite expirado
    if (errorType === 'access_denied' && errorCode === 'otp_expired') {
      console.log('⚠️ [Login] Link de convite expirado detectado');
      setInviteExpired(true);
      setError('O link de ativação expirou ou já foi utilizado. Solicite um novo link abaixo.');
      // Limpar o hash da URL
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }

    // Detectar convite válido e redirecionar para onboarding
    // Verifica tanto type=invite quanto presença de access_token (convite válido)
    if (tokenType === 'invite' || (accessToken && tokenType === 'invite')) {
      console.log('🎉 [Login] Convite válido detectado, redirecionando para onboarding');
      router.push(`/onboarding${window.location.hash}`);
      return;
    }

    // Se tem access_token mas não tem type, pode ser um convite sem o parâmetro type
    // Vamos verificar se é um token de convite válido
    if (accessToken && !tokenType) {
      console.log('🔍 [Login] Access token detectado sem type, verificando se é convite...');
      // Redirecionar para onboarding para processar o token
      router.push(`/onboarding${window.location.hash}`);
      return;
    }
  }, [router]);

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Login: Usuário já autenticado, redirecionando para dashboard');
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleResendInvite = async () => {
    if (!email) {
      setError('Por favor, digite seu email para solicitar um novo link de ativação.');
      return;
    }

    setResendingInvite(true);
    setError('');
    setResendSuccess(false);

    try {
      console.log('📧 [Login] Solicitando reenvio de convite para:', email);

      const response = await fetch('/api/platform/auth/resend-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('📧 [Login] Resposta da API:', {
        status: response.status,
        ok: response.ok
      });

      const data = await response.json();
      console.log('📧 [Login] Dados da resposta:', data);

      if (response.ok && data.success) {
        console.log('✅ [Login] Convite reenviado com sucesso');
        setResendSuccess(true);
        setInviteExpired(false);
        setError('');
      } else {
        console.error('❌ [Login] Erro ao reenviar convite:', data.error);
        setError(data.error || 'Erro ao reenviar convite. Entre em contato com o administrador.');
      }
    } catch (error: any) {
      console.error('❌ [Login] Erro inesperado ao reenviar convite:', error);
      setError(`Erro ao reenviar convite: ${error?.message || 'Tente novamente mais tarde.'}`);
    } finally {
      setResendingInvite(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthLoading(true);
    setError('');

    console.log('🔐 Login: Tentativa de login para:', email);

    try {
      console.log('🔐 [crIAdores] Iniciando autenticação...');

      const result = await login(email, password);

      if (result.success) {
        console.log('✅ [crIAdores] Login realizado com sucesso');
        router.push('/dashboard');
      } else {
        console.log('❌ [crIAdores] Falha na autenticação:', result.error);
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('❌ [crIAdores] Erro inesperado:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-dim flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-on-surface mb-2"><div className="flex items-center justify-center mb-2"><span className="text-3xl font-onest tracking-tight"><span className="text-gray-600 font-light">cr</span><span className="text-black font-bold">IA</span><span className="text-gray-600 font-light">dores</span></span></div></h1>
          <p className="text-on-surface-variant">Faça login para acessar a plataforma</p>
        </div>

        {/* Card de Login */}
        <div className="bg-surface rounded-2xl shadow-sm border-0 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-outline bg-surface-variant text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>

            {/* Campo Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-outline bg-surface-variant text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* Mensagem de Sucesso */}
            {resendSuccess && (
              <div className="bg-green-50 text-green-800 px-4 py-3 rounded-xl text-sm border border-green-200">
                ✅ Novo link de ativação enviado! Verifique seu email.
              </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Botão de Reenviar Convite (quando link expirado) */}
            {inviteExpired && (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                loading={resendingInvite}
                className="w-full"
                onClick={handleResendInvite}
                disabled={resendingInvite || !email}
              >
                {resendingInvite ? 'Enviando...' : '📧 Solicitar Novo Link de Ativação'}
              </Button>
            )}

            {/* Botão de Login */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
              disabled={loading || !email || !password}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Informações de Acesso */}
          <div className="mt-6 pt-6 border-t border-outline-variant">
            <p className="text-xs text-on-surface-variant text-center">
              Acesso restrito a usuários autorizados.<br />
              Entre em contato com o administrador para obter acesso.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-on-surface-variant">
            © 2024 <span className="font-onest tracking-tight">
              <span className="text-gray-600 font-light">cr</span>
              <span className="text-black font-bold">IA</span>
              <span className="text-gray-600 font-light">dores</span>
            </span> - Sistema de Gestão
          </p>
        </div>
      </div>
    </div>
  );
}
