import { NextRequest, NextResponse } from 'next/server';
import { getCampaignJourneyData } from '@/app/actions/sheetsActions';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Testando getCampaignJourneyData...');
    
    const data = await getCampaignJourneyData();
    
    console.log(`📊 Total de campanhas encontradas: ${data.length}`);
    
    data.forEach(campaign => {
      console.log(`📋 ${campaign.businessName} - ${campaign.mes} - ${campaign.journeyStage}`);
    });

    return NextResponse.json({
      success: true,
      totalCampaigns: data.length,
      campaigns: data.map(c => ({
        id: c.id,
        businessName: c.businessName,
        mes: c.mes,
        journeyStage: c.journeyStage,
        totalCampanhas: c.totalCampanhas,
        quantidadeCriadores: c.quantidadeCriadores
      }))
    });

  } catch (error) {
    console.error('❌ Erro no debug da jornada:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
