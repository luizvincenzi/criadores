'use client';

import React, { useState, useEffect } from 'react';

export default function TestStatusPage() {
  const [apiStatus, setApiStatus] = useState({
    creators: { loading: true, success: false, count: 0, error: null },
    campaign: { loading: true, success: false, data: null, error: null }
  });

  useEffect(() => {
    testAPIs();
  }, []);

  const testAPIs = async () => {
    // Testar API de criadores
    try {
      const creatorsResponse = await fetch('/api/supabase/creators/available');
      const creatorsResult = await creatorsResponse.json();
      
      setApiStatus(prev => ({
        ...prev,
        creators: {
          loading: false,
          success: creatorsResult.success,
          count: creatorsResult.total || 0,
          error: creatorsResult.success ? null : creatorsResult.error
        }
      }));
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        creators: {
          loading: false,
          success: false,
          count: 0,
          error: 'Erro de conexão'
        }
      }));
    }

    // Testar API da campanha
    try {
      const campaignResponse = await fetch('/api/campaign/auto-posto-bela-suica/202507');
      const campaignResult = await campaignResponse.json();
      
      setApiStatus(prev => ({
        ...prev,
        campaign: {
          loading: false,
          success: campaignResult.success,
          data: campaignResult.data,
          error: campaignResult.success ? null : campaignResult.error
        }
      }));
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        campaign: {
          loading: false,
          success: false,
          data: null,
          error: 'Erro de conexão'
        }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Status dos Testes - CRM Criadores
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status API de Criadores */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              👥 API de Criadores Disponíveis
              {apiStatus.creators.loading && (
                <div className="ml-2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </h2>
            
            {apiStatus.creators.success ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  ✅ API funcionando perfeitamente!
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {apiStatus.creators.count} criadores disponíveis
                </div>
                <div className="text-sm text-gray-600">
                  Endpoint: <code>/api/supabase/creators/available</code>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  ❌ {apiStatus.creators.error || 'Erro desconhecido'}
                </div>
              </div>
            )}
          </div>
          
          {/* Status API da Campanha */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              🎯 API da Landing Page
              {apiStatus.campaign.loading && (
                <div className="ml-2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </h2>
            
            {apiStatus.campaign.success ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  ✅ API funcionando perfeitamente!
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Empresa:</strong> {apiStatus.campaign.data?.business?.name}</p>
                  <p><strong>Campanha:</strong> {apiStatus.campaign.data?.campaign?.title}</p>
                  <p><strong>Criadores:</strong> {apiStatus.campaign.data?.creators?.length}</p>
                </div>
                <div className="text-sm text-gray-600">
                  Endpoint: <code>/api/campaign/auto-posto-bela-suica/202507</code>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  ❌ {apiStatus.campaign.error || 'Erro desconhecido'}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Resumo dos Problemas Resolvidos */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">✅ Problemas Resolvidos</h2>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Landing Page "Campanha não encontrada"</h3>
                <p className="text-sm text-gray-600">Corrigida busca de business e formato do campo month</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Modal "Criadores Disponíveis (0)"</h3>
                <p className="text-sm text-gray-600">Corrigida estrutura da query e mapeamento de dados do Supabase</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Erro de Compilação Next.js</h3>
                <p className="text-sm text-gray-600">Resolvido com limpeza de cache e reinicialização</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Links de Teste */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Links para Teste</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/campaign/auto-posto-bela-suica/202507"
              target="_blank"
              className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold">Landing Page</div>
              <div className="text-sm text-gray-600">Auto Posto Bela Suíça</div>
            </a>
            
            <a
              href="/test-modal"
              target="_blank"
              className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold">Modal de Criadores</div>
              <div className="text-sm text-gray-600">Teste específico</div>
            </a>
            
            <a
              href="/campaigns"
              target="_blank"
              className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold">Página de Campanhas</div>
              <div className="text-sm text-gray-600">Interface principal</div>
            </a>
            
            <button
              onClick={testAPIs}
              className="block w-full p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-center"
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold">Testar Novamente</div>
              <div className="text-sm text-gray-600">Recarregar status</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
