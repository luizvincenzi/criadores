/**
 * Script para migrar senhas em texto plano para hash bcrypt
 * EXECUTAR APENAS UMA VEZ após implementar o sistema de hash
 */

import { google } from 'googleapis';
import bcrypt from 'bcryptjs';

// Configuração da autenticação (usar as mesmas credenciais do sistema)
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

async function migratePasswords() {
  try {
    console.log('🔄 Iniciando migração de senhas...');

    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    // 1. Ler dados atuais da aba Users
    console.log('📖 Lendo dados da aba Users...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:H',
    });

    const values = response.data.values;
    if (!values || values.length <= 1) {
      console.log('❌ Nenhum usuário encontrado para migrar');
      return;
    }

    const headers = values[0];
    console.log('📋 Headers encontrados:', headers);

    // Verificar se já existe coluna de senha hasheada
    const passwordHashIndex = headers.findIndex(h => h.toLowerCase().includes('password_hash'));
    const passwordIndex = headers.findIndex(h => h.toLowerCase() === 'password');

    if (passwordHashIndex !== -1) {
      console.log('⚠️ Coluna password_hash já existe. Migração pode já ter sido executada.');
      console.log('Deseja continuar mesmo assim? (y/N)');
      // Em produção, adicionar confirmação interativa
    }

    if (passwordIndex === -1) {
      console.log('❌ Coluna Password não encontrada');
      return;
    }

    // 2. Adicionar coluna Password_Hash se não existir
    if (passwordHashIndex === -1) {
      console.log('➕ Adicionando coluna Password_Hash...');
      
      // Adicionar header
      const newHeaders = [...headers, 'Password_Hash'];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Users!A1:I1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [newHeaders]
        }
      });
    }

    // 3. Migrar senhas linha por linha
    console.log('🔐 Iniciando hash das senhas...');
    const updates = [];

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const email = row[1]; // Coluna B - Email
      const plainPassword = row[passwordIndex]; // Coluna C - Password

      if (!plainPassword || plainPassword.trim() === '') {
        console.log(`⚠️ Linha ${i + 1}: Senha vazia para ${email}`);
        continue;
      }

      // Verificar se a senha já parece ser um hash bcrypt
      if (plainPassword.startsWith('$2a$') || plainPassword.startsWith('$2b$')) {
        console.log(`✅ Linha ${i + 1}: ${email} já possui hash bcrypt`);
        continue;
      }

      console.log(`🔄 Processando ${email}...`);

      // Gerar hash da senha
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      // Preparar atualização
      const rowNumber = i + 1;
      updates.push({
        range: `Users!I${rowNumber}`, // Coluna I - Password_Hash
        values: [[hashedPassword]]
      });

      console.log(`✅ Hash gerado para ${email}`);
    }

    // 4. Executar todas as atualizações
    if (updates.length > 0) {
      console.log(`📝 Atualizando ${updates.length} senhas...`);
      
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: updates
        }
      });

      console.log('✅ Todas as senhas foram migradas com sucesso!');
    } else {
      console.log('ℹ️ Nenhuma senha precisou ser migrada');
    }

    // 5. Instruções finais
    console.log('\n🎯 PRÓXIMOS PASSOS:');
    console.log('1. Verificar se todas as senhas foram migradas corretamente');
    console.log('2. Atualizar o código para usar a coluna Password_Hash');
    console.log('3. Após confirmar que tudo funciona, remover a coluna Password original');
    console.log('4. Testar login com usuários existentes');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
}

// Função para verificar migração
async function verifyMigration() {
  try {
    console.log('🔍 Verificando migração...');

    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SPREADSHEET_ID não configurado');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:I',
    });

    const values = response.data.values;
    if (!values || values.length <= 1) {
      console.log('❌ Nenhum usuário encontrado');
      return;
    }

    const headers = values[0];
    const passwordHashIndex = headers.findIndex(h => h.toLowerCase().includes('password_hash'));

    if (passwordHashIndex === -1) {
      console.log('❌ Coluna Password_Hash não encontrada');
      return;
    }

    let migratedCount = 0;
    let totalUsers = values.length - 1;

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const email = row[1];
      const hashedPassword = row[passwordHashIndex];

      if (hashedPassword && (hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$'))) {
        migratedCount++;
        console.log(`✅ ${email}: Hash válido`);
      } else {
        console.log(`❌ ${email}: Hash inválido ou ausente`);
      }
    }

    console.log(`\n📊 RESULTADO DA VERIFICAÇÃO:`);
    console.log(`Total de usuários: ${totalUsers}`);
    console.log(`Senhas migradas: ${migratedCount}`);
    console.log(`Taxa de sucesso: ${((migratedCount / totalUsers) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'verify') {
    verifyMigration();
  } else {
    migratePasswords();
  }
}

export { migratePasswords, verifyMigration };
