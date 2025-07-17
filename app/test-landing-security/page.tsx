'use client';

import React, { useState } from 'react';

export default function TestLandingSecurityPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const securityTests = [
    {
      name: 'Teste 1: URL Válida (Auto Posto Bela Suíça)',
      businessSlug: 'auto-posto-bela-suica',
      monthSlug: '202507',
      expectedResult: 'success',
      description: 'Deve carregar dados da campanha correta'
    },
    {
      name: 'Teste 2: Business Inexistente',
      businessSlug: 'empresa-que-nao-existe',
      monthSlug: '202507',
      expectedResult: 'error',
      description: 'Deve retornar erro de empresa não encontrada'
    },
    {
      name: 'Teste 3: Mês Inexistente',
      businessSlug: 'auto-posto-bela-suica',
      monthSlug: '202599',
      expectedResult: 'error',
      description: 'Deve retornar erro de campanha não encontrada'
    },
    {
      name: 'Teste 4: Slug Malformado',
      businessSlug: 'auto--posto--bela--suica',
      monthSlug: '202507',
      expectedResult: 'success',
      description: 'Deve funcionar mesmo com slug malformado'
    },
    {
      name: 'Teste 5: Caracteres Especiais',
      businessSlug: 'auto-posto-bela-suíça',
      monthSlug: '202507',
      expectedResult: 'success',
      description: 'Deve funcionar com acentos no slug'
    }
  ];

  const runSecurityTests = async () => {
    setLoading(true);
    const results = [];

    for (const test of securityTests) {
      console.log(`🧪 Executando: ${test.name}`);
      
      try {
        const startTime = Date.now();
        const response = await fetch(`/api/campaign/${test.businessSlug}/${test.monthSlug}`);
        const result = await response.json();
        const endTime = Date.now();
        
        const testResult = {
          ...test,
          actualResult: result.success ? 'success' : 'error',
          passed: (result.success && test.expectedResult === 'success') || (!result.success && test.expectedResult === 'error'),
          responseTime: endTime - startTime,
          error: result.error || null,
          data: result.success ? {
            business: result.data?.business?.name,
            campaign: result.data?.campaign?.title,
            creators: result.data?.creators?.length
          } : null
        };
        
        results.push(testResult);
        console.log(`${testResult.passed ? '✅' : '❌'} ${test.name}: ${testResult.passed ? 'PASSOU' : 'FALHOU'}`);
        
      } catch (error) {
        results.push({
          ...test,
          actualResult: 'error',
          passed: test.expectedResult === 'error',
          responseTime: 0,
          error: 'Erro de conexão',
          data: null
        });
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  const generateTestUrl = async () => {
    try {
      const response = await fetch('/api/generate-campaign-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: 'Auto Posto Bela Suíça',
          month: '202507'
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ URL Gerada:\n\n${result.data.campaignUrl}\n\nSlug Business: ${result.data.businessSlug}\nSlug Mês: ${result.data.monthSlug}`);
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Erro ao gerar URL');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔒 Teste de Segurança das Landing Pages
        </h1>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Testes de Segurança</h2>
              <p className="text-gray-600">Verifica se as landing pages só mostram dados corretos</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={generateTestUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔗 Gerar URL de Teste
              </button>
              <button
                onClick={runSecurityTests}
                disabled={loading}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Testando...' : '🧪 Executar Testes'}
              </button>
            </div>
          </div>
        </div>

        {/* Resultados dos Testes */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Resultados dos Testes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.filter(t => t.passed).length}
                </div>
                <div className="text-sm text-gray-600">Testes Passaram</div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.filter(t => !t.passed).length}
                </div>
                <div className="text-sm text-gray-600">Testes Falharam</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((testResults.filter(t => t.passed).length / testResults.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Taxa de Sucesso</div>
              </div>
            </div>

            <div className="space-y-4">
              {testResults.map((test, index) => (
                <div key={index} className={`border rounded-lg p-4 ${test.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">
                      {test.passed ? '✅' : '❌'} {test.name}
                    </h3>
                    <span className="text-sm text-gray-500">{test.responseTime}ms</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>URL:</strong> /campaign/{test.businessSlug}/{test.monthSlug}</p>
                      <p><strong>Esperado:</strong> {test.expectedResult}</p>
                      <p><strong>Resultado:</strong> {test.actualResult}</p>
                    </div>
                    
                    <div>
                      {test.data && (
                        <>
                          <p><strong>Business:</strong> {test.data.business}</p>
                          <p><strong>Campanha:</strong> {test.data.campaign}</p>
                          <p><strong>Criadores:</strong> {test.data.creators}</p>
                        </>
                      )}
                      {test.error && (
                        <p className="text-red-600"><strong>Erro:</strong> {test.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações de Segurança */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔒 Medidas de Segurança Implementadas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-600 mb-2">✅ Validações Implementadas</h3>
              <ul className="text-sm space-y-1">
                <li>• Busca rigorosa por business ID</li>
                <li>• Validação exata de mês/ano da campanha</li>
                <li>• Verificação de organização (organization_id)</li>
                <li>• Logs detalhados para auditoria</li>
                <li>• Tratamento de erros específicos</li>
                <li>• Validação de URL antes da geração</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-600 mb-2">🛡️ Proteções de Dados</h3>
              <ul className="text-sm space-y-1">
                <li>• Apenas dados da campanha correta são exibidos</li>
                <li>• Criadores filtrados por campaign_id específico</li>
                <li>• Informações sensíveis protegidas por validação</li>
                <li>• URLs malformadas são rejeitadas</li>
                <li>• Fallbacks seguros para dados não encontrados</li>
                <li>• Debug limitado em produção</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Importante</h3>
            <p className="text-yellow-700 text-sm">
              Cada landing page deve sempre apontar para a campanha exata correspondente ao business e mês especificados. 
              Nunca exibir dados de outras campanhas ou businesses, mesmo em caso de erro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
