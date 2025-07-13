'use client';

import React, { useState } from 'react';
import { GroupedCampaignData } from '@/app/actions/sheetsActions';
import Button from '@/components/ui/Button';

interface CampaignGroupModalProps {
  campaignGroup: GroupedCampaignData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CampaignGroupModal({ campaignGroup, isOpen, onClose }: CampaignGroupModalProps) {
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [campaignUrl, setCampaignUrl] = useState<string | null>(null);

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
                    {campaignGroup.mes}
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
                    {campaignGroup.quantidadeCriadores} criadores contratados
                  </span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {campaignGroup.totalCampanhas} campanhas
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Botões de Ação da Landing Page - Material Design 3 */}
                <button
                  onClick={openLandingPage}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-full transition-all duration-200 hover:shadow-md"
                  style={{ backgroundColor: '#00629B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#004d7a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#00629B';
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Ver Landing Page
                </button>

                <button
                  onClick={generateCampaignUrl}
                  disabled={isGeneratingUrl}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-full transition-all duration-200 hover:shadow-md disabled:opacity-50"
                  style={{ backgroundColor: '#4CAF50' }}
                  onMouseEnter={(e) => {
                    if (!isGeneratingUrl) {
                      e.currentTarget.style.backgroundColor = '#45a049';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isGeneratingUrl) {
                      e.currentTarget.style.backgroundColor = '#4CAF50';
                    }
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {isGeneratingUrl ? 'Gerando...' : 'Copiar URL'}
                </button>

                <button
                  onClick={shareCampaign}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-full transition-all duration-200 hover:shadow-md"
                  style={{ backgroundColor: '#25D366' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#20BA5A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#25D366';
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Compartilhar
                </button>

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
            
            {/* Resumo dos Criadores */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Criadores Selecionados
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaignGroup.criadores.map((criador, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{criador}</p>
                        <p className="text-sm text-gray-500">Criador</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                      {campaignGroup.campanhas.map((campaign, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
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
