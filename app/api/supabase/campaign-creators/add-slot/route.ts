import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CampaignManager } from '@/lib/campaign-manager';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, userEmail = 'usuario@sistema.com' } = body;

    console.log('➕ CampaignManager: Adicionando slot vazio à campanha:', {
      businessName,
      mes,
      userEmail
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

    // 1. Verificar estado atual
    console.log('📊 Estado atual da campanha:', {
      id: campaignData.campaign.id,
      quantidadeCriadores: campaignData.campaign.quantidadeCriadores,
      slotsExistentes: campaignData.slots?.length || 0
    });

    // 2. Aumentar quantidade de criadores na campanha
    const newQuantidade = (campaignData.campaign.quantidadeCriadores || 0) + 1;

    console.log(`🔄 Atualizando quantidade: ${campaignData.campaign.quantidadeCriadores} → ${newQuantidade}`);

    const { data: updatedCampaign, error: updateCampaignError } = await supabase
      .from('campaigns')
      .update({
        quantidade_criadores: newQuantidade,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignData.campaign.id)
      .select()
      .single();

    if (updateCampaignError) {
      console.error('❌ Erro ao atualizar quantidade na campanha:', updateCampaignError);
      return NextResponse.json({
        success: false,
        error: `Erro ao atualizar campanha: ${updateCampaignError.message}`
      }, { status: 500 });
    }

    console.log('✅ Campanha atualizada:', {
      id: updatedCampaign.id,
      quantidade_criadores: updatedCampaign.quantidade_criadores,
      updated_at: updatedCampaign.updated_at
    });

    // 3. Buscar ou criar criador placeholder para slots vazios
    console.log('🔍 Buscando criador placeholder...');

    let placeholderCreator;
    const { data: existingPlaceholder } = await supabase
      .from('creators')
      .select('id, name')
      .eq('name', '[SLOT VAZIO]')
      .single();

    if (existingPlaceholder) {
      placeholderCreator = existingPlaceholder;
      console.log('✅ Criador placeholder encontrado:', placeholderCreator.id);
    } else {
      console.log('➕ Criando criador placeholder...');
      const { data: newPlaceholder, error: placeholderError } = await supabase
        .from('creators')
        .insert({
          organization_id: '00000000-0000-0000-0000-000000000001',
          name: '[SLOT VAZIO]',
          slug: 'slot-vazio-placeholder',
          social_media: {
            instagram: { username: '@sistema', followers: 0, engagement_rate: 0, verified: false },
            tiktok: { username: '', followers: 0 },
            youtube: { channel: '', subscribers: 0 }
          },
          contact_info: {
            whatsapp: '',
            email: 'sistema@placeholder.com',
            phone: '',
            preferred_contact: 'email'
          },
          profile_info: {
            age_range: '25-35',
            gender: 'Não especificado',
            location: { city: 'Sistema', state: 'Sistema', country: 'Brasil' },
            bio: 'Slot vazio do sistema',
            interests: ['Sistema']
          },
          performance_metrics: {
            avg_engagement_rate: 0,
            avg_reach: 0,
            avg_impressions: 0,
            total_posts: 0,
            follower_growth_rate: 0
          },
          status: 'Ativo',
          tags: ['sistema', 'placeholder'],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (placeholderError) {
        console.error('❌ Erro ao criar criador placeholder:', placeholderError);
        return NextResponse.json({
          success: false,
          error: `Erro ao criar placeholder: ${placeholderError.message}`
        }, { status: 500 });
      }

      placeholderCreator = newPlaceholder;
      console.log('✅ Criador placeholder criado:', placeholderCreator.id);
    }

    // 4. Criar slot físico com criador placeholder
    console.log('➕ Criando slot físico com placeholder...');

    const { data: newSlot, error: createSlotError } = await supabase
      .from('campaign_creators')
      .insert({
        campaign_id: campaignData.campaign.id,
        creator_id: placeholderCreator.id,
        role: 'primary',
        fee: 0,
        payment_status: 'pending',
        status: 'Ativo',
        deliverables: {
          briefing_complete: 'Pendente',
          visit_datetime: null,
          guest_quantity: 0,
          visit_confirmed: 'Pendente',
          post_datetime: null,
          video_approved: 'Pendente',
          video_posted: 'Não',
          content_links: []
        },
        performance_data: {
          reach: 0,
          impressions: 0,
          engagement: 0,
          clicks: 0,
          saves: 0,
          shares: 0
        },
        organization_id: '00000000-0000-0000-0000-000000000001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createSlotError) {
      console.error('❌ Erro ao criar slot físico:', createSlotError);
      // Reverter a atualização da campanha
      await supabase
        .from('campaigns')
        .update({ quantidade_criadores: campaignData.campaign.quantidadeCriadores })
        .eq('id', campaignData.campaign.id);

      return NextResponse.json({
        success: false,
        error: `Erro ao criar slot: ${createSlotError.message}`
      }, { status: 500 });
    }

    console.log('✅ Slot físico criado:', newSlot.id);

    // 5. Registrar no audit log
    const { error: auditError } = await supabase
      .from('audit_log')
      .insert({
        organization_id: DEFAULT_ORG_ID,
        entity_type: 'campaign',
        entity_id: campaignData.campaign.id,
        action: 'update',
        field_name: 'quantidade_criadores',
        user_email: userEmail,
        old_value: campaignData.campaign.quantidadeCriadores?.toString() || '0',
        new_value: newQuantidade.toString(),
        details: {
          operation: 'add_slot',
          business_name: businessName,
          mes: mes
        }
      });

    if (auditError) {
      console.warn('⚠️ Erro ao registrar audit log:', auditError);
    }

    return NextResponse.json({
      success: true,
      message: `Slot adicionado. Total: ${newQuantidade} criadores`,
      data: {
        campaignId: campaignData.campaign.id,
        campaignTitle: campaignData.campaign.title,
        businessName: campaignData.campaign.businessName,
        oldQuantidade: campaignData.campaign.quantidadeCriadores,
        newQuantidade: newQuantidade,
        newSlotId: newSlot.id,
        slotsAntes: campaignData.slots?.length || 0,
        slotsDepois: newQuantidade
      }
    });

  } catch (error) {
    console.error('❌ CampaignManager: Erro ao adicionar slot:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
