import { NextRequest, NextResponse } from 'next/server';
import { getRawCampaignsData, getCreatorsData, getBusinessesData, createGoogleSheetsClient } from '@/app/actions/sheetsActions';
import { apiCache, cacheKeys } from '@/utils/cache';

export async function POST(request: NextRequest) {
  console.log('🚀 API get-creator-slots INICIADA');
  try {
    console.log('📥 Recebendo request...');
    const body = await request.json();
    console.log('📦 Body recebido:', body);

    const { businessName, mes, quantidadeContratada } = body;
    console.log('🔄 API: Buscando slots de criadores:', { businessName, mes, quantidadeContratada });

    if (!businessName || !mes || !quantidadeContratada) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros obrigatórios: businessName, mes, quantidadeContratada'
      });
    }

    // Verificar cache primeiro - TTL de 2 minutos para reduzir quota
    const cacheKey = cacheKeys.creatorSlots(businessName, mes);
    const cachedData = apiCache.get(cacheKey);

    if (cachedData) {
      console.log('📦 Retornando dados do cache para:', cacheKey);
      return NextResponse.json(cachedData);
    }

    console.log('📦 Cache miss, buscando dados do Google Sheets...');

    // 1. Primeiro buscar o business_id pelo nome
    console.log('🔍 Buscando business_id para:', businessName);

    const businessResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/get-business-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName })
    });

    const businessResult = await businessResponse.json();

    if (!businessResult.success) {
      return NextResponse.json({
        success: false,
        error: `Business "${businessName}" não encontrado: ${businessResult.error}`
      });
    }

    const businessId = businessResult.businessId;
    const businessDisplayName = businessResult.businessName; // Nome legível para o frontend
    console.log('✅ Business ID encontrado:', businessId, 'Nome:', businessDisplayName);

    // Buscar campanhas diretamente da planilha com estrutura correta
    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    // Forçar atualização sem cache
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'campanhas!A:AE',
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING'
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

      // Agora buscar por business_id em vez de nome
      const campanhaMatch = rowCampanha === businessId;

      // Comparação de mês mais flexível (aceita "Julho 2025", "Jul", "julho", etc.)
      const mesNormalizado = mes.toLowerCase().trim();
      const rowMesNormalizado = rowMes.toLowerCase().trim();
      const mesMatch = rowMesNormalizado === mesNormalizado ||
                      rowMesNormalizado.includes(mesNormalizado) ||
                      mesNormalizado.includes(rowMesNormalizado);

      console.log(`🔍 DEBUG: Comparação - Business ID: "${rowCampanha}" === "${businessId}" = ${campanhaMatch}`);
      console.log(`🔍 DEBUG: Comparação - Mês: "${rowMes}" ~= "${mes}" = ${mesMatch}`);

      if (campanhaMatch && mesMatch) {
        // Verificar se a campanha está ativa (coluna T = Status do Calendário)
        const statusCalendario = row[19] || 'Ativo'; // Coluna T (índice 19)
        const isActive = statusCalendario.toLowerCase() !== 'inativo';

        console.log(`✅ Slot encontrado na linha ${i}: Influenciador="${rowInfluenciador}" Status="${statusCalendario}" (${isActive ? 'ATIVO' : 'INATIVO'})`);

        // Debug específico para Jean
        if (rowInfluenciador && rowInfluenciador.toLowerCase().includes('jean')) {
          console.log(`🔍 DEBUG JEAN - Linha ${i}:`, {
            influenciador: rowInfluenciador,
            visitaConfirmadoCol: visitaConfirmadaCol,
            visitaConfirmadoValue: row[visitaConfirmadaCol],
            rowData: row.slice(0, 15), // Primeiras 15 colunas
            isActive: isActive
          });
        }

        // Só adicionar se estiver ativo
        if (isActive) {
          existingCampaigns.push({
            influenciador: rowInfluenciador,
            briefingCompleto: row[briefingCol] || '',
            dataHoraVisita: row[dataVisitaCol] || '',
            quantidadeConvidados: row[qtdConvidadosCol] || '',
            visitaConfirmado: row[visitaConfirmadaCol] || '', // Corrigido nome do campo
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
        visitaConfirmado: campaign.visitaConfirmado || 'pendente', // Corrigido nome do campo
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
        visitaConfirmado: 'pendente', // Corrigido nome do campo
        dataHoraPostagem: '',
        videoAprovado: 'pendente',
        videoPostado: 'pendente',
        isExisting: false
      });
    }

    // 3. Resolver nomes dos criadores pelos IDs
    const creatorIds = slots
      .filter(slot => slot.influenciador && slot.influenciador.startsWith('crt_'))
      .map(slot => slot.influenciador);

    if (creatorIds.length > 0) {
      console.log('🔍 Resolvendo nomes para IDs:', creatorIds);

      const resolveResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/resolve-creator-names`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorIds })
      });

      const resolveResult = await resolveResponse.json();

      if (resolveResult.success) {
        // Substituir IDs pelos nomes nos slots
        slots.forEach(slot => {
          if (slot.influenciador && resolveResult.resolvedNames[slot.influenciador]) {
            slot.influenciador = resolveResult.resolvedNames[slot.influenciador];
          }
        });
        console.log('✅ Nomes dos criadores resolvidos');
      } else {
        console.error('❌ Erro ao resolver nomes:', resolveResult.error);
      }
    }

    // 4. Adicionar informações do business para o frontend
    slots.forEach(slot => {
      slot.businessName = businessDisplayName; // Nome legível do business
      slot.businessId = businessId; // ID para operações internas
    });

    console.log(`✅ API: ${slots.length} slots de criadores gerados`);

    const responseData = {
      success: true,
      slots,
      availableCreators: availableCreators.map(creator => ({
        id: creator.id,
        nome: creator.nome,
        cidade: creator.cidade,
        status: creator.status
      }))
    };

    // Salvar no cache com TTL de 2 minutos
    apiCache.set(cacheKey, responseData, 'slots');
    console.log('📦 Dados salvos no cache:', cacheKey);

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ API: Erro ao buscar slots de criadores:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('❌ Tipo do erro:', typeof error);
    console.error('❌ Erro completo:', JSON.stringify(error, null, 2));

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
}
