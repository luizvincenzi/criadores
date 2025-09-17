import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function searchLostLeads() {
  console.log('🔍 Buscando leads perdidos...');
  
  // Lista de leads conhecidos que deveriam estar no banco
  const knownLeads = [
    {
      name: 'Paulo Henrique',
      businessName: 'Odontoclean',
      email: 'paulohlf2@gmail.com',
      whatsapp: '37988045355',
      instagram: '@drpaulohlf',
      protocol: 'CRI781988',
      segment: 'saude'
    }
  ];
  
  console.log('📋 Leads conhecidos para verificar:', knownLeads.length);
  
  for (const lead of knownLeads) {
    console.log(`\n🔍 Verificando: ${lead.name} (${lead.businessName})`);
    
    // 1. Buscar por nome da empresa
    const { data: byBusinessName, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .ilike('name', `%${lead.businessName}%`);
      
    if (businessError) {
      console.log('❌ Erro ao buscar por nome da empresa:', businessError.message);
    } else {
      console.log(`📊 Encontrados por nome da empresa: ${byBusinessName.length}`);
      byBusinessName.forEach((business, i) => {
        console.log(`  ${i+1}. ${business.name} - ${business.created_at}`);
      });
    }
    
    // 2. Buscar por email no contact_info (JSONB)
    const { data: byEmail, error: emailError } = await supabase
      .from('businesses')
      .select('*')
      .filter('contact_info->>email', 'eq', lead.email);

    if (emailError) {
      console.log('❌ Erro ao buscar por email:', emailError.message);
    } else {
      console.log(`📧 Encontrados por email: ${byEmail.length}`);
      byEmail.forEach((business, i) => {
        console.log(`  ${i+1}. ${business.name} - ${business.created_at}`);
      });
    }

    // 3. Buscar por WhatsApp (JSONB)
    const { data: byWhatsApp, error: whatsappError } = await supabase
      .from('businesses')
      .select('*')
      .filter('contact_info->>whatsapp', 'eq', lead.whatsapp);

    if (whatsappError) {
      console.log('❌ Erro ao buscar por WhatsApp:', whatsappError.message);
    } else {
      console.log(`📱 Encontrados por WhatsApp: ${byWhatsApp.length}`);
      byWhatsApp.forEach((business, i) => {
        console.log(`  ${i+1}. ${business.name} - ${business.created_at}`);
      });
    }

    // 4. Buscar por protocolo nos custom_fields (JSONB)
    const { data: byProtocol, error: protocolError } = await supabase
      .from('businesses')
      .select('*')
      .filter('custom_fields->>protocoloChatbot', 'eq', lead.protocol);

    if (protocolError) {
      console.log('❌ Erro ao buscar por protocolo:', protocolError.message);
    } else {
      console.log(`🎫 Encontrados por protocolo: ${byProtocol.length}`);
      byProtocol.forEach((business, i) => {
        console.log(`  ${i+1}. ${business.name} - ${business.created_at}`);
      });
    }

    // 5. Buscar por nome da pessoa nos custom_fields (JSONB)
    const { data: byPersonName, error: personError } = await supabase
      .from('businesses')
      .select('*')
      .filter('custom_fields->dadosCompletos->>name', 'eq', lead.name);

    if (personError) {
      console.log('❌ Erro ao buscar por nome da pessoa:', personError.message);
    } else {
      console.log(`👤 Encontrados por nome da pessoa: ${byPersonName.length}`);
      byPersonName.forEach((business, i) => {
        console.log(`  ${i+1}. ${business.name} - ${business.created_at}`);
      });
    }
    
    // Resumo para este lead
    const totalFound = (byBusinessName?.length || 0) + 
                      (byEmail?.length || 0) + 
                      (byWhatsApp?.length || 0) + 
                      (byProtocol?.length || 0) + 
                      (byPersonName?.length || 0);
                      
    if (totalFound === 0) {
      console.log(`❌ LEAD PERDIDO: ${lead.name} (${lead.businessName}) não foi encontrado!`);
      console.log(`   📧 Email: ${lead.email}`);
      console.log(`   📱 WhatsApp: ${lead.whatsapp}`);
      console.log(`   🎫 Protocolo: ${lead.protocol}`);
      console.log(`   🏥 Segmento: ${lead.segment}`);
    } else {
      console.log(`✅ Lead encontrado em ${totalFound} registros`);
    }
  }
  
  // 6. Buscar todos os leads do chatbot
  console.log('\n📊 Buscando todos os leads do chatbot...');

  const { data: chatbotLeads, error: chatbotError } = await supabase
    .from('businesses')
    .select('*')
    .filter('custom_fields->>responsavel', 'eq', 'Chatbot')
    .order('created_at', { ascending: false });
    
  if (chatbotError) {
    console.log('❌ Erro ao buscar leads do chatbot:', chatbotError.message);
  } else {
    console.log(`🤖 Total de leads do chatbot: ${chatbotLeads.length}`);
    
    chatbotLeads.forEach((business, i) => {
      const customFields = JSON.parse(business.custom_fields || '{}');
      const dadosCompletos = customFields.dadosCompletos || {};
      const protocolo = customFields.protocoloChatbot || 'N/A';
      
      console.log(`  ${i+1}. ${business.name}`);
      console.log(`     📧 Email: ${dadosCompletos.email || 'N/A'}`);
      console.log(`     📱 WhatsApp: ${dadosCompletos.whatsapp || 'N/A'}`);
      console.log(`     🎫 Protocolo: ${protocolo}`);
      console.log(`     📅 Criado: ${business.created_at}`);
      console.log(`     ---`);
    });
  }
  
  // 7. Verificar se há tabela failed_leads
  console.log('\n🔍 Verificando tabela failed_leads...');
  
  try {
    const { data: failedLeads, error: failedError } = await supabase
      .from('failed_leads')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (failedError) {
      console.log('⚠️ Tabela failed_leads não existe ou não acessível:', failedError.message);
    } else {
      console.log(`📊 Leads que falharam: ${failedLeads.length}`);
      
      failedLeads.forEach((failed, i) => {
        const userData = failed.user_data || {};
        console.log(`  ${i+1}. ${userData.name || 'N/A'} (${userData.businessName || userData.name || 'N/A'})`);
        console.log(`     🎫 Lead ID: ${failed.lead_id}`);
        console.log(`     ❌ Erro: ${failed.error_message}`);
        console.log(`     📅 Falhou em: ${failed.created_at}`);
        console.log(`     🔄 Processado: ${failed.is_processed ? 'Sim' : 'Não'}`);
        console.log(`     ---`);
      });
    }
  } catch (error) {
    console.log('⚠️ Erro ao acessar failed_leads:', error);
  }
}

// Executar busca
searchLostLeads().catch(console.error);
