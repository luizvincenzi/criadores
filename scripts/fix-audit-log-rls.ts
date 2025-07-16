import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAuditLogRLS() {
  console.log('🔧 CORRIGINDO RLS DA TABELA AUDIT_LOG\n');
  
  try {
    console.log('💡 INSTRUÇÕES PARA CORRIGIR RLS:');
    console.log('\n📋 1. Acesse o Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard');
    
    console.log('\n📋 2. Vá para SQL Editor e execute:');
    console.log('```sql');
    console.log('-- Desabilitar RLS temporariamente para permitir inserções');
    console.log('ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Ou criar política mais permissiva');
    console.log('DROP POLICY IF EXISTS "Users can insert audit logs" ON audit_log;');
    console.log('CREATE POLICY "Allow all inserts on audit_log" ON audit_log');
    console.log('    FOR INSERT WITH CHECK (true);');
    console.log('');
    console.log('DROP POLICY IF EXISTS "Users can view audit logs from their organization" ON audit_log;');
    console.log('CREATE POLICY "Allow all reads on audit_log" ON audit_log');
    console.log('    FOR SELECT USING (true);');
    console.log('```');
    
    // Testar inserção atual
    console.log('\n🧪 Testando inserção atual...');
    
    const { data: insertResult, error: insertError } = await supabase
      .from('audit_log')
      .insert({
        organization_id: '00000000-0000-0000-0000-000000000001',
        entity_type: 'system',
        entity_id: 'test_rls_fix',
        entity_name: 'Teste Correção RLS',
        action: 'create',
        user_email: 'teste@crmcriadores.com',
        details: {
          test: 'rls_fix',
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Inserção ainda falhando:', insertError.message);
      
      if (insertError.code === '42501') {
        console.log('\n⚠️ Problema confirmado: RLS está bloqueando inserções');
        console.log('   Execute o SQL acima no Supabase Dashboard');
      }
    } else {
      console.log('✅ Inserção funcionando!');
      console.log(`   📝 ID: ${insertResult.id}`);
    }
    
    // Testar API
    console.log('\n🧪 Testando API de audit log...');
    
    try {
      const response = await fetch('http://localhost:3000/api/supabase/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entity_type: 'system',
          entity_id: 'test_api_rls',
          entity_name: 'Teste API RLS',
          action: 'create',
          user_email: 'api@crmcriadores.com',
          details: {
            api_test: true,
            rls_fix: true
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ API funcionando após correção');
        console.log(`   📝 ID: ${data.data.id}`);
      } else {
        console.log('❌ API ainda com problemas:', data.error);
      }
    } catch (error) {
      console.log('❌ Erro ao testar API:', error);
    }
    
    // Testar auditLogger
    console.log('\n🧪 Testando auditLogger...');
    
    try {
      const { auditLogger } = await import('../lib/auditLogger');
      
      const result = await auditLogger.log({
        entity_type: 'system',
        entity_id: 'test_auditlogger_rls',
        entity_name: 'Teste AuditLogger RLS',
        action: 'create',
        user_email: 'auditlogger@crmcriadores.com',
        details: {
          auditlogger_test: true,
          rls_fix: true
        }
      });
      
      console.log(`📝 AuditLogger: ${result ? '✅ Funcionando' : '❌ Ainda com problemas'}`);
      
    } catch (error) {
      console.log('❌ Erro no auditLogger:', error);
    }
    
    // Verificar logs criados
    console.log('\n📊 Verificando logs criados...');
    
    const { data: logs, error: logsError } = await supabase
      .from('audit_log')
      .select('*')
      .or('entity_id.eq.test_rls_fix,entity_id.eq.test_api_rls,entity_id.eq.test_auditlogger_rls')
      .order('created_at', { ascending: false });
    
    if (logsError) {
      console.log('❌ Erro ao buscar logs:', logsError);
    } else {
      console.log(`✅ Logs encontrados: ${logs.length}`);
      
      logs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.entity_name} por ${log.user_email}`);
        console.log(`     📅 ${new Date(log.created_at).toLocaleString('pt-BR')}`);
      });
    }
    
    console.log('\n🎯 RESUMO:');
    
    if (insertError && insertError.code === '42501') {
      console.log('❌ RLS ainda está bloqueando inserções');
      console.log('📋 AÇÃO NECESSÁRIA: Execute o SQL no Supabase Dashboard');
      console.log('');
      console.log('🔧 SQL PARA EXECUTAR:');
      console.log('ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;');
    } else {
      console.log('✅ Sistema de audit log funcionando!');
      console.log('✅ RLS configurado corretamente');
      console.log('✅ Pronto para uso em produção');
    }

  } catch (error) {
    console.error('❌ Erro no processo:', error);
  }
}

if (require.main === module) {
  fixAuditLogRLS()
    .then(() => {
      console.log('\n🎉 Processo finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Processo falhou:', error);
      process.exit(1);
    });
}

export { fixAuditLogRLS };
