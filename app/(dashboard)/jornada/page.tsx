'use client';

import React, { useState, useEffect } from 'react';
import { getCampaignJourneyData, CampaignJourneyData } from '@/app/actions/sheetsActions';
import { useAuthStore } from '@/store/authStore';
import CampaignJourneyKanban from '@/components/CampaignJourneyKanban';
import Button from '@/components/ui/Button';

export default function JornadaPage() {
  const [campaigns, setCampaigns] = useState<CampaignJourneyData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuthStore();

  // Carrega os dados das campanhas da jornada
  const loadCampaignJourney = async () => {
    setLoading(true);
    try {
      console.log('🚀 Carregando campanhas da jornada...');
      const data = await getCampaignJourneyData();
      setCampaigns(data);
      console.log(`✅ ${data.length} campanhas carregadas na jornada`);
      console.log('📊 Campanhas carregadas:', data.map(c => ({
        businessName: c.businessName,
        mes: c.mes,
        id: c.id
      })));
    } catch (error) {
      console.error('❌ Erro ao carregar campanhas da jornada:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaignJourney();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Carregando campanhas da jornada...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 8rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Jornada das Campanhas</h1>
          <p className="text-sm text-gray-600">
            {campaigns.length} campanhas ativas • Arraste para mover entre estágios da jornada
          </p>
        </div>
        <Button
          variant="secondary"
          icon="🔄"
          onClick={loadCampaignJourney}
          className="text-sm"
          disabled={loading}
        >
          {loading ? 'Carregando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Kanban de Campanhas */}
      <CampaignJourneyKanban
        campaigns={campaigns}
        onRefresh={loadCampaignJourney}
      />

      {/* Estado vazio */}
      {campaigns.length === 0 && (
        <div className="text-center py-12 md:py-16">
          <div className="text-4xl md:text-6xl mb-4 md:mb-6">📹</div>
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 md:mb-3">
            Nenhuma campanha ativa encontrada
          </h3>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 max-w-md mx-auto px-4">
            Todas as campanhas foram finalizadas ou não há campanhas cadastradas na aba "campanhas" da planilha.
          </p>
          <Button
            variant="primary"
            icon="🔄"
            onClick={loadCampaignJourney}
            className="text-sm"
          >
            Recarregar
          </Button>
        </div>
      )}
    </div>
  );
}
