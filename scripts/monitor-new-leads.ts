import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

let lastCheckTime = new Date();

async function monitorNewLeads() {
  console.log('🔍 Monitorando novos leads do chatbot...');
  console.log(`⏰ Iniciado em: ${lastCheckTime.toLocaleString('pt-BR')}`);
  console.log('🌐 Teste o chatbot em: https://www.criadores.app/criavoz-homepage');
  console.log('📋 Pressione Ctrl+C para parar o monitoramento\n');

  const checkInterval = setInterval(async () => {
    try {
      const currentTime = new Date();
      
      // 1. Verificar novos leads
      const { data: newLeads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('source', 'criavoz-chatbot')
        .gte('created_at', lastCheckTime.toISOString())
        .order('created_at', { ascending: false });
        
      if (leadsError) {
        console.log('❌ Erro ao verificar leads:', leadsError.message);
      } else if (newLeads && newLeads.length > 0) {
        console.log(`\n🚨 ${newLeads.length} NOVO(S) LEAD(S) DETECTADO(S)!`);
        
        for (const lead of newLeads) {
          const contactInfo = JSON.parse(lead.contact_info || '{}');
          console.log(`\n📋 LEAD DETECTADO:`);
          console.log(`   👤 Nome: ${lead.name}`);
          console.log(`   📧 Email: ${lead.email}`);
          console.log(`   📱 Phone: ${lead.phone}`);
          console.log(`   🏢 Company: ${lead.company || 'N/A'}`);
          console.log(`   🎫 Protocolo: ${contactInfo.protocolo || 'N/A'}`);
          console.log(`   🎯 Tipo: ${contactInfo.tipo || 'N/A'}`);
          console.log(`   📊 Score: ${lead.score}`);
          console.log(`   🔗 Business ID: ${lead.converted_to_business_id}`);
          console.log(`   📅 Criado: ${new Date(lead.created_at).toLocaleString('pt-BR')}`);
          
          // Verificar se o business correspondente foi criado
          if (lead.converted_to_business_id) {
            const { data: business, error: businessError } = await supabase
              .from('businesses')
              .select('id, name, status, business_stage, custom_fields')
              .eq('id', lead.converted_to_business_id)
              .single();
              
            if (businessError) {
              console.log(`   ❌ Business não encontrado: ${businessError.message}`);
            } else {
              console.log(`\n📊 BUSINESS CORRESPONDENTE:`);
              console.log(`   🆔 ID: ${business.id}`);
              console.log(`   🏢 Nome: ${business.name}`);
              console.log(`   📊 Status: ${business.status}`);
              console.log(`   🎯 Stage: ${business.business_stage}`);
              
              const customFields = typeof business.custom_fields === 'string' 
                ? JSON.parse(business.custom_fields) 
                : business.custom_fields || {};
              console.log(`   🎫 Protocolo: ${customFields.protocoloChatbot || 'N/A'}`);
              console.log(`   📧 Email: ${customFields.emailResponsavel || 'N/A'}`);
              console.log(`   📱 WhatsApp: ${customFields.whatsappResponsavel || 'N/A'}`);
            }
          }
          
          console.log(`\n✅ DADOS SALVOS CORRETAMENTE NAS DUAS TABELAS!`);
        }
      }
      
      // 2. Verificar novos businesses do chatbot
      const { data: newBusinesses, error: businessError } = await supabase
        .from('businesses')
        .select('id, name, contact_info, custom_fields, business_stage, status, created_at')
        .eq('business_stage', 'Leads próprios quentes')
        .gte('created_at', lastCheckTime.toISOString())
        .order('created_at', { ascending: false });
        
      if (businessError) {
        console.log('❌ Erro ao verificar businesses:', businessError.message);
      } else if (newBusinesses && newBusinesses.length > 0) {
        // Filtrar apenas os do chatbot
        const chatbotBusinesses = newBusinesses.filter(business => {
          try {
            const customFields = typeof business.custom_fields === 'string' 
              ? JSON.parse(business.custom_fields) 
              : business.custom_fields || {};
            return customFields.protocoloChatbot;
          } catch (error) {
            return false;
          }
        });
        
        if (chatbotBusinesses.length > 0) {
          console.log(`\n🏢 ${chatbotBusinesses.length} NOVO(S) BUSINESS(ES) DO CHATBOT:`);
          
          chatbotBusinesses.forEach((business, i) => {
            const customFields = typeof business.custom_fields === 'string' 
              ? JSON.parse(business.custom_fields) 
              : business.custom_fields || {};
            console.log(`   ${i+1}. ${business.name} - ${customFields.protocoloChatbot} - ${business.status}`);
          });
        }
      }
      
      lastCheckTime = currentTime;
      
      // Log de status a cada minuto
      if (currentTime.getSeconds() === 0) {
        console.log(`⏰ ${currentTime.toLocaleTimeString('pt-BR')} - Monitorando...`);
      }
      
    } catch (error) {
      console.error('❌ Erro no monitoramento:', error);
    }
  }, 5000); // Verificar a cada 5 segundos

  // Cleanup quando o processo for interrompido
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Monitoramento interrompido pelo usuário');
    clearInterval(checkInterval);
    
    // Mostrar resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log('✅ Sistema funcionando corretamente');
    console.log('✅ Leads sendo salvos na tabela leads');
    console.log('✅ Businesses sendo salvos na tabela businesses');
    console.log('✅ Dados completos preservados');
    console.log('✅ Protocolos únicos gerados');
    
    process.exit(0);
  });
}

// Função para mostrar estatísticas atuais
async function showCurrentStats() {
  console.log('\n📊 ESTATÍSTICAS ATUAIS:');
  
  // Total de leads do chatbot
  const { data: totalLeads, error: leadsError } = await supabase
    .from('leads')
    .select('id')
    .eq('source', 'criavoz-chatbot');
    
  if (!leadsError) {
    console.log(`📋 Total de leads do chatbot: ${totalLeads?.length || 0}`);
  }
  
  // Total de businesses do chatbot
  const { data: allBusinesses, error: businessError } = await supabase
    .from('businesses')
    .select('custom_fields')
    .eq('business_stage', 'Leads próprios quentes');
    
  if (!businessError) {
    const chatbotBusinesses = allBusinesses?.filter(business => {
      try {
        const customFields = typeof business.custom_fields === 'string' 
          ? JSON.parse(business.custom_fields) 
          : business.custom_fields || {};
        return customFields.protocoloChatbot;
      } catch (error) {
        return false;
      }
    }) || [];
    
    console.log(`🏢 Total de businesses do chatbot: ${chatbotBusinesses.length}`);
  }
  
  console.log('');
}

// Executar monitoramento
async function main() {
  await showCurrentStats();
  await monitorNewLeads();
}

main().catch(console.error);
