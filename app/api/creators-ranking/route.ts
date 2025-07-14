import { NextRequest, NextResponse } from 'next/server';
import { getCreatorsRankingThisMonth } from '@/app/actions/sheetsActions';

export async function GET(request: NextRequest) {
  try {
    console.log('🏆 Buscando ranking de criadores do mês...');
    
    const ranking = await getCreatorsRankingThisMonth();
    
    console.log(`✅ Ranking carregado: ${ranking.length} criadores`);
    
    return NextResponse.json({
      success: true,
      ranking
    });
  } catch (error) {
    console.error('❌ Erro ao buscar ranking de criadores:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        ranking: []
      },
      { status: 500 }
    );
  }
}
