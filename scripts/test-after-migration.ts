import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAfterMigration() {
  console.log('🧪 TESTANDO SISTEMA APÓS MIGRAÇÃO...');
  console.log('===================================\n');
  
  // 1. Verificar se a migração foi aplicada
  console.log('🔍 1. Verificando se a migração foi aplicada...');
  
  try {
    // Verificar tipo da coluna lead_source
    const { data: columnInfo, error: columnError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, character_maximum_length
          FROM information_schema.columns 
          WHERE table_name = 'businesses' 
          AND column_name = 'lead_source'
        `
      });
      
    if (columnError) {
      console.log('❌ Erro ao verificar coluna:', columnError.message);
    } else {
      console.log('✅ Informações da coluna lead_source:');
      console.log('   Tipo:', columnInfo[0]?.data_type || 'N/A');
      console.log('   Tamanho máximo:', columnInfo[0]?.character_maximum_length || 'N/A');
    }
  } catch (error) {
    console.log('⚠️ Não foi possível verificar via RPC, testando diretamente...');
  }
  
  // 2. Testar inserção direta no banco
  console.log('\n🔍 2. Testando inserção direta no banco...');
  
  const testValues = ['chatcriadores-home', 'chatcriadores-novo', 'indicacao', 'socio'];
  const workingValues: string[] = [];
  const failingValues: string[] = [];
  
  for (const value of testValues) {
    console.log(`   Testando: '${value}'`);
    
    const testBusiness = {
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: `Teste ${value} ${Date.now()}`,
      business_stage: '01_PROSPECT',
      status: 'Reunião de briefing',
      is_active: true,
      lead_source: value
    };
    
    const { data: testResult, error: testError } = await supabase
      .from('businesses')
      .insert([testBusiness])
      .select();
      
    if (testError) {
      console.log(`     ❌ Falhou: ${testError.message}`);
      failingValues.push(value);
    } else {
      console.log(`     ✅ Funcionou! ID: ${testResult[0].id}`);
      workingValues.push(value);
      
      // Deletar o teste
      await supabase
        .from('businesses')
        .delete()
        .eq('id', testResult[0].id);
    }
  }
  
  // 3. Testar API do chatbot
  console.log('\n🧪 3. Testando API do chatbot...');
  
  const apiTests = [
    {
      name: 'ChatCriadores Home',
      source: 'chatcriadores-home',
      expectedLeadSource: 'chatcriadores-home'
    },
    {
      name: 'ChatCriadores Novo',
      source: 'chatcriadores-novo', 
      expectedLeadSource: 'chatcriadores-novo'
    },
    {
      name: 'Indicação',
      source: 'indicacao',
      expectedLeadSource: 'indicacao'
    }
  ];
  
  const apiResults: any[] = [];
  
  for (const test of apiTests) {
    console.log(`\n   🔍 Testando API com source: '${test.source}'`);
    
    const testData = {
      userType: 'empresa',
      name: `Teste API ${test.name}`,
      businessName: `Empresa ${test.name}`,
      businessSegment: 'tecnologia',
      businessGoal: 'vendas',
      hasWorkedWithInfluencers: 'nao',
      email: `teste@${test.source.replace('-', '')}.com`,
      whatsapp: '11999999999',
      instagram: '@teste',
      source: test.source
    };
    
    try {
      const response = await fetch('http://localhost:3001/api/chatbot/save-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log(`     ✅ API funcionou!`);
        console.log(`     📊 Lead Source salvo: '${result.data.lead_source}'`);
        console.log(`     🎯 Lead Source esperado: '${test.expectedLeadSource}'`);
        
        const isCorrect = result.data.lead_source === test.expectedLeadSource;
        console.log(`     ${isCorrect ? '🎉' : '⚠️'} ${isCorrect ? 'CORRETO!' : 'INCORRETO'}`);
        
        apiResults.push({
          source: test.source,
          expected: test.expectedLeadSource,
          actual: result.data.lead_source,
          correct: isCorrect,
          businessId: result.data.id
        });
        
      } else {
        console.log(`     ❌ API falhou: ${result.error}`);
        apiResults.push({
          source: test.source,
          expected: test.expectedLeadSource,
          actual: 'ERRO',
          correct: false,
          error: result.error
        });
      }
      
    } catch (error) {
      console.log(`     ❌ Erro na requisição: ${error.message}`);
    }
  }
  
  // 4. Resumo final
  console.log('\n🎯 RESUMO FINAL:');
  console.log('================');
  
  console.log(`\n📊 Teste direto no banco:`);
  console.log(`   ✅ Funcionam: ${workingValues.join(', ') || 'Nenhum'}`);
  console.log(`   ❌ Falham: ${failingValues.join(', ') || 'Nenhum'}`);
  
  console.log(`\n🧪 Teste da API:`);
  apiResults.forEach(result => {
    const status = result.correct ? '✅' : '❌';
    console.log(`   ${status} ${result.source}: esperado '${result.expected}', obtido '${result.actual}'`);
  });
  
  const allCorrect = apiResults.every(r => r.correct);
  const migrationWorked = workingValues.length > 1; // Mais que apenas 'proprio'
  
  console.log('\n🎉 STATUS GERAL:');
  if (migrationWorked && allCorrect) {
    console.log('✅ MIGRAÇÃO APLICADA COM SUCESSO!');
    console.log('✅ API FUNCIONANDO PERFEITAMENTE!');
    console.log('✅ LEAD_SOURCE ESPECÍFICO FUNCIONANDO!');
    console.log('');
    console.log('🚀 Sistema pronto para produção!');
    console.log('📊 Todos os leads terão origem específica identificada!');
  } else if (migrationWorked && !allCorrect) {
    console.log('✅ MIGRAÇÃO APLICADA!');
    console.log('⚠️ API precisa de ajustes na função de mapeamento');
  } else {
    console.log('⚠️ MIGRAÇÃO AINDA NÃO APLICADA');
    console.log('📋 Execute: SOLUÇÃO_SIMPLES_LEAD_SOURCE.sql');
    console.log('🔄 Depois execute este script novamente');
  }
}

async function main() {
  await testAfterMigration();
}

main().catch(console.error);
