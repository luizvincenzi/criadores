'use client';

import React, { useState, useEffect } from 'react';

export default function TestLandingPage() {
  const [campaignData, setCampaignData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testCampaignAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/campaign/auto-posto-bela-suica/202507');
      const result = await response.json();
      
      if (result.success) {
        setCampaignData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erro ao carregar dados da campanha');
    } finally {
      setLoading(false);
    }
  };

  const testCreatorsAPI = async () => {
    try {
      const response = await fetch('/api/supabase/creators/available');
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ API de Criadores: ${result.total} criadores disponíveis`);
      } else {
        alert(`❌ Erro na API de Criadores: ${result.error}`);
      }
    } catch (err) {
      alert(`❌ Erro ao testar API de Criadores: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Teste da Landing Page da Campanha
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teste da API da Campanha */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">API da Campanha</h2>
            
            <button
              onClick={testCampaignAPI}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
            >
              {loading ? 'Carregando...' : '🧪 Testar API da Campanha'}
            </button>
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
                ❌ {error}
              </div>
            )}
            
            {campaignData && (
              <div className="space-y-3">
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  ✅ Campanha carregada com sucesso!
                </div>
                
                <div className="text-sm space-y-2">
                  <p><strong>Empresa:</strong> {campaignData.business.name}</p>
                  <p><strong>Campanha:</strong> {campaignData.campaign.title}</p>
                  <p><strong>Status:</strong> {campaignData.campaign.status}</p>
                  <p><strong>Criadores:</strong> {campaignData.creators.length}</p>
                  <p><strong>Mês:</strong> {campaignData.campaign.month}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Teste da API de Criadores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">API de Criadores</h2>
            
            <button
              onClick={testCreatorsAPI}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mb-4"
            >
              🧪 Testar API de Criadores
            </button>
            
            <div className="text-sm text-gray-600">
              <p>Esta API deve retornar 57 criadores disponíveis para seleção.</p>
            </div>
          </div>
        </div>
        
        {/* Links de Teste */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Links de Teste</h2>
          
          <div className="space-y-3">
            <a
              href="/campaign/auto-posto-bela-suica/202507"
              target="_blank"
              className="block p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              🔗 Landing Page da Campanha (Auto Posto Bela Suíça)
            </a>
            
            <a
              href="/campaigns"
              target="_blank"
              className="block p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              🔗 Página de Campanhas (para testar modal)
            </a>
            
            <a
              href="/test-modal"
              target="_blank"
              className="block p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              🔗 Teste Específico do Modal de Criadores
            </a>
          </div>
        </div>
        
        {/* Status das Correções */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Status das Correções</h2>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>✅ API de criadores disponíveis corrigida (57 criadores)</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>✅ API da landing page corrigida (busca por business)</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>✅ Erro de compilação resolvido (cache limpo)</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>✅ Servidor rodando na porta 3005</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
