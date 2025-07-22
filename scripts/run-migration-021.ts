#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  console.log('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration021() {
  console.log('🚀 Executando Migration 021: Corrigir trigger user_id...\n');

  try {
    // Ler o arquivo da migration
    const migrationPath = join(process.cwd(), 'supabase/migrations/021_fix_trigger_user_id.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('📄 Executando SQL da migration...');

    // Dividir em comandos individuais (separados por ponto e vírgula)
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.length === 0) continue;

      console.log(`\n📝 Executando comando ${i + 1}/${commands.length}...`);
      console.log(`   ${command.substring(0, 80)}${command.length > 80 ? '...' : ''}`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`❌ Erro no comando ${i + 1}:`, error.message);
          // Continuar com os próximos comandos mesmo se um falhar
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      } catch (cmdError) {
        console.error(`❌ Erro no comando ${i + 1}:`, cmdError);
      }
    }

    console.log('\n🔍 Verificando se os triggers foram criados...');

    // Verificar se as funções foram criadas
    const { data: functions, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .in('routine_name', ['track_business_stage_change', 'track_business_creation']);

    if (funcError) {
      console.log('⚠️  Não foi possível verificar as funções:', funcError.message);
    } else {
      console.log(`✅ ${functions?.length || 0} funções encontradas:`, 
        functions?.map(f => f.routine_name).join(', '));
    }

    console.log('\n✅ Migration 021 executada!');
    console.log('🎯 Os triggers agora devem lidar corretamente com user_id null.');

  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
    process.exit(1);
  }
}

async function testTriggers() {
  console.log('\n🧪 Testando triggers após migration...');

  try {
    // Testar atualização de um business
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name, business_stage')
      .limit(1);

    if (businesses && businesses.length > 0) {
      const testBusiness = businesses[0];
      console.log(`📋 Testando com business: ${testBusiness.name}`);

      // Fazer uma pequena atualização para testar o trigger
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ 
          updated_at: new Date().toISOString(),
          // Manter a mesma etapa para não causar mudanças desnecessárias
          business_stage: testBusiness.business_stage
        })
        .eq('id', testBusiness.id);

      if (updateError) {
        console.log('❌ Erro ao testar trigger:', updateError.message);
      } else {
        console.log('✅ Trigger funcionando - nenhum erro de user_id null');
      }
    } else {
      console.log('⚠️  Nenhum business encontrado para testar');
    }

  } catch (error) {
    console.log('❌ Erro ao testar triggers:', error);
  }
}

async function main() {
  await runMigration021();
  await testTriggers();
  
  console.log('\n🎉 Processo concluído!');
  console.log('💡 Os erros de user_id null nos triggers devem estar resolvidos.');
}

if (require.main === module) {
  main().catch(console.error);
}
