import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI';

export async function POST(request: NextRequest) {
  try {
    const { campaignId, businessName, mes, influenciador } = await request.json();
    
    console.log('🔍 Buscando campanha:', { campaignId, businessName, mes, influenciador });

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
      range: 'campanhas!A:AZ'
    });

    const values = response.data.values || [];
    if (values.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Nenhum dado encontrado na aba campanhas'
      });
    }

    const headers = values[0];
    console.log('📋 Headers encontrados:', headers.slice(0, 10));

    // Encontrar índices das colunas importantes
    const campaignIdCol = headers.findIndex(h => h.toLowerCase().includes('campaign') && h.toLowerCase().includes('id'));
    const businessCol = headers.findIndex(h => h.toLowerCase() === 'business');
    const influenciadorCol = headers.findIndex(h => h.toLowerCase() === 'influenciador');
    const mesCol = headers.findIndex(h => h.toLowerCase() === 'mês');

    console.log('📊 Índices das colunas:', { campaignIdCol, businessCol, influenciadorCol, mesCol });

    // Estratégia de busca em múltiplas etapas
    let foundCampaign = null;
    let searchMethod = '';

    // 1. Busca por Campaign_ID (mais precisa)
    if (campaignId && campaignIdCol !== -1) {
      console.log('🎯 Tentativa 1: Busca por Campaign_ID');
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        if (row[campaignIdCol] === campaignId) {
          foundCampaign = {
            rowIndex: i + 1,
            data: row,
            method: 'campaign_id'
          };
          searchMethod = 'Campaign_ID exato';
          break;
        }
      }
    }

    // 2. Busca por Business + Mês + Influenciador (fallback)
    if (!foundCampaign && businessName && mes && influenciador) {
      console.log('🎯 Tentativa 2: Busca por Business + Mês + Influenciador');
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        
        const rowBusiness = row[businessCol] || '';
        const rowMes = row[mesCol] || '';
        const rowInfluenciador = row[influenciadorCol] || '';
        
        // Comparação flexível
        const businessMatch = rowBusiness.toLowerCase().trim() === businessName.toLowerCase().trim();
        const mesMatch = rowMes.toLowerCase().includes(mes.toLowerCase()) || mes.toLowerCase().includes(rowMes.toLowerCase());
        const influenciadorMatch = rowInfluenciador.toLowerCase().trim() === influenciador.toLowerCase().trim();
        
        if (businessMatch && mesMatch && influenciadorMatch) {
          foundCampaign = {
            rowIndex: i + 1,
            data: row,
            method: 'business_mes_influenciador'
          };
          searchMethod = 'Business + Mês + Influenciador';
          break;
        }
      }
    }

    // 3. Busca parcial por Business + Influenciador (último recurso)
    if (!foundCampaign && businessName && influenciador) {
      console.log('🎯 Tentativa 3: Busca por Business + Influenciador');
      
      for (let i = 1; i < values.length; i++) {
        const row = values[i];
        
        const rowBusiness = row[businessCol] || '';
        const rowInfluenciador = row[influenciadorCol] || '';
        
        const businessMatch = rowBusiness.toLowerCase().includes(businessName.toLowerCase()) || 
                             businessName.toLowerCase().includes(rowBusiness.toLowerCase());
        const influenciadorMatch = rowInfluenciador.toLowerCase().trim() === influenciador.toLowerCase().trim();
        
        if (businessMatch && influenciadorMatch) {
          foundCampaign = {
            rowIndex: i + 1,
            data: row,
            method: 'business_influenciador_partial'
          };
          searchMethod = 'Business + Influenciador (parcial)';
          break;
        }
      }
    }

    if (foundCampaign) {
      console.log('✅ Campanha encontrada:', {
        method: foundCampaign.method,
        rowIndex: foundCampaign.rowIndex,
        campaignId: foundCampaign.data[campaignIdCol],
        business: foundCampaign.data[businessCol],
        influenciador: foundCampaign.data[influenciadorCol]
      });

      return NextResponse.json({
        success: true,
        campaign: {
          rowIndex: foundCampaign.rowIndex,
          campaignId: foundCampaign.data[campaignIdCol],
          data: foundCampaign.data,
          headers,
          searchMethod,
          columnIndexes: {
            campaignId: campaignIdCol,
            business: businessCol,
            influenciador: influenciadorCol,
            mes: mesCol
          }
        }
      });
    } else {
      console.log('❌ Campanha não encontrada');
      
      return NextResponse.json({
        success: false,
        error: 'Campanha não encontrada',
        searchAttempts: [
          campaignId ? 'Campaign_ID' : 'Campaign_ID não fornecido',
          businessName && mes && influenciador ? 'Business + Mês + Influenciador' : 'Dados incompletos',
          businessName && influenciador ? 'Business + Influenciador' : 'Dados insuficientes'
        ],
        availableData: {
          totalRows: values.length - 1,
          headers: headers.slice(0, 10),
          sampleData: values.slice(1, 4).map(row => ({
            campaignId: row[campaignIdCol],
            business: row[businessCol],
            influenciador: row[influenciadorCol],
            mes: row[mesCol]
          }))
        }
      });
    }

  } catch (error) {
    console.error('❌ Erro ao buscar campanha:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
