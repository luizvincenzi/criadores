'use client';

import React, { useState } from 'react';
import Button from './ui/Button';

export default function TestGoogleConnection() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`${timestamp}: ${message}`, ...prev]);
    console.log(message);
  };

  const testConnection = async () => {
    setLoading(true);
    setLogs([]);
    addLog('🚀 Iniciando teste de conexão com Google Sheets...');

    try {
      // Teste 1: Verificar variáveis de ambiente
      addLog('📋 Verificando variáveis de ambiente...');
      
      const envVars = {
        GOOGLE_PROJECT_ID: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID || 'Não definido',
        GOOGLE_SPREADSHEET_ID: process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID || 'Não definido',
        GOOGLE_CLIENT_EMAIL: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL || 'Não definido'
      };

      addLog(`📊 Spreadsheet ID: ${envVars.GOOGLE_SPREADSHEET_ID}`);
      addLog(`📧 Client Email: ${envVars.GOOGLE_CLIENT_EMAIL}`);

      // Teste 2: Tentar acessar a planilha
      addLog('🔗 Testando acesso à planilha...');
      
      const response = await fetch('/api/test-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test_connection' })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        addLog('✅ Conexão com Google Sheets estabelecida!');
        addLog(`📋 Planilha encontrada: ${result.title || 'Sem título'}`);
        
        if (result.sheets && result.sheets.length > 0) {
          addLog(`📄 Abas encontradas: ${result.sheets.join(', ')}`);
        }
      } else {
        addLog(`❌ Falha na conexão: ${result.error}`);
      }

    } catch (error) {
      addLog(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuditSheet = async () => {
    setLoading(true);
    addLog('🧪 Testando criação da aba Audit_Log...');

    try {
      const response = await fetch('/api/test-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create_audit_sheet' })
      });

      const result = await response.json();
      
      if (result.success) {
        addLog('✅ Aba Audit_Log criada/verificada com sucesso!');
      } else {
        addLog(`❌ Falha ao criar aba: ${result.error}`);
      }

    } catch (error) {
      addLog(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogEntry = async () => {
    setLoading(true);
    addLog('📝 Testando inserção de log...');

    try {
      const response = await fetch('/api/test-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'test_log_entry',
          data: {
            action: 'test_connection',
            entity_type: 'system',
            entity_id: 'test_' + Date.now(),
            entity_name: 'Teste de Conexão',
            user_id: '1',
            user_name: 'Teste User',
            details: 'Teste de inserção de log via API'
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        addLog('✅ Log inserido com sucesso na planilha!');
      } else {
        addLog(`❌ Falha ao inserir log: ${result.error}`);
      }

    } catch (error) {
      addLog(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-green-800">🔗 Teste de Conexão Google Sheets</h3>
        <div className="flex space-x-2">
          <Button 
            variant="outlined" 
            size="sm" 
            onClick={testConnection}
            loading={loading}
            icon="🔗"
          >
            Testar Conexão
          </Button>
          <Button 
            variant="outlined" 
            size="sm" 
            onClick={testAuditSheet}
            loading={loading}
            icon="📋"
          >
            Criar Aba
          </Button>
          <Button 
            variant="outlined" 
            size="sm" 
            onClick={testLogEntry}
            loading={loading}
            icon="📝"
          >
            Testar Log
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

      <div className="bg-white rounded border p-3 max-h-60 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-sm">Clique em "Testar Conexão" para verificar a integração...</div>
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
