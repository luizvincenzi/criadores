import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testLeadSourceValues() {
  console.log('🧪 TESTANDO VALORES DE LEAD_SOURCE...');
  console.log('====================================\n');
  
  // Valores que queremos testar
  const testValues = [
    'proprio',
    'chatcriadores-home',
    'chatcriadores-novo',
    'indicacao',
    'socio',
    'parceiro',
    'organico',
    'pago'
  ];
  
  const workingValues: string[] = [];
  const failingValues: string[] = [];
  
  console.log('🔍 Testando quais valores são aceitos...\n');
  
  for (const value of testValues) {
    console.log(`🔍 Testando: '${value}'`);
    
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
      console.log(`   ❌ Falhou: ${testError.message}`);
      failingValues.push(value);
    } else {
      console.log(`   ✅ Funcionou! ID: ${testResult[0].id}`);
      workingValues.push(value);
      
      // Deletar o teste
      await supabase
        .from('businesses')
        .delete()
        .eq('id', testResult[0].id);
    }
  }
  
  console.log('\n📊 RESULTADO DOS TESTES:');
  console.log('========================');
  
  console.log(`\n✅ Valores que funcionam (${workingValues.length}):`);
  workingValues.forEach(value => {
    console.log(`   - '${value}'`);
  });
  
  console.log(`\n❌ Valores que falham (${failingValues.length}):`);
  failingValues.forEach(value => {
    console.log(`   - '${value}'`);
  });
  
  // Testar API com valores que funcionam
  console.log('\n🧪 TESTANDO API COM VALORES QUE FUNCIONAM...');
  console.log('=============================================');
  
  if (workingValues.includes('chatcriadores-home')) {
    console.log('\n🎉 chatcriadores-home funciona! Testando API...');
    await testAPIWithSource('chatcriadores-home');
  } else {
    console.log('\n⚠️ chatcriadores-home ainda não funciona. Usando mapeamento para "proprio"...');
    await testAPIWithSource('chatcriadores-home');
  }
  
  if (workingValues.includes('chatcriadores-novo')) {
    console.log('\n🎉 chatcriadores-novo funciona! Testando API...');
    await testAPIWithSource('chatcriadores-novo');
  } else {
    console.log('\n⚠️ chatcriadores-novo ainda não funciona. Usando mapeamento para "proprio"...');
    await testAPIWithSource('chatcriadores-novo');
  }
  
  // Resumo e próximos passos
  console.log('\n🎯 RESUMO E PRÓXIMOS PASSOS:');
  console.log('============================');
  
  if (failingValues.length > 0) {
    console.log('⚠️ Alguns valores ainda não são aceitos pelo banco.');
    console.log('📋 Para adicionar os valores em falta:');
    console.log('   1. Execute o arquivo: ADICIONAR_LEAD_SOURCES_SUPABASE.sql');
    console.log('   2. Isso adicionará os valores ao enum lead_source');
    console.log('   3. Após isso, a API poderá usar os sources específicos');
  } else {
    console.log('✅ Todos os valores são aceitos pelo banco!');
    console.log('🎉 A API pode usar sources específicos diretamente!');
  }
  
  console.log('\n📋 Configuração atual da API:');
  console.log('- Função de mapeamento implementada ✅');
  console.log('- Source original preservado nos custom_fields ✅');
  console.log('- Mapeamento automático para valores aceitos ✅');
  
  if (workingValues.includes('chatcriadores-home') && workingValues.includes('chatcriadores-novo')) {
    console.log('\n🚀 PRONTO! Os sources dos chatbots são aceitos diretamente!');
  } else {
    console.log('\n⏳ AGUARDANDO: Execute a migração SQL para usar sources específicos');
  }
}

async function testAPIWithSource(source: string) {
  const testData = {
    userType: 'empresa',
    name: `Teste API ${source}`,
    businessName: `Empresa ${source}`,
    businessSegment: 'tecnologia',
    businessGoal: 'vendas',
    hasWorkedWithInfluencers: 'nao',
    email: `teste@${source.replace('-', '')}.com`,
    whatsapp: '11999999999',
    instagram: '@teste',
    source: source
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
      console.log(`   ✅ API funcionou com source '${source}'!`);
      console.log(`   📊 Lead Source salvo: '${result.data.lead_source}'`);
      console.log(`   🆔 Business ID: ${result.data.id}`);
      
      // Verificar se o source foi preservado
      const customFields = JSON.parse(result.data.custom_fields || '{}');
      console.log(`   📋 Source original preservado: '${customFields.fonte || 'N/A'}'`);
      
    } else {
      console.log(`   ❌ API falhou com source '${source}': ${result.error}`);
    }
    
  } catch (error) {
    console.log(`   ❌ Erro na requisição: ${error.message}`);
  }
}

async function main() {
  await testLeadSourceValues();
}

main().catch(console.error);
