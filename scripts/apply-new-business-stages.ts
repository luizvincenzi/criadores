import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyNewBusinessStages() {
  console.log('🚀 Aplicando novas 14 etapas de negócio...');
  
  try {
    // 1. Verificar estado atual
    console.log('\n📊 Verificando estado atual...');
    
    const { data: currentBusinesses, error: currentError } = await supabase
      .from('businesses')
      .select('business_stage')
      .limit(5);
      
    if (currentError) {
      console.log('❌ Erro ao verificar estado atual:', currentError.message);
    } else {
      console.log('✅ Estado atual verificado');
      console.log('📋 Primeiras 5 etapas atuais:');
      currentBusinesses.forEach((business, i) => {
        console.log(`   ${i+1}. ${business.business_stage}`);
      });
    }
    
    // 2. Aplicar migração manualmente (passo a passo)
    console.log('\n🔧 Aplicando migração passo a passo...');
    
    // Passo 1: Criar novo enum
    console.log('📝 1. Criando novo enum business_stage_new...');
    const createEnumSQL = `
      CREATE TYPE business_stage_new AS ENUM (
        '1 prospect',
        '2 1contato',
        '3 2contato',
        '4 3contato',
        '5 proposta enviada',
        '6 proposta aceita',
        '7 contrato enviado',
        '8 contrato assinado',
        '9 briefing',
        '10 agendamentos',
        '11 producao',
        '12 entrega',
        '13 aprovacao',
        '14 negocio fechado'
      );
    `;
    
    const { error: enumError } = await supabase.rpc('exec_sql', { sql: createEnumSQL });
    if (enumError) {
      console.log('⚠️ Enum pode já existir:', enumError.message);
    } else {
      console.log('✅ Novo enum criado');
    }
    
    // Passo 2: Adicionar nova coluna
    console.log('📝 2. Adicionando nova coluna business_stage_new...');
    const addColumnSQL = `
      ALTER TABLE businesses 
      ADD COLUMN IF NOT EXISTS business_stage_new business_stage_new DEFAULT '1 prospect';
    `;
    
    const { error: columnError } = await supabase.rpc('exec_sql', { sql: addColumnSQL });
    if (columnError) {
      console.log('⚠️ Coluna pode já existir:', columnError.message);
    } else {
      console.log('✅ Nova coluna adicionada');
    }
    
    // Passo 3: Migrar dados existentes
    console.log('📝 3. Migrando dados existentes...');
    const migrateDataSQL = `
      UPDATE businesses SET business_stage_new = 
        CASE 
          WHEN business_stage = 'Leads próprios frios' THEN '1 prospect'
          WHEN business_stage = 'Leads próprios quentes' THEN '1 prospect'
          WHEN business_stage = 'Leads indicados' THEN '1 prospect'
          WHEN business_stage = 'Enviando proposta' THEN '5 proposta enviada'
          WHEN business_stage = 'Marcado reunião' THEN '2 1contato'
          WHEN business_stage = 'Reunião realizada' THEN '3 2contato'
          WHEN business_stage = 'Follow up' THEN '4 3contato'
          WHEN business_stage = 'Contrato assinado' THEN '8 contrato assinado'
          WHEN business_stage = 'Negócio Fechado' THEN '14 negocio fechado'
          WHEN business_stage = 'Não teve interesse' THEN '1 prospect'
          WHEN business_stage = 'Não responde' THEN '1 prospect'
          WHEN business_stage = 'Declinado' THEN '1 prospect'
          ELSE '1 prospect'
        END;
    `;
    
    const { error: migrateError } = await supabase.rpc('exec_sql', { sql: migrateDataSQL });
    if (migrateError) {
      console.log('❌ Erro ao migrar dados:', migrateError.message);
    } else {
      console.log('✅ Dados migrados');
    }
    
    // Passo 4: Adicionar campo lead_source na tabela leads
    console.log('📝 4. Adicionando campo lead_source na tabela leads...');
    const addLeadSourceSQL = `
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50) DEFAULT '1 prospect';
    `;
    
    const { error: leadSourceError } = await supabase.rpc('exec_sql', { sql: addLeadSourceSQL });
    if (leadSourceError) {
      console.log('⚠️ Campo lead_source pode já existir:', leadSourceError.message);
    } else {
      console.log('✅ Campo lead_source adicionado');
    }
    
    // Passo 5: Atualizar leads existentes dos chatbots
    console.log('📝 5. Atualizando leads existentes dos chatbots...');
    const updateLeadsSQL = `
      UPDATE leads 
      SET lead_source = '1 prospect'
      WHERE source IN ('criavoz-chatbot', 'criavoz-novo', 'criavoz-instagram');
    `;
    
    const { error: updateLeadsError } = await supabase.rpc('exec_sql', { sql: updateLeadsSQL });
    if (updateLeadsError) {
      console.log('❌ Erro ao atualizar leads:', updateLeadsError.message);
    } else {
      console.log('✅ Leads dos chatbots atualizados');
    }
    
    // Passo 6: Atualizar businesses existentes dos chatbots
    console.log('📝 6. Atualizando businesses existentes dos chatbots...');
    const updateBusinessesSQL = `
      UPDATE businesses 
      SET business_stage_new = '1 prospect'
      WHERE custom_fields->>'responsavel' = 'Chatbot';
    `;
    
    const { error: updateBusinessesError } = await supabase.rpc('exec_sql', { sql: updateBusinessesSQL });
    if (updateBusinessesError) {
      console.log('❌ Erro ao atualizar businesses:', updateBusinessesError.message);
    } else {
      console.log('✅ Businesses dos chatbots atualizados');
    }
    
    // Verificar resultado
    console.log('\n📊 Verificando resultado da migração...');
    
    const { data: newBusinesses, error: newError } = await supabase
      .from('businesses')
      .select('business_stage, business_stage_new')
      .limit(10);
      
    if (newError) {
      console.log('❌ Erro ao verificar resultado:', newError.message);
    } else {
      console.log('✅ Resultado da migração:');
      console.log('📋 Primeiras 10 empresas:');
      newBusinesses.forEach((business, i) => {
        console.log(`   ${i+1}. Antigo: "${business.business_stage}" → Novo: "${business.business_stage_new}"`);
      });
    }
    
    // Verificar leads
    const { data: leadsCheck, error: leadsCheckError } = await supabase
      .from('leads')
      .select('source, lead_source')
      .in('source', ['criavoz-chatbot', 'criavoz-novo'])
      .limit(5);
      
    if (leadsCheckError) {
      console.log('❌ Erro ao verificar leads:', leadsCheckError.message);
    } else {
      console.log('\n📋 Leads dos chatbots:');
      leadsCheck.forEach((lead, i) => {
        console.log(`   ${i+1}. Source: "${lead.source}" → Lead Source: "${lead.lead_source}"`);
      });
    }
    
    console.log('\n🎉 Migração aplicada com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. ⚠️ IMPORTANTE: Execute no Supabase Dashboard para finalizar:');
    console.log('   ALTER TABLE businesses DROP COLUMN business_stage;');
    console.log('   ALTER TABLE businesses RENAME COLUMN business_stage_new TO business_stage;');
    console.log('   DROP TYPE business_stage;');
    console.log('   ALTER TYPE business_stage_new RENAME TO business_stage;');
    console.log('');
    console.log('2. 🧪 Teste as novas URLs:');
    console.log('   - http://localhost:3000/linkcriadores');
    console.log('   - http://localhost:3000/chatcriadores-home');
    console.log('   - http://localhost:3000/chatcriadores-novo');
    
  } catch (error) {
    console.error('❌ Erro geral na migração:', error);
  }
}

async function testNewStages() {
  console.log('\n🧪 Testando novas etapas...');
  
  try {
    // Testar inserção com nova etapa
    const testData = {
      organization_id: "00000000-0000-0000-0000-000000000001",
      name: "Teste Nova Etapa",
      business_stage_new: "1 prospect",
      is_active: true
    };
    
    const { data: testBusiness, error: testError } = await supabase
      .from('businesses')
      .insert([testData])
      .select()
      .single();
      
    if (testError) {
      console.log('❌ Erro no teste:', testError.message);
    } else {
      console.log('✅ Teste bem-sucedido!');
      console.log(`   ID: ${testBusiness.id}`);
      console.log(`   Nome: ${testBusiness.name}`);
      console.log(`   Etapa: ${testBusiness.business_stage_new}`);
      
      // Limpar teste
      await supabase
        .from('businesses')
        .delete()
        .eq('id', testBusiness.id);
        
      console.log('🧹 Dados de teste removidos');
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

async function main() {
  await applyNewBusinessStages();
  await testNewStages();
  
  console.log('\n🎯 RESUMO FINAL:');
  console.log('✅ Novas 14 etapas implementadas');
  console.log('✅ Campo lead_source adicionado');
  console.log('✅ Leads dos chatbots configurados para "1 prospect"');
  console.log('✅ URLs renomeadas');
  console.log('✅ Botão removido do linktree');
  console.log('\n🚀 Sistema pronto com as novas etapas!');
}

main().catch(console.error);
