import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Função para gerar UUID válido a partir de string
function generateUUIDFromString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const hashStr = Math.abs(hash).toString(16).padStart(8, '0');
  const timestamp = Date.now().toString(16).slice(-8);
  const random = Math.random().toString(16).slice(2, 10);
  
  return `${hashStr.slice(0, 8)}-${timestamp.slice(0, 4)}-4${timestamp.slice(4, 7)}-8${random.slice(0, 3)}-${random.slice(3, 15).padEnd(12, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessName = searchParams.get('businessName');
    const mes = searchParams.get('mes');
    const quantidadeContratada = parseInt(searchParams.get('quantidadeContratada') || '0');

    console.log(`🎯 Buscando slots para ${businessName} - ${mes} (${quantidadeContratada} slots)`);

    if (!businessName || !mes) {
      console.error('❌ Parâmetros obrigatórios ausentes:', { businessName, mes });
      return NextResponse.json(
        { success: false, error: 'businessName e mes são obrigatórios' },
        { status: 400 }
      );
    }

    if (quantidadeContratada <= 0) {
      console.error('❌ Quantidade contratada inválida:', quantidadeContratada);
      return NextResponse.json(
        { success: false, error: 'quantidadeContratada deve ser maior que 0' },
        { status: 400 }
      );
    }

    // 1. Buscar business_id pelo nome
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('name', businessName)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (businessError || !business) {
      console.error('❌ Business não encontrado:', businessName);
      return NextResponse.json(
        { success: false, error: `Business "${businessName}" não encontrado` },
        { status: 404 }
      );
    }

    // 2. Buscar campanha existente (não criar automaticamente)
    let { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('business_id', business.id)
      .eq('month', mes)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (campaignError || !campaign) {
      console.error('❌ Campanha não encontrada:', { businessName, mes, businessId: business.id });
      return NextResponse.json(
        { success: false, error: `Campanha não encontrada para ${businessName} - ${mes}` },
        { status: 404 }
      );
    }

    let campaignId = campaign.id;

    // 3. Buscar slots existentes
    const { data: existingSlots, error: slotsError } = await supabase
      .from('campaign_creators')
      .select(`
        *,
        creator:creators(id, name, status, social_media, contact_info, profile_info)
      `)
      .eq('campaign_id', campaignId)
      .neq('status', 'Removido')
      .order('created_at');

    if (slotsError) {
      console.error('❌ Erro ao buscar slots:', slotsError);
      return NextResponse.json(
        { success: false, error: `Erro ao buscar slots: ${slotsError.message}` },
        { status: 500 }
      );
    }

    // 4. Buscar criadores disponíveis
    const { data: availableCreators, error: creatorsError } = await supabase
      .from('creators')
      .select('id, name, status, social_media, contact_info, profile_info')
      .eq('organization_id', DEFAULT_ORG_ID)
      .in('status', ['Ativo', 'Precisa engajar'])
      .order('name');

    if (creatorsError) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return NextResponse.json(
        { success: false, error: `Erro ao buscar criadores: ${creatorsError.message}` },
        { status: 500 }
      );
    }

    // 5. Criar estrutura de slots
    const slots = [];
    for (let i = 0; i < quantidadeContratada; i++) {
      const existingSlot = existingSlots[i];
      
      slots.push({
        index: i,
        influenciador: existingSlot?.creator?.name || '',
        briefingCompleto: existingSlot?.deliverables?.briefing_complete || 'Pendente',
        dataHoraVisita: existingSlot?.deliverables?.visit_datetime || '',
        quantidadeConvidados: existingSlot?.deliverables?.guest_quantity || '',
        visitaConfirmado: existingSlot?.deliverables?.visit_confirmed || 'Pendente',
        dataHoraPostagem: existingSlot?.deliverables?.post_datetime || '',
        videoAprovado: existingSlot?.deliverables?.video_approved || 'Pendente',
        videoPostado: existingSlot?.deliverables?.video_posted || 'Não',
        videoInstagramLink: existingSlot?.video_instagram_link || '',
        videoTiktokLink: existingSlot?.video_tiktok_link || '',
        isExisting: !!existingSlot,
        rowIndex: i + 1,
        businessName,
        businessId: business.id,
        campaignId,
        creatorId: existingSlot?.creator_id || null,
        // Dados adicionais do criador
        creatorData: existingSlot?.creator ? {
          id: existingSlot.creator.id,
          nome: existingSlot.creator.name,
          cidade: existingSlot.creator.profile_info?.location?.city || '',
          seguidores: existingSlot.creator.social_media?.instagram?.followers || 0,
          instagram: existingSlot.creator.social_media?.instagram?.username || '',
          whatsapp: existingSlot.creator.contact_info?.whatsapp || '',
          status: existingSlot.creator.status
        } : null
      });
    }

    // 6. Mapear criadores disponíveis
    const availableCreatorsFormatted = availableCreators.map(creator => ({
      id: creator.id,
      nome: creator.name,
      cidade: creator.profile_info?.location?.city || '',
      seguidores: creator.social_media?.instagram?.followers || 0,
      instagram: creator.social_media?.instagram?.username || '',
      whatsapp: creator.contact_info?.whatsapp || '',
      status: creator.status
    }));

    console.log(`✅ ${slots.length} slots preparados, ${availableCreatorsFormatted.length} criadores disponíveis`);

    return NextResponse.json({
      success: true,
      slots,
      availableCreators: availableCreatorsFormatted,
      campaignId,
      businessId: business.id,
      source: 'supabase'
    });

  } catch (error) {
    console.error('❌ Erro interno na API de slots:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}
