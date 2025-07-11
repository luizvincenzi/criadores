import { NextResponse } from 'next/server';
import { getCreatorsData, getCampaignsData } from '@/app/actions/sheetsActions';

export async function GET() {
  try {
    console.log('🔄 API Dashboard Stats - Iniciando...');
    
    // Buscar dados em paralelo
    const [creatorsResult, campaignsResult] = await Promise.all([
      getCreatorsData(),
      getCampaignsData()
    ]);

    console.log('📊 API Dashboard Stats - Dados obtidos:', {
      criadores: creatorsResult.length,
      campanhas: campaignsResult.length
    });

    return NextResponse.json({
      success: true,
      data: {
        totalCreators: creatorsResult.length,
        totalCampaigns: campaignsResult.length,
        creatorsData: creatorsResult.slice(0, 3), // Primeiros 3 para debug
        campaignsData: campaignsResult.slice(0, 3) // Primeiros 3 para debug
      }
    });
  } catch (error) {
    console.error('❌ Erro na API Dashboard Stats:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
