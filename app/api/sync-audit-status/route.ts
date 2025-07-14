import { NextRequest, NextResponse } from 'next/server';
import { createGoogleSheetsClient } from '@/app/actions/sheetsActions';

/**
 * API para sincronizar status da interface com audit_log
 * Garante que a interface sempre reflita o audit_log como fonte da verdade
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessName, mes } = body;

    console.log(`🔄 Sincronizando status com audit_log: ${businessName} - ${mes}`);

    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SPREADSHEET_ID não configurado'
      });
    }

    // 1. BUSCAR STATUS MAIS RECENTE NO AUDIT_LOG
    const auditResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Audit_Log!A:M'
    });

    const auditValues = auditResponse.data.values || [];
    let latestStatus = null;
    let latestTimestamp = '';

    // Buscar o status mais recente para esta campanha
    for (let i = auditValues.length - 1; i >= 1; i--) {
      const row = auditValues[i];
      const entityName = row[5] || ''; // Entity_Name
      const newValueStatus = row[10] || ''; // New_Value_Status
      const timestamp = row[1] || ''; // Timestamp

      // Verificar se é a campanha que estamos procurando
      const campaignKey = `${businessName}-${mes}`;
      if (entityName.includes(businessName) && entityName.includes(mes) && newValueStatus) {
        latestStatus = newValueStatus;
        latestTimestamp = timestamp;
        console.log(`📊 Status mais recente encontrado no audit_log: ${latestStatus} (${timestamp})`);
        break;
      }
    }

    if (!latestStatus) {
      return NextResponse.json({
        success: false,
        error: `Nenhum status encontrado no audit_log para ${businessName} - ${mes}`
      });
    }

    // 2. BUSCAR CAMPANHAS NA PLANILHA
    const campaignResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:F'
    });

    const campaignValues = campaignResponse.data.values || [];
    const campaignsToUpdate = [];

    for (let i = 1; i < campaignValues.length; i++) {
      const row = campaignValues[i];
      const rowBusiness = (row[1] || '').toString().trim();
      const rowMes = (row[5] || '').toString().trim();
      const currentStatus = row[4] || '';

      const businessMatch = rowBusiness.toLowerCase() === businessName.toLowerCase();
      const mesMatch = !mes || !rowMes || rowMes.toLowerCase() === mes.toLowerCase();

      if (businessMatch && mesMatch && currentStatus !== latestStatus) {
        campaignsToUpdate.push({
          rowIndex: i + 1,
          campaignId: row[0],
          currentStatus,
          newStatus: latestStatus
        });
      }
    }

    console.log(`📊 Encontradas ${campaignsToUpdate.length} campanhas para sincronizar`);

    // 3. ATUALIZAR STATUS NA PLANILHA
    if (campaignsToUpdate.length > 0) {
      const updates = campaignsToUpdate.map(campaign => ({
        range: `Campanhas!E${campaign.rowIndex}`, // Coluna E = Status
        values: [[latestStatus]]
      }));

      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      });

      console.log(`✅ ${campaignsToUpdate.length} campanhas sincronizadas com audit_log`);
    }

    return NextResponse.json({
      success: true,
      message: `Status sincronizado com audit_log: ${latestStatus}`,
      data: {
        businessName,
        mes,
        latestStatus,
        latestTimestamp,
        campaignsUpdated: campaignsToUpdate.length,
        campaigns: campaignsToUpdate
      }
    });

  } catch (error) {
    console.error('Erro na sincronização:', error);
    return NextResponse.json({
      success: false,
      error: `Erro na sincronização: ${error}`
    });
  }
}

/**
 * GET para verificar status atual sem fazer alterações
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const businessName = url.searchParams.get('businessName');
    const mes = url.searchParams.get('mes');

    if (!businessName) {
      return NextResponse.json({
        success: false,
        error: 'businessName é obrigatório'
      });
    }

    console.log(`🔍 Verificando status: ${businessName} - ${mes}`);

    const sheets = await createGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SPREADSHEET_ID não configurado'
      });
    }

    // Buscar status no audit_log
    const auditResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Audit_Log!A:M'
    });

    const auditValues = auditResponse.data.values || [];
    let auditStatus = null;
    let auditTimestamp = '';

    for (let i = auditValues.length - 1; i >= 1; i--) {
      const row = auditValues[i];
      const entityName = row[5] || '';
      const newValueStatus = row[10] || '';
      const timestamp = row[1] || '';

      if (entityName.includes(businessName) && (!mes || entityName.includes(mes)) && newValueStatus) {
        auditStatus = newValueStatus;
        auditTimestamp = timestamp;
        break;
      }
    }

    // Buscar status na planilha de campanhas
    const campaignResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:F'
    });

    const campaignValues = campaignResponse.data.values || [];
    const campaignStatuses = [];

    for (let i = 1; i < campaignValues.length; i++) {
      const row = campaignValues[i];
      const rowBusiness = (row[1] || '').toString().trim();
      const rowMes = (row[5] || '').toString().trim();
      const status = row[4] || '';

      const businessMatch = rowBusiness.toLowerCase() === businessName.toLowerCase();
      const mesMatch = !mes || !rowMes || rowMes.toLowerCase() === mes.toLowerCase();

      if (businessMatch && mesMatch) {
        campaignStatuses.push({
          campaignId: row[0],
          business: rowBusiness,
          mes: rowMes,
          status,
          rowIndex: i + 1
        });
      }
    }

    const isInSync = campaignStatuses.every(c => c.status === auditStatus);

    return NextResponse.json({
      success: true,
      data: {
        businessName,
        mes,
        auditLog: {
          status: auditStatus,
          timestamp: auditTimestamp
        },
        campaigns: campaignStatuses,
        isInSync,
        needsSync: !isInSync && auditStatus !== null
      }
    });

  } catch (error) {
    console.error('Erro na verificação:', error);
    return NextResponse.json({
      success: false,
      error: `Erro na verificação: ${error}`
    });
  }
}
