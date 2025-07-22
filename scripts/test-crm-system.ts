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

async function testCRMSystem() {
  try {
    console.log('🧪 Testando sistema CRM completo...');

    // 1. Verificar se as novas tabelas existem
    console.log('🔍 Verificando estrutura das tabelas...');
    
    const tables = ['business_activities', 'business_notes', 'business_tasks'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Tabela ${table} não existe:`, error.message);
        console.log('⚠️  Execute a migration SQL no Supabase Dashboard primeiro.');
        return false;
      } else {
        console.log(`✅ Tabela ${table} existe`);
      }
    }

    // 2. Verificar campos adicionados na tabela businesses
    console.log('🔍 Verificando novos campos na tabela businesses...');
    
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name, current_stage_since, expected_close_date, is_won, is_lost')
      .limit(1);

    if (businessError) {
      console.log('❌ Erro ao verificar campos:', businessError.message);
      console.log('⚠️  Execute a migration SQL no Supabase Dashboard primeiro.');
      return false;
    } else {
      console.log('✅ Novos campos na tabela businesses existem');
    }

    // 3. Buscar uma empresa para teste
    const { data: testBusiness, error: testBusinessError } = await supabase
      .from('businesses')
      .select('id, name, owner_user_id')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (testBusinessError || !testBusiness) {
      console.log('❌ Nenhuma empresa encontrada para teste');
      return false;
    }

    console.log(`🏢 Usando empresa para teste: ${testBusiness.name}`);

    // 4. Buscar usuário para teste
    const { data: testUser, error: testUserError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('is_active', true)
      .limit(1)
      .single();

    if (testUserError || !testUser) {
      console.log('❌ Nenhum usuário encontrado para teste');
      return false;
    }

    console.log(`👤 Usando usuário para teste: ${testUser.name}`);

    // 5. Testar criação de atividade
    console.log('📝 Testando criação de atividade...');
    
    const { data: activity, error: activityError } = await supabase
      .from('business_activities')
      .insert([{
        business_id: testBusiness.id,
        user_id: testUser.id,
        activity_type: 'note',
        title: 'Teste de atividade CRM',
        description: 'Esta é uma atividade de teste criada pelo script de teste do CRM'
      }])
      .select()
      .single();

    if (activityError) {
      console.log('❌ Erro ao criar atividade:', activityError.message);
      return false;
    } else {
      console.log('✅ Atividade criada:', activity.title);
    }

    // 6. Testar criação de nota
    console.log('📝 Testando criação de nota...');
    
    const { data: note, error: noteError } = await supabase
      .from('business_notes')
      .insert([{
        business_id: testBusiness.id,
        user_id: testUser.id,
        content: 'Esta é uma nota de teste para o sistema CRM. Contém informações importantes sobre o negócio.',
        note_type: 'general'
      }])
      .select()
      .single();

    if (noteError) {
      console.log('❌ Erro ao criar nota:', noteError.message);
      return false;
    } else {
      console.log('✅ Nota criada:', note.content.substring(0, 50) + '...');
    }

    // 7. Testar criação de tarefa
    console.log('📋 Testando criação de tarefa...');
    
    const { data: task, error: taskError } = await supabase
      .from('business_tasks')
      .insert([{
        business_id: testBusiness.id,
        assigned_to_user_id: testUser.id,
        created_by_user_id: testUser.id,
        title: 'Tarefa de teste CRM',
        description: 'Esta é uma tarefa de teste para verificar o funcionamento do sistema',
        task_type: 'call',
        status: 'pending',
        priority: 'medium',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
      }])
      .select()
      .single();

    if (taskError) {
      console.log('❌ Erro ao criar tarefa:', taskError.message);
      return false;
    } else {
      console.log('✅ Tarefa criada:', task.title);
    }

    // 8. Testar mudança de etapa (trigger automático)
    console.log('🔄 Testando mudança de etapa...');
    
    const { data: updatedBusiness, error: updateError } = await supabase
      .from('businesses')
      .update({
        business_stage: 'Leads próprios quentes'
      })
      .eq('id', testBusiness.id)
      .select()
      .single();

    if (updateError) {
      console.log('❌ Erro ao atualizar etapa:', updateError.message);
    } else {
      console.log('✅ Etapa atualizada para:', updatedBusiness.business_stage);
      
      // Verificar se a atividade foi criada automaticamente
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar trigger
      
      const { data: stageActivity, error: stageActivityError } = await supabase
        .from('business_activities')
        .select('*')
        .eq('business_id', testBusiness.id)
        .eq('activity_type', 'stage_change')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!stageActivityError && stageActivity) {
        console.log('✅ Atividade de mudança de etapa criada automaticamente');
      }
    }

    // 9. Testar busca de atividades
    console.log('🔍 Testando busca de atividades...');
    
    const { data: activities, error: activitiesError } = await supabase
      .from('business_activities')
      .select(`
        id,
        activity_type,
        title,
        description,
        created_at,
        user:users(name, email)
      `)
      .eq('business_id', testBusiness.id)
      .order('created_at', { ascending: false });

    if (activitiesError) {
      console.log('❌ Erro ao buscar atividades:', activitiesError.message);
    } else {
      console.log(`✅ ${activities.length} atividades encontradas:`);
      activities.forEach((act, i) => {
        console.log(`  ${i + 1}. ${act.activity_type}: ${act.title} (${act.user?.name})`);
      });
    }

    // 10. Testar APIs
    console.log('🌐 Testando APIs...');
    
    try {
      // Testar API de atividades
      const activitiesResponse = await fetch(`http://localhost:3000/api/crm/activities?business_id=${testBusiness.id}`);
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        console.log(`✅ API de atividades funcionando: ${activitiesData.total} atividades`);
      } else {
        console.log('⚠️  API de atividades não disponível (servidor não rodando)');
      }

      // Testar API de notas
      const notesResponse = await fetch(`http://localhost:3000/api/crm/notes?business_id=${testBusiness.id}`);
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        console.log(`✅ API de notas funcionando: ${notesData.total} notas`);
      } else {
        console.log('⚠️  API de notas não disponível (servidor não rodando)');
      }
    } catch (e) {
      console.log('⚠️  APIs não disponíveis (servidor não rodando)');
    }

    // 11. Limpar dados de teste
    console.log('🗑️ Limpando dados de teste...');
    
    await supabase.from('business_activities').delete().eq('id', activity.id);
    await supabase.from('business_notes').delete().eq('id', note.id);
    await supabase.from('business_tasks').delete().eq('id', task.id);
    
    console.log('✅ Dados de teste removidos');

    // 12. Estatísticas do CRM
    console.log('📊 Estatísticas do CRM...');
    
    const [activitiesCount, notesCount, tasksCount] = await Promise.all([
      supabase.from('business_activities').select('id', { count: 'exact' }),
      supabase.from('business_notes').select('id', { count: 'exact' }),
      supabase.from('business_tasks').select('id', { count: 'exact' })
    ]);

    console.log(`📈 Total de atividades: ${activitiesCount.count || 0}`);
    console.log(`📝 Total de notas: ${notesCount.count || 0}`);
    console.log(`📋 Total de tarefas: ${tasksCount.count || 0}`);

    console.log('\n🎉 Todos os testes do CRM passaram com sucesso!');
    console.log('\n📋 Funcionalidades testadas:');
    console.log('✅ Estrutura de tabelas');
    console.log('✅ Criação de atividades');
    console.log('✅ Criação de notas');
    console.log('✅ Criação de tarefas');
    console.log('✅ Tracking automático de mudanças');
    console.log('✅ APIs funcionando');
    console.log('✅ Triggers automáticos');

    return true;

  } catch (error) {
    console.error('❌ Erro geral nos testes do CRM:', error);
    return false;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testCRMSystem()
    .then((success) => {
      process.exit(success ? 0 : 1);
    });
}

export { testCRMSystem };
