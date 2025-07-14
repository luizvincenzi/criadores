import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando migração dos logs para usar IDs únicos...');

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

    // 1. Carregar dados de mapeamento
    console.log('📊 Carregando dados de mapeamento...');
    
    const [businessResponse, criadoresResponse, auditResponse] = await Promise.all([
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
        range: 'Audit_Log!A:M',
      })
    ]);

    const businessData = businessResponse.data.values || [];
    const criadoresData = criadoresResponse.data.values || [];
    const auditData = auditResponse.data.values || [];

    // 2. Criar mapeamentos nome → ID
    const businessMap = new Map();
    const criadoresMap = new Map();

    // Mapear Business
    for (let i = 1; i < businessData.length; i++) {
      const row = businessData[i];
      const nome = row[0]?.trim();
      const businessId = row[17]; // Coluna R
      if (nome && businessId) {
        businessMap.set(nome, businessId);
      }
    }

    // Mapear Criadores
    for (let i = 1; i < criadoresData.length; i++) {
      const row = criadoresData[i];
      const nome = row[0]?.trim();
      const criadorId = row[21]; // Coluna V
      if (nome && criadorId) {
        criadoresMap.set(nome, criadorId);
      }
    }

    console.log(`📋 Mapeamentos criados: ${businessMap.size} businesses, ${criadoresMap.size} criadores`);

    // 3. Processar logs do Audit_Log
    const auditUpdates = [];
    let auditConvertedCount = 0;

    for (let i = 1; i < auditData.length; i++) {
      const row = auditData[i];
      const entityType = row[3]; // Coluna D
      const entityName = row[5]; // Coluna F
      
      if (!entityName) continue;

      let newEntityId = null;
      let newEntityName = entityName;

      // Converter baseado no tipo de entidade
      if (entityType === 'business') {
        const businessId = businessMap.get(entityName);
        if (businessId) {
          newEntityId = businessId;
          auditUpdates.push({
            range: `Audit_Log!E${i + 1}`,
            values: [[businessId]]
          });
          auditConvertedCount++;
        }
      } else if (entityType === 'campaign') {
        // Para campanhas, extrair business e criador do entity_name
        // Formato esperado: "BusinessName-Mes-CreatorName" ou "BusinessName-Mes"
        const parts = entityName.split('-');
        if (parts.length >= 2) {
          const businessName = parts[0].trim();
          const mes = parts[1].trim();
          const creatorName = parts.length > 2 ? parts[2].trim() : '';

          const businessId = businessMap.get(businessName);
          const criadorId = creatorName ? criadoresMap.get(creatorName) : null;

          if (businessId) {
            // Criar novo entity_id para campanha
            const campaignId = criadorId 
              ? `camp_${businessId}_${mes.toLowerCase()}_${criadorId}`
              : `camp_${businessId}_${mes.toLowerCase()}`;
            
            auditUpdates.push({
              range: `Audit_Log!E${i + 1}`,
              values: [[campaignId]]
            });
            auditConvertedCount++;
          }
        }
      }
    }

    // 4. Aplicar atualizações no Audit_Log
    if (auditUpdates.length > 0) {
      console.log(`📝 Aplicando ${auditUpdates.length} atualizações no Audit_Log...`);
      
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: auditUpdates
        }
      });
    }

    // 5. Processar Detailed_Logs se existir
    let detailedConvertedCount = 0;
    try {
      const detailedResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Detailed_Logs!A:T',
      });

      const detailedData = detailedResponse.data.values || [];
      const detailedUpdates = [];

      for (let i = 1; i < detailedData.length; i++) {
        const row = detailedData[i];
        const entityType = row[3]; // Coluna D
        const entityName = row[5]; // Coluna F
        
        if (!entityName) continue;

        if (entityType === 'business') {
          const businessId = businessMap.get(entityName);
          if (businessId) {
            detailedUpdates.push({
              range: `Detailed_Logs!E${i + 1}`,
              values: [[businessId]]
            });
            detailedConvertedCount++;
          }
        }
      }

      if (detailedUpdates.length > 0) {
        console.log(`📝 Aplicando ${detailedUpdates.length} atualizações no Detailed_Logs...`);
        
        await sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: {
            valueInputOption: 'RAW',
            data: detailedUpdates
          }
        });
      }
    } catch (error) {
      console.log('ℹ️ Detailed_Logs não encontrado ou erro ao processar:', error);
    }

    // 6. Registrar migração no audit log
    const migrationLogData = [
      [
        `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        new Date().toISOString(),
        'logs_migration',
        'system',
        'migration_logs_to_ids',
        'Logs migrados para IDs únicos',
        '',
        '',
        '',
        '',
        'admin_001',
        'Sistema',
        `Migração de logs concluída: ${auditConvertedCount} audit_log + ${detailedConvertedCount} detailed_logs convertidos`
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Audit_Log!A:M',
      valueInputOption: 'RAW',
      requestBody: {
        values: migrationLogData
      }
    });

    console.log('✅ Migração de logs concluída com sucesso!');

    return NextResponse.json({
      success: true,
      message: `Migração de logs concluída: ${auditConvertedCount} audit_log + ${detailedConvertedCount} detailed_logs convertidos para IDs únicos`,
      details: {
        auditLogConverted: auditConvertedCount,
        detailedLogsConverted: detailedConvertedCount,
        businessMapped: businessMap.size,
        creatorsMapped: criadoresMap.size
      }
    });

  } catch (error) {
    console.error('❌ Erro na migração de logs:', error);
    return NextResponse.json({
      success: false,
      error: `Erro na migração de logs: ${error instanceof Error ? error.message : String(error)}`
    });
  }
}
