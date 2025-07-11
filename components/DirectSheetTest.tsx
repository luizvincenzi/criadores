'use client';

import React, { useState } from 'react';
import Button from './ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function DirectSheetTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const testDirectInsert = async () => {
    if (!user) {
      setResult('❌ Usuário não autenticado');
      return;
    }

    setLoading(true);
    setResult('🚀 Testando inserção direta...');

    try {
      console.log('📝 Iniciando teste de inserção direta na planilha...');
      
      const testData = {
        action: 'test_log_entry',
        data: {
          action: 'business_stage_changed',
          entity_type: 'business',
          entity_id: `test_direct_${Date.now()}`,
          entity_name: 'Teste Direto de Inserção',
          old_value: 'Reunião Briefing',
          new_value: 'Agendamentos',
          user_id: user.id,
          user_name: user.name,
          details: `Teste direto de inserção - ${new Date().toLocaleString()}`
        }
      };

      console.log('📤 Enviando dados:', testData);

      const response = await fetch('/api/test-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      console.log('📥 Resposta recebida:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📋 Resultado:', result);

      if (result.success) {
        setResult(`✅ Sucesso! Log inserido com ID: ${result.logId}`);
        console.log('✅ INSERÇÃO BEM-SUCEDIDA!');
      } else {
        setResult(`❌ Falha: ${result.error}`);
        console.error('❌ FALHA NA INSERÇÃO:', result.error);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setResult(`❌ Erro: ${errorMsg}`);
      console.error('❌ ERRO NO TESTE:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSheetStructure = async () => {
    setLoading(true);
    setResult('🔍 Verificando estrutura da planilha...');

    try {
      const response = await fetch('/api/test-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'test_connection' })
      });

      const result = await response.json();

      if (result.success) {
        const hasAuditLog = result.sheets.includes('Audit_Log');
        setResult(`✅ Planilha: ${result.title}\n📄 Abas: ${result.sheets.join(', ')}\n${hasAuditLog ? '✅' : '❌'} Aba Audit_Log: ${hasAuditLog ? 'Existe' : 'Não encontrada'}`);
      } else {
        setResult(`❌ Erro: ${result.error}`);
      }

    } catch (error) {
      setResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const createAuditSheet = async () => {
    setLoading(true);
    setResult('📋 Criando aba Audit_Log...');

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
        setResult(`✅ ${result.message}`);
      } else {
        setResult(`❌ Erro: ${result.error}`);
      }

    } catch (error) {
      setResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h3 className="font-bold text-purple-800 mb-4">🧪 Teste Direto da Planilha</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant="outlined" 
          size="sm" 
          onClick={checkSheetStructure}
          loading={loading}
          icon="🔍"
        >
          Verificar Estrutura
        </Button>
        
        <Button 
          variant="outlined" 
          size="sm" 
          onClick={createAuditSheet}
          loading={loading}
          icon="📋"
        >
          Criar Aba Audit_Log
        </Button>
        
        <Button 
          variant="outlined" 
          size="sm" 
          onClick={testDirectInsert}
          loading={loading}
          icon="📝"
          disabled={!user}
        >
          Inserir Teste
        </Button>
      </div>

      {result && (
        <div className={`p-3 rounded text-sm whitespace-pre-line ${
          result.startsWith('✅') 
            ? 'bg-green-100 text-green-800' 
            : result.startsWith('❌')
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {result}
        </div>
      )}

      {!user && (
        <div className="text-xs text-purple-700 mt-2">
          ⚠️ Faça login para testar inserção
        </div>
      )}
    </div>
  );
}
