'use client';

import { useState } from 'react';

export default function TestEditInPlace() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEditInPlace = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Testando edição in-place...');
      
      // 1. Carregar slots atuais
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
      console.log('📊 Slots antes da edição:', slotsResult);

      if (!slotsResult.success) {
        setTestResult({
          error: 'Erro ao carregar slots',
          details: slotsResult
        });
        return;
      }

      // 2. Encontrar um slot vazio para testar
      const emptySlot = slotsResult.slots.find((slot: any) => 
        !slot.influenciador || slot.influenciador.trim() === ''
      );

      if (!emptySlot) {
        setTestResult({
          error: 'Nenhum slot vazio encontrado para testar',
          slots: slotsResult.slots
        });
        return;
      }

      // 3. Testar troca de criador (adicionar criador ao slot vazio)
      const testData = {
        campaignId: 'test-campaign-id',
        businessName: 'Sonkey',
        mes: 'Julho 2025',
        oldCreator: '', // Slot vazio
        newCreator: 'TESTE CRIADOR INPLACE',
        newCreatorData: {
          briefingCompleto: 'Pendente',
          dataHoraVisita: '',
          quantidadeConvidados: '0',
          visitaConfirmada: 'Pendente',
          dataHoraPostagem: '',
          videoAprovado: 'Pendente',
          videoPostado: 'Não'
        },
        user: 'test-inplace@sistema.com'
      };

      console.log('✏️ Testando edição in-place:', testData);

      const editResponse = await fetch('/api/change-campaign-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const editResult = await editResponse.json();
      console.log('📝 Resultado da edição:', editResult);

      // 4. Carregar slots novamente para verificar
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
      console.log('📊 Slots após edição:', newSlotsResult);

      setTestResult({
        success: editResponse.ok,
        status: editResponse.status,
        beforeEdit: {
          slotsCount: slotsResult.slots.length,
          emptySlots: slotsResult.slots.filter((s: any) => !s.influenciador || s.influenciador.trim() === '').length,
          filledSlots: slotsResult.slots.filter((s: any) => s.influenciador && s.influenciador.trim() !== '').length
        },
        afterEdit: {
          slotsCount: newSlotsResult.slots?.length || 0,
          emptySlots: newSlotsResult.slots?.filter((s: any) => !s.influenciador || s.influenciador.trim() === '').length || 0,
          filledSlots: newSlotsResult.slots?.filter((s: any) => s.influenciador && s.influenciador.trim() !== '').length || 0
        },
        editData: testData,
        editResult: editResult,
        wasInPlace: editResult.data?.newCreator?.action === 'edited_existing_slot',
        slotsData: {
          before: slotsResult.slots,
          after: newSlotsResult.slots
        }
      });

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
          🧪 Teste: Edição In-Place de Slots
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ✏️ Teste de Edição In-Place vs Criação de Novas Linhas
          </h2>
          <p className="text-gray-600 mb-4">
            Este teste verifica se o sistema está editando slots vazios existentes em vez de criar novas linhas na planilha.
          </p>
          
          <button
            onClick={testEditInPlace}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? '🔄 Testando...' : '🧪 Testar Edição In-Place'}
          </button>

          <div className="mt-4 text-sm text-gray-600">
            <p><strong>O que este teste faz:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Carrega slots atuais da Sonkey</li>
              <li>Encontra um slot vazio</li>
              <li>Adiciona um criador teste ao slot vazio</li>
              <li>Verifica se foi edição in-place ou nova linha</li>
            </ul>
          </div>
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
                <div className={`border rounded-lg p-4 ${
                  testResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h3 className={`text-lg font-medium mb-2 ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.success ? '✅ Teste Concluído' : '❌ Teste Falhou'}
                  </h3>
                  <p className={testResult.success ? 'text-green-700' : 'text-red-700'}>
                    Status HTTP: {testResult.status}
                  </p>
                  {testResult.wasInPlace !== undefined && (
                    <p className={`text-sm mt-1 ${
                      testResult.wasInPlace ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {testResult.wasInPlace 
                        ? '✅ Edição in-place realizada (slot existente editado)'
                        : '⚠️ Nova linha criada (não foi in-place)'
                      }
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">📊 Antes da Edição</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>Total de slots: {testResult.beforeEdit.slotsCount}</p>
                      <p>Slots vazios: {testResult.beforeEdit.emptySlots}</p>
                      <p>Slots preenchidos: {testResult.beforeEdit.filledSlots}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">📊 Após a Edição</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>Total de slots: {testResult.afterEdit.slotsCount}</p>
                      <p>Slots vazios: {testResult.afterEdit.emptySlots}</p>
                      <p>Slots preenchidos: {testResult.afterEdit.filledSlots}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">🔍 Análise</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Slots totais mudaram:</strong> {
                      testResult.beforeEdit.slotsCount !== testResult.afterEdit.slotsCount 
                        ? `❌ Sim (${testResult.beforeEdit.slotsCount} → ${testResult.afterEdit.slotsCount})` 
                        : '✅ Não (manteve mesmo número)'
                    }</p>
                    <p><strong>Slots vazios diminuíram:</strong> {
                      testResult.beforeEdit.emptySlots > testResult.afterEdit.emptySlots 
                        ? `✅ Sim (${testResult.beforeEdit.emptySlots} → ${testResult.afterEdit.emptySlots})` 
                        : '❌ Não'
                    }</p>
                    <p><strong>Slots preenchidos aumentaram:</strong> {
                      testResult.beforeEdit.filledSlots < testResult.afterEdit.filledSlots 
                        ? `✅ Sim (${testResult.beforeEdit.filledSlots} → ${testResult.afterEdit.filledSlots})` 
                        : '❌ Não'
                    }</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">📋 Dados Completos</h4>
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
          <h3 className="text-lg font-medium text-yellow-800 mb-2">🎯 Resultado Esperado</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Total de slots:</strong> Deve permanecer igual (não criar nova linha)</li>
            <li>• <strong>Slots vazios:</strong> Deve diminuir em 1</li>
            <li>• <strong>Slots preenchidos:</strong> Deve aumentar em 1</li>
            <li>• <strong>Ação:</strong> Deve ser "edited_existing_slot"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
