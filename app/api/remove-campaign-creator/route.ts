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
      console.error('❌ Parâmetros inválidos:', { businessName, mes, creatorData });
      return NextResponse.json({
        success: false,
        error: 'Parâmetros obrigatórios: businessName, mes',
        received: { businessName, mes, creatorData }
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
    console.log(`🔍 Procurando campanhas para: "${businessName}" - "${mes}"`);
    console.log(`📊 Total de linhas na planilha: ${rows.length}`);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nomeCampanha = row[1]; // Coluna B - Nome Campanha
      const mes_planilha = row[5]; // Coluna F - Mês

      if (i < 5) { // Log das primeiras 5 linhas para debug
        console.log(`📋 Linha ${i + 2}: Nome="${nomeCampanha}", Mês="${mes_planilha}"`);
      }

      // Comparação mais flexível
      const nomeMatch = nomeCampanha?.toLowerCase().trim() === businessName.toLowerCase().trim();
      const mesNormalizado = mes.toLowerCase().trim();
      const mesPlaNormalizado = mes_planilha?.toLowerCase().trim() || '';
      const mesMatch = mesPlaNormalizado === mesNormalizado ||
                      mesPlaNormalizado.includes(mesNormalizado) ||
                      mesNormalizado.includes(mesPlaNormalizado);

      if (nomeMatch && mesMatch) {
        campaignRows.push({ row, index: i + 2 }); // +2 porque começa na linha 2 (header é linha 1)
        console.log(`✅ Campanha encontrada na linha ${i + 2}: ${nomeCampanha} - ${mes_planilha}`);
      }
    }

    console.log(`📊 Total de campanhas encontradas: ${campaignRows.length}`);

    if (campaignRows.length === 0) {
      console.error('❌ Nenhuma campanha encontrada para os parâmetros fornecidos');
      return NextResponse.json({
        success: false,
        error: `Nenhuma campanha encontrada para "${businessName}" em "${mes}"`,
        debug: {
          searchParams: { businessName, mes },
          totalRows: rows.length,
          sampleRows: rows.slice(0, 3).map((row, i) => ({
            line: i + 2,
            nomeCampanha: row[1],
            mes: row[5]
          }))
        }
      }, { status: 400 });
    }

    // Contar apenas campanhas ativas
    const activeCampaigns = campaignRows.filter(item => {
      const statusCalendario = item.row[19] || 'Ativo'; // Coluna T
      const isActive = statusCalendario.toLowerCase() !== 'inativo';
      console.log(`📊 Linha ${item.index}: Status="${statusCalendario}" (${isActive ? 'ATIVO' : 'INATIVO'})`);
      return isActive;
    });

    console.log(`📊 Campanhas ativas: ${activeCampaigns.length} de ${campaignRows.length} total`);

    if (activeCampaigns.length <= 1) {
      console.error('❌ Não é possível remover - apenas 1 campanha ativa restante');
      return NextResponse.json({
        success: false,
        error: 'Não é possível remover o último criador ativo. Uma campanha deve ter pelo menos um slot ativo.',
        debug: {
          totalCampaigns: campaignRows.length,
          activeCampaigns: activeCampaigns.length
        }
      }, { status: 400 });
    }

    // Encontrar a linha específica para remover (apenas entre campanhas ativas)
    let rowToRemove = null;

    if (creatorData.influenciador) {
      // Se tem criador específico, procurar por ele entre as campanhas ativas
      rowToRemove = activeCampaigns.find(item =>
        item.row[2]?.toLowerCase() === creatorData.influenciador.toLowerCase() // Coluna C - Influenciador
      );
    }

    if (!rowToRemove) {
      // Se não encontrou por criador específico, pegar o último slot ativo vazio ou o último ativo
      const activeEmptySlots = activeCampaigns.filter(item => !item.row[2] || item.row[2].trim() === '');
      if (activeEmptySlots.length > 0) {
        rowToRemove = activeEmptySlots[activeEmptySlots.length - 1];
      } else {
        rowToRemove = activeCampaigns[activeCampaigns.length - 1];
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

    // Em vez de deletar, marcar como inativo na coluna "Status do Calendário" (coluna T)
    const statusCalendarioColumn = 'T'; // Coluna T = Status do Calendário
    const cellRange = `campanhas!${statusCalendarioColumn}${rowToRemove.index}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: cellRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Inativo']]
      }
    });

    console.log(`✅ Criador marcado como inativo: ${removedInfluenciador} (${removedCampaignId})`);
    
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
        'Criador Removido (Soft Delete)',
        businessName,
        mes,
        removedCampaignId,
        'Ativo', // Status antigo
        'Inativo', // Status novo
        `Criador marcado como inativo: ${removedInfluenciador}. Dados preservados na planilha.`
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
      message: 'Criador marcado como inativo com sucesso',
      removedCampaignId,
      removedInfluenciador,
      action: 'soft_delete',
      note: 'Dados preservados na planilha, apenas marcado como inativo',
      remainingActiveSlots: activeCampaigns.length - 1
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
