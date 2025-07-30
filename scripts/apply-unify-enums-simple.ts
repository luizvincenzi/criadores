#!/usr/bin/env tsx

import { supabase } from '../lib/supabase';

async function applyUnifyEnumsSimple() {
  try {
    console.log('🚀 Aplicando migration para unificar enums...');
    
    // Verificar conexão
    console.log('🔍 Verificando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError);
      throw testError;
    }
    
    console.log('✅ Conexão com Supabase OK');
    
    // Verificar se jornada_tasks existe e tem dados
    console.log('\n🔍 Verificando tabela jornada_tasks...');
    const { data: tasksData, error: tasksError } = await supabase
      .from('jornada_tasks')
      .select('id, journey_stage')
      .limit(5);
    
    if (tasksError) {
      console.log('⚠️ Tabela jornada_tasks não existe ou está vazia:', tasksError.message);
    } else {
      console.log(`📊 Encontradas ${tasksData?.length || 0} tarefas na jornada`);
      if (tasksData && tasksData.length > 0) {
        console.log('📋 Primeiras tarefas:', tasksData);
      }
    }
    
    // Verificar enums existentes
    console.log('\n🔍 Verificando enums existentes...');
    
    // Como não podemos executar SQL diretamente, vamos verificar se o problema ainda existe
    // testando uma operação que falharia com o erro original
    
    console.log('\n🧪 Testando se o problema do cast ainda existe...');
    
    // Simular o que acontece no drag & drop
    const testCampaignUpdate = {
      businessName: 'Teste',
      mes: 'Janeiro',
      newStatus: 'Agendamentos'
    };
    
    console.log('📝 Dados de teste para atualização:', testCampaignUpdate);
    
    // Tentar buscar campanhas para ver se o mapeamento está funcionando
    const { data: campaignsData, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, status, month')
      .limit(3);
    
    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
    } else {
      console.log('✅ Campanhas encontradas:', campaignsData?.length || 0);
      if (campaignsData && campaignsData.length > 0) {
        console.log('📋 Primeiras campanhas:', campaignsData);
      }
    }
    
    console.log('\n⚠️ IMPORTANTE:');
    console.log('Como não podemos executar SQL diretamente via script,');
    console.log('você precisa aplicar a migration manualmente no Supabase Dashboard.');
    console.log('\n📝 SQL para executar no Supabase Dashboard:');
    console.log('');
    console.log('-- 1. Atualizar tabela jornada_tasks para usar campaign_status');
    console.log('ALTER TABLE jornada_tasks');
    console.log('ALTER COLUMN journey_stage TYPE campaign_status');
    console.log('USING journey_stage::text::campaign_status;');
    console.log('');
    console.log('-- 2. Atualizar coluna auto_trigger_stage');
    console.log('ALTER TABLE jornada_tasks');
    console.log('ALTER COLUMN auto_trigger_stage TYPE campaign_status');
    console.log('USING auto_trigger_stage::text::campaign_status;');
    console.log('');
    console.log('-- 3. Remover enum jornada_stage');
    console.log('DROP TYPE IF EXISTS jornada_stage;');
    
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applyUnifyEnumsSimple();
}

export { applyUnifyEnumsSimple };
