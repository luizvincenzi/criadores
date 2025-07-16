import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { standardizeMonth } from '@/lib/month-utils';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, oldCreatorId, newCreatorId, userEmail } = body;

    // Padronizar formato do mês
    const standardMonth = standardizeMonth(mes);

    console.log('🔄 Substituindo criador na campanha:', {
      businessName,
      mes: `${mes} → ${standardMonth}`,
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

    if (oldCreatorId === newCreatorId) {
      return NextResponse.json({
        success: true,
        message: 'Mesmo criador selecionado, nenhuma alteração necessária'
      });
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

    // 3. Verificar se o criador antigo existe na campanha
    const { data: oldRelation, error: oldRelationError } = await supabase
      .from('campaign_creators')
      .select('id, creator:creators(name)')
      .eq('campaign_id', campaign.id)
      .eq('creator_id', oldCreatorId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (oldRelationError || !oldRelation) {
      console.error('❌ Criador antigo não encontrado na campanha:', oldCreatorId);
      return NextResponse.json({
        success: false,
        error: 'Criador antigo não está associado a esta campanha'
      }, { status: 404 });
    }

    // 4. Verificar se o novo criador existe
    const { data: newCreator, error: newCreatorError } = await supabase
      .from('creators')
      .select('id, name, status')
      .eq('id', newCreatorId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (newCreatorError || !newCreator) {
      console.error('❌ Novo criador não encontrado:', newCreatorId);
      return NextResponse.json({
        success: false,
        error: 'Novo criador não encontrado'
      }, { status: 404 });
    }

    // 5. Verificar se o novo criador já está na campanha (exceto o registro que vamos substituir)
    const { data: existingNewRelations } = await supabase
      .from('campaign_creators')
      .select('id, creator:creators(name)')
      .eq('campaign_id', campaign.id)
      .eq('creator_id', newCreatorId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .neq('id', oldRelation.id); // Excluir o registro atual da verificação

    // Se o novo criador já existe em outras posições, remover essas duplicatas primeiro
    if (existingNewRelations && existingNewRelations.length > 0) {
      console.log(`🔄 Removendo ${existingNewRelations.length} duplicata(s) de ${newCreator.name} antes da substituição`);

      const duplicateIds = existingNewRelations.map(rel => rel.id);
      const { error: removeError } = await supabase
        .from('campaign_creators')
        .delete()
        .in('id', duplicateIds);

      if (removeError) {
        console.error('❌ Erro ao remover duplicatas:', removeError);
        return NextResponse.json({
          success: false,
          error: `Erro ao remover duplicatas: ${removeError.message}`
        }, { status: 500 });
      }

      console.log(`✅ ${duplicateIds.length} duplicata(s) removida(s)`);
    }

    // 6. Realizar a substituição (atualizar o registro existente)
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
      console.error('❌ Erro ao substituir criador:', updateError);
      return NextResponse.json({
        success: false,
        error: `Erro ao substituir criador: ${updateError.message}`
      }, { status: 500 });
    }

    // 7. Registrar no audit log
    if (userEmail) {
      const { error: auditError } = await supabase
        .from('audit_log')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          entity_type: 'campaign_creator',
          entity_id: updatedRelation.id,
          action: 'update',
          user_email: userEmail,
          old_value: oldRelation.creator?.name || 'Criador anterior',
          new_value: newCreator.name,
          details: {
            campaign_id: campaign.id,
            old_creator_id: oldCreatorId,
            new_creator_id: newCreatorId,
            business_name: businessName,
            month: standardMonth
          }
        });

      if (auditError) {
        console.warn('⚠️ Erro ao registrar audit log:', auditError);
      }
    }

    console.log('✅ Criador substituído na campanha:', {
      relationId: updatedRelation.id,
      oldCreator: oldRelation.creator?.name,
      newCreator: newCreator.name,
      campaignTitle: campaign.title,
      duplicatesRemoved: existingNewRelations?.length || 0
    });

    const message = existingNewRelations && existingNewRelations.length > 0
      ? `Criador substituído: ${oldRelation.creator?.name} → ${newCreator.name} (${existingNewRelations.length} duplicata(s) removida(s))`
      : `Criador substituído: ${oldRelation.creator?.name} → ${newCreator.name}`;

    return NextResponse.json({
      success: true,
      message,
      data: {
        relationId: updatedRelation.id,
        oldCreatorName: oldRelation.creator?.name,
        newCreatorId: newCreator.id,
        newCreatorName: newCreator.name,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        duplicatesRemoved: existingNewRelations?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Erro interno ao substituir criador:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
