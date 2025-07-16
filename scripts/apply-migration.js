const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Aplicando migração para campaign_creators...');

  try {
    // 1. Verificar se a coluna já existe
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'campaign_creators' });

    if (columnsError) {
      console.log('⚠️ Não foi possível verificar colunas, continuando...');
    } else {
      const hasOrgId = columns?.some(col => col.column_name === 'organization_id');
      if (hasOrgId) {
        console.log('✅ Coluna organization_id já existe em campaign_creators');
        return;
      }
    }

    // 2. Adicionar coluna organization_id
    console.log('📝 Adicionando coluna organization_id...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE campaign_creators 
        ADD COLUMN IF NOT EXISTS organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001';
        
        -- Adicionar foreign key constraint
        ALTER TABLE campaign_creators 
        ADD CONSTRAINT fk_campaign_creators_organization 
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
        
        -- Criar índice
        CREATE INDEX IF NOT EXISTS idx_campaign_creators_organization_id 
        ON campaign_creators(organization_id);
      `
    });

    if (alterError) {
      console.error('❌ Erro ao adicionar coluna:', alterError);
      return;
    }

    console.log('✅ Coluna organization_id adicionada com sucesso!');

    // 3. Verificar resultado
    const { data: relations, error: relationsError } = await supabase
      .from('campaign_creators')
      .select('*')
      .limit(1);

    if (relationsError) {
      console.error('❌ Erro ao verificar tabela:', relationsError);
    } else {
      console.log('✅ Tabela campaign_creators atualizada com sucesso!');
    }

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

// Executar
applyMigration();
