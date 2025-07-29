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

    // Verificar se é um criador
    if (decoded.userType !== 'criador') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const creatorId = decoded.entityId;

    // Buscar campanhas do criador
    const { data: campaignCreators, error: campaignsError } = await supabase
      .from('campaign_creators')
      .select(`
        id,
        status,
        created_at,
        campaigns!inner(
          id,
          name,
          status,
          business_id
        )
      `)
      .eq('creator_id', creatorId)
      .neq('status', 'Removido');

    if (campaignsError) {
      console.error('Erro ao buscar campanhas do criador:', campaignsError);
      return NextResponse.json(
        { error: 'Erro ao buscar dados' },
        { status: 500 }
      );
    }

    // Buscar dados do criador
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (creatorError) {
      console.error('Erro ao buscar dados do criador:', creatorError);
    }

    // Calcular estatísticas
    const campanhasAtivas = campaignCreators?.filter(cc => 
      ['Confirmado', 'Em Produção'].includes(cc.status) &&
      ['Reunião de Briefing', 'Agendamentos', 'Entrega Final'].includes(cc.campaigns.status)
    ).length || 0;

    const campanhasConcluidas = campaignCreators?.filter(cc => 
      cc.status === 'Finalizado' || cc.campaigns.status === 'Finalizado'
    ).length || 0;

    // Dados simulados para performance (em produção, viria de analytics reais)
    const performance = {
      alcanceTotal: Math.floor(Math.random() * 50000) + 10000,
      engajamentoMedio: Math.random() * 3 + 3, // 3-6%
      crescimentoSeguidores: Math.floor(Math.random() * 1000) + 100
    };

    // Dados simulados para financeiro (em produção, viria do sistema de pagamentos)
    const financeiro = {
      pagamentosRecebidos: Math.floor(Math.random() * 5000) + 1000,
      pagamentosPendentes: Math.floor(Math.random() * 2000) + 500
    };

    const stats = {
      campanhas: {
        ativas: campanhasAtivas,
        concluidas: campanhasConcluidas,
        total: campaignCreators?.length || 0
      },
      performance,
      financeiro
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Erro na API dashboard criador:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
