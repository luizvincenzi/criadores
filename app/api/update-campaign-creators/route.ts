import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient, logCreatorChanges, findCreatorInCampaigns, createCreatorUniqueId, logAction, logDetailedAction, findCampaignById, ensureCampaignUniqueIds } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API update-campaign-creators iniciada');

    const body = await request.json();
    console.log('📥 Body recebido:', body);

    const { businessName, mes, creatorsData, user, campaignId } = body;

    console.log('🔄 DEBUG: Dados recebidos na API:', {
      businessName,
      mes,
      campaignId,
      user,
      creatorsDataLength: creatorsData?.length,
      creatorsData: creatorsData
    });

    // Validações básicas
    if (!businessName) {
      const errorMsg = 'businessName é obrigatório';
      console.error('❌', errorMsg);
      return NextResponse.json({ success: false, error: errorMsg });
    }

    if (!creatorsData || !Array.isArray(creatorsData)) {
      const errorMsg = 'creatorsData deve ser um array válido';
      console.error('❌', errorMsg);
      return NextResponse.json({ success: false, error: errorMsg });
    }

    // Garantir que a planilha tenha IDs únicos
    await ensureCampaignUniqueIds();

    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    // Buscar todas as campanhas para encontrar as do business/mês específico
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'campanhas!A:AE',
    });

    const values = response.data.values;
    if (!values || values.length <= 1) {
      return NextResponse.json({ success: false, error: 'Nenhuma campanha encontrada' });
    }

    // Verificar estrutura da planilha
    const headers = values[0] || [];
    const hasIdColumn = headers[0] && headers[0].toLowerCase().includes('id');

    console.log(`📊 DEBUG: Estrutura da planilha: ${hasIdColumn ? 'COM' : 'SEM'} coluna ID`);
    console.log(`📋 DEBUG: Cabeçalho: ${headers.slice(0, 10).join(', ')}`);
    console.log(`📊 DEBUG: Total de linhas na planilha: ${values.length - 1}`);

    // Definir índices das colunas baseado na estrutura REAL do Google Sheets
    // Cabeçalho fornecido: Campaign_ID	Nome Campanha	Influenciador	Responsável	Status	Mês	FIM	Briefing completo enviado para o influenciador?	Data e hora Visita	Quantidade de convidados	Visita Confirmado	Data e hora da Postagem	Vídeo aprovado?	Video/Reels postado?
    let campanhaCol, businessCol, influenciadorCol, responsavelCol, statusCol, mesCol, briefingCol, dataVisitaCol, qtdConvidadosCol, visitaConfirmadaCol, dataPostagemCol, videoAprovadoCol, videoPostadoCol;

    if (hasIdColumn) {
      // ESTRUTURA CORRIGIDA baseada no cabeçalho real fornecido:
      // A=Campaign_ID, B=Nome Campanha, C=Influenciador, D=Responsável, E=Status, F=Mês, G=FIM, H=Briefing completo, I=Data e hora Visita, J=Quantidade de convidados, K=Visita Confirmado, L=Data e hora da Postagem, M=Vídeo aprovado?, N=Video/Reels postado?
      campanhaCol = 1; // B = Nome Campanha (nome do business)
      businessCol = 1; // B = Nome Campanha (nome do business)
      influenciadorCol = 2; // C = Influenciador
      responsavelCol = 3; // D = Responsável
      statusCol = 4; // E = Status
      mesCol = 5; // F = Mês
      // Campos de edição baseados na estrutura real:
      briefingCol = 7; // H = Briefing completo enviado para o influenciador?
      dataVisitaCol = 8; // I = Data e hora Visita
      qtdConvidadosCol = 9; // J = Quantidade de convidados
      visitaConfirmadaCol = 10; // K = Visita Confirmado
      dataPostagemCol = 11; // L = Data e hora da Postagem
      videoAprovadoCol = 12; // M = Vídeo aprovado?
      videoPostadoCol = 13; // N = Video/Reels postado?
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

    // Processar cada criador individualmente com busca robusta
    const updates: any[] = [];
    let updatedCount = 0;
    const processedCreators: string[] = [];

    console.log(`🔍 Processando ${creatorsData.length} criadores para: Business="${businessName}", Mês="${mes}"`);

    // 🆔 CONVERTER NOMES PARA IDs PRIMEIRO
    console.log('🔄 Convertendo nomes para IDs...');

    // Buscar business_id
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
    console.log(`✅ Business ID obtido: ${businessId}`);

    for (const creatorData of creatorsData) {
      if (!creatorData.influenciador) {
        console.log(`⚠️ Criador sem nome de influenciador, pulando...`);
        continue;
      }

      const influenciador = creatorData.influenciador;

      // Evitar processar o mesmo criador múltiplas vezes
      if (processedCreators.includes(influenciador)) {
        console.log(`⚠️ Criador ${influenciador} já processado, pulando...`);
        continue;
      }

      console.log(`🔄 DEBUG: Processando criador: ${influenciador}`);

      // Buscar criador_id
      const creatorResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/get-creator-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorName: influenciador })
      });
      const creatorResult = await creatorResponse.json();

      if (!creatorResult.success) {
        console.log(`❌ Criador "${influenciador}" não encontrado: ${creatorResult.error}`);
        continue;
      }
      const criadorId = creatorResult.criadorId;
      console.log(`✅ Criador ID obtido: ${criadorId}`);

      // Buscar campanha usando IDs (business_id e criador_id)
      let campaignResult = null;

      console.log(`🔍 DEBUG: Buscando criador: Campaign_ID="${campaignId}", Business_ID="${businessId}", Mês="${mes}", Criador_ID="${criadorId}"`);
      console.log(`📊 DEBUG: Usando colunas: influenciadorCol=${influenciadorCol}, campanhaCol=${campanhaCol}, mesCol=${mesCol}`);

      // Estratégia 1: Buscar por business_id + criador_id + mês (mais preciso)
      console.log(`🆔 DEBUG: Tentativa 1 - Busca por business_id + criador_id + mês`);

      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        const rowCampaignId = (row[0] || '').toString().trim(); // Coluna A = Campaign_ID
        const rowBusinessId = (row[campanhaCol] || '').toString().trim(); // Coluna B = business_id
        const rowCriadorId = (row[influenciadorCol] || '').toString().trim(); // Coluna C = criador_id
        const rowMes = (row[mesCol] || '').toString().trim(); // Coluna F = Mês

        if (i <= 5) { // Log apenas as primeiras 5 linhas para debug
          console.log(`📋 DEBUG: Linha ${i + 1}: Campaign_ID="${rowCampaignId}", Business_ID="${rowBusinessId}", Criador_ID="${rowCriadorId}", Mês="${rowMes}"`);
        }

        // Buscar por business_id + criador_id + mês
        const businessMatch = rowBusinessId === businessId;
        const criadorMatch = rowCriadorId === criadorId;
        const mesMatch = rowMes.toLowerCase() === mes.toLowerCase() || rowMes === '' || mes === '';

        if (businessMatch && criadorMatch && mesMatch) {
          console.log(`✅ DEBUG: Criador encontrado por IDs na linha ${i + 1}!`);
          campaignResult = {
            found: true,
            rowIndex: i,
            data: {
              campaignId: rowCampaignId,
              businessId: rowBusinessId,
              criadorId: rowCriadorId,
              mes: rowMes,
              fullRow: row
            },
            method: 'business_id_criador_id'
          };
          break;
        }
      }

      // Se não encontrou, tentar busca mais flexível apenas por criador_id
      if (!campaignResult) {
        console.log(`🔍 DEBUG: Tentativa 2 - Busca flexível apenas por criador_id`);

        for (let i = 1; i < values.length; i++) {
          const row = values[i];
          const rowCriadorId = (row[influenciadorCol] || '').toString().trim(); // Coluna C = criador_id

          if (rowCriadorId === criadorId) {
            console.log(`✅ DEBUG: Criador encontrado por criador_id na linha ${i + 1}!`);
            campaignResult = {
              found: true,
              rowIndex: i,
              data: {
                campaignId: row[0] || '',
                businessId: row[campanhaCol] || '',
                criadorId: rowCriadorId,
                mes: row[mesCol] || '',
                fullRow: row
              },
              method: 'criador_id_only'
            };
            break;
          }
        }
      }



      if (!campaignResult) {
        console.log(`❌ DEBUG: Nenhuma correspondência encontrada para ${influenciador}`);
        console.log(`❌ DEBUG: Tentativas: Campaign_ID="${campaignId}", Business="${businessName}", Mês="${mes}"`);
        console.log(`❌ DEBUG: Total de linhas verificadas: ${Math.min(values.length - 1, 100)}`);
      }

      if (!campaignResult || !campaignResult.found) {
        console.log(`❌ Criador ${influenciador} não encontrado na planilha`);

        // Log de erro detalhado
        const uniqueId = await createCreatorUniqueId({ business: businessName, mes, influenciador });
        await logDetailedAction({
          action: 'creator_update_failed',
          entity_type: 'creator',
          entity_id: uniqueId,
          entity_name: `${businessName}-${mes}-${influenciador}`,
          user_id: user,
          user_name: user,
          business_context: businessName,
          campaign_context: mes,
          creator_context: influenciador,
          old_value: '',
          new_value: JSON.stringify(creatorData),
          change_reason: 'creator_not_found_in_sheets',
          validation_status: 'failed',
          details: `Criador ${influenciador} não encontrado na planilha para ${businessName} - ${mes}`
        });

        continue;
      }

      const { rowIndex, data } = campaignResult;
      const row = data.fullRow;

      console.log(`✅ Criador ${influenciador} encontrado na linha ${rowIndex}`);

      // Registrar mudanças para audit_log
      const changes: { [key: string]: { old: string; new: string } } = {};
      const rowUpdates = [];

      // Verificar e registrar cada mudança usando os índices corretos
      const fieldsToUpdate = [
        { key: 'briefingCompleto', column: briefingCol, range: String.fromCharCode(65 + briefingCol) },
        { key: 'dataHoraVisita', column: dataVisitaCol, range: String.fromCharCode(65 + dataVisitaCol) },
        { key: 'quantidadeConvidados', column: qtdConvidadosCol, range: String.fromCharCode(65 + qtdConvidadosCol) },
        { key: 'visitaConfirmado', column: visitaConfirmadaCol, range: String.fromCharCode(65 + visitaConfirmadaCol) },
        { key: 'dataHoraPostagem', column: dataPostagemCol, range: String.fromCharCode(65 + dataPostagemCol) },
        { key: 'videoAprovado', column: videoAprovadoCol, range: String.fromCharCode(65 + videoAprovadoCol) },
        { key: 'videoPostado', column: videoPostadoCol, range: String.fromCharCode(65 + videoPostadoCol) }
      ];

      for (const field of fieldsToUpdate) {
        const newValue = creatorData[field.key];
        const oldValue = row[field.column] || '';

        if (newValue !== undefined && oldValue !== newValue) {
          changes[field.key] = { old: oldValue, new: newValue };
          rowUpdates.push({
            range: `campanhas!${field.range}${rowIndex + 1}`,
            values: [[newValue || '']]
          });

          console.log(`📝 Campo ${field.key}: "${oldValue}" → "${newValue}"`);
        }
      }

      // Registrar mudanças no audit_log se houver alterações
      if (Object.keys(changes).length > 0) {
        const uniqueId = await createCreatorUniqueId({ business: businessName, mes, influenciador });

        // Log no audit_log tradicional
        await logAction({
          action: 'creator_data_updated',
          entity_type: 'creator',
          entity_id: uniqueId,
          entity_name: `${businessName}-${mes}-${influenciador}`,
          old_value: JSON.stringify(Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.old]))),
          new_value: JSON.stringify(Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.new]))),
          user_id: user,
          user_name: user,
          details: `Campos alterados: ${Object.keys(changes).join(', ')}`
        });

        // Log detalhado na nova aba
        await logDetailedAction({
          action: 'creator_data_updated',
          entity_type: 'creator',
          entity_id: uniqueId,
          entity_name: `${businessName}-${mes}-${influenciador}`,
          user_id: user,
          user_name: user,
          business_context: businessName,
          campaign_context: mes,
          creator_context: influenciador,
          field_changed: Object.keys(changes).join(','),
          old_value: JSON.stringify(Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.old]))),
          new_value: JSON.stringify(Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.new]))),
          change_reason: 'user_edit_via_modal',
          validation_status: 'success',
          details: `${Object.keys(changes).length} campos atualizados: ${Object.entries(changes).map(([k, v]) => `${k}: "${v.old}" → "${v.new}"`).join('; ')}`
        });

        updates.push(...rowUpdates);
        updatedCount++;
        processedCreators.push(influenciador);

        console.log(`✅ ${Object.keys(changes).length} campos atualizados para ${influenciador}`);
      } else {
        console.log(`ℹ️ Nenhuma alteração detectada para ${influenciador}`);
        processedCreators.push(influenciador); // Adicionar à lista mesmo sem alterações
      }
    }

    if (updates.length === 0) {
      console.log(`ℹ️ INFO: Nenhuma atualização foi preparada`);
      console.log(`📊 DEBUG: Processados ${processedCreators.length} criadores: ${processedCreators.join(', ')}`);
      console.log(`📊 DEBUG: Total de criadores recebidos: ${creatorsData.length}`);
      console.log(`📊 DEBUG: Parâmetros de busca: Business="${businessName}", Mês="${mes}", Campaign_ID="${campaignId}"`);

      // Se criadores foram processados mas não houve alterações, isso é um sucesso
      if (processedCreators.length > 0) {
        console.log(`✅ Todos os ${processedCreators.length} criadores foram verificados, mas não havia alterações para salvar`);
        return NextResponse.json({
          success: true,
          message: `✅ Dados verificados para ${processedCreators.length} criadores. Nenhuma alteração necessária.`,
          updatedCount: 0,
          processedCreators,
          noChangesNeeded: true
        });
      } else {
        // Se nenhum criador foi processado, isso é um erro
        return NextResponse.json({
          success: false,
          error: `Nenhuma campanha encontrada para atualizar. Verificados ${creatorsData.length} criadores para Business="${businessName}", Mês="${mes}". Processados: ${processedCreators.join(', ') || 'nenhum'}`,
          debug: {
            businessName,
            mes,
            campaignId,
            creatorsCount: creatorsData.length,
            processedCreators,
            totalRows: values.length - 1
          }
        });
      }
    }

    // Executar todas as atualizações
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log(`✅ Dados atualizados para ${updatedCount} criadores: ${businessName} - ${mes}`);

    // Log da atividade com IDs únicos
    try {
      // Buscar business_id
      const businessResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/get-business-id`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName })
      });

      const businessResult = await businessResponse.json();

      if (businessResult.success) {
        const businessId = businessResult.businessId;
        const entityId = `camp_${businessId}_${mes.toLowerCase()}`;

        await logAction({
          action: 'campaign_creators_updated',
          entity_type: 'campaign',
          entity_id: entityId,
          entity_name: `${businessName}-${mes}`,
          user_id: user || 'sistema',
          user_name: user || 'Sistema',
          details: `Atualizados ${updatedCount} criadores na campanha ${businessName} - ${mes}`
        });

        console.log('✅ Log de auditoria registrado');
      }
    } catch (logError) {
      console.error('⚠️ Erro ao registrar log (não crítico):', logError);
    }

    const successResult = {
      success: true,
      message: `✅ Dados atualizados com sucesso para ${updatedCount} criadores`,
      updatedCount,
      businessName,
      mes
    };

    console.log('🔍 DEBUG: Resultado final da API:', successResult);
    console.log('🔍 DEBUG: Tipo do resultado:', typeof successResult);
    console.log('🔍 DEBUG: Success value:', successResult.success);

    return NextResponse.json(successResult);

  } catch (error) {
    console.error('❌ Erro ao atualizar dados dos criadores:', error);

    const errorResult = {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };

    console.log('🔍 DEBUG: Resultado de erro da API:', errorResult);
    console.log('🔍 DEBUG: Tipo do resultado de erro:', typeof errorResult);

    return NextResponse.json(errorResult);
  }
}
