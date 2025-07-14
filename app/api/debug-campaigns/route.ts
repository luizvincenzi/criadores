import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient } from '@/app/actions/sheetsActions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessName = searchParams.get('business') || '';
    const mes = searchParams.get('mes') || '';
    const influenciador = searchParams.get('influenciador') || '';

    console.log('🔍 DEBUG: Parâmetros de busca:', { businessName, mes, influenciador });

    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    // Buscar dados da planilha
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'campanhas!A:AF',
    });

    const values = response.data.values || [];
    
    if (values.length <= 1) {
      return NextResponse.json({
        success: false,
        error: 'Planilha vazia ou só com cabeçalho',
        totalRows: values.length
      });
    }

    const headers = values[0] || [];
    const hasIdColumn = headers[0] && headers[0].toLowerCase().includes('id');

    console.log(`📊 Estrutura da planilha: ${hasIdColumn ? 'COM' : 'SEM'} coluna ID`);
    console.log(`📋 Cabeçalho completo:`, headers);

    // Mapear colunas corretamente
    const businessCol = hasIdColumn ? 1 : 0; // B ou A - Nome Campanha (Business)
    const influenciadorCol = hasIdColumn ? 2 : 1; // C ou B - Influenciador
    const mesCol = hasIdColumn ? 5 : 4; // F ou E - Mês
    const statusCol = hasIdColumn ? 4 : 3; // E ou D - Status

    // Buscar campanhas que correspondem aos critérios
    const matchingCampaigns = [];
    const allCampaigns = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      
      const rowBusiness = (row[businessCol] || '').toString().trim();
      const rowInfluenciador = (row[influenciadorCol] || '').toString().trim();
      const rowMes = (row[mesCol] || '').toString().trim();
      const rowStatus = (row[statusCol] || '').toString().trim();
      const rowCampaignId = hasIdColumn ? (row[0] || '').toString().trim() : '';

      allCampaigns.push({
        linha: i + 1,
        campaignId: rowCampaignId,
        business: rowBusiness,
        influenciador: rowInfluenciador,
        mes: rowMes,
        status: rowStatus
      });

      // Verificar se corresponde aos critérios de busca
      const businessMatch = !businessName || rowBusiness.toLowerCase().includes(businessName.toLowerCase());
      const influenciadorMatch = !influenciador || rowInfluenciador.toLowerCase().includes(influenciador.toLowerCase());
      const mesMatch = !mes || rowMes.toLowerCase().includes(mes.toLowerCase());

      if (businessMatch && influenciadorMatch && mesMatch) {
        matchingCampaigns.push({
          linha: i + 1,
          campaignId: rowCampaignId,
          business: rowBusiness,
          influenciador: rowInfluenciador,
          mes: rowMes,
          status: rowStatus,
          matches: {
            business: businessMatch,
            influenciador: influenciadorMatch,
            mes: mesMatch
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      debug: {
        searchParams: { businessName, mes, influenciador },
        structure: {
          hasIdColumn,
          totalRows: values.length - 1,
          headers: headers.slice(0, 15), // Primeiros 15 cabeçalhos
          columnMapping: {
            businessCol,
            influenciadorCol,
            mesCol,
            statusCol
          }
        },
        results: {
          totalCampaigns: allCampaigns.length,
          matchingCampaigns: matchingCampaigns.length,
          matches: matchingCampaigns,
          sampleCampaigns: allCampaigns.slice(0, 50) // Primeiras 50 campanhas
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro no debug de campanhas:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
