import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRecentLeads() {
  console.log('🔧 CORRIGINDO LEADS RECENTES DOS CHATBOTS');
  console.log('==========================================\n');
  
  try {
    // 1. Verificar leads recentes dos chatbots (últimas 24 horas)
    console.log('📊 1. Verificando leads recentes dos chatbots...');
    
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const { data: recentLeads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .in('source', ['criavoz-chatbot', 'criavoz-novo', 'chatcriadores-home', 'chatcriadores-novo'])
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false });
      
    if (leadsError) {
      console.log('❌ Erro ao buscar leads recentes:', leadsError.message);
      return;
    }
    
    console.log(`✅ Encontrados ${recentLeads.length} leads recentes dos chatbots`);
    
    if (recentLeads.length === 0) {
      console.log('ℹ️ Nenhum lead recente encontrado');
      return;
    }
    
    // 2. Mostrar leads encontrados
    console.log('\n📋 Leads recentes encontrados:');
    recentLeads.forEach((lead, i) => {
      console.log(`   ${i+1}. ID: ${lead.id}`);
      console.log(`      Nome: ${lead.name}`);
      console.log(`      Email: ${lead.email}`);
      console.log(`      Source: ${lead.source}`);
      console.log(`      Lead Source: ${lead.lead_source || 'NÃO DEFINIDO'}`);
      console.log(`      Created: ${new Date(lead.created_at).toLocaleString('pt-BR')}`);
      console.log('');
    });
    
    // 3. Corrigir campo lead_source nos leads
    console.log('🔧 2. Corrigindo campo lead_source...');
    
    const leadsToUpdate = recentLeads.filter(lead => !lead.lead_source || lead.lead_source !== '1 prospect');
    
    if (leadsToUpdate.length > 0) {
      console.log(`📝 Atualizando ${leadsToUpdate.length} leads sem lead_source correto...`);
      
      for (const lead of leadsToUpdate) {
        const { error: updateError } = await supabase
          .from('leads')
          .update({ lead_source: '1 prospect' })
          .eq('id', lead.id);
          
        if (updateError) {
          console.log(`❌ Erro ao atualizar lead ${lead.id}:`, updateError.message);
        } else {
          console.log(`✅ Lead ${lead.id} (${lead.name}) atualizado com lead_source: '1 prospect'`);
        }
      }
    } else {
      console.log('✅ Todos os leads já têm lead_source correto');
    }
    
    // 4. Verificar businesses relacionados
    console.log('\n🏢 3. Verificando businesses relacionados...');
    
    // Buscar businesses criados por chatbot nas últimas 24 horas
    const { data: recentBusinesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .gte('created_at', oneDayAgo.toISOString())
      .order('created_at', { ascending: false });
      
    if (businessError) {
      console.log('❌ Erro ao buscar businesses recentes:', businessError.message);
      return;
    }
    
    // Filtrar apenas os do chatbot
    const chatbotBusinesses = recentBusinesses.filter(business => {
      try {
        const customFields = typeof business.custom_fields === 'string' 
          ? JSON.parse(business.custom_fields) 
          : business.custom_fields || {};
        return customFields.responsavel === 'Chatbot';
      } catch (error) {
        return false;
      }
    });
    
    console.log(`✅ Encontrados ${chatbotBusinesses.length} businesses recentes do chatbot`);
    
    if (chatbotBusinesses.length > 0) {
      console.log('\n📋 Businesses do chatbot encontrados:');
      chatbotBusinesses.forEach((business, i) => {
        const customFields = JSON.parse(business.custom_fields || '{}');
        console.log(`   ${i+1}. ID: ${business.id}`);
        console.log(`      Nome: ${business.name}`);
        console.log(`      Business Stage: ${business.business_stage}`);
        console.log(`      Status: ${business.status}`);
        console.log(`      Protocolo: ${customFields.protocoloChatbot || 'N/A'}`);
        console.log(`      Created: ${new Date(business.created_at).toLocaleString('pt-BR')}`);
        console.log('');
      });
      
      // 5. Corrigir business_stage e status
      console.log('🔧 4. Corrigindo business_stage e status...');
      
      const businessesToUpdate = chatbotBusinesses.filter(business => 
        business.business_stage !== '1 prospect' || business.status !== 'Reunião de briefing'
      );
      
      if (businessesToUpdate.length > 0) {
        console.log(`📝 Atualizando ${businessesToUpdate.length} businesses com configurações incorretas...`);
        
        for (const business of businessesToUpdate) {
          const { error: updateError } = await supabase
            .from('businesses')
            .update({ 
              business_stage: '1 prospect',
              status: 'Reunião de briefing'
            })
            .eq('id', business.id);
            
          if (updateError) {
            console.log(`❌ Erro ao atualizar business ${business.id}:`, updateError.message);
          } else {
            console.log(`✅ Business ${business.id} (${business.name}) atualizado:`);
            console.log(`   - Business Stage: '1 prospect'`);
            console.log(`   - Status: 'Reunião de briefing'`);
          }
        }
      } else {
        console.log('✅ Todos os businesses já têm configurações corretas');
      }
    }
    
    // 6. Verificar se a migração foi aplicada
    console.log('\n🔍 5. Verificando se a migração foi aplicada...');
    
    try {
      // Tentar buscar com as novas etapas
      const { data: stageTest, error: stageError } = await supabase
        .from('businesses')
        .select('business_stage')
        .eq('business_stage', '1 prospect')
        .limit(1);
        
      if (stageError) {
        console.log('⚠️ Migração ainda não foi aplicada. Execute o SQL no Supabase Dashboard:');
        console.log('   📄 Arquivo: EXECUTE_NO_SUPABASE_DASHBOARD.sql');
      } else {
        console.log('✅ Migração aplicada com sucesso! Novas etapas funcionando.');
      }
    } catch (error) {
      console.log('⚠️ Erro ao verificar migração:', error);
    }
    
    // 7. Resumo final
    console.log('\n🎯 RESUMO DA CORREÇÃO:');
    console.log('======================');
    console.log(`✅ Leads verificados: ${recentLeads.length}`);
    console.log(`✅ Businesses verificados: ${chatbotBusinesses.length}`);
    console.log('✅ Configurações corrigidas para:');
    console.log('   - Lead Source: "1 prospect"');
    console.log('   - Business Stage: "1 prospect"');
    console.log('   - Status: "Reunião de briefing"');
    console.log('');
    console.log('🎉 Correção concluída!');
    
  } catch (error) {
    console.error('❌ Erro geral na correção:', error);
  }
}

async function testChatbotAPI() {
  console.log('\n🧪 TESTANDO API DO CHATBOT...');
  console.log('==============================');
  
  const testData = {
    userType: 'empresa',
    name: 'Teste Correção',
    businessName: 'Empresa Teste Correção',
    businessSegment: 'tecnologia',
    businessGoal: 'vendas',
    hasWorkedWithInfluencers: 'nao',
    email: 'teste@correcao.com',
    whatsapp: '11999999999',
    instagram: '@testecorrecao',
    source: 'chatcriadores-home'
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
      console.log('✅ API funcionando corretamente');
      console.log(`📋 Business ID: ${result.data.id}`);
      console.log(`🎫 Lead ID: ${result.leadId}`);
      console.log(`📊 Business Stage: ${result.data.business_stage}`);
      console.log(`📊 Status: ${result.data.status}`);
      
      // Verificar se foi salvo corretamente
      const { data: businessCheck } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', result.data.id)
        .single();
        
      const { data: leadCheck } = await supabase
        .from('leads')
        .select('*')
        .eq('id', result.leadData.id)
        .single();
        
      console.log('\n📊 Verificação no banco:');
      console.log(`   Business Stage: ${businessCheck.business_stage}`);
      console.log(`   Status: ${businessCheck.status}`);
      console.log(`   Lead Source: ${leadCheck.lead_source || 'NÃO DEFINIDO'}`);
      
      if (businessCheck.business_stage === '1 prospect' && 
          businessCheck.status === 'Reunião de briefing' && 
          leadCheck.lead_source === '1 prospect') {
        console.log('🎉 TUDO CORRETO! API configurada adequadamente.');
      } else {
        console.log('⚠️ Ainda há problemas na configuração da API.');
      }
      
    } else {
      console.log('❌ Erro na API:', result);
    }
    
  } catch (error) {
    console.log('❌ Erro na requisição:', error);
  }
}

async function main() {
  await fixRecentLeads();
  await testChatbotAPI();
}

main().catch(console.error);
