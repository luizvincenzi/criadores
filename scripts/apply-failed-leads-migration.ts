import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🔧 Aplicando migração failed_leads...');
  
  try {
    // Ler o arquivo de migração
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/028_failed_leads_backup.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migração carregada, aplicando...');
    
    // Aplicar a migração
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('❌ Erro ao aplicar migração:', error);
      
      // Tentar aplicar manualmente as partes principais
      console.log('🔧 Tentando aplicar partes principais...');
      
      // 1. Criar tabela
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS failed_leads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
          lead_id VARCHAR(50) NOT NULL,
          user_data JSONB NOT NULL,
          error_message TEXT NOT NULL,
          error_details JSONB,
          source VARCHAR(50) DEFAULT 'chatbot',
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          processed_at TIMESTAMP WITH TIME ZONE,
          is_processed BOOLEAN DEFAULT false
        );
      `;
      
      const { error: tableError } = await supabase.rpc('exec_sql', {
        sql: createTableSQL
      });
      
      if (tableError) {
        console.error('❌ Erro ao criar tabela:', tableError);
        
        // Tentar via query direta
        const { error: directError } = await supabase
          .from('failed_leads')
          .select('id')
          .limit(1);
          
        if (directError && directError.message.includes('does not exist')) {
          console.log('⚠️ Tabela failed_leads não existe. Execute o SQL manualmente no Supabase Dashboard:');
          console.log(createTableSQL);
        } else {
          console.log('✅ Tabela failed_leads já existe ou foi criada');
        }
      } else {
        console.log('✅ Tabela failed_leads criada com sucesso');
      }
      
      // 2. Criar índices
      const indexesSQL = `
        CREATE INDEX IF NOT EXISTS idx_failed_leads_lead_id ON failed_leads(lead_id);
        CREATE INDEX IF NOT EXISTS idx_failed_leads_created_at ON failed_leads(created_at);
        CREATE INDEX IF NOT EXISTS idx_failed_leads_processed ON failed_leads(is_processed);
        CREATE INDEX IF NOT EXISTS idx_failed_leads_source ON failed_leads(source);
      `;
      
      const { error: indexError } = await supabase.rpc('exec_sql', {
        sql: indexesSQL
      });
      
      if (indexError) {
        console.log('⚠️ Erro ao criar índices:', indexError.message);
      } else {
        console.log('✅ Índices criados com sucesso');
      }
      
    } else {
      console.log('✅ Migração aplicada com sucesso');
    }
    
    // Testar a tabela
    console.log('🧪 Testando tabela failed_leads...');
    
    const { data: testData, error: testError } = await supabase
      .from('failed_leads')
      .select('*')
      .limit(1);
      
    if (testError) {
      console.error('❌ Erro ao testar tabela:', testError);
    } else {
      console.log('✅ Tabela failed_leads funcionando corretamente');
      console.log(`📊 Registros existentes: ${testData.length}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar
applyMigration().catch(console.error);
