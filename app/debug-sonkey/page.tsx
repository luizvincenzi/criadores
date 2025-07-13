'use client';

import React, { useState, useEffect } from 'react';

export default function DebugSonkeyPage() {
  const [sonkeyData, setSonkeyData] = useState<any>(null);
  const [slotsTest, setSlotsTest] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadSonkeyData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar dados da planilha
      const dataResponse = await fetch('/api/debug-sonkey-data');
      const dataResult = await dataResponse.json();
      setSonkeyData(dataResult);
      
      // Testar carregamento de slots
      const slotsResponse = await fetch('/api/test-sonkey-slots');
      const slotsResult = await slotsResponse.json();
      setSlotsTest(slotsResult);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSonkeyData();
  }, []);

  const testJourneyModal = async () => {
    try {
      // Simular chamada do modal da jornada
      const response = await fetch('/api/get-creator-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: 'Sonkey',
          mes: 'Julho 2025',
          quantidadeContratada: 6
        })
      });
      
      const result = await response.json();
      alert(`Resultado do teste:\n\nSucesso: ${result.success}\nSlots encontrados: ${result.slots?.length || 0}\nErro: ${result.error || 'Nenhum'}`);
    } catch (error) {
      alert('Erro no teste: ' + error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            🔍 Debug Sonkey Campaign
          </h1>
          <div className="space-x-4">
            <button
              onClick={loadSonkeyData}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Carregando...' : '🔄 Recarregar'}
            </button>
            <button
              onClick={testJourneyModal}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              🧪 Testar Modal Jornada
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <span className="text-gray-600">Carregando dados da planilha...</span>
          </div>
        )}

        {sonkeyData && (
          <div className="space-y-6">
            
            {/* Resumo */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">📊 Resumo dos Dados</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{sonkeyData.data?.totalRows || 0}</div>
                  <div className="text-sm text-blue-800">Total de Linhas</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{sonkeyData.data?.sonkeyCount || 0}</div>
                  <div className="text-sm text-green-800">Linhas da Sonkey</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{sonkeyData.data?.uniqueCampaigns?.length || 0}</div>
                  <div className="text-sm text-purple-800">Campanhas Únicas</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{sonkeyData.data?.uniqueMonths?.length || 0}</div>
                  <div className="text-sm text-orange-800">Meses Únicos</div>
                </div>
              </div>
            </div>

            {/* Estrutura da Planilha */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">📋 Estrutura da Planilha</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-2 text-left">Coluna</th>
                      <th className="px-3 py-2 text-left">Header</th>
                      <th className="px-3 py-2 text-left">Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sonkeyData.data?.headers?.slice(0, 7).map((header: string, index: number) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2 font-mono">{String.fromCharCode(65 + index)}</td>
                        <td className="px-3 py-2 font-medium">{header}</td>
                        <td className="px-3 py-2 text-gray-600">
                          {index === 0 && 'Campaign_ID'}
                          {index === 1 && 'Nome da Campanha/Business'}
                          {index === 2 && 'Nome do Influenciador'}
                          {index === 3 && 'Responsável'}
                          {index === 4 && 'Status da Campanha'}
                          {index === 5 && 'Mês da Campanha'}
                          {index === 6 && 'Data de Fim'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dados da Sonkey */}
            {sonkeyData.data?.sonkeyRows && sonkeyData.data.sonkeyRows.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">🎯 Dados da Sonkey Encontrados</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-3 py-2 text-left">Linha</th>
                        <th className="px-3 py-2 text-left">Campaign ID</th>
                        <th className="px-3 py-2 text-left">Nome Campanha</th>
                        <th className="px-3 py-2 text-left">Influenciador</th>
                        <th className="px-3 py-2 text-left">Status</th>
                        <th className="px-3 py-2 text-left">Mês</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sonkeyData.data.sonkeyRows.map((row: any, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2">{row.linha}</td>
                          <td className="px-3 py-2 font-mono text-xs">{row.campaignId}</td>
                          <td className="px-3 py-2 font-medium">{row.nomeCampanha}</td>
                          <td className="px-3 py-2">{row.influenciador || <span className="text-gray-400 italic">vazio</span>}</td>
                          <td className="px-3 py-2">{row.status}</td>
                          <td className="px-3 py-2">{row.mes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Teste de Slots */}
            {slotsTest && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">🧪 Resultado do Teste de Slots</h2>
                
                {slotsTest.success ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-medium text-green-900 mb-2">✅ Teste Principal</h3>
                      <div className="text-sm text-green-800">
                        <p><strong>Slots encontrados:</strong> {slotsTest.originalTest?.result?.slots?.length || 0}</p>
                        <p><strong>Sucesso:</strong> {slotsTest.originalTest?.result?.success ? 'Sim' : 'Não'}</p>
                        {slotsTest.originalTest?.result?.error && (
                          <p><strong>Erro:</strong> {slotsTest.originalTest.result.error}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-medium text-blue-900 mb-2">📊 Resumo das Variações</h3>
                      <div className="text-sm text-blue-800">
                        <p><strong>Total de variações testadas:</strong> {slotsTest.summary?.totalVariations || 0}</p>
                        <p><strong>Variações bem-sucedidas:</strong> {slotsTest.summary?.successfulVariations || 0}</p>
                        <p><strong>Variações com falha:</strong> {slotsTest.summary?.failedVariations || 0}</p>
                        <p><strong>Máximo de slots encontrados:</strong> {slotsTest.summary?.maxSlotsFound || 0}</p>
                      </div>
                    </div>

                    {slotsTest.variations && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-3 py-2 text-left">Business</th>
                              <th className="px-3 py-2 text-left">Mês</th>
                              <th className="px-3 py-2 text-left">Sucesso</th>
                              <th className="px-3 py-2 text-left">Slots</th>
                              <th className="px-3 py-2 text-left">Erro</th>
                            </tr>
                          </thead>
                          <tbody>
                            {slotsTest.variations.map((variation: any, index: number) => (
                              <tr key={index} className="border-t">
                                <td className="px-3 py-2">{variation.input.businessName}</td>
                                <td className="px-3 py-2">{variation.input.mes}</td>
                                <td className="px-3 py-2">
                                  {variation.success ? (
                                    <span className="text-green-600">✅</span>
                                  ) : (
                                    <span className="text-red-600">❌</span>
                                  )}
                                </td>
                                <td className="px-3 py-2">{variation.slotsFound}</td>
                                <td className="px-3 py-2 text-red-600 text-xs">{variation.error || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="font-medium text-red-900 mb-2">❌ Erro no Teste</h3>
                    <p className="text-sm text-red-800">{slotsTest.error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Links Úteis */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">🔗 Links de Debug</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/api/debug-sonkey-data"
                  target="_blank"
                  className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div className="font-medium text-blue-900">📊 Dados da Planilha</div>
                  <div className="text-sm text-blue-700">Ver dados brutos da Sonkey</div>
                </a>
                
                <a
                  href="/api/test-sonkey-slots"
                  target="_blank"
                  className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="font-medium text-green-900">🧪 Teste de Slots</div>
                  <div className="text-sm text-green-700">Testar carregamento de slots</div>
                </a>
                
                <a
                  href="/jornada"
                  className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="font-medium text-purple-900">📋 Jornada</div>
                  <div className="text-sm text-purple-700">Testar na jornada real</div>
                </a>
                
                <a
                  href="/campaigns"
                  className="block p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <div className="font-medium text-orange-900">📊 Campanhas</div>
                  <div className="text-sm text-orange-700">Ver página de campanhas</div>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
