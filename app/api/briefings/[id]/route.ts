import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: briefingId } = await params;

    console.log('📋 [BRIEFING DETAIL] Buscando briefing:', briefingId);

    const supabase = createClient();

    // Buscar briefing completo
    const { data: briefing, error } = await supabase
      .from('monthly_briefings')
      .select(`
        *,
        business:businesses(
          id,
          name,
          slug,
          contact_info,
          address
        ),
        briefing_campaigns(
          id,
          campaign_name,
          campaign_type,
          priority,
          delivery_deadline,
          briefing_status,
          notes
        ),
        briefing_tasks(
          id,
          task_description,
          task_type,
          status,
          priority,
          assigned_to,
          due_date,
          completed_at
        ),
        briefing_checklist_items(
          id,
          item_description,
          is_checked,
          evidence,
          item_order,
          category
        )
      `)
      .eq('id', briefingId)
      .single();

    if (error) {
      console.error('❌ [BRIEFING DETAIL] Erro ao buscar briefing:', error);
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Briefing não encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erro ao buscar briefing' },
        { status: 500 }
      );
    }

    // Formatar dados completos para o frontend
    const formattedBriefing = {
      id: briefing.id,
      refCode: briefing.ref_code,
      businessId: briefing.business_id,
      referenceMonth: briefing.reference_month,
      meetingDate: briefing.meeting_date,
      status: briefing.status,
      
      // Informações da empresa
      business: {
        id: briefing.business?.id,
        name: briefing.business?.name,
        slug: briefing.business?.slug,
        contactInfo: briefing.business?.contact_info,
        address: briefing.business?.address
      },
      
      // Dados estruturados do briefing
      participants: briefing.participants,
      executiveSummary: briefing.executive_summary,
      productInfo: briefing.product_info,
      campaignContext: briefing.campaign_context,
      dosAndDonts: briefing.dos_and_donts,
      conversionTips: briefing.conversion_tips,
      actionPlan: briefing.action_plan,
      callPerformance: briefing.call_performance,
      
      // Campanhas relacionadas
      campaigns: briefing.briefing_campaigns?.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.campaign_name,
        type: campaign.campaign_type,
        priority: campaign.priority,
        deadline: campaign.delivery_deadline,
        status: campaign.briefing_status,
        notes: campaign.notes
      })) || [],
      
      // Tarefas organizadas por tipo
      tasks: {
        internal: briefing.briefing_tasks?.filter((task: any) => task.task_type === 'internal').map((task: any) => ({
          id: task.id,
          description: task.task_description,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assigned_to,
          dueDate: task.due_date,
          completedAt: task.completed_at
        })) || [],
        client: briefing.briefing_tasks?.filter((task: any) => task.task_type === 'client').map((task: any) => ({
          id: task.id,
          description: task.task_description,
          status: task.status,
          priority: task.priority,
          assignedTo: task.assigned_to,
          dueDate: task.due_date,
          completedAt: task.completed_at
        })) || []
      },
      
      // Checklist organizado por categoria
      checklist: briefing.briefing_checklist_items?.sort((a: any, b: any) => a.item_order - b.item_order).map((item: any) => ({
        id: item.id,
        description: item.item_description,
        checked: item.is_checked,
        evidence: item.evidence,
        order: item.item_order,
        category: item.category
      })) || [],
      
      // Estatísticas calculadas
      stats: {
        totalCampaigns: briefing.briefing_campaigns?.length || 0,
        totalTasks: briefing.briefing_tasks?.length || 0,
        pendingTasks: briefing.briefing_tasks?.filter((task: any) => task.status !== 'done').length || 0,
        completedTasks: briefing.briefing_tasks?.filter((task: any) => task.status === 'done').length || 0,
        performanceScore: briefing.call_performance?.score_percentage || 0,
        checklistTotal: briefing.briefing_checklist_items?.length || 0,
        checklistCompleted: briefing.briefing_checklist_items?.filter((item: any) => item.is_checked).length || 0
      },
      
      // Timestamps
      createdAt: briefing.created_at,
      updatedAt: briefing.updated_at,
      createdBy: briefing.created_by,
      approvedBy: briefing.approved_by,
      approvedAt: briefing.approved_at
    };

    console.log('✅ [BRIEFING DETAIL] Briefing encontrado:', formattedBriefing.refCode);

    return NextResponse.json(formattedBriefing);

  } catch (error) {
    console.error('❌ [BRIEFING DETAIL] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: briefingId } = await params;
    const updates = await request.json();

    console.log('📝 [BRIEFING UPDATE] Atualizando briefing:', briefingId);

    const supabase = createClient();

    // Atualizar briefing principal
    const { data: briefing, error } = await supabase
      .from('monthly_briefings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', briefingId)
      .select()
      .single();

    if (error) {
      console.error('❌ [BRIEFING UPDATE] Erro ao atualizar briefing:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar briefing' },
        { status: 500 }
      );
    }

    console.log('✅ [BRIEFING UPDATE] Briefing atualizado com sucesso');

    return NextResponse.json({
      success: true,
      briefing: {
        id: briefing.id,
        refCode: briefing.ref_code,
        status: briefing.status,
        updatedAt: briefing.updated_at
      }
    });

  } catch (error) {
    console.error('❌ [BRIEFING UPDATE] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: briefingId } = await params;

    console.log('🗑️ [BRIEFING DELETE] Deletando briefing:', briefingId);

    const supabase = createClient();

    // Deletar briefing (cascade irá deletar relacionados)
    const { error } = await supabase
      .from('monthly_briefings')
      .delete()
      .eq('id', briefingId);

    if (error) {
      console.error('❌ [BRIEFING DELETE] Erro ao deletar briefing:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar briefing' },
        { status: 500 }
      );
    }

    console.log('✅ [BRIEFING DELETE] Briefing deletado com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Briefing deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ [BRIEFING DELETE] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
