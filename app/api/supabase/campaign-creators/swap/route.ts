import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { CampaignManager } from '@/lib/campaign-manager';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, oldCreatorId, newCreatorId, userEmail = 'usuario@sistema.com' } = body;

    console.log('🔄 CampaignManager: Trocando criador na campanha:', {
      businessName,
      mes,
      oldCreatorId,
      newCreatorId,
      userEmail
    });

    if (!businessName || !mes || !oldCreatorId || !newCreatorId) {
      return NextResponse.json({
        success: false,
        error: 'businessName, mes, oldCreatorId e newCreatorId são obrigatórios'
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

    // IMPLEMENTAÇÃO ALTERNATIVA: Swap direto no banco
    console.log('🔧 Executando swap direto no banco:', {
      campaign_id: campaignData.campaign.id,
      old_creator_id: oldCreatorId,
      new_creator_id: newCreatorId
    });

    // 1. Verificar se a relação antiga existe
    const { data: oldRelation, error: oldRelationError } = await supabase
      .from('campaign_creators')
      .select('*')
      .eq('campaign_id', campaignData.campaign.id)
      .eq('creator_id', oldCreatorId)
      .neq('status', 'Removido')
      .single();

    if (oldRelationError || !oldRelation) {
      console.error('❌ Relação antiga não encontrada:', oldRelationError);
      return NextResponse.json({
        success: false,
        error: 'Criador atual não encontrado na campanha'
      }, { status: 404 });
    }

    console.log('✅ Relação antiga encontrada:', oldRelation.id);

    // 2. Verificar se o novo criador existe
    const { data: newCreator, error: newCreatorError } = await supabase
      .from('creators')
      .select('id, name')
      .eq('id', newCreatorId)
      .single();

    if (newCreatorError || !newCreator) {
      console.error('❌ Novo criador não encontrado:', newCreatorError);
      return NextResponse.json({
        success: false,
        error: 'Novo criador não encontrado'
      }, { status: 404 });
    }

    console.log('✅ Novo criador encontrado:', newCreator.name);

    // 3. Atualizar a relação existente para o novo criador
    const { data: updatedRelation, error: updateError } = await supabase
      .from('campaign_creators')
      .update({
        creator_id: newCreatorId,
        updated_at: new Date().toISOString()
      })
      .eq('id', oldRelation.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar relação:', updateError);
      return NextResponse.json({
        success: false,
        error: `Erro ao trocar criador: ${updateError.message}`
      }, { status: 500 });
    }

    console.log('✅ Relação atualizada com sucesso:', updatedRelation.id);

    // 4. Registrar no audit log
    const { error: auditError } = await supabase
      .from('audit_log')
      .insert({
        organization_id: DEFAULT_ORG_ID,
        entity_type: 'campaign_creator',
        entity_id: updatedRelation.id,
        action: 'update',
        field_name: 'creator_id',
        user_email: userEmail,
        old_value: oldCreatorId,
        new_value: newCreatorId,
        details: {
          campaign_id: campaignData.campaign.id,
          old_creator_id: oldCreatorId,
          new_creator_id: newCreatorId,
          operation: 'swap_creator'
        }
      });

    if (auditError) {
      console.warn('⚠️ Erro ao registrar audit log:', auditError);
    }

    const result = {
      success: true,
      message: `Criador trocado com sucesso`,
      data: {
        relationId: updatedRelation.id,
        oldCreatorId,
        newCreatorId,
        newCreatorName: newCreator.name
      }
    };

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: {
        campaignId: campaignData.campaign.id,
        campaignTitle: campaignData.campaign.title,
        businessName: campaignData.campaign.businessName,
        oldCreatorId,
        newCreatorId,
        atomicResult: result.data
      }
    });

  } catch (error) {
    console.error('❌ CampaignManager: Erro ao trocar criador:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
