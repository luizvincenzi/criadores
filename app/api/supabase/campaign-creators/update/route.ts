import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { standardizeMonth } from '@/lib/month-utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, creatorsData, userEmail } = body;

    // Padronizar formato do mês
    const standardMonth = standardizeMonth(mes);

    console.log('✏️ Atualizando dados dos criadores da campanha:', {
      businessName,
      mes: `${mes} → ${standardMonth}`,
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

    // 2. Buscar campanha
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, month')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_id', business.id)
      .eq('month', standardMonth)
      .limit(1);

    if (campaignError || !campaigns?.length) {
      console.error('❌ Campanha não encontrada:', campaignError);
      return NextResponse.json({
        success: false,
        error: `Campanha para "${businessName}" no mês "${standardMonth}" não encontrada`
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
