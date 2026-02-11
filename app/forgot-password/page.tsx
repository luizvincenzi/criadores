'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/platform/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
      } else if (response.status === 429) {
        setError(data.error || 'Muitas tentativas. Aguarde antes de tentar novamente.');
      } else {
        setError(data.error || 'Erro ao enviar email. Tente novamente.');
      }
    } catch (err: any) {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
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
            Recuperação de senha
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          {success ? (
            /* Estado de sucesso */
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-green-50 mb-4">
                <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verifique seu email
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Se o email <strong className="text-gray-700">{email}</strong> estiver cadastrado,
                você receberá um link para redefinir sua senha.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                O link expira em 1 hora. Verifique também a pasta de spam.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar para o login
              </Link>
            </div>
          ) : (
            /* Formulário */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Esqueceu sua senha?
                </h2>
                <p className="text-gray-500 text-sm">
                  Digite o email da sua conta e enviaremos um link para criar uma nova senha.
                </p>
              </div>

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
                    autoFocus
                  />
                </div>

                {/* Mensagem de Erro */}
                {error && (
                  <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                    {error}
                  </div>
                )}

                {/* Botão Enviar */}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full px-4 py-3 rounded-xl text-base font-semibold text-white bg-[#007AFF] hover:bg-[#0066DD] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Enviando...
                    </span>
                  ) : 'Enviar link de recuperação'}
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
            </>
          )}
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
