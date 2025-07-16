import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testCampaignCreatorsInsert() {
  console.log('🧪 Testando inserção em campaign_creators...\n');
  
  try {
    // 1. Buscar uma campanha e um criador existentes
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, title')
      .limit(1);
      
    const { data: creators } = await supabase
      .from('creators')
      .select('id, name')
      .limit(1);
    
    if (!campaigns?.length || !creators?.length) {
      console.error('❌ Não há campanhas ou criadores para testar');
      return;
    }
    
    const campaign = campaigns[0];
    const creator = creators[0];
    
    console.log(`📋 Campanha: ${campaign.title} (${campaign.id})`);
    console.log(`👤 Criador: ${creator.name} (${creator.id})\n`);
    
    // 2. Tentar inserir relacionamento simples
    console.log('🔄 Tentando inserção simples...');
    
    const simpleRecord = {
      campaign_id: campaign.id,
      creator_id: creator.id,
      role: 'primary',
      status: 'Confirmado'
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('campaign_creators')
      .insert(simpleRecord)
      .select();
    
    if (insertError) {
      console.error('❌ Erro na inserção simples:', insertError.message);
      console.error('Detalhes:', insertError);
    } else {
      console.log('✅ Inserção simples bem-sucedida!');
      console.log('Resultado:', insertResult);
      
      // Limpar o registro de teste
      await supabase
        .from('campaign_creators')
        .delete()
        .eq('id', insertResult[0].id);
      console.log('🧹 Registro de teste removido');
    }
    
    // 3. Verificar estrutura da tabela
    console.log('\n🔍 Verificando estrutura da tabela...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_columns', { table_name: 'campaign_creators' })
      .single();
    
    if (tableError) {
      console.log('⚠️ Não foi possível obter estrutura da tabela');
    } else {
      console.log('📊 Estrutura da tabela:', tableInfo);
    }
    
    // 4. Verificar políticas RLS
    console.log('\n🔒 Verificando RLS...');
    
    const { data: rlsStatus } = await supabase
      .from('pg_class')
      .select('relname, relrowsecurity')
      .eq('relname', 'campaign_creators')
      .single();
    
    if (rlsStatus) {
      console.log(`RLS ativo: ${rlsStatus.relrowsecurity ? 'SIM' : 'NÃO'}`);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testCampaignCreatorsInsert();
