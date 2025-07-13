import { NextRequest, NextResponse } from 'next/server';
import { getRawCampaignsData, getCreatorsData, getBusinessesData, createGoogleSheetsClient } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, quantidadeContratada } = body;

    console.log('🔄 API: Buscando slots de criadores:', { businessName, mes, quantidadeContratada });
    console.log('🔍 DEBUG: Parâmetros de busca detalhados:', {
      businessName: `"${businessName}"`,
      mes: `"${mes}"`,
      quantidadeContratada: quantidadeContratada
    });

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
      // ESTRUTURA REAL CORRIGIDA:
      // A=Campaign_ID, B=Nome Campanha, C=Influenciador, D=Responsável, E=Status, F=Mês, G=FIM
      campanhaCol = 1; // B = Nome Campanha
      businessCol = 1; // B = Nome Campanha (nome do business)
      influenciadorCol = 2; // C = Influenciador
      responsavelCol = 3; // D = Responsável
      statusCol = 4; // E = Status
      mesCol = 5; // F = Mês
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

      // Comparação flexível - buscar por campanha + mês (incluindo slots vazios)
      const campanhaMatch = rowCampanha.toLowerCase().trim() === businessName.toLowerCase().trim();

      // Comparação de mês mais flexível (aceita "Julho 2025", "Jul", "julho", etc.)
      const mesNormalizado = mes.toLowerCase().trim();
      const rowMesNormalizado = rowMes.toLowerCase().trim();
      const mesMatch = rowMesNormalizado === mesNormalizado ||
                      rowMesNormalizado.includes(mesNormalizado) ||
                      mesNormalizado.includes(rowMesNormalizado);

      console.log(`🔍 DEBUG: Comparação - Campanha: "${rowCampanha}" === "${businessName}" = ${campanhaMatch}`);
      console.log(`🔍 DEBUG: Comparação - Mês: "${rowMes}" ~= "${mes}" = ${mesMatch}`);

      if (campanhaMatch && mesMatch) {
        // Verificar se a campanha está ativa (coluna T = Status do Calendário)
        const statusCalendario = row[19] || 'Ativo'; // Coluna T (índice 19)
        const isActive = statusCalendario.toLowerCase() !== 'inativo';

        console.log(`✅ Slot encontrado na linha ${i}: Influenciador="${rowInfluenciador}" Status="${statusCalendario}" (${isActive ? 'ATIVO' : 'INATIVO'})`);

        // Só adicionar se estiver ativo
        if (isActive) {
          existingCampaigns.push({
            influenciador: rowInfluenciador,
            briefingCompleto: row[briefingCol] || '',
            dataHoraVisita: row[dataVisitaCol] || '',
            quantidadeConvidados: row[qtdConvidadosCol] || '',
            visitaConfirmada: row[visitaConfirmadaCol] || '', // Corrigido nome do campo
            dataHoraPostagem: row[dataPostagemCol] || '',
            videoAprovado: row[videoAprovadoCol] || '',
            videoPostado: row[videoPostadoCol] || '',
            statusCalendario: statusCalendario,
            rowIndex: i
          });
        } else {
          console.log(`🚫 Slot inativo ignorado: ${rowInfluenciador || 'Slot vazio'}`);
        }
      }
    }

    // Buscar dados do business para filtrar criadores por cidade
    const businessesData = await getBusinessesData();
    const businessData = businessesData.find(business =>
      business.nome?.toLowerCase() === businessName.toLowerCase()
    );

    const businessCity = businessData?.cidade?.toLowerCase().trim();
    console.log(`🏙️ Cidade do business ${businessName}: ${businessCity}`);

    // Buscar criadores disponíveis filtrados por cidade
    const creatorsData = await getCreatorsData();
    let availableCreators = creatorsData.filter(creator =>
      creator.status?.toLowerCase() !== 'inativo' &&
      creator.status?.toLowerCase() !== 'bloqueado'
    );

    // Filtrar criadores pela mesma cidade do business
    if (businessCity) {
      const creatorsFromSameCity = availableCreators.filter(creator =>
        creator.cidade?.toLowerCase().trim() === businessCity
      );

      if (creatorsFromSameCity.length > 0) {
        availableCreators = creatorsFromSameCity;
        console.log(`🎯 Filtrados ${creatorsFromSameCity.length} criadores de ${businessCity}`);
      } else {
        console.log(`⚠️ Nenhum criador encontrado em ${businessCity}, mostrando todos os criadores ativos`);
      }
    } else {
      console.log(`⚠️ Cidade do business não encontrada, mostrando todos os criadores ativos`);
    }

    // Criar array de slots baseado na quantidade contratada
    const slots = [];

    console.log(`📊 Campanhas encontradas para ${businessName} - ${mes}:`, existingCampaigns.length);
    console.log(`📊 Criadores contratados: ${quantidadeContratada}`);
    console.log(`👥 Criadores disponíveis (filtrados por cidade): ${availableCreators.length}`);

    if (availableCreators.length > 0) {
      console.log(`📍 Criadores de ${businessCity}:`, availableCreators.map(c => `${c.nome} (${c.cidade})`).join(', '));
    }

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
