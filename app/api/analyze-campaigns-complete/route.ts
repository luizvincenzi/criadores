import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient } from '@/app/actions/sheetsActions';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 ANÁLISE COMPLETA: Iniciando análise das campanhas...');

    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({ 
        success: false, 
        error: 'GOOGLE_SPREADSHEET_ID não configurado' 
      });
    }

    // 1. Analisar estrutura da aba Campanhas
    console.log('📊 Analisando aba Campanhas...');
    const campaignsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:AE',
    });

    const campaignsValues = campaignsResponse.data.values || [];
    const campaignsHeaders = campaignsValues[0] || [];
    
    // 2. Analisar aba Detailed_Logs se existir
    console.log('📋 Analisando aba Detailed_Logs...');
    let detailedLogsData = null;
    try {
      const logsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Detailed_Logs!A:T',
      });
      detailedLogsData = {
        exists: true,
        totalRows: logsResponse.data.values?.length || 0,
        headers: logsResponse.data.values?.[0] || [],
        sampleEntries: logsResponse.data.values?.slice(1, 6) || []
      };
    } catch (error) {
      detailedLogsData = {
        exists: false,
        error: 'Aba Detailed_Logs não encontrada'
      };
    }

    // 3. Analisar estrutura das campanhas
    const hasIdColumn = campaignsHeaders[0] && campaignsHeaders[0].toLowerCase().includes('id');
    
    // 4. Mapear todas as campanhas com detalhes
    const allCampaigns = [];
    const businessMonthGroups = new Map();
    
    for (let i = 1; i < Math.min(campaignsValues.length, 50); i++) { // Limitar a 50 para análise
      const row = campaignsValues[i];
      
      let campaignData;
      if (hasIdColumn) {
        // Nova estrutura com ID
        campaignData = {
          linha: i + 1,
          campaignId: row[0] || '',
          campanha: row[1] || '',
          business: row[2] || '',
          influenciador: row[3] || '',
          responsavel: row[4] || '',
          status: row[5] || '',
          mes: row[6] || '',
          fim: row[7] || '',
          briefingCompleto: row[8] || '',
          dataHoraVisita: row[9] || '',
          quantidadeConvidados: row[10] || '',
          visitaConfirmada: row[11] || '',
          dataHoraPostagem: row[12] || '',
          videoAprovado: row[13] || '',
          videoPostado: row[14] || ''
        };
      } else {
        // Estrutura antiga sem ID
        campaignData = {
          linha: i + 1,
          campaignId: '',
          campanha: row[0] || '',
          business: row[1] || '',
          influenciador: row[2] || '',
          responsavel: row[3] || '',
          status: row[4] || '',
          mes: row[5] || '',
          fim: row[6] || '',
          briefingCompleto: row[7] || '',
          dataHoraVisita: row[8] || '',
          quantidadeConvidados: row[9] || '',
          visitaConfirmada: row[10] || '',
          dataHoraPostagem: row[11] || '',
          videoAprovado: row[12] || '',
          videoPostado: row[13] || ''
        };
      }
      
      allCampaigns.push(campaignData);
      
      // Agrupar por business + mês
      const groupKey = `${campaignData.business}_${campaignData.mes}`.toLowerCase();
      if (!businessMonthGroups.has(groupKey)) {
        businessMonthGroups.set(groupKey, []);
      }
      businessMonthGroups.get(groupKey)?.push(campaignData);
    }

    // 5. Identificar grupos únicos de business + mês
    const uniqueGroups = Array.from(businessMonthGroups.entries()).map(([key, campaigns]) => ({
      groupKey: key,
      business: campaigns[0].business,
      mes: campaigns[0].mes,
      totalCriadores: campaigns.length,
      criadores: campaigns.map(c => c.influenciador),
      status: campaigns[0].status,
      hasIds: campaigns.every(c => c.campaignId !== '')
    }));

    return NextResponse.json({ 
      success: true,
      analysis: {
        campanhas: {
          totalLinhas: campaignsValues.length - 1,
          headers: campaignsHeaders,
          temColunaId: hasIdColumn,
          estrutura: hasIdColumn ? 'nova_com_id' : 'antiga_sem_id',
          amostras: allCampaigns.slice(0, 10)
        },
        detailedLogs: detailedLogsData,
        grupos: {
          total: uniqueGroups.length,
          grupos: uniqueGroups.slice(0, 10),
          todosComIds: uniqueGroups.every(g => g.hasIds)
        },
        recomendacoes: [
          hasIdColumn ? '✅ Planilha tem IDs únicos' : '❌ Planilha precisa de IDs únicos',
          detailedLogsData?.exists ? '✅ Aba Detailed_Logs existe' : '❌ Aba Detailed_Logs não existe',
          uniqueGroups.length > 0 ? `✅ ${uniqueGroups.length} grupos de campanhas encontrados` : '❌ Nenhum grupo de campanhas encontrado'
        ]
      }
    });

  } catch (error) {
    console.error('❌ ANÁLISE COMPLETA: Erro:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
