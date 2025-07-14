import { NextRequest, NextResponse } from 'next/server';
import { addCreatorToSheet, generateCreatorId } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API /api/add-creator chamada');
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', body);

    // Validação básica
    if (!body.nome || !body.status || !body.whatsapp || !body.instagram) {
      return NextResponse.json({
        success: false,
        error: 'Campos obrigatórios não preenchidos (Nome, Status, WhatsApp, Instagram)'
      }, { status: 400 });
    }

    // Gerar ID único para o criador
    const criadorId = await generateCreatorId(body.nome);
    console.log(`🆔 ID gerado para criador "${body.nome}": ${criadorId}`);

    // Preparar dados seguindo EXATAMENTE o cabeçalho da planilha:
    // Nome | Status | WhatsApp | Cidade | Prospecção | Responsável | Instagram | Seguidores instagram - Maio 2025 | TikTok | Seguidores TikTok - julho 25 | Onboarding Inicial | Start date | End date | Related files | Notes | Perfil | Preferências | Não aceita | Descrição do criador | Biografia | Categoria | criador_id
    const creatorData = [
      body.nome,                          // A = Nome
      body.status,                        // B = Status
      body.whatsapp,                      // C = WhatsApp
      body.cidade || '',                  // D = Cidade
      body.prospeccao || '',              // E = Prospecção
      body.responsavel || '',             // F = Responsável
      body.instagram,                     // G = Instagram
      body.seguidoresInstagram || '',     // H = Seguidores instagram - Maio 2025
      body.tiktok || '',                  // I = TikTok
      body.seguidoresTiktok || '',        // J = Seguidores TikTok - julho 25
      body.onboardingInicial || '',       // K = Onboarding Inicial
      body.startDate || '',               // L = Start date
      body.endDate || '',                 // M = End date
      body.relatedFiles || '',            // N = Related files
      body.notes || '',                   // O = Notes
      body.perfil || '',                  // P = Perfil
      body.preferencias || '',            // Q = Preferências
      body.naoAceita || '',               // R = Não aceita
      body.descricaoCriador || '',        // S = Descrição do criador
      body.biografia || '',               // T = Biografia
      body.categoria || '',               // U = Categoria
      criadorId                           // V = criador_id (CHAVE PRIMÁRIA)
    ];

    console.log('📊 Dados preparados para Google Sheets:', creatorData);

    // Chamar a função para adicionar criador
    await addCreatorToSheet(creatorData);

    console.log('✅ Criador adicionado com sucesso via API!');

    return NextResponse.json({
      success: true,
      message: 'Criador adicionado com sucesso!'
    });

  } catch (error: any) {
    console.error('❌ Erro na API /api/add-creator:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    }, { status: 500 });
  }
}
