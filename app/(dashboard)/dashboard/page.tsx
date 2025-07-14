'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessStore } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';
import { getCreatorsData, getCampaignsData, getCampaignJourneyData } from '@/app/actions/sheetsActions';
import Button from '@/components/ui/Button';

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
}

export default function DashboardPage() {
  const { businesses, loadBusinessesFromSheet } = useBusinessStore();
  const { user, isAuthenticated } = useAuthStore();
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
    planDistribution: {}
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshDashboard = async () => {
    setIsLoading(true);
    console.log('🔄 Refresh manual do dashboard...');

    try {
      // Carregar dados em paralelo
      console.log('📡 Buscando dados atualizados...');
      const [businessesResult, creatorsResult, campaignsResult, journeyResult] = await Promise.all([
        loadBusinessesFromSheet(),
        getCreatorsData(),
        getCampaignsData(),
        getCampaignJourneyData()
      ]);

      console.log('📊 Dados atualizados recebidos:', {
        criadores: creatorsResult.length,
        campanhas: campaignsResult.length,
        jornada: journeyResult.length
      });

      // Calcular estatísticas das campanhas por estágio
      const campaignsByStage = {
        'Reunião de briefing': 0,
        'Agendamentos': 0,
        'Entrega final': 0,
        'Finalizado': 0
      };

      journeyResult.forEach(campaign => {
        const stage = campaign.journeyStage || 'Reunião de briefing';
        // Mapear para as chaves corretas do dashboard
        const stageKey = stage === 'Reunião Briefing' ? 'Reunião de briefing' :
                        stage === 'Agendamentos' ? 'Agendamentos' :
                        stage === 'Entrega Final' ? 'Entrega final' : 'Reunião de briefing';

        if (stageKey in campaignsByStage) {
          campaignsByStage[stageKey as keyof typeof campaignsByStage]++;
        }
        console.log(`📊 Dashboard: Campanha ${campaign.businessName}-${campaign.mes} → Stage: ${stage} → Key: ${stageKey}`);
      });

      // Atualizar contadores com dados reais
      setStats(prevStats => {
        const newStats = {
          ...prevStats,
          totalCreators: creatorsResult.length,
          totalCampaigns: campaignsResult.length,
          campaignsByStage: campaignsByStage
        };
        console.log('📈 Stats após refresh:', newStats);
        return newStats;
      });

      console.log(`✅ Dashboard atualizado manualmente: ${creatorsResult.length} criadores, ${campaignsResult.length} campanhas`);
    } catch (error) {
      console.error('❌ Erro ao atualizar dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      console.log('🔄 Dashboard: Iniciando carregamento...');

      try {
        // Carregar negócios primeiro
        await loadBusinessesFromSheet();
        console.log('✅ Dashboard: Negócios carregados');

        // Carregar criadores e campanhas
        console.log('📡 Dashboard: Buscando criadores...');
        const creatorsResult = await getCreatorsData();
        console.log(`✅ Dashboard: ${creatorsResult.length} criadores carregados`);

        console.log('📡 Dashboard: Buscando campanhas...');
        const campaignsResult = await getCampaignsData();
        console.log(`✅ Dashboard: ${campaignsResult.length} campanhas carregadas`);

        console.log('📡 Dashboard: Buscando dados da jornada...');
        const journeyResult = await getCampaignJourneyData();
        console.log(`✅ Dashboard: ${journeyResult.length} campanhas da jornada carregadas`);

        // Calcular estatísticas das campanhas por estágio
        const campaignsByStage = {
          'Reunião de briefing': 0,
          'Agendamentos': 0,
          'Entrega final': 0,
          'Finalizado': 0
        };

        journeyResult.forEach(campaign => {
          const stage = campaign.journeyStage || 'Reunião de briefing';
          // Mapear para as chaves corretas do dashboard
          const stageKey = stage === 'Reunião Briefing' ? 'Reunião de briefing' :
                          stage === 'Agendamentos' ? 'Agendamentos' :
                          stage === 'Entrega Final' ? 'Entrega final' : 'Reunião de briefing';

          if (stageKey in campaignsByStage) {
            campaignsByStage[stageKey as keyof typeof campaignsByStage]++;
          }
          console.log(`📊 Dashboard: Campanha ${campaign.businessName}-${campaign.mes} → Stage: ${stage} → Key: ${stageKey}`);
        });

        // Atualizar stats
        setStats(prevStats => {
          const newStats = {
            ...prevStats,
            totalCreators: creatorsResult.length,
            totalCampaigns: campaignsResult.length,
            campaignsByStage: campaignsByStage
          };
          console.log('📈 Dashboard: Stats finais:', newStats);
          console.log('🔍 Dashboard: Campanhas por estágio detalhado:', campaignsByStage);
          console.log('📊 Dashboard: Total de campanhas da jornada:', journeyResult.length);
          return newStats;
        });

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
              <p className="text-sm text-on-surface-variant font-medium">Receita Total</p>
              <p className="text-3xl font-bold text-on-surface mt-1">R$ {stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-primary mt-1">Sucesso!</p>
            </div>
            <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
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
              const totalCampaigns = Object.values(stats.campaignsByStage).reduce((sum, c) => sum + c, 0);
              const percentage = totalCampaigns > 0 ? (count / totalCampaigns) * 100 : 0;
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
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribuição por Plano */}
        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <h3 className="text-lg font-semibold text-on-surface mb-4">Distribuição por Plano</h3>
          <div className="space-y-3">
            {Object.entries(stats.planDistribution).map(([plan, count]) => {
              const percentage = stats.totalBusinesses > 0 ? (count / stats.totalBusinesses) * 100 : 0;
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
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{count}</span>
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
    </div>
  );
}
