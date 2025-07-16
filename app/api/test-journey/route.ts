import { NextRequest, NextResponse } from 'next/server';
import { fetchCampaignJourney } from '@/lib/dataSource';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testando fetchCampaignJourney...');
    
    const data = await fetchCampaignJourney();
    
    console.log(`📊 Total de campanhas na jornada: ${data.length}`);
    
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
    console.error('❌ Erro ao testar jornada:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
