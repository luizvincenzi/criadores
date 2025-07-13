import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI';

export async function POST(request: NextRequest) {
  try {
    const { businessName, mes, influenciador, campaignId } = await request.json();
    
    console.log('🧪 Teste de atualização de campanha:', { businessName, mes, influenciador, campaignId });

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
      range: 'campanhas!A:H'
    });

    const values = response.data.values || [];
    if (values.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum dado encontrado na aba campanhas'
      });
    }

    const headers = values[0];
    console.log('📋 Headers encontrados:', headers);

    // Encontrar índices das colunas
    const campaignIdCol = 0; // Coluna A
    const nomeCampanhaCol = 1; // Coluna B
    const businessCol = headers.findIndex(h => h.toLowerCase() === 'business');
    const influenciadorCol = headers.findIndex(h => h.toLowerCase() === 'influenciador');
    const mesCol = headers.findIndex(h => h.toLowerCase() === 'mês');

    console.log('📊 Índices das colunas:', { campaignIdCol, nomeCampanhaCol, businessCol, influenciadorCol, mesCol });

    // Buscar campanha específica
    let foundCampaign = null;
    let searchMethod = '';

    // Estratégia 1: Buscar por Campaign_ID
    if (campaignId) {
      console.log(`🆔 Buscando por Campaign_ID: ${campaignId}`);
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        const rowCampaignId = (row[campaignIdCol] || '').toString().trim();
        const rowInfluenciador = (row[influenciadorCol] || '').toString().toLowerCase().trim();
        
        if (rowCampaignId === campaignId && rowInfluenciador === influenciador.toLowerCase().trim()) {
          foundCampaign = {
            rowIndex: i + 1,
            data: row,
            campaignId: rowCampaignId,
            business: row[businessCol] || '',
            influenciador: row[influenciadorCol] || '',
            mes: row[mesCol] || ''
          };
          searchMethod = 'Campaign_ID + Influenciador';
          break;
        }
      }
    }

    // Estratégia 2: Buscar por Business + Mês + Influenciador
    if (!foundCampaign) {
      console.log(`🔍 Buscando por Business + Mês + Influenciador`);
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        const rowBusiness = (row[businessCol] || '').toString().toLowerCase().trim();
        const rowInfluenciador = (row[influenciadorCol] || '').toString().toLowerCase().trim();
        const rowMes = (row[mesCol] || '').toString().toLowerCase().trim();
        
        const businessMatch = rowBusiness === businessName.toLowerCase().trim();
        const influenciadorMatch = rowInfluenciador === influenciador.toLowerCase().trim();
        const mesMatch = rowMes.includes(mes.toLowerCase()) || mes.toLowerCase().includes(rowMes);
        
        if (businessMatch && influenciadorMatch && mesMatch) {
          foundCampaign = {
            rowIndex: i + 1,
            data: row,
            campaignId: row[campaignIdCol] || '',
            business: row[businessCol] || '',
            influenciador: row[influenciadorCol] || '',
            mes: row[mesCol] || ''
          };
          searchMethod = 'Business + Mês + Influenciador';
          break;
        }
      }
    }

    if (foundCampaign) {
      console.log('✅ Campanha encontrada:', foundCampaign);
      
      // Simular uma atualização (apenas para teste)
      const testUpdate = {
        range: `campanhas!H${foundCampaign.rowIndex}`, // Coluna H como teste
        values: [['TESTE_' + new Date().toISOString()]]
      };

      // Executar atualização de teste
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: testUpdate.range,
        valueInputOption: 'RAW',
        requestBody: {
          values: testUpdate.values
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Campanha encontrada e teste de atualização realizado',
        foundCampaign,
        searchMethod,
        testUpdate,
        headers
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Campanha não encontrada',
        searchAttempts: [
          campaignId ? `Campaign_ID: ${campaignId}` : 'Campaign_ID não fornecido',
          `Business + Mês + Influenciador: ${businessName} + ${mes} + ${influenciador}`
        ],
        availableData: {
          totalRows: values.length - 1,
          headers,
          sampleData: values.slice(1, 4).map((row, index) => ({
            linha: index + 2,
            campaignId: row[campaignIdCol],
            business: row[businessCol],
            influenciador: row[influenciadorCol],
            mes: row[mesCol]
          }))
        }
      });
    }

  } catch (error) {
    console.error('❌ Erro no teste de atualização:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
