import { NextRequest, NextResponse } from 'next/server';
import { getCampaignJourneyData } from '@/app/actions/sheetsActions';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testando Campaign_IDs na jornada...');

    const journeyData = await getCampaignJourneyData();
    
    const testResults = journeyData.map(campaign => ({
      businessName: campaign.businessName,
      mes: campaign.mes,
      id: campaign.id,
      primaryCampaignId: campaign.primaryCampaignId,
      campaignIds: campaign.campaignIds,
      totalCampanhas: campaign.totalCampanhas,
      campanhasWithIds: campaign.campanhas.map(c => ({
        id: c.id,
        influenciador: c.influenciador,
        business: c.business
      }))
    }));

    console.log('📊 Resultados do teste:', testResults);

    return NextResponse.json({
      success: true,
      totalCampaigns: journeyData.length,
      testResults,
      summary: {
        campaignsWithPrimaryId: testResults.filter(c => c.primaryCampaignId).length,
        campaignsWithMultipleIds: testResults.filter(c => c.campaignIds.length > 1).length,
        totalCampaignIds: testResults.reduce((sum, c) => sum + c.campaignIds.length, 0)
      }
    });

  } catch (error) {
    console.error('❌ Erro no teste de Campaign_IDs:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
