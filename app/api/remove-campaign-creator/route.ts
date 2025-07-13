import { NextRequest, NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

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

    // Configurar autenticação do Google Sheets
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    // Acessar a aba 'campanhas'
    const campaignsSheet = doc.sheetsByTitle['campanhas'];
    if (!campaignsSheet) {
      throw new Error('Aba "campanhas" não encontrada');
    }

    await campaignsSheet.loadHeaderRow();
    const rows = await campaignsSheet.getRows();

    // Encontrar campanhas para este business/mês
    const campaignRows = rows.filter(row => 
      row.get('Nome Campanha')?.toLowerCase() === businessName.toLowerCase() &&
      row.get('Mês')?.toLowerCase() === mes.toLowerCase()
    );

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
      rowToRemove = campaignRows.find(row => 
        row.get('Influenciador')?.toLowerCase() === creatorData.influenciador.toLowerCase()
      );
    }
    
    if (!rowToRemove) {
      // Se não encontrou por criador específico, pegar o último slot vazio ou o último da lista
      const emptySlots = campaignRows.filter(row => !row.get('Influenciador') || row.get('Influenciador').trim() === '');
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

    const removedCampaignId = rowToRemove.get('Campaign_ID');
    const removedInfluenciador = rowToRemove.get('Influenciador') || 'Slot vazio';

    // Remover a linha
    await rowToRemove.delete();
    
    console.log('✅ Criador removido:', {
      campaignId: removedCampaignId,
      businessName,
      mes,
      influenciador: removedInfluenciador
    });

    // Registrar no audit_log
    try {
      const auditSheet = doc.sheetsByTitle['audit_log'];
      if (auditSheet) {
        await auditSheet.addRow({
          'Timestamp': new Date().toISOString(),
          'User': user || 'Sistema',
          'Action': 'Criador Removido',
          'Business_Name': businessName,
          'Campaign_Month': mes,
          'Campaign_ID': removedCampaignId,
          'Old_Value_Status': rowToRemove.get('Status') || '',
          'New_Value_Status': '',
          'Details': `Criador removido: ${removedInfluenciador}`
        });
        console.log('📝 Audit log registrado para remoção de criador');
      }
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
