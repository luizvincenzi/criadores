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

  const router = useRouter();
  const { login, isAuthenticated, setLoading: setAuthLoading } = useAuthStore();

  // Redireciona se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Login: Usuário já autenticado, redirecionando para dashboard');
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthLoading(true);
    setError('');

    console.log('🔐 Login: Tentativa de login para:', email);

    try {
      const response = await fetch('/api/supabase/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('🔐 Login: Resposta da API:', { success: data.success, user: data.user });

      if (data.success && data.user) {
        console.log('✅ Login: Sucesso, fazendo login no store com dados:', data.user);
        // Faz login no store
        login(data.user);

        // Verificar se o login foi persistido
        setTimeout(() => {
          const currentState = useAuthStore.getState();
          console.log('🔍 Login: Estado atual do store:', {
            isAuthenticated: currentState.isAuthenticated,
            user: currentState.user?.email
          });

          if (currentState.isAuthenticated) {
            console.log('✅ Login: Estado confirmado, redirecionando para dashboard');
            router.push('/dashboard');
          } else {
            console.log('❌ Login: Estado não foi persistido corretamente');
            setError('Erro ao salvar dados de login. Tente novamente.');
          }
        }, 200);
      } else {
        console.log('❌ Login: Falha na autenticação:', data.error);
        setError(data.error || 'Erro ao fazer login');
      }
    } catch (error) {
      console.error('❌ Login: Erro de conexão:', error);
      setError('Erro de conexão. Tente novamente.');
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
          <h1 className="text-3xl font-bold text-on-surface mb-2">CRM crIAdores</h1>
          <p className="text-on-surface-variant">Faça login para acessar o sistema</p>
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

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
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
            © 2024 CRM crIAdores - Sistema de Gestão
          </p>
        </div>
      </div>
    </div>
  );
}
