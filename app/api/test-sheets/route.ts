import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

function getGoogleSheetsAuth() {
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({
        success: false,
        error: 'GOOGLE_SPREADSHEET_ID não configurado'
      });
    }

    switch (action) {
      case 'test_connection':
        try {
          // Tenta acessar a planilha
          const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId
          });

          const sheetNames = spreadsheet.data.sheets?.map(
            sheet => sheet.properties?.title
          ).filter(Boolean) || [];

          return NextResponse.json({
            success: true,
            title: spreadsheet.data.properties?.title,
            sheets: sheetNames,
            message: 'Conexão estabelecida com sucesso!'
          });
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            error: `Erro ao acessar planilha: ${error.message}`,
            details: error.code || 'Código de erro não disponível'
          });
        }

      case 'create_audit_sheet':
        try {
          // Verifica se a aba já existe
          const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId
          });

          const auditSheetExists = spreadsheet.data.sheets?.some(
            sheet => sheet.properties?.title === 'Audit_Log'
          );

          if (auditSheetExists) {
            return NextResponse.json({
              success: true,
              message: 'Aba Audit_Log já existe'
            });
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

          // Adiciona cabeçalhos
          const headers = [
            'ID',
            'Timestamp',
            'Action',
            'Entity_Type',
            'Entity_ID',
            'Entity_Name',
            'Old_Value',
            'New_Value',
            'User_ID',
            'User_Name',
            'Details'
          ];

          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Audit_Log!A1:K1',
            valueInputOption: 'RAW',
            requestBody: {
              values: [headers]
            }
          });

          return NextResponse.json({
            success: true,
            message: 'Aba Audit_Log criada com sucesso!'
          });
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            error: `Erro ao criar aba: ${error.message}`
          });
        }

      case 'get_users_data':
        try {
          // Tenta ler a aba Users
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Users!A:H',
          });

          return NextResponse.json({
            success: true,
            data: response.data.values || [],
            message: 'Dados da aba Users obtidos com sucesso!'
          });
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            error: `Erro ao acessar aba Users: ${error.message}`,
            details: 'Verifique se a aba "Users" existe na planilha'
          });
        }

      case 'create_users_sheet':
        try {
          // Verifica se a aba já existe
          const spreadsheet = await sheets.spreadsheets.get({
            spreadsheetId
          });

          const usersSheetExists = spreadsheet.data.sheets?.some(
            sheet => sheet.properties?.title === 'Users'
          );

          if (usersSheetExists) {
            return NextResponse.json({
              success: true,
              message: 'Aba Users já existe'
            });
          }

          // Cria a aba Users
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [{
                addSheet: {
                  properties: {
                    title: 'Users'
                  }
                }
              }]
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
            valueInputOption: 'RAW',
            requestBody: {
              values: [headers]
            }
          });

          return NextResponse.json({
            success: true,
            message: 'Aba Users criada com sucesso!'
          });
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            error: `Erro ao criar aba Users: ${error.message}`
          });
        }

      case 'create_user':
        try {
          const userData = data;

          // Gera ID único para o usuário
          const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

          // Prepara dados do usuário
          const userRow = [
            userId,
            userData.email,
            userData.password,
            userData.name,
            userData.role,
            'active',
            new Date().toISOString(),
            '' // Last_Login vazio inicialmente
          ];

          // Adiciona o usuário à aba Users
          await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Users!A:H',
            valueInputOption: 'RAW',
            requestBody: {
              values: [userRow]
            }
          });

          return NextResponse.json({
            success: true,
            message: `Usuário ${userData.email} criado com sucesso!`,
            userId: userId
          });
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            error: `Erro ao criar usuário: ${error.message}`
          });
        }

      case 'test_log_entry':
        try {
          // Gera entrada de log
          const logEntry = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            ...data
          };

          // Prepara dados para inserção no audit log
          const values = [[
            logEntry.id,
            logEntry.timestamp,
            logEntry.action,
            logEntry.entity_type,
            logEntry.entity_id,
            logEntry.entity_name,
            logEntry.old_value || '',
            logEntry.new_value || '',
            logEntry.user_id,
            logEntry.user_name,
            logEntry.details || ''
          ]];

          // Insere na aba Audit_Log
          await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Audit_Log!A:K',
            valueInputOption: 'RAW',
            requestBody: {
              values
            }
          });

          // Se for uma mudança de status de business, atualiza também na aba Business
          if (logEntry.action === 'business_stage_changed' && logEntry.entity_type === 'business' && logEntry.new_value) {
            try {
              // Busca todos os dados da aba Business
              const businessResponse = await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: 'Business!A:C',
              });

              const businessRows = businessResponse.data.values || [];

              if (businessRows.length > 0) {
                // Encontra a linha do business pelo nome (coluna A)
                let targetRowIndex = -1;
                for (let i = 1; i < businessRows.length; i++) {
                  if (businessRows[i][0] && businessRows[i][0].toString().trim() === logEntry.entity_name.trim()) {
                    targetRowIndex = i;
                    break;
                  }
                }

                if (targetRowIndex !== -1) {
                  // Atualiza o status na coluna B
                  const updateRange = `Business!B${targetRowIndex + 1}`;

                  await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: updateRange,
                    valueInputOption: 'RAW',
                    requestBody: {
                      values: [[logEntry.new_value]]
                    }
                  });

                  console.log(`✅ Status do business "${logEntry.entity_name}" atualizado para "${logEntry.new_value}"`);
                }
              }
            } catch (updateError: any) {
              console.error('❌ Erro ao atualizar status na aba Business:', updateError);
              // Não falha o log se a atualização do business falhar
            }
          }

          return NextResponse.json({
            success: true,
            message: 'Log inserido com sucesso!',
            logId: logEntry.id,
            businessUpdated: logEntry.action === 'business_stage_changed'
          });
        } catch (error: any) {
          return NextResponse.json({
            success: false,
            error: `Erro ao inserir log: ${error.message}`
          });
        }

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação não reconhecida'
        });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Erro geral: ${error.message}`
    });
  }
}
