import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔍 DEBUG MODAL: Dados recebidos do modal:', JSON.stringify(body, null, 2));
    
    return NextResponse.json({ 
      success: true,
      receivedData: body,
      analysis: {
        hasBusinessName: !!body.businessName,
        hasMes: !!body.mes,
        hasCreatorsData: !!body.creatorsData,
        creatorsDataLength: body.creatorsData?.length || 0,
        creatorsDataSample: body.creatorsData?.slice(0, 2) || [],
        campaignId: body.campaignId || 'não fornecido'
      }
    });

  } catch (error) {
    console.error('❌ DEBUG MODAL: Erro:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}
