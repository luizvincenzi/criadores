'use client';

import React, { useState, useEffect } from 'react';
import { fetchCampaigns } from '@/lib/dataSource';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';

// Interfaces para dados de campanhas
interface Campaign {
  id: string;
  name: string;
  businessName: string;
  businessId: string;
  month: string;
  monthDisplay: string;
  campaign_date: string;
  status: 'completed' | 'active' | 'planned';
  totalCreators: number;
  totalVisualizacoes: number;
  totalEngagement: number;
  totalReach: number;
  budget: number;
  roi: number;
  criadores: string[];
  description?: string;
  startDate: string;
  endDate: string;
}

interface MonthlyData {
  month: string;
  monthDisplay: string;
  campaigns: Campaign[];
  totalCampaigns: number;
  totalCreators: number;
  totalVisualizacoes: number;
  totalEngagement: number;
  totalReach: number;
  totalBudget: number;
  averageROI: number;
}

export default function CampaignsPage() {
  const { user, session } = useAuthStore();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('timeline');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    if (user) {
      loadCampaigns();
    }
  }, [user]);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Carregando campanhas do business...');

      // Obter business_id do usuário logado
      const businessId = session?.business_id || user?.business_id;
      console.log('🏢 Business ID do usuário:', businessId);

      // Buscar campanhas do Supabase
      const campaignsData = await fetchCampaigns();

      // Filtrar campanhas pelo business_id do usuário (se não for admin)
      let filteredCampaigns = campaignsData;
      if (user?.role !== 'admin' && businessId) {
        filteredCampaigns = campaignsData.filter(campaign => 
          campaign.businessId === businessId || 
          campaign.business_id === businessId
        );
        console.log(`🔍 Campanhas filtradas para business ${businessId}:`, filteredCampaigns.length);
      }

      // Processar dados para timeline mensal
      const processedData = processMonthlyData(filteredCampaigns);
      setMonthlyData(processedData);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processMonthlyData = (campaigns: any[]): MonthlyData[] => {
    const monthlyMap = new Map<string, MonthlyData>();

    campaigns.forEach(campaign => {
      const month = campaign.mes || new Date(campaign.campaign_date || Date.now()).toISOString().slice(0, 7);
      const monthDisplay = formatMonthDisplay(month);

      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          monthDisplay,
          campaigns: [],
          totalCampaigns: 0,
          totalCreators: 0,
          totalVisualizacoes: 0,
          totalEngagement: 0,
          totalReach: 0,
          totalBudget: 0,
          averageROI: 0
        });
      }

      const monthData = monthlyMap.get(month)!;
      
      // Converter dados da campanha
      const processedCampaign: Campaign = {
        id: campaign.id || Math.random().toString(),
        name: campaign.name || campaign.businessName || 'Campanha sem nome',
        businessName: campaign.businessName || 'Negócio',
        businessId: campaign.businessId || campaign.business_id || '',
        month,
        monthDisplay,
        campaign_date: campaign.campaign_date || new Date().toISOString(),
        status: determineStatus(campaign),
        totalCreators: campaign.totalCreators || campaign.criadores?.length || 0,
        totalVisualizacoes: campaign.totalVisualizacoes || 0,
        totalEngagement: campaign.totalEngagement || Math.floor((campaign.totalVisualizacoes || 0) * 0.05),
        totalReach: campaign.totalReach || Math.floor((campaign.totalVisualizacoes || 0) * 1.2),
        budget: campaign.budget || 1000,
        roi: campaign.roi || calculateROI(campaign),
        criadores: campaign.criadores || [],
        description: campaign.description || '',
        startDate: campaign.startDate || campaign.campaign_date || new Date().toISOString(),
        endDate: campaign.endDate || campaign.campaign_date || new Date().toISOString()
      };

      monthData.campaigns.push(processedCampaign);
      monthData.totalCampaigns++;
      monthData.totalCreators += processedCampaign.totalCreators;
      monthData.totalVisualizacoes += processedCampaign.totalVisualizacoes;
      monthData.totalEngagement += processedCampaign.totalEngagement;
      monthData.totalReach += processedCampaign.totalReach;
      monthData.totalBudget += processedCampaign.budget;
    });

    // Calcular ROI médio para cada mês
    monthlyMap.forEach(monthData => {
      if (monthData.campaigns.length > 0) {
        monthData.averageROI = monthData.campaigns.reduce((sum, campaign) => sum + campaign.roi, 0) / monthData.campaigns.length;
      }
    });

    // Converter para array e ordenar por mês (mais recente primeiro)
    return Array.from(monthlyMap.values()).sort((a, b) => b.month.localeCompare(a.month));
  };

  const formatMonthDisplay = (month: string): string => {
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  };

  const determineStatus = (campaign: any): 'completed' | 'active' | 'planned' => {
    if (campaign.status === 'completed' || campaign.totalVisualizacoes > 0) return 'completed';
    if (campaign.status === 'active') return 'active';
    return 'planned';
  };

  const calculateROI = (campaign: any): number => {
    const views = campaign.totalVisualizacoes || 0;
    const budget = campaign.budget || 1000;
    if (budget === 0) return 0;
    return Math.round(((views * 0.01) / budget) * 100); // ROI simplificado
  };

  // Componente de estatísticas resumidas
  const StatsOverview = () => {
    const totalStats = monthlyData.reduce((acc, month) => ({
      totalCampaigns: acc.totalCampaigns + month.totalCampaigns,
      totalCreators: acc.totalCreators + month.totalCreators,
      totalVisualizacoes: acc.totalVisualizacoes + month.totalVisualizacoes,
      totalEngagement: acc.totalEngagement + month.totalEngagement,
      totalBudget: acc.totalBudget + month.totalBudget,
      averageROI: acc.averageROI + month.averageROI
    }), {
      totalCampaigns: 0,
      totalCreators: 0,
      totalVisualizacoes: 0,
      totalEngagement: 0,
      totalBudget: 0,
      averageROI: 0
    });

    if (monthlyData.length > 0) {
      totalStats.averageROI = totalStats.averageROI / monthlyData.length;
    }

    const formatNumber = (num: number) => {
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toString();
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Campanhas</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalCampaigns}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+12%</span>
            <span className="text-gray-500 ml-2">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Criadores</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalCreators}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+8%</span>
            <span className="text-gray-500 ml-2">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Visualizações</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(totalStats.totalVisualizacoes)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+24%</span>
            <span className="text-gray-500 ml-2">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI Médio</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.averageROI.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+5.2%</span>
            <span className="text-gray-500 ml-2">vs mês anterior</span>
          </div>
        </div>
      </div>
    );
  };

  // Componente de Timeline
  const TimelineView = () => {
    return (
      <div className="space-y-8">
        {monthlyData.map((monthData, index) => (
          <div key={monthData.month} className="relative">
            {/* Linha da timeline */}
            {index < monthlyData.length - 1 && (
              <div className="absolute left-6 top-16 w-0.5 h-full bg-gray-200"></div>
            )}

            {/* Cabeçalho do mês */}
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {monthData.month.split('-')[1]}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-gray-900">{monthData.monthDisplay}</h3>
                <p className="text-sm text-gray-600">
                  {monthData.totalCampaigns} campanhas • {monthData.totalCreators} criadores
                </p>
              </div>
              <div className="ml-auto flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">ROI Médio</p>
                  <p className="text-lg font-bold text-green-600">{monthData.averageROI.toFixed(1)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Visualizações</p>
                  <p className="text-lg font-bold text-blue-600">{monthData.totalVisualizacoes.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Cards das campanhas do mês */}
            <div className="ml-16 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {monthData.campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedCampaign(campaign)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{campaign.name}</h4>
                      <p className="text-sm text-gray-600">{campaign.description || 'Campanha de influenciadores'}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'completed' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status === 'completed' ? 'Concluída' :
                       campaign.status === 'active' ? 'Ativa' : 'Planejada'}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{campaign.totalCreators}</p>
                      <p className="text-xs text-gray-600">Criadores</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{campaign.totalVisualizacoes.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">Visualizações</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{campaign.roi}%</p>
                      <p className="text-xs text-gray-600">ROI</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Orçamento: R$ {campaign.budget.toLocaleString()}</span>
                    <span>{new Date(campaign.startDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo mensal */}
            <div className="ml-16 mt-4 bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Investimento Total</p>
                  <p className="text-lg font-bold text-gray-900">R$ {monthData.totalBudget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Alcance Total</p>
                  <p className="text-lg font-bold text-gray-900">{monthData.totalReach.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Engajamento</p>
                  <p className="text-lg font-bold text-gray-900">{monthData.totalEngagement.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Taxa de Engajamento</p>
                  <p className="text-lg font-bold text-gray-900">
                    {monthData.totalVisualizacoes > 0 ?
                      ((monthData.totalEngagement / monthData.totalVisualizacoes) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Modal de detalhes da campanha
  const CampaignDetailModal = () => {
    if (!selectedCampaign) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCampaign.name}</h2>
              <button
                onClick={() => setSelectedCampaign(null)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mt-2">{selectedCampaign.monthDisplay}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedCampaign.totalCreators}</p>
                <p className="text-sm text-gray-600">Criadores</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedCampaign.totalVisualizacoes.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Visualizações</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedCampaign.totalEngagement.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Engajamento</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900">{selectedCampaign.roi}%</p>
                <p className="text-sm text-gray-600">ROI</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Informações da Campanha</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orçamento:</span>
                    <span className="font-medium">R$ {selectedCampaign.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Alcance:</span>
                    <span className="font-medium">{selectedCampaign.totalReach.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa de Engajamento:</span>
                    <span className="font-medium">
                      {selectedCampaign.totalVisualizacoes > 0 ?
                        ((selectedCampaign.totalEngagement / selectedCampaign.totalVisualizacoes) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Período:</span>
                    <span className="font-medium">
                      {new Date(selectedCampaign.startDate).toLocaleDateString('pt-BR')} - {new Date(selectedCampaign.endDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              {selectedCampaign.criadores.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Criadores Participantes</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedCampaign.criadores.map((criador, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {criador}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando campanhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Campanhas</h1>
              <p className="text-gray-600 mt-1">Acompanhe o desempenho das suas campanhas de influenciadores</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grade
                </button>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <StatsOverview />
        </div>

        {/* Conteúdo principal */}
        {monthlyData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-gray-600">Suas campanhas aparecerão aqui quando estiverem disponíveis.</p>
          </div>
        ) : (
          <TimelineView />
        )}

        {/* Modal de detalhes */}
        <CampaignDetailModal />
      </div>
    </div>
  );
}
