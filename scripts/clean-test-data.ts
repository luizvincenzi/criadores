import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  'https://ecbhcalmulaiszslwhqz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA'
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function cleanTestData() {
  try {
    console.log('🧹 Limpando dados de teste...');

    // 1. Remover todos os relacionamentos campaign_creators
    console.log('🗑️ Removendo relacionamentos campaign_creators...');
    const { error: ccError } = await supabase
      .from('campaign_creators')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos

    if (ccError) {
      console.error('❌ Erro ao remover campaign_creators:', ccError);
    } else {
      console.log('✅ Relacionamentos campaign_creators removidos');
    }

    // 2. Remover todas as campanhas
    console.log('🗑️ Removendo campanhas...');
    const { error: campaignError } = await supabase
      .from('campaigns')
      .delete()
      .eq('organization_id', DEFAULT_ORG_ID);

    if (campaignError) {
      console.error('❌ Erro ao remover campanhas:', campaignError);
    } else {
      console.log('✅ Campanhas removidas');
    }

    // 3. Limpar audit_log relacionado
    console.log('🗑️ Limpando audit_log...');
    const { error: auditError } = await supabase
      .from('audit_log')
      .delete()
      .eq('organization_id', DEFAULT_ORG_ID)
      .in('entity_type', ['campaign', 'campaign_creators']);

    if (auditError) {
      console.error('❌ Erro ao limpar audit_log:', auditError);
    } else {
      console.log('✅ Audit log limpo');
    }

    // 4. Verificar se limpeza foi bem-sucedida
    const { data: remainingCampaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('organization_id', DEFAULT_ORG_ID);

    const { data: remainingCC } = await supabase
      .from('campaign_creators')
      .select('id');

    console.log(`\n📊 Resultado da limpeza:`);
    console.log(`- Campanhas restantes: ${remainingCampaigns?.length || 0}`);
    console.log(`- Relacionamentos restantes: ${remainingCC?.length || 0}`);

    if ((remainingCampaigns?.length || 0) === 0 && (remainingCC?.length || 0) === 0) {
      console.log('✅ Limpeza concluída com sucesso! Base de dados limpa para testes reais.');
    } else {
      console.log('⚠️ Alguns dados podem não ter sido removidos completamente.');
    }

  } catch (error) {
    console.error('❌ Erro durante limpeza:', error);
  }
}

cleanTestData();
