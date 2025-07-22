import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function simpleFix() {
  console.log('🔧 Correção simples...');
  
  // Remover tabela business_activities
  const { error: dropError } = await supabase.rpc('exec_sql', { 
    sql: 'DROP TABLE IF EXISTS business_activities CASCADE;'
  });
  
  if (dropError && !dropError.message.includes('exec_sql')) {
    console.log('⚠️ Erro ao remover tabela:', dropError.message);
  } else {
    console.log('✅ Tabela business_activities removida');
  }
  
  // Testar atualização
  const { data: updated, error: updateError } = await supabase
    .from('businesses')
    .update({ 
      business_stage: 'Leads indicados',
      current_stage_since: new Date().toISOString()
    })
    .eq('name', 'Boussolé')
    .select('name, business_stage')
    .single();
    
  if (updateError) {
    console.error('❌ Erro:', updateError.message);
  } else {
    console.log('✅ FUNCIONOU!');
    console.log('  - Empresa:', updated.name);
    console.log('  - Nova etapa:', updated.business_stage);
  }
}

simpleFix();
