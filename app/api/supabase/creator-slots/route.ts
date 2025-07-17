import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CampaignManager } from '@/lib/campaign-manager';

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

    console.log(`🎯 CampaignManager: Buscando slots para ${businessName} - ${mes}`);

    if (!businessName || !mes) {
      console.error('❌ Parâmetros obrigatórios ausentes:', { businessName, mes });
      return NextResponse.json(
        { success: false, error: 'businessName e mes são obrigatórios' },
        { status: 400 }
      );
    }

    // Usar CampaignManager para buscar slots com validação automática
    const result = await CampaignManager.getSlots(businessName, mes);

    // Se houve erros de validação, logar mas continuar
    if (!result.isValid) {
      console.warn('⚠️ Inconsistências detectadas e corrigidas:', result.errors);
    }

    // Buscar criadores disponíveis para seleção (excluindo placeholder)
    const { data: availableCreators, error: creatorsError } = await supabase
      .from('creators')
      .select(`
        id,
        name,
        status,
        profile_info,
        social_media,
        contact_info
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .in('status', ['Ativo', 'Precisa engajar'])
      .neq('name', '[SLOT VAZIO]')  // Excluir criador placeholder
      .order('name');

    if (creatorsError) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return NextResponse.json(
        { success: false, error: `Erro ao buscar criadores: ${creatorsError.message}` },
        { status: 500 }
      );
    }

    // Converter slots do CampaignManager para formato da API
    const slots = result.slots.map(slot => ({
      index: slot.index,
      influenciador: slot.influenciador,
      briefingCompleto: slot.briefingCompleto,
      dataHoraVisita: slot.dataHoraVisita || '',
      quantidadeConvidados: slot.quantidadeConvidados || '',
      visitaConfirmado: slot.visitaConfirmado,
      dataHoraPostagem: slot.dataHoraPostagem || '',
      videoAprovado: slot.videoAprovado,
      videoPostado: slot.videoPostado,
      videoInstagramLink: slot.videoInstagramLink || '',
      videoTiktokLink: slot.videoTiktokLink || '',
      isExisting: slot.isExisting,
      rowIndex: slot.index + 1,
      businessName: result.campaign.businessName,
      businessId: '', // Será preenchido se necessário
      campaignId: result.campaign.id,
      creatorId: slot.creatorId,
      creatorData: slot.creatorId ? {
        id: slot.creatorId,
        name: slot.influenciador
      } : null
    }));

    // Mapear criadores disponíveis para formato esperado
    const availableCreatorsFormatted = availableCreators?.map(creator => ({
      id: creator.id,
      nome: creator.name,
      cidade: creator.profile_info?.location?.city || '',
      seguidores: creator.social_media?.instagram?.followers || 0,
      instagram: creator.social_media?.instagram?.username || '',
      whatsapp: creator.contact_info?.whatsapp || '',
      status: creator.status
    })) || [];

    console.log(`✅ CampaignManager: ${slots.length} slots preparados, ${availableCreatorsFormatted.length} criadores disponíveis`);

    return NextResponse.json({
      success: true,
      slots,
      availableCreators: availableCreatorsFormatted,
      campaignId: result.campaign.id,
      businessId: '', // Será preenchido se necessário
      source: 'campaign-manager',
      validation: {
        isValid: result.isValid,
        errors: result.errors
      }
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
