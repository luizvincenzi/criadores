import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint para receber dados de Core Web Vitals
 * Permite análise detalhada de performance além do GA4
 */
export async function POST(request: NextRequest) {
  try {
    const vitalsData = await request.json();
    
    // Validar dados básicos
    if (!vitalsData.name || typeof vitalsData.value !== 'number') {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Log para monitoramento (em produção, enviar para serviço de logs)
    console.log('📊 [WEB VITALS API]', {
      metric: vitalsData.name,
      value: vitalsData.value,
      rating: vitalsData.rating,
      url: vitalsData.url,
      timestamp: new Date(vitalsData.timestamp).toISOString(),
    });

    // Em produção, aqui você poderia:
    // 1. Salvar no banco de dados para análise
    // 2. Enviar para serviço de monitoramento (DataDog, New Relic, etc.)
    // 3. Agregar métricas para dashboards
    
    // Exemplo de estrutura para salvar no banco:
    /*
    await supabase.from('web_vitals').insert({
      metric_name: vitalsData.name,
      metric_value: vitalsData.value,
      rating: vitalsData.rating,
      page_url: vitalsData.url,
      user_agent: vitalsData.userAgent,
      navigation_type: vitalsData.navigationType,
      created_at: new Date().toISOString(),
    });
    */

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [WEB VITALS API] Erro ao processar dados:', error);
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Método GET para verificar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Web Vitals API endpoint funcionando',
    timestamp: new Date().toISOString(),
  });
}
