import { NextRequest, NextResponse } from 'next/server';
import { addCampaignToSheet } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API /api/add-campaign chamada');
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', body);

    // Validação básica
    if (!body.campanha || !body.business || !body.influenciador || !body.status) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: campanha, business, influenciador, status' },
        { status: 400 }
      );
    }

    // Preparar dados seguindo EXATAMENTE o cabeçalho da planilha:
    // Campanha | Business | Influenciador | Responsável | Status | Mês | FIM | Briefing completo enviado para o influenciador? | Data e hora Visita | Quantidade de convidados | Visita Confirmado | Data e hora da Postagem | Vídeo aprovado? | Video/Reels postado? | Link Video Instagram | Notas | Arquivo | Avaliação Restaurante | Avaliação Influenciador | Status do Calendário | Column 22 | ID do Evento | Formato | Perfil do criador | Objetivo | Comunicação secundária | Datas e horários para gravação | O que precisa ser falado no vídeo (de forma natural) - História | Promoção CTA | Column 31 | Objetivo 1
    const campaignData = [
      body.campanha,                          // A = Campanha
      body.business,                          // B = Business
      body.influenciador,                     // C = Influenciador
      body.responsavel || '',                 // D = Responsável
      body.status,                            // E = Status
      body.mes || '',                         // F = Mês
      body.fim || '',                         // G = FIM
      body.briefingCompleto || '',            // H = Briefing completo enviado para o influenciador?
      body.dataHoraVisita || '',              // I = Data e hora Visita
      body.quantidadeConvidados || '',        // J = Quantidade de convidados
      body.visitaConfirmado || '',            // K = Visita Confirmado
      body.dataHoraPostagem || '',            // L = Data e hora da Postagem
      body.videoAprovado || '',               // M = Vídeo aprovado?
      body.videoPostado || '',                // N = Video/Reels postado?
      body.linkVideoInstagram || '',          // O = Link Video Instagram
      body.notas || '',                       // P = Notas
      body.arquivo || '',                     // Q = Arquivo
      body.avaliacaoRestaurante || '',        // R = Avaliação Restaurante
      body.avaliacaoInfluenciador || '',      // S = Avaliação Influenciador
      body.statusCalendario || '',            // T = Status do Calendário
      body.column22 || '',                    // U = Column 22
      body.idEvento || '',                    // V = ID do Evento
      body.formato || '',                     // W = Formato
      body.perfilCriador || '',               // X = Perfil do criador
      body.objetivo || '',                    // Y = Objetivo
      body.comunicacaoSecundaria || '',       // Z = Comunicação secundária
      body.datasHorariosGravacao || '',       // AA = Datas e horários para gravação
      body.oQuePrecisaSerFalado || '',        // AB = O que precisa ser falado no vídeo (de forma natural) - História
      body.promocaoCTA || '',                 // AC = Promoção CTA
      body.column31 || '',                    // AD = Column 31
      body.objetivo1 || ''                    // AE = Objetivo 1
    ];

    console.log('📊 Dados formatados para planilha:', campaignData);

    // Adicionar à planilha
    await addCampaignToSheet(campaignData);

    console.log('✅ Campanha adicionada com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Campanha adicionada com sucesso!',
      data: {
        campanha: body.campanha,
        business: body.business,
        influenciador: body.influenciador,
        status: body.status
      }
    });

  } catch (error: any) {
    console.error('❌ Erro na API add-campaign:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
