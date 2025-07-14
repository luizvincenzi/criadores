'use client';

import React, { useState, useEffect } from 'react';
import { getGroupedCampaignsData, GroupedCampaignData } from '@/app/actions/sheetsActions';
import CampaignGroupModal from '@/components/CampaignGroupModal';
import AddCampaignModalNew from '@/components/AddCampaignModalNew';
import Button from '@/components/ui/Button';

export default function CampaignsPage() {
  const [groupedCampaigns, setGroupedCampaigns] = useState<GroupedCampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaignGroup, setSelectedCampaignGroup] = useState<GroupedCampaignData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await getGroupedCampaignsData();
      setGroupedCampaigns(data);
    } catch (error) {
      console.error('Erro ao carregar campanhas agrupadas:', error);
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

  const getStatusColor = (status: string) => {
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
    setSelectedCampaignGroup(campaignGroup);
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
    const matchesSearch = group.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.criadores.some(criador => criador.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMonth = monthFilter === 'all' || group.mes.toLowerCase().includes(monthFilter.toLowerCase());

    return matchesSearch && matchesMonth;
  });

  // Estatísticas
  const stats = {
    totalBusinesses: groupedCampaigns.length,
    totalCampaigns: groupedCampaigns.reduce((acc, group) => acc + group.totalCampanhas, 0),
    totalCreators: groupedCampaigns.reduce((acc, group) => acc + group.quantidadeCriadores, 0),
    uniqueCreators: new Set(groupedCampaigns.flatMap(group => group.criadores)).size,
    monthsActive: new Set(groupedCampaigns.map(group => group.mes)).size
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
            onClick={openAddModal}
          >
            <span className="hidden sm:inline">Nova Campanha</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Total de Negócios</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{stats.totalBusinesses}</p>
              <p className="text-xs text-secondary mt-1">Com campanhas</p>
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
              <p className="text-sm text-on-surface-variant font-medium">Total Campanhas</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{stats.totalCampaigns}</p>
              <p className="text-xs text-tertiary mt-1">Ativas</p>
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
              <p className="text-sm text-on-surface-variant font-medium">Criadores Contratados</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{stats.totalCreators}</p>
              <p className="text-xs text-secondary mt-1">Trabalhando</p>
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
              <p className="text-sm text-on-surface-variant font-medium">Criadores Únicos</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{stats.uniqueCreators}</p>
              <p className="text-xs text-primary mt-1">Diferentes</p>
            </div>
            <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>

        <div className="card-elevated p-6 hover:scale-105 transition-transform duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant font-medium">Meses Ativos</p>
              <p className="text-3xl font-bold text-on-surface mt-1">{stats.monthsActive}</p>
              <p className="text-xs text-tertiary mt-1">Período</p>
            </div>
            <div className="w-12 h-12 bg-tertiary-container rounded-2xl flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
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
      <div className="card-elevated overflow-hidden hover:scale-105 transition-transform duration-200">
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
                  Qtd. Criadores Contratados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criadores Selecionados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Campanhas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalhes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {group.businessName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {group.mes}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(group.status)}`}>
                      <span className="mr-1">{getStatusIcon(group.status)}</span>
                      {group.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {group.quantidadeCriadores}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {group.criadores.slice(0, 3).map((criador, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                          {criador}
                        </span>
                      ))}
                      {group.criadores.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          +{group.criadores.length - 3} mais
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {group.totalCampanhas}
                    </span>
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
              {campaigns.length === 0 ? 'Nenhuma campanha encontrada' : 'Nenhum resultado encontrado'}
            </h3>
            <p className="text-gray-500">
              {campaigns.length === 0 
                ? 'Configure o Google Sheets para ver os dados das campanhas.'
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
    </div>
  );
}
