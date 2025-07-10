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
