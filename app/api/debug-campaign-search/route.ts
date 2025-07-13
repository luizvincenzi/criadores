import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI';

export async function POST(request: NextRequest) {
  try {
    const { campaignId, businessName, mes, influenciador } = await request.json();
    
    console.log('🔍 DEBUG: Testando busca de campanha:', { campaignId, businessName, mes, influenciador });

    // Configurar autenticação
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: 'crmcriadores',
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: 'crm-criadores@crmcriadores.iam.gserviceaccount.com',
        client_id: '113660609859941708871',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/service_accounts/v1/metadata/x509/crm-criadores%40crmcriadores.iam.gserviceaccount.com'
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Buscar dados da aba campanhas
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!A:AE'
    });

    const values = response.data.values || [];
    if (values.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum dado encontrado na aba campanhas'
      });
    }

    const headers = values[0];
    console.log('📋 Headers:', headers.slice(0, 10));

    // Encontrar índices das colunas
    const campanhaCol = headers.findIndex(h => h.toLowerCase() === 'campanha');
    const businessCol = headers.findIndex(h => h.toLowerCase() === 'business');
    const influenciadorCol = headers.findIndex(h => h.toLowerCase() === 'influenciador');
    const mesCol = headers.findIndex(h => h.toLowerCase() === 'mês');

    console.log('📊 Índices das colunas:', { campanhaCol, businessCol, influenciadorCol, mesCol });

    // Buscar campanhas que correspondem aos critérios
    const searchResults = [];
    const exactMatches = [];
    const partialMatches = [];

    for (let i = 1; i < Math.min(values.length, 100); i++) {
      const row = values[i];
      const rowCampaignId = (row[0] || '').toString().trim();
      const rowCampanha = (row[campanhaCol] || '').toString().trim();
      const rowBusiness = (row[businessCol] || '').toString().trim();
      const rowInfluenciador = (row[influenciadorCol] || '').toString().trim();
      const rowMes = (row[mesCol] || '').toString().trim();

      const result = {
        linha: i + 1,
        campaignId: rowCampaignId,
        campanha: rowCampanha,
        business: rowBusiness,
        influenciador: rowInfluenciador,
        mes: rowMes,
        matches: {
          campaignId: campaignId && rowCampaignId === campaignId,
          business: businessName && rowBusiness.toLowerCase().includes(businessName.toLowerCase()),
          influenciador: influenciador && rowInfluenciador.toLowerCase() === influenciador.toLowerCase(),
          mes: mes && rowMes.toLowerCase().includes(mes.toLowerCase())
        }
      };

      // Verificar se é uma correspondência exata
      if (campaignId && result.matches.campaignId && result.matches.influenciador) {
        exactMatches.push(result);
      }
      // Verificar se é uma correspondência parcial
      else if (result.matches.business && result.matches.influenciador && result.matches.mes) {
        partialMatches.push(result);
      }
      // Adicionar todas as linhas relevantes para debug
      else if (result.matches.business || result.matches.influenciador || result.matches.campaignId) {
        searchResults.push(result);
      }
    }

    // Análise dos resultados
    const analysis = {
      totalRows: values.length - 1,
      searchCriteria: { campaignId, businessName, mes, influenciador },
      columnIndexes: { campanhaCol, businessCol, influenciadorCol, mesCol },
      exactMatches: exactMatches.length,
      partialMatches: partialMatches.length,
      relatedResults: searchResults.length
    };

    console.log('📊 Análise dos resultados:', analysis);

    return NextResponse.json({
      success: true,
      analysis,
      exactMatches,
      partialMatches,
      relatedResults: searchResults.slice(0, 10), // Limitar para não sobrecarregar
      headers: headers.slice(0, 10),
      recommendation: exactMatches.length > 0 
        ? 'Use Campaign_ID search - exact matches found'
        : partialMatches.length > 0 
        ? 'Use fallback search - partial matches found'
        : 'No matches found - check search criteria'
    });

  } catch (error) {
    console.error('❌ Erro no debug de busca:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
