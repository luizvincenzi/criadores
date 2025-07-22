import { supabase, supabaseAdmin } from './supabase';
import type { Business, Creator, Campaign, CampaignCreator } from './supabase';

// Constantes
const DEFAULT_ORG_ID = 'org_default_migration';

// ============================================================================
// BUSINESSES (Negócios)
// ============================================================================

export async function getBusinessesData() {
  console.log('🏢 Buscando negócios do Supabase...');
  
  const { data, error } = await supabase
    .from('businesses')
    .select(`
      id,
      organization_id,
      name,
      slug,
      category_id,
      current_plan_id,
      contact_info,
      address,
      contract_info,
      status,
      business_stage,
      estimated_value,
      contract_creators_count,
      owner_user_id,
      priority,
      responsible_user_id,
      tags,
      custom_fields,
      metrics,
      is_active,
      created_at,
      updated_at
    `)
    .eq('organization_id', DEFAULT_ORG_ID)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('❌ Erro ao buscar negócios:', error);
    throw new Error(`Erro ao buscar negócios: ${error.message}`);
  }

  console.log(`✅ ${data.length} negócios encontrados`);
  
  // Mapear para formato padronizado (usando apenas 'name')
  return data.map(business => ({
    id: business.id,
    name: business.name,                    // ✅ Campo padronizado
    nome: business.name,                    // 🔄 Compatibilidade temporária
    businessName: business.name,            // 🔄 Compatibilidade temporária
    categoria: business.tags?.[0] || '',
    planoAtual: business.custom_fields?.plano_atual || '',
    comercial: business.custom_fields?.comercial || '',
    nomeResponsavel: business.contact_info?.primary_contact || '',
    cidade: business.address?.city || '',
    whatsappResponsavel: business.contact_info?.whatsapp || '',
    prospeccao: business.status,
    responsavel: '', // Campo será preenchido separadamente se necessário
    instagram: business.contact_info?.instagram || '',
    grupoWhatsappCriado: business.custom_fields?.grupo_whatsapp_criado ? 'Sim' : 'Não',
    contratoAssinadoEnviado: business.contract_info?.signed ? 'Sim' : 'Não',
    dataAssinaturaContrato: business.contract_info?.signature_date || '',
    contratoValidoAte: business.contract_info?.valid_until || '',
    relatedFiles: business.contract_info?.files?.[0] || '',
    notes: business.custom_fields?.notes || '',
    businessStage: business.business_stage || 'Leads próprios frios',
    estimatedValue: business.estimated_value || 0,
    contractCreatorsCount: business.contract_creators_count || 0,
    ownerUserId: business.owner_user_id || null,
    priority: business.priority || 'Média'
  }));
}

export async function updateBusinessStatus(businessId: string, newStatus: string, userEmail: string) {
  console.log(`🔄 Atualizando status do negócio ${businessId} para ${newStatus}`);

  const { data, error } = await supabase
    .from('businesses')
    .update({ 
      status: newStatus as any,
      updated_at: new Date().toISOString()
    })
    .eq('id', businessId)
    .eq('organization_id', DEFAULT_ORG_ID)
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao atualizar status:', error);
    throw new Error(`Erro ao atualizar status: ${error.message}`);
  }

  console.log('✅ Status atualizado com sucesso');
  return { success: true, data };
}

// ============================================================================
// CREATORS (Criadores)
// ============================================================================

export async function getCreatorsData() {
  console.log('👥 Buscando criadores do Supabase...');
  
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('organization_id', DEFAULT_ORG_ID)
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('❌ Erro ao buscar criadores:', error);
    throw new Error(`Erro ao buscar criadores: ${error.message}`);
  }

  console.log(`✅ ${data.length} criadores encontrados`);
  
  // Mapear para formato compatível com o frontend atual
  return data.map(creator => ({
    id: creator.id,
    nome: creator.name,
    cidade: creator.profile_info?.location?.city || '',
    seguidores: creator.social_media?.instagram?.followers || 0,
    instagram: creator.social_media?.instagram?.username || '',
    whatsapp: creator.contact_info?.whatsapp || '',
    biografia: creator.profile_info?.biography || '',
    categoria: creator.profile_info?.category || '',
    status: creator.status
  }));
}

// ============================================================================
// CAMPAIGNS (Campanhas)
// ============================================================================

export async function getRawCampaignsData() {
  console.log('📋 Buscando campanhas do Supabase...');
  
  const { data, error } = await supabase
    .from('campaign_creators')
    .select(`
      *,
      campaign:campaigns(
        id,
        title,
        month,
        status,
        business:businesses(id, name)
      ),
      creator:creators(id, name)
    `)
    .eq('campaign.organization_id', DEFAULT_ORG_ID)
    .order('created_at');

  if (error) {
    console.error('❌ Erro ao buscar campanhas:', error);
    throw new Error(`Erro ao buscar campanhas: ${error.message}`);
  }

  console.log(`✅ ${data.length} registros de campanha encontrados`);
  
  // Mapear para formato compatível com o frontend atual
  return data.map(cc => ({
    id: cc.id,
    businessId: cc.campaign?.business?.id || '',
    businessName: cc.campaign?.business?.name || '',
    criadorId: cc.creator?.id || '',
    criadorName: cc.creator?.name || '',
    tituloCampanha: cc.campaign?.title || '',
    mes: cc.campaign?.month || '',
    responsavel: '',
    status: cc.campaign?.status || '',
    briefingCompleto: cc.deliverables?.briefing_complete || 'Pendente',
    dataHoraVisita: cc.deliverables?.visit_datetime || '',
    quantidadeConvidados: cc.deliverables?.guest_quantity || 0,
    visitaConfirmada: cc.deliverables?.visit_confirmed || 'Pendente',
    dataHoraPostagem: cc.deliverables?.post_datetime || '',
    videoAprovado: cc.deliverables?.video_approved || 'Pendente',
    videoPostado: cc.deliverables?.video_posted || 'Não',
    statusCalendario: 'Ativo'
  }));
}

export async function getCampaignJourneyData() {
  console.log('🗺️ Buscando dados da jornada de campanhas...');
  
  const { data, error } = await supabase
    .from('campaign_journey_view')
    .select('*')
    .eq('organization_id', DEFAULT_ORG_ID)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar jornada:', error);
    throw new Error(`Erro ao buscar jornada: ${error.message}`);
  }

  console.log(`✅ ${data.length} campanhas na jornada`);
  return data;
}

// ============================================================================
// CAMPAIGN CREATORS (Relacionamentos)
// ============================================================================

export async function getCreatorSlots(businessName: string, mes: string, quantidadeContratada: number) {
  console.log(`🎯 Buscando slots para ${businessName} - ${mes}`);

  // Buscar business_id pelo nome
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('name', businessName)
    .eq('organization_id', DEFAULT_ORG_ID)
    .single();

  if (businessError || !business) {
    throw new Error(`Business "${businessName}" não encontrado`);
  }

  // Buscar campanha existente
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('business_id', business.id)
    .eq('month', mes)
    .eq('organization_id', DEFAULT_ORG_ID)
    .single();

  let campaignId = campaign?.id;

  // Se não existe campanha, criar uma
  if (!campaign) {
    const { data: newCampaign, error: createError } = await supabase
      .from('campaigns')
      .insert({
        organization_id: DEFAULT_ORG_ID,
        business_id: business.id,
        title: `Campanha ${businessName} - ${mes}`,
        month: mes,
        created_by: DEFAULT_ORG_ID // Temporário
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Erro ao criar campanha: ${createError.message}`);
    }

    campaignId = newCampaign.id;
  }

  // Buscar slots existentes
  const { data: existingSlots, error: slotsError } = await supabase
    .from('campaign_creators')
    .select(`
      *,
      creator:creators(id, name, profile_info, status)
    `)
    .eq('campaign_id', campaignId);

  if (slotsError) {
    throw new Error(`Erro ao buscar slots: ${slotsError.message}`);
  }

  // Buscar criadores disponíveis da mesma cidade
  const { data: availableCreators, error: creatorsError } = await supabase
    .from('creators')
    .select('*')
    .eq('organization_id', DEFAULT_ORG_ID)
    .eq('status', 'Ativo')
    .eq('is_active', true);

  if (creatorsError) {
    throw new Error(`Erro ao buscar criadores: ${creatorsError.message}`);
  }

  // Criar slots vazios se necessário
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
      isExisting: !!existingSlot,
      rowIndex: i + 1,
      businessName,
      businessId: business.id,
      campaignId,
      creatorId: existingSlot?.creator_id || null
    });
  }

  return {
    success: true,
    slots,
    availableCreators: availableCreators.map(creator => ({
      id: creator.id,
      nome: creator.name,
      cidade: creator.profile_info?.location?.city || '',
      status: creator.status
    }))
  };
}

export async function changeCampaignCreator(
  businessName: string,
  mes: string,
  index: number,
  oldCreator: string,
  newCreator: string,
  newCreatorData: any,
  userEmail: string
) {
  console.log(`🔄 Trocando criador: ${oldCreator} → ${newCreator}`);

  try {
    // Buscar campanha
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('name', businessName)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (!business) {
      throw new Error(`Business não encontrado: ${businessName}`);
    }

    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id')
      .eq('business_id', business.id)
      .eq('month', mes)
      .single();

    if (!campaign) {
      throw new Error(`Campanha não encontrada: ${businessName} - ${mes}`);
    }

    // Buscar criador
    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('name', newCreator.trim())
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (!creator) {
      throw new Error(`Criador não encontrado: ${newCreator}`);
    }

    // Verificar se já existe um slot para este índice
    const { data: existingSlots } = await supabase
      .from('campaign_creators')
      .select('*')
      .eq('campaign_id', campaign.id)
      .order('created_at');

    if (existingSlots && existingSlots[index]) {
      // Atualizar slot existente
      const { error } = await supabase
        .from('campaign_creators')
        .update({
          creator_id: creator.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSlots[index].id);

      if (error) throw error;
    } else {
      // Criar novo slot
      const { error } = await supabase
        .from('campaign_creators')
        .insert({
          campaign_id: campaign.id,
          creator_id: creator.id,
          role: 'primary',
          status: 'Confirmado'
        });

      if (error) throw error;
    }

    console.log('✅ Criador trocado com sucesso');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao trocar criador:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function getBusinessId(businessName: string): Promise<string> {
  const { data, error } = await supabase
    .from('businesses')
    .select('id')
    .eq('name', businessName)
    .eq('organization_id', DEFAULT_ORG_ID)
    .single();

  if (error || !data) {
    throw new Error(`Business não encontrado: ${businessName}`);
  }

  return data.id;
}
