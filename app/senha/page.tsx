'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Eye, EyeOff, Key, CheckCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';

function ExpiredLinkScreen({ isExpired, error, router }: { isExpired: boolean; error: string; router: any }) {
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const handleResend = async () => {
    if (!resendEmail || !resendEmail.includes('@')) {
      setResendError('Digite um email válido.');
      return;
    }

    setResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      const response = await fetch('/api/platform/auth/resend-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail.toLowerCase().trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendSuccess(true);
      } else if (data.error?.includes('já está ativa')) {
        // User already has password - redirect to login
        setResendError('Sua conta já está ativa! Use o login abaixo.');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setResendError(data.error || 'Erro ao reenviar. Tente novamente.');
      }
    } catch {
      setResendError('Erro de conexão. Tente novamente.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${isExpired ? 'bg-orange-100' : 'bg-red-100'}`}>
              <AlertCircle className={`h-8 w-8 ${isExpired ? 'text-orange-600' : 'text-red-600'}`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isExpired ? 'Link Expirado' : 'Link Inválido'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isExpired
                ? 'Seu link expirou. Solicite um novo link abaixo.'
                : error}
            </p>

            {/* Self-service resend form */}
            {isExpired && !resendSuccess && (
              <div className="mb-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4 text-left">
                  <p className="text-sm text-orange-800 font-medium mb-1">O que aconteceu?</p>
                  <p className="text-xs text-orange-700">
                    Os links de ativação expiram em 24 horas por segurança.
                    Digite seu email abaixo para receber um novo link.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Digite seu email"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyDown={(e) => e.key === 'Enter' && handleResend()}
                    />
                  </div>

                  {resendError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">{resendError}</p>
                    </div>
                  )}

                  <button
                    onClick={handleResend}
                    disabled={resending || !resendEmail}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4" />
                        Solicitar Novo Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Success message */}
            {resendSuccess && (
              <div className="mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800 font-medium">Novo link enviado!</p>
                  </div>
                  <p className="text-xs text-green-700">
                    Verifique sua caixa de entrada (e spam) em <strong>{resendEmail}</strong>.
                    O novo link expira em 24 horas.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className={`w-full px-6 py-3 font-semibold rounded-lg transition-colors ${
                  isExpired && !resendSuccess
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Ir para Login
              </button>
              <a
                href="https://wa.me/554391936400?text=Olá! Preciso de um novo link de acesso à plataforma Criadores. Meu link expirou."
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Ajuda via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  const router = useRouter();

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error('❌ Variáveis de ambiente não configuradas:', { url: !!url, key: !!key });
      return null;
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
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log(' [Senha] Inicializando autenticação...');
        console.log(' [Senha] URL completa:', window.location.href);
        console.log(' [Senha] Hash:', window.location.hash);

        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        // Detectar erros do Supabase Auth no hash (ex: token expirado)
        const hashError = hashParams.get('error');
        const hashErrorCode = hashParams.get('error_code');
        const hashErrorDescription = hashParams.get('error_description');

        console.log(' [Senha] Parâmetros da URL:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type,
          error: hashError,
          errorCode: hashErrorCode
        });

        // Se Supabase retornou erro no redirect (token expirado, invalido, etc)
        if (hashError || hashErrorCode) {
          console.error('❌ [Senha] Erro do Supabase Auth:', { hashError, hashErrorCode, hashErrorDescription });
          const isExpired = hashErrorCode === 'otp_expired' || hashErrorDescription?.includes('expired');
          if (isExpired) {
            setError('Seu link expirou. Os links de acesso são válidos por 24 horas. Entre em contato com a equipe Criadores para solicitar um novo link.');
          } else {
            setError('Link inválido. Entre em contato com a equipe Criadores para solicitar um novo link de acesso.');
          }
          // Limpar hash da URL
          window.history.replaceState(null, '', window.location.pathname);
          setInitializing(false);
          return;
        }

        // Check supabase client is available (env vars configured)
        if (!supabase) {
          setError('Configuração do sistema indisponível. Entre em contato com a equipe Criadores.');
          setInitializing(false);
          return;
        }

        if (accessToken) {
          console.log('🔑 [Senha] Token encontrado na URL, definindo sessão...');

          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (sessionError) {
            console.error('❌ [Senha] Erro ao definir sessão:', sessionError);
            const isExpiredSession = sessionError.message?.includes('expired') || sessionError.message?.includes('invalid');
            if (isExpiredSession) {
              setError('Seu link expirou. Os links de acesso são válidos por 24 horas. Entre em contato com a equipe Criadores para solicitar um novo link.');
            } else {
              setError('Erro ao processar link: ' + sessionError.message);
            }
            setInitializing(false);
            return;
          }

          console.log(' [Senha] Sessão definida com sucesso!');
          // Limpar hash da URL para não expor o token
          window.history.replaceState(null, '', window.location.pathname);
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          console.error('❌ [Senha] Nenhuma sessão encontrada');
          setError('Não foi possível validar seu acesso. Entre em contato com a equipe Criadores para solicitar um novo link.');
          setInitializing(false);
          return;
        }

        console.log(' [Senha] Sessão ativa encontrada');
        console.log(' [Senha] Usuário:', session.user.email);

        setUserName(session.user.user_metadata?.full_name || '');
        setUserEmail(session.user.email || '');
        setInitializing(false);

      } catch (err) {
        console.error('❌ [Senha] Erro ao inicializar:', err);
        setError('Erro ao processar autenticação: ' + (err as Error).message);
        setInitializing(false);
      }
    };

    initializeAuth();
  }, [router, supabase]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
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
      console.log('🔐 [Senha] Atualizando senha no Supabase Auth...');

      if (!supabase) {
        setError('Erro de configuração. Tente novamente.');
        setLoading(false);
        return;
      }

      // 1. Atualizar senha no Supabase Auth
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('❌ [Senha] Erro ao atualizar senha:', updateError);
        setError('Erro ao criar senha: ' + updateError.message);
        setLoading(false);
        return;
      }

      console.log('✅ [Senha] Senha atualizada no Supabase Auth!');

      // 2. Atualizar metadados
      await supabase.auth.updateUser({
        data: {
          email_verified: true,
          password_set_at: new Date().toISOString()
        }
      });

      // 3. Criar ou atualizar platform_users via API
      // IMPORTANTE: Esta API agora cria o registro se não existir,
      // usando os dados do Supabase Auth (user_metadata)
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email) {
        console.log('💾 [Senha] Sincronizando platform_users (criar ou atualizar)...');

        try {
          const response = await fetch('/api/platform/auth/update-password-hash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              password: password
            })
          });

          const responseData = await response.json();

          if (response.ok) {
            console.log('✅ [Senha] platform_users sincronizado!', responseData.message);
          } else {
            console.error('❌ [Senha] Erro ao sincronizar platform_users:', responseData.error);
            // Não bloquear o fluxo - senha já foi salva no Supabase Auth
            // O usuário pode solicitar ajuda ao admin se o login falhar
          }
        } catch (err) {
          console.error('❌ [Senha] Erro ao sincronizar platform_users:', err);
        }
      }

      console.log('🎉 [Senha] Senha criada com sucesso!');
      setSuccess(true);

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      console.error('❌ [Senha] Erro:', err);
      setError('Erro ao criar senha: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Validando link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Senha Criada!</h2>
              <p className="text-gray-600 mb-4">Sua senha foi definida com sucesso.</p>
              <p className="text-sm text-gray-500">Redirecionando para o login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state (sem sessão)
  if (error && !userEmail) {
    const isExpiredError = error.includes('expirou') || error.includes('expired');
    return <ExpiredLinkScreen isExpired={isExpiredError} error={error} router={router} />;
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-4">
              <Key className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar Senha</h2>
            <p className="text-gray-600">Bem-vindo à Plataforma Criadores! 🎉</p>
            {userName && (
              <p className="text-sm text-gray-500 mt-2">
                Olá, <strong>{userName}</strong>
              </p>
            )}
            {userEmail && (
              <p className="text-xs text-gray-400 mt-1">{userEmail}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSetPassword} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua senha"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Mínimo de 8 caracteres</p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua senha novamente"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Criando senha...' : 'Criar Senha e Acessar Plataforma'}
            </button>
          </form>

          {/* Password Tips */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-2">
              Dicas para uma senha segura:
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Mínimo de 8 caracteres</li>
              <li>• Use letras maiúsculas e minúsculas</li>
              <li>• Inclua números e caracteres especiais</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Ao criar sua senha, você terá acesso completo à plataforma
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

