import { NextRequest, NextResponse } from 'next/server';
import { getRawCampaignsData, getCreatorsData, createGoogleSheetsClient } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, quantidadeContratada } = body;

    console.log('🔄 API: Buscando slots de criadores:', { businessName, mes, quantidadeContratada });

    if (!businessName || !mes || !quantidadeContratada) {
      return NextResponse.json({ 
        success: false, 
        error: 'Parâmetros obrigatórios: businessName, mes, quantidadeContratada' 
      });
    }

    // Buscar campanhas diretamente da planilha com estrutura correta
    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'campanhas!A:AE',
    });

    const values = response.data.values || [];

    if (values.length <= 1) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma campanha encontrada na planilha'
      });
    }

    // Verificar estrutura da planilha
    const headers = values[0] || [];
    const hasIdColumn = headers[0] && headers[0].toLowerCase().includes('id');

    console.log(`📊 Estrutura da planilha: ${hasIdColumn ? 'COM' : 'SEM'} coluna ID`);
    console.log(`📋 Cabeçalho: ${headers.slice(0, 7).join(', ')}`);

    // Definir índices das colunas baseado na estrutura REAL descoberta
    let campanhaCol, businessCol, influenciadorCol, responsavelCol, statusCol, mesCol, briefingCol, dataVisitaCol, qtdConvidadosCol, visitaConfirmadaCol, dataPostagemCol, videoAprovadoCol, videoPostadoCol;

    if (hasIdColumn) {
      // ESTRUTURA REAL DESCOBERTA:
      // A=Campaign_ID, B=Campanha, C=Business(INFLUENCIADOR), D=Influenciador(RESPONSÁVEL), E=Responsável(STATUS), F=Status(MÊS), G=Mês(DATA_FIM)
      campanhaCol = 1; // B = Campanha (ex: "Boussolé")
      businessCol = 1; // B = Campanha (nome do business)
      influenciadorCol = 2; // C = Business (na verdade é o INFLUENCIADOR)
      responsavelCol = 3; // D = Influenciador (na verdade é o RESPONSÁVEL)
      statusCol = 4; // E = Responsável (na verdade é o STATUS)
      mesCol = 5; // F = Status (na verdade é o MÊS)
      // Campos de edição
      briefingCol = 7; // H
      dataVisitaCol = 8; // I
      qtdConvidadosCol = 9; // J
      visitaConfirmadaCol = 10; // K
      dataPostagemCol = 11; // L
      videoAprovadoCol = 12; // M
      videoPostadoCol = 13; // N
    } else {
      // Estrutura antiga sem ID (ajustar se necessário)
      campanhaCol = 0; // A
      businessCol = 0; // A
      influenciadorCol = 1; // B
      responsavelCol = 2; // C
      statusCol = 3; // D
      mesCol = 4; // E
      briefingCol = 6; // G
      dataVisitaCol = 7; // H
      qtdConvidadosCol = 8; // I
      visitaConfirmadaCol = 9; // J
      dataPostagemCol = 10; // K
      videoAprovadoCol = 11; // L
      videoPostadoCol = 12; // M
    }

    // Buscar campanhas existentes para este business/mês
    const existingCampaigns = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowCampanha = row[campanhaCol] || ''; // Nome da campanha/business
      const rowInfluenciador = row[influenciadorCol] || ''; // Nome do influenciador
      const rowMes = row[mesCol] || ''; // Mês

      console.log(`📋 Linha ${i}: Campanha="${rowCampanha}", Influenciador="${rowInfluenciador}", Mês="${rowMes}"`);

      // Comparação flexível - buscar por campanha + mês
      const campanhaMatch = rowCampanha.toLowerCase().trim() === businessName.toLowerCase().trim();
      const mesMatch = rowMes.toLowerCase().trim() === mes.toLowerCase().trim();

      if (campanhaMatch && mesMatch && rowInfluenciador.trim() !== '') {
        console.log(`✅ Campanha encontrada na linha ${i}: ${rowInfluenciador}`);
        existingCampaigns.push({
          influenciador: rowInfluenciador,
          briefingCompleto: row[briefingCol] || '',
          dataHoraVisita: row[dataVisitaCol] || '',
          quantidadeConvidados: row[qtdConvidadosCol] || '',
          visitaConfirmada: row[visitaConfirmadaCol] || '', // Corrigido nome do campo
          dataHoraPostagem: row[dataPostagemCol] || '',
          videoAprovado: row[videoAprovadoCol] || '',
          videoPostado: row[videoPostadoCol] || '',
          rowIndex: i
        });
      }
    }

    // Buscar criadores disponíveis
    const creatorsData = await getCreatorsData();
    const availableCreators = creatorsData.filter(creator => 
      creator.status?.toLowerCase() !== 'inativo' && 
      creator.status?.toLowerCase() !== 'bloqueado'
    );

    // Criar array de slots baseado na quantidade contratada
    const slots = [];

    console.log(`📊 Campanhas encontradas para ${businessName} - ${mes}:`, existingCampaigns.length);
    console.log(`📊 Criadores contratados: ${quantidadeContratada}`);

    // Primeiro, adicionar todas as campanhas existentes
    existingCampaigns.forEach((campaign, index) => {
      console.log(`📋 Campanha ${index + 1}: ${campaign.influenciador}`);
      slots.push({
        index: index,
        influenciador: campaign.influenciador,
        briefingCompleto: campaign.briefingCompleto || 'pendente',
        dataHoraVisita: campaign.dataHoraVisita || '',
        quantidadeConvidados: campaign.quantidadeConvidados || '',
        visitaConfirmada: campaign.visitaConfirmado || 'pendente', // Corrigido nome do campo
        dataHoraPostagem: campaign.dataHoraPostagem || '',
        videoAprovado: campaign.videoAprovado || 'pendente',
        videoPostado: campaign.videoPostado || 'pendente',
        isExisting: true,
        rowIndex: campaign.rowIndex // Adicionar índice da linha para referência
      });
    });

    // Depois, adicionar slots vazios para completar a quantidade contratada
    const remainingSlots = quantidadeContratada - existingCampaigns.length;
    console.log(`📋 Slots vazios a criar: ${remainingSlots}`);

    for (let i = 0; i < remainingSlots; i++) {
      slots.push({
        index: existingCampaigns.length + i,
        influenciador: '',
        briefingCompleto: 'pendente',
        dataHoraVisita: '',
        quantidadeConvidados: '',
        visitaConfirmada: 'pendente', // Corrigido nome do campo
        dataHoraPostagem: '',
        videoAprovado: 'pendente',
        videoPostado: 'pendente',
        isExisting: false
      });
    }

    console.log(`✅ API: ${slots.length} slots de criadores gerados`);

    return NextResponse.json({ 
      success: true, 
      slots,
      availableCreators: availableCreators.map(creator => ({
        id: creator.id,
        nome: creator.nome,
        cidade: creator.cidade,
        status: creator.status
      }))
    });

  } catch (error) {
    console.error('❌ API: Erro ao buscar slots de criadores:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    });
  }
}
