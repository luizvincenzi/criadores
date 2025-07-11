'use client';

import React from 'react';
import Image from 'next/image';

interface Creator {
  name: string;
  username: string;
  followers: number;
  engagementRate: number;
}

interface Campaign {
  title: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface Business {
  id: number;
  businessName: string;
  journeyStage: string;
  nextAction: string;
  contactDate: string;
  value: number;
  description: string;
  creators: Creator[];
  campaigns: Campaign[];
}

interface BusinessDetailModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessDetailModal({ business, isOpen, onClose }: BusinessDetailModalProps) {
  if (!isOpen || !business) return null;

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'Ativa': 'bg-green-100 text-green-800',
      'Planejamento': 'bg-blue-100 text-blue-800',
      'Em Aprovação': 'bg-yellow-100 text-yellow-800',
      'Pausada': 'bg-orange-100 text-orange-800',
      'Finalizada': 'bg-gray-100 text-gray-800',
      'Cancelada': 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-outline-variant p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">{business.businessName}</h2>
            <p className="text-on-surface-variant mt-1">Detalhes do Projeto</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-container rounded-full transition-colors"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-elevated p-4">
              <h3 className="font-semibold text-on-surface mb-3">📊 Informações do Projeto</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-on-surface-variant">Fase Atual:</span>
                  <p className="font-medium text-on-surface">{business.journeyStage}</p>
                </div>
                <div>
                  <span className="text-sm text-on-surface-variant">Valor do Projeto:</span>
                  <p className="font-medium text-primary text-lg">
                    R$ {business.value.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-on-surface-variant">Data de Contato:</span>
                  <p className="font-medium text-on-surface">
                    {new Date(business.contactDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-elevated p-4">
              <h3 className="font-semibold text-on-surface mb-3">🎯 Próxima Ação</h3>
              <p className="text-on-surface">{business.nextAction}</p>
            </div>
          </div>

          {/* Descrição */}
          <div className="card-elevated p-4">
            <h3 className="font-semibold text-on-surface mb-3">📝 Descrição do Projeto</h3>
            <p className="text-on-surface leading-relaxed">{business.description}</p>
          </div>

          {/* Influenciadores */}
          <div className="card-elevated p-4">
            <h3 className="font-semibold text-on-surface mb-4">
              👥 Influenciadores Contratados ({business.creators.length})
            </h3>
            
            {business.creators.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {business.creators.map((creator, index) => (
                  <div key={index} className="bg-surface-container rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12">
                        <Image
                          src="/placeholder-avatar.svg"
                          alt={`Avatar de ${creator.name}`}
                          fill
                          className="rounded-full object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-on-surface">{creator.name}</h4>
                        <p className="text-sm text-on-surface-variant">@{creator.username}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary">
                          {formatFollowers(creator.followers)}
                        </div>
                        <div className="text-xs text-on-surface-variant">Seguidores</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-secondary">
                          {creator.engagementRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-on-surface-variant">Engajamento</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-on-surface-variant">
                <div className="text-4xl mb-2">👥</div>
                <p>Nenhum influenciador contratado ainda</p>
              </div>
            )}
          </div>

          {/* Campanhas */}
          <div className="card-elevated p-4">
            <h3 className="font-semibold text-on-surface mb-4">
              📢 Campanhas Relacionadas ({business.campaigns.length})
            </h3>
            
            {business.campaigns.length > 0 ? (
              <div className="space-y-3">
                {business.campaigns.map((campaign, index) => (
                  <div key={index} className="bg-surface-container rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-on-surface">{campaign.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-on-surface-variant">Início:</span>
                        <span className="ml-2 text-on-surface">
                          {new Date(campaign.startDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div>
                        <span className="text-on-surface-variant">Fim:</span>
                        <span className="ml-2 text-on-surface">
                          {new Date(campaign.endDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-on-surface-variant">
                <div className="text-4xl mb-2">📢</div>
                <p>Nenhuma campanha criada ainda</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface border-t border-outline-variant p-6 flex justify-end space-x-3">
          <button onClick={onClose} className="btn-outlined">
            Fechar
          </button>
          <button className="btn-primary">
            <span className="mr-2">✏️</span>
            Editar Projeto
          </button>
        </div>
      </div>
    </div>
  );
}
