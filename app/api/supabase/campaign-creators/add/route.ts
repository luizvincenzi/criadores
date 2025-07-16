import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { standardizeMonth } from '@/lib/month-utils';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, creatorId, creatorData, userEmail } = body;

    // Padronizar formato do mês
    const standardMonth = standardizeMonth(mes);

    console.log('➕ Adicionando criador à campanha:', {
      businessName,
      mes: `${mes} → ${standardMonth}`,
      creatorId,
      creatorName: creatorData?.nome,
      userEmail
    });

    if (!businessName || !mes || !creatorId) {
      return NextResponse.json({
        success: false,
        error: 'businessName, mes e creatorId são obrigatórios'
      }, { status: 400 });
    }

    // 1. Buscar business_id
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('name', businessName)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (businessError || !business) {
      console.error('❌ Business não encontrado:', businessName);
      return NextResponse.json({
        success: false,
        error: `Business "${businessName}" não encontrado`
      }, { status: 404 });
    }

    // 2. Buscar campanha (usando mês padronizado)
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('business_id', business.id)
      .eq('month', standardMonth)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (campaignError || !campaign) {
      console.error('❌ Campanha não encontrada:', { businessName, mes: standardMonth });
      return NextResponse.json({
        success: false,
        error: `Campanha não encontrada para ${businessName} - ${standardMonth}`
      }, { status: 404 });
    }

    // 3. Verificar se o criador existe
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, name, status')
      .eq('id', creatorId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (creatorError || !creator) {
      console.error('❌ Criador não encontrado:', creatorId);
      return NextResponse.json({
        success: false,
        error: `Criador não encontrado`
      }, { status: 404 });
    }

    // 4. Verificar se o criador já está na campanha
    const { data: existingRelation, error: checkError } = await supabase
      .from('campaign_creators')
      .select('id, status, creator:creators(name)')
      .eq('campaign_id', campaign.id)
      .eq('creator_id', creatorId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (existingRelation) {
      console.log(`ℹ️ Criador ${creator.name} já está na campanha - retornando sucesso`);
      return NextResponse.json({
        success: true,
        message: `Criador ${creator.name} já estava na campanha`,
        data: {
          relationId: existingRelation.id,
          creatorId: creator.id,
          creatorName: creator.name,
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          alreadyExists: true
        }
      });
    }

    console.log(`ℹ️ Criando novo relacionamento para ${creator.name}`);

    // 5. Criar relacionamento
    const { data: newRelation, error: insertError } = await supabase
      .from('campaign_creators')
      .insert({
        organization_id: DEFAULT_ORG_ID,
        campaign_id: campaign.id,
        creator_id: creatorId,
        role: 'primary',
        status: 'Pendente',
        deliverables: {
          briefing_complete: 'Pendente',
          visit_datetime: null,
          guest_quantity: 0,
          visit_confirmed: 'Pendente',
          post_datetime: null,
          video_approved: 'Pendente',
          video_posted: 'Não',
          content_links: []
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar relacionamento:', insertError);
      return NextResponse.json({
        success: false,
        error: `Erro ao adicionar criador: ${insertError.message}`
      }, { status: 500 });
    }

    // 6. Registrar no audit log
    if (userEmail) {
      const { error: auditError } = await supabase
        .from('audit_log')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          entity_type: 'campaign_creator',
          entity_id: newRelation.id,
          action: 'create',
          user_email: userEmail,
          old_value: null,
          new_value: creator.name,
          details: {
            campaign_id: campaign.id,
            creator_id: creatorId,
            business_name: businessName,
            month: mes
          }
        });

      if (auditError) {
        console.warn('⚠️ Erro ao registrar audit log:', auditError);
      }
    }

    console.log('✅ Criador adicionado à campanha:', {
      relationId: newRelation.id,
      creatorName: creator.name,
      campaignTitle: campaign.title
    });

    return NextResponse.json({
      success: true,
      message: `Criador ${creator.name} adicionado à campanha com sucesso`,
      data: {
        relationId: newRelation.id,
        creatorId: creator.id,
        creatorName: creator.name,
        campaignId: campaign.id,
        campaignTitle: campaign.title
      }
    });

  } catch (error) {
    console.error('❌ Erro interno ao adicionar criador:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
