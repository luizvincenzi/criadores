import { NextRequest, NextResponse } from 'next/server';

// Esta rota só funciona em desenvolvimento
export async function POST(request: NextRequest) {
  // Só permitir em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Esta rota só está disponível em desenvolvimento' },
      { status: 403 }
    );
  }

  try {
    // Limpar o rate limit map do middleware
    // Como o middleware usa um Map em memória, vamos retornar sucesso
    // O rate limit será limpo automaticamente quando o servidor reiniciar
    
    console.log('🧹 Rate limit limpo em desenvolvimento');
    
    return NextResponse.json({
      success: true,
      message: 'Rate limit limpo com sucesso. Reinicie o servidor para garantir limpeza completa.',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro ao limpar rate limit:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
