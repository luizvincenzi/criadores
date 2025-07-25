import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addCalendarColumns() {
  try {
    console.log('📅 ADICIONANDO COLUNAS PARA INTEGRAÇÃO GOOGLE CALENDAR');
    console.log('====================================================\n');

    // Verificar se a tabela jornada_tasks existe
    console.log('🔍 Verificando tabela jornada_tasks...');
    
    const { data: tables, error: tablesError } = await supabase
      .from('jornada_tasks')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.error('❌ Erro ao acessar tabela jornada_tasks:', tablesError);
      return false;
    }

    console.log('✅ Tabela jornada_tasks encontrada!');

    // Tentar fazer uma consulta que inclua as novas colunas
    console.log('\n🧪 Testando se as colunas já existem...');
    
    const { data: testData, error: testError } = await supabase
      .from('jornada_tasks')
      .select('id, calendar_event_id, calendar_synced, calendar_sync_error, calendar_last_sync')
      .limit(1);

    if (!testError) {
      console.log('✅ Colunas de calendário já existem!');
      console.log('📊 Estrutura atual:');
      if (testData && testData.length > 0) {
        const sample = testData[0];
        console.log(`   • calendar_event_id: ${sample.calendar_event_id || 'null'}`);
        console.log(`   • calendar_synced: ${sample.calendar_synced || false}`);
        console.log(`   • calendar_sync_error: ${sample.calendar_sync_error || 'null'}`);
        console.log(`   • calendar_last_sync: ${sample.calendar_last_sync || 'null'}`);
      }
      return true;
    }

    console.log('⚠️ Colunas não existem ainda. Isso é normal se for a primeira execução.');
    console.log('📝 As colunas precisam ser adicionadas manualmente no Supabase Dashboard.');
    
    console.log('\n📋 INSTRUÇÕES PARA ADICIONAR AS COLUNAS:');
    console.log('=====================================');
    console.log('1. Acesse: https://supabase.com/dashboard');
    console.log('2. Vá para seu projeto > SQL Editor');
    console.log('3. Execute os seguintes comandos:');
    console.log('');
    console.log('-- Adicionar colunas para integração Google Calendar');
    console.log('ALTER TABLE jornada_tasks ADD COLUMN calendar_event_id VARCHAR(255);');
    console.log('ALTER TABLE jornada_tasks ADD COLUMN calendar_synced BOOLEAN DEFAULT false;');
    console.log('ALTER TABLE jornada_tasks ADD COLUMN calendar_sync_error TEXT;');
    console.log('ALTER TABLE jornada_tasks ADD COLUMN calendar_last_sync TIMESTAMP WITH TIME ZONE;');
    console.log('');
    console.log('-- Criar índices para performance');
    console.log('CREATE INDEX idx_jornada_tasks_calendar_event ON jornada_tasks(calendar_event_id) WHERE calendar_event_id IS NOT NULL;');
    console.log('CREATE INDEX idx_jornada_tasks_calendar_synced ON jornada_tasks(calendar_synced, due_date) WHERE due_date IS NOT NULL;');
    console.log('');
    console.log('4. Após executar, rode este script novamente para verificar');

    return false;

  } catch (error) {
    console.error('❌ Erro ao verificar/adicionar colunas:', error);
    return false;
  }
}

// Executar verificação
addCalendarColumns()
  .then(success => {
    if (success) {
      console.log('\n✅ SISTEMA PRONTO PARA INTEGRAÇÃO GOOGLE CALENDAR!');
      console.log('🚀 Você pode agora testar a funcionalidade de agendamento');
      process.exit(0);
    } else {
      console.log('\n⚠️ AÇÃO NECESSÁRIA: Execute os comandos SQL no Supabase Dashboard');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
