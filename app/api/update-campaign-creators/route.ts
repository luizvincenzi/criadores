import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient, logCreatorChanges } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes, creatorsData, user } = body;

    console.log('🔄 Atualizando dados dos criadores:', { businessName, mes, creatorsData });

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

    // Encontrar linhas que correspondem ao business e mês
    const updates: any[] = [];
    let updatedCount = 0;

    console.log(`🔍 Procurando campanhas para: Business="${businessName}", Mês="${mes}"`);
    console.log(`📊 Total de linhas na planilha: ${values.length - 1}`);

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const campaignBusiness = row[1]; // Coluna B - Business
      const campaignMes = row[5]; // Coluna F - Mês
      const influenciador = row[2]; // Coluna C - Influenciador

      console.log(`📋 Linha ${i}: Business="${campaignBusiness}", Mês="${campaignMes}", Influenciador="${influenciador}"`);

      if (campaignBusiness?.toLowerCase() === businessName.toLowerCase() &&
          campaignMes?.toLowerCase() === mes.toLowerCase()) {

        console.log(`✅ Match encontrado na linha ${i}!`);
        
        // Encontrar dados correspondentes do criador
        const creatorData = creatorsData.find((creator: any) => 
          creator.influenciador === influenciador
        );

        if (creatorData) {
          console.log(`🔄 Atualizando criador: ${influenciador}`);

          // Registrar mudanças para audit_log
          const changes: { [key: string]: { old: string; new: string } } = {};

          // Verificar mudanças e preparar atualizações
          const rowUpdates = [];

          if (creatorData.briefingCompleto !== undefined && row[7] !== creatorData.briefingCompleto) {
            changes.briefingCompleto = { old: row[7] || '', new: creatorData.briefingCompleto };
            rowUpdates.push({ range: `campanhas!H${i + 1}`, values: [[creatorData.briefingCompleto || '']] });
          }
          if (creatorData.dataHoraVisita !== undefined && row[8] !== creatorData.dataHoraVisita) {
            changes.dataHoraVisita = { old: row[8] || '', new: creatorData.dataHoraVisita };
            rowUpdates.push({ range: `campanhas!I${i + 1}`, values: [[creatorData.dataHoraVisita || '']] });
          }
          if (creatorData.quantidadeConvidados !== undefined && row[9] !== creatorData.quantidadeConvidados) {
            changes.quantidadeConvidados = { old: row[9] || '', new: creatorData.quantidadeConvidados };
            rowUpdates.push({ range: `campanhas!J${i + 1}`, values: [[creatorData.quantidadeConvidados || '']] });
          }
          if (creatorData.visitaConfirmada !== undefined && row[10] !== creatorData.visitaConfirmada) {
            changes.visitaConfirmada = { old: row[10] || '', new: creatorData.visitaConfirmada };
            rowUpdates.push({ range: `campanhas!K${i + 1}`, values: [[creatorData.visitaConfirmada || '']] });
          }
          if (creatorData.dataHoraPostagem !== undefined && row[11] !== creatorData.dataHoraPostagem) {
            changes.dataHoraPostagem = { old: row[11] || '', new: creatorData.dataHoraPostagem };
            rowUpdates.push({ range: `campanhas!L${i + 1}`, values: [[creatorData.dataHoraPostagem || '']] });
          }
          if (creatorData.videoAprovado !== undefined && row[12] !== creatorData.videoAprovado) {
            changes.videoAprovado = { old: row[12] || '', new: creatorData.videoAprovado };
            rowUpdates.push({ range: `campanhas!M${i + 1}`, values: [[creatorData.videoAprovado || '']] });
          }
          if (creatorData.videoPostado !== undefined && row[13] !== creatorData.videoPostado) {
            changes.videoPostado = { old: row[13] || '', new: creatorData.videoPostado };
            rowUpdates.push({ range: `campanhas!N${i + 1}`, values: [[creatorData.videoPostado || '']] });
          }

          // Registrar mudanças no audit_log se houver alterações
          if (Object.keys(changes).length > 0) {
            await logCreatorChanges(businessName, mes, influenciador, changes, user);
          }

          updates.push(...rowUpdates);
          updatedCount++;
        }
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
