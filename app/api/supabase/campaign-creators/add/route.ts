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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, creatorId, userEmail = 'teste@sistema.com', increaseSlots = false } = body;

    console.log('🚀 NOVA API ATÔMICA: Iniciando adição de criador');
    console.log('📊 Parâmetros:', { businessName, mes, creatorId, userEmail, increaseSlots });

    if (!businessName || !mes || !creatorId) {
      console.log('❌ Parâmetros obrigatórios faltando');
      return NextResponse.json({
        success: false,
        error: 'businessName, mes e creatorId são obrigatórios'
      }, { status: 400 });
    }

    // Buscar campanha ID diretamente
    console.log('🔍 Buscando campanha...');

    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('name', businessName)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (!business) {
      console.log('❌ Business não encontrado:', businessName);
      return NextResponse.json({
        success: false,
        error: `Business "${businessName}" não encontrado`
      }, { status: 404 });
    }

    const monthYearId = parseInt(mes);
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('business_id', business.id)
      .eq('month_year_id', monthYearId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (!campaign) {
      console.log('❌ Campanha não encontrada:', { businessName, mes, monthYearId });
      return NextResponse.json({
        success: false,
        error: `Campanha não encontrada para ${businessName} - ${mes}`
      }, { status: 404 });
    }

    console.log('✅ Campanha encontrada:', campaign.id);

    // Executar função atômica
    console.log('🔧 Executando função atômica...');
    const { data: result, error } = await supabase.rpc('add_creator_atomic', {
      p_campaign_id: campaign.id,
      p_creator_id: creatorId,
      p_user_email: userEmail,
      p_increase_slots: increaseSlots
    });

    if (error) {
      console.error('❌ Erro na função atômica:', error);
      return NextResponse.json({
        success: false,
        error: `Erro na função atômica: ${error.message}`,
        details: error
      }, { status: 500 });
    }

    console.log('✅ Função atômica executada com sucesso:', result);

    return NextResponse.json({
      success: true,
      message: 'Função atômica executada com sucesso',
      data: {
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        businessName,
        atomicResult: result
      }
    });

  } catch (error) {
    console.error('❌ Erro geral na API:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}


