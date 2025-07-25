import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function testJornadaTasks() {
  console.log('🧪 Testando sistema de tarefas da jornada...\n');

  try {
    // 1. Verificar se a tabela existe
    console.log('1️⃣ Verificando estrutura da tabela jornada_tasks...');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('jornada_tasks')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela jornada_tasks:', tableError.message);
      console.log('💡 Execute a migração: supabase/migrations/022_create_jornada_tasks.sql');
      return false;
    }

    console.log('✅ Tabela jornada_tasks acessível');

    // 2. Buscar um usuário para testes
    console.log('\n2️⃣ Buscando usuário para testes...');
    
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);

    if (userError || !users || users.length === 0) {
      console.error('❌ Nenhum usuário encontrado para testes');
      return false;
    }

    const testUser = users[0];
    console.log(`✅ Usuário de teste: ${testUser.full_name} (${testUser.email})`);

    // 3. Buscar uma campanha para testes
    console.log('\n3️⃣ Buscando campanha para testes...');
    
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, title, month, business_id, businesses(name)')
      .eq('organization_id', DEFAULT_ORG_ID)
      .limit(1);

    if (campaignError || !campaigns || campaigns.length === 0) {
      console.error('❌ Nenhuma campanha encontrada para testes');
      return false;
    }

    const testCampaign = campaigns[0];
    const businessName = (testCampaign.businesses as any)?.name || 'Empresa Teste';
    console.log(`✅ Campanha de teste: ${testCampaign.title} - ${businessName} (${testCampaign.month})`);

    // 4. Testar criação de tarefa manual
    console.log('\n4️⃣ Testando criação de tarefa manual...');
    
    const manualTask = {
      organization_id: DEFAULT_ORG_ID,
      campaign_id: testCampaign.id,
      business_id: testCampaign.business_id,
      business_name: businessName,
      campaign_month: testCampaign.month,
      journey_stage: 'Reunião de briefing',
      title: 'Tarefa de teste manual',
      description: 'Esta é uma tarefa criada manualmente para teste',
      task_type: 'custom',
      status: 'todo',
      priority: 'medium',
      assigned_to: testUser.id,
      created_by: testUser.id,
      is_auto_generated: false,
      blocks_stage_progression: false,
      tags: ['teste', 'manual'],
      metadata: { test: true }
    };

    const { data: createdTask, error: createError } = await supabase
      .from('jornada_tasks')
      .insert([manualTask])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar tarefa manual:', createError.message);
      return false;
    }

    console.log(`✅ Tarefa manual criada: ${createdTask.title} (ID: ${createdTask.id})`);

    // 5. Testar função de criação automática
    console.log('\n5️⃣ Testando criação automática de tarefas...');
    
    const { data: autoResult, error: autoError } = await supabase.rpc('create_automatic_jornada_tasks', {
      p_business_name: businessName,
      p_campaign_month: testCampaign.month,
      p_journey_stage: 'Agendamentos',
      p_organization_id: DEFAULT_ORG_ID,
      p_business_id: testCampaign.business_id,
      p_campaign_id: testCampaign.id,
      p_created_by: testUser.id
    });

    if (autoError) {
      console.error('❌ Erro ao criar tarefas automáticas:', autoError.message);
      return false;
    }

    console.log(`✅ ${autoResult} tarefas automáticas criadas para estágio "Agendamentos"`);

    // 6. Testar busca de tarefas
    console.log('\n6️⃣ Testando busca de tarefas...');
    
    const { data: allTasks, error: searchError } = await supabase
      .from('jornada_tasks')
      .select(`
        id,
        title,
        journey_stage,
        status,
        priority,
        is_auto_generated,
        blocks_stage_progression,
        assigned_user:users!assigned_to(full_name)
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_name', businessName)
      .eq('campaign_month', testCampaign.month)
      .order('journey_stage')
      .order('priority', { ascending: false });

    if (searchError) {
      console.error('❌ Erro ao buscar tarefas:', searchError.message);
      return false;
    }

    console.log(`✅ ${allTasks?.length || 0} tarefas encontradas:`);
    allTasks?.forEach(task => {
      const autoIcon = task.is_auto_generated ? '🤖' : '👤';
      const blockIcon = task.blocks_stage_progression ? '🚫' : '✅';
      const assignedTo = (task.assigned_user as any)?.full_name || 'Não atribuído';
      console.log(`   ${autoIcon} ${blockIcon} [${task.journey_stage}] ${task.title} - ${task.status} (${assignedTo})`);
    });

    // 7. Testar função de verificação de progressão
    console.log('\n7️⃣ Testando verificação de progressão...');
    
    const { data: canProgress, error: progressError } = await supabase.rpc('can_progress_to_next_stage', {
      p_business_name: businessName,
      p_campaign_month: testCampaign.month,
      p_current_stage: 'Agendamentos'
    });

    if (progressError) {
      console.error('❌ Erro ao verificar progressão:', progressError.message);
      return false;
    }

    console.log(`${canProgress ? '✅' : '❌'} Pode avançar para próximo estágio: ${canProgress}`);

    // 8. Testar atualização de tarefa
    console.log('\n8️⃣ Testando atualização de tarefa...');
    
    const { data: updatedTask, error: updateError } = await supabase
      .from('jornada_tasks')
      .update({
        status: 'in_progress',
        actual_hours: 2
      })
      .eq('id', createdTask.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erro ao atualizar tarefa:', updateError.message);
      return false;
    }

    console.log(`✅ Tarefa atualizada: ${updatedTask.title} - Status: ${updatedTask.status}`);

    // 9. Limpeza - remover tarefas de teste
    console.log('\n9️⃣ Limpando tarefas de teste...');
    
    const { error: cleanupError } = await supabase
      .from('jornada_tasks')
      .delete()
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('business_name', businessName)
      .eq('campaign_month', testCampaign.month);

    if (cleanupError) {
      console.warn('⚠️ Erro ao limpar tarefas de teste:', cleanupError.message);
    } else {
      console.log('✅ Tarefas de teste removidas');
    }

    console.log('\n🎉 Todos os testes passaram! Sistema de tarefas da jornada está funcionando.');
    return true;

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
    return false;
  }
}

// Executar testes
testJornadaTasks()
  .then(success => {
    if (success) {
      console.log('\n✅ Sistema de tarefas da jornada validado com sucesso!');
      process.exit(0);
    } else {
      console.log('\n❌ Falha na validação do sistema de tarefas da jornada');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
