import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient, logCreatorChanges, findCreatorInCampaigns, createCreatorUniqueId, logAction, logDetailedAction, findCampaignById, ensureCampaignUniqueIds } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, creatorsData, user, campaignId } = body;

    console.log('🔄 DEBUG: Dados recebidos na API:', {
      businessName,
      mes,
      campaignId,
      user,
      creatorsDataLength: creatorsData?.length,
      creatorsData: creatorsData
    });

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

    // Definir índices das colunas baseado na estrutura
    let businessCol, influenciadorCol, mesCol, briefingCol, dataVisitaCol, qtdConvidadosCol, visitaConfirmadaCol, dataPostagemCol, videoAprovadoCol, videoPostadoCol;

    if (hasIdColumn) {
      // Estrutura atual: A=Campaign_ID, B=Business, C=Influenciador, D=Responsável, E=Status, F=Mês, G=FIM
      // Mas baseado nos dados, parece que:
      // A=Campaign_ID, B=Business, C=Influenciador, D=Responsável, E=Status, F=Mês, G=FIM
      // Vamos usar a estrutura real observada:
      businessCol = 1; // B = Business (mas na verdade é o nome da campanha/business)
      influenciadorCol = 2; // C = Influenciador
      mesCol = 5; // F = Mês
      // Para os campos de edição, vamos assumir que estão nas colunas seguintes
      briefingCol = 7; // H
      dataVisitaCol = 8; // I
      qtdConvidadosCol = 9; // J
      visitaConfirmadaCol = 10; // K
      dataPostagemCol = 11; // L
      videoAprovadoCol = 12; // M
      videoPostadoCol = 13; // N
    } else {
      // Estrutura antiga sem ID
      businessCol = 1; // B
      influenciadorCol = 2; // C
      mesCol = 5; // F
      briefingCol = 7; // H
      dataVisitaCol = 8; // I
      qtdConvidadosCol = 9; // J
      visitaConfirmadaCol = 10; // K
      dataPostagemCol = 11; // L
      videoAprovadoCol = 12; // M
      videoPostadoCol = 13; // N
    }

    // Processar cada criador individualmente com busca robusta
    const updates: any[] = [];
    let updatedCount = 0;
    const processedCreators: string[] = [];

    console.log(`🔍 Processando ${creatorsData.length} criadores para: Business="${businessName}", Mês="${mes}"`);

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

      // Buscar diretamente na planilha com a estrutura correta
      let creatorResult = null;

      console.log(`🔍 DEBUG: Buscando criador: Business="${businessName}", Mês="${mes}", Influenciador="${influenciador}"`);
      console.log(`🔍 DEBUG: Usando colunas: businessCol=${businessCol}, influenciadorCol=${influenciadorCol}, mesCol=${mesCol}`);

      // Buscar linha por linha
      let foundAnyMatch = false;
      for (let i = 1; i < Math.min(values.length, 10); i++) { // Limitar a 10 linhas para debug
        const row = values[i];
        const rowBusiness = row[businessCol] || '';
        const rowInfluenciador = row[influenciadorCol] || '';
        const rowMes = row[mesCol] || '';

        console.log(`📋 DEBUG: Linha ${i}: Business="${rowBusiness}", Influenciador="${rowInfluenciador}", Mês="${rowMes}"`);

        // Comparação flexível
        const businessMatch = rowBusiness.toLowerCase().trim() === businessName.toLowerCase().trim();
        const influenciadorMatch = rowInfluenciador.toLowerCase().trim() === influenciador.toLowerCase().trim();
        const mesMatch = rowMes.toLowerCase().trim() === mes.toLowerCase().trim();

        console.log(`🔍 DEBUG: Matches - Business: ${businessMatch}, Influenciador: ${influenciadorMatch}, Mês: ${mesMatch}`);

        if (businessMatch && influenciadorMatch && mesMatch) {
          console.log(`✅ DEBUG: Criador encontrado na linha ${i}!`);
          creatorResult = {
            found: true,
            rowIndex: i,
            data: {
              business: rowBusiness,
              influenciador: rowInfluenciador,
              mes: rowMes,
              fullRow: row
            }
          };
          foundAnyMatch = true;
          break;
        }
      }

      if (!foundAnyMatch) {
        console.log(`❌ DEBUG: Nenhuma correspondência encontrada para ${influenciador}`);
        console.log(`❌ DEBUG: Procurando por Business="${businessName}", Mês="${mes}", Influenciador="${influenciador}"`);
      }

      if (!creatorResult || !creatorResult.found) {
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

      const { rowIndex, data } = creatorResult;
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
        { key: 'visitaConfirmada', column: visitaConfirmadaCol, range: String.fromCharCode(65 + visitaConfirmadaCol) },
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
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'Nenhuma campanha encontrada para atualizar' });
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

    // Log da atividade (opcional - pode ser implementado depois)
    // await logActivity({
    //   action: 'UPDATE_CAMPAIGN_CREATORS',
    //   businessName,
    //   mes,
    //   user,
    //   details: `Atualizados ${updatedCount} criadores`
    // });

    return NextResponse.json({ 
      success: true, 
      message: `Dados atualizados para ${updatedCount} criadores`,
      updatedCount 
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar dados dos criadores:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}
