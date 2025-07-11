'use client';

import React, { useState } from 'react';
import Button from './ui/Button';

export default function SimpleAuditTest() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev]);
  };

  const testFullFlow = async () => {
    addLog('🚀 Iniciando teste completo...');

    try {
      // Passo 1: Verificar autenticação
      const { useAuthStore } = await import('@/store/authStore');
      const authStore = useAuthStore.getState();
      
      if (!authStore.user) {
        addLog('❌ Usuário não autenticado');
        return;
      }
      
      addLog(`✅ Usuário autenticado: ${authStore.user.name}`);

      // Passo 2: Criar aba de auditoria
      addLog('📋 Criando/verificando aba Audit_Log...');
      const { createAuditLogSheet } = await import('@/app/actions/sheetsActions');
      const sheetCreated = await createAuditLogSheet();
      
      if (!sheetCreated) {
        addLog('❌ Falha ao criar aba Audit_Log');
        return;
      }
      
      addLog('✅ Aba Audit_Log criada/verificada');

      // Passo 3: Registrar log de teste
      addLog('📝 Registrando log de teste...');
      const { logAction } = await import('@/app/actions/sheetsActions');
      
      const testEntry = {
        action: 'business_stage_changed' as const,
        entity_type: 'business',
        entity_id: `test_${Date.now()}`,
        entity_name: 'Teste de Drag & Drop',
        old_value: 'Reunião Briefing',
        new_value: 'Agendamentos',
        user_id: authStore.user.id,
        user_name: authStore.user.name,
        details: 'Teste completo do sistema de auditoria'
      };

      const logSuccess = await logAction(testEntry);
      
      if (logSuccess) {
        addLog('✅ Log registrado com sucesso na planilha!');
        addLog('🎯 Agora teste o drag & drop no Kanban');
      } else {
        addLog('❌ Falha ao registrar log na planilha');
      }

    } catch (error) {
      addLog(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      console.error('Erro no teste:', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-blue-800">🧪 Teste Completo de Auditoria</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outlined" 
            size="sm" 
            onClick={testFullFlow}
            icon="🚀"
          >
            Testar Tudo
          </Button>
          <Button 
            variant="text" 
            size="sm" 
            onClick={clearLogs}
            icon="🗑️"
          >
            Limpar
          </Button>
        </div>
      </div>

      <div className="bg-white rounded border p-3 max-h-40 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-sm">Clique em "Testar Tudo" para iniciar...</div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
