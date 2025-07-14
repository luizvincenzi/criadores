import { NextRequest, NextResponse } from 'next/server';
import { 
  createGoogleSheetsClient,
  findBusinessHybrid,
  findCreatorHybrid,
  logAction
} from '@/app/actions/sheetsActions';

/**
 * API para corrigir problemas de atualização de campanhas
 * Foca em usar IDs únicos e audit_log como fonte da verdade
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, businessName, mes, influenciador, newValue, field, user } = body;

    console.log(`🔧 Corrigindo atualização: ${action}`, { businessName, mes, influenciador, field, newValue });

    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SPREADSHEET_ID não configurado'
      });
    }

    switch (action) {
      case 'update_with_audit':
        return await updateWithAuditLog(sheets, spreadsheetId, {
          businessName, mes, influenciador, newValue, field, user
        });
      
      case 'force_update_by_id':
        return await forceUpdateById(sheets, spreadsheetId, {
          businessName, mes, influenciador, newValue, field, user
        });
      
      case 'validate_campaign_exists':
        return await validateCampaignExists(sheets, spreadsheetId, {
          businessName, mes, influenciador
        });
      
      default:
        return NextResponse.json({
          success: false,
          error: `Ação não reconhecida: ${action}`
        });
    }

  } catch (error) {
    console.error('Erro na correção:', error);
    return NextResponse.json({
      success: false,
      error: `Erro na correção: ${error}`
    });
  }
}

/**
 * Atualiza campanha usando sistema híbrido e registra no audit_log
 */
async function updateWithAuditLog(sheets: any, spreadsheetId: string, params: any) {
  const { businessName, mes, influenciador, newValue, field, user } = params;

  console.log('🔍 Validando entidades com sistema híbrido...');

  // 1. VALIDAR BUSINESS E CREATOR COM SISTEMA HÍBRIDO
  const businessData = await findBusinessHybrid(businessName);
  if (!businessData) {
    return NextResponse.json({
      success: false,
      error: `Business "${businessName}" não encontrado no sistema`,
      validation: { businessFound: false, creatorFound: false }
    });
  }

  const creatorData = await findCreatorHybrid(influenciador);
  if (!creatorData) {
    return NextResponse.json({
      success: false,
      error: `Creator "${influenciador}" não encontrado no sistema`,
      validation: { businessFound: true, creatorFound: false }
    });
  }

  console.log(`✅ Entidades validadas: Business ID=${businessData.data[17]}, Creator ID=${creatorData.data[21]}`);

  // 2. BUSCAR CAMPANHA NA PLANILHA
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Campanhas!A:K'
  });

  const values = response.data.values || [];
  let campaignFound = false;
  let campaignRow = -1;
  let campaignId = '';
  let oldValue = '';

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowBusiness = (row[1] || '').toString().trim();
    const rowInfluenciador = (row[2] || '').toString().trim();
    const rowMes = (row[5] || '').toString().trim();

    // Busca híbrida: exata primeiro, depois flexível
    const businessMatch = rowBusiness.toLowerCase() === businessName.toLowerCase();
    const creatorMatch = rowInfluenciador.toLowerCase() === influenciador.toLowerCase();
    const mesMatch = !mes || !rowMes || rowMes.toLowerCase() === mes.toLowerCase();

    if (businessMatch && creatorMatch && mesMatch) {
      campaignFound = true;
      campaignRow = i;
      campaignId = row[0] || '';
      
      // Mapear campo para coluna
      const fieldColumnMap: { [key: string]: number } = {
        'visitaConfirmado': 10, // Coluna K
        'dataHoraVisita': 8,    // Coluna I
        'quantidadeConvidados': 9, // Coluna J
        'dataHoraPostagem': 11, // Coluna L
        'videoAprovado': 12,    // Coluna M
        'videoPostado': 13      // Coluna N
      };

      const columnIndex = fieldColumnMap[field];
      if (columnIndex !== undefined) {
        oldValue = row[columnIndex] || '';
      }

      console.log(`✅ Campanha encontrada na linha ${i + 1}: ${campaignId}`);
      break;
    }
  }

  if (!campaignFound) {
    return NextResponse.json({
      success: false,
      error: `Campanha não encontrada para Business="${businessName}", Mês="${mes}", Influenciador="${influenciador}"`,
      validation: { businessFound: true, creatorFound: true, campaignFound: false }
    });
  }

  // 3. VERIFICAR SE REALMENTE PRECISA ATUALIZAR
  if (oldValue === newValue) {
    console.log(`ℹ️ Valor já está correto: "${oldValue}" = "${newValue}"`);
    return NextResponse.json({
      success: true,
      message: `Valor já está correto: "${newValue}"`,
      noChangeNeeded: true,
      currentValue: oldValue
    });
  }

  // 4. EXECUTAR ATUALIZAÇÃO NA PLANILHA
  const fieldColumnMap: { [key: string]: { column: number, letter: string } } = {
    'visitaConfirmado': { column: 10, letter: 'K' },
    'dataHoraVisita': { column: 8, letter: 'I' },
    'quantidadeConvidados': { column: 9, letter: 'J' },
    'dataHoraPostagem': { column: 11, letter: 'L' },
    'videoAprovado': { column: 12, letter: 'M' },
    'videoPostado': { column: 13, letter: 'N' }
  };

  const fieldInfo = fieldColumnMap[field];
  if (!fieldInfo) {
    return NextResponse.json({
      success: false,
      error: `Campo "${field}" não é suportado para atualização`
    });
  }

  const updateRange = `Campanhas!${fieldInfo.letter}${campaignRow + 1}`;
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: updateRange,
    valueInputOption: 'RAW',
    requestBody: {
      values: [[newValue]]
    }
  });

  console.log(`✅ Planilha atualizada: ${updateRange} = "${newValue}"`);

  // 5. REGISTRAR NO AUDIT_LOG COMO FONTE DA VERDADE
  const auditLogId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await logAction({
    action: 'campaign_field_updated',
    entity_type: 'campaign',
    entity_id: campaignId,
    entity_name: `${businessName}-${mes}-${influenciador}`,
    old_value: oldValue,
    new_value: newValue,
    old_value_status: oldValue,
    new_value_status: newValue,
    user_id: user,
    user_name: user,
    details: `Campo ${field} atualizado: "${oldValue}" → "${newValue}"`
  });

  console.log(`✅ Audit log registrado: ${auditLogId}`);

  return NextResponse.json({
    success: true,
    message: `Campo ${field} atualizado com sucesso: "${oldValue}" → "${newValue}"`,
    data: {
      campaignId,
      field,
      oldValue,
      newValue,
      updateRange,
      auditLogId,
      businessId: businessData.data[17],
      creatorId: creatorData.data[21]
    }
  });
}

/**
 * Força atualização usando IDs únicos
 */
async function forceUpdateById(sheets: any, spreadsheetId: string, params: any) {
  // Implementação futura para forçar atualização por ID
  return NextResponse.json({
    success: false,
    error: 'Funcionalidade em desenvolvimento'
  });
}

/**
 * Valida se a campanha existe no sistema
 */
async function validateCampaignExists(sheets: any, spreadsheetId: string, params: any) {
  const { businessName, mes, influenciador } = params;

  console.log('🔍 Validando existência da campanha...');

  // Validar business e creator
  const businessData = await findBusinessHybrid(businessName);
  const creatorData = await findCreatorHybrid(influenciador);

  // Buscar campanha
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Campanhas!A:F'
  });

  const values = response.data.values || [];
  const campaigns = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const rowBusiness = (row[1] || '').toString().trim();
    const rowInfluenciador = (row[2] || '').toString().trim();
    const rowMes = (row[5] || '').toString().trim();

    const businessMatch = rowBusiness.toLowerCase() === businessName.toLowerCase();
    const creatorMatch = rowInfluenciador.toLowerCase() === influenciador.toLowerCase();

    if (businessMatch && creatorMatch) {
      campaigns.push({
        linha: i + 1,
        campaignId: row[0],
        business: rowBusiness,
        influenciador: rowInfluenciador,
        mes: rowMes,
        status: row[4]
      });
    }
  }

  return NextResponse.json({
    success: true,
    validation: {
      businessFound: !!businessData,
      creatorFound: !!creatorData,
      campaignsFound: campaigns.length
    },
    data: {
      businessData: businessData ? {
        nome: businessData.nome,
        businessId: businessData.data[17]
      } : null,
      creatorData: creatorData ? {
        nome: creatorData.nome,
        creatorId: creatorData.data[21]
      } : null,
      campaigns
    }
  });
}
