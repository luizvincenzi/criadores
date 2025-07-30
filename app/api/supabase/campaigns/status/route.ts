import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, businessName, mes, newStatus, userEmail } = body;

    console.log('🔄 Atualizando status da campanha no Supabase:', {
      campaignId,
      businessName,
      mes,
      newStatus,
      newStatusType: typeof newStatus,
      newStatusValue: JSON.stringify(newStatus),
      userEmail
    });

    // Validações mais rigorosas
    if (!newStatus || newStatus === null || newStatus === undefined) {
      console.error('❌ Status inválido:', { newStatus, type: typeof newStatus });
      return NextResponse.json({
        success: false,
        error: 'Status é obrigatório e não pode ser null'
      }, { status: 400 });
    }

    // Verificar se o status é uma string válida
    if (typeof newStatus !== 'string' || newStatus.trim() === '') {
      console.error('❌ Status deve ser uma string não vazia:', { newStatus, type: typeof newStatus });
      return NextResponse.json({
        success: false,
        error: 'Status deve ser uma string válida'
      }, { status: 400 });
    }

    // Validar valores permitidos do enum
    const validStatuses = ['Reunião de briefing', 'Agendamentos', 'Entrega final', 'Finalizado'];
    if (!validStatuses.includes(newStatus)) {
      console.error('❌ Status não é um valor válido do enum:', {
        newStatus,
        validStatuses
      });
      return NextResponse.json({
        success: false,
        error: `Status "${newStatus}" não é válido. Valores permitidos: ${validStatuses.join(', ')}`
      }, { status: 400 });
    }

    let updateResult;

    if (campaignId) {
      // Atualizar por ID da campanha
      const { data, error } = await supabase
        .from('campaigns')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)
        .eq('organization_id', DEFAULT_ORG_ID)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar campanha por ID:', error);
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 });
      }

      updateResult = data;
    } else if (businessName && mes) {
      // Atualizar por business name e mês
      // Primeiro buscar o business_id
      console.log(`🔍 Buscando business: "${businessName}"`);
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('id, name')
        .ilike('name', `%${businessName}%`)
        .eq('organization_id', DEFAULT_ORG_ID)
        .single();

      if (businessError || !businesses) {
        console.error('❌ Business não encontrado:', {
          businessName,
          error: businessError,
          found: businesses
        });

        // Tentar busca mais ampla para debug
        const { data: allBusinesses } = await supabase
          .from('businesses')
          .select('id, name')
          .eq('organization_id', DEFAULT_ORG_ID)
          .limit(10);

        console.log('📋 Businesses disponíveis:', allBusinesses?.map(b => b.name));

        return NextResponse.json({
          success: false,
          error: `Business "${businessName}" não encontrado. Businesses disponíveis: ${allBusinesses?.map(b => b.name).join(', ')}`
        }, { status: 404 });
      }

      console.log(`✅ Business encontrado: "${businesses.name}" (ID: ${businesses.id})`);

      // Atualizar campanhas do business no mês específico
      const { data, error } = await supabase
        .from('campaigns')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('business_id', businesses.id)
        .eq('month', mes)
        .eq('organization_id', DEFAULT_ORG_ID)
        .select();

      if (error) {
        console.error('❌ Erro ao atualizar campanhas:', error);
        return NextResponse.json({
          success: false,
          error: error.message
        }, { status: 500 });
      }

      updateResult = data;
    } else {
      return NextResponse.json({
        success: false,
        error: 'É necessário fornecer campaignId ou (businessName + mes)'
      }, { status: 400 });
    }

    // Registrar no audit log
    if (userEmail) {
      const auditData = {
        organization_id: DEFAULT_ORG_ID,
        entity_type: 'campaign',
        entity_id: campaignId || `${businessName}-${mes}`,
        action: 'status_update',
        user_email: userEmail,
        old_value: null, // Poderia buscar o valor anterior se necessário
        new_value: newStatus,
        details: {
          businessName,
          mes,
          campaignId,
          method: campaignId ? 'by_id' : 'by_business_month'
        }
      };

      const { error: auditError } = await supabase
        .from('audit_log')
        .insert(auditData);

      if (auditError) {
        console.warn('⚠️ Erro ao registrar audit log:', auditError);
        // Não falhar a operação por causa do audit log
      }
    }

    console.log('✅ Status da campanha atualizado com sucesso');
    return NextResponse.json({
      success: true,
      data: updateResult,
      message: `Status atualizado para: ${newStatus}`
    });

  } catch (error) {
    console.error('❌ Erro interno ao atualizar status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    }, { status: 500 });
  }
}
