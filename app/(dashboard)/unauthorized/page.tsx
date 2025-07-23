'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-surface-dim flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-24 h-24 mx-auto mb-6 bg-error/10 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-on-surface mb-4">Acesso Negado</h1>
        
        <p className="text-on-surface-variant mb-6">
          Você não tem permissão para acessar esta página. Entre em contato com o administrador para solicitar acesso.
        </p>

        <div className="bg-surface-container rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-on-surface mb-2">Informações da Conta</h3>
          <div className="text-sm text-on-surface-variant space-y-1">
            <p><strong>Usuário:</strong> {user?.full_name || user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Organização:</strong> {user?.organization?.name}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="primary"
            onClick={() => router.push('/dashboard')}
          >
            Voltar ao Dashboard
          </Button>
          
          <Button 
            variant="outlined"
            onClick={() => router.back()}
          >
            Página Anterior
          </Button>
        </div>

        <div className="mt-8 text-xs text-on-surface-variant">
          <p>Se você acredita que isso é um erro, entre em contato com:</p>
          <p className="font-medium">suporte@crmcriadores.com</p>
        </div>
      </div>
    </div>
  );
}
