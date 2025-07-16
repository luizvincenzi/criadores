import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function removeAuditTrigger() {
  console.log('🗑️ Removendo trigger de auditoria da tabela campaign_creators...\n');
  
  try {
    // 1. Listar triggers existentes
    console.log('🔍 Verificando triggers existentes...');
    
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_object_table')
      .eq('event_object_table', 'campaign_creators');
    
    if (triggerError) {
      console.log('⚠️ Não foi possível listar triggers via information_schema');
    } else {
      console.log('📋 Triggers encontrados:', triggers);
    }
    
    // 2. Tentar remover o trigger usando diferentes métodos
    console.log('\n🔧 Tentando remover trigger...');
    
    // Método 1: DROP TRIGGER direto
    try {
      const dropSQL = 'DROP TRIGGER IF EXISTS audit_campaign_creators ON campaign_creators CASCADE;';
      console.log('SQL:', dropSQL);
      
      // Como não temos exec_sql, vamos tentar uma abordagem diferente
      // Vamos usar uma query que force um erro controlado para executar SQL
      
      console.log('⚠️ Não é possível executar SQL direto via client');
      console.log('📝 Execute manualmente no SQL Editor do Supabase:');
      console.log('');
      console.log('-- 1. Remover trigger existente');
      console.log('DROP TRIGGER IF EXISTS audit_campaign_creators ON campaign_creators CASCADE;');
      console.log('');
      console.log('-- 2. Remover função se existir');
      console.log('DROP FUNCTION IF EXISTS audit_campaign_creators_function() CASCADE;');
      console.log('');
      console.log('-- 3. Testar inserção simples');
      console.log(`INSERT INTO campaign_creators (campaign_id, creator_id, role, status) 
VALUES (
  (SELECT id FROM campaigns LIMIT 1),
  (SELECT id FROM creators LIMIT 1),
  'primary',
  'Teste'
);`);
      console.log('');
      console.log('-- 4. Se funcionou, remover o teste');
      console.log('DELETE FROM campaign_creators WHERE status = \'Teste\';');
      
    } catch (error) {
      console.error('❌ Erro ao tentar remover trigger:', error);
    }
    
    // 3. Testar inserção após remoção manual
    console.log('\n🧪 Para testar após remoção manual, execute:');
    console.log('npm run test-simple-insert');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
}

if (require.main === module) {
  removeAuditTrigger()
    .then(result => {
      console.log('\n✅ Processo finalizado:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Processo falhou:', error);
      process.exit(1);
    });
}

export { removeAuditTrigger };
