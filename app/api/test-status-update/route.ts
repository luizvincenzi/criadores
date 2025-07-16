import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { businessName, mes, newStatus } = body;

    console.log('🔄 Testando atualização de status:', {
      businessName,
      mes,
      newStatus
    });

    // Primeiro, buscar o business_id
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('name', businessName)
      .eq('organization_id', DEFAULT_ORG_ID);

    if (businessError) {
      console.error('❌ Erro ao buscar business:', businessError);
      return NextResponse.json({
        success: false,
        error: businessError.message
      }, { status: 500 });
    }

    if (!businesses || businesses.length === 0) {
      console.error('❌ Business não encontrado:', businessName);
      return NextResponse.json({
        success: false,
        error: `Business "${businessName}" não encontrado`
      }, { status: 404 });
    }

    const business = businesses[0];
    console.log('✅ Business encontrado:', business);

    // Buscar campanhas do business no mês específico
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, status, month')
      .eq('business_id', business.id)
      .eq('month', mes)
      .eq('organization_id', DEFAULT_ORG_ID);

    if (campaignError) {
      console.error('❌ Erro ao buscar campanhas:', campaignError);
      return NextResponse.json({
        success: false,
        error: campaignError.message
      }, { status: 500 });
    }

    console.log(`📋 Campanhas encontradas: ${campaigns?.length || 0}`);
    console.log('📊 Campanhas:', campaigns);

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Nenhuma campanha encontrada para ${businessName} no mês ${mes}`
      }, { status: 404 });
    }

    // Atualizar status de todas as campanhas encontradas
    const { data: updatedCampaigns, error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('business_id', business.id)
      .eq('month', mes)
      .eq('organization_id', DEFAULT_ORG_ID)
      .select();

    if (updateError) {
      console.error('❌ Erro ao atualizar campanhas:', updateError);
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { status: 500 });
    }

    console.log('✅ Campanhas atualizadas:', updatedCampaigns);

    return NextResponse.json({
      success: true,
      message: `Status atualizado para: ${newStatus}`,
      business: business,
      campaignsFound: campaigns.length,
      campaignsUpdated: updatedCampaigns?.length || 0,
      updatedCampaigns: updatedCampaigns
    }, { headers });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
