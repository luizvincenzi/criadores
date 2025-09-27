import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🤖 [AI INSIGHTS] Buscando insights de IA para:', businessId);

    const supabase = createClient();

    // Buscar dados de IA mais recentes
    const { data: aiData, error: aiError } = await supabase
      .from('ai_analysis')
      .select('*')
      .eq('entity_id', businessId)
      .eq('entity_type', 'business')
      .eq('analysis_type', 'advanced_insights')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (aiError && aiError.code !== 'PGRST116') {
      console.error('❌ [AI INSIGHTS] Erro ao buscar dados de IA:', aiError);
      return NextResponse.json(
        { error: 'Erro ao buscar insights de IA' },
        { status: 500 }
      );
    }

    if (!aiData) {
      console.log('⚠️ [AI INSIGHTS] Nenhum dado de IA encontrado para:', businessId);
      return NextResponse.json({
        hasAiData: false,
        message: 'Nenhum insight de IA disponível para esta empresa'
      });
    }

    // Processar dados de IA
    const aiResponse = typeof aiData.ai_response === 'string' 
      ? JSON.parse(aiData.ai_response) 
      : aiData.ai_response;

    const processedData = typeof aiData.processed_data === 'string'
      ? JSON.parse(aiData.processed_data)
      : aiData.processed_data;

    // Formatar dados para o dashboard
    const formattedInsights = {
      hasAiData: true,
      generatedAt: aiData.created_at,
      businessName: aiResponse.businessName,
      
      // Análise de negócio
      businessAnalysis: {
        description: aiResponse.businessAnalysis?.description || '',
        strengths: aiResponse.businessAnalysis?.strengths || [],
        weaknesses: aiResponse.businessAnalysis?.weaknesses || [],
        targetAudience: aiResponse.businessAnalysis?.targetAudience || '',
        mainOpportunity: aiResponse.businessAnalysis?.mainOpportunity || '',
        competitiveDifferential: aiResponse.businessAnalysis?.competitiveDifferential || ''
      },

      // Performance de canais
      channelPerformance: (aiResponse.channelPerformance || []).map((channel: any) => ({
        name: channel.name,
        score: channel.score,
        color: channel.color,
        reasoning: channel.reasoning
      })),

      // Segmentação de audiência
      audienceSegmentation: (aiResponse.audienceSegmentation || []).map((segment: any) => ({
        name: segment.name,
        percentage: segment.percentage,
        description: segment.description
      })),

      // Análise de mercado
      marketAnalysis: {
        trends: aiResponse.marketAnalysis?.trends || [],
        competitors: aiResponse.marketAnalysis?.competitors || [],
        opportunities: aiResponse.marketAnalysis?.opportunities || [],
        seasonality: aiResponse.marketAnalysis?.seasonality || ''
      },

      // Planos de ação
      actionPlans: {
        genZ: aiResponse.actionPlan?.genZ || [],
        internal: aiResponse.actionPlan?.internal || [],
        influencers: aiResponse.actionPlan?.influencers || []
      },

      // Métricas derivadas para KPIs
      derivedKpis: {
        digitalPresenceScore: Math.round(
          (aiResponse.channelPerformance || [])
            .filter((c: any) => ['Instagram', 'TikTok', 'Facebook'].includes(c.name))
            .reduce((sum: number, c: any) => sum + c.score, 0) / 3
        ),
        marketReadiness: aiResponse.businessAnalysis?.strengths?.length > 2 ? 'high' : 'medium',
        competitivePosition: (aiResponse.channelPerformance || [])
          .find((c: any) => c.name === 'Instagram')?.score > 80 ? 'strong' : 'developing'
      },

      // Recomendações prioritárias
      priorityRecommendations: [
        ...(aiResponse.actionPlan?.internal || []).filter((action: any) => action.priority === 'high'),
        ...(aiResponse.actionPlan?.influencers || []).filter((action: any) => action.priority === 'high')
      ],

      // Metadados
      confidence: aiData.confidence_score || 95,
      tokensUsed: aiData.tokens_used || 0,
      cost: parseFloat(aiData.cost_usd || '0'),
      status: aiData.status
    };

    console.log('✅ [AI INSIGHTS] Dados processados com sucesso:', {
      businessName: formattedInsights.businessName,
      channelsCount: formattedInsights.channelPerformance.length,
      segmentsCount: formattedInsights.audienceSegmentation.length,
      recommendationsCount: formattedInsights.priorityRecommendations.length
    });

    return NextResponse.json(formattedInsights);

  } catch (error) {
    console.error('❌ [AI INSIGHTS] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para forçar sincronização de dados de IA com snapshots
export async function POST(request: NextRequest) {
  try {
    const { businessId, quarter } = await request.json();

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔄 [AI SYNC] Sincronizando dados de IA:', { businessId, quarter });

    const supabase = createClient();

    // Executar função de enriquecimento
    const { data, error } = await supabase.rpc('enrich_snapshot_with_ai_data', {
      p_business_id: businessId,
      p_quarter: quarter || '2025-Q3'
    });

    if (error) {
      console.error('❌ [AI SYNC] Erro na sincronização:', error);
      return NextResponse.json(
        { error: 'Erro ao sincronizar dados de IA' },
        { status: 500 }
      );
    }

    console.log('✅ [AI SYNC] Sincronização concluída com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Dados de IA sincronizados com sucesso',
      businessId,
      quarter: quarter || '2025-Q3'
    });

  } catch (error) {
    console.error('❌ [AI SYNC] Erro interno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
