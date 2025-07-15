import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 API test-slots INICIADA');
  
  try {
    console.log('📥 Recebendo request...');
    const body = await request.json();
    console.log('📦 Body recebido:', body);
    
    const { businessName, mes, quantidadeContratada } = body;
    
    if (!businessName || !mes || !quantidadeContratada) {
      console.log('❌ Parâmetros faltando');
      return NextResponse.json({
        success: false,
        error: 'Parâmetros obrigatórios: businessName, mes, quantidadeContratada'
      });
    }

    console.log('✅ Parâmetros válidos, retornando dados de teste');

    // Dados de teste simples
    const testData = {
      success: true,
      slots: [
        {
          index: 0,
          influenciador: "",
          briefingCompleto: "Pendente",
          dataHoraVisita: "",
          quantidadeConvidados: "",
          visitaConfirmado: "Pendente",
          dataHoraPostagem: "",
          videoAprovado: "Pendente",
          videoPostado: "Não",
          isExisting: true,
          rowIndex: 70,
          businessName: businessName,
          businessId: "test_business_id"
        },
        {
          index: 1,
          influenciador: "",
          briefingCompleto: "Pendente",
          dataHoraVisita: "",
          quantidadeConvidados: "",
          visitaConfirmado: "Pendente",
          dataHoraPostagem: "",
          videoAprovado: "Pendente",
          videoPostado: "Não",
          isExisting: true,
          rowIndex: 71,
          businessName: businessName,
          businessId: "test_business_id"
        },
        {
          index: 2,
          influenciador: "",
          briefingCompleto: "Pendente",
          dataHoraVisita: "",
          quantidadeConvidados: "",
          visitaConfirmado: "Pendente",
          dataHoraPostagem: "",
          videoAprovado: "Pendente",
          videoPostado: "Não",
          isExisting: true,
          rowIndex: 72,
          businessName: businessName,
          businessId: "test_business_id"
        }
      ],
      availableCreators: [
        {
          id: "test_creator_1",
          nome: "Criador Teste 1",
          cidade: "São Paulo",
          status: "Ativo"
        },
        {
          id: "test_creator_2", 
          nome: "Criador Teste 2",
          cidade: "São Paulo",
          status: "Ativo"
        }
      ]
    };

    console.log('📤 Retornando dados de teste:', testData);
    return NextResponse.json(testData);

  } catch (error) {
    console.error('❌ Erro na API test-slots:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
}
