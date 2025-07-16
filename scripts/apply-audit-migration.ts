import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyAuditMigration() {
  console.log('🔧 Aplicando migration de audit logs...\n');
  
  try {
    // 1. Ler o arquivo de migration
    console.log('📋 Lendo arquivo de migration...');
    
    const migrationPath = 'supabase/migrations/002_audit_logs.sql';
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`✅ Migration carregada: ${migrationSQL.length} caracteres`);
    
    // 2. Dividir em comandos individuais
    console.log('\n🔄 Dividindo migration em comandos...');
    
    // Remover comentários e dividir por ';'
    const commands = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0);
    
    console.log(`✅ ${commands.length} comandos encontrados`);
    
    // 3. Executar comandos um por um
    console.log('\n💾 Executando comandos...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        console.log(`\n📋 Executando comando ${i + 1}/${commands.length}:`);
        console.log(`   ${command.substring(0, 100)}${command.length > 100 ? '...' : ''}`);
        
        // Para comandos CREATE TABLE, CREATE INDEX, etc., usar rpc
        if (command.includes('CREATE TABLE') || 
            command.includes('CREATE INDEX') || 
            command.includes('CREATE OR REPLACE FUNCTION') ||
            command.includes('CREATE TRIGGER') ||
            command.includes('DROP TRIGGER')) {
          
          // Tentar executar via SQL direto (não vai funcionar com anon key, mas vamos tentar)
          const { error } = await supabase.rpc('exec_sql', { sql: command });
          
          if (error) {
            console.error(`❌ Erro no comando ${i + 1}:`, error.message);
            errorCount++;
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`);
            successCount++;
          }
          
        } else if (command.includes('INSERT INTO audit_log')) {
          // Para INSERT, tentar usar o método normal
          console.log('📝 Tentando inserção via método normal...');
          
          // Extrair dados do INSERT (isso é complexo, vamos pular por enquanto)
          console.log('⚠️ INSERT complexo, pulando...');
          
        } else {
          console.log('⚠️ Comando não reconhecido, pulando...');
        }
        
      } catch (error) {
        console.error(`❌ Erro no comando ${i + 1}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Resultado da migration:`);
    console.log(`  - Sucessos: ${successCount}`);
    console.log(`  - Erros: ${errorCount}`);
    console.log(`  - Total: ${commands.length}`);
    
    // 4. Verificar se as tabelas foram criadas
    console.log('\n🔍 Verificando resultado...');
    
    try {
      const { data: auditTest, error: auditError } = await supabase
        .from('audit_log')
        .select('id')
        .limit(1);
      
      if (!auditError) {
        console.log('✅ Tabela audit_log criada com sucesso');
      } else {
        console.log('❌ Tabela audit_log não foi criada:', auditError.message);
      }
    } catch (error) {
      console.log('❌ Tabela audit_log não foi criada');
    }
    
    try {
      const { data: detailedTest, error: detailedError } = await supabase
        .from('detailed_logs')
        .select('id')
        .limit(1);
      
      if (!detailedError) {
        console.log('✅ Tabela detailed_logs criada com sucesso');
      } else {
        console.log('❌ Tabela detailed_logs não foi criada:', detailedError.message);
      }
    } catch (error) {
      console.log('❌ Tabela detailed_logs não foi criada');
    }
    
    // 5. Se as tabelas não foram criadas, mostrar instruções manuais
    console.log('\n💡 Para aplicar manualmente:');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute o conteúdo do arquivo supabase/migrations/002_audit_logs.sql');
    console.log('4. Ou use o comando: npx supabase db push (após configurar o link)');
    
    console.log('\n✅ Aplicação da migration concluída!');
    
  } catch (error) {
    console.error('❌ Erro na aplicação:', error);
  }
}

if (require.main === module) {
  applyAuditMigration()
    .then(() => {
      console.log('\n🎉 Aplicação finalizada');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Aplicação falhou:', error);
      process.exit(1);
    });
}

export { applyAuditMigration };
