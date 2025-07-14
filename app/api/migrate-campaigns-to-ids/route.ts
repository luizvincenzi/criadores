import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando migração da aba Campanhas para usar IDs únicos...');

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

    // 1. Carregar dados das abas Business e Criadores para mapeamento
    console.log('📊 Carregando dados de Business e Criadores...');
    
    const [businessResponse, criadoresResponse, campanhasResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Business!A:R',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Criadores!A:V',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'campanhas!A:AF',
      })
    ]);

    const businessData = businessResponse.data.values || [];
    const criadoresData = criadoresResponse.data.values || [];
    const campanhasData = campanhasResponse.data.values || [];

    // 2. Criar mapeamentos nome → ID
    console.log('🗺️ Criando mapeamentos nome → ID...');
    
    const businessMap = new Map();
    const criadoresMap = new Map();

    // Mapear Business (assumindo coluna A = Nome, coluna R = business_id)
    for (let i = 1; i < businessData.length; i++) {
      const row = businessData[i];
      const nome = row[0]?.trim(); // Coluna A
      const businessId = row[17]; // Coluna R
      if (nome && businessId) {
        businessMap.set(nome, businessId);
        console.log(`📋 Business: "${nome}" → ${businessId}`);
      }
    }

    // Mapear Criadores (assumindo coluna A = Nome, coluna V = criador_id)
    for (let i = 1; i < criadoresData.length; i++) {
      const row = criadoresData[i];
      const nome = row[0]?.trim(); // Coluna A
      const criadorId = row[21]; // Coluna V
      if (nome && criadorId) {
        criadoresMap.set(nome, criadorId);
        console.log(`👤 Criador: "${nome}" → ${criadorId}`);
      }
    }

    // 3. Processar campanhas e converter nomes para IDs
    console.log('🔄 Convertendo campanhas para usar IDs...');
    
    const updates = [];
    let convertedCount = 0;
    let errorCount = 0;

    for (let i = 1; i < campanhasData.length; i++) {
      const row = campanhasData[i];
      const businessName = row[1]?.trim(); // Coluna B (Nome Campanha)
      const creatorName = row[2]?.trim(); // Coluna C (Influenciador)
      
      if (!businessName || !creatorName) continue;

      const businessId = businessMap.get(businessName);
      const criadorId = criadoresMap.get(creatorName);

      if (businessId && criadorId) {
        // Atualizar com IDs
        updates.push({
          range: `campanhas!B${i + 1}:C${i + 1}`,
          values: [[businessId, criadorId]]
        });
        
        console.log(`✅ Linha ${i + 1}: "${businessName}" → ${businessId}, "${creatorName}" → ${criadorId}`);
        convertedCount++;
      } else {
        console.error(`❌ Linha ${i + 1}: Business "${businessName}" ou Criador "${creatorName}" não encontrado`);
        errorCount++;
      }
    }

    // 4. Aplicar atualizações em lote
    if (updates.length > 0) {
      console.log(`📝 Aplicando ${updates.length} atualizações...`);
      
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      });
    }

    // 5. Registrar no audit log
    const auditLogData = [
      [
        `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        new Date().toISOString(),
        'campaign_migration',
        'system',
        'migration_campaigns_to_ids',
        'Campanhas migradas para IDs únicos',
        '',
        '',
        '',
        '',
        'admin_001',
        'Sistema',
        `Migração concluída: ${convertedCount} campanhas convertidas, ${errorCount} erros`
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Audit_Log!A:M',
      valueInputOption: 'RAW',
      requestBody: {
        values: auditLogData
      }
    });

    console.log('✅ Migração concluída com sucesso!');

    return NextResponse.json({
      success: true,
      message: `Migração concluída: ${convertedCount} campanhas convertidas para IDs únicos`,
      details: {
        converted: convertedCount,
        errors: errorCount,
        businessMapped: businessMap.size,
        creatorsMapped: criadoresMap.size
      }
    });

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    return NextResponse.json({
      success: false,
      error: `Erro na migração: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}
