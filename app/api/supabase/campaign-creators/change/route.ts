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

export async function PUT(request: NextRequest) {
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

    console.log('🔄 Trocando criador na campanha:', {
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

    // 2. Buscar campanha usando month_year_id
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, month_year_id')
      .eq('business_id', business.id)
      .eq('month_year_id', monthYearId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (campaignError || !campaign) {
      console.error('❌ Campanha não encontrada:', { businessName, mes: standardMonth, error: campaignError });
      return NextResponse.json({
        success: false,
        error: `Campanha não encontrada para ${businessName} - ${standardMonth}`
      }, { status: 404 });
    }

    console.log(`📋 Campanha encontrada: ${campaign.title}`);

    // 3. Buscar criadores
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('id, name, status')
      .in('id', [oldCreatorId, newCreatorId])
      .eq('organization_id', DEFAULT_ORG_ID);

    if (creatorsError || !creators || creators.length !== 2) {
      console.error('❌ Erro ao buscar criadores:', creatorsError);
      return NextResponse.json({
        success: false,
        error: 'Um ou ambos os criadores não foram encontrados'
      }, { status: 404 });
    }

    const oldCreator = creators.find(c => c.id === oldCreatorId);
    const newCreator = creators.find(c => c.id === newCreatorId);

    // 4. Buscar relacionamento existente
    const { data: existingRelation, error: relationError } = await supabase
      .from('campaign_creators')
      .select('*')
      .eq('campaign_id', campaign.id)
      .eq('creator_id', oldCreatorId)
      .single();

    if (relationError || !existingRelation) {
      console.error('❌ Relacionamento não encontrado:', relationError);
      return NextResponse.json({
        success: false,
        error: `Criador ${oldCreator?.name} não está associado a esta campanha`
      }, { status: 404 });
    }

    // 5. Permitir trocas livres (mesmo se o criador já estiver na campanha)
    console.log(`🔄 Trocando criador ${oldCreator?.name} por ${newCreator?.name} (trocas livres permitidas)`);

    // 6. Atualizar relacionamento
    const { data: updatedRelation, error: updateError } = await supabase
      .from('campaign_creators')
      .update({
        creator_id: newCreatorId,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingRelation.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar relacionamento:', updateError);
      return NextResponse.json({
        success: false,
        error: `Erro ao trocar criador: ${updateError.message}`
      }, { status: 500 });
    }

    // 7. Registrar no audit log
    if (userEmail) {
      const { error: auditError } = await supabase
        .from('audit_log')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          entity_type: 'campaign_creator',
          entity_id: existingRelation.id,
          action: 'update',
          user_email: userEmail,
          old_value: oldCreator?.name,
          new_value: newCreator?.name,
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

    console.log('✅ Criador trocado na campanha:', {
      relationId: updatedRelation.id,
      oldCreator: oldCreator?.name,
      newCreator: newCreator?.name,
      campaignTitle: campaign.title
    });

    return NextResponse.json({
      success: true,
      message: `Criador trocado de ${oldCreator?.name} para ${newCreator?.name} com sucesso`,
      data: {
        relationId: updatedRelation.id,
        oldCreatorId,
        oldCreatorName: oldCreator?.name,
        newCreatorId,
        newCreatorName: newCreator?.name,
        campaignId: campaign.id,
        campaignTitle: campaign.title
      }
    });

  } catch (error) {
    console.error('❌ Erro interno ao trocar criador:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
