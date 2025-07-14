import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { businessName } = await request.json();

    console.log('🔍 Buscando business_id para:', businessName);

    // Configurar Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    // Buscar na aba Business
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Business!A:R',
    });

    const values = response.data.values || [];
    
    // Procurar pelo nome do business
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const nome = row[0]?.trim(); // Coluna A
      const businessId = row[17]; // Coluna R
      
      if (nome === businessName && businessId) {
        console.log(`✅ Business encontrado: "${nome}" → ${businessId}`);
        return NextResponse.json({
          success: true,
          businessId: businessId,
          businessName: nome
        });
      }
    }

    console.error(`❌ Business "${businessName}" não encontrado`);
    return NextResponse.json({
      success: false,
      error: `Business "${businessName}" não encontrado na aba Business`
    });

  } catch (error) {
    console.error('❌ Erro ao buscar business_id:', error);
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}
