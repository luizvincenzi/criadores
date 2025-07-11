'use client';

import React, { useState } from 'react';
import Button from './ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function TestBusinessUpdate() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const testBusinessUpdate = async () => {
    if (!user) {
      setResult('❌ Usuário não autenticado');
      return;
    }

    setLoading(true);
    setResult('🚀 Testando atualização de business...');

    try {
      // Simula uma mudança de status que deve atualizar tanto o audit_log quanto a aba Business
      const testData = {
        action: 'test_log_entry',
        data: {
          action: 'business_stage_changed',
          entity_type: 'business',
          entity_id: `test_business_${Date.now()}`,
          entity_name: 'Loja de Roupas Fashion', // Nome que deve existir na aba Business
          old_value: 'Reunião Briefing',
          new_value: 'Agendamentos',
          user_id: user.id,
          user_name: user.name,
          details: `Teste de atualização automática - ${new Date().toLocaleString()}`
        }
      };

      console.log('📤 Testando atualização de business:', testData);

      const response = await fetch('/api/test-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📋 Resultado do teste:', result);

      if (result.success) {
        setResult(`✅ Sucesso! 
📝 Log inserido: ${result.logId}
🔄 Business atualizado: ${result.businessUpdated ? 'Sim' : 'Não'}

Verifique:
1. Aba "Audit_Log" - nova linha adicionada
2. Aba "Business" - status atualizado para "Agendamentos"`);
      } else {
        setResult(`❌ Falha: ${result.error}`);
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      setResult(`❌ Erro: ${errorMsg}`);
      console.error('❌ ERRO NO TESTE:', error);
    } finally {
      setLoading(false);
    }
  };

  const testWithDifferentBusiness = async () => {
    if (!user) {
      setResult('❌ Usuário não autenticado');
      return;
    }

    setLoading(true);
    setResult('🚀 Testando com business diferente...');

    try {
      const testData = {
        action: 'test_log_entry',
        data: {
          action: 'business_stage_changed',
          entity_type: 'business',
          entity_id: `test_business_2_${Date.now()}`,
          entity_name: 'Agência de Marketing Digital', // Outro nome que pode existir
          old_value: 'Agendamentos',
          new_value: 'Entrega Final',
          user_id: user.id,
          user_name: user.name,
          details: `Teste com business diferente - ${new Date().toLocaleString()}`
        }
      };

      const response = await fetch('/api/test-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });

      const result = await response.json();

      if (result.success) {
        setResult(`✅ Teste 2 concluído!
📝 Log: ${result.logId}
🔄 Business atualizado: ${result.businessUpdated ? 'Sim' : 'Não'}`);
      } else {
        setResult(`❌ Falha: ${result.error}`);
      }

    } catch (error) {
      setResult(`❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
      <h3 className="font-bold text-orange-800 mb-4">🔄 Teste de Atualização de Business</h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <Button 
          variant="outlined" 
          size="sm" 
          onClick={testBusinessUpdate}
          loading={loading}
          icon="🧪"
          disabled={!user}
        >
          Testar Atualização
        </Button>
        
        <Button 
          variant="outlined" 
          size="sm" 
          onClick={testWithDifferentBusiness}
          loading={loading}
          icon="🎯"
          disabled={!user}
        >
          Teste Business 2
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
        <div className="text-xs text-orange-700 mt-2">
          ⚠️ Faça login para testar atualização
        </div>
      )}

      <div className="mt-4 p-3 bg-white rounded border text-xs text-gray-600">
        <strong>Como funciona:</strong><br/>
        1. Registra mudança no Audit_Log<br/>
        2. Busca o business na aba "Business" pelo nome<br/>
        3. Atualiza o status na coluna B<br/>
        4. Confirma a atualização
      </div>
    </div>
  );
}
