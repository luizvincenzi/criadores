'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessStore } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';
import { fetchBusinesses, fetchCreators, fetchCampaigns, fetchCampaignJourney, isUsingSupabase } from '@/lib/dataSource';
import Button from '@/components/ui/Button';
import ReportsModal from '@/components/ReportsModal';
import { PageGuard, ActionGuard } from '@/components/PermissionGuard';
import { KanbanBoard } from '@/components/KanbanBoard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BarChart3, Users, Briefcase, TrendingUp, Calendar, Target, AlertCircle, CheckCircle, Clock, Star } from 'lucide-react';

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

export default function DashboardGeral() {
  const { businesses, loadBusinessesFromSheet } = useBusinessStore();
  const { user, session, isAuthenticated } = useAuthStore();

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

      console.log('📊 Dados carregados:', {
        businesses: businessesResult?.length || 0,
        creators: creatorsResult?.length || 0,
        campaigns: campaignsResult?.length || 0,
        journey: journeyResult?.length || 0
      });

      // Processar dados do dashboard
      await processDashboardData(
        businessesResult || [],
        creatorsResult || [],
        campaignsResult || [],
        journeyResult || []
      );

    } catch (error) {
      console.error('❌ Erro ao atualizar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <PageGuard allowedRoles={['admin', 'manager', 'user']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Geral</h1>
              <p className="text-gray-600">Bem-vindo de volta, {user?.name || 'Usuário'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <ActionGuard allowedRoles={['admin', 'manager']}>
                <Button
                  onClick={() => setIsReportsModalOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatórios
                </Button>
              </ActionGuard>
              <div className="text-right">
                <p className="text-sm text-gray-500">Último acesso</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Empresas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalBusinesses}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Campanhas
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalCampaigns}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total de Criadores
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalCreators}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Visualizações Totais
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalViews.toLocaleString('pt-BR')}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kanban Board */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Pipeline de Negócios
                </h3>
                <KanbanBoard />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Atividade Recente
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">
                      Nova campanha criada
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-600">
                      Aguardando aprovação
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-gray-600">
                      Ação necessária
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Ações Rápidas
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    Criar nova campanha
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    Adicionar empresa
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    Convidar criador
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Modal */}
        {isReportsModalOpen && (
          <ReportsModal
            isOpen={isReportsModalOpen}
            onClose={() => setIsReportsModalOpen(false)}
          />
        )}
      </div>
    </PageGuard>
  );
}
