import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, creatorId, userEmail } = body;

    console.log('🗑️ Removendo criador da campanha:', {
      businessName,
      mes,
      creatorId,
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

    // 2. Buscar campanha
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title')
      .eq('business_id', business.id)
      .eq('month', mes)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (campaignError || !campaign) {
      console.error('❌ Campanha não encontrada:', { businessName, mes });
      return NextResponse.json({
        success: false,
        error: `Campanha não encontrada para ${businessName} - ${mes}`
      }, { status: 404 });
    }

    // 3. Buscar criador
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

    // 4. Buscar relacionamento existente
    const { data: existingRelation, error: relationError } = await supabase
      .from('campaign_creators')
      .select('*')
      .eq('campaign_id', campaign.id)
      .eq('creator_id', creatorId)
      .single();

    if (relationError || !existingRelation) {
      console.error('❌ Relacionamento não encontrado:', relationError);
      return NextResponse.json({
        success: false,
        error: `Criador ${creator.name} não está associado a esta campanha`
      }, { status: 404 });
    }

    // 5. Remover relacionamento (soft delete)
    const { data: removedRelation, error: deleteError } = await supabase
      .from('campaign_creators')
      .update({
        status: 'Removido',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingRelation.id)
      .select()
      .single();

    if (deleteError) {
      console.error('❌ Erro ao remover relacionamento:', deleteError);
      return NextResponse.json({
        success: false,
        error: `Erro ao remover criador: ${deleteError.message}`
      }, { status: 500 });
    }

    // 6. Registrar no audit log
    if (userEmail) {
      const { error: auditError } = await supabase
        .from('audit_log')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          entity_type: 'campaign_creator',
          entity_id: existingRelation.id,
          action: 'delete',
          user_email: userEmail,
          old_value: creator.name,
          new_value: null,
          details: {
            campaign_id: campaign.id,
            creator_id: creatorId,
            business_name: businessName,
            month: mes,
            removal_type: 'soft_delete'
          }
        });

      if (auditError) {
        console.warn('⚠️ Erro ao registrar audit log:', auditError);
      }
    }

    console.log('✅ Criador removido da campanha:', {
      relationId: removedRelation.id,
      creatorName: creator.name,
      campaignTitle: campaign.title
    });

    return NextResponse.json({
      success: true,
      message: `Criador ${creator.name} removido da campanha com sucesso`,
      data: {
        relationId: removedRelation.id,
        creatorId: creator.id,
        creatorName: creator.name,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        removalType: 'soft_delete'
      }
    });

  } catch (error) {
    console.error('❌ Erro interno ao remover criador:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
