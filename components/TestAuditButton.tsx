'use client';

import React from 'react';
import Button from './ui/Button';
import { useAuditLog } from '@/hooks/useAuditLog';

export default function TestAuditButton() {
  const { log, logBusinessStageChange, logDataSync } = useAuditLog();

  const testAuditLog = async () => {
    console.log('🧪 Testando sistema de auditoria...');

    try {
      // Teste 1: Log genérico
      await log({
        action: 'business_updated',
        entityType: 'business',
        entityId: 'test_123',
        entityName: 'Teste de Negócio',
        oldValue: 'Valor Antigo',
        newValue: 'Valor Novo',
        details: 'Teste do sistema de auditoria'
      });

      // Teste 2: Log de mudança de estágio
      await logBusinessStageChange(
        'test_456',
        'Negócio de Teste',
        'Reunião Briefing',
        'Agendamentos'
      );

      // Teste 3: Log de sincronização
      await logDataSync('Teste Manual', 5);

      console.log('✅ Testes de auditoria executados com sucesso!');
      alert('Testes de auditoria executados! Verifique o console e clique em "Carregar Logs" no visualizador.');
    } catch (error) {
      console.error('❌ Erro nos testes de auditoria:', error);
      alert('Erro nos testes de auditoria. Verifique o console.');
    }
  };

  return (
    <Button 
      variant="tertiary" 
      size="sm" 
      onClick={testAuditLog}
      icon="🧪"
    >
      Testar Auditoria
    </Button>
  );
}
