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

async function checkJornadaTasks() {
  console.log('🔍 Verificando tabela jornada_tasks...');

  try {
    // Verificar se a tabela existe
    const { data, error } = await supabase
      .from('jornada_tasks')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao acessar tabela jornada_tasks:', error);
      
      if (error.code === '42P01') {
        console.log('📋 A tabela jornada_tasks não existe. Executando migração...');
        await runMigration();
      }
    } else {
      console.log('✅ Tabela jornada_tasks existe e está acessível');
      console.log(`📊 Registros encontrados: ${data?.length || 0}`);
    }

  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

async function runMigration() {
  console.log('🚀 Executando migração da tabela jornada_tasks...');

  try {
    // Ler o arquivo de migração
    const fs = require('fs');
    const path = require('path');
    
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/026_add_jornada_tasks_only.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Arquivo de migração não encontrado:', migrationPath);
      return;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Dividir em comandos individuais
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executando ${commands.length} comandos...`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.length === 0) continue;

      console.log(`\n📝 Executando comando ${i + 1}/${commands.length}...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.error(`❌ Erro no comando ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
        }
      } catch (cmdError) {
        console.error(`❌ Erro no comando ${i + 1}:`, cmdError);
      }
    }

    console.log('\n✅ Migração concluída!');
    
    // Verificar novamente
    await checkJornadaTasks();

  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

checkJornadaTasks();
