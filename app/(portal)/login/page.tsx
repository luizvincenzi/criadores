'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { usePortalAuth } from '@/hooks/usePortalAuth';

export default function PortalLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = usePortalAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/portal/dashboard');
      } else {
        setError('Email ou senha incorretos');
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-surface to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/portal" className="inline-block">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-on-primary font-bold text-xl">C</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-on-surface mb-2">
            Entrar no Portal
          </h1>
          <p className="text-on-surface-variant">
            Acesse sua conta para acompanhar suas campanhas
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-surface rounded-2xl shadow-lg border border-outline-variant p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
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
                className="w-full px-4 py-3 border border-outline rounded-xl bg-surface text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="seu@email.com"
              />
            </div>

            {/* Password Field */}
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
                className="w-full px-4 py-3 border border-outline rounded-xl bg-surface text-on-surface placeholder-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-surface-container rounded-xl">
            <h3 className="text-sm font-medium text-on-surface mb-2">Credenciais de Teste:</h3>
            <div className="space-y-1 text-xs text-on-surface-variant">
              <p><strong>Empresa:</strong> empresa1@criadores.app</p>
              <p><strong>Criador:</strong> criador1@criadores.app</p>
              <p><strong>Senha:</strong> Portal2024!</p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <Link 
            href="/portal" 
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            ← Voltar para página inicial
          </Link>
        </div>

        {/* CRM Link */}
        <div className="text-center mt-4 p-4 bg-surface-container rounded-xl">
          <p className="text-xs text-on-surface-variant mb-2">
            Funcionário da empresa?
          </p>
          <Link 
            href="/login" 
            className="text-sm text-secondary hover:text-secondary/80 transition-colors font-medium"
          >
            Acessar CRM Interno →
          </Link>
        </div>
      </div>
    </div>
  );
}
