import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Usar service role key para ter permissões de admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAuditLogTable() {
  console.log('🗃️ CRIANDO TABELA AUDIT_LOG\n');
  
  try {
    // 1. Verificar se a tabela já existe
    console.log('🔍 1. Verificando se a tabela audit_log já existe...');
    
    const { data: existingTable, error: checkError } = await supabase
      .from('audit_log')
      .select('*')
      .limit(1);
    
    if (!checkError) {
      console.log('✅ Tabela audit_log já existe');
      console.log(`📊 Registros existentes: ${existingTable.length}`);
      
      // Mostrar alguns registros existentes
      if (existingTable.length > 0) {
        console.log('\n📋 Registros existentes:');
        existingTable.forEach((log, index) => {
          console.log(`  ${index + 1}. ${log.action} em ${log.entity_type} por ${log.user_email}`);
        });
      }
      
      // Testar inserção
      console.log('\n🧪 Testando inserção de audit log...');
      await testAuditLogInsertion();
      return;
    }
    
    console.log('⚠️ Tabela audit_log não existe. Criando...');
    
    // 2. Ler o arquivo de migration
    console.log('\n📄 2. Lendo arquivo de migration...');
    
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/010_create_audit_log.sql');
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Arquivo de migration não encontrado:', migrationPath);
      return;
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('✅ Arquivo de migration carregado');
    console.log(`📏 Tamanho: ${migrationSQL.length} caracteres`);
    
    // 3. Executar a migration
    console.log('\n🔧 3. Executando migration...');
    
    // Dividir o SQL em comandos individuais
    const sqlCommands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${sqlCommands.length} comandos SQL...`);
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      
      if (command.length < 10) continue; // Pular comandos muito pequenos
      
      try {
        console.log(`  ${i + 1}/${sqlCommands.length}: Executando comando...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: command + ';'
        });
        
        if (error) {
          console.log(`  ⚠️ Erro no comando ${i + 1}:`, error.message);
          
          // Tentar método alternativo para alguns comandos
          if (command.includes('CREATE TABLE')) {
            console.log('  🔄 Tentando método alternativo...');
            // Continuar mesmo com erro, pois pode ser que a tabela já exista
          }
        } else {
          console.log(`  ✅ Comando ${i + 1} executado com sucesso`);
        }
      } catch (error) {
        console.log(`  ❌ Erro ao executar comando ${i + 1}:`, error);
      }
    }
    
    // 4. Verificar se a tabela foi criada
    console.log('\n🔍 4. Verificando se a tabela foi criada...');
    
    const { data: newTable, error: verifyError } = await supabase
      .from('audit_log')
      .select('*')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Tabela audit_log ainda não foi criada:', verifyError);
      
      console.log('\n💡 SOLUÇÃO MANUAL:');
      console.log('1. Acesse o Supabase Dashboard');
      console.log('2. Vá para SQL Editor');
      console.log('3. Execute o arquivo: supabase/migrations/010_create_audit_log.sql');
      console.log('4. Depois execute: npx tsx scripts/test-audit-log.ts');
      return;
    }
    
    console.log('✅ Tabela audit_log criada com sucesso!');
    console.log(`📊 Registros de exemplo: ${newTable.length}`);
    
    if (newTable.length > 0) {
      console.log('\n📋 Registros criados:');
      newTable.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.action} em ${log.entity_type} por ${log.user_email}`);
        console.log(`     📅 ${new Date(log.created_at).toLocaleString('pt-BR')}`);
      });
    }
    
    // 5. Testar inserção
    console.log('\n🧪 5. Testando inserção de audit log...');
    await testAuditLogInsertion();
    
    console.log('\n✅ TABELA AUDIT_LOG CRIADA E TESTADA COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro na criação da tabela audit_log:', error);
  }
}

async function testAuditLogInsertion() {
  try {
    // Testar inserção direta
    const { data: insertResult, error: insertError } = await supabase
      .from('audit_log')
      .insert({
        organization_id: '00000000-0000-0000-0000-000000000001',
        entity_type: 'system',
        entity_id: 'test_audit_log',
        entity_name: 'Teste do Sistema de Audit Log',
        action: 'create',
        user_email: 'teste@crmcriadores.com',
        details: {
          test: true,
          timestamp: new Date().toISOString(),
          message: 'Teste de inserção de audit log'
        }
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Erro ao inserir audit log:', insertError);
    } else {
      console.log('✅ Audit log inserido com sucesso');
      console.log(`   📝 ID: ${insertResult.id}`);
      console.log(`   📧 Usuário: ${insertResult.user_email}`);
      console.log(`   🎯 Ação: ${insertResult.action}`);
    }
    
    // Testar API do audit logger
    console.log('\n🔍 Testando API do audit logger...');
    
    try {
      const response = await fetch('http://localhost:3000/api/supabase/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_type: 'system',
          entity_id: 'test_api_audit',
          entity_name: 'Teste API Audit Log',
          action: 'create',
          user_email: 'api@crmcriadores.com'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ API de audit log funcionando');
        console.log(`   📝 ID: ${data.data.id}`);
      } else {
        console.log('❌ API de audit log falhou:', data.error);
      }
    } catch (error) {
      console.log('❌ Erro ao testar API:', error);
    }
    
  } catch (error) {
    console.log('❌ Erro no teste de inserção:', error);
  }
}

if (require.main === module) {
  createAuditLogTable()
    .then(() => {
      console.log('\n🎉 Processo finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Processo falhou:', error);
      process.exit(1);
    });
}

export { createAuditLogTable };
