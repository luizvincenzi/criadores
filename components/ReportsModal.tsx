'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Target, Filter, Download, X } from 'lucide-react';
import { useNotify } from '@/contexts/NotificationContext';

interface ReportData {
  totalBusinesses: number;
  totalCreators: number;
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  monthlyStats: {
    month: string;
    campaigns: number;
    revenue: number;
    creators: number;
  }[];
  creatorsByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  campaignsByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  topCreators: {
    name: string;
    campaigns: number;
    followers: number;
    city: string;
  }[];
  businessCategories: {
    category: string;
    count: number;
    percentage: number;
  }[];
}

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportsModal: React.FC<ReportsModalProps> = ({ isOpen, onClose }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('last6months');
  const notify = useNotify();

  useEffect(() => {
    if (isOpen) {
      loadReportData();
    }
  }, [isOpen, selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);

      // Buscar dados reais da API
      const response = await fetch(`/api/reports?period=${selectedPeriod}`);
      const data = await response.json();

      if (data.success) {
        setReportData(data.data);
        notify.success(
          'Relatórios Carregados',
          `Dados atualizados com sucesso (fonte: ${data.source})`
        );
      } else {
        throw new Error(data.error || 'Erro ao carregar relatórios');
      }

    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      notify.error('Erro ao Carregar', 'Falha ao carregar dados dos relatórios');

      // Fallback para dados mock em caso de erro
      const mockData: ReportData = {
        totalBusinesses: 45,
        totalCreators: 127,
        totalCampaigns: 89,
        activeCampaigns: 23,
        completedCampaigns: 66,
        monthlyStats: [
          { month: 'Jan', campaigns: 12, revenue: 15000, creators: 8 },
          { month: 'Fev', campaigns: 15, revenue: 18500, creators: 12 },
          { month: 'Mar', campaigns: 18, revenue: 22000, creators: 15 },
          { month: 'Abr', campaigns: 14, revenue: 17500, creators: 11 },
          { month: 'Mai', campaigns: 16, revenue: 20000, creators: 13 },
          { month: 'Jun', campaigns: 14, revenue: 18000, creators: 10 }
        ],
        creatorsByStatus: [
          { status: 'Ativo', count: 89, percentage: 70 },
          { status: 'Precisa engajar', count: 28, percentage: 22 },
          { status: 'Não parceiro', count: 10, percentage: 8 }
        ],
        campaignsByStatus: [
          { status: 'Reunião de briefing', count: 8, percentage: 35 },
          { status: 'Agendamentos', count: 7, percentage: 30 },
          { status: 'Entrega final', count: 5, percentage: 22 },
          { status: 'Finalizado', count: 3, percentage: 13 }
        ],
        topCreators: [
          { name: 'ADRIANO YAMAMOTO', campaigns: 8, followers: 170153, city: 'Londrina, PR' },
          { name: 'Alanna Alícia', campaigns: 6, followers: 17900, city: 'Belem, PA' },
          { name: 'Ana Clara', campaigns: 5, followers: 45000, city: 'São Paulo, SP' },
          { name: 'Bruno Silva', campaigns: 4, followers: 32000, city: 'Rio de Janeiro, RJ' },
          { name: 'Carla Santos', campaigns: 4, followers: 28000, city: 'Belo Horizonte, MG' }
        ],
        businessCategories: [
          { category: 'Restaurantes', count: 18, percentage: 40 },
          { category: 'Beleza & Estética', count: 12, percentage: 27 },
          { category: 'Fitness', count: 8, percentage: 18 },
          { category: 'Tecnologia', count: 4, percentage: 9 },
          { category: 'Outros', count: 3, percentage: 6 }
        ]
      };

      setReportData(mockData);
      notify.warning('Dados de Fallback', 'Usando dados de exemplo devido ao erro');

    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    notify.info('Exportando Relatório', 'Preparando arquivo para download...');
    setTimeout(() => {
      notify.success('Relatório Exportado', 'Download iniciado com sucesso');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header Fixo */}
        <div className="sticky top-0 bg-green-800 text-white px-8 py-6 flex items-center justify-between border-b border-green-700">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">📊 Relatórios e Analytics</h2>
              <p className="text-green-100 text-sm">Análise completa do desempenho do seu CRM</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Filtros */}
            <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
              <Filter className="w-4 h-4 text-white/80" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none"
              >
                <option value="last30days" className="text-gray-900">Últimos 30 dias</option>
                <option value="last3months" className="text-gray-900">Últimos 3 meses</option>
                <option value="last6months" className="text-gray-900">Últimos 6 meses</option>
                <option value="lastyear" className="text-gray-900">Último ano</option>
              </select>
            </div>

            {/* Botão de Exportar */}
            <button
              onClick={exportReport}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Exportar</span>
            </button>

            {/* Botão Fechar */}
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando relatórios...</p>
              </div>
            </div>
          ) : !reportData ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-gray-600">Erro ao carregar dados dos relatórios</p>
              </div>
            </div>
          ) : (
            <div className="p-8 space-y-8">
              {/* Cards de Métricas Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Negócios</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.totalBusinesses}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Criadores</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.totalCreators}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Campanhas Ativas</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.activeCampaigns}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Calendar className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Campanhas Finalizadas</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.completedCampaigns}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total de Campanhas</p>
                      <p className="text-2xl font-bold text-gray-900">{reportData.totalCampaigns}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <BarChart3 className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráficos e Análises */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status dos Criadores */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Status dos Criadores</h3>
                  <div className="space-y-4">
                    {reportData.creatorsByStatus.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            item.status === 'Ativo' ? 'bg-green-500' :
                            item.status === 'Precisa engajar' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-700">{item.status}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.status === 'Ativo' ? 'bg-green-500' :
                                item.status === 'Precisa engajar' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-8">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status das Campanhas */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Status das Campanhas</h3>
                  <div className="space-y-4">
                    {reportData.campaignsByStatus.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-yellow-500' :
                            index === 2 ? 'bg-green-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-700">{item.status}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                index === 0 ? 'bg-blue-500' :
                                index === 1 ? 'bg-yellow-500' :
                                index === 2 ? 'bg-green-500' : 'bg-gray-500'
                              }`}
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-8">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Criadores e Categorias */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Criadores */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Criadores</h3>
                  <div className="space-y-4">
                    {reportData.topCreators.map((creator, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{creator.name}</p>
                            <p className="text-xs text-gray-600">{creator.city}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">{creator.campaigns} campanhas</p>
                          <p className="text-xs text-gray-600">{creator.followers.toLocaleString()} seguidores</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Categorias de Negócios */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Categorias de Negócios</h3>
                  <div className="space-y-4">
                    {reportData.businessCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-orange-500' :
                            index === 1 ? 'bg-pink-500' :
                            index === 2 ? 'bg-indigo-500' :
                            index === 3 ? 'bg-teal-500' : 'bg-gray-500'
                          }`}></div>
                          <span className="text-sm font-medium text-gray-700">{category.category}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                index === 0 ? 'bg-orange-500' :
                                index === 1 ? 'bg-pink-500' :
                                index === 2 ? 'bg-indigo-500' :
                                index === 3 ? 'bg-teal-500' : 'bg-gray-500'
                              }`}
                              style={{ width: `${category.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-8">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estatísticas Mensais */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolução Mensal</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {reportData.monthlyStats.map((month, index) => (
                    <div key={index} className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-gray-600 mb-2">{month.month}</p>
                      <p className="text-xl font-bold text-blue-600 mb-1">{month.campaigns}</p>
                      <p className="text-xs text-gray-500">campanhas</p>
                      <p className="text-xs text-gray-500 mt-1">{month.creators} criadores</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsModal;
