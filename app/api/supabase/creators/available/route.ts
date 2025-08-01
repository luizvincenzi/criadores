import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessCity = searchParams.get('city');
    const excludeCampaignId = searchParams.get('excludeCampaignId');

    console.log('🔍 Buscando criadores disponíveis:', {
      businessCity,
      excludeCampaignId
    });

    // Buscar criadores ativos (excluindo placeholder)
    let query = supabase
      .from('creators')
      .select(`
        id,
        name,
        social_media,
        contact_info,
        profile_info,
        status
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .in('status', ['Ativo', 'Precisa engajar'])
      .neq('name', '[SLOT VAZIO]');  // Excluir criador placeholder

    // Filtrar por cidade se especificada (campo não disponível atualmente)
    // if (businessCity) {
    //   query = query.eq('city', businessCity);
    // }

    const { data: creators, error: creatorsError } = await query.order('name');

    if (creatorsError) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return NextResponse.json({
        success: false,
        error: creatorsError.message
      }, { status: 500 });
    }

    // Se especificado, excluir criadores já associados à campanha
    let availableCreators = creators || [];
    
    if (excludeCampaignId && availableCreators.length > 0) {
      const { data: campaignCreators, error: campaignError } = await supabase
        .from('campaign_creators')
        .select('creator_id')
        .eq('campaign_id', excludeCampaignId)
        .neq('status', 'Removido');

      if (!campaignError && campaignCreators) {
        const excludeIds = campaignCreators.map(cc => cc.creator_id);
        availableCreators = availableCreators.filter(c => !excludeIds.includes(c.id));
      }
    }

    // Formatar dados para o frontend
    const formattedCreators = availableCreators.map(creator => ({
      id: creator.id,
      nome: creator.name,
      name: creator.name, // Compatibilidade
      cidade: creator.profile_info?.location?.city || '',
      instagram: creator.social_media?.instagram?.username || '',
      whatsapp: creator.contact_info?.whatsapp || '',
      seguidores: creator.social_media?.instagram?.followers || 0,
      status: creator.status,
      // Campos adicionais para compatibilidade
      instagramHandle: creator.social_media?.instagram?.username || '',
      followersCount: creator.social_media?.instagram?.followers || 0,
      contact_info: creator.contact_info,
      social_media: creator.social_media,
      profile_info: creator.profile_info
    }));

    console.log(`✅ ${formattedCreators.length} criadores disponíveis encontrados`);

    return NextResponse.json({
      success: true,
      data: formattedCreators,
      total: formattedCreators.length,
      filters: {
        city: businessCity,
        excludeCampaignId
      }
    });

  } catch (error) {
    console.error('❌ Erro interno ao buscar criadores:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
