import { NextRequest, NextResponse } from 'next/server';
import { 
  createGoogleSheetsClient,
  findBusinessHybrid,
  findCreatorHybrid 
} from '@/app/actions/sheetsActions';

/**
 * API para limpeza e otimização de dados
 * Remove entradas sem IDs e consolida dados baseado em IDs únicos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, dryRun = true } = body;

    console.log(`🧹 Iniciando limpeza de dados: ${action}, DryRun: ${dryRun}`);

    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SPREADSHEET_ID não configurado'
      });
    }

    let results: any = {
      action,
      dryRun,
      timestamp: new Date().toISOString(),
      summary: {},
      details: {},
      recommendations: []
    };

    switch (action) {
      case 'cleanup_campaigns':
        results = await cleanupCampaigns(sheets, spreadsheetId, dryRun);
        break;
      
      case 'validate_ids':
        results = await validateAllIds(sheets, spreadsheetId);
        break;
      
      case 'remove_empty_entries':
        results = await removeEmptyEntries(sheets, spreadsheetId, dryRun);
        break;
      
      case 'consolidate_duplicates':
        results = await consolidateDuplicates(sheets, spreadsheetId, dryRun);
        break;
      
      case 'full_cleanup':
        results = await fullCleanup(sheets, spreadsheetId, dryRun);
        break;
      
      default:
        return NextResponse.json({
          success: false,
          error: `Ação não reconhecida: ${action}`
        });
    }

    return NextResponse.json({
      success: true,
      ...results
    });

  } catch (error) {
    console.error('Erro na limpeza de dados:', error);
    return NextResponse.json({
      success: false,
      error: `Erro na limpeza: ${error}`
    });
  }
}

/**
 * Limpa campanhas sem IDs ou dados essenciais
 */
async function cleanupCampaigns(sheets: any, spreadsheetId: string, dryRun: boolean) {
  console.log('🧹 Limpando campanhas...');
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Campanhas!A:F'
  });

  const values = response.data.values || [];
  const toDelete: number[] = [];
  const toUpdate: any[] = [];
  const issues: string[] = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const campaignId = row[0];
    const business = row[1];
    const influenciador = row[2];
    const mes = row[5];

    // Critérios para remoção
    const shouldDelete = (
      !campaignId || campaignId.trim() === '' ||
      !business || business.trim() === '' ||
      !influenciador || influenciador.trim() === ''
    );

    if (shouldDelete) {
      toDelete.push(i + 1); // +1 porque as linhas são 1-based
      issues.push(`Linha ${i + 1}: Campaign_ID="${campaignId}", Business="${business}", Influenciador="${influenciador}"`);
    }
    
    // Verificar se business e creator existem no sistema
    if (!shouldDelete) {
      const businessExists = await findBusinessHybrid(business);
      const creatorExists = await findCreatorHybrid(influenciador);
      
      if (!businessExists) {
        issues.push(`Linha ${i + 1}: Business "${business}" não encontrado no sistema`);
      }
      
      if (!creatorExists) {
        issues.push(`Linha ${i + 1}: Creator "${influenciador}" não encontrado no sistema`);
      }
    }
  }

  const result = {
    action: 'cleanup_campaigns',
    dryRun,
    summary: {
      totalCampaigns: values.length - 1,
      toDelete: toDelete.length,
      issues: issues.length
    },
    details: {
      linesToDelete: toDelete,
      issues: issues.slice(0, 10), // Primeiros 10 issues
      totalIssues: issues.length
    },
    recommendations: []
  };

  if (toDelete.length > 0) {
    result.recommendations.push(`Remover ${toDelete.length} campanhas sem dados essenciais`);
  }

  if (!dryRun && toDelete.length > 0) {
    // Implementar remoção real aqui
    console.log(`🗑️ Removendo ${toDelete.length} linhas de campanhas`);
    // TODO: Implementar remoção batch
  }

  return result;
}

/**
 * Valida todos os IDs únicos no sistema
 */
async function validateAllIds(sheets: any, spreadsheetId: string) {
  console.log('🔍 Validando IDs únicos...');
  
  const [businessResponse, creatorResponse, campaignResponse] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId, range: 'Business!A:R' }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: 'Criadores!A:V' }),
    sheets.spreadsheets.values.get({ spreadsheetId, range: 'Campanhas!A:F' })
  ]);

  const businessValues = businessResponse.data.values || [];
  const creatorValues = creatorResponse.data.values || [];
  const campaignValues = campaignResponse.data.values || [];

  const validation = {
    businesses: {
      total: businessValues.length - 1,
      withIds: 0,
      withoutIds: 0,
      duplicateIds: [] as string[]
    },
    creators: {
      total: creatorValues.length - 1,
      withIds: 0,
      withoutIds: 0,
      duplicateIds: [] as string[]
    },
    campaigns: {
      total: campaignValues.length - 1,
      withIds: 0,
      withoutIds: 0,
      duplicateIds: [] as string[]
    }
  };

  // Validar Business IDs
  const businessIds = new Set<string>();
  for (let i = 1; i < businessValues.length; i++) {
    const businessId = businessValues[i][17]; // Coluna R
    if (businessId && businessId.trim() !== '') {
      validation.businesses.withIds++;
      if (businessIds.has(businessId)) {
        validation.businesses.duplicateIds.push(businessId);
      }
      businessIds.add(businessId);
    } else {
      validation.businesses.withoutIds++;
    }
  }

  // Validar Creator IDs
  const creatorIds = new Set<string>();
  for (let i = 1; i < creatorValues.length; i++) {
    const creatorId = creatorValues[i][21]; // Coluna V
    if (creatorId && creatorId.trim() !== '') {
      validation.creators.withIds++;
      if (creatorIds.has(creatorId)) {
        validation.creators.duplicateIds.push(creatorId);
      }
      creatorIds.add(creatorId);
    } else {
      validation.creators.withoutIds++;
    }
  }

  // Validar Campaign IDs
  const campaignIds = new Set<string>();
  for (let i = 1; i < campaignValues.length; i++) {
    const campaignId = campaignValues[i][0]; // Coluna A
    if (campaignId && campaignId.trim() !== '') {
      validation.campaigns.withIds++;
      if (campaignIds.has(campaignId)) {
        validation.campaigns.duplicateIds.push(campaignId);
      }
      campaignIds.add(campaignId);
    } else {
      validation.campaigns.withoutIds++;
    }
  }

  return {
    action: 'validate_ids',
    validation,
    recommendations: [
      ...(validation.businesses.withoutIds > 0 ? [`Migrar ${validation.businesses.withoutIds} businesses sem ID`] : []),
      ...(validation.creators.withoutIds > 0 ? [`Migrar ${validation.creators.withoutIds} creators sem ID`] : []),
      ...(validation.campaigns.withoutIds > 0 ? [`Limpar ${validation.campaigns.withoutIds} campanhas sem ID`] : []),
      ...(validation.businesses.duplicateIds.length > 0 ? [`Corrigir ${validation.businesses.duplicateIds.length} business IDs duplicados`] : []),
      ...(validation.creators.duplicateIds.length > 0 ? [`Corrigir ${validation.creators.duplicateIds.length} creator IDs duplicados`] : []),
      ...(validation.campaigns.duplicateIds.length > 0 ? [`Corrigir ${validation.campaigns.duplicateIds.length} campaign IDs duplicados`] : [])
    ]
  };
}

/**
 * Remove entradas completamente vazias
 */
async function removeEmptyEntries(sheets: any, spreadsheetId: string, dryRun: boolean) {
  console.log('🗑️ Removendo entradas vazias...');
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Campanhas!A:F'
  });

  const values = response.data.values || [];
  const emptyRows: number[] = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const isEmpty = row.every((cell: string) => !cell || cell.trim() === '');
    
    if (isEmpty) {
      emptyRows.push(i + 1);
    }
  }

  return {
    action: 'remove_empty_entries',
    dryRun,
    summary: {
      totalRows: values.length - 1,
      emptyRows: emptyRows.length
    },
    details: {
      emptyRowNumbers: emptyRows
    },
    recommendations: emptyRows.length > 0 ? [`Remover ${emptyRows.length} linhas completamente vazias`] : []
  };
}

/**
 * Consolida entradas duplicadas baseado em IDs
 */
async function consolidateDuplicates(sheets: any, spreadsheetId: string, dryRun: boolean) {
  console.log('🔄 Consolidando duplicatas...');
  
  // Implementação futura para consolidar duplicatas
  return {
    action: 'consolidate_duplicates',
    dryRun,
    summary: {
      message: 'Funcionalidade em desenvolvimento'
    },
    recommendations: []
  };
}

/**
 * Limpeza completa do sistema
 */
async function fullCleanup(sheets: any, spreadsheetId: string, dryRun: boolean) {
  console.log('🧹 Limpeza completa do sistema...');
  
  const [validation, campaignCleanup, emptyEntries] = await Promise.all([
    validateAllIds(sheets, spreadsheetId),
    cleanupCampaigns(sheets, spreadsheetId, dryRun),
    removeEmptyEntries(sheets, spreadsheetId, dryRun)
  ]);

  return {
    action: 'full_cleanup',
    dryRun,
    results: {
      validation,
      campaignCleanup,
      emptyEntries
    },
    summary: {
      totalIssues: (
        validation.validation.businesses.withoutIds +
        validation.validation.creators.withoutIds +
        validation.validation.campaigns.withoutIds +
        campaignCleanup.summary.toDelete +
        emptyEntries.summary.emptyRows
      )
    },
    recommendations: [
      ...validation.recommendations,
      ...campaignCleanup.recommendations,
      ...emptyEntries.recommendations
    ]
  };
}
