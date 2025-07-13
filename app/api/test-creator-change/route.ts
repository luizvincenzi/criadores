import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { businessName, mes, oldCreator, newCreator, campaignId } = await request.json();
    
    console.log('🔄 Teste de troca de criador:', {
      businessName,
      mes,
      oldCreator,
      newCreator,
      campaignId
    });

    // Simular a chamada para change-campaign-creator
    const changePayload = {
      campaignId,
      businessName,
      mes,
      oldCreator,
      newCreator,
      newCreatorData: {
        briefingCompleto: 'Sim',
        dataHoraVisita: '2025-07-15T14:00',
        quantidadeConvidados: '4',
        visitaConfirmada: 'Sim',
        dataHoraPostagem: '2025-07-16T18:00',
        videoAprovado: 'Sim',
        videoPostado: 'Sim',
        responsavel: 'Sistema',
        notas: 'Troca de criador via teste'
      },
      user: 'teste@sistema.com'
    };

    console.log('📤 Enviando payload para change-campaign-creator:', changePayload);

    // Chamar a nova API de troca de criadores
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://criadores.digital'}/api/change-campaign-creator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changePayload)
    });

    const result = await response.json();
    
    console.log('📥 Resposta da API:', result);

    return NextResponse.json({
      success: true,
      testData: {
        businessName,
        mes,
        oldCreator,
        newCreator,
        campaignId
      },
      changePayload,
      apiResponse: result,
      message: result.success 
        ? `✅ Troca de criador realizada: ${oldCreator} → ${newCreator}`
        : `❌ Erro na troca: ${result.error}`
    });

  } catch (error) {
    console.error('❌ Erro no teste de troca de criador:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
