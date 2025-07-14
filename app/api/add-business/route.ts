import { NextRequest, NextResponse } from 'next/server';
import { addBusinessToSheet, generateBusinessId } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API /api/add-business chamada');
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', body);

    // Validação básica
    if (!body.businessName || !body.category || !body.nomeResponsavel || !body.whatsappResponsavel) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios não preenchidos'
      }, { status: 400 });
    }

    // Gerar ID único para o business
    const businessId = await generateBusinessId(body.businessName);
    console.log(`🆔 ID gerado para business "${body.businessName}": ${businessId}`);

    // Preparar dados seguindo EXATAMENTE o cabeçalho da planilha:
    // Nome | Categoria | Plano atual | Comercial | Nome Responsável | Cidade | WhatsApp Responsável | Prospecção | Responsável | Instagram | Grupo WhatsApp criado | Contrato assinado e enviado | Data assinatura do contrato | Contrato válido até | Related files | Notes | Quantidade de criadores | business_id
    const businessData = [
      body.businessName,                    // A = Nome
      body.category,                        // B = Categoria
      body.currentPlan || 'Não definido',  // C = Plano atual
      body.comercial || '',                 // D = Comercial
      body.nomeResponsavel,                 // E = Nome Responsável
      body.cidade || '',                    // F = Cidade
      body.whatsappResponsavel,             // G = WhatsApp Responsável
      body.prospeccao || '',                // H = Prospecção
      body.responsavel || '',               // I = Responsável
      body.instagram || '',                 // J = Instagram
      body.grupoWhatsApp || '',             // K = Grupo WhatsApp criado
      body.contratoAssinado || '',          // L = Contrato assinado e enviado
      body.dataAssinatura || '',            // M = Data assinatura do contrato
      body.contratoValidoAte || '',         // N = Contrato válido até
      body.relatedFiles || '',              // O = Related files
      body.notes || '',                     // P = Notes
      '0',                                  // Q = Quantidade de criadores (padrão 0)
      businessId                            // R = business_id (CHAVE PRIMÁRIA)
    ];

    console.log('📊 Dados preparados para Google Sheets:', businessData);

    // Chamar a função que funciona no Kanban
    await addBusinessToSheet(businessData);

    console.log('✅ Negócio adicionado com sucesso via API!');

    return NextResponse.json({
      success: true,
      message: 'Negócio adicionado com sucesso!'
    });

  } catch (error: any) {
    console.error('❌ Erro na API /api/add-business:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
