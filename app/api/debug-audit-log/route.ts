import { NextRequest, NextResponse } from 'next/server';
import { getLatestCampaignStatuses } from '@/app/actions/sheetsActions';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Buscando status do audit_log...');
    
    const statuses = await getLatestCampaignStatuses();
    
    console.log('🔍 DEBUG: Status encontrados:', statuses);
    
    return NextResponse.json({ 
      success: true, 
      statuses,
      count: Object.keys(statuses).length,
      debug: true
    });

  } catch (error) {
    console.error('❌ DEBUG: Erro ao buscar status:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      debug: true
    });
  }
}
