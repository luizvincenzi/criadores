import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient } from '@/app/actions/sheetsActions';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Analisando estrutura da planilha Campanhas...');

    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({ 
        success: false, 
        error: 'GOOGLE_SPREADSHEET_ID não configurado' 
      });
    }

    // Buscar dados da aba Campanhas
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:G',
    });

    const values = response.data.values || [];
    console.log(`📊 Total de linhas na planilha: ${values.length}`);
    
    if (values.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Planilha Campanhas vazia' 
      });
    }

    // Analisar cabeçalho
    const headers = values[0] || [];
    console.log('📋 Cabeçalho da planilha:', headers);

    // Analisar primeiras 5 linhas de dados
    const sampleData = [];
    for (let i = 1; i < Math.min(6, values.length); i++) {
      const row = values[i];
      sampleData.push({
        linha: i + 1,
        colA: row[0] || '',
        colB: row[1] || '',
        colC: row[2] || '',
        colD: row[3] || '',
        colE: row[4] || '',
        colF: row[5] || '',
        colG: row[6] || '',
        dadosCompletos: row
      });
    }

    // Verificar se existe coluna ID
    const hasIdColumn = headers[0] && headers[0].toLowerCase().includes('id');

    // Buscar campanhas específicas para teste
    const testCampaigns = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (hasIdColumn) {
        // Nova estrutura com ID
        const campaignId = row[0];
        const business = row[2]; // Coluna C
        const influenciador = row[3]; // Coluna D
        const mes = row[6]; // Coluna G
        
        if (business && influenciador && mes) {
          testCampaigns.push({
            linha: i + 1,
            campaignId: campaignId,
            business: business,
            influenciador: influenciador,
            mes: mes,
            estrutura: 'com_id'
          });
        }
      } else {
        // Estrutura antiga sem ID
        const business = row[1]; // Coluna B
        const influenciador = row[2]; // Coluna C
        const mes = row[5]; // Coluna F
        
        if (business && influenciador && mes) {
          testCampaigns.push({
            linha: i + 1,
            campaignId: '',
            business: business,
            influenciador: influenciador,
            mes: mes,
            estrutura: 'sem_id'
          });
        }
      }
      
      // Limitar a 10 campanhas para análise
      if (testCampaigns.length >= 10) break;
    }

    return NextResponse.json({ 
      success: true,
      analise: {
        totalLinhas: values.length - 1,
        cabecalho: headers,
        temColunaId: hasIdColumn,
        estrutura: hasIdColumn ? 'nova_com_id' : 'antiga_sem_id',
        amostrasLinhas: sampleData,
        campanhasEncontradas: testCampaigns,
        recomendacao: hasIdColumn ? 
          'Planilha já tem IDs únicos. Verificar lógica de busca na API.' : 
          'Planilha precisa de IDs únicos. Execute /api/initialize-campaign-ids'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao analisar planilha:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
