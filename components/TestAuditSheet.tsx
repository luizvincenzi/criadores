'use client';

import React, { useState } from 'react';
import Button from './ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function TestAuditSheet() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const { user } = useAuthStore();

  const testCreateSheet = async () => {
    setLoading(true);
    setResult('');

    try {
      const { createAuditLogSheet } = await import('@/app/actions/sheetsActions');
      const success = await createAuditLogSheet();
      
      if (success) {
        setResult('✅ Aba Audit_Log criada/verificada com sucesso!');
      } else {
        setResult('❌ Falha ao criar aba Audit_Log');
      }
    } catch (error) {
      setResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectLog = async () => {
    if (!user) {
      setResult('❌ Usuário não autenticado');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const { logAction } = await import('@/app/actions/sheetsActions');
      
      const success = await logAction({
        action: 'business_stage_changed',
        entity_type: 'business',
        entity_id: 'test_direct_' + Date.now(),
        entity_name: 'Teste Direto de Log',
        old_value: 'Reunião Briefing',
        new_value: 'Agendamentos',
        user_id: user.id,
        user_name: user.name,
        details: 'Teste direto do sistema de log de auditoria'
      });

      if (success) {
        setResult('✅ Log registrado diretamente com sucesso!');
      } else {
        setResult('❌ Falha ao registrar log diretamente');
      }
    } catch (error) {
      setResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
      <h3 className="font-bold text-yellow-800">🔧 Teste de Auditoria</h3>
      
      <div className="flex space-x-2">
        <Button 
          variant="outlined" 
          size="sm" 
          onClick={testCreateSheet}
          loading={loading}
          icon="📋"
        >
          Criar Aba
        </Button>
        
        <Button 
          variant="outlined" 
          size="sm" 
          onClick={testDirectLog}
          loading={loading}
          icon="📝"
          disabled={!user}
        >
          Log Direto
        </Button>
      </div>

      {result && (
        <div className={`p-2 rounded text-sm ${
          result.startsWith('✅') 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {result}
        </div>
      )}

      {!user && (
        <div className="text-xs text-yellow-700">
          ⚠️ Usuário não autenticado - alguns testes podem falhar
        </div>
      )}
    </div>
  );
}
