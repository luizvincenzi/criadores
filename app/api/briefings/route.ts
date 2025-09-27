import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const month = searchParams.get('month');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('📋 [BRIEFINGS] Buscando briefings:', { businessId, month, status, limit });

    const supabase = createClient();

    let query = supabase
      .from('monthly_briefings')
      .select(`
        id,
        business_id,
        ref_code,
        reference_month,
        meeting_date,
        participants,
        executive_summary,
        campaign_context,
        call_performance,
        status,
        created_at,
        updated_at,
        business:businesses(
          id,
          name,
          slug
        ),
        briefing_campaigns(
          id,
          campaign_name,
          campaign_type,
          priority,
          delivery_deadline,
          briefing_status
        ),
        briefing_tasks(
          id,
          task_description,
          task_type,
          status,
          priority,
          assigned_to,
          due_date
        )
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .order('meeting_date', { ascending: false })
      .limit(limit);

    // Filtros opcionais
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    if (month) {
      query = query.eq('reference_month', month);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: briefings, error } = await query;

    if (error) {
      console.error('❌ [BRIEFINGS] Erro ao buscar briefings:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar briefings' },
        { status: 500 }
      );
    }

    // Formatar dados para o frontend
    const formattedBriefings = briefings?.map(briefing => ({
      id: briefing.id,
      refCode: briefing.ref_code,
      businessId: briefing.business_id,
      businessName: briefing.business?.name || 'Empresa não encontrada',
      businessSlug: briefing.business?.slug,
      referenceMonth: briefing.reference_month,
      meetingDate: briefing.meeting_date,
      status: briefing.status,
      
      // Resumo executivo
      nextStep: briefing.executive_summary?.next_step || '',
      monthCampaigns: briefing.executive_summary?.month_campaigns || [],
      identifiedNeeds: briefing.executive_summary?.identified_needs || [],
      
      // Participantes
      participants: briefing.participants || { criadores: [], client: [] },
      
      // Performance da call
      performanceScore: briefing.call_performance?.score_percentage || 0,
      totalItems: briefing.call_performance?.total_items || 0,
      completedItems: briefing.call_performance?.completed_items || 0,
      
      // Campanhas relacionadas
      campaigns: briefing.briefing_campaigns?.map(campaign => ({
        id: campaign.id,
        name: campaign.campaign_name,
        type: campaign.campaign_type,
        priority: campaign.priority,
        deadline: campaign.delivery_deadline,
        status: campaign.briefing_status
      })) || [],
      
      // Tarefas pendentes
      pendingTasks: briefing.briefing_tasks?.filter(task => task.status !== 'done').length || 0,
      totalTasks: briefing.briefing_tasks?.length || 0,
      
      // Timestamps
      createdAt: briefing.created_at,
      updatedAt: briefing.updated_at
    })) || [];

    console.log('✅ [BRIEFINGS] Briefings encontrados:', formattedBriefings.length);

    return NextResponse.json({
      briefings: formattedBriefings,
      total: formattedBriefings.length
    });

  } catch (error) {
    console.error('❌ [BRIEFINGS] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      referenceMonth,
      meetingDate,
      participants,
      executiveSummary,
      productInfo,
      campaignContext,
      dosAndDonts,
      conversionTips,
      actionPlan,
      callPerformance,
      campaigns = [],
      tasks = [],
      checklistItems = []
    } = body;

    console.log('📝 [BRIEFINGS] Criando novo briefing:', { businessId, referenceMonth, meetingDate });

    if (!businessId || !referenceMonth || !meetingDate) {
      return NextResponse.json(
        { error: 'businessId, referenceMonth e meetingDate são obrigatórios' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Criar briefing principal
    const { data: briefing, error: briefingError } = await supabase
      .from('monthly_briefings')
      .insert({
        business_id: businessId,
        organization_id: DEFAULT_ORG_ID,
        reference_month: referenceMonth,
        meeting_date: meetingDate,
        participants: participants || { criadores: [], client: [] },
        executive_summary: executiveSummary || {},
        product_info: productInfo || {},
        campaign_context: campaignContext || {},
        dos_and_donts: dosAndDonts || { dos: [], donts: [] },
        conversion_tips: conversionTips || [],
        action_plan: actionPlan || { internal: [], client: [] },
        call_performance: callPerformance || {},
        status: 'draft'
      })
      .select()
      .single();

    if (briefingError) {
      console.error('❌ [BRIEFINGS] Erro ao criar briefing:', briefingError);
      return NextResponse.json(
        { error: 'Erro ao criar briefing' },
        { status: 500 }
      );
    }

    const briefingId = briefing.id;

    // Criar campanhas relacionadas
    if (campaigns.length > 0) {
      const campaignInserts = campaigns.map((campaign: any) => ({
        briefing_id: briefingId,
        campaign_name: campaign.name,
        campaign_type: campaign.type,
        priority: campaign.priority || 1,
        delivery_deadline: campaign.deadline || null,
        briefing_status: campaign.status || 'planned'
      }));

      const { error: campaignsError } = await supabase
        .from('briefing_campaigns')
        .insert(campaignInserts);

      if (campaignsError) {
        console.error('⚠️ [BRIEFINGS] Erro ao criar campanhas:', campaignsError);
      }
    }

    // Criar tarefas
    if (tasks.length > 0) {
      const taskInserts = tasks.map((task: any) => ({
        briefing_id: briefingId,
        task_description: task.description,
        task_type: task.type, // 'internal' ou 'client'
        status: task.status || 'todo',
        priority: task.priority || 2,
        assigned_to: task.assignedTo || '',
        due_date: task.dueDate || null
      }));

      const { error: tasksError } = await supabase
        .from('briefing_tasks')
        .insert(taskInserts);

      if (tasksError) {
        console.error('⚠️ [BRIEFINGS] Erro ao criar tarefas:', tasksError);
      }
    }

    // Criar itens do checklist
    if (checklistItems.length > 0) {
      const checklistInserts = checklistItems.map((item: any, index: number) => ({
        briefing_id: briefingId,
        item_description: item.description,
        is_checked: item.checked || false,
        evidence: item.evidence || '',
        item_order: index + 1,
        category: item.category || 'general'
      }));

      const { error: checklistError } = await supabase
        .from('briefing_checklist_items')
        .insert(checklistInserts);

      if (checklistError) {
        console.error('⚠️ [BRIEFINGS] Erro ao criar checklist:', checklistError);
      }
    }

    console.log('✅ [BRIEFINGS] Briefing criado com sucesso:', briefing.ref_code);

    return NextResponse.json({
      success: true,
      briefing: {
        id: briefing.id,
        refCode: briefing.ref_code,
        businessId: briefing.business_id,
        referenceMonth: briefing.reference_month,
        meetingDate: briefing.meeting_date,
        status: briefing.status
      }
    });

  } catch (error) {
    console.error('❌ [BRIEFINGS] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
