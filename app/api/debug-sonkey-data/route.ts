import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Verificando dados da Sonkey na planilha...');

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
      range: 'campanhas!A:G' // Primeiras 7 colunas para análise
    });

    const values = response.data.values || [];
    if (values.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum dado encontrado na aba campanhas'
      });
    }

    const headers = values[0];
    console.log('📋 Headers da planilha:', headers);

    // Buscar todas as linhas que contêm "Sonkey"
    const sonkeyRows = [];
    const allRows = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      
      // Adicionar todas as linhas para análise
      allRows.push({
        linha: i + 1,
        campaignId: row[0] || '',
        nomeCampanha: row[1] || '',
        influenciador: row[2] || '',
        responsavel: row[3] || '',
        status: row[4] || '',
        mes: row[5] || '',
        fim: row[6] || ''
      });

      // Verificar se contém "Sonkey" em qualquer campo
      const rowText = row.join(' ').toLowerCase();
      if (rowText.includes('sonkey')) {
        sonkeyRows.push({
          linha: i + 1,
          campaignId: row[0] || '',
          nomeCampanha: row[1] || '',
          influenciador: row[2] || '',
          responsavel: row[3] || '',
          status: row[4] || '',
          mes: row[5] || '',
          fim: row[6] || '',
          rawRow: row
        });
      }
    }

    // Buscar campanhas por diferentes critérios
    const searchCriteria = [
      { field: 'nomeCampanha', value: 'Sonkey' },
      { field: 'nomeCampanha', value: 'sonkey' },
      { field: 'nomeCampanha', value: 'SONKEY' }
    ];

    const searchResults = {};
    
    for (const criteria of searchCriteria) {
      const matches = allRows.filter(row => 
        row.nomeCampanha.toLowerCase().includes(criteria.value.toLowerCase())
      );
      searchResults[`${criteria.field}_${criteria.value}`] = matches;
    }

    // Análise de meses únicos
    const uniqueMonths = [...new Set(allRows.map(row => row.mes).filter(mes => mes.trim() !== ''))];
    
    // Análise de campanhas únicas
    const uniqueCampaigns = [...new Set(allRows.map(row => row.nomeCampanha).filter(nome => nome.trim() !== ''))];

    return NextResponse.json({
      success: true,
      data: {
        headers,
        totalRows: values.length - 1,
        sonkeyRows,
        sonkeyCount: sonkeyRows.length,
        searchResults,
        uniqueMonths,
        uniqueCampaigns: uniqueCampaigns.slice(0, 20), // Primeiras 20 para não sobrecarregar
        analysis: {
          hasHeaders: headers.length > 0,
          firstHeader: headers[0],
          campaignIdColumn: headers[0],
          nomeCampanhaColumn: headers[1],
          influenciadorColumn: headers[2],
          mesColumn: headers[5]
        },
        sampleRows: allRows.slice(-10) // Últimas 10 linhas (mais recentes)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao verificar dados da Sonkey:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
