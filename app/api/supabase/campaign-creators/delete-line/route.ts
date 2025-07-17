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

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 DEBUG: Body completo recebido na API delete-line:', body);
    
    const { businessName, mes, creatorId, userEmail } = body;
    
    // Converter mês para month_year_id
    let monthYearId: number;

    // Se mes já é um month_year_id (número)
    if (typeof mes === 'number' || /^\d{6}$/.test(mes)) {
      monthYearId = parseInt(mes.toString());
    } else {
      // Converter string para month_year_id
      const standardMonth = standardizeMonth(mes);
      const [monthName, yearShort] = standardMonth.split(' ');
      const year = 2000 + parseInt(yearShort);
      const monthNum = getMonthNumber(monthName);
      monthYearId = year * 100 + monthNum;
    }

    console.log('🗑️ Excluindo linha da campanha:', {
      businessName,
      mes,
      monthYearId,
      creatorId,
      userEmail
    });

    if (!businessName || !mes) {
      console.error('❌ Dados obrigatórios faltando:', { businessName, mes });
      return NextResponse.json({
        success: false,
        error: 'businessName e mes são obrigatórios',
        debug: { businessName, mes, creatorId, userEmail }
      }, { status: 400 });
    }

    // 1. Buscar business_id
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
      return NextResponse.json({
        success: false,
        error: `Business "${businessName}" não encontrado`
      }, { status: 404 });
    }

    const businessData = Array.isArray(business) ? business[0] : business;

    // 2. Buscar campanha usando month_year_id
    console.log(`🔍 Buscando campanha: business_id=${businessData.id}, month_year_id=${monthYearId}`);
    
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, month_year_id, quantidade_criadores')
      .eq('business_id', businessData.id)
      .eq('month_year_id', monthYearId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    console.log('📊 Resultado da busca campanha:', { campaign, campaignError });

    if (campaignError || !campaign) {
      console.error('❌ Campanha não encontrada:', { campaignError, campaign });

      // Debug: buscar campanhas disponíveis para este business
      const { data: availableCampaigns } = await supabase
        .from('campaigns')
        .select('id, title, month_year_id, month, business_id')
        .eq('business_id', businessData.id)
        .eq('organization_id', DEFAULT_ORG_ID);

      console.log('📋 Campanhas disponíveis para este business:', availableCampaigns);

      return NextResponse.json({
        success: false,
        error: `Campanha não encontrada para ${businessName} - mês ${monthYearId}`,
        debug: {
          businessId: businessData.id,
          monthYearId,
          searchedMonth: mes,
          availableCampaigns: availableCampaigns?.map(c => ({
            title: c.title,
            month: c.month,
            month_year_id: c.month_year_id,
            business_id: c.business_id
          })) || []
        }
      }, { status: 404 });
    }

    // 3. Se tem creatorId, remover o criador do banco
    if (creatorId) {
      console.log(`🔍 Removendo criador: creator_id=${creatorId}`);
      
      const { data: existingRelation, error: relationError } = await supabase
        .from('campaign_creators')
        .select('*')
        .eq('campaign_id', campaign.id)
        .eq('creator_id', creatorId)
        .eq('organization_id', DEFAULT_ORG_ID)
        .single();

      if (existingRelation) {
        const { error: deleteError } = await supabase
          .from('campaign_creators')
          .delete()
          .eq('id', existingRelation.id);

        if (deleteError) {
          console.error('❌ Erro ao remover criador:', deleteError);
          return NextResponse.json({
            success: false,
            error: `Erro ao remover criador: ${deleteError.message}`
          }, { status: 500 });
        }

        console.log('✅ Criador removido do banco:', creatorId);
      }
    }

    // 4. Reduzir quantidade_criadores da campanha
    const newQuantidade = Math.max(1, (campaign.quantidade_criadores || 1) - 1);
    
    console.log(`🔢 Reduzindo quantidade de criadores: ${campaign.quantidade_criadores} → ${newQuantidade}`);
    
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ quantidade_criadores: newQuantidade })
      .eq('id', campaign.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar quantidade de criadores:', updateError);
      return NextResponse.json({
        success: false,
        error: `Erro ao atualizar campanha: ${updateError.message}`
      }, { status: 500 });
    }

    // 5. Registrar no audit log
    if (userEmail) {
      await supabase
        .from('audit_log')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          entity_type: 'campaign',
          entity_id: campaign.id,
          action: 'delete_line',
          user_email: userEmail,
          old_value: `${campaign.quantidade_criadores} slots`,
          new_value: `${newQuantidade} slots`,
          details: {
            campaign_id: campaign.id,
            creator_id: creatorId,
            business_name: businessName,
            month: mes,
            month_year_id: monthYearId,
            old_quantidade: campaign.quantidade_criadores,
            new_quantidade: newQuantidade
          }
        });
    }

    console.log('✅ Linha excluída com sucesso:', {
      campaignId: campaign.id,
      creatorId,
      oldQuantidade: campaign.quantidade_criadores,
      newQuantidade
    });

    return NextResponse.json({
      success: true,
      message: creatorId 
        ? `Linha excluída e criador removido. Slots reduzidos para ${newQuantidade}`
        : `Linha vazia excluída. Slots reduzidos para ${newQuantidade}`,
      data: {
        campaignId: campaign.id,
        creatorId,
        oldQuantidade: campaign.quantidade_criadores,
        newQuantidade
      }
    });

  } catch (error) {
    console.error('❌ Erro na API delete-line:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
