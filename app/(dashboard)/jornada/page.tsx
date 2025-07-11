'use client';

import React, { useEffect } from 'react';
import { useBusinessStore } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';
import ClientOnlyWorkingKanban from '@/components/ClientOnlyWorkingKanban';
import Button from '@/components/ui/Button';

export default function JornadaPage() {
  const { businesses, loading, loadBusinessesFromSheet, updateStatusesFromAuditLog } = useBusinessStore();
  const { user, isAuthenticated } = useAuthStore();

  // Carrega os dados da planilha e atualiza status do Audit_Log
  useEffect(() => {
    const initializePage = async () => {
      console.log('🚀 Inicializando página Jornada...');

      // Carrega os negócios da planilha
      await loadBusinessesFromSheet();

      // Atualiza os status baseado no Audit_Log após um pequeno delay
      setTimeout(async () => {
        console.log('🔄 Atualizando status baseado no Audit_Log...');
        await updateStatusesFromAuditLog();
      }, 1500); // Aguarda 1.5 segundos para garantir que os negócios foram carregados
    };

    initializePage();
  }, [loadBusinessesFromSheet, updateStatusesFromAuditLog]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Carregando negócios da planilha...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 8rem)' }}>
      {/* Header Simplificado */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Pipeline de Negócios</h1>
        <p className="text-sm text-gray-600">
          {businesses.length} negócios ativos • Arraste para mover entre estágios
        </p>
      </div>

      {/* Kanban Funcional */}
      <ClientOnlyWorkingKanban />

      {/* Estado vazio responsivo */}
      {businesses.length === 0 && (
        <div className="text-center py-12 md:py-16">
          <div className="text-4xl md:text-6xl mb-4 md:mb-6">📊</div>
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 md:mb-3">
            Nenhum negócio encontrado
          </h3>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 max-w-md mx-auto px-4">
            Verifique se há dados na coluna A da aba "Business" na sua planilha do Google Sheets.
          </p>
          <Button
            variant="primary"
            icon="🔄"
            onClick={() => loadBusinessesFromSheet()}
            className="text-sm"
          >
            Tentar Novamente
          </Button>
        </div>
      )}


    </div>
  );
}
