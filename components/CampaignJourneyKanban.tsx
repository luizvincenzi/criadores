'use client';

import React, { useState } from 'react';
import { CampaignJourneyData } from '@/app/actions/sheetsActions';
import CampaignJourneyModal from './CampaignJourneyModal';

interface CampaignJourneyKanbanProps {
  campaigns: CampaignJourneyData[];
  onRefresh: () => void;
}

export default function CampaignJourneyKanban({ campaigns, onRefresh }: CampaignJourneyKanbanProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignJourneyData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Agrupar campanhas por estágio
  const stages = [
    { id: 'Reunião Briefing', title: 'Reunião Briefing', icon: '📋', color: 'bg-blue-50 border-blue-200' },
    { id: 'Agendamentos', title: 'Agendamentos', icon: '📅', color: 'bg-yellow-50 border-yellow-200' },
    { id: 'Entrega Final', title: 'Entrega Final', icon: '✅', color: 'bg-green-50 border-green-200' }
  ];

  const getCampaignsByStage = (stageId: string) => {
    return campaigns.filter(campaign => campaign.journeyStage === stageId);
  };

  const handleCampaignClick = (campaign: CampaignJourneyData) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCampaign(null);
    setIsModalOpen(false);
  };

  const handleStatusUpdate = () => {
    // Recarregar dados após atualização
    onRefresh();
    handleCloseModal();
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stages.map((stage) => {
          const stageCampaigns = getCampaignsByStage(stage.id);
          
          return (
            <div key={stage.id} className={`${stage.color} rounded-lg border-2 border-dashed p-4`}>
              {/* Header da Coluna */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{stage.icon}</span>
                  <h3 className="font-semibold text-gray-900">{stage.title}</h3>
                </div>
                <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                  {stageCampaigns.length}
                </span>
              </div>

              {/* Cards das Campanhas */}
              <div className="space-y-3">
                {stageCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => handleCampaignClick(campaign)}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                  >
                    {/* Título: Nome do Business */}
                    <h4 className="font-semibold text-gray-900 mb-2 text-lg">
                      {campaign.businessName}
                    </h4>
                    
                    {/* Subtítulo: Mês da Campanha */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {campaign.mes}
                      </span>
                    </div>

                    {/* Informações da Campanha */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span>Campanhas:</span>
                        <span className="font-medium">{campaign.totalCampanhas}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Criadores:</span>
                        <span className="font-medium">{campaign.quantidadeCriadores}</span>
                      </div>
                    </div>

                    {/* Plano do Business */}
                    {campaign.businessData?.planoAtual && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                          {campaign.businessData.planoAtual}
                        </span>
                      </div>
                    )}

                    {/* Botão de Ação */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                        Ver Detalhes da Campanha →
                      </button>
                    </div>
                  </div>
                ))}

                {/* Estado vazio da coluna */}
                {stageCampaigns.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-3xl mb-2">{stage.icon}</div>
                    <p className="text-sm">Nenhuma campanha neste estágio</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalhes da Campanha */}
      <CampaignJourneyModal
        campaign={selectedCampaign}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </>
  );
}
