import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes } = body;

    console.log('🔍 DEBUG: Parâmetros recebidos:', { businessName, mes });

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
      range: 'Campanhas!A:AE',
    });

    const values = response.data.values || [];
    console.log(`🔍 DEBUG: Total de linhas na planilha: ${values.length}`);
    
    if (values.length > 0) {
      console.log('🔍 DEBUG: Cabeçalho da planilha:', values[0]);
    }

    // Analisar dados linha por linha
    const matchingRows = [];
    const allBusinesses = new Set();
    const allMonths = new Set();

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const campaignBusiness = row[1]; // Coluna B - Business
      const campaignMes = row[5]; // Coluna F - Mês
      const influenciador = row[2]; // Coluna C - Influenciador

      allBusinesses.add(campaignBusiness);
      allMonths.add(campaignMes);

      console.log(`🔍 DEBUG: Linha ${i}:`, {
        business: campaignBusiness,
        mes: campaignMes,
        influenciador: influenciador,
        businessMatch: campaignBusiness?.toLowerCase() === businessName?.toLowerCase(),
        mesMatch: campaignMes?.toLowerCase() === mes?.toLowerCase()
      });

      if (campaignBusiness?.toLowerCase() === businessName?.toLowerCase() && 
          campaignMes?.toLowerCase() === mes?.toLowerCase()) {
        matchingRows.push({
          linha: i,
          business: campaignBusiness,
          mes: campaignMes,
          influenciador: influenciador,
          dadosCompletos: row
        });
      }
    }

    return NextResponse.json({ 
      success: true,
      debug: {
        parametros: { businessName, mes },
        totalLinhas: values.length - 1,
        cabecalho: values[0] || [],
        matchingRows: matchingRows,
        todosBusinesses: Array.from(allBusinesses),
        todosMeses: Array.from(allMonths),
        encontrados: matchingRows.length
      }
    });

  } catch (error) {
    console.error('❌ DEBUG: Erro:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}
