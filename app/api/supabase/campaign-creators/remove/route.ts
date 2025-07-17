import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CampaignManager } from '@/lib/campaign-manager';
import { standardizeMonth } from '@/lib/month-utils';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Função auxiliar para converter nome do mês para número
function getMonthNumber(monthName: string): number {
  const months: { [key: string]: number } = {
    'jan': 1, 'fev': 2, 'mar': 3, 'abr': 4, 'mai': 5, 'jun': 6,
    'jul': 7, 'ago': 8, 'set': 9, 'out': 10, 'nov': 11, 'dez': 12
  };
  return months[monthName.toLowerCase()] || 7;
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, creatorId, userEmail, deleteLine = false } = body;

    console.log('🗑️ CampaignManager: Removendo criador da campanha:', {
      businessName,
      mes,
      creatorId,
      userEmail,
      deleteLine
    });

    if (!businessName || !mes) {
      return NextResponse.json({
        success: false,
        error: 'businessName e mes são obrigatórios'
      }, { status: 400 });
    }

    // Buscar campanha usando CampaignManager
    const campaignData = await CampaignManager.getSlots(businessName, mes);

    if (!campaignData.campaign) {
      return NextResponse.json({
        success: false,
        error: `Campanha não encontrada para ${businessName} - ${mes}`
      }, { status: 404 });
    }

    // Usar função SQL atômica diretamente
    const { data: result, error } = await supabase.rpc('remove_creator_atomic', {
      p_campaign_id: campaignData.campaign.id,
      p_creator_id: creatorId,
      p_user_email: userEmail || 'usuario@sistema.com',
      p_delete_line: deleteLine
    });

    if (error) {
      console.error('❌ Erro na função atômica:', error);
      return NextResponse.json({
        success: false,
        error: `Erro ao remover criador: ${error.message}`
      }, { status: 500 });
    }

    console.log('✅ Função atômica executada:', result);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: {
        campaignId: campaignData.campaign.id,
        campaignTitle: campaignData.campaign.title,
        businessName: campaignData.campaign.businessName,
        newQuantidade: result.newQuantidade,
        deleteLine,
        lineType: creatorId ? 'with_creator' : 'empty',
        atomicResult: result.data
      }
    });

  } catch (error) {
    console.error('❌ CampaignManager: Erro ao remover criador:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
