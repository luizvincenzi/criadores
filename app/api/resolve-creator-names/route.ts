import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { creatorIds } = await request.json();

    console.log('🔍 Resolvendo nomes para criador_ids:', creatorIds);

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

    // Buscar na aba Criadores
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Criadores!A:V',
    });

    const values = response.data.values || [];
    const resolvedNames = {};
    
    // Criar mapeamento criador_id → nome
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const nome = row[0]?.trim(); // Coluna A
      const criadorId = row[21]; // Coluna V
      
      if (nome && criadorId && creatorIds.includes(criadorId)) {
        resolvedNames[criadorId] = nome;
        console.log(`✅ Criador resolvido: ${criadorId} → "${nome}"`);
      }
    }

    console.log('📋 Nomes resolvidos:', resolvedNames);

    return NextResponse.json({
      success: true,
      resolvedNames: resolvedNames
    });

  } catch (error) {
    console.error('❌ Erro ao resolver nomes:', error);
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}
