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

// Função helper para criar cliente Google Sheets (para uso em APIs)
export async function createGoogleSheetsClient() {
  const auth = getGoogleSheetsAuth();
  return google.sheets({ version: 'v4', auth });
}

// ==========================================
// SISTEMA DE IDs ÚNICOS
// ==========================================

/**
 * Gera um ID único para Business
 * Formato: bus_[timestamp]_[random]_[nome_normalizado]
 */
export async function generateBusinessId(businessName: string): Promise<string> {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const normalizedName = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10);

  return `bus_${timestamp}_${random}_${normalizedName}`;
}

/**
 * Gera um ID único para Criador
 * Formato: crt_[timestamp]_[random]_[nome_normalizado]
 */
export async function generateCreatorId(creatorName: string): Promise<string> {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const normalizedName = creatorName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10);

  return `crt_${timestamp}_${random}_${normalizedName}`;
}

/**
 * Busca Business ID pelo nome (para migração)
 */
export async function findBusinessIdByName(businessName: string): Promise<string | null> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) return null;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Business!A:R', // Incluindo coluna R (business_id)
    });

    const values = response.data.values || [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const nome = row[0]?.toString().trim();
      const businessId = row[17]; // Coluna R (business_id)

      if (nome === businessName.trim() && businessId) {
        return businessId;
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar Business ID:', error);
    return null;
  }
}

/**
 * Busca Criador ID pelo nome (para migração)
 */
export async function findCreatorIdByName(creatorName: string): Promise<string | null> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) return null;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Criadores!A:V', // Incluindo coluna V (criador_id)
    });

    const values = response.data.values || [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const nome = row[0]?.toString().trim();
      const criadorId = row[21]; // Coluna V (criador_id)

      if (nome === creatorName.trim() && criadorId) {
        return criadorId;
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar Criador ID:', error);
    return null;
  }
}

/**
 * Busca Business ou Creator por ID (função universal)
 */
export async function findEntityById(entityId: string, entityType: 'business' | 'creator'): Promise<any | null> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) return null;

    let range: string;
    let idColumn: number;

    if (entityType === 'business') {
      range = 'Business!A:R';
      idColumn = 17; // Coluna R (business_id)
    } else {
      range = 'Criadores!A:V';
      idColumn = 21; // Coluna V (criador_id)
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const values = response.data.values || [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const currentId = row[idColumn];

      if (currentId === entityId) {
        return {
          row: i + 1,
          data: row,
          nome: row[0]?.toString().trim()
        };
      }
    }

    return null;
  } catch (error) {
    console.error(`Erro ao buscar ${entityType} por ID:`, error);
    return null;
  }
}

/**
 * Busca híbrida: tenta por ID primeiro, depois por nome
 */
export async function findCreatorHybrid(identifier: string): Promise<any | null> {
  // Se o identifier parece um ID (começa com crt_), busca por ID
  if (identifier.startsWith('crt_')) {
    return await findEntityById(identifier, 'creator');
  }

  // Senão, busca por nome (método antigo para compatibilidade)
  const creatorId = await findCreatorIdByName(identifier);
  if (creatorId) {
    return await findEntityById(creatorId, 'creator');
  }

  return null;
}

/**
 * Busca híbrida: tenta por ID primeiro, depois por nome
 */
export async function findBusinessHybrid(identifier: string): Promise<any | null> {
  // Se o identifier parece um ID (começa com bus_), busca por ID
  if (identifier.startsWith('bus_')) {
    return await findEntityById(identifier, 'business');
  }

  // Senão, busca por nome (método antigo para compatibilidade)
  const businessId = await findBusinessIdByName(identifier);
  if (businessId) {
    return await findEntityById(businessId, 'business');
  }

  return null;
}

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

// Interface para dados completos do business - TODOS os campos da planilha
export interface BusinessData {
  id: string;
  nome: string;                    // A = Nome
  categoria: string;               // B = Categoria
  planoAtual: string;              // C = Plano atual
  comercial: string;               // D = Comercial
  nomeResponsavel: string;         // E = Nome Responsável
  cidade: string;                  // F = Cidade
  whatsappResponsavel: string;     // G = WhatsApp Responsável
  prospeccao: string;              // H = Prospecção
  responsavel: string;             // I = Responsável
  instagram: string;               // J = Instagram
  grupoWhatsappCriado: string;     // K = Grupo WhatsApp criado
  contratoAssinadoEnviado: string; // L = Contrato assinado e enviado
  dataAssinaturaContrato: string;  // M = Data assinatura do contrato
  contratoValidoAte: string;       // N = Contrato válido até
  relatedFiles: string;            // O = Related files
  notes: string;                   // P = Notes
  // Coluna Q reservada para expansão futura
  businessId: string;              // R = business_id (CHAVE PRIMÁRIA)
  quantidadeCriadores: string;     // Q = Quantidade de criadores
  row: number;                     // Linha na planilha

  // Campos para compatibilidade com código existente
  plano: string;
  valor: string;
  descricao: string;
  status: string;
  whatsapp: string;
  email: string;
  observacoes: string;
  dataInicio: string;
  dataFim: string;
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
      range: 'Business!A:R', // A=Nome, B=Categoria, C=Plano atual, D=Comercial, E=Nome Responsável, F=Cidade, G=WhatsApp Responsável, H=Prospecção, I=Responsável, J=Instagram, K=Grupo WhatsApp criado, L=Contrato assinado e enviado, M=Data assinatura do contrato, N=Contrato válido até, O=Related files, P=Notes, Q=Quantidade de criadores, R=business_id
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
        // Campos principais da planilha
        nome: row[0] || '',                    // A = Nome
        categoria: row[1] || '',               // B = Categoria
        planoAtual: row[2] || '',              // C = Plano atual
        comercial: row[3] || '',               // D = Comercial
        nomeResponsavel: row[4] || '',         // E = Nome Responsável
        cidade: row[5] || '',                  // F = Cidade
        whatsappResponsavel: row[6] || '',     // G = WhatsApp Responsável
        prospeccao: row[7] || '',              // H = Prospecção
        responsavel: row[8] || '',             // I = Responsável
        instagram: row[9] || '',               // J = Instagram
        grupoWhatsappCriado: row[10] || '',    // K = Grupo WhatsApp criado
        contratoAssinadoEnviado: row[11] || '', // L = Contrato assinado e enviado
        dataAssinaturaContrato: row[12] || '', // M = Data assinatura do contrato
        contratoValidoAte: row[13] || '',      // N = Contrato válido até
        relatedFiles: row[14] || '',           // O = Related files
        notes: row[15] || '',                  // P = Notes
        quantidadeCriadores: row[16] || '',    // Q = Quantidade de criadores
        businessId: row[17] || '',             // R = business_id (CHAVE PRIMÁRIA)
        row: index + 2,

        // Campos para compatibilidade com código existente
        plano: row[2] || '',                   // Usar Plano atual
        valor: row[3] || '',                   // Usar Comercial como valor
        descricao: row[15] || '',              // Usar Notes como descrição
        status: 'Ativo',                      // Status padrão
        whatsapp: row[6] || '',                // Usar WhatsApp Responsável
        email: '',                             // Não disponível na nova estrutura
        observacoes: row[15] || '',            // Usar Notes como observações
        dataInicio: row[12] || '',             // Usar Data assinatura do contrato
        dataFim: row[13] || ''                 // Usar Contrato válido até
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

// Interface para log de auditoria expandida
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
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  business_context?: string;
  campaign_context?: string;
  creator_context?: string;
  field_changed?: string;
  change_reason?: string;
  validation_status?: string;
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

// Interface para dados dos criadores - TODOS os campos da planilha
export interface CreatorData {
  id: string;
  nome: string;                           // A = Nome
  status: string;                         // B = Status
  whatsapp: string;                       // C = WhatsApp
  cidade: string;                         // D = Cidade
  prospeccao: string;                     // E = Prospecção
  responsavel: string;                    // F = Responsável
  instagram: string;                      // G = Instagram
  seguidoresInstagram: string;            // H = Seguidores instagram - Maio 2025
  tiktok: string;                         // I = TikTok
  seguidoresTiktok: string;               // J = Seguidores TikTok - julho 25
  onboardingInicial: string;              // K = Onboarding Inicial
  startDate: string;                      // L = Start date
  endDate: string;                        // M = End date
  relatedFiles: string;                   // N = Related files
  notes: string;                          // O = Notes
  perfil: string;                         // P = Perfil
  preferencias: string;                   // Q = Preferências
  naoAceita: string;                      // R = Não aceita
  descricaoCriador: string;               // S = Descrição do criador
  biografia: string;                      // T = Biografia
  categoria: string;                      // U = Categoria
  criadorId: string;                      // V = criador_id (CHAVE PRIMÁRIA)

  // Campos calculados para compatibilidade
  seguidores: number;
  engajamento: number;
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
      range: 'Criadores!A:V', // A=Nome, B=Status, C=WhatsApp, D=Cidade, E=Prospecção, F=Responsável, G=Instagram, H=Seguidores instagram - Maio 2025, I=TikTok, J=Seguidores TikTok - julho 25, K=Onboarding Inicial, L=Start date, M=End date, N=Related files, O=Notes, P=Perfil, Q=Preferências, R=Não aceita, S=Descrição do criador, T=Biografia, U=Categoria, V=criador_id
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
    // Estrutura completa: A=Nome, B=Status, C=WhatsApp, D=Cidade, E=Prospecção, F=Responsável, G=Instagram, H=Seguidores instagram - Maio 2025, I=TikTok, J=Seguidores TikTok - julho 25, K=Onboarding Inicial, L=Start date, M=End date, N=Related files, O=Notes, P=Perfil, Q=Preferências, R=Não aceita, S=Descrição do criador
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
        // Campos principais da planilha
        nome: row[0] || '',                           // A = Nome
        status: row[1] || 'Ativo',                    // B = Status
        whatsapp: row[2] || '',                       // C = WhatsApp
        cidade: row[3] || '',                         // D = Cidade
        prospeccao: row[4] || '',                     // E = Prospecção
        responsavel: row[5] || '',                    // F = Responsável
        instagram: row[6] || '',                      // G = Instagram
        seguidoresInstagram: row[7] || '',            // H = Seguidores instagram - Maio 2025
        tiktok: row[8] || '',                         // I = TikTok
        seguidoresTiktok: row[9] || '',               // J = Seguidores TikTok - julho 25
        onboardingInicial: row[10] || '',             // K = Onboarding Inicial
        startDate: row[11] || '',                     // L = Start date
        endDate: row[12] || '',                       // M = End date
        relatedFiles: row[13] || '',                  // N = Related files
        notes: row[14] || '',                         // O = Notes
        perfil: row[15] || '',                        // P = Perfil
        preferencias: row[16] || '',                  // Q = Preferências
        naoAceita: row[17] || '',                     // R = Não aceita
        descricaoCriador: row[18] || '',              // S = Descrição do criador
        biografia: row[19] || '',                     // T = Biografia
        categoria: row[20] || '',                     // U = Categoria
        criadorId: row[21] || '',                     // V = criador_id (CHAVE PRIMÁRIA)

        // Campos calculados para compatibilidade com código existente
        seguidores: parseInt(row[7]?.replace(/[^\d]/g, '')) || 0, // Seguidores do Instagram
        engajamento: 0, // Pode ser calculado posteriormente
        email: '', // Não disponível na nova estrutura
        observacoes: row[14] || '' // Usar Notes como observações
      }));

    console.log(`✅ ${creators.length} criadores carregados do Google Sheets (filtrados)`);
    return creators;
  } catch (error) {
    console.error('❌ Erro ao buscar criadores:', error);
    return [];
  }
}

// Interface para campanhas agrupadas por business e mês
export interface GroupedCampaignData {
  id: string;
  businessName: string;
  mes: string;
  status: string;
  quantidadeCriadores: number;
  criadores: string[];
  campanhas: CampaignData[];
  totalCampanhas: number;
}

// Interface para jornada de campanhas (campanhas ativas por business/mês)
export interface CampaignJourneyData {
  id: string;
  businessName: string;
  mes: string;
  journeyStage: 'Reunião de briefing' | 'Agendamentos' | 'Entrega final';
  campanhas: CampaignData[];
  totalCampanhas: number;
  quantidadeCriadores: number;
  businessData?: BusinessData; // Dados do business para informações adicionais
  campaignIds: string[]; // Array com todos os Campaign_IDs das campanhas deste grupo
  primaryCampaignId?: string; // Campaign_ID principal (primeira campanha do grupo)
}

// Interface para dados das campanhas - TODOS os campos da planilha
export interface CampaignData {
  id: string;
  campanha: string;                           // A = Campanha
  business: string;                           // B = Business
  influenciador: string;                      // C = Influenciador
  responsavel: string;                        // D = Responsável
  status: string;                             // E = Status
  mes: string;                                // F = Mês
  fim: string;                                // G = FIM
  briefingCompleto: string;                   // H = Briefing completo enviado para o influenciador?
  dataHoraVisita: string;                     // I = Data e hora Visita
  quantidadeConvidados: string;               // J = Quantidade de convidados
  visitaConfirmado: string;                   // K = Visita Confirmado
  dataHoraPostagem: string;                   // L = Data e hora da Postagem
  videoAprovado: string;                      // M = Vídeo aprovado?
  videoPostado: string;                       // N = Video/Reels postado?
  linkVideoInstagram: string;                 // O = Link Video Instagram
  notas: string;                              // P = Notas
  arquivo: string;                            // Q = Arquivo
  avaliacaoRestaurante: string;               // R = Avaliação Restaurante
  avaliacaoInfluenciador: string;             // S = Avaliação Influenciador
  statusCalendario: string;                   // T = Status do Calendário
  column22: string;                           // U = Column 22
  idEvento: string;                           // V = ID do Evento
  formato: string;                            // W = Formato
  perfilCriador: string;                      // X = Perfil do criador
  objetivo: string;                           // Y = Objetivo
  comunicacaoSecundaria: string;              // Z = Comunicação secundária
  datasHorariosGravacao: string;              // AA = Datas e horários para gravação
  oQuePrecisaSerFalado: string;               // AB = O que precisa ser falado no vídeo (de forma natural) - História
  promocaoCTA: string;                        // AC = Promoção CTA
  column31: string;                           // AD = Column 31
  objetivo1: string;                          // AE = Objetivo 1

  // Campos para compatibilidade com código existente
  nome: string;
  dataInicio: string;
  dataFim: string;
  orcamento: number;
  criadores: string;
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
      range: 'Campanhas!A:AE', // A=Campaign_ID, B=business_id, C=criador_id, D=Responsável, E=Status, F=Mês, G=FIM, H=Briefing completo enviado para o influenciador?, I=Data e hora Visita, J=Quantidade de convidados, K=Visita Confirmado, L=Data e hora da Postagem, M=Vídeo aprovado?, N=Video/Reels postado?, O=Link Video Instagram, P=Notas, Q=Arquivo, R=Avaliação Restaurante, S=Avaliação Influenciador, T=Status do Calendário, U=Column 22, V=ID do Evento, W=Formato, X=Perfil do criador, Y=Objetivo, Z=Comunicação secundária, AA=Datas e horários para gravação, AB=O que precisa ser falado no vídeo (de forma natural) - História, AC=Promoção CTA, AD=Column 31, AE=Objetivo 1
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
        id: row[0] || `campaign-${index + 1}`,            // A = Campaign_ID
        // Campos principais da planilha
        campanha: row[0] || '',                           // A = Campaign_ID (usar como nome da campanha)
        business: row[1] || '',                           // B = business_id (será resolvido para nome)
        influenciador: row[2] || '',                      // C = criador_id (será resolvido para nome)
        responsavel: row[3] || '',                        // D = Responsável
        status: row[4] || 'Ativa',                        // E = Status
        mes: row[5] || '',                                // F = Mês
        fim: row[6] || '',                                // G = FIM
        briefingCompleto: row[7] || '',                   // H = Briefing completo enviado para o influenciador?
        dataHoraVisita: row[8] || '',                     // I = Data e hora Visita
        quantidadeConvidados: row[9] || '',               // J = Quantidade de convidados
        visitaConfirmado: row[10] || '',                  // K = Visita Confirmado
        dataHoraPostagem: row[11] || '',                  // L = Data e hora da Postagem
        videoAprovado: row[12] || '',                     // M = Vídeo aprovado?
        videoPostado: row[13] || '',                      // N = Video/Reels postado?
        linkVideoInstagram: row[14] || '',                // O = Link Video Instagram
        notas: row[15] || '',                             // P = Notas
        arquivo: row[16] || '',                           // Q = Arquivo
        avaliacaoRestaurante: row[17] || '',              // R = Avaliação Restaurante
        avaliacaoInfluenciador: row[18] || '',            // S = Avaliação Influenciador
        statusCalendario: row[19] || '',                  // T = Status do Calendário
        column22: row[20] || '',                          // U = Column 22
        idEvento: row[21] || '',                          // V = ID do Evento
        formato: row[22] || '',                           // W = Formato
        perfilCriador: row[23] || '',                     // X = Perfil do criador
        objetivo: row[24] || '',                          // Y = Objetivo
        comunicacaoSecundaria: row[25] || '',             // Z = Comunicação secundária
        datasHorariosGravacao: row[26] || '',             // AA = Datas e horários para gravação
        oQuePrecisaSerFalado: row[27] || '',              // AB = O que precisa ser falado no vídeo (de forma natural) - História
        promocaoCTA: row[28] || '',                       // AC = Promoção CTA
        column31: row[29] || '',                          // AD = Column 31
        objetivo1: row[30] || '',                         // AE = Objetivo 1

        // Campos para compatibilidade com código existente
        nome: row[0] || '',                               // Usar campanha como nome
        dataInicio: row[8] || '',                         // Usar data e hora visita
        dataFim: row[6] || '',                            // Usar FIM
        orcamento: 0,                                     // Não disponível na nova estrutura
        criadores: row[2] || '',                          // Usar influenciador
        descricao: row[15] || '',                         // Usar notas
        resultados: row[17] || '',                        // Usar avaliação restaurante
        observacoes: row[15] || ''                        // Usar notas
      }));

    // Resolver IDs para nomes legíveis
    const [businessesData, criadoresData] = await Promise.all([
      getBusinessesData(),
      getCreatorsData()
    ]);

    // Resolver business_id para nome
    rawCampaigns.forEach(campaign => {
      if (campaign.business && campaign.business.startsWith('bus_')) {
        const businessData = businessesData.find(b => b.businessId === campaign.business);
        if (businessData) {
          campaign.business = businessData.nome;
        }
      }

      // Resolver criador_id para nome
      if (campaign.influenciador && campaign.influenciador.startsWith('crt_')) {
        const criadorData = criadoresData.find(c => c.criadorId === campaign.influenciador);
        if (criadorData) {
          campaign.influenciador = criadorData.nome;
        }
      }
    });

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

// Função para buscar dados brutos das campanhas (sem agrupamento)
export async function getRawCampaignsData(): Promise<CampaignData[]> {
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
      range: 'Campanhas!A:AE',
    });

    const values = response.data.values || [];

    if (values.length <= 1) {
      console.log('Aba Campanhas vazia ou só com cabeçalho');
      return [];
    }

    // Verificar se a primeira linha tem ID (indicando nova estrutura)
    const hasIdColumn = values.length > 0 && values[0][0] && values[0][0].toLowerCase().includes('id');

    console.log(`📊 Estrutura da planilha: ${hasIdColumn ? 'COM' : 'SEM'} coluna ID`);

    // Mapear dados SEM agrupamento
    const rawCampaigns: CampaignData[] = values.slice(1)
      .filter(row => {
        if (hasIdColumn) {
          // Nova estrutura com ID na coluna A
          const campaignId = row[0] && row[0].trim();
          const business = row[2] && row[2].trim(); // Coluna C
          const influenciador = row[3] && row[3].trim(); // Coluna D
          const mes = row[6] && row[6].trim(); // Coluna G

          return campaignId && campaignId !== '' &&
                 business && business !== '' && business !== '-' &&
                 influenciador && influenciador !== '' && influenciador !== '-' &&
                 mes && mes !== '' && mes !== '-';
        } else {
          // Estrutura antiga sem ID
          const business = row[1] && row[1].trim();
          const influenciador = row[2] && row[2].trim();
          const mes = row[5] && row[5].trim();

          return business && business !== '' && business !== '-' &&
                 influenciador && influenciador !== '' && influenciador !== '-' &&
                 mes && mes !== '' && mes !== '-';
        }
      })
      .map((row, index) => {
        if (hasIdColumn) {
          // Nova estrutura com ID
          return {
            id: row[0] || `raw-campaign-${index + 1}`,
            campaignId: row[0] || '',
            campanha: row[1] || '',
            business: row[2] || '',
            influenciador: row[3] || '',
            responsavel: row[4] || '',
            status: row[5] || 'Ativa',
            mes: row[6] || '',
            fim: row[7] || '',
            briefingCompleto: row[8] || '',
            dataHoraVisita: row[9] || '',
            quantidadeConvidados: row[10] || '',
            visitaConfirmado: row[11] || '',
            dataHoraPostagem: row[12] || '',
            videoAprovado: row[13] || '',
            videoPostado: row[14] || '',
            linkVideoInstagram: row[15] || '',
            notas: row[16] || '',
            arquivo: row[17] || '',
            avaliacaoRestaurante: row[18] || '',
            avaliacaoInfluenciador: row[19] || '',
            statusCalendario: row[20] || '',
            column22: row[21] || '',
            idEvento: row[22] || '',
            formato: row[23] || '',
            perfilCriador: row[24] || '',
            objetivo: row[25] || '',
            comunicacaoSecundaria: row[26] || '',
            datasHorariosGravacao: row[27] || '',
            oQuePrecisaSerFalado: row[28] || '',
            promocaoCTA: row[29] || '',
            column31: row[30] || '',
            objetivo1: row[31] || '',
            nome: row[1] || '',
            dataInicio: row[9] || '',
            dataFim: row[7] || '',
            orcamento: 0,
            criadores: row[3] || '',
            descricao: row[16] || '',
            resultados: row[18] || '',
            observacoes: row[16] || ''
          };
        } else {
          // Estrutura antiga sem ID
          return {
            id: `raw-campaign-${index + 1}`,
            campaignId: '',
            campanha: row[0] || '',
            business: row[1] || '',
            influenciador: row[2] || '',
            responsavel: row[3] || '',
            status: row[4] || 'Ativa',
            mes: row[5] || '',
            fim: row[6] || '',
            briefingCompleto: row[7] || '',
            dataHoraVisita: row[8] || '',
            quantidadeConvidados: row[9] || '',
            visitaConfirmado: row[10] || '',
            dataHoraPostagem: row[11] || '',
            videoAprovado: row[12] || '',
            videoPostado: row[13] || '',
            linkVideoInstagram: row[14] || '',
            notas: row[15] || '',
            arquivo: row[16] || '',
            avaliacaoRestaurante: row[17] || '',
            avaliacaoInfluenciador: row[18] || '',
            statusCalendario: row[19] || '',
            column22: row[20] || '',
            idEvento: row[21] || '',
            formato: row[22] || '',
            perfilCriador: row[23] || '',
            objetivo: row[24] || '',
            comunicacaoSecundaria: row[25] || '',
            datasHorariosGravacao: row[26] || '',
            oQuePrecisaSerFalado: row[27] || '',
            promocaoCTA: row[28] || '',
            column31: row[29] || '',
            objetivo1: row[30] || '',
            nome: row[0] || '',
            dataInicio: row[8] || '',
            dataFim: row[6] || '',
            orcamento: 0,
            criadores: row[2] || '',
            descricao: row[15] || '',
            resultados: row[17] || '',
            observacoes: row[15] || ''
          };
        }
      });

    console.log(`✅ ${rawCampaigns.length} campanhas brutas carregadas (sem agrupamento)`);
    return rawCampaigns;

  } catch (error) {
    console.error('❌ Erro ao buscar campanhas brutas:', error);
    return [];
  }
}

// Função para gerar ID único de criador baseado em múltiplos campos
function generateCreatorUniqueId(creatorData: any): string {
  const business = creatorData.business || '';
  const mes = creatorData.mes || '';
  const influenciador = creatorData.influenciador || '';
  const responsavel = creatorData.responsavel || '';

  // Criar ID único baseado em business + mês + influenciador
  const baseId = `${business}_${mes}_${influenciador}`.toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  return `creator_${baseId}`;
}

// Função helper async para gerar ID único (para uso em APIs)
export async function createCreatorUniqueId(creatorData: any): Promise<string> {
  return generateCreatorUniqueId(creatorData);
}

// Função para garantir que a aba Campanhas tenha coluna ID única
export async function ensureCampaignUniqueIds(): Promise<boolean> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return false;
    }

    // Buscar dados atuais da aba Campanhas
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:AE',
    });

    const values = response.data.values || [];

    if (values.length === 0) {
      console.log('Aba Campanhas vazia');
      return false;
    }

    const headers = values[0] || [];

    // Verificar se já existe coluna ID (primeira coluna)
    if (headers[0] && headers[0].toLowerCase().includes('id')) {
      console.log('✅ Coluna ID já existe na aba Campanhas');
      return true;
    }

    console.log('🔧 Adicionando coluna ID única na aba Campanhas...');

    // Inserir nova coluna no início
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          insertDimension: {
            range: {
              sheetId: 0, // Assumindo que Campanhas é a primeira aba
              dimension: 'COLUMNS',
              startIndex: 0,
              endIndex: 1
            },
            inheritFromBefore: false
          }
        }]
      }
    });

    // Adicionar cabeçalho ID
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Campanhas!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Campaign_ID']]
      }
    });

    // Gerar IDs únicos para todas as linhas existentes
    const idsToAdd = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const business = row[1] || ''; // Agora será coluna B (era A)
      const influenciador = row[2] || ''; // Agora será coluna C (era B)
      const mes = row[5] || ''; // Agora será coluna F (era E)

      // Gerar ID único baseado em timestamp + dados da campanha
      const uniqueId = `camp_${Date.now()}_${i}_${business.toLowerCase().replace(/[^a-z0-9]/g, '')}_${mes.toLowerCase().replace(/[^a-z0-9]/g, '')}_${influenciador.toLowerCase().replace(/[^a-z0-9]/g, '')}`.substring(0, 50);

      idsToAdd.push([uniqueId]);
    }

    // Adicionar IDs em lote
    if (idsToAdd.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Campanhas!A2:A${idsToAdd.length + 1}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: idsToAdd
        }
      });
    }

    console.log(`✅ ${idsToAdd.length} IDs únicos adicionados na aba Campanhas`);
    return true;

  } catch (error) {
    console.error('❌ Erro ao adicionar IDs únicos:', error);
    return false;
  }
}

// Função para gerar ID único para nova campanha
function generateNewCampaignId(business: string, mes: string, influenciador: string): string {
  const timestamp = Date.now();
  const businessClean = business.toLowerCase().replace(/[^a-z0-9]/g, '');
  const mesClean = mes.toLowerCase().replace(/[^a-z0-9]/g, '');
  const influenciadorClean = influenciador.toLowerCase().replace(/[^a-z0-9]/g, '');

  return `camp_${timestamp}_${businessClean}_${mesClean}_${influenciadorClean}`.substring(0, 50);
}

// Função helper async para gerar ID de campanha (para uso em APIs)
export async function createNewCampaignId(business: string, mes: string, influenciador: string): Promise<string> {
  return generateNewCampaignId(business, mes, influenciador);
}

// Função para encontrar campanha por ID único
export async function findCampaignById(campaignId: string): Promise<{ found: boolean; rowIndex: number; data: any } | null> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return null;
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:AE',
    });

    const values = response.data.values || [];

    console.log(`🔍 Procurando campanha por ID: ${campaignId}`);

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowCampaignId = row[0]; // Coluna A - Campaign_ID

      if (rowCampaignId === campaignId) {
        console.log(`✅ Campanha encontrada por ID na linha ${i}!`);
        return {
          found: true,
          rowIndex: i,
          data: {
            campaignId: rowCampaignId,
            business: row[1], // Coluna B
            influenciador: row[2], // Coluna C
            mes: row[6], // Coluna G (ajustado após inserção da coluna ID)
            fullRow: row
          }
        };
      }
    }

    console.log(`❌ Campanha não encontrada por ID: ${campaignId}`);
    return { found: false, rowIndex: -1, data: null };

  } catch (error) {
    console.error('❌ Erro ao procurar campanha por ID:', error);
    return null;
  }
}

// Função para encontrar criador na planilha com múltiplos critérios (VERSÃO HÍBRIDA COM IDs)
export async function findCreatorInCampaigns(
  businessName: string,
  mes: string,
  influenciador: string,
  rowIndex?: number
): Promise<{ found: boolean; rowIndex: number; data: any } | null> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return null;
    }

    console.log(`🔍 BUSCA HÍBRIDA: Business="${businessName}", Mês="${mes}", Influenciador="${influenciador}"`);

    // ETAPA 1: Tentar buscar IDs únicos para Business e Creator
    const businessId = await findBusinessIdByName(businessName);
    const creatorId = await findCreatorIdByName(influenciador);

    console.log(`🆔 IDs encontrados: Business ID="${businessId}", Creator ID="${creatorId}"`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:AE',
    });

    const values = response.data.values || [];

    // Verificar se há coluna Campaign_ID
    const headers = values[0] || [];
    const hasIdColumn = headers[0] && headers[0].toLowerCase().includes('id');

    console.log(`📊 DEBUG findCreatorInCampaigns: Estrutura da planilha: ${hasIdColumn ? 'COM' : 'SEM'} coluna ID`);
    console.log(`📋 DEBUG findCreatorInCampaigns: Cabeçalho: ${headers.slice(0, 10).join(', ')}`);

    for (let i = 1; i < values.length; i++) {
      const row = values[i];

      // Usar mapeamento correto baseado na estrutura real:
      // Campaign_ID	Nome Campanha	Influenciador	Responsável	Status	Mês	FIM...
      const campaignBusiness = hasIdColumn ? row[1] : row[0]; // B ou A - Nome Campanha (Business)
      const campaignMes = hasIdColumn ? row[5] : row[4]; // F ou E - Mês
      const campaignInfluenciador = hasIdColumn ? row[2] : row[1]; // C ou B - Influenciador

      // ESTRATÉGIA HÍBRIDA: Usar IDs quando disponíveis, fallback para nomes
      let businessMatch = false;
      let creatorMatch = false;

      // Verificar Business
      if (businessId) {
        // Se temos business_id, buscar por ele na campanha (futuro: quando campanhas tiverem business_id)
        businessMatch = campaignBusiness?.toString().trim() === businessName.trim();
      } else {
        // Fallback: busca por nome
        businessMatch = campaignBusiness?.toString().trim() === businessName.trim();
      }

      // Verificar Creator
      if (creatorId) {
        // Se temos criador_id, buscar por ele na campanha (futuro: quando campanhas tiverem criador_id)
        creatorMatch = campaignInfluenciador?.toString().trim() === influenciador.trim();
      } else {
        // Fallback: busca flexível por nome
        const influenciadorNormalizado = influenciador.toLowerCase().trim();
        const campaignInfluenciadorNormalizado = campaignInfluenciador?.toString().toLowerCase().trim() || '';

        creatorMatch = campaignInfluenciadorNormalizado === influenciadorNormalizado ||
                      campaignInfluenciadorNormalizado.includes(influenciadorNormalizado) ||
                      influenciadorNormalizado.includes(campaignInfluenciadorNormalizado);
      }

      // Busca flexível para o mês: aceita correspondência exata ou se um dos dois estiver vazio
      const mesMatch = campaignMes?.toLowerCase().trim() === mes?.toLowerCase().trim() ||
                       campaignMes?.toLowerCase().trim() === '' ||
                       mes?.toLowerCase().trim() === '' ||
                       mes?.toLowerCase().includes(campaignMes?.toLowerCase().trim() || '') ||
                       campaignMes?.toLowerCase().includes(mes?.toLowerCase().trim() || '');

      if (i <= 5) { // Log apenas as primeiras 5 linhas para debug
        console.log(`📋 Linha ${i + 1}: Business="${campaignBusiness}" (${businessMatch}), Mês="${campaignMes}" (${mesMatch}), Influenciador="${campaignInfluenciador}" (${creatorMatch})`);
      }

      if (businessMatch && mesMatch && creatorMatch) {
        console.log(`✅ Criador encontrado na linha ${i + 1}!`);
        return {
          found: true,
          rowIndex: i,
          data: {
            business: campaignBusiness,
            mes: campaignMes,
            influenciador: campaignInfluenciador,
            fullRow: row
          }
        };
      }
    }

    console.log(`❌ Criador não encontrado: ${businessName} - ${mes} - ${influenciador}`);
    return { found: false, rowIndex: -1, data: null };

  } catch (error) {
    console.error('❌ Erro ao procurar criador:', error);
    return null;
  }
}

// Função para buscar status mais recentes das campanhas do audit_log
export async function getLatestCampaignStatuses(): Promise<{ [key: string]: string }> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      console.log('GOOGLE_SPREADSHEET_ID não configurado');
      return {};
    }

    // Busca todos os dados da aba Audit_Log
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Audit_Log!A:M',
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      console.log('Audit_Log vazio ou só com cabeçalho');
      return {};
    }

    // Mapeia os dados do audit log
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

    // Filtra apenas entradas de campanhas com mudança de status
    const campaignStatusEntries = auditEntries.filter(entry =>
      entry.entity_type === 'campaign' &&
      entry.action === 'campaign_status_changed' &&
      entry.new_value_status
    );

    // Agrupa por entity_name (business-mês) e pega o mais recente
    const latestStatuses: { [key: string]: string } = {};
    const latestTimestamps: { [key: string]: string } = {};

    campaignStatusEntries.forEach(entry => {
      const key = entry.entity_name; // business-mês
      const currentTimestamp = latestTimestamps[key];

      if (!currentTimestamp || new Date(entry.timestamp) > new Date(currentTimestamp)) {
        latestStatuses[key] = entry.new_value_status;
        latestTimestamps[key] = entry.timestamp;
      }
    });

    console.log(`✅ ${Object.keys(latestStatuses).length} status de campanhas carregados do audit_log`);
    console.log('📊 Status encontrados no audit_log:', latestStatuses);
    return latestStatuses;

  } catch (error) {
    console.error('❌ Erro ao buscar status das campanhas do audit_log:', error);
    return {};
  }
}

// Função para atualizar status de campanha via audit_log
export async function updateCampaignStatusViaAuditLog(
  businessName: string,
  mes: string,
  oldStatus: string,
  newStatus: string,
  user: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Buscar business_id pelo nome
    const businessData = await findBusinessHybrid(businessName);
    if (!businessData) {
      throw new Error(`Business "${businessName}" não encontrado`);
    }

    const businessId = businessData.data[17]; // Coluna R
    const entityId = `camp_${businessId}_${mes.toLowerCase()}`;
    const entityName = `${businessName}-${mes}`;

    // Registra a mudança no audit_log
    await logAction({
      action: 'campaign_status_changed',
      entity_type: 'campaign',
      entity_id: entityId,
      entity_name: entityName,
      old_value: oldStatus,
      new_value: newStatus,
      old_value_status: oldStatus,
      new_value_status: newStatus,
      user_id: user,
      user_name: user,
      details: `Status da campanha alterado de "${oldStatus}" para "${newStatus}"`
    });

    console.log(`✅ Status da campanha atualizado via audit_log: ${entityName} → ${newStatus}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao atualizar status via audit_log:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// Função para registrar alterações de criadores no audit_log
export async function logCreatorChanges(
  businessId: string,
  businessName: string,
  mes: string,
  creatorId: string,
  creatorName: string,
  changes: { [key: string]: { old: string; new: string } },
  user: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Usar IDs únicos para entity_id e entity_name
    const entityId = `camp_${businessId}_${mes.toLowerCase()}_${creatorId}`;
    const entityName = `${businessName}-${mes}-${creatorName}`;

    // Criar detalhes das mudanças
    const changeDetails = Object.entries(changes)
      .map(([field, change]) => `${field}: "${change.old}" → "${change.new}"`)
      .join('; ');

    // Registra a mudança no audit_log
    await logAction({
      action: 'creator_data_changed',
      entity_type: 'creator',
      entity_id: entityId,
      entity_name: entityName,
      old_value: JSON.stringify(Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.old]))),
      new_value: JSON.stringify(Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.new]))),
      old_value_status: '',
      new_value_status: '',
      user_id: user,
      user_name: user,
      details: `Dados do criador alterados: ${changeDetails}`
    });

    console.log(`✅ Alterações do criador registradas no audit_log: ${entityName}`);
    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao registrar alterações do criador no audit_log:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// Função para criar/verificar aba de logs detalhados
export async function ensureDetailedLogsSheet(): Promise<boolean> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return false;
    }

    // Verificar se a aba já existe
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = spreadsheet.data.sheets?.some(sheet =>
      sheet.properties?.title === 'Detailed_Logs'
    );

    if (!sheetExists) {
      // Criar nova aba
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: 'Detailed_Logs',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 20
                }
              }
            }
          }]
        }
      });

      // Adicionar cabeçalhos
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Detailed_Logs!A1:T1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'ID', 'Timestamp', 'Action', 'Entity_Type', 'Entity_ID', 'Entity_Name',
            'User_ID', 'User_Name', 'Business_Context', 'Campaign_Context',
            'Creator_Context', 'Field_Changed', 'Old_Value', 'New_Value',
            'Change_Reason', 'Validation_Status', 'Session_ID', 'IP_Address',
            'User_Agent', 'Details'
          ]]
        }
      });

      console.log('✅ Aba Detailed_Logs criada com sucesso');
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao criar aba Detailed_Logs:', error);
    return false;
  }
}

// Função para registrar log detalhado
export async function logDetailedAction(actionData: {
  action: string;
  entity_type: string;
  entity_id: string;
  entity_name: string;
  user_id: string;
  user_name: string;
  business_context?: string;
  campaign_context?: string;
  creator_context?: string;
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  change_reason?: string;
  validation_status?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  details?: string;
}): Promise<boolean> {
  try {
    // Garantir que a aba existe
    await ensureDetailedLogsSheet();

    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return false;
    }

    const logEntry = {
      id: `detailed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...actionData
    };

    const values = [[
      logEntry.id,
      logEntry.timestamp,
      logEntry.action,
      logEntry.entity_type,
      logEntry.entity_id,
      logEntry.entity_name,
      logEntry.user_id,
      logEntry.user_name,
      logEntry.business_context || '',
      logEntry.campaign_context || '',
      logEntry.creator_context || '',
      logEntry.field_changed || '',
      logEntry.old_value || '',
      logEntry.new_value || '',
      logEntry.change_reason || '',
      logEntry.validation_status || '',
      logEntry.session_id || '',
      logEntry.ip_address || '',
      logEntry.user_agent || '',
      logEntry.details || ''
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Detailed_Logs!A:T',
      valueInputOption: 'RAW',
      requestBody: { values }
    });

    console.log(`✅ Log detalhado registrado: ${logEntry.action} - ${logEntry.entity_name}`);
    return true;

  } catch (error) {
    console.error('❌ Erro ao registrar log detalhado:', error);
    return false;
  }
}

// Função para ordenar meses (mais recente primeiro)
function getMonthOrder(month: string): number {
  const monthOrder: { [key: string]: number } = {
    'dezembro': 0, 'novembro': 1, 'outubro': 2, 'setembro': 3,
    'agosto': 4, 'julho': 5, 'junho': 6, 'maio': 7,
    'abril': 8, 'março': 9, 'fevereiro': 10, 'janeiro': 11
  };
  return monthOrder[month.toLowerCase()] ?? 99;
}

// Função para buscar campanhas agrupadas por business e mês
export async function getGroupedCampaignsData(): Promise<GroupedCampaignData[]> {
  try {
    // Buscar dados das campanhas e dos negócios
    const [campaignsData, businessesData] = await Promise.all([
      getCampaignsData(),
      getBusinessesData()
    ]);

    // Criar mapa de negócios para busca rápida
    const businessMap = new Map<string, BusinessData>();
    businessesData.forEach(business => {
      businessMap.set(business.nome.toLowerCase(), business);
    });

    // Agrupar campanhas por business e mês
    const groupedMap = new Map<string, GroupedCampaignData>();

    campaignsData.forEach(campaign => {
      const businessName = campaign.business || campaign.nome;
      const mes = campaign.mes;
      const status = campaign.status; // Status da coluna E

      if (!businessName || !mes) return;

      const groupKey = `${businessName.toLowerCase()}-${mes.toLowerCase()}`;

      if (!groupedMap.has(groupKey)) {
        // Buscar dados do business
        const businessData = businessMap.get(businessName.toLowerCase());
        const quantidadeCriadores = businessData?.quantidadeCriadores ?
          parseInt(businessData.quantidadeCriadores) || 0 : 0;

        groupedMap.set(groupKey, {
          id: groupKey,
          businessName: businessName,
          mes: mes,
          status: status || 'Não definido',
          quantidadeCriadores: quantidadeCriadores,
          criadores: [],
          campanhas: [],
          totalCampanhas: 0
        });
      }

      const group = groupedMap.get(groupKey)!;

      // Atualizar status se necessário (usar o mais recente)
      if (status && status !== 'Não definido') {
        group.status = status;
      }

      // Adicionar campanha ao grupo
      group.campanhas.push(campaign);
      group.totalCampanhas++;

      // Adicionar criador se não estiver na lista
      if (campaign.influenciador && !group.criadores.includes(campaign.influenciador)) {
        group.criadores.push(campaign.influenciador);
      }
    });

    const result = Array.from(groupedMap.values()).sort((a, b) => {
      // Primeiro ordenar por mês (mais recente primeiro)
      const monthCompare = getMonthOrder(a.mes) - getMonthOrder(b.mes);
      if (monthCompare !== 0) return monthCompare;

      // Depois ordenar por business name
      return a.businessName.localeCompare(b.businessName);
    });

    console.log(`✅ ${result.length} campanhas agrupadas por business e mês (ordenadas por mês mais recente)`);
    return result;

  } catch (error) {
    console.error('❌ Erro ao buscar campanhas agrupadas:', error);
    return [];
  }
}

// Função para buscar campanhas da jornada (excluindo finalizadas)
export async function getCampaignJourneyData(): Promise<CampaignJourneyData[]> {
  try {
    // Buscar dados das campanhas, negócios e status do audit_log
    const [campaignsData, businessesData, auditStatuses] = await Promise.all([
      getCampaignsData(),
      getBusinessesData(),
      getLatestCampaignStatuses()
    ]);

    // Criar mapa de negócios para busca rápida
    const businessMap = new Map<string, BusinessData>();
    businessesData.forEach(business => {
      businessMap.set(business.nome.toLowerCase(), business);
    });

    // Agrupar campanhas por business e mês, excluindo finalizadas
    const journeyMap = new Map<string, CampaignJourneyData>();

    campaignsData.forEach(campaign => {
      let businessName = campaign.business || campaign.nome;
      const mes = campaign.mes;

      // Se businessName é um ID (começa com 'bus_'), resolver para nome
      if (businessName && businessName.startsWith('bus_')) {
        const businessData = businessesData.find(b => b.businessId === businessName);
        if (businessData) {
          businessName = businessData.nome;
        } else {
          console.warn(`⚠️ Business ID ${businessName} não encontrado, usando ID como nome`);
        }
      }

      if (!businessName || !mes) {
        return;
      }

      const groupKey = `${businessName.toLowerCase()}-${mes.toLowerCase()}`;
      const auditKey = `${businessName}-${mes}`;

      // Usar status do audit_log se disponível, senão usar status da campanha
      let currentStatus = auditStatuses[auditKey] || campaign.status || 'Reunião de briefing';

      console.log(`📊 Campanha ${auditKey}: Status audit_log = ${auditStatuses[auditKey]}, Status campanha = ${campaign.status}, Status final = ${currentStatus}`);

      // Excluir campanhas finalizadas
      if (currentStatus.toLowerCase() === 'finalizado' || currentStatus.toLowerCase() === 'finalizada') {
        console.log(`🏁 Campanha ${auditKey} finalizada, excluindo da jornada`);
        return;
      }

      if (!journeyMap.has(groupKey)) {
        // Buscar dados do business
        const businessData = businessMap.get(businessName.toLowerCase());
        const quantidadeCriadores = businessData?.quantidadeCriadores ?
          parseInt(businessData.quantidadeCriadores) || 0 : 0;

        // Determinar estágio da jornada baseado no status do audit_log
        let journeyStage: 'Reunião de briefing' | 'Agendamentos' | 'Entrega final' = 'Reunião de briefing';
        const statusLower = currentStatus.toLowerCase();

        if (statusLower === 'agendamentos' || statusLower === 'agendamento') {
          journeyStage = 'Agendamentos';
        } else if (statusLower === 'entrega final' || statusLower === 'entrega' || statusLower === 'entrega final') {
          journeyStage = 'Entrega final';
        }

        journeyMap.set(groupKey, {
          id: groupKey,
          businessName: businessName,
          mes: mes,
          journeyStage: journeyStage,
          campanhas: [],
          totalCampanhas: 0,
          quantidadeCriadores: quantidadeCriadores,
          businessData: businessData,
          campaignIds: [],
          primaryCampaignId: undefined
        });
      }

      const journey = journeyMap.get(groupKey)!;

      // Adicionar campanha ao grupo
      journey.campanhas.push(campaign);
      journey.totalCampanhas++;

      // Adicionar Campaign_ID ao array de IDs
      if (campaign.id && !journey.campaignIds.includes(campaign.id)) {
        journey.campaignIds.push(campaign.id);

        // Definir o primeiro Campaign_ID como primário
        if (!journey.primaryCampaignId) {
          journey.primaryCampaignId = campaign.id;
        }
      }

      // Atualizar estágio da jornada baseado no status mais atual do audit_log
      const statusLower = currentStatus.toLowerCase();
      if (statusLower === 'entrega final' || statusLower === 'entrega') {
        journey.journeyStage = 'Entrega Final';
      } else if ((statusLower === 'agendamentos' || statusLower === 'agendamento') && journey.journeyStage === 'Reunião Briefing') {
        journey.journeyStage = 'Agendamentos';
      }
    });

    // Atualizar quantidadeCriadores baseado no número real de campanhas encontradas
    journeyMap.forEach(journey => {
      if (journey.quantidadeCriadores === 0 || !journey.quantidadeCriadores) {
        journey.quantidadeCriadores = journey.totalCampanhas;
        console.log(`📊 Atualizando quantidadeCriadores para ${journey.businessName}-${journey.mes}: ${journey.totalCampanhas} campanhas`);
      }
    });

    const result = Array.from(journeyMap.values()).sort((a, b) => {
      // Primeiro ordenar por mês (mais recente primeiro)
      const monthCompare = getMonthOrder(a.mes) - getMonthOrder(b.mes);
      if (monthCompare !== 0) return monthCompare;

      // Depois ordenar por business name
      return a.businessName.localeCompare(b.businessName);
    });

    console.log(`✅ ${result.length} campanhas na jornada (excluindo finalizadas)`);
    return result;

  } catch (error) {
    console.error('❌ Erro ao buscar campanhas da jornada:', error);
    return [];
  }
}

// Função para atualizar status de campanha (VERSÃO HÍBRIDA COM IDs)
export async function updateCampaignStatus(
  businessName: string,
  mes: string,
  newStatus: string,
  user: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    console.log(`🔄 ATUALIZAÇÃO HÍBRIDA: Business="${businessName}", Mês="${mes}", Novo Status="${newStatus}"`);

    // ETAPA 1: Tentar buscar Business ID
    const businessId = await findBusinessIdByName(businessName);
    console.log(`🆔 Business ID encontrado: ${businessId}`);

    // Buscar todas as campanhas para encontrar as do business/mês específico
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'campanhas!A:Z',
    });

    const values = response.data.values;
    if (!values || values.length <= 1) {
      return { success: false, error: 'Nenhuma campanha encontrada' };
    }

    // Verificar se há coluna Campaign_ID
    const headers = values[0] || [];
    const hasIdColumn = headers[0] && headers[0].toLowerCase().includes('id');

    console.log(`📊 DEBUG updateCampaignStatus: Estrutura da planilha: ${hasIdColumn ? 'COM' : 'SEM'} coluna ID`);

    // Encontrar linhas que correspondem ao business e mês
    const updates: any[] = [];
    let matchedCampaigns = 0;

    for (let i = 1; i < values.length; i++) {
      const row = values[i];

      // Usar mapeamento correto baseado na estrutura real:
      // Campaign_ID	Nome Campanha	Influenciador	Responsável	Status	Mês	FIM...
      const campaignBusiness = hasIdColumn ? row[1] : row[0]; // B ou A - Nome Campanha (Business)
      const campaignMes = hasIdColumn ? row[5] : row[4]; // F ou E - Mês
      const statusCol = hasIdColumn ? 4 : 3; // E ou D - Status

      // BUSCA HÍBRIDA: Usar ID quando disponível, fallback para nome
      let businessMatch = false;

      if (businessId) {
        // Futuro: quando campanhas tiverem business_id, usar aqui
        // Por enquanto, ainda usar nome mas com busca mais robusta
        businessMatch = campaignBusiness?.toString().trim().toLowerCase() === businessName.trim().toLowerCase();
      } else {
        // Fallback: busca por nome
        businessMatch = campaignBusiness?.toString().trim().toLowerCase() === businessName.trim().toLowerCase();
      }

      // Busca flexível para mês
      const mesMatch = campaignMes?.toLowerCase().trim() === mes?.toLowerCase().trim() ||
                       campaignMes?.toLowerCase().trim() === '' ||
                       mes?.toLowerCase().trim() === '' ||
                       mes?.toLowerCase().includes(campaignMes?.toLowerCase().trim() || '') ||
                       campaignMes?.toLowerCase().includes(mes?.toLowerCase().trim() || '');

      if (businessMatch && mesMatch) {
        matchedCampaigns++;

        // Atualizar status na coluna correta
        const statusRange = hasIdColumn ? `campanhas!E${i + 1}` : `campanhas!D${i + 1}`;
        updates.push({
          range: statusRange,
          values: [[newStatus]]
        });

        console.log(`📝 Campanha ${matchedCampaigns}: Business="${campaignBusiness}", Mês="${campaignMes}" → Status: ${newStatus}`);
      }
    }

    console.log(`📊 RESULTADO: ${matchedCampaigns} campanhas encontradas, ${updates.length} atualizações preparadas`);

    if (updates.length === 0) {
      return {
        success: false,
        error: `Nenhuma campanha encontrada para Business="${businessName}", Mês="${mes}". Campanhas verificadas: ${matchedCampaigns}`
      };
    }

    // Executar todas as atualizações
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: updates
      }
    });

    console.log(`✅ SUCESSO: Status atualizado para ${updates.length} campanhas: ${businessName} - ${mes} → ${newStatus}`);

    // Log de auditoria melhorado
    if (businessId) {
      console.log(`🆔 Atualização realizada com Business ID: ${businessId}`);
    }

    return { success: true };

  } catch (error) {
    console.error('❌ Erro ao atualizar status da campanha:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// ==========================================
// FUNÇÕES AVANÇADAS COM SISTEMA HÍBRIDO
// ==========================================

/**
 * Função para buscar campanhas por Business ID (futuro)
 * Esta função será útil quando implementarmos business_id nas campanhas
 */
export async function findCampaignsByBusinessId(businessId: string): Promise<any[]> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) return [];

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:AE',
    });

    const values = response.data.values || [];
    const campaigns = [];

    // Futuro: quando campanhas tiverem coluna business_id, usar aqui
    // Por enquanto, buscar por nome usando o business_id para encontrar o nome
    const businessData = await findEntityById(businessId, 'business');
    if (!businessData) return [];

    const businessName = businessData.nome;

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const campaignBusiness = row[1]; // Coluna B - Nome Campanha (Business)

      if (campaignBusiness?.toString().trim().toLowerCase() === businessName.toLowerCase()) {
        campaigns.push({
          rowIndex: i,
          data: row,
          campaignId: row[0], // Campaign_ID
          business: campaignBusiness,
          influenciador: row[2], // Coluna C
          status: row[4], // Coluna E
          mes: row[5] // Coluna F
        });
      }
    }

    return campaigns;
  } catch (error) {
    console.error('Erro ao buscar campanhas por Business ID:', error);
    return [];
  }
}

/**
 * Função para buscar campanhas por Creator ID (futuro)
 * Esta função será útil quando implementarmos criador_id nas campanhas
 */
export async function findCampaignsByCreatorId(creatorId: string): Promise<any[]> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) return [];

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:AE',
    });

    const values = response.data.values || [];
    const campaigns = [];

    // Futuro: quando campanhas tiverem coluna criador_id, usar aqui
    // Por enquanto, buscar por nome usando o criador_id para encontrar o nome
    const creatorData = await findEntityById(creatorId, 'creator');
    if (!creatorData) return [];

    const creatorName = creatorData.nome;

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const campaignInfluenciador = row[2]; // Coluna C - Influenciador

      if (campaignInfluenciador?.toString().trim().toLowerCase() === creatorName.toLowerCase()) {
        campaigns.push({
          rowIndex: i,
          data: row,
          campaignId: row[0], // Campaign_ID
          business: row[1], // Coluna B
          influenciador: campaignInfluenciador,
          status: row[4], // Coluna E
          mes: row[5] // Coluna F
        });
      }
    }

    return campaigns;
  } catch (error) {
    console.error('Erro ao buscar campanhas por Creator ID:', error);
    return [];
  }
}

// Função para buscar criadores disponíveis para seleção
export async function getAvailableCreators(): Promise<CreatorData[]> {
  try {
    const creatorsData = await getCreatorsData();
    // Retornar apenas criadores ativos
    return creatorsData.filter(creator =>
      creator.status?.toLowerCase() !== 'inativo' &&
      creator.status?.toLowerCase() !== 'bloqueado'
    );
  } catch (error) {
    console.error('❌ Erro ao buscar criadores disponíveis:', error);
    return [];
  }
}

// Função para gerar slots de criadores para uma campanha
export async function generateCreatorSlots(
  businessName: string,
  mes: string,
  quantidadeContratada: number
): Promise<any[]> {
  try {
    // Buscar campanhas existentes para este business/mês
    const campaignsData = await getCampaignsData();
    const existingCampaigns = campaignsData.filter(campaign =>
      campaign.business?.toLowerCase() === businessName.toLowerCase() &&
      campaign.mes?.toLowerCase() === mes.toLowerCase()
    );

    // Buscar criadores disponíveis
    const availableCreators = await getAvailableCreators();

    // Criar array de slots baseado na quantidade contratada
    const slots = [];

    for (let i = 0; i < quantidadeContratada; i++) {
      const existingCampaign = existingCampaigns[i];

      if (existingCampaign) {
        // Usar dados da campanha existente
        slots.push({
          index: i,
          influenciador: existingCampaign.influenciador,
          briefingCompleto: existingCampaign.briefingCompleto,
          dataHoraVisita: existingCampaign.dataHoraVisita,
          quantidadeConvidados: existingCampaign.quantidadeConvidados,
          visitaConfirmado: existingCampaign.visitaConfirmado,
          dataHoraPostagem: existingCampaign.dataHoraPostagem,
          videoAprovado: existingCampaign.videoAprovado,
          videoPostado: existingCampaign.videoPostado,
          isExisting: true
        });
      } else {
        // Criar slot vazio para novo criador
        slots.push({
          index: i,
          influenciador: '',
          briefingCompleto: 'pendente',
          dataHoraVisita: '',
          quantidadeConvidados: '',
          visitaConfirmado: 'pendente',
          dataHoraPostagem: '',
          videoAprovado: 'pendente',
          videoPostado: 'pendente',
          isExisting: false
        });
      }
    }

    return slots;
  } catch (error) {
    console.error('❌ Erro ao gerar slots de criadores:', error);
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
      range: 'Business!A:P', // A=Nome, B=Categoria, C=Plano atual, D=Comercial, E=Nome Responsável, F=Cidade, G=WhatsApp Responsável, H=Prospecção, I=Responsável, J=Instagram, K=Grupo WhatsApp criado, L=Contrato assinado e enviado, M=Data assinatura do contrato, N=Contrato válido até, O=Related files, P=Notes
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

// Função para adicionar novo criador ao Google Sheets
export async function addCreatorToSheet(creatorData: any[]): Promise<void> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    console.log('📝 Adicionando novo criador ao Google Sheets...');
    console.log('📊 Dados do criador:', creatorData);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Criadores!A:S', // A=Nome, B=Status, C=WhatsApp, D=Cidade, E=Prospecção, F=Responsável, G=Instagram, H=Seguidores instagram - Maio 2025, I=TikTok, J=Seguidores TikTok - julho 25, K=Onboarding Inicial, L=Start date, M=End date, N=Related files, O=Notes, P=Perfil, Q=Preferências, R=Não aceita, S=Descrição do criador
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [creatorData]
      }
    });

    console.log('✅ Criador adicionado com sucesso:', response.data);

    // Registra no audit log
    try {
      const creatorName = creatorData[0]; // Nome está na primeira posição

      await logAction({
        action: 'creator_created',
        entity_type: 'creator',
        entity_id: `creator_${Date.now()}`,
        entity_name: creatorName,
        old_value: '',
        new_value: '',
        old_value_status: '',
        new_value_status: creatorData[1], // Status do criador
        user_id: 'system',
        user_name: 'Sistema',
        details: `Novo criador "${creatorName}" criado via formulário`
      });

      console.log('📊 Audit log registrado para novo criador');
    } catch (auditError) {
      console.error('⚠️ Erro ao registrar audit log (não crítico):', auditError);
      // Não falha a operação principal se o audit log falhar
    }

  } catch (error) {
    console.error('❌ Erro ao adicionar criador:', error);
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
      'Last_Login',
      'Password_Hash'
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Users!A1:I1',
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

    // Busca todos os dados da aba Users (incluindo Password_Hash na coluna I)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:I',
    });

    const rows = response.data.values || [];

    if (rows.length <= 1) {
      console.log('Aba Users vazia ou só com cabeçalho');
      return null;
    }

    // Procura pelo usuário com o email fornecido
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const emailInSheet = row[1];

      console.log(`🔍 Comparando: "${emailInSheet}" vs "${email}"`);

      if (emailInSheet && emailInSheet.toString().trim().toLowerCase() === email.toLowerCase()) {
        console.log(`✅ Usuário encontrado: ${emailInSheet}`);
        return {
          id: row[0] || '',
          email: row[1] || '',
          password: row[8] || row[2] || '', // Usar Password_Hash (coluna I) ou fallback para Password (coluna C)
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

    // Validação de senha com hash bcrypt
    const { verifyPassword } = await import('@/lib/auth');
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
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
      range: 'Users!A:I',
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

// Função para adicionar entrada simples ao audit log (compatibilidade)
export async function addToAuditLog(auditData: any[]): Promise<void> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    console.log('📝 Adicionando entrada ao audit log...');
    console.log('📊 Dados do audit:', auditData);

    // Adiciona diretamente à planilha
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Audit_Log!A:M',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [auditData]
      }
    });

    console.log('✅ Entrada adicionada ao audit log:', response.data);

  } catch (error) {
    console.error('❌ Erro ao adicionar ao audit log:', error);
    throw error;
  }
}

// Função para adicionar nova campanha ao Google Sheets
export async function addCampaignToSheet(campaignData: any[]): Promise<void> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    console.log('📝 Adicionando nova campanha ao Google Sheets...');
    console.log('📊 Dados da campanha:', campaignData);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Campanhas!A:AE', // A=Campanha, B=Business, C=Influenciador, D=Responsável, E=Status, F=Mês, G=FIM, H=Briefing completo enviado para o influenciador?, I=Data e hora Visita, J=Quantidade de convidados, K=Visita Confirmado, L=Data e hora da Postagem, M=Vídeo aprovado?, N=Video/Reels postado?, O=Link Video Instagram, P=Notas, Q=Arquivo, R=Avaliação Restaurante, S=Avaliação Influenciador, T=Status do Calendário, U=Column 22, V=ID do Evento, W=Formato, X=Perfil do criador, Y=Objetivo, Z=Comunicação secundária, AA=Datas e horários para gravação, AB=O que precisa ser falado no vídeo (de forma natural) - História, AC=Promoção CTA, AD=Column 31, AE=Objetivo 1
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [campaignData]
      }
    });

    console.log('✅ Campanha adicionada com sucesso:', response.data);

    // Adicionar ao audit log
    // Estrutura: A=ID, B=Timestamp, C=Action, D=Entity_Type, E=Entity_ID, F=Entity_Name, G=Old_Value, H=New_Value, I=Old_Value_Status, J=New_Value_Status, K=User_ID, L=User_Name, M=Details
    const auditData = [
      `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // A = ID
      new Date().toISOString(),                                             // B = Timestamp
      'campaign_created',                                                   // C = Action
      'campaign',                                                           // D = Entity_Type
      `campaign_${Date.now()}`,                                             // E = Entity_ID
      campaignData[0],                                                      // F = Entity_Name (Nome da campanha)
      '',                                                                   // G = Old_Value
      '',                                                                   // H = New_Value
      '',                                                                   // I = Old_Value_Status
      campaignData[4] || '',                                                // J = New_Value_Status (Status da campanha)
      'system',                                                             // K = User_ID
      'Sistema',                                                            // L = User_Name
      `Nova campanha "${campaignData[0]}" criada para business "${campaignData[1]}" com influenciador "${campaignData[2]}"` // M = Details
    ];

    await addToAuditLog(auditData);
    console.log('✅ Audit log da campanha registrado');

  } catch (error) {
    console.error('❌ Erro ao adicionar campanha:', error);
    throw error;
  }
}

// Função para buscar trabalhos realizados por um criador específico
export async function getCreatorWorks(creatorName: string): Promise<any[]> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return [];
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:AF',
    });

    const values = response.data.values || [];

    if (values.length <= 1) {
      return [];
    }

    // Filtrar campanhas onde o criador está na coluna C (Influenciador) e tem link na coluna O
    const works = values.slice(1)
      .filter(row => {
        const influenciador = row[2]; // Coluna C - Influenciador
        const linkTrabalho = row[14]; // Coluna O - Link do trabalho
        return influenciador?.toLowerCase() === creatorName.toLowerCase() && linkTrabalho;
      })
      .map(row => ({
        campaignId: row[0] || '', // Coluna A - Campaign ID (não mostrar)
        business: row[1] || '', // Coluna B - Business
        mes: row[5] || '', // Coluna F - Mês
        linkTrabalho: row[14] || '', // Coluna O - Link do trabalho
        status: row[4] || '', // Coluna E - Status
        titulo: row[31] || '' // Coluna AF - Título da campanha
      }));

    return works;
  } catch (error) {
    console.error('❌ Erro ao buscar trabalhos do criador:', error);
    return [];
  }
}

// Função para buscar ranking de criadores por trabalhos realizados no mês
export async function getCreatorsRankingThisMonth(): Promise<any[]> {
  try {
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return [];
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Campanhas!A:AE',
    });

    const values = response.data.values || [];

    if (values.length <= 1) {
      return [];
    }

    // Obter mês atual
    const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    const currentMonthCapitalized = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

    // Contar trabalhos por criador no mês atual
    const creatorCounts: { [key: string]: number } = {};

    values.slice(1).forEach(row => {
      const influenciador = row[2]; // Coluna C - Influenciador
      const mes = row[5]; // Coluna F - Mês
      const status = row[4]; // Coluna E - Status

      // Verificar se é do mês atual e está finalizada
      if (mes === currentMonthCapitalized &&
          influenciador &&
          (status === 'FINALIZADA' || status === 'ATIVA')) {
        creatorCounts[influenciador] = (creatorCounts[influenciador] || 0) + 1;
      }
    });

    // Converter para array e ordenar por quantidade de trabalhos
    const ranking = Object.entries(creatorCounts)
      .map(([nome, trabalhos]) => ({ nome, trabalhos }))
      .sort((a, b) => b.trabalhos - a.trabalhos)
      .slice(0, 3); // Top 3

    return ranking;
  } catch (error) {
    console.error('❌ Erro ao buscar ranking de criadores:', error);
    return [];
  }
}
