'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { createUsersSheet } from '@/app/actions/sheetsActions';

export default function TestAuthPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleCreateUsersSheet = async () => {
    setLoading(true);
    setResult('');

    try {
      const success = await createUsersSheet();
      if (success) {
        setResult('✅ Aba Users criada com sucesso! Usuário admin padrão adicionado.');
      } else {
        setResult('❌ Erro ao criar aba Users.');
      }
    } catch (error) {
      console.error('Erro:', error);
      setResult('❌ Erro ao criar aba Users: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-dim p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface rounded-2xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-on-surface mb-6">
            Teste do Sistema de Autenticação
          </h1>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-on-surface mb-2">
                1. Criar Aba Users no Google Sheets
              </h2>
              <p className="text-on-surface-variant mb-4">
                Cria a aba 'Users' na planilha do Google Sheets com o usuário admin padrão.
              </p>
              <Button
                onClick={handleCreateUsersSheet}
                loading={loading}
                variant="primary"
                disabled={loading}
              >
                Criar Aba Users
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-xl ${
                result.includes('✅') 
                  ? 'bg-secondary-container text-on-secondary-container' 
                  : 'bg-error-container text-on-error-container'
              }`}>
                {result}
              </div>
            )}

            <div className="mt-8 p-4 bg-surface-container rounded-xl">
              <h3 className="font-semibold text-on-surface mb-2">
                Credenciais de Teste:
              </h3>
              <p className="text-on-surface-variant text-sm">
                <strong>Email:</strong> luizvincenzi@gmail.com<br />
                <strong>Senha:</strong> admin123
              </p>
            </div>

            <div className="mt-4">
              <Button
                onClick={() => window.location.href = '/login'}
                variant="outlined"
              >
                Ir para Página de Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
