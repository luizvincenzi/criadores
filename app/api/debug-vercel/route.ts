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
    const { action, data } = body;

    switch (action) {
      case 'test_env':
        try {
          const envVars = {
            GOOGLE_PROJECT_ID: !!process.env.GOOGLE_PROJECT_ID,
            GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
            GOOGLE_SPREADSHEET_ID: !!process.env.GOOGLE_SPREADSHEET_ID,
            GOOGLE_PRIVATE_KEY_ID: !!process.env.GOOGLE_PRIVATE_KEY_ID,
            GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
            GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
          };

          return NextResponse.json({
            success: true,
            env: envVars,
            message: 'Variáveis de ambiente verificadas'
          });
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            error: `Erro ao verificar env vars: ${error.message}`
          });
        }

      case 'test_sheets':
        try {
          const auth = getGoogleSheetsAuth();
          const sheets = google.sheets({ version: 'v4', auth });
          const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

          if (!spreadsheetId) {
            return NextResponse.json({
              success: false,
              error: 'GOOGLE_SPREADSHEET_ID não configurado'
            });
          }

          // Tenta acessar a planilha
          const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId
          });

          const sheetNames = spreadsheet.data.sheets?.map(
            sheet => sheet.properties?.title
          ).filter(Boolean) || [];

          return NextResponse.json({
            success: true,
            title: spreadsheet.data.properties?.title,
            sheets: sheetNames,
            message: 'Conexão com Google Sheets OK'
          });
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            error: `Erro na conexão: ${error.message}`
          });
        }

      case 'test_add_business':
        try {
          const auth = getGoogleSheetsAuth();
          const sheets = google.sheets({ version: 'v4', auth });
          const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

          if (!spreadsheetId) {
            return NextResponse.json({
              success: false,
              error: 'GOOGLE_SPREADSHEET_ID não configurado'
            });
          }

          // Preparar dados de teste
          const businessData = [
            data.businessName,           // A = Nome
            data.category,               // B = Categoria
            'Não definido',              // C = Plano atual
            '',                          // D = Comercial
            data.nomeResponsavel,        // E = Nome Responsável
            '',                          // F = Cidade
            data.whatsappResponsavel,    // G = WhatsApp Responsável
            '',                          // H = Prospecção
            '',                          // I = Responsável
            '',                          // J = Instagram
            '',                          // K = Grupo WhatsApp criado
            '',                          // L = Contrato assinado e enviado
            '',                          // M = Data assinatura do contrato
            '',                          // N = Contrato válido até
            '',                          // O = Related files
            'Teste criado via debug Vercel' // P = Notes
          ];

          const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Business!A:P',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [businessData]
            }
          });

          return NextResponse.json({
            success: true,
            message: 'Negócio adicionado com sucesso!',
            updatedRange: response.data.updates?.updatedRange
          });
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            error: `Erro ao adicionar negócio: ${error.message}`
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
