'use client';

import React from 'react';
import { CampaignData } from '@/app/actions/sheetsActions';

interface CampaignModalProps {
  campaign: CampaignData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CampaignModal({ campaign, isOpen, onClose }: CampaignModalProps) {
  if (!isOpen || !campaign) return null;

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Detalhes da Campanha</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações Gerais</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome da Campanha</label>
                      <p className="text-base font-semibold text-gray-900">{campaign.nome}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Orçamento</label>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(campaign.orcamento)}
                        {campaign.count && campaign.count > 1 && (
                          <span className="text-sm text-gray-500 block">
                            (soma de {campaign.count} campanhas)
                          </span>
                        )}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Mês</label>
                      <p className="text-base text-gray-900">{campaign.mes || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Cronograma</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data de Início</label>
                      <p className="text-base text-gray-900">{formatDate(campaign.dataInicio)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data de Fim</label>
                      <p className="text-base text-gray-900">{formatDate(campaign.dataFim)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Criadores Envolvidos</label>
                      <p className="text-base text-gray-900">{campaign.criadores || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Descrição */}
            {campaign.descricao && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{campaign.descricao}</p>
                </div>
              </div>
            )}

            {/* Resultados */}
            {campaign.resultados && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Resultados</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-800 whitespace-pre-wrap">{campaign.resultados}</p>
                </div>
              </div>
            )}

            {/* Observações */}
            {campaign.observacoes && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-yellow-800 whitespace-pre-wrap">{campaign.observacoes}</p>
                </div>
              </div>
            )}

            {/* Resumo Visual */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{campaign.status}</div>
                  <div className="text-sm text-blue-800">Status</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(campaign.orcamento)}</div>
                  <div className="text-sm text-green-800">Orçamento</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{campaign.criadores || 'N/A'}</div>
                  <div className="text-sm text-purple-800">Criadores</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {campaign.dataInicio && campaign.dataFim ? 
                      Math.ceil((new Date(campaign.dataFim).getTime() - new Date(campaign.dataInicio).getTime()) / (1000 * 60 * 60 * 24)) + 'd'
                      : 'N/A'
                    }
                  </div>
                  <div className="text-sm text-orange-800">Duração</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
