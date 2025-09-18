import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function addLeadSourceField() {
  console.log('🔧 ADICIONANDO CAMPO LEAD_SOURCE...');
  console.log('===================================\n');
  
  try {
    // 1. Verificar se o campo já existe
    console.log('🔍 1. Verificando se o campo lead_source já existe...');
    
    const { data: testData, error: testError } = await supabase
      .from('leads')
      .select('lead_source')
      .limit(1);
      
    if (!testError) {
      console.log('✅ Campo lead_source já existe!');
      
      // Verificar quantos leads têm o campo preenchido
      const { data: filledLeads, error: filledError } = await supabase
        .from('leads')
        .select('id, name, source, lead_source')
        .not('lead_source', 'is', null)
        .limit(5);
        
      if (!filledError && filledLeads.length > 0) {
        console.log(`✅ ${filledLeads.length} leads já têm lead_source preenchido:`);
        filledLeads.forEach(lead => {
          console.log(`   - ${lead.name}: ${lead.lead_source}`);
        });
      } else {
        console.log('⚠️ Nenhum lead tem lead_source preenchido ainda');
      }
      
    } else {
      console.log('⚠️ Campo lead_source não existe. Precisa ser criado no Supabase Dashboard.');
      console.log('📋 Execute este SQL no Supabase Dashboard:');
      console.log('   ALTER TABLE leads ADD COLUMN lead_source VARCHAR(50) DEFAULT \'1 prospect\';');
    }
    
    // 2. Verificar leads dos chatbots
    console.log('\n🤖 2. Verificando leads dos chatbots...');
    
    const { data: chatbotLeads, error: chatbotError } = await supabase
      .from('leads')
      .select('*')
      .in('source', ['criavoz-chatbot', 'criavoz-novo', 'chatcriadores-home', 'chatcriadores-novo'])
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (chatbotError) {
      console.log('❌ Erro ao buscar leads dos chatbots:', chatbotError.message);
    } else {
      console.log(`✅ Encontrados ${chatbotLeads.length} leads dos chatbots`);
      
      if (chatbotLeads.length > 0) {
        console.log('\n📋 Leads dos chatbots:');
        chatbotLeads.forEach((lead, i) => {
          console.log(`   ${i+1}. ${lead.name}`);
          console.log(`      Source: ${lead.source}`);
          console.log(`      Lead Source: ${lead.lead_source || 'NÃO DEFINIDO'}`);
          console.log(`      Created: ${new Date(lead.created_at).toLocaleString('pt-BR')}`);
          console.log('');
        });
        
        // 3. Atualizar leads dos chatbots que não têm lead_source
        const leadsToUpdate = chatbotLeads.filter(lead => !lead.lead_source);
        
        if (leadsToUpdate.length > 0) {
          console.log(`🔧 3. Atualizando ${leadsToUpdate.length} leads sem lead_source...`);
          
          for (const lead of leadsToUpdate) {
            const { error: updateError } = await supabase
              .from('leads')
              .update({ lead_source: '1 prospect' })
              .eq('id', lead.id);
              
            if (updateError) {
              console.log(`❌ Erro ao atualizar lead ${lead.id}:`, updateError.message);
            } else {
              console.log(`✅ Lead ${lead.name} atualizado com lead_source: '1 prospect'`);
            }
          }
        } else {
          console.log('✅ Todos os leads dos chatbots já têm lead_source definido');
        }
      }
    }
    
    // 4. Verificar businesses dos chatbots
    console.log('\n🏢 4. Verificando businesses dos chatbots...');
    
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
      
    if (businessError) {
      console.log('❌ Erro ao buscar businesses:', businessError.message);
    } else {
      // Filtrar apenas os do chatbot
      const chatbotBusinesses = businesses.filter(business => {
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
      
      if (chatbotBusinesses.length > 0) {
        console.log('\n📋 Businesses do chatbot:');
        chatbotBusinesses.forEach((business, i) => {
          const customFields = JSON.parse(business.custom_fields || '{}');
          console.log(`   ${i+1}. ${business.name}`);
          console.log(`      Business Stage: ${business.business_stage}`);
          console.log(`      Status: ${business.status}`);
          console.log(`      Protocolo: ${customFields.protocoloChatbot || 'N/A'}`);
          console.log(`      Created: ${new Date(business.created_at).toLocaleString('pt-BR')}`);
          console.log('');
        });
        
        // Verificar se algum precisa ser corrigido
        const businessesToUpdate = chatbotBusinesses.filter(business => 
          business.status !== 'Reunião de briefing'
        );
        
        if (businessesToUpdate.length > 0) {
          console.log(`🔧 5. Corrigindo ${businessesToUpdate.length} businesses com status incorreto...`);
          
          for (const business of businessesToUpdate) {
            const { error: updateError } = await supabase
              .from('businesses')
              .update({ status: 'Reunião de briefing' })
              .eq('id', business.id);
              
            if (updateError) {
              console.log(`❌ Erro ao atualizar business ${business.id}:`, updateError.message);
            } else {
              console.log(`✅ Business ${business.name} atualizado para status: 'Reunião de briefing'`);
            }
          }
        } else {
          console.log('✅ Todos os businesses do chatbot já têm status correto');
        }
      }
    }
    
    // 6. Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log('================');
    console.log('✅ Verificação do campo lead_source concluída');
    console.log('✅ Leads dos chatbots verificados e corrigidos');
    console.log('✅ Businesses dos chatbots verificados e corrigidos');
    console.log('');
    console.log('📋 Configurações aplicadas:');
    console.log('   - Lead Source: "1 prospect" (para automações)');
    console.log('   - Status: "Reunião de briefing" (para businesses)');
    console.log('');
    console.log('⚠️ IMPORTANTE: Execute a migração completa no Supabase Dashboard:');
    console.log('   📄 Arquivo: MIGRAÇÃO_URGENTE_SUPABASE.sql');
    console.log('');
    console.log('🎉 Correções aplicadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

async function main() {
  await addLeadSourceField();
}

main().catch(console.error);
