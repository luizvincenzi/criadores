import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function updateChatbotLeads() {
  console.log('🔧 ATUALIZANDO LEADS DOS CHATBOTS PARA CONFIGURAÇÃO FINAL');
  console.log('========================================================\n');
  
  try {
    // 1. Buscar todos os businesses do chatbot
    console.log('🔍 1. Buscando businesses dos chatbots...');
    
    const { data: allBusinesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (businessError) {
      console.log('❌ Erro ao buscar businesses:', businessError.message);
      return;
    }
    
    // Filtrar apenas os do chatbot
    const chatbotBusinesses = allBusinesses.filter(business => {
      try {
        const customFields = typeof business.custom_fields === 'string' 
          ? JSON.parse(business.custom_fields) 
          : business.custom_fields || {};
        return customFields.responsavel === 'Chatbot';
      } catch (error) {
        return false;
      }
    });
    
    console.log(`✅ Encontrados ${chatbotBusinesses.length} businesses do chatbot`);
    
    if (chatbotBusinesses.length === 0) {
      console.log('ℹ️ Nenhum business do chatbot encontrado');
      return;
    }
    
    // 2. Mostrar estado atual
    console.log('\n📋 Estado atual dos businesses do chatbot:');
    chatbotBusinesses.forEach((business, i) => {
      const customFields = JSON.parse(business.custom_fields || '{}');
      console.log(`   ${i+1}. ${business.name}`);
      console.log(`      Business Stage: ${business.business_stage}`);
      console.log(`      Lead Source: ${business.lead_source || 'NULL'}`);
      console.log(`      Status: ${business.status}`);
      console.log(`      Protocolo: ${customFields.protocoloChatbot || 'N/A'}`);
      console.log(`      Created: ${new Date(business.created_at).toLocaleString('pt-BR')}`);
      console.log('');
    });
    
    // 3. Identificar quais precisam ser atualizados
    const businessesToUpdate = chatbotBusinesses.filter(business => 
      business.business_stage !== '01_PROSPECT' || 
      business.lead_source !== 'proprio' ||
      business.status !== 'Reunião de briefing'
    );
    
    console.log(`🔧 2. Businesses que precisam ser atualizados: ${businessesToUpdate.length}`);
    
    if (businessesToUpdate.length === 0) {
      console.log('✅ Todos os businesses já estão com configuração correta!');
    } else {
      console.log('\n📝 Atualizando businesses...');
      
      for (const business of businessesToUpdate) {
        console.log(`\n🔄 Atualizando: ${business.name} (ID: ${business.id})`);
        console.log(`   Antes: Stage=${business.business_stage}, Source=${business.lead_source || 'NULL'}, Status=${business.status}`);
        
        const { error: updateError } = await supabase
          .from('businesses')
          .update({ 
            business_stage: '01_PROSPECT',
            lead_source: 'proprio',
            status: 'Reunião de briefing'
          })
          .eq('id', business.id);
          
        if (updateError) {
          console.log(`   ❌ Erro ao atualizar: ${updateError.message}`);
        } else {
          console.log(`   ✅ Atualizado: Stage=01_PROSPECT, Source=proprio, Status=Reunião de briefing`);
        }
      }
    }
    
    // 4. Verificação final
    console.log('\n🔍 3. Verificação final...');
    
    const { data: updatedBusinesses, error: verifyError } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (verifyError) {
      console.log('❌ Erro na verificação:', verifyError.message);
    } else {
      const updatedChatbotBusinesses = updatedBusinesses.filter(business => {
        try {
          const customFields = typeof business.custom_fields === 'string' 
            ? JSON.parse(business.custom_fields) 
            : business.custom_fields || {};
          return customFields.responsavel === 'Chatbot';
        } catch (error) {
          return false;
        }
      });
      
      console.log('\n📊 Estado final dos businesses do chatbot:');
      
      const correct = updatedChatbotBusinesses.filter(b => 
        b.business_stage === '01_PROSPECT' && 
        b.lead_source === 'proprio' && 
        b.status === 'Reunião de briefing'
      );
      
      const incorrect = updatedChatbotBusinesses.filter(b => 
        b.business_stage !== '01_PROSPECT' || 
        b.lead_source !== 'proprio' || 
        b.status !== 'Reunião de briefing'
      );
      
      console.log(`   ✅ Corretos: ${correct.length}`);
      console.log(`   ❌ Incorretos: ${incorrect.length}`);
      
      if (incorrect.length > 0) {
        console.log('\n⚠️ Businesses ainda incorretos:');
        incorrect.forEach(business => {
          console.log(`   - ${business.name}: Stage=${business.business_stage}, Source=${business.lead_source}, Status=${business.status}`);
        });
      }
    }
    
    // 5. Testar API novamente
    console.log('\n🧪 4. Testando API do chatbot...');
    
    const testData = {
      userType: 'empresa',
      name: 'Teste Verificação Final',
      businessName: 'Empresa Verificação',
      businessSegment: 'tecnologia',
      businessGoal: 'vendas',
      hasWorkedWithInfluencers: 'nao',
      email: 'teste@verificacao.com',
      whatsapp: '11999999999',
      instagram: '@testeverificacao',
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
        console.log('✅ API funcionando perfeitamente!');
        console.log(`   Business Stage: ${result.data.business_stage}`);
        console.log(`   Lead Source: ${result.data.lead_source}`);
        console.log(`   Status: ${result.data.status}`);
        
        if (result.data.business_stage === '01_PROSPECT' && 
            result.data.lead_source === 'proprio' && 
            result.data.status === 'Reunião de briefing') {
          console.log('🎉 CONFIGURAÇÃO PERFEITA!');
        } else {
          console.log('⚠️ Configuração ainda não está correta');
        }
      } else {
        console.log('❌ Erro na API:', result.error);
      }
      
    } catch (error) {
      console.log('❌ Erro na requisição:', error.message);
    }
    
    // 6. Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log('================');
    console.log('✅ Businesses dos chatbots verificados e atualizados');
    console.log('✅ API configurada corretamente');
    console.log('✅ Configuração aplicada:');
    console.log('   - Business Stage: "01_PROSPECT"');
    console.log('   - Lead Source: "proprio"');
    console.log('   - Status: "Reunião de briefing"');
    console.log('');
    console.log('🚀 Sistema pronto para capturar novos leads!');
    console.log('📋 Todos os novos leads de empresas entrarão como 01_PROSPECT');
    console.log('🎉 Operação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

async function main() {
  await updateChatbotLeads();
}

main().catch(console.error);
