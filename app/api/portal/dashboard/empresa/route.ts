import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'portal-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verificar token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Verificar se é uma empresa
    if (decoded.userType !== 'empresa') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const businessId = decoded.entityId;

    // Buscar campanhas da empresa
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, name, status, created_at')
      .eq('business_id', businessId);

    if (campaignsError) {
      console.error('Erro ao buscar campanhas:', campaignsError);
      return NextResponse.json(
        { error: 'Erro ao buscar dados' },
        { status: 500 }
      );
    }

    // Buscar criadores trabalhando nas campanhas da empresa
    const { data: campaignCreators, error: creatorsError } = await supabase
      .from('campaign_creators')
      .select(`
        creator_id,
        status,
        campaigns!inner(business_id)
      `)
      .eq('campaigns.business_id', businessId)
      .neq('status', 'Removido');

    if (creatorsError) {
      console.error('Erro ao buscar criadores:', creatorsError);
    }

    // Calcular estatísticas
    const campanhasAtivas = campaigns?.filter(c => 
      ['Reunião de Briefing', 'Agendamentos', 'Entrega Final'].includes(c.status)
    ).length || 0;

    const campanhasFinalizadas = campaigns?.filter(c => 
      c.status === 'Finalizado'
    ).length || 0;

    const criadoresUnicos = new Set(
      campaignCreators?.map(cc => cc.creator_id) || []
    ).size;

    const criadoresTrabalhando = campaignCreators?.filter(cc => 
      ['Confirmado', 'Em Produção'].includes(cc.status)
    ).length || 0;

    // Dados simulados para métricas (em produção, viria de analytics reais)
    const metricas = {
      alcanceTotal: Math.floor(Math.random() * 100000) + 50000,
      engajamentoMedio: Math.random() * 5 + 2, // 2-7%
      investimentoTotal: Math.floor(Math.random() * 50000) + 10000
    };

    const stats = {
      campanhas: {
        ativas: campanhasAtivas,
        finalizadas: campanhasFinalizadas,
        total: campaigns?.length || 0
      },
      criadores: {
        trabalhando: criadoresTrabalhando,
        total: criadoresUnicos
      },
      metricas
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Erro na API dashboard empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
