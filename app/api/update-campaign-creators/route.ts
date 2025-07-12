import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient } from '@/app/actions/sheetsActions';

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

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const campaignBusiness = row[1]; // Coluna B - Business
      const campaignMes = row[6]; // Coluna G - Mês
      const influenciador = row[2]; // Coluna C - Influenciador
      
      if (campaignBusiness?.toLowerCase() === businessName.toLowerCase() && 
          campaignMes?.toLowerCase() === mes.toLowerCase()) {
        
        // Encontrar dados correspondentes do criador
        const creatorData = creatorsData.find((creator: any) => 
          creator.influenciador === influenciador
        );

        if (creatorData) {
          // Preparar atualizações para as colunas específicas
          const rowUpdates = [
            { range: `campanhas!H${i + 1}`, values: [[creatorData.briefingCompleto || '']] }, // H = Briefing completo
            { range: `campanhas!I${i + 1}`, values: [[creatorData.dataHoraVisita || '']] }, // I = Data e hora visita
            { range: `campanhas!J${i + 1}`, values: [[creatorData.quantidadeConvidados || '']] }, // J = Quantidade convidados
            { range: `campanhas!K${i + 1}`, values: [[creatorData.visitaConfirmada || '']] }, // K = Visita confirmada
            { range: `campanhas!L${i + 1}`, values: [[creatorData.dataHoraPostagem || '']] }, // L = Data e hora postagem
            { range: `campanhas!M${i + 1}`, values: [[creatorData.videoAprovado || '']] }, // M = Vídeo aprovado
            { range: `campanhas!N${i + 1}`, values: [[creatorData.videoPostado || '']] }, // N = Vídeo postado
          ];

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
