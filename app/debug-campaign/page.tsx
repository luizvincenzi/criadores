'use client';

import React, { useState } from 'react';

export default function DebugCampaignPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testCampaignSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug-campaign-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: 'camp_1752358474605_1_boussol_jun_pietramantovani',
          businessName: 'Boussolé',
          mes: 'Jul',
          influenciador: 'Pietra Mantovani'
        })
      });
      
      const result = await response.json();
      setResults({ type: 'search', data: result });
    } catch (error) {
      setResults({ type: 'error', data: error });
    } finally {
      setLoading(false);
    }
  };

  const testCampaignUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-campaign-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: 'camp_1752358474605_1_boussol_jun_pietramantovani',
          businessName: 'Boussolé',
          mes: 'Jul',
          influenciador: 'Pietra Mantovani'
        })
      });
      
      const result = await response.json();
      setResults({ type: 'update', data: result });
    } catch (error) {
      setResults({ type: 'error', data: error });
    } finally {
      setLoading(false);
    }
  };

  const setupCampaignColumns = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/setup-campaign-columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      setResults({ type: 'setup', data: result });
    } catch (error) {
      setResults({ type: 'error', data: error });
    } finally {
      setLoading(false);
    }
  };

  const testCampaignIds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-campaign-ids');
      const result = await response.json();
      setResults({ type: 'ids', data: result });
    } catch (error) {
      setResults({ type: 'error', data: error });
    } finally {
      setLoading(false);
    }
  };

  const testCreatorChange = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-creator-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: 'camp_1752358474605_1_boussol_jun_pietramantovani',
          businessName: 'Boussolé',
          mes: 'Jul',
          oldCreator: 'Pietra Mantovani',
          newCreator: 'João Silva'
        })
      });

      const result = await response.json();
      setResults({ type: 'creator-change', data: result });
    } catch (error) {
      setResults({ type: 'error', data: error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔧 Debug de Campanhas - Campaign_ID
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Botões de Teste */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">🧪 Testes Disponíveis</h2>
            
            <div className="space-y-4">
              <button
                onClick={setupCampaignColumns}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                🔧 Configurar Colunas Campaign_ID
              </button>

              <button
                onClick={testCampaignIds}
                disabled={loading}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                🆔 Testar Campaign_IDs na Jornada
              </button>

              <button
                onClick={testCampaignSearch}
                disabled={loading}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                🔍 Testar Busca de Campanha
              </button>

              <button
                onClick={testCampaignUpdate}
                disabled={loading}
                className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                ✏️ Testar Atualização de Campanha
              </button>

              <button
                onClick={testCreatorChange}
                disabled={loading}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                🔄 Testar Troca de Criador
              </button>
            </div>

            {loading && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Executando teste...
                </div>
              </div>
            )}
          </div>

          {/* Informações do Teste */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">📋 Dados de Teste</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Campaign_ID:</span>
                <br />
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  camp_1752358474605_1_boussol_jun_pietramantovani
                </code>
              </div>
              
              <div>
                <span className="font-medium">Business:</span> Boussolé
              </div>
              
              <div>
                <span className="font-medium">Mês:</span> Jul
              </div>
              
              <div>
                <span className="font-medium">Influenciador:</span> Pietra Mantovani
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">🎯 Objetivo dos Testes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Verificar se Campaign_ID está sendo passado corretamente</li>
                <li>• Testar busca por Campaign_ID + Influenciador</li>
                <li>• Validar fallback por Business + Mês + Influenciador</li>
                <li>• Confirmar que atualizações funcionam</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {results && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              📊 Resultados do Teste: {results.type}
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                {JSON.stringify(results.data, null, 2)}
              </pre>
            </div>

            {results.data.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-green-800 font-medium">
                    Teste executado com sucesso!
                  </span>
                </div>
              </div>
            )}

            {results.data.success === false && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✗</span>
                  </div>
                  <span className="text-red-800 font-medium">
                    Erro no teste: {results.data.error}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Links Úteis */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">🔗 Links Úteis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/jornada"
              className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-900">📋 Jornada das Campanhas</div>
              <div className="text-sm text-blue-700">Testar edição de criadores</div>
            </a>
            
            <a
              href="/campaigns"
              className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="font-medium text-green-900">📊 Campanhas</div>
              <div className="text-sm text-green-700">Ver landing pages</div>
            </a>
            
            <a
              href="/api/test-campaign-ids"
              target="_blank"
              className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="font-medium text-purple-900">🆔 API Campaign_IDs</div>
              <div className="text-sm text-purple-700">Verificar IDs na jornada</div>
            </a>
            
            <a
              href="/dashboard"
              className="block p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="font-medium text-orange-900">📈 Dashboard</div>
              <div className="text-sm text-orange-700">Ver estatísticas</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
