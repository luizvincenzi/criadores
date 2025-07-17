'use client';

import React, { useState, useEffect } from 'react';

interface CampaignValidation {
  campaignId: string;
  campaignTitle: string;
  businessName: string;
  month: string;
  businessSlug: string;
  monthSlug: string;
  landingUrl: string;
  isWorking: boolean;
  error: string | null;
  createdAt: string;
}

interface ValidationSummary {
  totalCampaigns: number;
  workingCampaigns: number;
  brokenCampaigns: number;
  successRate: number;
}

export default function TestLandingValidationPage() {
  const [validationData, setValidationData] = useState<{
    summary: ValidationSummary;
    campaigns: CampaignValidation[];
    brokenCampaigns: CampaignValidation[];
    workingCampaigns: CampaignValidation[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateLandingPages = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Iniciando validação de landing pages...');

      const response = await fetch('/api/validate-landing-pages');
      const result = await response.json();

      if (result.success) {
        setValidationData(result.data);
        console.log('✅ Validação concluída:', result.data.summary);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('❌ Erro na validação:', err);
      setError('Erro ao validar landing pages');
    } finally {
      setLoading(false);
    }
  };

  const fixCampaign = async (campaignId: string) => {
    try {
      const response = await fetch('/api/validate-landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fix-campaign', campaignId })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Campanha corrigida! URL: ${result.data.landingUrl}`);
        // Revalidar após correção
        validateLandingPages();
      } else {
        alert(`❌ Erro ao corrigir: ${result.error}`);
      }
    } catch (err) {
      alert('❌ Erro ao corrigir campanha');
    }
  };

  useEffect(() => {
    validateLandingPages();
  }, []);

  if (loading && !validationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Validando landing pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔍 Validação de Landing Pages
        </h1>

        {/* Botão de Revalidação */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Validar Todas as Landing Pages</h2>
              <p className="text-gray-600">Verifica se todas as URLs de campanhas estão funcionando</p>
            </div>
            <button
              onClick={validateLandingPages}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Validando...' : '🔄 Revalidar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {validationData && (
          <>
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">{validationData.summary.totalCampaigns}</div>
                <div className="text-sm text-gray-600">Total de Campanhas</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-green-600">{validationData.summary.workingCampaigns}</div>
                <div className="text-sm text-gray-600">Funcionando</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-red-600">{validationData.summary.brokenCampaigns}</div>
                <div className="text-sm text-gray-600">Com Problemas</div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">{validationData.summary.successRate}%</div>
                <div className="text-sm text-gray-600">Taxa de Sucesso</div>
              </div>
            </div>

            {/* Campanhas com Problemas */}
            {validationData.brokenCampaigns.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-red-600 mb-4">
                  ❌ Campanhas com Problemas ({validationData.brokenCampaigns.length})
                </h2>

                <div className="space-y-4">
                  {validationData.brokenCampaigns.map((campaign) => (
                    <div key={campaign.campaignId} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{campaign.businessName}</h3>
                          <p className="text-sm text-gray-600">Campanha: {campaign.campaignTitle}</p>
                          <p className="text-sm text-gray-600">Mês: {campaign.month}</p>
                          <p className="text-xs text-red-600 mt-1">Erro: {campaign.error}</p>
                          <p className="text-xs text-gray-500 mt-1">URL: {campaign.landingUrl}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(campaign.landingUrl, '_blank')}
                            className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            🔗 Testar
                          </button>
                          <button
                            onClick={() => fixCampaign(campaign.campaignId)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            🔧 Corrigir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campanhas Funcionando */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-green-600 mb-4">
                ✅ Campanhas Funcionando ({validationData.workingCampaigns.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {validationData.workingCampaigns.map((campaign) => (
                  <div key={campaign.campaignId} className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <h3 className="font-semibold text-gray-900 truncate">{campaign.businessName}</h3>
                    <p className="text-sm text-gray-600 truncate">Campanha: {campaign.campaignTitle}</p>
                    <p className="text-sm text-gray-600">Mês: {campaign.month}</p>
                    
                    <div className="mt-2">
                      <button
                        onClick={() => window.open(campaign.landingUrl, '_blank')}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        🔗 Abrir Landing Page
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Informações de Segurança */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-800 mb-2">🔒 Segurança das Landing Pages</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• Cada landing page deve apontar para a campanha correta</li>
            <li>• URLs são geradas baseadas no nome do business e mês da campanha</li>
            <li>• Informações sensíveis só devem ser visíveis para campanhas válidas</li>
            <li>• Sempre validar a associação business → campanha → mês antes de exibir dados</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
