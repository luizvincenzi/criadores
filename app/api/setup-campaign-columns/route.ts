import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Configurando colunas Campaign_ID e Nome Campanha...');

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

    // 1. Verificar estrutura atual da aba campanhas
    console.log('📊 Verificando estrutura da aba campanhas...');
    
    const currentData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!A1:F1'
    });

    const currentHeaders = currentData.data.values?.[0] || [];
    console.log('📋 Headers atuais:', currentHeaders);

    // 2. Verificar se já tem Campaign_ID na coluna A
    const hasIdColumn = currentHeaders[0] && currentHeaders[0].toLowerCase().includes('id');
    
    if (!hasIdColumn) {
      console.log('🔄 Adicionando coluna Campaign_ID na posição A...');
      
      // Inserir nova coluna A para Campaign_ID
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            insertDimension: {
              range: {
                sheetId: 0, // Assumindo que campanhas é a primeira aba
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 1
              },
              inheritFromBefore: false
            }
          }]
        }
      });

      // Atualizar header da nova coluna A
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'campanhas!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Campaign_ID']]
        }
      });

      console.log('✅ Coluna Campaign_ID adicionada na posição A');
    }

    // 3. Verificar se já tem Nome Campanha na coluna B
    const updatedHeaders = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!A1:F1'
    });

    const headers = updatedHeaders.data.values?.[0] || [];
    const hasNomeCampanha = headers[1] && headers[1].toLowerCase().includes('nome') && headers[1].toLowerCase().includes('campanha');

    if (!hasNomeCampanha) {
      console.log('🔄 Adicionando coluna Nome Campanha na posição B...');
      
      // Inserir nova coluna B para Nome Campanha
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [{
            insertDimension: {
              range: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 1,
                endIndex: 2
              },
              inheritFromBefore: false
            }
          }]
        }
      });

      // Atualizar header da nova coluna B
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: 'campanhas!B1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Nome Campanha']]
        }
      });

      console.log('✅ Coluna Nome Campanha adicionada na posição B');
    }

    // 4. Preencher Campaign_IDs únicos para linhas existentes
    console.log('🔄 Preenchendo Campaign_IDs únicos...');
    
    const allData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!A:H'
    });

    const rows = allData.data.values || [];
    if (rows.length > 1) {
      const updates = [];
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const campaignId = row[0] || '';
        const nomeCampanha = row[1] || '';
        const business = row[2] || ''; // Agora na coluna C
        const influenciador = row[3] || ''; // Agora na coluna D
        
        // Gerar Campaign_ID se não existir
        if (!campaignId) {
          const timestamp = Date.now();
          const businessSlug = business.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8);
          const influenciadorSlug = influenciador.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
          const newCampaignId = `camp_${timestamp}_${i}_${businessSlug}_jul_${influenciadorSlug}`;
          
          updates.push({
            range: `campanhas!A${i + 1}`,
            values: [[newCampaignId]]
          });
        }
        
        // Gerar Nome Campanha se não existir
        if (!nomeCampanha && business) {
          updates.push({
            range: `campanhas!B${i + 1}`,
            values: [[business]]
          });
        }
      }

      if (updates.length > 0) {
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            valueInputOption: 'RAW',
            data: updates
          }
        });

        console.log(`✅ ${updates.length} Campaign_IDs e Nomes de Campanha preenchidos`);
      }
    }

    // 5. Verificar estrutura final
    const finalHeaders = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!A1:H1'
    });

    console.log('✅ Configuração concluída!');

    return NextResponse.json({
      success: true,
      message: 'Colunas Campaign_ID e Nome Campanha configuradas com sucesso',
      finalHeaders: finalHeaders.data.values?.[0] || [],
      updatesApplied: rows.length - 1
    });

  } catch (error) {
    console.error('❌ Erro ao configurar colunas:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
