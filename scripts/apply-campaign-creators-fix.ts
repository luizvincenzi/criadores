import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function applyCampaignCreatorsFix() {
  console.log('🔧 Aplicando correção para campaign_creators...\n');
  
  try {
    // 1. Remover trigger existente
    console.log('🗑️ Removendo trigger existente...');
    await supabase.rpc('exec_sql', {
      sql: 'DROP TRIGGER IF EXISTS audit_campaign_creators ON campaign_creators;'
    });
    console.log('✅ Trigger removido');
    
    // 2. Criar função específica para campaign_creators
    console.log('🔧 Criando função específica...');
    const functionSQL = `
      CREATE OR REPLACE FUNCTION audit_campaign_creators_function()
      RETURNS TRIGGER AS $$
      BEGIN
          IF TG_OP = 'INSERT' THEN
              INSERT INTO audit_logs (
                  organization_id,
                  table_name,
                  record_id,
                  action,
                  new_values,
                  user_id
              ) VALUES (
                  (SELECT organization_id FROM campaigns WHERE id = NEW.campaign_id),
                  TG_TABLE_NAME,
                  NEW.id,
                  'INSERT',
                  to_jsonb(NEW),
                  auth.uid()
              );
              RETURN NEW;
          ELSIF TG_OP = 'UPDATE' THEN
              INSERT INTO audit_logs (
                  organization_id,
                  table_name,
                  record_id,
                  action,
                  old_values,
                  new_values,
                  user_id
              ) VALUES (
                  (SELECT organization_id FROM campaigns WHERE id = NEW.campaign_id),
                  TG_TABLE_NAME,
                  NEW.id,
                  'UPDATE',
                  to_jsonb(OLD),
                  to_jsonb(NEW),
                  auth.uid()
              );
              RETURN NEW;
          ELSIF TG_OP = 'DELETE' THEN
              INSERT INTO audit_logs (
                  organization_id,
                  table_name,
                  record_id,
                  action,
                  old_values,
                  user_id
              ) VALUES (
                  (SELECT organization_id FROM campaigns WHERE id = OLD.campaign_id),
                  TG_TABLE_NAME,
                  OLD.id,
                  'DELETE',
                  to_jsonb(OLD),
                  auth.uid()
              );
              RETURN OLD;
          END IF;
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    await supabase.rpc('exec_sql', { sql: functionSQL });
    console.log('✅ Função criada');
    
    // 3. Aplicar novo trigger
    console.log('🔧 Aplicando novo trigger...');
    await supabase.rpc('exec_sql', {
      sql: `CREATE TRIGGER audit_campaign_creators 
            AFTER INSERT OR UPDATE OR DELETE ON campaign_creators
            FOR EACH ROW EXECUTE FUNCTION audit_campaign_creators_function();`
    });
    console.log('✅ Trigger aplicado');
    
    // 4. Testar inserção
    console.log('\n🧪 Testando inserção...');
    
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, title')
      .limit(1);
      
    const { data: creators } = await supabase
      .from('creators')
      .select('id, name')
      .limit(1);
    
    if (campaigns?.length && creators?.length) {
      const testRecord = {
        campaign_id: campaigns[0].id,
        creator_id: creators[0].id,
        role: 'primary',
        status: 'Teste'
      };
      
      const { data: insertResult, error: insertError } = await supabase
        .from('campaign_creators')
        .insert(testRecord)
        .select();
      
      if (insertError) {
        console.error('❌ Erro no teste:', insertError.message);
      } else {
        console.log('✅ Teste bem-sucedido!');
        
        // Limpar registro de teste
        await supabase
          .from('campaign_creators')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('🧹 Registro de teste removido');
      }
    }
    
    console.log('\n✅ Correção aplicada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar correção:', error);
  }
}

applyCampaignCreatorsFix();
