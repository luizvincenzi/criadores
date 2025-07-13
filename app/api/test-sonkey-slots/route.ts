import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testando carregamento de slots da Sonkey...');

    // Testar a API get-creator-slots com os dados da Sonkey
    const testPayload = {
      businessName: 'Sonkey',
      mes: 'Julho 2025', // Formato que aparece no modal
      quantidadeContratada: 6
    };

    console.log('📤 Enviando payload de teste:', testPayload);

    // Chamar a API real
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://criadores.digital'}/api/get-creator-slots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();
    
    console.log('📥 Resposta da API get-creator-slots:', result);

    // Testar também com variações do mês
    const testVariations = [
      { businessName: 'Sonkey', mes: 'Julho 2025', quantidadeContratada: 6 },
      { businessName: 'Sonkey', mes: 'julho 2025', quantidadeContratada: 6 },
      { businessName: 'Sonkey', mes: 'Jul', quantidadeContratada: 6 },
      { businessName: 'Sonkey', mes: 'jul', quantidadeContratada: 6 },
      { businessName: 'sonkey', mes: 'Julho 2025', quantidadeContratada: 6 }
    ];

    const variationResults = [];
    
    for (const variation of testVariations) {
      console.log(`🔄 Testando variação:`, variation);
      
      const varResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://criadores.digital'}/api/get-creator-slots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variation)
      });

      const varResult = await varResponse.json();
      
      variationResults.push({
        input: variation,
        success: varResult.success,
        slotsFound: varResult.slots?.length || 0,
        error: varResult.error || null
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Teste de carregamento de slots da Sonkey',
      originalTest: {
        input: testPayload,
        result: result
      },
      variations: variationResults,
      summary: {
        totalVariations: testVariations.length,
        successfulVariations: variationResults.filter(r => r.success).length,
        failedVariations: variationResults.filter(r => !r.success).length,
        maxSlotsFound: Math.max(...variationResults.map(r => r.slotsFound))
      },
      recommendations: [
        'Verifique se a campanha Sonkey foi criada corretamente na planilha',
        'Confirme o formato do mês na coluna F da planilha',
        'Verifique se o nome do business está exato na coluna B',
        'Confirme se há 6 linhas criadas para a Sonkey'
      ]
    });

  } catch (error) {
    console.error('❌ Erro no teste de slots da Sonkey:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
