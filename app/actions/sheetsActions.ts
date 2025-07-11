'use server';

import { google } from 'googleapis';

// Configuração da autenticação
const getGoogleSheetsAuth = () => {
  const credentials = {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`,
  };

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return auth;
};

// Função para ler dados da planilha
export async function getData(sheetName: string) {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não está configurado');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`, // Lê todas as colunas de A até Z
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Erro ao ler dados da planilha:', error);
    throw new Error('Falha ao ler dados da planilha');
  }
}

// Interface para dados completos do business
export interface BusinessData {
  id: string;
  nome: string; // Coluna A
  categoria: string; // Coluna B
  plano: string; // Coluna C
  valor: string; // Coluna D
  descricao: string; // Coluna E
  status: string; // Coluna F
  responsavel: string; // Coluna G
  whatsapp: string; // Coluna H
  email: string; // Coluna I
  observacoes: string; // Coluna J
  dataInicio: string; // Coluna K
  dataFim: string; // Coluna L
  row: number; // Linha na planilha
}

// Função para buscar todos os dados dos negócios da aba Business
export async function getBusinessesData(): Promise<BusinessData[]> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.log('GOOGLE_SPREADSHEET_ID não configurado, usando dados mock');
      return [];
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Business!A:L', // Lê todas as colunas relevantes
    });

    const values = response.data.values || [];

    if (values.length <= 1) {
      console.log('Aba Business vazia ou só com cabeçalho');
      return [];
    }

    // Mapeia os dados (pula o cabeçalho)
    const businesses: BusinessData[] = values
      .slice(1)
      .map((row, index) => ({
        id: `sheet-${index + 2}`, // +2 porque pula cabeçalho e é 1-indexed
        nome: row[0] || '',
        categoria: row[1] || '',
        plano: row[2] || '',
        valor: row[3] || '',
        descricao: row[4] || '',
        status: row[5] || '',
        responsavel: row[6] || '',
        whatsapp: row[7] || '',
        email: row[8] || '',
        observacoes: row[9] || '',
        dataInicio: row[10] || '',
        dataFim: row[11] || '',
        row: index + 2
      }))
      .filter(business => business.nome.trim() !== ''); // Remove linhas vazias

    console.log(`✅ ${businesses.length} negócios carregados da aba Business`);
    return businesses;
  } catch (error) {
    console.error('Erro ao buscar dados dos negócios:', error);
    return [];
  }
}

// Função específica para buscar apenas os nomes dos negócios da coluna A (mantida para compatibilidade)
export async function getBusinessNames() {
  try {
    const businesses = await getBusinessesData();
    return businesses.map(business => business.nome);
  } catch (error) {
    console.error('Erro ao buscar nomes dos negócios:', error);
    return [];
  }
}

// Interface para log de auditoria
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  old_value?: string;
  new_value?: string;
  old_value_status?: string;
  new_value_status?: string;
  user_id: string;
  user_name: string;
  details?: string;
}

// Função para registrar ação na aba de auditoria
export async function logAction(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.log('GOOGLE_SPREADSHEET_ID não configurado, log não será salvo');
      return false;
    }

    // Gera ID único e timestamp
    const logEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };

    // Prepara dados para inserção no audit log com as novas colunas
    // Ordem correta: A=ID, B=Timestamp, C=Action, D=Entity_Type, E=Entity_ID, F=Entity_Name,
    // G=Old_Value, H=New_Value, I=Old_Value_Status, J=New_Value_Status, K=User_ID, L=User_Name, M=Details
    const values = [[
      logEntry.id,                    // A - ID
      logEntry.timestamp,             // B - Timestamp
      logEntry.action,                // C - Action
      logEntry.entity_type,           // D - Entity_Type
      logEntry.entity_id,             // E - Entity_ID
      logEntry.entity_name,           // F - Entity_Name
      logEntry.old_value || '',       // G - Old_Value
      logEntry.new_value || '',       // H - New_Value
      logEntry.old_value_status || '', // I - Old_Value_Status
      logEntry.new_value_status || '', // J - New_Value_Status
      logEntry.user_id,               // K - User_ID
      logEntry.user_name,             // L - User_Name
      logEntry.details || ''          // M - Details
    ]];

    // Insere na aba Audit_Log (agora com 13 colunas A:M)
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Audit_Log!A:M',
      valueInputOption: 'RAW',
      requestBody: {
        values
      }
    });

    console.log('✅ Ação registrada no log de auditoria:', logEntry);

    // Se for uma mudança de status de business, atualiza também na aba Business
    if (logEntry.action === 'business_stage_changed' && logEntry.entity_type === 'business' && logEntry.new_value) {
      try {
        await updateBusinessStatusInSheet(logEntry.entity_name, logEntry.new_value, sheets, spreadsheetId);
        console.log('✅ Status do business atualizado na aba Business');
      } catch (error) {
        console.error('❌ Erro ao atualizar status na aba Business:', error);
        // Não falha o log de auditoria se a atualização do business falhar
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao registrar ação no log:', error);
    return false;
  }
}

// Função para atualizar o status do business na aba Business
async function updateBusinessStatusInSheet(businessName: string, newStatus: string, sheets: any, spreadsheetId: string) {
  try {
    // Busca todos os dados da aba Business
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Business!A:C', // Assumindo que A=Nome, B=Status, C=outros dados
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      console.log('⚠️ Aba Business está vazia');
      return;
    }

    // Encontra a linha do business pelo nome (coluna A)
    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) { // Pula o cabeçalho (linha 0)
      if (rows[i][0] && rows[i][0].toString().trim() === businessName.trim()) {
        targetRowIndex = i;
        break;
      }
    }

    if (targetRowIndex === -1) {
      console.log(`⚠️ Business "${businessName}" não encontrado na aba Business`);
      return;
    }

    // Atualiza o status na coluna B (assumindo que é a coluna de status)
    const updateRange = `Business!B${targetRowIndex + 1}`; // +1 porque as linhas são 1-indexed

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[newStatus]]
      }
    });

    console.log(`✅ Status do business "${businessName}" atualizado para "${newStatus}" na linha ${targetRowIndex + 1}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar status do business:', error);
    throw error;
  }
}

// Função para buscar o status mais recente de cada business no Audit_Log
export async function getLatestBusinessStatuses() {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.log('GOOGLE_SPREADSHEET_ID não configurado');
      return {};
    }

    // Busca todos os dados da aba Audit_Log (agora com 13 colunas)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Audit_Log!A:M',
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      console.log('Audit_Log vazio ou só com cabeçalho');
      return {};
    }

    // Mapeia os dados do audit log com as novas colunas
    const auditEntries = rows.slice(1).map((row: any[]) => ({
      id: row[0] || '',
      timestamp: row[1] || '',
      action: row[2] || '',
      entity_type: row[3] || '',
      entity_id: row[4] || '',
      entity_name: row[5] || '',
      old_value: row[6] || '',
      new_value: row[7] || '',
      old_value_status: row[8] || '',
      new_value_status: row[9] || '',
      user_id: row[10] || '',
      user_name: row[11] || '',
      details: row[12] || ''
    }));

    // Status válidos do Kanban
    const validStages = ['Reunião Briefing', 'Agendamentos', 'Entrega Final'];

    // Filtra apenas mudanças de status de business com status válidos
    const businessStatusChanges = auditEntries.filter(entry =>
      entry.action === 'business_stage_changed' &&
      entry.entity_type === 'business' &&
      entry.entity_name &&
      entry.new_value_status &&
      validStages.includes(entry.new_value_status)
    );

    // Ordena por timestamp (mais recente primeiro)
    businessStatusChanges.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateB - dateA; // Mais recente primeiro
    });

    // Cria mapa com o status mais recente de cada business
    const latestStatuses: Record<string, string> = {};

    businessStatusChanges.forEach(entry => {
      const businessName = entry.entity_name.trim();

      // Se ainda não temos status para este business, usa este (que é o mais recente)
      if (!latestStatuses[businessName]) {
        latestStatuses[businessName] = entry.new_value_status;
        console.log(`📊 Status mais recente para "${businessName}": ${entry.new_value_status}`);
      }
    });

    console.log('✅ Status mais recentes carregados:', latestStatuses);
    return latestStatuses;
  } catch (error) {
    console.error('❌ Erro ao buscar status mais recentes:', error);
    return {};
  }
}

// Função para criar a aba de auditoria se não existir
export async function createAuditLogSheet() {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.log('GOOGLE_SPREADSHEET_ID não configurado');
      return false;
    }

    // Verifica se a aba já existe
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId
    });

    const auditSheetExists = spreadsheet.data.sheets?.some(
      sheet => sheet.properties?.title === 'Audit_Log'
    );

    if (auditSheetExists) {
      console.log('Aba Audit_Log já existe');
      return true;
    }

    // Cria a aba
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Audit_Log'
            }
          }
        }]
      }
    });

    // Adiciona cabeçalhos com as novas colunas de status
    const headers = [
      'ID',
      'Timestamp',
      'Action',
      'Entity_Type',
      'Entity_ID',
      'Entity_Name',
      'Old_Value',
      'New_Value',
      'Old_Value_Status',
      'New_Value_Status',
      'User_ID',
      'User_Name',
      'Details'
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Audit_Log!A1:M1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });

    console.log('✅ Aba Audit_Log criada com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar aba de auditoria:', error);
    return false;
  }
}

// Função para corrigir o cabeçalho do Audit_Log
export async function fixAuditLogHeader() {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.log('GOOGLE_SPREADSHEET_ID não configurado');
      return false;
    }

    // Cabeçalhos corretos com as novas colunas
    const correctHeaders = [
      'ID',
      'Timestamp',
      'Action',
      'Entity_Type',
      'Entity_ID',
      'Entity_Name',
      'Old_Value',
      'New_Value',
      'Old_Value_Status',
      'New_Value_Status',
      'User_ID',
      'User_Name',
      'Details'
    ];

    // Atualiza o cabeçalho
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Audit_Log!A1:M1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [correctHeaders]
      }
    });

    console.log('✅ Cabeçalho do Audit_Log corrigido com 13 colunas');
    return true;
  } catch (error) {
    console.error('❌ Erro ao corrigir cabeçalho do Audit_Log:', error);
    return false;
  }
}

// Função para limpar logs incorretos do Audit_Log
export async function cleanIncorrectAuditLogs() {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.log('GOOGLE_SPREADSHEET_ID não configurado');
      return false;
    }

    // Busca todos os dados atuais
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Audit_Log!A:M',
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      console.log('Audit_Log vazio ou só com cabeçalho');
      return true;
    }

    // Mantém apenas o cabeçalho e logs válidos de mudança de status do Kanban
    const validStages = ['Reunião Briefing', 'Agendamentos', 'Entrega Final'];
    const header = rows[0];
    const validRows = [header];

    // Filtra apenas logs válidos
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const action = row[2] || '';
      const oldValueStatus = row[8] || '';
      const newValueStatus = row[9] || '';

      // Mantém apenas logs de mudança de status com status válidos do Kanban
      if (action === 'business_stage_changed' &&
          validStages.includes(oldValueStatus) &&
          validStages.includes(newValueStatus)) {
        validRows.push(row);
      }
      // Mantém outros tipos de log que não sejam business_stage_changed
      else if (action !== 'business_stage_changed') {
        validRows.push(row);
      }
    }

    // Limpa toda a aba
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Audit_Log!A:M',
    });

    // Reinsere apenas os dados válidos
    if (validRows.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Audit_Log!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: validRows
        }
      });
    }

    const removedCount = (rows.length - 1) - (validRows.length - 1);
    console.log(`✅ Audit_Log limpo: ${removedCount} logs incorretos removidos, ${validRows.length - 1} logs válidos mantidos`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar Audit_Log:', error);
    return false;
  }
}

// Interface para dados dos criadores
export interface CreatorData {
  id: string;
  nome: string;
  status: string;
  whatsapp: string;
  cidade: string;
  instagram: string;
  seguidores: number;
  engajamento: number;
  categoria: string;
  email: string;
  observacoes: string;
}

// Função para buscar dados dos criadores da aba Criadores
export async function getCreatorsData(): Promise<CreatorData[]> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.log('GOOGLE_SPREADSHEET_ID não configurado, usando dados mock');
      return [];
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Criadores!A:J', // A=Nome, B=Status, C=WhatsApp, D=Cidade, E=Categoria, F=Engajamento, G=Instagram, H=Seguidores, I=Email, J=Observações
    });

    const values = response.data.values || [];

    if (values.length <= 1) {
      console.log('Aba Criadores vazia ou só com cabeçalho');
      return [];
    }

    // Debug: mostrar estrutura das primeiras linhas
    console.log('📊 Estrutura da aba Criadores:');
    console.log('Cabeçalho:', values[0]);
    if (values[1]) console.log('Primeira linha:', values[1]);
    if (values[2]) console.log('Segunda linha:', values[2]);

    // Mapear dados e filtrar apenas criadores válidos:
    // Estrutura: A=Nome, B=Status, C=WhatsApp, D=Cidade, E=Categoria, F=?, G=Instagram, H=Seguidores (mostrado na coluna "Seguidores")
    const creators: CreatorData[] = values.slice(1)
      .filter(row => {
        // Filtrar apenas linhas com nome válido e dados reais
        const nome = row[0] && row[0].trim();
        const temNomeValido = nome &&
                             nome !== 'Sem categoria' &&
                             nome !== '' &&
                             nome !== '-' &&
                             nome.length > 2; // Nome deve ter pelo menos 3 caracteres

        // Verificar se tem pelo menos um campo adicional preenchido
        const temOutrosDados = row.slice(1).some(cell => cell && cell.trim() !== '' && cell.trim() !== '-');

        return temNomeValido && temOutrosDados;
      })
      .map((row, index) => ({
        id: `creator-${index + 1}`,
        nome: row[0] || '', // Coluna A = Nome
        status: row[1] || 'Ativo', // Coluna B = Status
        whatsapp: row[2] || '', // Coluna C = WhatsApp
        cidade: row[3] || '', // Coluna D = Cidade
        categoria: row[4] || '', // Coluna E = Categoria
        engajamento: parseInt(row[7]) || 0, // Coluna H = Seguidores (mostrado como "Engajamento")
        instagram: row[6] || '', // Coluna G = Instagram
        seguidores: parseInt(row[7]) || 0, // Coluna H = Seguidores (duplicado para compatibilidade)
        email: row[8] || '', // Coluna I = Email
        observacoes: row[9] || '' // Coluna J = Observações
      }));

    console.log(`✅ ${creators.length} criadores carregados do Google Sheets (filtrados)`);
    return creators;
  } catch (error) {
    console.error('❌ Erro ao buscar criadores:', error);
    return [];
  }
}

// Interface para dados das campanhas
export interface CampaignData {
  id: string;
  nome: string;
  dataInicio: string;
  dataFim: string;
  orcamento: number;
  criadores: string;
  status: string;
  mes: string;
  descricao: string;
  resultados: string;
  observacoes: string;
  count?: number; // Para campanhas agrupadas
}

// Função para buscar dados das campanhas da aba Campanhas
export async function getCampaignsData(): Promise<CampaignData[]> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.log('GOOGLE_SPREADSHEET_ID não configurado, usando dados mock');
      return [];
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:J', // A=Nome, B=DataInicio, C=DataFim, D=Orçamento, E=Criadores, F=Status, G=Mês, H=Descrição, I=Resultados, J=Observações
    });

    const values = response.data.values || [];

    if (values.length <= 1) {
      console.log('Aba Campanhas vazia ou só com cabeçalho');
      return [];
    }

    // Debug: mostrar estrutura das primeiras linhas
    console.log('📊 Estrutura da aba Campanhas:');
    console.log('Cabeçalho:', values[0]);
    if (values[1]) console.log('Primeira linha:', values[1]);

    // Mapear dados com estrutura corrigida
    const rawCampaigns: CampaignData[] = values.slice(1)
      .filter(row => {
        // Filtrar apenas linhas com nome válido
        const nome = row[0] && row[0].trim();
        const temNomeValido = nome &&
                             nome !== '' &&
                             nome !== '-' &&
                             nome.length > 2;

        return temNomeValido;
      })
      .map((row, index) => ({
        id: `campaign-${index + 1}`,
        nome: row[0] || '', // Coluna A = Nome
        dataInicio: row[1] || '', // Coluna B = Data Início
        dataFim: row[2] || '', // Coluna C = Data Fim
        orcamento: parseFloat(row[3]) || 0, // Coluna D = Orçamento
        criadores: row[4] || '', // Coluna E = Criadores
        status: row[5] || 'Ativa', // Coluna F = Status (CORRIGIDO)
        mes: row[6] || '', // Coluna G = Mês
        descricao: row[7] || '', // Coluna H = Descrição
        resultados: row[8] || '', // Coluna I = Resultados
        observacoes: row[9] || '' // Coluna J = Observações
      }));

    // Agrupar campanhas por nome e mês
    const groupedCampaigns = new Map<string, CampaignData>();

    rawCampaigns.forEach(campaign => {
      const groupKey = `${campaign.nome.toLowerCase()}-${campaign.mes.toLowerCase()}`;

      if (groupedCampaigns.has(groupKey)) {
        // Se já existe, somar orçamento e incrementar contador
        const existing = groupedCampaigns.get(groupKey)!;
        existing.orcamento += campaign.orcamento;
        existing.count = (existing.count || 1) + 1;

        // Combinar criadores se diferentes
        if (campaign.criadores && !existing.criadores.includes(campaign.criadores)) {
          existing.criadores = existing.criadores ?
            `${existing.criadores}, ${campaign.criadores}` :
            campaign.criadores;
        }

        // Combinar descrições se diferentes
        if (campaign.descricao && !existing.descricao.includes(campaign.descricao)) {
          existing.descricao = existing.descricao ?
            `${existing.descricao} | ${campaign.descricao}` :
            campaign.descricao;
        }
      } else {
        // Primeira ocorrência do grupo
        groupedCampaigns.set(groupKey, {
          ...campaign,
          count: 1
        });
      }
    });

    const campaigns = Array.from(groupedCampaigns.values());

    console.log(`✅ ${campaigns.length} campanhas carregadas do Google Sheets`);
    return campaigns;
  } catch (error) {
    console.error('❌ Erro ao buscar campanhas:', error);
    return [];
  }
}

// Função para adicionar novo negócio ao Google Sheets
export async function addBusinessToSheet(businessData: any[]): Promise<void> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    console.log('📝 Adicionando novo negócio ao Google Sheets...');

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Business!A:P', // Colunas A-P conforme cabeçalho real
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [businessData]
      }
    });

    console.log('✅ Negócio adicionado com sucesso:', response.data);

    // Registrar no log de auditoria com status "Reunião Briefing"
    await logAction({
      action: 'business_created',
      entity_type: 'business',
      entity_id: `business_${Date.now()}`,
      entity_name: businessData[0], // Nome do negócio (coluna A)
      old_value: '',
      new_value: 'Reunião Briefing',
      old_value_status: '',
      new_value_status: 'Reunião Briefing',
      user_id: '1',
      user_name: 'Luiz Vincenzi',
      details: `Novo negócio criado: ${businessData[0]} - Status inicial: Reunião Briefing`
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar negócio:', error);
    throw error;
  }
}

// Função para adicionar dados à planilha
export async function appendData(sheetName: string, rowData: any[]) {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não está configurado');
    }

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar dados à planilha:', error);
    throw new Error('Falha ao adicionar dados à planilha');
  }
}

// Função para atualizar dados na planilha
export async function updateData(sheetName: string, range: string, rowData: any[]) {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não está configurado');
    }

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!${range}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [rowData],
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar dados da planilha:', error);
    throw new Error('Falha ao atualizar dados da planilha');
  }
}

// Função específica para atualizar o estágio da jornada de um negócio
export async function updateBusinessStage(businessId: string, newStage: string, businessData?: any) {
  try {
    // Se Google Sheets não estiver configurado, simula sucesso
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.log(`Simulando atualização: Negócio ${businessId} movido para ${newStage}`);
      return { success: true, message: 'Atualização simulada com sucesso' };
    }

    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Primeiro, busca todos os dados para encontrar a linha do negócio
    const allData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Businesses!A:Z',
    });

    const rows = allData.data.values || [];
    if (rows.length === 0) {
      throw new Error('Nenhum dado encontrado na planilha');
    }

    // Encontra a linha do negócio pelo ID
    const headers = rows[0];
    const idColumnIndex = headers.findIndex((header: string) =>
      header.toLowerCase().includes('id')
    );
    const stageColumnIndex = headers.findIndex((header: string) =>
      header.toLowerCase().includes('stage') || header.toLowerCase().includes('estágio')
    );

    if (idColumnIndex === -1 || stageColumnIndex === -1) {
      throw new Error('Colunas ID ou Stage não encontradas');
    }

    // Procura pela linha do negócio
    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idColumnIndex] === businessId) {
        targetRowIndex = i + 1; // +1 porque as linhas do Sheets são 1-indexed
        break;
      }
    }

    if (targetRowIndex === -1) {
      throw new Error(`Negócio com ID ${businessId} não encontrado`);
    }

    // Atualiza apenas a célula do estágio
    const stageColumn = String.fromCharCode(65 + stageColumnIndex); // Converte índice para letra (A, B, C...)
    const range = `${stageColumn}${targetRowIndex}`;

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Businesses!${range}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newStage]],
      },
    });

    // Se o novo estágio for "Agendamentos", criar evento no calendário
    if (newStage === 'Agendamentos' && businessData) {
      try {
        const { createSchedulingEvent } = await import('./calendarActions');
        await createSchedulingEvent(businessData);
        console.log(`Evento de agendamento criado para ${businessData.businessName}`);
      } catch (calendarError) {
        console.error('Erro ao criar evento no calendário:', calendarError);
        // Não falha a operação principal se o calendário falhar
      }
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Erro ao atualizar estágio do negócio:', error);
    throw new Error('Falha ao atualizar estágio do negócio');
  }
}

// ===== SISTEMA DE AUTENTICAÇÃO E USUÁRIOS =====

interface UserData {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  created_at: string;
  last_login?: string;
}

// Função para criar a aba Users se não existir
export async function createUsersSheet(): Promise<boolean> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.log('GOOGLE_SPREADSHEET_ID não configurado');
      return false;
    }

    // Verifica se a aba Users já existe
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const existingSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === 'Users'
    );

    if (existingSheet) {
      console.log('✅ Aba Users já existe');
      return true;
    }

    // Cria a aba Users
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Users',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 8
                }
              }
            }
          }
        ]
      }
    });

    // Adiciona cabeçalhos
    const headers = [
      'ID',
      'Email',
      'Password',
      'Name',
      'Role',
      'Status',
      'Created_At',
      'Last_Login'
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Users!A1:H1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers]
      }
    });

    // Adiciona usuário admin padrão
    const defaultAdmin = [
      'admin_001',
      'luizvincenzi@gmail.com',
      'admin123', // Em produção, usar hash
      'Luiz Vincenzi',
      'admin',
      'active',
      new Date().toISOString(),
      ''
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Users!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [defaultAdmin]
      }
    });

    console.log('✅ Aba Users criada com sucesso');
    return true;

  } catch (error) {
    console.error('❌ Erro ao criar aba Users:', error);
    return false;
  }
}

// Função para buscar usuário por email
export async function getUserByEmail(email: string): Promise<UserData | null> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.log('GOOGLE_SPREADSHEET_ID não configurado');
      return null;
    }

    // Busca todos os dados da aba Users
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:H',
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      console.log('Aba Users vazia ou só com cabeçalho');
      return null;
    }

    // Procura pelo usuário com o email fornecido
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1] && row[1].toLowerCase() === email.toLowerCase()) {
        return {
          id: row[0] || '',
          email: row[1] || '',
          password: row[2] || '',
          name: row[3] || '',
          role: (row[4] as 'admin' | 'user') || 'user',
          status: (row[5] as 'active' | 'inactive') || 'inactive',
          created_at: row[6] || '',
          last_login: row[7] || undefined
        };
      }
    }

    return null;

  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return null;
  }
}

// Função para validar login
export async function validateLogin(email: string, password: string): Promise<UserData | null> {
  try {
    // Garante que a aba Users existe
    await createUsersSheet();

    const user = await getUserByEmail(email);

    if (!user) {
      console.log('Usuário não encontrado:', email);
      return null;
    }

    if (user.status !== 'active') {
      console.log('Usuário inativo:', email);
      return null;
    }

    // Validação simples de senha (em produção, usar hash)
    if (user.password !== password) {
      console.log('Senha incorreta para:', email);
      return null;
    }

    // Atualiza último login
    await updateUserLastLogin(user.id);

    // Log da ação
    await logAction({
      action: 'user_login',
      entity_type: 'user',
      entity_id: user.id,
      entity_name: user.name,
      user_id: user.id,
      user_name: user.name,
      details: `Login realizado - ${user.email} (${user.role})`
    });

    return user;

  } catch (error) {
    console.error('❌ Erro ao validar login:', error);
    return null;
  }
}

// Função para atualizar último login do usuário
export async function updateUserLastLogin(userId: string): Promise<boolean> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return false;
    }

    // Busca todos os dados para encontrar a linha do usuário
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:H',
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      return false;
    }

    // Encontra a linha do usuário
    let targetRowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === userId) {
        targetRowIndex = i + 1; // +1 porque as linhas do Sheets são 1-indexed
        break;
      }
    }

    if (targetRowIndex === -1) {
      return false;
    }

    // Atualiza a coluna H (Last_Login)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Users!H${targetRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[new Date().toISOString()]]
      }
    });

    return true;

  } catch (error) {
    console.error('❌ Erro ao atualizar último login:', error);
    return false;
  }
}
