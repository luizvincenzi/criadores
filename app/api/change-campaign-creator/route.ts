import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SPREADSHEET_ID = '14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI';

export async function POST(request: NextRequest) {
  try {
    const { campaignId, businessName, mes, oldCreator, newCreator, newCreatorData, user } = await request.json();
    
    console.log('🔄 Iniciando troca de criador:', {
      campaignId,
      businessName,
      mes,
      oldCreator,
      newCreator
    });

    // 🆔 CONVERTER NOMES PARA IDs PRIMEIRO
    console.log('🔄 Convertendo nomes para IDs...');

    // Buscar business_id
    const businessResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/get-business-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessName })
    });
    const businessResult = await businessResponse.json();

    if (!businessResult.success) {
      throw new Error(`Business "${businessName}" não encontrado: ${businessResult.error}`);
    }
    const businessId = businessResult.businessId;

    // Buscar criador_id do novo criador
    const newCreatorResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/api/get-creator-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorName: newCreator })
    });
    const newCreatorResult = await newCreatorResponse.json();

    if (!newCreatorResult.success) {
      throw new Error(`Criador "${newCreator}" não encontrado: ${newCreatorResult.error}`);
    }
    const newCriadorId = newCreatorResult.criadorId;

    console.log('✅ IDs obtidos:', { businessId, newCriadorId });

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
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // 1. Buscar e desativar criador antigo
    console.log(`🔍 Passo 1: Buscando criador antigo: ${oldCreator}`);
    
    const campaignsData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'campanhas!A:AE'
    });

    const values = campaignsData.data.values || [];
    if (values.length === 0) {
      throw new Error('Nenhum dado encontrado na aba campanhas');
    }

    // Estrutura das colunas
    const campaignIdCol = 0; // A = Campaign_ID
    const nomeCampanhaCol = 1; // B = Nome Campanha
    const influenciadorCol = 2; // C = Influenciador
    const responsavelCol = 3; // D = Responsável
    const statusCol = 4; // E = Status
    const mesCol = 5; // F = Mês

    // Buscar linha do criador antigo
    let oldCreatorRow = null;
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowCampaignId = (row[campaignIdCol] || '').toString().trim();
      const rowInfluenciador = (row[influenciadorCol] || '').toString().trim();
      
      // Buscar por Campaign_ID específico + criador antigo
      if (rowCampaignId.includes(campaignId.split('_')[3]) && // Business slug
          rowInfluenciador.toLowerCase() === oldCreator.toLowerCase()) {
        oldCreatorRow = {
          index: i,
          data: row
        };
        console.log(`✅ Criador antigo encontrado na linha ${i + 1}`);
        break;
      }
    }

    if (!oldCreatorRow) {
      console.log(`❌ Criador antigo ${oldCreator} não encontrado`);
      // Não é erro fatal - pode ser que seja uma adição nova
    }

    // 2. Criar nova linha para o novo criador
    console.log(`➕ Passo 2: Criando entrada para novo criador: ${newCreator}`);
    
    // Gerar novo Campaign_ID para o novo criador
    const timestamp = Date.now();
    const businessSlug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
    const creatorSlug = newCreator.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
    const mesSlug = mes.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newCampaignId = `camp_${timestamp}_new_${businessSlug}_${mesSlug}_${creatorSlug}`;

    // Preparar dados da nova linha
    const newRow = [
      newCampaignId, // A = Campaign_ID
      businessId, // B = business_id (ID em vez de nome)
      newCriadorId, // C = criador_id (ID em vez de nome)
      newCreatorData?.responsavel || 'Sistema', // D = Responsável
      'Ativo', // E = Status
      mes, // F = Mês
      '', // G = FIM
      newCreatorData?.briefingCompleto || 'Pendente', // H = Briefing completo
      newCreatorData?.dataHoraVisita || '', // I = Data e hora Visita
      newCreatorData?.quantidadeConvidados || '', // J = Quantidade de convidados
      newCreatorData?.visitaConfirmada || 'Pendente', // K = Visita Confirmado
      newCreatorData?.dataHoraPostagem || '', // L = Data e hora da Postagem
      newCreatorData?.videoAprovado || 'Pendente', // M = Vídeo aprovado?
      newCreatorData?.videoPostado || 'Não', // N = Video/Reels postado?
      '', // O = Link Video Instagram
      newCreatorData?.notas || '', // P = Notas
      '', // Q = Arquivo
      '', // R = Avaliação Restaurante
      '', // S = Avaliação Influenciador
      'Ativo' // T = Status do Calendário
    ];

    // 3. Executar as operações
    const operations = [];

    // Se encontrou criador antigo, marcar como inativo
    if (oldCreatorRow) {
      console.log(`🔄 Passo 3a: Desativando criador antigo na linha ${oldCreatorRow.index + 1}`);
      operations.push({
        range: `campanhas!T${oldCreatorRow.index + 1}`, // Coluna T = Status do Calendário
        values: [['Inativo']]
      });
    }

    // CORREÇÃO: Encontrar slot vazio em vez de adicionar nova linha
    console.log(`🔍 Passo 3b: Procurando slot vazio para editar`);

    let emptySlotRow = null;
    let wasInPlaceEdit = false;
    const nextRow = values.length + 1; // Definir aqui para evitar erro

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowBusiness = row[1]?.toLowerCase().trim(); // Coluna B
      const rowMes = row[5]?.toLowerCase().trim(); // Coluna F
      const rowInfluenciador = row[2]?.trim(); // Coluna C
      const rowStatus = row[19] || 'Ativo'; // Coluna T - Status do Calendário

      // Procurar slot vazio (sem influenciador) da mesma campanha e ativo
      if (rowBusiness === businessName.toLowerCase().trim() &&
          rowMes === mes.toLowerCase().trim() &&
          (!rowInfluenciador || rowInfluenciador === '') &&
          rowStatus.toLowerCase() === 'ativo') {
        emptySlotRow = i + 1; // +1 porque é 1-based
        console.log(`✅ Slot vazio encontrado na linha ${emptySlotRow}`);
        break;
      }
    }

    if (emptySlotRow) {
      // Editar slot vazio existente
      console.log(`✏️ Editando slot vazio na linha ${emptySlotRow}`);
      wasInPlaceEdit = true;
      operations.push({
        range: `campanhas!C${emptySlotRow}:N${emptySlotRow}`, // Colunas C até N
        values: [[
          newCriadorId, // C = criador_id (ID em vez de nome)
          'Sistema', // D = Responsável
          'Reunião de briefing', // E = Status_campaign (status da campanha, não do criador)
          mes, // F = Mês (manter)
          '', // G = FIM
          newCreatorData?.briefingCompleto || 'Pendente', // H
          newCreatorData?.dataHoraVisita || '', // I
          newCreatorData?.quantidadeConvidados || '', // J
          newCreatorData?.visitaConfirmada || 'Pendente', // K
          newCreatorData?.dataHoraPostagem || '', // L
          newCreatorData?.videoAprovado || 'Pendente', // M
          newCreatorData?.videoPostado || 'Não' // N
        ]]
      });
    } else {
      // Fallback: Adicionar nova linha apenas se não houver slots vazios
      console.log(`⚠️ Nenhum slot vazio encontrado, adicionando nova linha`);
      wasInPlaceEdit = false;
      operations.push({
        range: `campanhas!A${nextRow}:T${nextRow}`,
        values: [newRow]
      });
    }

    // Executar todas as operações
    if (operations.length > 0) {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          valueInputOption: 'RAW',
          data: operations
        }
      });
    }

    // 4. Registrar no audit log
    console.log(`📝 Passo 4: Registrando no audit log`);
    
    const auditLogData = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'detailed_logs!A:Z'
    });

    const auditRows = auditLogData.data.values || [];
    const nextAuditRow = auditRows.length + 1;

    const auditEntry = [
      `detailed_${timestamp}_creator_change`, // ID
      new Date().toISOString(), // Timestamp
      'creator_change', // Action
      'campaign', // Entity_Type
      newCampaignId, // Entity_ID
      `${businessName}-${mes}`, // Entity_Name
      user || 'sistema', // User_ID
      user || 'sistema', // User_Name
      businessId, // Business_Context
      mes, // Campaign_Context
      newCriadorId, // Creator_Context
      'influenciador', // Field_Changed
      oldCreator, // Old_Value
      newCreator, // New_Value
      'Troca de criador solicitada pelo usuário', // Change_Reason
      'success', // Validation_Status
      '', // Session_ID
      '', // IP_Address
      '', // User_Agent
      JSON.stringify({
        oldCampaignId: oldCreatorRow?.data[0] || 'N/A',
        newCampaignId,
        oldCreatorRow: oldCreatorRow?.index || 'N/A',
        newCreatorRow: nextRow,
        newCreatorData
      }) // Details
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'detailed_logs!A:Z',
      valueInputOption: 'RAW',
      requestBody: {
        values: [auditEntry]
      }
    });

    console.log('✅ Troca de criador concluída com sucesso!');

    return NextResponse.json({
      success: true,
      message: `Criador trocado com sucesso: ${oldCreator} → ${newCreator}`,
      data: {
        oldCreator: {
          name: oldCreator,
          found: !!oldCreatorRow,
          row: oldCreatorRow?.index || null,
          status: oldCreatorRow ? 'Desativado' : 'Não encontrado'
        },
        newCreator: {
          name: newCreator,
          campaignId: newCampaignId,
          row: emptySlotRow || nextRow,
          status: 'Ativo',
          action: wasInPlaceEdit ? 'edited_existing_slot' : 'created_new_slot'
        },
        operations: operations.length,
        auditLogEntry: auditEntry[0]
      }
    });

  } catch (error) {
    console.error('❌ Erro na troca de criador:', error);
    
    // Registrar erro no audit log
    try {
      const errorAuditEntry = [
        `detailed_${Date.now()}_creator_change_error`,
        new Date().toISOString(),
        'creator_change_failed',
        'campaign',
        campaignId || 'unknown',
        `${businessName}-${mes}`,
        user || 'sistema',
        user || 'sistema',
        businessName || '',
        mes || '',
        `${oldCreator} → ${newCreator}`,
        'influenciador',
        oldCreator || '',
        newCreator || '',
        'Erro na troca de criador',
        'failed',
        '', '', '',
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          timestamp: new Date().toISOString()
        })
      ];

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
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      const sheets = google.sheets({ version: 'v4', auth });
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'detailed_logs!A:Z',
        valueInputOption: 'RAW',
        requestBody: {
          values: [errorAuditEntry]
        }
      });
    } catch (auditError) {
      console.error('❌ Erro ao registrar no audit log:', auditError);
    }

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido na troca de criador'
    });
  }
}
