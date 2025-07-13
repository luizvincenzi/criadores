'use client';

import { useState } from 'react';

export default function DebugRemoveAPI() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRemoveAPI = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      console.log('🧪 Testando API de remoção...');
      
      // Primeiro, carregar slots para ver o que temos
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

      // Testar remoção com dados específicos
      const testData = {
        businessName: 'Sonkey',
        mes: 'Julho 2025',
        creatorData: {
          influenciador: 'Teste Criador'
        },
        user: 'debug-test@sistema.com'
      };

      console.log('🗑️ Enviando dados para remoção:', testData);

      const removeResponse = await fetch('/api/remove-campaign-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      console.log('📡 Status da resposta:', removeResponse.status);
      
      let removeResult;
      try {
        removeResult = await removeResponse.json();
      } catch (parseError) {
        removeResult = {
          error: 'Erro ao fazer parse da resposta',
          status: removeResponse.status,
          statusText: removeResponse.statusText
        };
      }

      console.log('📋 Resultado da remoção:', removeResult);

      setTestResult({
        success: removeResponse.ok,
        status: removeResponse.status,
        slotsData: slotsResult,
        removeData: testData,
        removeResult: removeResult,
        logs: 'Verifique o console do navegador para logs detalhados'
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

  const testWithRealCreator = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      // Carregar slots primeiro
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
      
      if (!slotsResult.success || !slotsResult.slots || slotsResult.slots.length === 0) {
        setTestResult({
          error: 'Nenhum slot encontrado para testar',
          slotsResult
        });
        return;
      }

      // Encontrar um criador real para testar
      const realCreator = slotsResult.slots.find((slot: any) => 
        slot.influenciador && slot.influenciador.trim() !== ''
      );

      if (!realCreator) {
        setTestResult({
          error: 'Nenhum criador real encontrado nos slots',
          slots: slotsResult.slots
        });
        return;
      }

      const testData = {
        businessName: 'Sonkey',
        mes: 'Julho 2025',
        creatorData: {
          influenciador: realCreator.influenciador
        },
        user: 'debug-real-test@sistema.com'
      };

      console.log('🗑️ Testando remoção de criador real:', testData);

      const removeResponse = await fetch('/api/remove-campaign-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const removeResult = await removeResponse.json();

      setTestResult({
        success: removeResponse.ok,
        status: removeResponse.status,
        realCreatorTest: true,
        slotsData: slotsResult,
        removeData: testData,
        removeResult: removeResult
      });

    } catch (error) {
      console.error('❌ Erro no teste com criador real:', error);
      setTestResult({
        error: 'Erro durante o teste com criador real',
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
          🔍 Debug: API de Remoção
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            🧪 Testes da API remove-campaign-creator
          </h2>
          
          <div className="space-y-4">
            <button
              onClick={testRemoveAPI}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 mr-4"
            >
              {loading ? '🔄 Testando...' : '🧪 Testar com Dados Fictícios'}
            </button>

            <button
              onClick={testWithRealCreator}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? '🔄 Testando...' : '🎯 Testar com Criador Real'}
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p><strong>Teste 1:</strong> Usa dados fictícios para verificar validação</p>
            <p><strong>Teste 2:</strong> Usa um criador real dos slots da Sonkey</p>
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
                    {testResult.success ? '✅ Sucesso' : '❌ Falha'}
                  </h3>
                  <p className={testResult.success ? 'text-green-700' : 'text-red-700'}>
                    Status HTTP: {testResult.status}
                  </p>
                  {testResult.realCreatorTest && (
                    <p className="text-blue-600 text-sm mt-1">
                      🎯 Teste realizado com criador real
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">📤 Dados Enviados</h4>
                    <pre className="text-xs text-gray-600 bg-white p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(testResult.removeData, null, 2)}
                    </pre>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">📥 Resposta da API</h4>
                    <pre className="text-xs text-gray-600 bg-white p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(testResult.removeResult, null, 2)}
                    </pre>
                  </div>
                </div>

                {testResult.slotsData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">📊 Slots Disponíveis</h4>
                    <p className="text-blue-700 text-sm mb-2">
                      Total: {testResult.slotsData.slots?.length || 0} slots
                    </p>
                    <details className="text-sm">
                      <summary className="cursor-pointer font-medium text-blue-700 hover:text-blue-900">
                        Ver slots detalhados
                      </summary>
                      <pre className="mt-2 text-xs text-blue-600 bg-blue-100 p-2 rounded overflow-auto max-h-60">
                        {JSON.stringify(testResult.slotsData.slots, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">💡 Dica</h4>
              <p className="text-yellow-700 text-sm">
                Abra o Console do Navegador (F12) para ver logs detalhados da API
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
