'use client';

import React, { useState, useEffect } from 'react';
import { getCampaignsData, CampaignData } from '@/app/actions/sheetsActions';
import CampaignModal from '@/components/CampaignModal';
import AddCampaignModal from '@/components/AddCampaignModal';
import Button from '@/components/ui/Button';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await getCampaignsData();
      setCampaigns(data);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativa':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pausada':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'finalizada':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const openModal = (campaign: CampaignData) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedCampaign(null);
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

  // Filtrar campanhas
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.criadores.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || campaign.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: campaigns.length,
    ativas: campaigns.filter(c => c.status.toLowerCase() === 'ativa').length,
    pausadas: campaigns.filter(c => c.status.toLowerCase() === 'pausada').length,
    finalizadas: campaigns.filter(c => c.status.toLowerCase() === 'finalizada').length,
    orcamentoTotal: campaigns.reduce((acc, c) => acc + c.orcamento, 0)
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
          <h1 className="text-xl font-bold text-gray-900 mb-1">Campanhas</h1>
          <p className="text-sm text-gray-600">
            {filteredCampaigns.length} campanhas encontradas
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outlined"
            size="sm"
            icon="🔄"
            onClick={loadCampaigns}
          >
            <span className="hidden sm:inline">Atualizar</span>
            <span className="sm:hidden">Sync</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon="📹"
            onClick={openAddModal}
          >
            <span className="hidden sm:inline">Nova Campanha</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ativas</p>
              <p className="text-2xl font-bold text-green-600">{stats.ativas}</p>
            </div>
            <div className="text-2xl">🟢</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pausadas</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pausadas}</p>
            </div>
            <div className="text-2xl">⏸️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Finalizadas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.finalizadas}</p>
            </div>
            <div className="text-2xl">✅</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Orçamento Total</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.orcamentoTotal)}</p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome, descrição ou criadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="ativa">Ativa</option>
              <option value="pausada">Pausada</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Campanhas */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campanha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mês
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orçamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criadores
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalhes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.nome}
                        {campaign.count && campaign.count > 1 && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {campaign.count} campanhas
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{campaign.descricao}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {campaign.mes || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{formatDate(campaign.dataInicio)}</div>
                      <div className="text-gray-500">até {formatDate(campaign.dataFim)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {formatCurrency(campaign.orcamento)}
                    {campaign.count && campaign.count > 1 && (
                      <div className="text-xs text-gray-500">
                        (soma de {campaign.count} campanhas)
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="truncate max-w-xs" title={campaign.criadores}>
                      {campaign.criadores || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal(campaign)}
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

      {/* Modal de Detalhes */}
      <CampaignModal
        campaign={selectedCampaign}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* Modal de Adicionar Campanha */}
      <AddCampaignModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
