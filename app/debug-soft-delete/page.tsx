'use client';

import { useState } from 'react';

export default function DebugSoftDelete() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSoftDelete = async () => {
    setLoading(true);
    try {
      // Primeiro, carregar slots atuais
      console.log('🔍 1. Carregando slots atuais...');
      const slotsResponse = await fetch('/api/get-creator-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: 'Sonkey',
          mes: 'Julho 2025',
          quantidadeContratada: 6
        })
      });

      const slotsResult = await slotsResponse.json();
      console.log('📊 Slots atuais:', slotsResult);

      if (!slotsResult.success) {
        setTestResult({
          error: 'Erro ao carregar slots',
          details: slotsResult
        });
        return;
      }

      // Simular remoção de um criador (se houver)
      if (slotsResult.slots && slotsResult.slots.length > 1) {
        console.log('🗑️ 2. Testando soft delete...');
        
        const creatorToRemove = slotsResult.slots.find((slot: any) => 
          slot.influenciador && slot.influenciador.trim() !== ''
        ) || slotsResult.slots[0];

        const removeResponse = await fetch('/api/remove-campaign-creator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: 'Sonkey',
            mes: 'Julho 2025',
            creatorData: {
              influenciador: creatorToRemove.influenciador || ''
            },
            user: 'debug-test@sistema.com'
          })
        });

        const removeResult = await removeResponse.json();
        console.log('🗑️ Resultado da remoção:', removeResult);

        // Carregar slots novamente para verificar
        console.log('🔍 3. Verificando slots após remoção...');
        const newSlotsResponse = await fetch('/api/get-creator-slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: 'Sonkey',
            mes: 'Julho 2025',
            quantidadeContratada: 6
          })
        });

        const newSlotsResult = await newSlotsResponse.json();
        console.log('📊 Slots após remoção:', newSlotsResult);

        setTestResult({
          success: true,
          originalSlots: slotsResult.slots.length,
          removedCreator: creatorToRemove.influenciador || 'Slot vazio',
          removeResult: removeResult,
          newSlots: newSlotsResult.slots?.length || 0,
          slotsData: {
            before: slotsResult.slots,
            after: newSlotsResult.slots
          }
        });
      } else {
        setTestResult({
          error: 'Não há slots suficientes para testar remoção',
          slotsCount: slotsResult.slots?.length || 0
        });
      }

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setTestResult({
        error: 'Erro durante o teste',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Debug: Sistema de Soft Delete
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🛡️ Teste do Sistema de Soft Delete
          </h2>
          <p className="text-gray-600 mb-4">
            Este teste verifica se o sistema está marcando criadores como inativos em vez de deletar fisicamente.
          </p>
          
          <button
            onClick={testSoftDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? '🔄 Testando...' : '🗑️ Testar Soft Delete'}
          </button>
        </div>

        {testResult && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📊 Resultado do Teste
            </h2>

            {testResult.error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-800 mb-2">❌ Erro</h3>
                <p className="text-red-700">{testResult.error}</p>
                {testResult.details && (
                  <pre className="mt-2 text-sm text-red-600 bg-red-100 p-2 rounded overflow-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-800 mb-2">✅ Teste Concluído</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-green-700">Slots Originais:</label>
                      <p className="text-green-600">{testResult.originalSlots}</p>
                    </div>
                    <div>
                      <label className="font-medium text-green-700">Slots Após Remoção:</label>
                      <p className="text-green-600">{testResult.newSlots}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="font-medium text-green-700">Criador Removido:</label>
                      <p className="text-green-600">{testResult.removedCreator}</p>
                    </div>
                  </div>
                </div>

                {testResult.removeResult && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-800 mb-2">🔧 Detalhes da Remoção</h3>
                    <div className="text-sm space-y-2">
                      <div>
                        <label className="font-medium text-blue-700">Ação:</label>
                        <p className="text-blue-600">{testResult.removeResult.action}</p>
                      </div>
                      <div>
                        <label className="font-medium text-blue-700">Mensagem:</label>
                        <p className="text-blue-600">{testResult.removeResult.message}</p>
                      </div>
                      <div>
                        <label className="font-medium text-blue-700">Nota:</label>
                        <p className="text-blue-600">{testResult.removeResult.note}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">📋 Dados Completos</h3>
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                      Ver dados detalhados
                    </summary>
                    <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto max-h-96">
                      {JSON.stringify(testResult, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">⚠️ Importante</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Este teste marca um criador como "Inativo" na planilha</li>
            <li>• Os dados NÃO são deletados fisicamente</li>
            <li>• O criador desaparece da interface mas permanece na planilha</li>
            <li>• Todas as ações são registradas no audit_log</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
