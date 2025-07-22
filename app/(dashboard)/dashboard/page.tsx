'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessStore } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';
import { fetchBusinesses, fetchCreators, fetchCampaigns, fetchCampaignJourney, isUsingSupabase } from '@/lib/dataSource';
import Button from '@/components/ui/Button';
import ReportsModal from '@/components/ReportsModal';

interface DashboardStats {
  totalBusinesses: number;
  totalCreators: number;
  totalCampaigns: number;
  campaignsByStage: {
    'Reunião de briefing': number;
    'Agendamentos': number;
    'Entrega final': number;
    'Finalizado': number;
  };
  totalRevenue: number;
  planDistribution: {
    [key: string]: number;
  };
  totalViews: number;
  topCampaigns: Array<{
    businessName: string;
    month: string;
    totalViews: number;
  }>;
}

export default function DashboardPage() {
  const { businesses, loadBusinessesFromSheet } = useBusinessStore();
  const { user, isAuthenticated } = useAuthStore();

  // Função para formatar data no padrão "Jun 25"
  const formatMonthYearShort = (monthKey: string) => {
    // Se for formato YYYYMM (ex: 202507)
    if (monthKey && monthKey.length === 6 && /^\d{6}$/.test(monthKey)) {
      const year = monthKey.substring(0, 4);
      const month = monthKey.substring(4, 6);

      const monthNames = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];

      const monthIndex = parseInt(month) - 1;
      const shortYear = year.substring(2, 4);

      if (monthIndex >= 0 && monthIndex < 12) {
        return `${monthNames[monthIndex]} ${shortYear}`;
      }
    }

    // Se for formato "2025-07"
    if (monthKey && monthKey.includes('-') && monthKey.length === 7) {
      const [year, month] = monthKey.split('-');
      const monthNames = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];

      const monthIndex = parseInt(month) - 1;
      const shortYear = year.substring(2, 4);

      if (monthIndex >= 0 && monthIndex < 12) {
        return `${monthNames[monthIndex]} ${shortYear}`;
      }
    }

    // Fallback para outros formatos
    return monthKey;
  };

  const [stats, setStats] = useState<DashboardStats>({
    totalBusinesses: 0,
    totalCreators: 0,
    totalCampaigns: 0,
    campaignsByStage: {
      'Reunião de briefing': 0,
      'Agendamentos': 0,
      'Entrega final': 0,
      'Finalizado': 0
    },
    totalRevenue: 0,
    planDistribution: {},
    totalViews: 0,
    topCampaigns: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  // Função auxiliar para processar dados do dashboard
  const processDashboardData = async (businessesData: any[], creatorsData: any[], campaignsData: any[], journeyData: any[]) => {
    // Calcular estatísticas das campanhas por estágio
    const campaignsByStage = {
      'Reunião de briefing': 0,
      'Agendamentos': 0,
      'Entrega final': 0,
      'Finalizado': 0
    };

    journeyData.forEach(campaign => {
      const stage = campaign.journeyStage || 'Reunião de briefing';
      // Mapear para as chaves corretas do dashboard
      let stageKey = stage;

      // Normalizar nomes de estágios
      if (stage === 'Reunião Briefing' || stage === 'Reunião de Briefing') {
        stageKey = 'Reunião de briefing';
      } else if (stage === 'Entrega Final') {
        stageKey = 'Entrega final';
      }

      if (stageKey in campaignsByStage) {
        campaignsByStage[stageKey as keyof typeof campaignsByStage]++;
      }
      console.log(`📊 Dashboard: Campanha ${campaign.businessName}-${campaign.mes} → Stage: ${stage} → Key: ${stageKey}`);
    });

    // Calcular distribuição de planos (se usando Supabase)
    const planDistribution: { [key: string]: number } = {};
    if (isUsingSupabase()) {
      businessesData.forEach(business => {
        const plan = business.current_plan || business.planoAtual || 'Sem Plano';
        planDistribution[plan] = (planDistribution[plan] || 0) + 1;
      });
    } else {
      // Para Google Sheets, usar dados do businessStore
      businesses.forEach(business => {
        const plan = business.plano || 'Sem Plano';
        planDistribution[plan] = (planDistribution[plan] || 0) + 1;
      });
    }

    // Calcular receita total (simulada baseada no número de campanhas)
    const totalRevenue = campaignsData.length * 2500; // R$ 2.500 por campanha (média)

    // Calcular visualizações totais e ranking de campanhas
    let totalViews = 0;
    const campaignViews: Array<{businessName: string, month: string, totalViews: number}> = [];

    // Buscar dados de performance das campanhas
    try {
      const performanceResponse = await fetch('/api/supabase/campaign-performance');
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        if (performanceData.success && performanceData.summary) {
          totalViews = performanceData.summary.total_views || 0;

          // Usar top campaigns do summary
          if (performanceData.summary.top_campaigns) {
            performanceData.summary.top_campaigns.slice(0, 3).forEach((campaign: any) => {
              campaignViews.push({
                businessName: campaign.business_name || 'N/A',
                month: campaign.month || 'N/A',
                totalViews: campaign.performance_data?.total_views || 0
              });
            });
          }
        }
      }
    } catch (error) {
      console.error('⚠️ Erro ao buscar dados de performance:', error);
    }

    // Ordenar campanhas por visualizações e pegar top 3
    const topCampaigns = campaignViews
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 3);

    // Atualizar contadores com dados reais
    setStats(prevStats => {
      const newStats = {
        ...prevStats,
        totalBusinesses: businessesData.length || 0,
        totalCreators: creatorsData.length || 0,
        totalCampaigns: campaignsData.length || 0,
        totalRevenue: totalRevenue || 0,
        campaignsByStage: campaignsByStage,
        planDistribution: planDistribution,
        totalViews: totalViews,
        topCampaigns: topCampaigns
      };
      console.log('📈 Stats após processamento:', newStats);
      return newStats;
    });

    console.log(`✅ Dashboard processado: ${businessesData.length} negócios, ${creatorsData.length} criadores, ${campaignsData.length} campanhas`);
  };

  const refreshDashboard = async () => {
    setIsLoading(true);
    console.log(`🔄 Refresh manual do dashboard (${isUsingSupabase() ? 'Supabase' : 'Google Sheets'})...`);

    try {
      // Carregar dados em paralelo usando sistema de data source
      console.log('📡 Buscando dados atualizados...');

      // Usar dados do Supabase (única fonte agora)
      const [businessesResult, creatorsResult, campaignsResult, journeyResult] = await Promise.all([
        fetchBusinesses(),
        fetchCreators(),
        fetchCampaigns(),
        fetchCampaignJourney()
      ]);

      // Atualizar também o businessStore
      await loadBusinessesFromSheet();

      console.log('📊 Dados do Supabase recebidos:', {
        negócios: businessesResult.length,
        criadores: creatorsResult.length,
        campanhas: campaignsResult.length,
        jornada: journeyResult.length
      });

      // Processar dados do Supabase
      await processDashboardData(businessesResult, creatorsResult, campaignsResult, journeyResult);
    } catch (error) {
      console.error('❌ Erro ao atualizar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      console.log(`🔄 Dashboard: Iniciando carregamento (${isUsingSupabase() ? 'Supabase' : 'Google Sheets'})...`);

      try {
        // Usar dados do Supabase (única fonte agora)
        console.log('📡 Dashboard: Carregando dados do Supabase...');

        const [businessesResult, creatorsResult, campaignsResult, journeyResult] = await Promise.all([
          fetchBusinesses(),
          fetchCreators(),
          fetchCampaigns(),
          fetchCampaignJourney()
        ]);

        // Carregar também no businessStore
        await loadBusinessesFromSheet();

        console.log('✅ Dashboard: Dados do Supabase carregados:', {
          negócios: businessesResult.length,
          criadores: creatorsResult.length,
          campanhas: campaignsResult.length,
          jornada: journeyResult.length
        });

        // Processar dados
        await processDashboardData(businessesResult, creatorsResult, campaignsResult, journeyResult);

      } catch (error) {
        console.error('❌ Dashboard: Erro ao carregar:', error);
      } finally {
        setIsLoading(false);
        console.log('🏁 Dashboard: Carregamento finalizado');
      }
    };

    loadData();
  }, [loadBusinessesFromSheet]);

  useEffect(() => {
    if (businesses.length > 0) {
      setStats(prevStats => {
        const newStats: DashboardStats = {
          ...prevStats, // Preservar totalCreators, totalCampaigns e campaignsByStage
          totalBusinesses: businesses.length,
          totalRevenue: 0,
          planDistribution: {}
        };

        // Calcular distribuição por plano
        businesses.forEach(business => {
          const plan = business.currentPlan || 'Não definido';
          newStats.planDistribution[plan] = (newStats.planDistribution[plan] || 0) + 1;
        });

        return newStats;
      });
    }
  }, [businesses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Carregando dados do dashboard integrado...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Visão geral dos seus negócios, criadores e campanhas
          </p>
        </div>

        {/* Botão Relatórios */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsReportsModalOpen(true)}
            className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-green-800 hover:bg-green-900 text-white px-4 py-2 text-sm rounded-full"
          >
            <span>Relatórios</span>
          </button>
        </div>
        {/* Debug buttons hidden in production */}
        <div className="hidden"
          style={{ display: 'none' }}>
          <Button
            variant="outlined"
            size="sm"
            icon="🔍"
            onClick={() => {
              console.log('🔍 DEBUG: Stats atuais:', stats);
              console.log('🔍 DEBUG: Campanhas por estágio:', stats.campaignsByStage);
              alert(`Debug: Agendamentos=${stats.campaignsByStage['Agendamentos']}, Entrega final=${stats.campaignsByStage['Entrega final']}`);
            }}
          >
            Debug
          </Button>
          <Button
            variant="outlined"
            size="sm"
            icon="🔄"
            onClick={refreshDashboard}
            disabled={isLoading}
          >
            <span className="hidden sm:inline">Atualizar</span>
            <span className="sm:hidden">Sync</span>
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Total de Negócios</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{stats.totalBusinesses}</p>
              <p className="text-xs text-secondary mt-1">+12% este mês</p>
            </div>
            <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M3 21h18"/>
                <path d="M5 21V7l8-4v18"/>
                <path d="M19 21V11l-6-4"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Total de Criadores</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{stats.totalCreators || 0}</p>
              <p className="text-xs text-secondary mt-1">Ativos</p>
            </div>
            <div className="w-12 h-12 bg-secondary-container rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Campanhas Ativas</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{stats.totalCampaigns || 0}</p>
              <p className="text-xs text-tertiary mt-1">Em andamento</p>
            </div>
            <div className="w-12 h-12 bg-tertiary-container rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tertiary">
                <path d="M3 11l18-5v12L3 14v-3z"/>
                <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Total de Visualizações</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{(stats.totalViews || 0).toLocaleString()}</p>
              <p className="text-xs text-purple-600 mt-1">Todas as campanhas</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-600">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jornada das Campanhas */}
        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Jornada das Campanhas</h3>
          <div className="space-y-3">
            {Object.entries(stats.campaignsByStage).map(([stage, count]) => {
              const totalCampaigns = Object.values(stats.campaignsByStage).reduce((sum, c) => sum + (c || 0), 0);
              const percentage = totalCampaigns > 0 ? ((count || 0) / totalCampaigns) * 100 : 0;
              const stageIcons = {
                'Reunião de briefing': '📋',
                'Agendamentos': '📅',
                'Entrega final': '✅',
                'Finalizado': '🎯'
              };

              const stageColors = {
                'Reunião de briefing': 'bg-blue-500',
                'Agendamentos': 'bg-yellow-500',
                'Entrega final': 'bg-orange-500',
                'Finalizado': 'bg-green-500'
              };

              return (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{stageIcons[stage as keyof typeof stageIcons]}</span>
                    <span className="text-sm font-medium text-gray-700">{stage}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${stageColors[stage as keyof typeof stageColors]}`}
                        style={{ width: `${Math.max(0, Math.min(100, percentage || 0))}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{count || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ranking de Campanhas */}
        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Top 3 Campanhas</h3>
          <div className="space-y-3">
            {stats.topCampaigns.length > 0 ? (
              stats.topCampaigns.map((campaign, index) => {
                const medals = ['🥇', '🥈', '🥉'];
                const colors = ['text-yellow-600', 'text-gray-500', 'text-orange-600'];

                return (
                  <div key={`${campaign.businessName}-${campaign.month}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{medals[index]}</span>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{campaign.businessName}</p>
                        <p className="text-xs text-gray-600">{formatMonthYearShort(campaign.month) || campaign.month}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${colors[index]}`}>
                        {campaign.totalViews.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">visualizações</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="mb-3">
                  <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">Nenhum trabalho esse mês</p>
                <p className="text-xs text-gray-400">Dados de performance serão exibidos aqui</p>
              </div>
            )}
          </div>
        </div>

        {/* Distribuição por Plano */}
        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Distribuição por Plano</h3>
          <div className="space-y-3">
            {Object.entries(stats.planDistribution).map(([plan, count]) => {
              const percentage = (stats.totalBusinesses || 0) > 0 ? ((count || 0) / (stats.totalBusinesses || 1)) * 100 : 0;
              const planColors = {
                'Gold - 6': 'bg-yellow-500',
                'Silver - 4': 'bg-gray-400',
                'Bronze - 2': 'bg-orange-600',
                'Não definido': 'bg-gray-300'
              };
              
              return (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${planColors[plan as keyof typeof planColors] || 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium text-gray-700">{plan}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${planColors[plan as keyof typeof planColors] || 'bg-gray-300'}`}
                        style={{ width: `${Math.max(0, Math.min(100, percentage || 0))}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{count || 0}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
        <h3 className="text-lg font-semibold text-on-surface mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outlined" className="justify-start" href="/businesses">
            <span className="mr-2">🏢</span>
            Gerenciar Negócios
          </Button>
          <Button variant="outlined" className="justify-start" href="/creators">
            <span className="mr-2">👥</span>
            Ver Criadores
          </Button>
          <Button variant="outlined" className="justify-start" href="/campaigns">
            <span className="mr-2">📢</span>
            Campanhas Ativas
          </Button>
          <Button variant="outlined" className="justify-start" href="/jornada">
            <span className="mr-2">🛤️</span>
            Jornada Kanban
          </Button>
        </div>
      </div>

      {/* Modal de Relatórios */}
      <ReportsModal
        isOpen={isReportsModalOpen}
        onClose={() => setIsReportsModalOpen(false)}
      />
    </div>
  );
}
