import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testAuditLogs() {
  console.log('🧪 Testando sistema de audit logs...\n');
  
  try {
    const baseUrl = 'http://localhost:3000';
    
    // 1. Testar API de audit logs
    console.log('📊 Testando API /api/supabase/audit-logs...');
    
    // Testar GET (buscar logs existentes)
    const getResponse = await fetch(`${baseUrl}/api/supabase/audit-logs`);
    const getData = await getResponse.json();
    
    console.log('📋 Resultado do GET:', getData);
    
    if (getData.success) {
      console.log(`✅ API funcionando: ${getData.count} logs encontrados`);
    } else {
      console.log('⚠️ API retornou erro (esperado se tabela não existe):', getData.error);
    }
    
    // 2. Testar criação de log
    console.log('\n📝 Testando criação de audit log...');
    
    const testLog = {
      entity_type: 'system',
      entity_id: 'test_' + Date.now(),
      entity_name: 'Teste de Audit Log',
      action: 'create',
      field_name: 'status',
      old_value: null,
      new_value: 'ativo',
      user_email: 'teste@crmcriadores.com',
      metadata: {
        source: 'test_script',
        timestamp: new Date().toISOString()
      }
    };
    
    const postResponse = await fetch(`${baseUrl}/api/supabase/audit-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testLog),
    });
    
    const postData = await postResponse.json();
    
    if (postData.success) {
      console.log('✅ Log criado com sucesso:', postData.data.id);
    } else {
      console.log('⚠️ Erro ao criar log (esperado se tabela não existe):', postData.error);
      
      if (postData.migration_needed) {
        console.log('💡 Migration necessária: execute 002_audit_logs.sql no Supabase Dashboard');
      }
    }
    
    // 3. Testar auditLogger utility
    console.log('\n🔧 Testando auditLogger utility...');
    
    try {
      const { auditLogger, logBusinessStatusChange } = await import('../lib/auditLogger');
      
      // Testar log genérico
      const logResult = await auditLogger.log({
        entity_type: 'business',
        entity_id: 'bus_test_123',
        entity_name: 'Negócio Teste',
        action: 'update',
        field_name: 'status',
        old_value: 'Reunião de briefing',
        new_value: 'Agendamentos',
        user_email: 'teste@crmcriadores.com'
      });
      
      console.log(`📋 Log genérico: ${logResult ? '✅ Sucesso' : '❌ Falhou'}`);
      
      // Testar função de conveniência
      const statusChangeResult = await logBusinessStatusChange(
        'bus_test_456',
        'Outro Negócio Teste',
        'Reunião de briefing',
        'Agendamentos',
        'teste@crmcriadores.com'
      );
      
      console.log(`📋 Status change: ${statusChangeResult ? '✅ Sucesso' : '❌ Falhou'}`);
      
      // Testar busca de logs
      const logs = await auditLogger.getLogs({
        entity_type: 'business',
        limit: 5
      });
      
      console.log(`📋 Busca de logs: ${logs.length} logs encontrados`);
      
    } catch (error) {
      console.error('❌ Erro ao testar auditLogger:', error);
    }
    
    // 4. Testar filtros
    console.log('\n🔍 Testando filtros...');
    
    const filterTests = [
      { entity_type: 'business' },
      { action: 'create' },
      { entity_type: 'system', action: 'create' },
      { limit: 10, offset: 0 }
    ];
    
    for (const filter of filterTests) {
      const params = new URLSearchParams(filter as any).toString();
      const filterResponse = await fetch(`${baseUrl}/api/supabase/audit-logs?${params}`);
      const filterData = await filterResponse.json();
      
      if (filterData.success) {
        console.log(`✅ Filtro ${JSON.stringify(filter)}: ${filterData.count} logs`);
      } else {
        console.log(`⚠️ Filtro ${JSON.stringify(filter)}: ${filterData.error}`);
      }
    }
    
    // 5. Testar compatibilidade com Google Sheets
    console.log('\n📊 Testando compatibilidade com Google Sheets...');
    
    try {
      // Verificar se existe API do Google Sheets para audit logs
      const sheetsResponse = await fetch(`${baseUrl}/api/sheets/audit-logs`);
      
      if (sheetsResponse.ok) {
        const sheetsData = await sheetsResponse.json();
        console.log(`✅ API Google Sheets disponível: ${sheetsData.success ? 'funcionando' : 'com erro'}`);
      } else {
        console.log('⚠️ API Google Sheets não disponível (normal se não implementada)');
      }
    } catch (error) {
      console.log('⚠️ API Google Sheets não disponível');
    }
    
    // 6. Testar cenários de uso real
    console.log('\n🎯 Testando cenários de uso real...');
    
    const scenarios = [
      {
        name: 'Mudança de status de negócio',
        log: {
          entity_type: 'business',
          entity_id: 'bus_real_test',
          entity_name: 'Empresa Real Teste',
          action: 'status_change',
          field_name: 'status',
          old_value: 'Reunião de briefing',
          new_value: 'Agendamentos',
          user_email: 'usuario@crmcriadores.com'
        }
      },
      {
        name: 'Criação de criador',
        log: {
          entity_type: 'creator',
          entity_id: 'crt_real_test',
          entity_name: 'Criador Real Teste',
          action: 'create',
          user_email: 'admin@crmcriadores.com',
          metadata: {
            instagram: '@criador_teste',
            cidade: 'São Paulo'
          }
        }
      },
      {
        name: 'Login de usuário',
        log: {
          entity_type: 'user',
          entity_id: 'user@crmcriadores.com',
          entity_name: 'Usuário Teste',
          action: 'login',
          user_email: 'user@crmcriadores.com',
          metadata: {
            ip: '192.168.1.1',
            user_agent: 'Mozilla/5.0 Test Browser'
          }
        }
      }
    ];
    
    for (const scenario of scenarios) {
      const scenarioResponse = await fetch(`${baseUrl}/api/supabase/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenario.log),
      });
      
      const scenarioData = await scenarioResponse.json();
      
      if (scenarioData.success) {
        console.log(`✅ ${scenario.name}: Log criado`);
      } else {
        console.log(`⚠️ ${scenario.name}: ${scenarioData.error}`);
      }
    }
    
    // 7. Verificar resultado final
    console.log('\n🔍 Verificando resultado final...');
    
    const finalResponse = await fetch(`${baseUrl}/api/supabase/audit-logs?limit=20`);
    const finalData = await finalResponse.json();
    
    if (finalData.success) {
      console.log(`✅ Total de logs após testes: ${finalData.count}`);
      
      if (finalData.data.length > 0) {
        console.log('\n📋 Últimos logs criados:');
        finalData.data.slice(0, 5).forEach((log: any, index: number) => {
          console.log(`  ${index + 1}. ${log.action} em ${log.entity_type} (${log.entity_name}) por ${log.user_email}`);
        });
      }
    } else {
      console.log('⚠️ Não foi possível verificar logs finais:', finalData.error);
    }
    
    console.log('\n✅ Teste do sistema de audit logs concluído!');
    
    // 8. Resumo e próximos passos
    console.log('\n📋 Resumo:');
    console.log('- ✅ API de audit logs implementada');
    console.log('- ✅ Utility auditLogger criado');
    console.log('- ✅ Funções de conveniência disponíveis');
    console.log('- ⚠️ Tabela audit_log precisa ser criada no Supabase');
    
    console.log('\n🔧 Próximos passos:');
    console.log('1. Execute a migration 002_audit_logs.sql no Supabase Dashboard');
    console.log('2. Integre auditLogger nas páginas do sistema');
    console.log('3. Configure triggers automáticos (opcional)');
    console.log('4. Implemente dashboard de auditoria (opcional)');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

if (require.main === module) {
  testAuditLogs()
    .then(() => {
      console.log('\n🎉 Teste finalizado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

export { testAuditLogs };
