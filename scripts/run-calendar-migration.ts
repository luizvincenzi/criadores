import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runCalendarMigration() {
  try {
    console.log('📅 EXECUTANDO MIGRAÇÃO PARA INTEGRAÇÃO GOOGLE CALENDAR');
    console.log('=======================================================\n');

    // Ler arquivo de migração
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/027_add_calendar_integration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Executando migração...');

    // Executar comandos SQL individuais
    const commands = [
      'ALTER TABLE jornada_tasks ADD COLUMN IF NOT EXISTS calendar_event_id VARCHAR(255);',
      'ALTER TABLE jornada_tasks ADD COLUMN IF NOT EXISTS calendar_synced BOOLEAN DEFAULT false;',
      'ALTER TABLE jornada_tasks ADD COLUMN IF NOT EXISTS calendar_sync_error TEXT;',
      'ALTER TABLE jornada_tasks ADD COLUMN IF NOT EXISTS calendar_last_sync TIMESTAMP WITH TIME ZONE;'
    ];

    for (const command of commands) {
      console.log(`   Executando: ${command.substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec', { sql: command });

      if (error) {
        console.error('❌ Erro no comando:', error);
        // Continuar mesmo com erro (pode ser que a coluna já exista)
      }
    }

    console.log('✅ Comandos executados!');

    // Verificar se as colunas foram adicionadas
    console.log('\n🔍 Verificando estrutura da tabela...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'jornada_tasks')
      .eq('table_schema', 'public')
      .in('column_name', ['calendar_event_id', 'calendar_synced', 'calendar_sync_error', 'calendar_last_sync']);

    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError);
      return false;
    }

    if (columns && columns.length > 0) {
      console.log('✅ Colunas de calendário adicionadas:');
      columns.forEach(col => {
        console.log(`   • ${col.column_name} (${col.data_type}) - Nullable: ${col.is_nullable}`);
      });
    } else {
      console.log('⚠️ Nenhuma coluna de calendário encontrada');
    }

    // Testar uma consulta simples
    console.log('\n🧪 Testando consulta com novos campos...');
    
    const { data: testData, error: testError } = await supabase
      .from('jornada_tasks')
      .select('id, title, calendar_event_id, calendar_synced')
      .limit(1);

    if (testError) {
      console.error('❌ Erro no teste:', testError);
      return false;
    }

    console.log('✅ Consulta funcionando! Exemplo:');
    if (testData && testData.length > 0) {
      console.log(`   • Tarefa: ${testData[0].title}`);
      console.log(`   • Calendar Event ID: ${testData[0].calendar_event_id || 'null'}`);
      console.log(`   • Calendar Synced: ${testData[0].calendar_synced || false}`);
    }

    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('📅 Sistema pronto para integração com Google Calendar');
    
    return true;

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    return false;
  }
}

// Executar migração
runCalendarMigration()
  .then(success => {
    if (success) {
      console.log('\n✅ Processo concluído com sucesso!');
      process.exit(0);
    } else {
      console.log('\n❌ Processo falhou!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
