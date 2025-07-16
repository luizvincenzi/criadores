import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { standardizeMonth } from '@/lib/month-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    const { businessName, mes, creatorsData, userEmail } = body;

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

    console.log('✏️ Atualizando dados dos criadores da campanha:', {
      businessName,
      mes,
      monthYearId,
      creatorsCount: creatorsData?.length,
      userEmail
    });

    if (!businessName || !mes || !creatorsData) {
      return NextResponse.json({
        success: false,
        error: 'businessName, mes e creatorsData são obrigatórios'
      }, { status: 400 });
    }

    // 1. Buscar business
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('organization_id', DEFAULT_ORG_ID)
      .ilike('name', `%${businessName}%`)
      .limit(1);

    if (businessError || !businesses?.length) {
      console.error('❌ Business não encontrado:', businessError);
      return NextResponse.json({
        success: false,
        error: `Business "${businessName}" não encontrado`
      }, { status: 404 });
    }

    const business = businesses[0];

    // 2. Buscar campanha usando month_year_id
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, month_year_id')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_id', business.id)
      .eq('month_year_id', monthYearId)
      .limit(1);

    if (campaignError || !campaigns?.length) {
      console.error('❌ Campanha não encontrada:', campaignError);
      return NextResponse.json({
        success: false,
        error: `Campanha para "${businessName}" no mês ${monthYearId} não encontrada`
      }, { status: 404 });
    }

    const campaign = campaigns[0];

    // 3. Buscar relacionamentos existentes
    const { data: existingRelations, error: relationsError } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        creator_id,
        deliverables,
        video_instagram_link,
        video_tiktok_link,
        creator:creators(id, name)
      `)
      .eq('campaign_id', campaign.id)
      .neq('status', 'Removido');

    if (relationsError) {
      console.error('❌ Erro ao buscar relacionamentos:', relationsError);
      return NextResponse.json({
        success: false,
        error: `Erro ao buscar criadores da campanha: ${relationsError.message}`
      }, { status: 500 });
    }

    console.log(`📋 Encontrados ${existingRelations?.length || 0} relacionamentos existentes`);

    // 4. Processar atualizações
    const updates = [];
    let updatedCount = 0;

    for (const creatorData of creatorsData) {
      if (!creatorData.influenciador || !creatorData.isExisting) {
        continue; // Pular slots vazios ou novos
      }

      // Encontrar relacionamento pelo nome do criador
      const relation = existingRelations?.find(rel => 
        rel.creator?.name === creatorData.influenciador
      );

      if (!relation) {
        console.log(`⚠️ Relacionamento não encontrado para: ${creatorData.influenciador}`);
        continue;
      }

      // Preparar dados atualizados
      const updatedDeliverables = {
        ...relation.deliverables,
        briefing_complete: creatorData.briefingCompleto || 'Pendente',
        visit_datetime: creatorData.dataHoraVisita || null,
        guest_quantity: parseInt(creatorData.quantidadeConvidados) || 0,
        visit_confirmed: creatorData.visitaConfirmado || 'Pendente',
        post_datetime: creatorData.dataHoraPostagem || null,
        video_approved: creatorData.videoAprovado || 'Pendente',
        video_posted: creatorData.videoPostado || 'Não'
      };

      // Atualizar no banco
      const { error: updateError } = await supabase
        .from('campaign_creators')
        .update({
          deliverables: updatedDeliverables,
          video_instagram_link: creatorData.videoInstagramLink || null,
          video_tiktok_link: creatorData.videoTiktokLink || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', relation.id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar ${creatorData.influenciador}:`, updateError);
        updates.push({
          creator: creatorData.influenciador,
          success: false,
          error: updateError.message
        });
      } else {
        console.log(`✅ Atualizado: ${creatorData.influenciador}`);
        updates.push({
          creator: creatorData.influenciador,
          success: true
        });
        updatedCount++;
      }
    }

    // 5. Registrar no audit log
    if (updatedCount > 0) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/supabase/audit-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity_type: 'campaign_creators',
            entity_id: campaign.id,
            entity_name: `${businessName} - ${standardMonth}`,
            action: 'update_deliverables',
            field_name: 'deliverables',
            old_value: null,
            new_value: `Atualizados ${updatedCount} criadores`,
            user_email: userEmail || 'sistema@crmcriadores.com',
            details: {
              business_name: businessName,
              month: standardMonth,
              updated_creators: updates.filter(u => u.success).map(u => u.creator),
              total_updated: updatedCount
            }
          })
        });
      } catch (auditError) {
        console.error('⚠️ Erro ao registrar audit log:', auditError);
      }
    }

    console.log(`✅ Atualização concluída: ${updatedCount} criadores atualizados`);

    return NextResponse.json({
      success: true,
      message: `${updatedCount} criador(es) atualizado(s) com sucesso`,
      updatedCount,
      updates,
      campaign: {
        id: campaign.id,
        title: campaign.title,
        month: campaign.month
      }
    });

  } catch (error) {
    console.error('❌ Erro na API de atualização:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
