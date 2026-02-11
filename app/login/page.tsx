'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

    console.log('[Login] Hash detectado:', {
      tokenType,
      hasAccessToken: !!accessToken,
      errorType,
      errorCode,
      hashLength: hash.length
    });

    // Detectar link de convite expirado
    if (errorType === 'access_denied' && errorCode === 'otp_expired') {
      console.log('[Login] Link de convite expirado detectado');

      const storedEmail = localStorage.getItem('invite_email');

      if (storedEmail) {
        console.log('[Login] Email encontrado no localStorage:', storedEmail);
        setEmail(storedEmail);
        setInviteExpired(true);
        setError('Link expirado. Reenviando novo link automaticamente...');
        handleResendInvite(storedEmail);
      } else {
        setInviteExpired(true);
        setError('O link de ativação expirou. Digite seu email abaixo e clique em "Solicitar Novo Link".');
      }

      window.history.replaceState(null, '', window.location.pathname);
      return;
    }

    // Detectar convite válido e redirecionar para onboarding
    if (tokenType === 'invite' || (accessToken && tokenType === 'invite')) {
      console.log('[Login] Convite válido detectado, redirecionando para onboarding');
      router.push(`/onboarding${window.location.hash}`);
      return;
    }

    // Se tem access_token mas não tem type, pode ser um convite sem o parâmetro type
    if (accessToken && !tokenType) {
      console.log('[Login] Access token detectado sem type, verificando...');
      router.push(`/onboarding${window.location.hash}`);
      return;
    }
  }, [router]);

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[Login] Usuário já autenticado, redirecionando para dashboard');
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleResendInvite = async (emailToResend?: string) => {
    const targetEmail = emailToResend || email;

    if (!targetEmail) {
      setError('Por favor, digite seu email para solicitar um novo link.');
      return;
    }

    setResendingInvite(true);
    setError('');
    setResendSuccess(false);

    try {
      const response = await fetch('/api/platform/auth/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendSuccess(true);
        setInviteExpired(false);
        setError('');
      } else {
        setError(data.error || 'Erro ao reenviar. Tente novamente mais tarde.');
      }
    } catch (error: any) {
      setError(`Erro ao reenviar: ${error?.message || 'Tente novamente mais tarde.'}`);
    } finally {
      setResendingInvite(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthLoading(true);
    setError('');

    try {
      const result = await login(email, password);

      if (result.success) {
        router.push('/dashboard');
      } else {
        setError(result.error || 'Email ou senha incorretos');
      }
    } catch (error) {
      console.error('[Login] Erro inesperado:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <span className="text-4xl font-onest tracking-tight">
              <span className="text-gray-500 font-light">cr</span>
              <span className="text-black font-bold">IA</span>
              <span className="text-gray-500 font-light">dores</span>
            </span>
          </div>
          <p className="text-gray-500 text-[15px]">
            Bem-vindo de volta! Entre na sua conta.
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Digite sua senha"
                disabled={loading}
              />
            </div>

            {/* Mensagem de Sucesso */}
            {resendSuccess && (
              <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm border border-green-200">
                Novo link enviado! Verifique seu email.
              </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                {error}
              </div>
            )}

            {/* Botão de Reenviar Convite (quando link expirado) */}
            {inviteExpired && (
              <button
                type="button"
                onClick={() => handleResendInvite()}
                disabled={resendingInvite || !email}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {resendingInvite ? 'Enviando...' : 'Solicitar Novo Link de Ativação'}
              </button>
            )}

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full px-4 py-3 rounded-xl text-base font-semibold text-white bg-[#007AFF] hover:bg-[#0066DD] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Entrando...
                </span>
              ) : 'Entrar'}
            </button>
          </form>

          {/* Footer do Card */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Primeiro acesso? Verifique seu email pelo convite que recebeu.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()}{' '}
            <span className="font-onest tracking-tight">
              <span className="text-gray-400 font-light">cr</span>
              <span className="text-gray-500 font-bold">IA</span>
              <span className="text-gray-400 font-light">dores</span>
            </span>
            {' '}· Plataforma de Criadores
          </p>
        </div>
      </div>
    </div>
  );
}
