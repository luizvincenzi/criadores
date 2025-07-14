import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, creatorData, user } = body;
    const creatorName = creatorData?.influenciador || '';

    console.log('🔄 Adicionando criador à campanha:', { businessName, mes, creatorName });

    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    // 🆔 CONVERTER NOMES PARA IDs
    console.log('🔍 Convertendo nomes para IDs...');

    // Buscar business_id
    const businessResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/get-business-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName })
    });
    const businessResult = await businessResponse.json();

    if (!businessResult.success) {
      throw new Error(`Business "${businessName}" não encontrado: ${businessResult.error}`);
    }
    const businessId = businessResult.businessId;

    // Buscar criador_id
    const creatorResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/get-creator-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorName })
    });
    const creatorResult = await creatorResponse.json();

    if (!creatorResult.success) {
      throw new Error(`Criador "${creatorName}" não encontrado: ${creatorResult.error}`);
    }
    const criadorId = creatorResult.criadorId;

    console.log('✅ IDs obtidos:', { businessId, criadorId });

    // Buscar dados da aba campanhas para encontrar o próximo ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'campanhas!A:Z',
    });

    const values = response.data.values;
    if (!values || values.length <= 1) {
      return NextResponse.json({ success: false, error: 'Erro ao acessar planilha de campanhas' });
    }

    // Encontrar uma campanha existente do mesmo business/mês para copiar dados base
    let baseCampaign = null;
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const campaignBusiness = row[1]; // Coluna B - Business
      const campaignMes = row[6]; // Coluna G - Mês
      
      if (campaignBusiness?.toLowerCase() === businessName.toLowerCase() && 
          campaignMes?.toLowerCase() === mes.toLowerCase()) {
        baseCampaign = row;
        break;
      }
    }

    if (!baseCampaign) {
      return NextResponse.json({ success: false, error: 'Nenhuma campanha base encontrada para este business/mês' });
    }

    // Preparar nova linha para o criador
    const newRow = [
      baseCampaign[0] || '', // A = Campanha
      businessId, // B = business_id (ID em vez de nome)
      criadorId, // C = criador_id (ID em vez de nome)
      baseCampaign[3] || '', // D = Responsável
      baseCampaign[4] || 'Reunião Briefing', // E = Status
      mes, // F = Mês
      baseCampaign[6] || '', // G = FIM
      'pendente', // H = Briefing completo enviado para o influenciador?
      '', // I = Data e hora Visita
      '', // J = Quantidade de convidados
      'pendente', // K = Visita Confirmado
      '', // L = Data e hora da Postagem
      'pendente', // M = Vídeo aprovado?
      'pendente', // N = Video/Reels postado?
      '', // O = Link Video Instagram
      '', // P = Notas
      '', // Q = Arquivo
      '', // R = Avaliação Restaurante
      '', // S = Avaliação Influenciador
      '', // T = Status do Calendário
      '', // U = Column 22
      '', // V = ID do Evento
      '', // W = Formato
      '', // X = Perfil do criador
      '', // Y = Objetivo
      '', // Z = Comunicação secundária
      '', // AA = Datas e horários para gravação
      '', // AB = O que precisa ser falado no vídeo
      '', // AC = Promoção CTA
      '', // AD = Column 31
      '', // AE = Objetivo 1
    ];

    // Adicionar nova linha à planilha
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'campanhas!A:AE',
      valueInputOption: 'RAW',
      requestBody: {
        values: [newRow]
      }
    });

    console.log(`✅ Criador ${creatorName} adicionado à campanha: ${businessName} - ${mes}`);

    return NextResponse.json({ 
      success: true, 
      message: `Criador ${creatorName} adicionado com sucesso!`
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar criador à campanha:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}
