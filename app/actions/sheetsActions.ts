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
      range: 'Business!A:Q', // A=Nome, B=Categoria, C=Plano atual, D=Comercial, E=Nome Responsável, F=Cidade, G=WhatsApp Responsável, H=Prospecção, I=Responsável, J=Instagram, K=Grupo WhatsApp criado, L=Contrato assinado e enviado, M=Data assinatura do contrato, N=Contrato válido até, O=Related files, P=Notes, Q=Quantidade de criadores
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

  // Campos calculados para compatibilidade
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
      range: 'Criadores!A:S', // A=Nome, B=Status, C=WhatsApp, D=Cidade, E=Prospecção, F=Responsável, G=Instagram, H=Seguidores instagram - Maio 2025, I=TikTok, J=Seguidores TikTok - julho 25, K=Onboarding Inicial, L=Start date, M=End date, N=Related files, O=Notes, P=Perfil, Q=Preferências, R=Não aceita, S=Descrição do criador
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

        // Campos calculados para compatibilidade com código existente
        seguidores: parseInt(row[7]?.replace(/[^\d]/g, '')) || 0, // Seguidores do Instagram
        engajamento: 0, // Pode ser calculado posteriormente
        categoria: row[15] || '', // Usar Perfil como categoria
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
      range: 'Campanhas!A:AE', // A=Campanha, B=Business, C=Influenciador, D=Responsável, E=Status, F=Mês, G=FIM, H=Briefing completo enviado para o influenciador?, I=Data e hora Visita, J=Quantidade de convidados, K=Visita Confirmado, L=Data e hora da Postagem, M=Vídeo aprovado?, N=Video/Reels postado?, O=Link Video Instagram, P=Notas, Q=Arquivo, R=Avaliação Restaurante, S=Avaliação Influenciador, T=Status do Calendário, U=Column 22, V=ID do Evento, W=Formato, X=Perfil do criador, Y=Objetivo, Z=Comunicação secundária, AA=Datas e horários para gravação, AB=O que precisa ser falado no vídeo (de forma natural) - História, AC=Promoção CTA, AD=Column 31, AE=Objetivo 1
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
        // Campos principais da planilha
        campanha: row[0] || '',                           // A = Campanha
        business: row[1] || '',                           // B = Business
        influenciador: row[2] || '',                      // C = Influenciador
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
      const emailInSheet = row[1];

      console.log(`🔍 Comparando: "${emailInSheet}" vs "${email}"`);

      if (emailInSheet && emailInSheet.toString().trim().toLowerCase() === email.toLowerCase()) {
        console.log(`✅ Usuário encontrado: ${emailInSheet}`);
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
