import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient, logCreatorChanges, findCreatorInCampaigns, createCreatorUniqueId, logAction, logDetailedAction, findCampaignById, ensureCampaignUniqueIds } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, creatorsData, user, campaignId } = body;

    console.log('🔄 Atualizando dados dos criadores:', { businessName, mes, creatorsData, campaignId });

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
      range: 'campanhas!A:Z',
    });

    const values = response.data.values;
    if (!values || values.length <= 1) {
      return NextResponse.json({ success: false, error: 'Nenhuma campanha encontrada' });
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

      console.log(`🔄 Processando criador: ${influenciador}`);

      // Tentar usar ID único primeiro, depois fallback para busca tradicional
      let creatorResult = null;

      if (campaignId) {
        console.log(`🔍 Tentando buscar por ID da campanha: ${campaignId}`);
        creatorResult = await findCampaignById(campaignId);

        // Verificar se o criador corresponde
        if (creatorResult?.found && creatorResult.data.influenciador !== influenciador) {
          console.log(`⚠️ ID encontrado mas criador diferente: ${creatorResult.data.influenciador} vs ${influenciador}`);
          creatorResult = null;
        }
      }

      // Fallback para busca tradicional se ID não funcionou
      if (!creatorResult || !creatorResult.found) {
        console.log(`🔍 Fallback: Buscando por business/mês/influenciador`);
        creatorResult = await findCreatorInCampaigns(businessName, mes, influenciador);
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

      // Verificar e registrar cada mudança
      const fieldsToUpdate = [
        { key: 'briefingCompleto', column: 7, range: 'H' },
        { key: 'dataHoraVisita', column: 8, range: 'I' },
        { key: 'quantidadeConvidados', column: 9, range: 'J' },
        { key: 'visitaConfirmada', column: 10, range: 'K' },
        { key: 'dataHoraPostagem', column: 11, range: 'L' },
        { key: 'videoAprovado', column: 12, range: 'M' },
        { key: 'videoPostado', column: 13, range: 'N' }
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
