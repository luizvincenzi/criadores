'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import { Eye, EyeOff } from 'lucide-react';

export default function ActivatePage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<any>(null);

  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { setUser, setIsAuthenticated } = useAuthStore();

  // Validar token ao carregar a página
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Link inválido');
        setValidatingToken(false);
        return;
      }

      console.log('🔍 [Activate] Validando token:', token);

      try {
        const response = await fetch('/api/platform/auth/validate-activation-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (data.valid) {
          console.log('✅ [Activate] Token válido');
          console.log('📋 [Activate] Dados do usuário:', data.user);
          setUserData(data.user);
        } else {
          console.error('❌ [Activate] Token inválido:', data.error);
          setError(data.error || 'Link inválido ou expirado');
        }
      } catch (err) {
        console.error('❌ [Activate] Erro ao validar token:', err);
        setError('Erro ao validar link. Tente novamente.');
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

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

    console.log('🔐 [Activate] Criando senha para:', userData.email);

    try {
      // Chamar API para ativar conta
      const response = await fetch('/api/platform/auth/activate-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          password: password
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ [Activate] Conta ativada com sucesso');
        console.log('⏳ [Activate] Aguardando 1 segundo antes do login...');

        // Aguardar 1 segundo para garantir que a senha foi salva
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('🔐 [Activate] Iniciando login automático...');

        // Fazer login automático
        try {
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

          const loginData = await loginResponse.json();

          if (loginData.success) {
            console.log('✅ [Activate] Login realizado com sucesso');

            // Atualizar store
            setUser(loginData.user);
            setIsAuthenticated(true);

            // Redirecionar para dashboard
            router.push('/dashboard');
          } else {
            console.error('❌ [Activate] Erro no login:', loginData.error);
            setError('Conta ativada! Faça login manualmente.');
            setTimeout(() => router.push('/login'), 2000);
          }
        } catch (err) {
          console.error('❌ [Activate] Erro no login automático:', err);
          setError('Conta ativada com sucesso! Faça login manualmente.');
          setTimeout(() => router.push('/login'), 2000);
        }
      } else {
        console.error('❌ [Activate] Erro ao ativar conta:', data.error);
        setError(data.error || 'Erro ao ativar conta');
      }
    } catch (err) {
      console.error('❌ [Activate] Erro inesperado:', err);
      setError('Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (validatingToken) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-on-surface">Validando link de ativação...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !userData) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-on-surface mb-2">Link Inválido</h1>
              <p className="text-on-surface-variant mb-6">{error}</p>
              <Button onClick={() => router.push('/login')}>
                Ir para Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-on-surface mb-2">
              Ative sua Conta
            </h1>
            <p className="text-on-surface-variant">
              Olá, <strong>{userData?.fullName || userData?.email}</strong>!
            </p>
            <p className="text-on-surface-variant mt-2">
              Crie uma senha para acessar a plataforma
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-error/10 border border-error/20 rounded-xl">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-variant rounded-xl border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Mínimo 8 caracteres"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-on-surface mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-variant rounded-xl border border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Digite a senha novamente"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Ativando conta...' : 'Criar Senha e Acessar'}
            </Button>
          </form>

          {/* Password Tips */}
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

