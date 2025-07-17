import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { standardizeMonth } from '@/lib/month-utils';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Função auxiliar para converter nome do mês para número
function getMonthNumber(monthName: string): number {
  const months: { [key: string]: number } = {
    'jan': 1, 'fev': 2, 'mar': 3, 'abr': 4, 'mai': 5, 'jun': 6,
    'jul': 7, 'ago': 8, 'set': 9, 'out': 10, 'nov': 11, 'dez': 12
  };
  return months[monthName.toLowerCase()] || 7;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, oldCreatorId, newCreatorId, userEmail } = body;

    // Converter mês para month_year_id
    let monthYearId: number;

    // Se mes já é um month_year_id (número)
    if (typeof mes === 'number' || /^\d{6}$/.test(mes)) {
      monthYearId = parseInt(mes.toString());
    } else {
      // Converter string para month_year_id
      const standardMonth = standardizeMonth(mes);
      // Assumir que standardMonth retorna formato "jul 25"
      const [monthName, yearShort] = standardMonth.split(' ');
      const year = 2000 + parseInt(yearShort);
      const monthNum = getMonthNumber(monthName);
      monthYearId = year * 100 + monthNum;
    }

    console.log('🔄 Substituindo criador na campanha:', {
      businessName,
      mes,
      monthYearId,
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

    // 1. Buscar business_id com debug detalhado
    console.log(`🔍 Buscando business: "${businessName}"`);

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .ilike('name', `%${businessName}%`)
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);

    console.log('📊 Resultado da busca business:', { business, businessError });

    if (businessError) {
      console.error('❌ Erro na busca do business:', businessError);
      return NextResponse.json({
        success: false,
        error: `Erro na busca: ${businessError.message}`
      }, { status: 500 });
    }

    if (!business || business.length === 0) {
      // Tentar busca mais ampla para debug
      console.log('🔍 Tentando busca mais ampla...');
      const { data: allBusinesses } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('organization_id', DEFAULT_ORG_ID)
        .limit(10);

      console.log('📋 Businesses disponíveis:', allBusinesses?.map(b => b.name));

      return NextResponse.json({
        success: false,
        error: `Business "${businessName}" não encontrado`,
        debug: {
          searchTerm: businessName,
          availableBusinesses: allBusinesses?.map(b => b.name) || []
        }
      }, { status: 404 });
    }

    const businessData = Array.isArray(business) ? business[0] : business;

    // 2. Buscar campanha usando month_year_id
    console.log(`🔍 Buscando campanha: business_id=${businessData.id}, month_year_id=${monthYearId}`);

    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, month_year_id')
      .eq('business_id', businessData.id)
      .eq('month_year_id', monthYearId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    console.log('📊 Resultado da busca campanha:', { campaign, campaignError });

    if (campaignError || !campaign) {
      console.error('❌ Campanha não encontrada:', { businessName, monthYearId, businessId: businessData.id });

      // Debug: buscar campanhas disponíveis para este business
      const { data: availableCampaigns } = await supabase
        .from('campaigns')
        .select('id, title, month_year_id, month')
        .eq('business_id', businessData.id)
        .eq('organization_id', DEFAULT_ORG_ID);

      console.log('📋 Campanhas disponíveis para este business:', availableCampaigns);

      return NextResponse.json({
        success: false,
        error: `Campanha não encontrada para ${businessName} - mês ${monthYearId}`,
        debug: {
          businessId: businessData.id,
          monthYearId,
          availableCampaigns: availableCampaigns?.map(c => ({
            title: c.title,
            month: c.month,
            month_year_id: c.month_year_id
          })) || []
        }
      }, { status: 404 });
    }

    // 3. Verificar se o criador antigo existe na campanha
    console.log(`🔍 Buscando criador antigo na campanha: campaign_id=${campaign.id}, creator_id=${oldCreatorId}`);

    const { data: oldRelation, error: oldRelationError } = await supabase
      .from('campaign_creators')
      .select('id, creator:creators(name)')
      .eq('campaign_id', campaign.id)
      .eq('creator_id', oldCreatorId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    console.log('📊 Resultado da busca criador antigo:', { oldRelation, oldRelationError });

    if (oldRelationError || !oldRelation) {
      console.error('❌ Criador antigo não encontrado na campanha:', oldCreatorId);

      // Debug: buscar todos os criadores desta campanha
      const { data: allCampaignCreators } = await supabase
        .from('campaign_creators')
        .select('id, creator_id, creator:creators(name)')
        .eq('campaign_id', campaign.id)
        .eq('organization_id', DEFAULT_ORG_ID);

      console.log('📋 Criadores na campanha:', allCampaignCreators);

      return NextResponse.json({
        success: false,
        error: 'Criador antigo não está associado a esta campanha',
        debug: {
          campaignId: campaign.id,
          oldCreatorId,
          creatorsInCampaign: allCampaignCreators?.map(cc => ({
            id: cc.creator_id,
            name: cc.creator?.name
          })) || []
        }
      }, { status: 404 });
    }

    // 4. Verificar se o novo criador existe
    console.log(`🔍 Buscando novo criador: creator_id=${newCreatorId}`);

    const { data: newCreator, error: newCreatorError } = await supabase
      .from('creators')
      .select('id, name, status')
      .eq('id', newCreatorId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    console.log('📊 Resultado da busca novo criador:', { newCreator, newCreatorError });

    if (newCreatorError || !newCreator) {
      console.error('❌ Novo criador não encontrado:', newCreatorId);

      // Debug: buscar criadores disponíveis
      const { data: availableCreators } = await supabase
        .from('creators')
        .select('id, name, status')
        .eq('organization_id', DEFAULT_ORG_ID)
        .limit(10);

      console.log('📋 Criadores disponíveis:', availableCreators);

      return NextResponse.json({
        success: false,
        error: 'Novo criador não encontrado',
        debug: {
          newCreatorId,
          availableCreators: availableCreators?.map(c => ({
            id: c.id,
            name: c.name,
            status: c.status
          })) || []
        }
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
            month: mes
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
