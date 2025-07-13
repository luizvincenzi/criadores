import { NextRequest, NextResponse } from 'next/server';
import { getCampaignJourneyData } from '@/app/actions/sheetsActions';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Carregando dados da jornada para análise...');

    const journeyData = await getCampaignJourneyData();
    
    console.log(`📊 Total de campanhas na jornada: ${journeyData.length}`);

    // Calcular estatísticas por estágio
    const campaignsByStage = {
      'Reunião de briefing': 0,
      'Agendamentos': 0,
      'Entrega final': 0,
      'Finalizado': 0
    };

    const detailedBreakdown: any[] = [];

    journeyData.forEach(campaign => {
      const stage = campaign.journeyStage || 'Reunião Briefing';
      
      // Mapear para as chaves corretas do dashboard
      const stageKey = stage === 'Reunião Briefing' ? 'Reunião de briefing' : 
                      stage === 'Agendamentos' ? 'Agendamentos' :
                      stage === 'Entrega Final' ? 'Entrega final' : 'Reunião de briefing';
      
      if (stageKey in campaignsByStage) {
        campaignsByStage[stageKey as keyof typeof campaignsByStage]++;
      }

      detailedBreakdown.push({
        businessName: campaign.businessName,
        mes: campaign.mes,
        journeyStage: campaign.journeyStage,
        mappedStageKey: stageKey,
        totalCampanhas: campaign.totalCampanhas,
        quantidadeCriadores: campaign.quantidadeCriadores
      });

      console.log(`📋 ${campaign.businessName}-${campaign.mes}: Stage=${stage} → Key=${stageKey}`);
    });

    // Filtrar apenas julho para verificar
    const julhoData = detailedBreakdown.filter(item => 
      item.mes.toLowerCase().includes('jul') || 
      item.mes.toLowerCase().includes('july') ||
      item.mes === 'Jul'
    );

    const julhoStats = {
      'Reunião de briefing': 0,
      'Agendamentos': 0,
      'Entrega final': 0,
      'Finalizado': 0
    };

    julhoData.forEach(item => {
      if (item.mappedStageKey in julhoStats) {
        julhoStats[item.mappedStageKey as keyof typeof julhoStats]++;
      }
    });

    return NextResponse.json({ 
      success: true,
      debug: {
        totalCampaigns: journeyData.length,
        campaignsByStage: campaignsByStage,
        julhoSpecific: {
          totalJulho: julhoData.length,
          julhoStats: julhoStats,
          julhoDetailed: julhoData
        },
        allCampaigns: detailedBreakdown,
        rawJourneyData: journeyData.slice(0, 10) // Primeiras 10 para debug
      }
    });

  } catch (error) {
    console.error('❌ DEBUG: Erro ao analisar dados da jornada:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}
