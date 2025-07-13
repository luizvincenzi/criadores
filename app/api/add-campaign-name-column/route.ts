import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Iniciando adição da coluna Nome Campanha na aba campanhas...');

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
    console.log('📊 Verificando estrutura atual da aba campanhas...');
    
    const currentData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!A1:AZ1'
    });

    const currentHeaders = currentData.data.values?.[0] || [];
    console.log('📋 Headers atuais:', currentHeaders.slice(0, 10)); // Mostrar apenas os primeiros 10

    // 2. Verificar se Nome Campanha já existe
    const nomeCampanhaIndex = currentHeaders.findIndex(header => 
      header.toLowerCase().includes('nome') && header.toLowerCase().includes('campanha')
    );

    if (nomeCampanhaIndex !== -1) {
      console.log('✅ Coluna Nome Campanha já existe na posição:', nomeCampanhaIndex);
      return NextResponse.json({
        success: true,
        message: 'Coluna Nome Campanha já existe',
        columnIndex: nomeCampanhaIndex,
        headers: currentHeaders.slice(0, 10)
      });
    }

    // 3. Inserir "Nome Campanha" após "Campaign_ID" (coluna A)
    // Estrutura proposta: Campaign_ID, Nome Campanha, Business, Influenciador, ...
    
    // Primeiro, vamos inserir uma nova coluna B
    console.log('🔄 Inserindo nova coluna para Nome Campanha...');
    
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          insertDimension: {
            range: {
              sheetId: 0, // Assumindo que campanhas é a primeira aba
              dimension: 'COLUMNS',
              startIndex: 1, // Inserir após coluna A (Campaign_ID)
              endIndex: 2
            },
            inheritFromBefore: false
          }
        }]
      }
    });

    // 4. Atualizar header da nova coluna B
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!B1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Nome Campanha']]
      }
    });

    // 5. Preencher a coluna Nome Campanha com base nos dados existentes
    console.log('📊 Preenchendo coluna Nome Campanha com dados existentes...');
    
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!A2:C1000'
    });

    const rows = existingData.data.values || [];
    console.log(`📊 Encontradas ${rows.length} linhas de dados`);

    if (rows.length > 0) {
      const updatedRows = rows.map(row => {
        const campaignId = row[0] || '';
        const business = row[2] || ''; // Business agora está na coluna C
        
        // Extrair nome da campanha do Campaign_ID ou usar Business como fallback
        let nomeCampanha = '';
        
        if (campaignId.includes('_')) {
          // Extrair do Campaign_ID: camp_timestamp_index_nomecampanha_mes_criador
          const parts = campaignId.split('_');
          if (parts.length >= 4) {
            nomeCampanha = parts[3]; // Nome da campanha
            // Capitalizar primeira letra
            nomeCampanha = nomeCampanha.charAt(0).toUpperCase() + nomeCampanha.slice(1);
          }
        }
        
        // Se não conseguiu extrair, usar Business como fallback
        if (!nomeCampanha && business) {
          nomeCampanha = business;
        }
        
        return [nomeCampanha];
      });

      // Atualizar apenas a coluna B (Nome Campanha)
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `campanhas!B2:B${rows.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: updatedRows
        }
      });

      console.log('✅ Coluna Nome Campanha preenchida com sucesso');
    }

    // 6. Verificar resultado final
    const finalHeaders = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!A1:F1'
    });

    console.log('✅ Coluna Nome Campanha adicionada com sucesso na aba campanhas');

    return NextResponse.json({
      success: true,
      message: 'Coluna Nome Campanha adicionada com sucesso',
      newHeaders: finalHeaders.data.values?.[0] || [],
      updatedRows: rows.length,
      columnIndex: 1
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar coluna Nome Campanha:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
