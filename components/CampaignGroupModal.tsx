'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import CreatorAdvancedCard from '@/components/CreatorAdvancedCard';
import CampaignSharePanel from '@/components/CampaignSharePanel';

// Tipo para dados agrupados de campanhas
interface GroupedCampaignData {
  businessName: string;
  businessId: string;
  month: string;
  campaigns: any[];
  criadores: string[];
  totalCreators: number;
  status: string;
  mes?: string; // Para compatibilidade
  campanhas?: any[]; // Para compatibilidade
  quantidadeCriadores?: number; // Para compatibilidade
  totalCampanhas?: number; // Para compatibilidade
}

interface CampaignGroupModalProps {
  campaignGroup: GroupedCampaignData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CampaignGroupModal({ campaignGroup, isOpen, onClose }: CampaignGroupModalProps) {
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [campaignUrl, setCampaignUrl] = useState<string | null>(null);
  const [creatorsData, setCreatorsData] = useState<any[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(false);
  const [expandedCreators, setExpandedCreators] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen && campaignGroup) {
      loadCreatorsData();
    }
  }, [isOpen, campaignGroup]);

  const loadCreatorsData = async () => {
    if (!campaignGroup) return;

    try {
      setIsLoadingCreators(true);

      // Buscar dados detalhados dos criadores via API
      const response = await fetch(`/api/supabase/creator-slots?businessName=${encodeURIComponent(campaignGroup.businessName)}&mes=${encodeURIComponent(campaignGroup.mes || campaignGroup.month)}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.slots) {
          setCreatorsData(data.slots.filter((slot: any) => slot.influenciador && slot.influenciador.trim() !== ''));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos criadores:', error);
    } finally {
      setIsLoadingCreators(false);
    }
  };

  const toggleCreatorExpansion = (creatorId: string) => {
    const newExpanded = new Set(expandedCreators);
    if (newExpanded.has(creatorId)) {
      newExpanded.delete(creatorId);
    } else {
      newExpanded.add(creatorId);
    }
    setExpandedCreators(newExpanded);
  };

  if (!isOpen || !campaignGroup) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
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

  const generateCampaignUrl = async () => {
    try {
      setIsGeneratingUrl(true);

      const response = await fetch('/api/generate-campaign-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: campaignGroup.businessName,
          month: campaignGroup.mes
        })
      });

      const result = await response.json();

      if (result.success) {
        setCampaignUrl(result.data.campaignUrl);
        // Copiar URL para clipboard
        await navigator.clipboard.writeText(result.data.campaignUrl);
        alert('URL da landing page copiada para a área de transferência!');
      } else {
        alert('Erro ao gerar URL: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao gerar URL:', error);
      alert('Erro ao gerar URL da campanha');
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const openLandingPage = () => {
    const businessSlug = campaignGroup.businessName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const monthSlug = campaignGroup.mes
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();

    const url = `/campaign/${businessSlug}/${monthSlug}`;
    window.open(url, '_blank');
  };

  const shareCampaign = async () => {
    try {
      const response = await fetch('/api/generate-campaign-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: campaignGroup.businessName,
          month: campaignGroup.mes
        })
      });

      const result = await response.json();

      if (result.success) {
        window.open(result.data.shareUrls.whatsapp, '_blank');
      } else {
        alert('Erro ao gerar link de compartilhamento: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('Erro ao compartilhar campanha');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container - Material Design 3 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[95vh] overflow-hidden"
          style={{ backgroundColor: '#ffffff' }}
        >

          {/* Header - Material Design 3 */}
          <div
            className="bg-white p-8"
            style={{ borderBottom: '1px solid #e0e0e0' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-light text-gray-900 mb-3">
                  {campaignGroup.businessName}
                </h2>
                <div className="flex items-center space-x-6 text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {campaignGroup.mes || campaignGroup.month || 'N/A'}
                  </span>
                  <div
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: campaignGroup.status.toLowerCase() === 'ativa' ? '#e8f5e8' : '#f3f4f6',
                      color: campaignGroup.status.toLowerCase() === 'ativa' ? '#2e7d32' : '#6b7280',
                      border: `1px solid ${campaignGroup.status.toLowerCase() === 'ativa' ? '#c8e6c9' : '#d1d5db'}`
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-2"
                      style={{
                        backgroundColor: campaignGroup.status.toLowerCase() === 'ativa' ? '#4caf50' : '#9ca3af'
                      }}
                    />
                    {campaignGroup.status}
                  </div>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {campaignGroup.quantidadeCriadores || campaignGroup.totalCreators || (campaignGroup.criadores || []).length || 0} criadores contratados
                  </span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {campaignGroup.totalCampanhas || (campaignGroup.campanhas || campaignGroup.campaigns || []).length || 0} campanhas
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end">
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(95vh-200px)] overflow-y-auto">

            {/* Painel de Compartilhamento e Landing Page */}
            <div className="mb-8">
              <CampaignSharePanel
                businessName={campaignGroup.businessName}
                month={campaignGroup.mes || campaignGroup.month}
                campaignUrl={campaignUrl || undefined}
                onUrlGenerated={setCampaignUrl}
              />
            </div>
            
            {/* Gestão Avançada de Criadores */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Criadores Selecionados
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {creatorsData.length}
                  </span>
                </h3>

                {isLoadingCreators && (
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Carregando dados...
                  </div>
                )}
              </div>

              {creatorsData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {creatorsData.map((creatorSlot, index) => {
                    // Simular dados do criador baseado no que temos
                    const mockCreatorData = {
                      id: creatorSlot.creatorId || `creator-${index}`,
                      name: creatorSlot.influenciador,
                      social_media: {
                        instagram: {
                          username: creatorSlot.influenciador.toLowerCase().replace(/\s+/g, ''),
                          followers: Math.floor(Math.random() * 100000) + 10000, // Mock data
                          engagement_rate: Math.random() * 5 + 2,
                          verified: Math.random() > 0.7
                        },
                        tiktok: {
                          username: creatorSlot.influenciador.toLowerCase().replace(/\s+/g, ''),
                          followers: Math.floor(Math.random() * 50000) + 5000
                        }
                      },
                      contact_info: {
                        whatsapp: '5511999999999', // Mock data
                        email: `${creatorSlot.influenciador.toLowerCase().replace(/\s+/g, '')}@email.com`
                      },
                      profile_info: {
                        category: 'Lifestyle',
                        location: {
                          city: 'São Paulo',
                          state: 'SP'
                        },
                        rates: {
                          post: 500,
                          story: 200,
                          reel: 800
                        }
                      },
                      performance_metrics: {
                        total_campaigns: Math.floor(Math.random() * 20) + 5,
                        avg_engagement: Math.random() * 5 + 2,
                        completion_rate: Math.floor(Math.random() * 20) + 80,
                        rating: Math.random() * 1 + 4
                      },
                      status: 'Ativo'
                    };

                    const deliverables = {
                      briefing_complete: creatorSlot.briefingCompleto || 'Pendente',
                      visit_datetime: creatorSlot.dataHoraVisita || '',
                      guest_quantity: parseInt(creatorSlot.quantidadeConvidados) || 0,
                      visit_confirmed: creatorSlot.visitaConfirmado || 'Pendente',
                      post_datetime: creatorSlot.dataHoraPostagem || '',
                      video_approved: creatorSlot.videoAprovado || 'Pendente',
                      video_posted: creatorSlot.videoPostado || 'Não'
                    };

                    return (
                      <CreatorAdvancedCard
                        key={mockCreatorData.id}
                        creator={mockCreatorData}
                        deliverables={deliverables}
                        campaignData={creatorSlot}
                        isExpanded={expandedCreators.has(mockCreatorData.id)}
                        onToggleExpand={() => toggleCreatorExpansion(mockCreatorData.id)}
                      />
                    );
                  })}
                </div>
              ) : !isLoadingCreators ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👥</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum criador encontrado</h4>
                  <p className="text-gray-500">Os dados dos criadores serão carregados quando disponíveis.</p>
                </div>
              ) : null}
            </div>

            {/* Detalhes das Campanhas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Detalhes das Campanhas
              </h3>
              
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Campanha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Criador
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Responsável
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data Visita
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Observações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(campaignGroup.campanhas || campaignGroup.campaigns || []).map((campaign, index) => (
                        <tr key={`campaign-${index}-${campaign.id || campaign.campanha || index}`} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.campanha || campaign.nome}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.influenciador}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {campaign.responsavel}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(campaign.dataHoraVisita)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate" title={campaign.notas}>
                              {campaign.notas || '-'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
