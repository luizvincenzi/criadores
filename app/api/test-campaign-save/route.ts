import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes } = body;

    console.log('🧪 TESTE SALVAMENTO: Simulando busca de campanha...');
    console.log(`🔍 Parâmetros: Business="${businessName}", Mês="${mes}"`);

    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({ 
        success: false, 
        error: 'GOOGLE_SPREADSHEET_ID não configurado' 
      });
    }

    // Buscar dados da planilha
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:AE',
    });

    const values = response.data.values || [];
    const headers = values[0] || [];
    const hasIdColumn = headers[0] && headers[0].toLowerCase().includes('id');
    
    console.log(`📊 Estrutura: ${hasIdColumn ? 'COM' : 'SEM'} coluna ID`);
    console.log(`📋 Cabeçalho: ${headers.slice(0, 10).join(', ')}`);

    // Definir índices das colunas
    let businessCol, influenciadorCol, mesCol;
    if (hasIdColumn) {
      businessCol = 2; // C = Business (após inserção da coluna ID)
      influenciadorCol = 3; // D = Influenciador
      mesCol = 6; // G = Mês
    } else {
      businessCol = 1; // B = Business
      influenciadorCol = 2; // C = Influenciador
      mesCol = 5; // F = Mês
    }

    console.log(`🔍 Usando colunas: Business=${businessCol}, Influenciador=${influenciadorCol}, Mês=${mesCol}`);

    // Buscar campanhas correspondentes
    const matchingCampaigns = [];
    const allBusinesses = new Set();
    const allMonths = new Set();

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowBusiness = row[businessCol] || '';
      const rowInfluenciador = row[influenciadorCol] || '';
      const rowMes = row[mesCol] || '';

      allBusinesses.add(rowBusiness);
      allMonths.add(rowMes);

      // Comparação exata
      const businessMatch = rowBusiness.toLowerCase().trim() === businessName.toLowerCase().trim();
      const mesMatch = rowMes.toLowerCase().trim() === mes.toLowerCase().trim();

      console.log(`📋 Linha ${i}: Business="${rowBusiness}" (${businessMatch}), Mês="${rowMes}" (${mesMatch}), Influenciador="${rowInfluenciador}"`);

      if (businessMatch && mesMatch && rowInfluenciador.trim() !== '') {
        matchingCampaigns.push({
          linha: i,
          business: rowBusiness,
          mes: rowMes,
          influenciador: rowInfluenciador,
          campaignId: hasIdColumn ? row[0] : '',
          dadosCompletos: row.slice(0, 15)
        });
      }
    }

    // Análise de similaridade
    const similarBusinesses = Array.from(allBusinesses).filter(b => 
      b.toLowerCase().includes(businessName.toLowerCase()) || 
      businessName.toLowerCase().includes(b.toLowerCase())
    );

    const similarMonths = Array.from(allMonths).filter(m => 
      m.toLowerCase().includes(mes.toLowerCase()) || 
      mes.toLowerCase().includes(m.toLowerCase())
    );

    return NextResponse.json({ 
      success: true,
      teste: {
        parametros: { businessName, mes },
        estrutura: {
          temId: hasIdColumn,
          cabecalho: headers.slice(0, 10),
          colunas: { businessCol, influenciadorCol, mesCol }
        },
        resultados: {
          campanhasEncontradas: matchingCampaigns.length,
          campanhas: matchingCampaigns,
          todosBusinesses: Array.from(allBusinesses).slice(0, 20),
          todosMeses: Array.from(allMonths),
          businessesSimilares: similarBusinesses,
          mesesSimilares: similarMonths
        },
        diagnostico: {
          businessExiste: allBusinesses.has(businessName),
          mesExiste: allMonths.has(mes),
          businessSimilar: similarBusinesses.length > 0,
          mesSimilar: similarMonths.length > 0,
          problema: matchingCampaigns.length === 0 ? 'Nenhuma campanha encontrada' : 'Campanhas encontradas'
        }
      }
    });

  } catch (error) {
    console.error('❌ TESTE SALVAMENTO: Erro:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    });
  }
}
