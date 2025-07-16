import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Google Sheets
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
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.GOOGLE_CLIENT_EMAIL}`
  };

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
}

async function setupAuditLogs() {
  console.log('🔧 Configurando sistema de audit logs...\n');
  
  try {
    // 1. Verificar se a tabela audit_log existe
    console.log('📋 Verificando tabela audit_log...');
    
    let hasAuditLog = false;
    
    try {
      const { data: testAudit, error: testAuditError } = await supabase
        .from('audit_log')
        .select('id')
        .limit(1);
      
      if (!testAuditError) {
        hasAuditLog = true;
        console.log('✅ Tabela audit_log existe');
      } else {
        console.log('❌ Tabela audit_log não existe:', testAuditError.message);
      }
    } catch (error) {
      console.log('❌ Tabela audit_log não existe');
    }
    
    // 2. Se não existe, mostrar como criar
    if (!hasAuditLog) {
      console.log('\n🔧 Tabela audit_log não encontrada. SQL para criar:');
      console.log(`
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  entity_type VARCHAR(50) NOT NULL, -- 'business', 'creator', 'campaign', 'user'
  entity_id VARCHAR(255) NOT NULL, -- ID da entidade afetada
  entity_name VARCHAR(255), -- Nome da entidade para referência
  
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'status_change'
  field_name VARCHAR(100), -- Campo que foi alterado (para updates)
  old_value TEXT, -- Valor anterior
  new_value TEXT, -- Novo valor
  
  user_id UUID REFERENCES users(id), -- Usuário que fez a ação
  user_email VARCHAR(255), -- Email do usuário para referência
  
  metadata JSONB DEFAULT '{}'::jsonb, -- Dados adicionais
  ip_address INET, -- IP do usuário
  user_agent TEXT, -- User agent do browser
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
      `);
      
      console.log('\n⚠️ Execute este SQL no Supabase para criar a tabela audit_log');
      return;
    }
    
    // 3. Verificar dados existentes
    console.log('\n📊 Verificando dados existentes...');
    
    const { data: existingLogs, error: existingError } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (existingError) {
      console.error('❌ Erro ao buscar logs existentes:', existingError);
    } else {
      console.log(`✅ Logs existentes: ${existingLogs.length}`);
      
      if (existingLogs.length > 0) {
        console.log('\n📋 Últimos logs:');
        existingLogs.forEach((log, index) => {
          console.log(`  ${index + 1}. ${log.action} em ${log.entity_type} (${log.entity_name}) por ${log.user_email} em ${log.created_at}`);
        });
      }
    }
    
    // 4. Analisar dados do Google Sheets para migração
    console.log('\n📋 Analisando dados do Google Sheets...');
    
    const auth = getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    
    if (!spreadsheetId) {
      console.error('❌ GOOGLE_SPREADSHEET_ID não configurado');
      return;
    }
    
    // Verificar se existe aba audit_log
    const { data: spreadsheetData } = await sheets.spreadsheets.get({
      spreadsheetId
    });
    
    const sheetNames = spreadsheetData.sheets?.map(sheet => sheet.properties?.title) || [];
    console.log('📊 Abas encontradas no Google Sheets:', sheetNames);
    
    const hasAuditSheet = sheetNames.includes('audit_log');
    
    if (hasAuditSheet) {
      console.log('✅ Aba audit_log encontrada no Google Sheets');
      
      // Buscar dados da aba audit_log
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'audit_log!A:Z'
      });
      
      const values = response.data.values || [];
      const headers = values[0] || [];
      
      console.log(`📊 ${values.length - 1} linhas encontradas na aba audit_log`);
      console.log('📋 Cabeçalhos:', headers);
      
      if (values.length > 1) {
        console.log('\n📋 Primeiros 5 logs do Google Sheets:');
        for (let i = 1; i <= Math.min(5, values.length - 1); i++) {
          const row = values[i];
          console.log(`  ${i}. ${row.join(' | ')}`);
        }
        
        // 5. Propor migração
        console.log('\n💡 Estratégia de migração dos audit logs:');
        console.log('1. Mapear colunas do Google Sheets para campos do Supabase');
        console.log('2. Converter timestamps para formato PostgreSQL');
        console.log('3. Mapear entity_types e actions');
        console.log('4. Inserir logs em lotes no Supabase');
        console.log('5. Manter compatibilidade com sistema atual');
      }
      
    } else {
      console.log('❌ Aba audit_log não encontrada no Google Sheets');
      
      // Verificar se há dados de audit em outras abas
      console.log('\n🔍 Verificando dados de audit em outras abas...');
      
      // Buscar dados da aba detailed_logs se existir
      if (sheetNames.includes('detailed_logs')) {
        console.log('✅ Aba detailed_logs encontrada');
        
        const detailedResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'detailed_logs!A:Z'
        });
        
        const detailedValues = detailedResponse.data.values || [];
        console.log(`📊 ${detailedValues.length - 1} linhas na aba detailed_logs`);
        
        if (detailedValues.length > 1) {
          console.log('📋 Cabeçalhos detailed_logs:', detailedValues[0]);
        }
      }
    }
    
    // 6. Testar criação de log de exemplo
    if (hasAuditLog) {
      console.log('\n🧪 Testando criação de log de exemplo...');
      
      const sampleLog = {
        entity_type: 'system',
        entity_id: 'test',
        entity_name: 'Teste de Audit Log',
        action: 'test',
        field_name: 'status',
        old_value: 'antigo',
        new_value: 'novo',
        user_email: 'sistema@teste.com',
        metadata: {
          source: 'migration_test',
          timestamp: new Date().toISOString()
        }
      };
      
      const { data: logResult, error: logError } = await supabase
        .from('audit_log')
        .insert(sampleLog)
        .select();
      
      if (logError) {
        console.error('❌ Erro ao criar log de teste:', logError);
      } else {
        console.log('✅ Log de teste criado:', logResult);
      }
    }
    
    console.log('\n✅ Configuração de audit logs concluída!');
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

if (require.main === module) {
  setupAuditLogs()
    .then(() => {
      console.log('\n🎉 Configuração finalizada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Configuração falhou:', error);
      process.exit(1);
    });
}

export { setupAuditLogs };
