import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI';

export async function POST(request: NextRequest) {
  try {
    const { businessName, mes, creatorData, user } = await request.json();

    console.log('🗑️ API: Removendo criador da campanha:', {
      businessName,
      mes,
      creatorData,
      user
    });

    // Validar parâmetros obrigatórios
    if (!businessName || !mes) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros obrigatórios: businessName, mes'
      }, { status: 400 });
    }

    // Configurar autenticação
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: 'crmcriadores',
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: 'crm-criadores@crmcriadores.iam.gserviceaccount.com',
        client_id: '113660609859941708871',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: 'https://www.googleapis.com/service_accounts/v1/metadata/x509/crm-criadores%40crmcriadores.iam.gserviceaccount.com'
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Buscar dados da aba campanhas
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!A:AH',
    });

    const values = response.data.values;
    if (!values || values.length <= 1) {
      throw new Error('Erro ao acessar dados da planilha');
    }

    const headers = values[0];
    const rows = values.slice(1);

    // Encontrar campanhas para este business/mês
    const campaignRows = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nomeCampanha = row[1]; // Coluna B - Nome Campanha
      const mes_planilha = row[5]; // Coluna F - Mês

      if (nomeCampanha?.toLowerCase() === businessName.toLowerCase() &&
          mes_planilha?.toLowerCase() === mes.toLowerCase()) {
        campaignRows.push({ row, index: i + 2 }); // +2 porque começa na linha 2 (header é linha 1)
      }
    }

    if (campaignRows.length <= 1) {
      return NextResponse.json({
        success: false,
        error: 'Não é possível remover o último criador. Uma campanha deve ter pelo menos um slot.'
      }, { status: 400 });
    }

    // Encontrar a linha específica para remover
    let rowToRemove = null;

    if (creatorData.influenciador) {
      // Se tem criador específico, procurar por ele
      rowToRemove = campaignRows.find(item =>
        item.row[2]?.toLowerCase() === creatorData.influenciador.toLowerCase() // Coluna C - Influenciador
      );
    }

    if (!rowToRemove) {
      // Se não encontrou por criador específico, pegar o último slot vazio ou o último da lista
      const emptySlots = campaignRows.filter(item => !item.row[2] || item.row[2].trim() === '');
      if (emptySlots.length > 0) {
        rowToRemove = emptySlots[emptySlots.length - 1];
      } else {
        rowToRemove = campaignRows[campaignRows.length - 1];
      }
    }

    if (!rowToRemove) {
      return NextResponse.json({
        success: false,
        error: 'Nenhuma linha encontrada para remoção'
      }, { status: 404 });
    }

    const removedCampaignId = rowToRemove.row[0]; // Coluna A - Campaign_ID
    const removedInfluenciador = rowToRemove.row[2] || 'Slot vazio'; // Coluna C - Influenciador

    // Remover a linha
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: 0, // Assumindo que campanhas é a primeira aba
              dimension: 'ROWS',
              startIndex: rowToRemove.index - 1,
              endIndex: rowToRemove.index
            }
          }
        }]
      }
    });
    
    console.log('✅ Criador removido:', {
      campaignId: removedCampaignId,
      businessName,
      mes,
      influenciador: removedInfluenciador
    });

    // Registrar no audit_log
    try {
      const auditData = [
        new Date().toISOString(),
        user || 'Sistema',
        'Criador Removido',
        businessName,
        mes,
        removedCampaignId,
        rowToRemove.row[4] || '', // Status antigo
        '',
        `Criador removido: ${removedInfluenciador}`
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'audit_log!A:I',
        valueInputOption: 'RAW',
        requestBody: {
          values: [auditData]
        }
      });

      console.log('📝 Audit log registrado para remoção de criador');
    } catch (auditError) {
      console.warn('⚠️ Erro ao registrar audit log:', auditError);
    }

    return NextResponse.json({
      success: true,
      message: 'Criador removido com sucesso',
      removedCampaignId,
      removedInfluenciador,
      remainingSlots: campaignRows.length - 1
    });

  } catch (error) {
    console.error('❌ Erro ao remover criador:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
