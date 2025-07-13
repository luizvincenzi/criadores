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

    // Simular a chamada para update-campaign-creators
    const updatePayload = {
      businessName,
      mes,
      creatorsData: [
        {
          influenciador: newCreator, // Novo criador
          briefingCompleto: 'Sim',
          dataHoraVisita: '2025-07-15T14:00',
          quantidadeConvidados: '4',
          visitaConfirmado: 'Sim',
          dataHoraPostagem: '2025-07-16T18:00',
          videoAprovado: 'Sim',
          videoPostado: 'Sim'
        }
      ],
      user: 'teste@sistema.com',
      campaignId
    };

    console.log('📤 Enviando payload para update-campaign-creators:', updatePayload);

    // Chamar a API real
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://criadores.digital'}/api/update-campaign-creators`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload)
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
      updatePayload,
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
