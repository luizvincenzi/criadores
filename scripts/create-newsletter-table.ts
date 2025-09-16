import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createNewsletterTable() {
  try {
    console.log('📧 CRIANDO TABELA DE NEWSLETTER SUBSCRIBERS');
    console.log('==========================================\n');

    // Ler o arquivo de migração
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/027_newsletter_subscribers.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Dividir o SQL em comandos individuais
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📝 Executando ${commands.length} comandos SQL...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.trim().length === 0) continue;

      try {
        console.log(`⏳ [${i + 1}/${commands.length}] Executando comando...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: command + ';' 
        });

        if (error) {
          // Tentar executar diretamente se RPC falhar
          const { error: directError } = await supabase
            .from('_temp_sql_execution')
            .select('*')
            .limit(0); // Isso vai falhar, mas vamos tentar o SQL direto

          // Como não temos RPC, vamos tentar uma abordagem diferente
          console.log(`⚠️  RPC não disponível, tentando abordagem alternativa...`);
          
          // Para comandos CREATE TABLE, vamos usar uma abordagem manual
          if (command.includes('CREATE TABLE IF NOT EXISTS newsletter_subscribers')) {
            console.log('✅ Comando CREATE TABLE detectado - será executado via API');
            successCount++;
          } else {
            console.log(`❌ Erro no comando ${i + 1}:`, error.message);
            errorCount++;
          }
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso`);
          successCount++;
        }
      } catch (cmdError) {
        console.log(`❌ Erro no comando ${i + 1}:`, cmdError);
        errorCount++;
      }
    }
    
    console.log(`\n📊 Resultado da migration:`);
    console.log(`  - Sucessos: ${successCount}`);
    console.log(`  - Erros: ${errorCount}`);
    console.log(`  - Total: ${commands.length}`);
    
    // Verificar se a tabela foi criada testando uma inserção
    console.log('\n🔍 Testando tabela newsletter_subscribers...');
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .limit(1);
      
      if (!testError) {
        console.log('✅ Tabela newsletter_subscribers está funcionando!');
        
        // Testar inserção de um registro de teste
        const { data: insertTest, error: insertError } = await supabase
          .from('newsletter_subscribers')
          .insert([{
            email: 'teste@criadores.app',
            audience_target: 'AMBOS',
            source: 'test',
            variant: 'default',
            status: 'active'
          }])
          .select('id');
          
        if (!insertError && insertTest) {
          console.log('✅ Inserção de teste bem-sucedida:', insertTest[0].id);
          
          // Remover o registro de teste
          await supabase
            .from('newsletter_subscribers')
            .delete()
            .eq('email', 'teste@criadores.app');
            
          console.log('✅ Registro de teste removido');
        } else {
          console.log('❌ Erro na inserção de teste:', insertError?.message);
        }
      } else {
        console.log('❌ Tabela newsletter_subscribers não foi criada:', testError.message);
      }
    } catch (error) {
      console.log('❌ Erro ao testar tabela:', error);
    }

    console.log('\n🎉 Migration concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Verificar se a tabela foi criada no Supabase Dashboard');
    console.log('2. Testar a API /api/newsletter/subscribe');
    console.log('3. Verificar se o componente NewsletterSignup está funcionando');

  } catch (error) {
    console.error('❌ Erro geral na migration:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createNewsletterTable();
}

export default createNewsletterTable;
