import { NextRequest, NextResponse } from 'next/server';
import { 
  generateBusinessId, 
  generateCreatorId, 
  createGoogleSheetsClient 
} from '@/app/actions/sheetsActions';

/**
 * API para migração: Adiciona IDs únicos aos registros existentes
 * POST /api/migrate-add-ids
 */
export async function POST(request: NextRequest) {
  try {
    const { type, dryRun = true } = await request.json();
    
    if (!type || !['business', 'creators', 'both'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Tipo inválido. Use: business, creators, ou both'
      });
    }

    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SPREADSHEET_ID não configurado'
      });
    }

    const results = {
      business: { processed: 0, updated: 0, errors: [] as string[] },
      creators: { processed: 0, updated: 0, errors: [] as string[] }
    };

    // ==========================================
    // MIGRAÇÃO DE BUSINESS IDs
    // ==========================================
    if (type === 'business' || type === 'both') {
      console.log('🔄 Iniciando migração de Business IDs...');
      
      try {
        // Buscar dados atuais
        const businessResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Business!A:R'
        });

        const businessValues = businessResponse.data.values || [];
        
        if (businessValues.length > 1) {
          const updates: any[] = [];
          
          for (let i = 1; i < businessValues.length; i++) {
            const row = businessValues[i];
            const businessName = row[0]?.toString().trim();
            const existingId = row[17]; // Coluna R (business_id)
            
            results.business.processed++;
            
            if (businessName && !existingId) {
              const newId = await generateBusinessId(businessName);

              if (!dryRun) {
                updates.push({
                  range: `Business!R${i + 1}`,
                  values: [[newId]]
                });
              }
              
              results.business.updated++;
              console.log(`✅ Business "${businessName}" -> ID: ${newId}`);
            } else if (!businessName) {
              results.business.errors.push(`Linha ${i + 1}: Nome vazio`);
            } else {
              console.log(`ℹ️ Business "${businessName}" já tem ID: ${existingId}`);
            }
          }
          
          // Aplicar atualizações se não for dry run
          if (!dryRun && updates.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
              spreadsheetId,
              requestBody: {
                valueInputOption: 'RAW',
                data: updates
              }
            });
            console.log(`✅ ${updates.length} Business IDs atualizados na planilha`);
          }
        }
      } catch (error) {
        console.error('Erro na migração de Business:', error);
        results.business.errors.push(`Erro geral: ${error}`);
      }
    }

    // ==========================================
    // MIGRAÇÃO DE CREATOR IDs
    // ==========================================
    if (type === 'creators' || type === 'both') {
      console.log('🔄 Iniciando migração de Creator IDs...');
      
      try {
        // Buscar dados atuais
        const creatorsResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Criadores!A:V'
        });

        const creatorsValues = creatorsResponse.data.values || [];
        
        if (creatorsValues.length > 1) {
          const updates: any[] = [];
          
          for (let i = 1; i < creatorsValues.length; i++) {
            const row = creatorsValues[i];
            const creatorName = row[0]?.toString().trim();
            const existingId = row[21]; // Coluna V (criador_id)
            
            results.creators.processed++;
            
            if (creatorName && !existingId) {
              const newId = await generateCreatorId(creatorName);

              if (!dryRun) {
                updates.push({
                  range: `Criadores!V${i + 1}`,
                  values: [[newId]]
                });
              }
              
              results.creators.updated++;
              console.log(`✅ Creator "${creatorName}" -> ID: ${newId}`);
            } else if (!creatorName) {
              results.creators.errors.push(`Linha ${i + 1}: Nome vazio`);
            } else {
              console.log(`ℹ️ Creator "${creatorName}" já tem ID: ${existingId}`);
            }
          }
          
          // Aplicar atualizações se não for dry run
          if (!dryRun && updates.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
              spreadsheetId,
              requestBody: {
                valueInputOption: 'RAW',
                data: updates
              }
            });
            console.log(`✅ ${updates.length} Creator IDs atualizados na planilha`);
          }
        }
      } catch (error) {
        console.error('Erro na migração de Creators:', error);
        results.creators.errors.push(`Erro geral: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      message: dryRun ? 
        'Simulação concluída. Use dryRun: false para aplicar as alterações.' : 
        'Migração concluída com sucesso!',
      results
    });

  } catch (error) {
    console.error('Erro na migração de IDs:', error);
    return NextResponse.json({
      success: false,
      error: `Erro na migração: ${error}`
    });
  }
}
