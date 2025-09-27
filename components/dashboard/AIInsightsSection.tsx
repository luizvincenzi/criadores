'use client';

import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Users, Target, Lightbulb, BarChart3 } from 'lucide-react';

interface AIInsight {
  hasAiData: boolean;
  businessName?: string;
  generatedAt?: string;
  businessAnalysis?: {
    description: string;
    strengths: string[];
    weaknesses: string[];
    mainOpportunity: string;
    competitiveDifferential: string;
  };
  channelPerformance?: Array<{
    name: string;
    score: number;
    color: string;
    reasoning: string;
  }>;
  audienceSegmentation?: Array<{
    name: string;
    percentage: number;
    description: string;
  }>;
  marketAnalysis?: {
    trends: string[];
    competitors: string[];
    opportunities: string[];
    seasonality: string;
  };
  actionPlans?: {
    genZ: any[];
    internal: any[];
    influencers: any[];
  };
  priorityRecommendations?: any[];
  confidence?: number;
}

interface AIInsightsSectionProps {
  businessId: string;
}

export default function AIInsightsSection({ businessId }: AIInsightsSectionProps) {
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadAIInsights();
  }, [businessId]);

  const loadAIInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/dashboard/empresa/ai-insights?businessId=${businessId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar insights de IA');
      }

      setInsights(data);
    } catch (err) {
      console.error('Erro ao carregar insights de IA:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const syncWithSnapshots = async () => {
    try {
      setSyncing(true);

      const response = await fetch('/api/dashboard/empresa/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, quarter: '2025-Q3' })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao sincronizar dados');
      }

      alert('Dados sincronizados com sucesso! Recarregue a página para ver as atualizações.');
    } catch (err) {
      console.error('Erro na sincronização:', err);
      alert('Erro ao sincronizar dados: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao Carregar Insights</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadAIInsights}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!insights?.hasAiData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Insights de IA Não Disponíveis</h3>
          <p className="text-gray-600">Nenhuma análise de IA foi encontrada para esta empresa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Insights de IA</h2>
              <p className="text-purple-100">
                Análise gerada em {new Date(insights.generatedAt!).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-100">Confiança</div>
            <div className="text-2xl font-bold">{insights.confidence}%</div>
          </div>
        </div>
      </div>

      {/* Sync Button */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Sincronização com Dashboard</h3>
            <p className="text-sm text-gray-600">
              Aplique os insights de IA aos dados do dashboard trimestral
            </p>
          </div>
          <button
            onClick={syncWithSnapshots}
            disabled={syncing}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            {syncing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sincronizando...</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                <span>Sincronizar Dados</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Performance de Canais */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance de Canais</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.channelPerformance?.map((channel, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ color: channel.color }}>
                  {channel.name}
                </span>
                <span className="text-2xl font-bold text-gray-900">{channel.score}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="h-2 rounded-full"
                  style={{ 
                    backgroundColor: channel.color, 
                    width: `${channel.score}%` 
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{channel.reasoning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Segmentação de Audiência */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Segmentação de Audiência</h3>
        </div>
        <div className="space-y-4">
          {insights.audienceSegmentation?.map((segment, index) => (
            <div key={index} className="border-l-4 border-green-500 pl-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">{segment.name}</h4>
                <span className="text-lg font-bold text-green-600">{segment.percentage}%</span>
              </div>
              <p className="text-sm text-gray-600">{segment.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendações Prioritárias */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recomendações Prioritárias</h3>
        </div>
        <div className="space-y-4">
          {insights.priorityRecommendations?.map((rec, index) => (
            <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{rec.title}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {rec.priority === 'high' ? 'Alta' : 'Média'} Prioridade
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>📅 {rec.timeline}</span>
                <span>🎯 {rec.objective}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Análise de Mercado */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Análise de Mercado</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tendências</h4>
            <ul className="space-y-1">
              {insights.marketAnalysis?.trends.map((trend, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  {trend}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Oportunidades</h4>
            <ul className="space-y-1">
              {insights.marketAnalysis?.opportunities.map((opp, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {opp}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {insights.marketAnalysis?.seasonality && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">Sazonalidade</h4>
            <p className="text-sm text-gray-600">{insights.marketAnalysis.seasonality}</p>
          </div>
        )}
      </div>
    </div>
  );
}
