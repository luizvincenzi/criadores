import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Configuração do Google Sheets
function getGoogleSheetsAuth() {
  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
  };

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
}

async function inspectCampaignsStructure() {
  console.log('🔍 INSPECIONANDO ESTRUTURA DA ABA CAMPANHAS\n');
  
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.error('❌ GOOGLE_SPREADSHEET_ID não configurado');
      return;
    }

    // Buscar dados da aba campanhas
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'campanhas!A1:H10', // Primeiras 10 linhas, colunas A-H
    });

    const values = response.data.values || [];
    
    if (values.length === 0) {
      console.log('❌ Aba campanhas está vazia');
      return;
    }

    // Mostrar cabeçalho
    console.log('📋 CABEÇALHO (Linha 1):');
    const headers = values[0];
    headers.forEach((header, index) => {
      const column = String.fromCharCode(65 + index); // A, B, C, etc.
      console.log(`   ${column}: "${header}"`);
    });

    console.log('\n📊 DADOS (Primeiras 5 linhas):');
    
    // Mostrar primeiras 5 linhas de dados
    for (let i = 1; i < Math.min(6, values.length); i++) {
      const row = values[i];
      console.log(`\n   Linha ${i + 1}:`);
      
      row.forEach((cell, index) => {
        const column = String.fromCharCode(65 + index);
        const header = headers[index] || `Col${index}`;
        console.log(`     ${column} (${header}): "${cell}"`);
      });
    }

    // Análise específica das colunas importantes
    console.log('\n🔍 ANÁLISE DAS COLUNAS IMPORTANTES:');
    
    const columnAnalysis = {
      A: { name: headers[0], values: [] as string[] },
      B: { name: headers[1], values: [] as string[] },
      C: { name: headers[2], values: [] as string[] },
      D: { name: headers[3], values: [] as string[] }
    };

    // Coletar valores das primeiras 4 colunas
    for (let i = 1; i < Math.min(6, values.length); i++) {
      const row = values[i];
      columnAnalysis.A.values.push(row[0] || '');
      columnAnalysis.B.values.push(row[1] || '');
      columnAnalysis.C.values.push(row[2] || '');
      columnAnalysis.D.values.push(row[3] || '');
    }

    // Mostrar análise
    Object.entries(columnAnalysis).forEach(([col, data]) => {
      console.log(`\n   Coluna ${col} (${data.name}):`);
      data.values.forEach((value, i) => {
        console.log(`     Linha ${i + 2}: "${value}"`);
      });
    });

    // Detectar padrões
    console.log('\n🧠 DETECÇÃO DE PADRÕES:');
    
    // Verificar se coluna A tem IDs
    const hasIds = columnAnalysis.A.values.some(v => v.includes('_') && v.length > 10);
    console.log(`   Coluna A tem IDs: ${hasIds ? '✅' : '❌'}`);
    
    // Verificar se coluna B tem business_ids
    const hasBusinessIds = columnAnalysis.B.values.some(v => v.startsWith('bus_') || v.startsWith('crt_'));
    console.log(`   Coluna B tem business_ids: ${hasBusinessIds ? '✅' : '❌'}`);
    
    // Verificar se coluna C tem criador_ids
    const hasCreatorIds = columnAnalysis.C.values.some(v => v.startsWith('crt_'));
    console.log(`   Coluna C tem criador_ids: ${hasCreatorIds ? '✅' : '❌'}`);
    
    // Verificar se há nomes em vez de IDs
    const hasNames = columnAnalysis.B.values.some(v => v.includes(' ') && !v.includes('_'));
    console.log(`   Há nomes em vez de IDs: ${hasNames ? '✅' : '❌'}`);

    console.log('\n✅ Inspeção concluída!');
    
  } catch (error) {
    console.error('❌ Erro na inspeção:', error);
  }
}

inspectCampaignsStructure();
