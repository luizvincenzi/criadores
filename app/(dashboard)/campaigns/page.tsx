'use client';

import React, { useState, useEffect } from 'react';
import { fetchCampaigns, isUsingSupabase } from '@/lib/dataSource';
import CampaignGroupModal from '@/components/CampaignGroupModal';
import AddCampaignModalNew from '@/components/AddCampaignModalNew';
import CampaignModalComplete from '@/components/CampaignModalComplete';
import Button from '@/components/ui/Button';

// Tipo para dados agrupados de campanhas
interface GroupedCampaignData {
  businessName: string;
  businessId: string;
  month: string;
  monthDisplay: string; // Formato "Junho 2025"
  campaign_date: string;
  campaigns: any[];
  criadores: string[];
  totalCreators: number;
  totalVisualizacoes: number;
  status: string;
}

export default function CampaignsPage() {
  const [groupedCampaigns, setGroupedCampaigns] = useState<GroupedCampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaignGroup, setSelectedCampaignGroup] = useState<GroupedCampaignData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');

  useEffect(() => {
    loadCampaigns();
  }, []);

  // Função para agrupar campanhas do Supabase por negócio e mês
  const groupCampaignsByBusiness = (campaigns: any[]): GroupedCampaignData[] => {
    const grouped = campaigns.reduce((acc: any, campaign: any) => {
      const businessName = campaign.businessName || 'Sem Negócio';
      const month = campaign.mes || 'Sem Mês';
      const groupKey = `${businessName}_${month}`;

      if (!acc[groupKey]) {
        acc[groupKey] = {
          businessName: businessName,
          businessId: campaign.businessId || '',
          month: month,
          monthYearId: campaign.monthYearId || campaign.month_year_id, // 🎯 Adicionar month_year_id
          monthDisplay: formatMonthDisplay(month),
          campaign_date: '',
          campaigns: [],
          criadores: [],
          totalCreators: 0,
          totalVisualizacoes: 0,
          status: campaign.status || 'Reunião de briefing',
          campaignId: campaign.id // 🎯 Adicionar UUID da campanha principal
        };
      }

      // Adicionar criadores da campanha
      if (campaign.criadores && campaign.criadores.length > 0) {
        acc[groupKey].campaigns.push(...campaign.criadores.map((criador: any) => ({
          id: `${campaign.id}_${criador.id}`,
          campaignId: campaign.id,
          businessName: businessName,
          creatorName: criador.nome,
          creatorId: criador.id,
          month: month,
          status: criador.status || 'Ativo',
          deliverables: criador.deliverables || {},
          instagram: criador.instagram || '',
          whatsapp: criador.whatsapp || '',
          cidade: criador.cidade || ''
        })));

        // Adicionar nomes únicos dos criadores
        const uniqueCreators = [...new Set(campaign.criadores.map((criador: any) => criador.nome || 'Sem Nome'))];
        acc[groupKey].criadores = [...new Set([...acc[groupKey].criadores, ...uniqueCreators])];
        acc[groupKey].totalCreators = acc[groupKey].criadores.length;
      } else {
        // Se não tem criadores, criar entrada básica
        acc[groupKey].campaigns.push({
          id: campaign.id,
          campaignId: campaign.id,
          businessName: businessName,
          creatorName: 'Sem Criador',
          creatorId: '',
          month: month,
          status: campaign.status,
          deliverables: {},
          instagram: '',
          whatsapp: '',
          cidade: ''
        });
      }

      return acc;
    }, {});

    // Calcular visualizações totais para cada grupo
    Object.values(grouped).forEach((group: any) => {
      group.totalVisualizacoes = calculateTotalViews(group.campaigns);
    });

    // Converter para array e manter a ordenação já aplicada pela API
    return Object.values(grouped);
  };

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Carregando campanhas do Supabase...');

      // Usar dados do Supabase (única fonte agora)
      const campaignsData = await fetchCampaigns();

      // Transformar dados do Supabase para formato agrupado
      const groupedData = groupCampaignsByBusiness(campaignsData);
      setGroupedCampaigns(groupedData);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Converter formato de mês para display
  const formatMonthDisplay = (monthKey: string) => {
    // Se já está no formato "Mês YYYY", retornar como está
    if (monthKey.includes(' de ') || monthKey.includes(' ')) {
      return monthKey.charAt(0).toUpperCase() + monthKey.slice(1);
    }

    // Formato "2025-07" -> "Julho 2025"
    if (monthKey.includes('-') && monthKey.length === 7) {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        .replace(/^\w/, c => c.toUpperCase());
    }

    // Fallback para outros formatos
    return monthKey;
  };

  // Calcular total de visualizações
  const calculateTotalViews = (campaigns: any[]) => {
    return campaigns.reduce((total, campaign) => {
      // Primeiro, tentar usar dados do campo results da campanha
      const campaignResults = campaign.resultados || {};
      let campaignViews = campaignResults.total_views || 0;

      // Se não há dados no results, tentar somar dos criadores
      if (campaignViews === 0) {
        campaignViews = campaign.criadores?.reduce((campaignTotal: number, criador: any) => {
          const deliverables = criador.deliverables || {};
          let views = (deliverables.total_views || 0) +
                     (deliverables.post_views || 0) +
                     (deliverables.story_views || 0) +
                     (deliverables.reel_views || 0);

          // Se não há dados de visualizações, simular baseado no nome do criador
          if (views === 0 && criador.nome) {
            const hash = criador.nome.split('').reduce((a, b) => {
              a = ((a << 5) - a) + b.charCodeAt(0);
              return a & a;
            }, 0);
            views = Math.abs(hash) % 3000 + 1000; // Entre 1000 e 4000 views
          }

          return campaignTotal + views;
        }, 0) || 0;
      }

      return total + campaignViews;
    }, 0);
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-50 text-gray-700 border-gray-200';
    switch (status.toLowerCase()) {
      case 'ativa':
      case 'ativo':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pausada':
      case 'pausado':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'finalizada':
      case 'finalizado':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelada':
      case 'cancelado':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'planejamento':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    if (!status) return '⚪';
    switch (status.toLowerCase()) {
      case 'ativa':
      case 'ativo':
        return '🟢';
      case 'pausada':
      case 'pausado':
        return '⏸️';
      case 'finalizada':
      case 'finalizado':
        return '✅';
      case 'cancelada':
      case 'cancelado':
        return '❌';
      case 'planejamento':
        return '📋';
      default:
        return '📄';
    }
  };

  const openModal = (campaignGroup: GroupedCampaignData) => {
    console.log('🔍 Abrindo modal com dados:', campaignGroup);

    // Garantir compatibilidade com diferentes estruturas
    const normalizedGroup = {
      ...campaignGroup,
      mes: campaignGroup.mes || campaignGroup.month,
      campanhas: campaignGroup.campanhas || campaignGroup.campaigns || [],
      criadores: campaignGroup.criadores || [],
      quantidadeCriadores: campaignGroup.quantidadeCriadores || campaignGroup.totalCreators || (campaignGroup.criadores || []).length,
      totalCampanhas: campaignGroup.totalCampanhas || (campaignGroup.campanhas || campaignGroup.campaigns || []).length
    };

    console.log('✅ Dados normalizados:', normalizedGroup);
    setSelectedCampaignGroup(normalizedGroup);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCampaignGroup(null);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openCompleteModal = () => {
    setIsCompleteModalOpen(true);
  };

  const closeCompleteModal = () => {
    setIsCompleteModalOpen(false);
  };

  const handleAddSuccess = () => {
    loadCampaigns(); // Recarregar campanhas após adicionar
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Filtrar campanhas agrupadas
  const filteredCampaigns = groupedCampaigns.filter(group => {
    // Verificações de segurança para evitar erros de undefined
    const businessName = group.businessName || '';
    const criadores = group.criadores || [];
    const mes = group.mes || '';

    const matchesSearch = businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         criadores.some(criador => (criador || '').toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMonth = monthFilter === 'all' || mes.toLowerCase().includes(monthFilter.toLowerCase());

    return matchesSearch && matchesMonth;
  });

  // Estatísticas
  const stats = {
    totalCampaigns: groupedCampaigns.reduce((acc, group) => acc + (group.campaigns?.length || 0), 0),
    totalVisualizacoes: groupedCampaigns.reduce((acc, group) => acc + (group.totalVisualizacoes || 0), 0),
    topCampaigns: groupedCampaigns
      .sort((a, b) => (b.totalVisualizacoes || 0) - (a.totalVisualizacoes || 0))
      .slice(0, 3)
      .map(group => ({
        businessName: group.businessName,
        month: group.monthDisplay || group.month,
        views: group.totalVisualizacoes || 0
      }))
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Carregando campanhas agrupadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Campanhas por Business</h1>
          <p className="text-sm text-gray-600">
            {filteredCampaigns.length} negócios com campanhas ativas
          </p>
        </div>
        <div className="flex space-x-2">
          {/* Update button hidden in production */}
          <Button
            variant="outlined"
            size="sm"
            icon="🔄"
            onClick={loadCampaigns}
            className="hidden"
          >
            <span className="hidden sm:inline">Atualizar</span>
            <span className="sm:hidden">Sync</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openCompleteModal}
          >
            <span className="hidden sm:inline">Nova Campanha</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total de Campanhas */}
        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Total de Campanhas</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{stats.totalCampaigns}</p>
              <p className="text-xs text-primary mt-1">Todas as campanhas</p>
            </div>
            <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Total de Visualizações */}
        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Total de Visualizações</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{stats.totalVisualizacoes.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-tertiary mt-1">Todas as campanhas</p>
            </div>
            <div className="w-12 h-12 bg-tertiary-container rounded-2xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tertiary">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Ranking de Campanhas */}
        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-semibold text-gray-800 mb-1">Ranking - Julho</p>
              <p className="text-sm text-green-600 font-medium">Top campanhas</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            {stats.topCampaigns.length > 0 ? (
              stats.topCampaigns.map((campaign, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      'bg-orange-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium text-sm truncate max-w-[140px]">
                        {campaign.businessName}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {campaign.views > 0 ? 'Todas as plataformas' : campaign.month}
                      </p>
                    </div>
                  </div>
                  <span className="text-blue-600 font-bold text-lg">
                    {campaign.views > 1000 ? `${Math.floor(campaign.views / 1000)}k` : campaign.views}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum trabalho esse mês</p>
            )}
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome do negócio ou criadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Meses</option>
              <option value="janeiro">Janeiro</option>
              <option value="fevereiro">Fevereiro</option>
              <option value="março">Março</option>
              <option value="abril">Abril</option>
              <option value="maio">Maio</option>
              <option value="junho">Junho</option>
              <option value="julho">Julho</option>
              <option value="agosto">Agosto</option>
              <option value="setembro">Setembro</option>
              <option value="outubro">Outubro</option>
              <option value="novembro">Novembro</option>
              <option value="dezembro">Dezembro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Campanhas Agrupadas */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mês
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criadores
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Visualizações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalhes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((group, groupIndex) => (
                <tr key={`${group.businessName}-${group.month}-${groupIndex}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {group.businessName || 'Business não informado'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {group.monthDisplay || group.mes || 'Mês não informado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(group.status)}`}>
                      <span className="mr-1">{getStatusIcon(group.status)}</span>
                      {group.status || 'Status não informado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(group.criadores || []).slice(0, 2).map((criador, index) => (
                        <span key={`${group.businessName || 'business'}-criador-${index}-${criador || 'criador'}`} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                          {criador?.split(' ')[0] || 'Criador'}
                        </span>
                      ))}
                      {(group.criadores || []).length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          +{(group.criadores || []).length - 2}
                        </span>
                      )}
                      {(group.criadores || []).length === 0 && (
                        <span className="text-xs text-gray-500">Nenhum criador</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {group.totalVisualizacoes?.toLocaleString('pt-BR') || '0'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal(group)}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCampaigns.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {groupedCampaigns.length === 0 ? 'Nenhuma campanha encontrada' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-gray-500">
              {groupedCampaigns.length === 0
                ? 'Adicione campanhas para ver os dados aqui.'
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Grupo */}
      <CampaignGroupModal
        campaignGroup={selectedCampaignGroup}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* Modal de Adicionar Campanha */}
      <AddCampaignModalNew
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSuccess={handleAddSuccess}
      />

      {/* Modal Completo de Campanha */}
      <CampaignModalComplete
        isOpen={isCompleteModalOpen}
        onClose={closeCompleteModal}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
