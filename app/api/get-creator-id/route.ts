import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient } from '@/app/actions/sheetsActions';

export async function POST(request: NextRequest) {
  try {
    const { creatorName } = await request.json();

    console.log('🔍 Buscando criador_id para:', creatorName);

    if (!creatorName) {
      return NextResponse.json({
        success: false,
        error: 'Nome do criador é obrigatório'
      });
    }

    const sheets = await createGoogleSheetsClient();
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
    
    // Procurar pelo nome do criador (coluna A) e retornar o criador_id (coluna V)
    const searchName = creatorName.trim().toLowerCase();
    console.log(`🔍 Procurando por: "${searchName}"`);

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const nome = row[0]?.trim(); // Coluna A
      const criadorId = row[21]; // Coluna V

      if (nome && criadorId) {
        const nomeNormalizado = nome.trim().toLowerCase();
        console.log(`🔍 Comparando: "${nomeNormalizado}" com "${searchName}"`);

        if (nomeNormalizado === searchName) {
          console.log(`✅ Criador encontrado: "${nome}" → ${criadorId}`);
          return NextResponse.json({
            success: true,
            criadorId: criadorId,
            creatorName: nome
          });
        }
      }
    }

    // Busca mais flexível - tentar busca parcial
    console.log('🔍 Tentando busca parcial...');
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const nome = row[0]?.trim(); // Coluna A
      const criadorId = row[21]; // Coluna V

      if (nome && criadorId) {
        const nomeNormalizado = nome.trim().toLowerCase();

        // Busca parcial - se o nome contém a busca ou vice-versa
        if (nomeNormalizado.includes(searchName) || searchName.includes(nomeNormalizado)) {
          console.log(`✅ Criador encontrado (busca parcial): "${nome}" → ${criadorId}`);
          return NextResponse.json({
            success: true,
            criadorId: criadorId,
            creatorName: nome
          });
        }
      }
    }

    console.log(`❌ Criador "${creatorName}" não encontrado na aba Criadores`);
    console.log('📋 Criadores disponíveis:', values.slice(1, 6).map(row => row[0]?.trim()).filter(Boolean));

    return NextResponse.json({
      success: false,
      error: `Criador "${creatorName}" não encontrado na aba Criadores`
    });

  } catch (error) {
    console.error('❌ Erro ao buscar criador_id:', error);
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}
