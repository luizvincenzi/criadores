import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Iniciando adição da coluna Campaign_ID na aba detailed_logs...');

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

    // 1. Verificar estrutura atual da aba detailed_logs
    console.log('📊 Verificando estrutura atual da aba detailed_logs...');
    
    const currentData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'detailed_logs!A1:Z1'
    });

    const currentHeaders = currentData.data.values?.[0] || [];
    console.log('📋 Headers atuais:', currentHeaders);

    // 2. Verificar se Campaign_ID já existe
    const campaignIdIndex = currentHeaders.findIndex(header => 
      header.toLowerCase().includes('campaign') && header.toLowerCase().includes('id')
    );

    if (campaignIdIndex !== -1) {
      console.log('✅ Coluna Campaign_ID já existe na posição:', campaignIdIndex);
      return NextResponse.json({
        success: true,
        message: 'Coluna Campaign_ID já existe',
        columnIndex: campaignIdIndex,
        headers: currentHeaders
      });
    }

    // 3. Adicionar Campaign_ID após Creator_Context (coluna K)
    const newHeaders = [
      'ID',
      'Timestamp', 
      'Action',
      'Entity_Type',
      'Entity_ID',
      'Entity_Name',
      'User_ID',
      'User_Name',
      'Business_Context',
      'Campaign_Context',
      'Creator_Context',
      'Campaign_ID', // Nova coluna aqui
      'Field_Changed',
      'Old_Value',
      'New_Value',
      'Change_Reason',
      'Validation_Status',
      'Session_ID',
      'IP_Address',
      'User_Agent',
      'Details'
    ];

    console.log('🔄 Atualizando headers com Campaign_ID...');

    // 4. Atualizar headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: 'detailed_logs!A1:U1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [newHeaders]
      }
    });

    // 5. Verificar se há dados existentes para ajustar
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'detailed_logs!A2:T1000'
    });

    const rows = existingData.data.values || [];
    console.log(`📊 Encontradas ${rows.length} linhas de dados existentes`);

    if (rows.length > 0) {
      console.log('🔄 Ajustando dados existentes para incluir Campaign_ID...');
      
      // Ajustar cada linha para incluir Campaign_ID vazio na posição correta
      const adjustedRows = rows.map(row => {
        // Garantir que a linha tenha pelo menos 11 colunas antes de inserir Campaign_ID
        while (row.length < 11) {
          row.push('');
        }
        
        // Inserir Campaign_ID vazio na posição 11 (após Creator_Context)
        row.splice(11, 0, '');
        
        // Garantir que a linha tenha exatamente 21 colunas
        while (row.length < 21) {
          row.push('');
        }
        
        return row;
      });

      // Atualizar dados ajustados
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `detailed_logs!A2:U${rows.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: adjustedRows
        }
      });

      console.log('✅ Dados existentes ajustados com sucesso');
    }

    console.log('✅ Coluna Campaign_ID adicionada com sucesso na aba detailed_logs');

    return NextResponse.json({
      success: true,
      message: 'Coluna Campaign_ID adicionada com sucesso',
      newHeaders,
      adjustedRows: rows.length,
      columnIndex: 11
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar coluna Campaign_ID:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
