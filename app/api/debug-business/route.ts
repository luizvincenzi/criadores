import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

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
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`,
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, businessName, newStatus } = body;

    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SPREADSHEET_ID não configurado'
      });
    }

    switch (action) {
      case 'check_business_structure':
        try {
          // Busca todos os dados da aba Business
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Business!A:Z', // Busca todas as colunas para ver a estrutura
          });

          const rows = response.data.values || [];
          
          if (rows.length === 0) {
            return NextResponse.json({
              success: true,
              totalRows: 0,
              headers: [],
              businesses: [],
              message: 'Aba Business está vazia'
            });
          }

          const headers = rows[0] || [];
          const businesses = [];

          // Processa cada linha de business (pula o cabeçalho)
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row[0]) { // Se tem nome na coluna A
              businesses.push({
                name: row[0],
                status: row[1] || 'Sem status',
                row: i + 1, // +1 porque é 1-indexed
                data: row
              });
            }
          }

          return NextResponse.json({
            success: true,
            totalRows: rows.length,
            headers,
            businesses,
            rawData: rows.slice(0, 5) // Primeiras 5 linhas para debug
          });

        } catch (error: any) {
          return NextResponse.json({
            success: false,
            error: `Erro ao verificar aba Business: ${error.message}`
          });
        }

      case 'test_update_business':
        try {
          console.log(`🔍 Procurando business: "${businessName}"`);
          
          // Busca todos os dados da aba Business
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Business!A:C',
          });

          const rows = response.data.values || [];
          console.log(`📊 Total de linhas na aba Business: ${rows.length}`);
          
          if (rows.length === 0) {
            return NextResponse.json({
              success: false,
              error: 'Aba Business está vazia',
              found: false
            });
          }

          // Log dos primeiros dados para debug
          console.log('📋 Primeiras linhas da aba Business:');
          rows.slice(0, 5).forEach((row, index) => {
            console.log(`  Linha ${index + 1}: [${row.join(', ')}]`);
          });

          // Encontra a linha do business pelo nome (coluna A)
          let targetRowIndex = -1;
          let exactMatch = false;
          
          for (let i = 1; i < rows.length; i++) { // Pula o cabeçalho (linha 0)
            const cellValue = rows[i][0];
            if (cellValue) {
              const cellValueTrimmed = cellValue.toString().trim();
              const searchValueTrimmed = businessName.trim();
              
              console.log(`  Comparando: "${cellValueTrimmed}" === "${searchValueTrimmed}"`);
              
              if (cellValueTrimmed === searchValueTrimmed) {
                targetRowIndex = i;
                exactMatch = true;
                console.log(`✅ Match exato encontrado na linha ${i + 1}`);
                break;
              }
            }
          }

          if (targetRowIndex === -1) {
            // Tenta busca parcial
            for (let i = 1; i < rows.length; i++) {
              const cellValue = rows[i][0];
              if (cellValue && cellValue.toString().toLowerCase().includes(businessName.toLowerCase())) {
                targetRowIndex = i;
                console.log(`⚠️ Match parcial encontrado na linha ${i + 1}`);
                break;
              }
            }
          }

          if (targetRowIndex === -1) {
            return NextResponse.json({
              success: false,
              error: `Business "${businessName}" não encontrado na aba Business`,
              found: false,
              availableBusinesses: rows.slice(1).map((row, index) => ({
                line: index + 2,
                name: row[0] || 'Vazio',
                status: row[1] || 'Sem status'
              }))
            });
          }

          // Atualiza o status na coluna B
          const updateRange = `Business!B${targetRowIndex + 1}`;
          console.log(`🔄 Atualizando range: ${updateRange} com valor: "${newStatus}"`);
          
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: updateRange,
            valueInputOption: 'RAW',
            requestBody: {
              values: [[newStatus]]
            }
          });

          console.log(`✅ Atualização concluída!`);

          return NextResponse.json({
            success: true,
            found: true,
            rowIndex: targetRowIndex + 1,
            updated: true,
            exactMatch,
            details: `Business "${businessName}" atualizado para "${newStatus}" na linha ${targetRowIndex + 1}`
          });

        } catch (error: any) {
          console.error('❌ Erro na atualização:', error);
          return NextResponse.json({
            success: false,
            error: `Erro ao atualizar business: ${error.message}`,
            found: false
          });
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação não reconhecida'
        });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Erro geral: ${error.message}`
    });
  }
}
