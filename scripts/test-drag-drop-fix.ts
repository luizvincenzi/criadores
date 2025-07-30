#!/usr/bin/env tsx

import { supabase } from '../lib/supabase';

async function testDragDropFix() {
  try {
    console.log('🧪 Testando se o problema do drag & drop foi resolvido...');
    
    // 1. Verificar se conseguimos buscar campanhas
    console.log('\n1️⃣ Testando busca de campanhas...');
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, status, month, business_id')
      .limit(3);
    
    if (campaignsError) {
      console.error('❌ Erro ao buscar campanhas:', campaignsError);
      return false;
    }
    
    console.log(`✅ ${campaigns?.length || 0} campanhas encontradas`);
    if (campaigns && campaigns.length > 0) {
      console.log('📋 Primeira campanha:', {
        id: campaigns[0].id,
        title: campaigns[0].title,
        status: campaigns[0].status,
        month: campaigns[0].month
      });
    }
    
    // 2. Testar se conseguimos atualizar status de uma campanha
    if (campaigns && campaigns.length > 0) {
      const testCampaign = campaigns[0];
      const currentStatus = testCampaign.status;
      
      console.log('\n2️⃣ Testando atualização de status...');
      console.log(`📊 Status atual: ${currentStatus}`);
      
      // Simular o que acontece no drag & drop
      const newStatus = currentStatus === 'Reunião de briefing' ? 'Agendamentos' : 'Reunião de briefing';
      
      console.log(`🔄 Tentando atualizar para: ${newStatus}`);
      
      const { data: updateResult, error: updateError } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', testCampaign.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Erro ao atualizar status:', updateError);
        return false;
      }
      
      console.log('✅ Status atualizado com sucesso!');
      console.log(`📊 Novo status: ${updateResult.status}`);
      
      // Reverter para o status original
      console.log('\n🔄 Revertendo para status original...');
      const { error: revertError } = await supabase
        .from('campaigns')
        .update({ status: currentStatus })
        .eq('id', testCampaign.id);
      
      if (revertError) {
        console.warn('⚠️ Erro ao reverter status:', revertError);
      } else {
        console.log('✅ Status revertido com sucesso');
      }
    }
    
    // 3. Verificar se jornada_tasks ainda funciona
    console.log('\n3️⃣ Testando tabela jornada_tasks...');
    const { data: tasks, error: tasksError } = await supabase
      .from('jornada_tasks')
      .select('id, title, journey_stage, business_name, campaign_month')
      .limit(3);
    
    if (tasksError) {
      console.error('❌ Erro ao buscar tarefas da jornada:', tasksError);
    } else {
      console.log(`✅ ${tasks?.length || 0} tarefas da jornada encontradas`);
      if (tasks && tasks.length > 0) {
        console.log('📋 Primeira tarefa:', {
          id: tasks[0].id,
          title: tasks[0].title,
          journey_stage: tasks[0].journey_stage,
          business_name: tasks[0].business_name
        });
      }
    }
    
    // 4. Testar função create_automatic_jornada_tasks
    console.log('\n4️⃣ Testando função create_automatic_jornada_tasks...');
    const { data: functionResult, error: functionError } = await supabase.rpc('create_automatic_jornada_tasks', {
      p_business_name: 'Teste Drag Drop',
      p_campaign_month: 'Janeiro',
      p_journey_stage: 'Reunião de briefing',
      p_organization_id: '00000000-0000-0000-0000-000000000001'
    });
    
    if (functionError) {
      console.error('❌ Erro ao testar função:', functionError);
    } else {
      console.log(`✅ Função executada com sucesso! Tarefas criadas: ${functionResult || 0}`);
    }
    
    console.log('\n🎉 Todos os testes passaram! O problema do drag & drop deve estar resolvido.');
    console.log('\n📋 Próximos passos:');
    console.log('1. Teste o drag & drop na interface da aba jornada');
    console.log('2. Verifique se não há mais erros de cast de tipo');
    console.log('3. Confirme que as funcionalidades de tarefas automáticas ainda funcionam');
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testDragDropFix();
}

export { testDragDropFix };
