import { NextRequest, NextResponse } from 'next/server';
import { ensureCampaignUniqueIds } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Inicializando IDs únicos na aba Campanhas...');

    const success = await ensureCampaignUniqueIds();

    if (success) {
      console.log('✅ IDs únicos inicializados com sucesso');
      return NextResponse.json({ 
        success: true, 
        message: 'IDs únicos adicionados na aba Campanhas',
        action: 'campaign_ids_initialized'
      });
    } else {
      console.error('❌ Falha ao inicializar IDs únicos');
      return NextResponse.json({ 
        success: false, 
        error: 'Falha ao adicionar IDs únicos na aba Campanhas' 
      });
    }

  } catch (error) {
    console.error('❌ Erro ao inicializar IDs únicos:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
}
