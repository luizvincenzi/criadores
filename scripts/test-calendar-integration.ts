import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testCalendarIntegration() {
  try {
    console.log('🧪 TESTANDO INTEGRAÇÃO GOOGLE CALENDAR');
    console.log('=====================================\n');

    // 1. Verificar variáveis de ambiente
    console.log('🔧 Verificando configurações...');
    
    const requiredEnvs = [
      'GOOGLE_CLIENT_EMAIL',
      'GOOGLE_PRIVATE_KEY_ID', 
      'GOOGLE_CALENDAR_ID'
    ];

    const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
    
    if (missingEnvs.length > 0) {
      console.error('❌ Variáveis de ambiente faltando:', missingEnvs);
      return false;
    }

    console.log('✅ Configurações do Google Calendar:');
    console.log(`   • Email: ${process.env.GOOGLE_CLIENT_EMAIL}`);
    console.log(`   • Key ID: ${process.env.GOOGLE_PRIVATE_KEY_ID}`);
    console.log(`   • Calendar ID: ${process.env.GOOGLE_CALENDAR_ID?.substring(0, 20)}...`);

    // 2. Verificar se as colunas foram adicionadas
    console.log('\n🗄️ Verificando estrutura do banco...');
    
    const { data: testData, error: testError } = await supabase
      .from('jornada_tasks')
      .select('id, title, due_date, calendar_event_id, calendar_synced')
      .limit(1);

    if (testError) {
      console.error('❌ Erro ao acessar colunas de calendário:', testError);
      console.log('⚠️ Execute primeiro os comandos SQL no Supabase Dashboard');
      return false;
    }

    console.log('✅ Colunas de calendário encontradas!');

    // 3. Buscar uma tarefa com due_date para testar
    console.log('\n🔍 Buscando tarefa para teste...');
    
    const { data: tasks, error: tasksError } = await supabase
      .from('jornada_tasks')
      .select(`
        id,
        title,
        description,
        due_date,
        priority,
        business_name,
        campaign_month,
        calendar_event_id,
        calendar_synced,
        assigned_user:users!assigned_to(
          id,
          full_name,
          email
        )
      `)
      .not('due_date', 'is', null)
      .limit(5);

    if (tasksError) {
      console.error('❌ Erro ao buscar tarefas:', tasksError);
      return false;
    }

    if (!tasks || tasks.length === 0) {
      console.log('⚠️ Nenhuma tarefa com due_date encontrada');
      console.log('💡 Crie uma tarefa com data de vencimento para testar');
      return true;
    }

    console.log(`✅ ${tasks.length} tarefa(s) com due_date encontrada(s):`);
    tasks.forEach((task, index) => {
      console.log(`   ${index + 1}. ${task.title}`);
      console.log(`      • Data: ${new Date(task.due_date).toLocaleString('pt-BR')}`);
      console.log(`      • Sincronizado: ${task.calendar_synced ? 'Sim' : 'Não'}`);
      console.log(`      • Event ID: ${task.calendar_event_id || 'Nenhum'}`);
    });

    // 4. Testar API de sincronização
    console.log('\n🌐 Testando API de sincronização...');
    
    try {
      const response = await fetch('http://localhost:3002/api/calendar-sync?taskId=' + tasks[0].id);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API de sincronização funcionando!');
        console.log(`   • Task ID: ${data.taskId}`);
        console.log(`   • Pode sincronizar: ${data.canSync ? 'Sim' : 'Não'}`);
        console.log(`   • Está sincronizado: ${data.isSynced ? 'Sim' : 'Não'}`);
      } else {
        console.log('⚠️ API de sincronização com problema:', response.status);
      }
    } catch (apiError) {
      console.log('⚠️ Erro ao testar API (servidor pode estar offline):', apiError);
    }

    // 5. Instruções para teste manual
    console.log('\n📋 COMO TESTAR A INTEGRAÇÃO:');
    console.log('============================');
    console.log('1. Acesse: http://localhost:3002');
    console.log('2. Faça login no sistema');
    console.log('3. Clique no ícone de tarefas (canto superior direito)');
    console.log('4. Clique em uma tarefa que tenha data de vencimento');
    console.log('5. No modal, clique no botão de calendário (ícone azul)');
    console.log('6. Verifique se aparece "Agendado" após a sincronização');
    console.log('7. Acesse calendar.google.com para ver o evento criado');
    console.log('');
    console.log('📝 CRIAR NOVA TAREFA COM AGENDAMENTO:');
    console.log('1. Clique em "Nova Tarefa"');
    console.log('2. Preencha nome, data e hora');
    console.log('3. Marque "Agendar no Google Calendar"');
    console.log('4. Clique em "Criar Tarefa"');
    console.log('5. Verifique no Google Calendar');

    return true;

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

// Executar teste
testCalendarIntegration()
  .then(success => {
    if (success) {
      console.log('\n🎉 SISTEMA PRONTO PARA TESTE!');
      console.log('🚀 Siga as instruções acima para testar a integração');
      process.exit(0);
    } else {
      console.log('\n❌ PROBLEMAS ENCONTRADOS');
      console.log('🔧 Corrija os problemas e execute novamente');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
