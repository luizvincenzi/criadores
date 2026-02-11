'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error('[Reset Password] Variáveis de ambiente não configuradas');
      throw new Error('Supabase não configurado');
    }

    return createClient(url, key);
  }, []);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('[Reset Password] Inicializando...');

        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('[Reset Password] Parâmetros:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type
        });

        if (accessToken) {
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (sessionError) {
            console.error('[Reset Password] Erro ao definir sessão:', sessionError);
            setError('Link inválido ou expirado. Solicite um novo link de recuperação.');
            setInitializing(false);
            return;
          }

          // Limpar hash da URL
          window.history.replaceState(null, '', window.location.pathname);
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          console.error('[Reset Password] Nenhuma sessão encontrada');
          setError('Link inválido ou expirado. Solicite um novo link de recuperação.');
          setInitializing(false);
          return;
        }

        console.log('[Reset Password] Sessão ativa:', session.user.email);
        setUserEmail(session.user.email || '');
        setInitializing(false);

      } catch (err) {
        console.error('[Reset Password] Erro:', err);
        setError('Erro ao processar link. Tente novamente.');
        setInitializing(false);
      }
    };

    initializeAuth();
  }, [supabase]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    setLoading(true);

    try {
      // 1. Atualizar senha no Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('[Reset Password] Erro ao atualizar senha:', updateError);
        setError('Erro ao redefinir senha: ' + updateError.message);
        setLoading(false);
        return;
      }

      console.log('[Reset Password] Senha atualizada no Supabase Auth');

      // 2. Sincronizar com platform_users via API
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email) {
        try {
          const response = await fetch('/api/platform/auth/update-password-hash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              password: password
            })
          });

          if (response.ok) {
            console.log('[Reset Password] platform_users atualizado');
          } else {
            console.warn('[Reset Password] Erro ao atualizar platform_users (não crítico)');
          }
        } catch (err) {
          console.warn('[Reset Password] Erro ao sincronizar platform_users:', err);
        }
      }

      setSuccess(true);

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      console.error('[Reset Password] Erro:', err);
      setError('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Validando link de recuperação...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <span className="text-4xl font-onest tracking-tight">
                <span className="text-gray-500 font-light">cr</span>
                <span className="text-black font-bold">IA</span>
                <span className="text-gray-500 font-light">dores</span>
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-50 mb-4">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Senha redefinida!</h2>
              <p className="text-gray-500 text-sm mb-2">
                Sua nova senha foi salva com sucesso.
              </p>
              <p className="text-xs text-gray-400">Redirecionando para o login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state (sem sessão válida)
  if (error && !userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <span className="text-4xl font-onest tracking-tight">
                <span className="text-gray-500 font-light">cr</span>
                <span className="text-black font-bold">IA</span>
                <span className="text-gray-500 font-light">dores</span>
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-50 mb-4">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Link inválido</h2>
              <p className="text-gray-500 text-sm mb-6">{error}</p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/forgot-password"
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#0066DD] transition-colors text-center"
                >
                  Solicitar novo link
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar para o login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] px-4">
      <div className="max-w-md w-full">
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
            Redefinição de senha
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Criar nova senha
            </h2>
            {userEmail && (
              <p className="text-gray-500 text-sm">
                Para a conta <strong className="text-gray-700">{userEmail}</strong>
              </p>
            )}
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                {error}
              </div>
            )}

            {/* Nova Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nova senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Digite sua nova senha"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">Mínimo 8 caracteres</p>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar nova senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Repita sua nova senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Botão Salvar */}
            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full px-4 py-3 rounded-xl text-base font-semibold text-white bg-[#007AFF] hover:bg-[#0066DD] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Salvando...
                </span>
              ) : 'Salvar nova senha'}
            </button>
          </form>

          {/* Voltar para login */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para o login
            </Link>
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
