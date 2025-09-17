import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testNewLeadSystem() {
  console.log('🧪 Testando sistema completo de novos leads...');
  
  // 1. TESTAR EMPRESA
  console.log('\n📋 1. Testando lead de EMPRESA...');
  
  const empresaData = {
    userType: 'empresa',
    name: 'Carlos Silva',
    businessName: 'Restaurante do Carlos',
    businessSegment: 'alimentacao',
    businessGoal: 'clientes',
    hasWorkedWithInfluencers: 'nao',
    email: 'carlos@restaurante.com',
    whatsapp: '11987654321',
    instagram: '@restaurantedocarlos'
  };
  
  try {
    const empresaResponse = await fetch('http://localhost:3000/api/chatbot/save-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empresaData),
    });
    
    const empresaResult = await empresaResponse.json();
    
    if (empresaResult.success) {
      console.log('✅ Empresa salva com sucesso!');
      console.log(`   🆔 Business ID: ${empresaResult.data.id}`);
      console.log(`   🎫 Lead ID: ${empresaResult.leadId}`);
      console.log(`   📊 Status: ${empresaResult.data.status}`);
      console.log(`   🎯 Business Stage: ${empresaResult.data.business_stage}`);
      
      // Verificar se foi criado na tabela leads
      const { data: leadCheck, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('converted_to_business_id', empresaResult.data.id)
        .single();
        
      if (leadError) {
        console.log('❌ Lead não encontrado na tabela leads:', leadError.message);
      } else {
        console.log('✅ Lead encontrado na tabela leads!');
        console.log(`   📧 Email: ${leadCheck.email}`);
        console.log(`   📱 Phone: ${leadCheck.phone}`);
        console.log(`   🏢 Company: ${leadCheck.company}`);
        console.log(`   📊 Score: ${leadCheck.score}`);
        console.log(`   🔗 Source: ${leadCheck.source}`);
      }
      
    } else {
      console.log('❌ Erro ao salvar empresa:', empresaResult.error);
    }
  } catch (error) {
    console.log('❌ Erro na requisição empresa:', error);
  }
  
  // 2. TESTAR CRIADOR
  console.log('\n🎨 2. Testando lead de CRIADOR...');
  
  const criadorData = {
    userType: 'criador',
    name: 'Ana Costa',
    creatorNiche: 'moda',
    followersCount: '10k-50k',
    hasWorkedWithBrands: 'sim',
    email: 'ana@criadora.com',
    whatsapp: '11876543210',
    instagram: '@anacosta_moda'
  };
  
  try {
    const criadorResponse = await fetch('http://localhost:3000/api/chatbot/save-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(criadorData),
    });
    
    const criadorResult = await criadorResponse.json();
    
    if (criadorResult.success) {
      console.log('✅ Criador salvo com sucesso!');
      console.log(`   🆔 Business ID: ${criadorResult.data.id}`);
      console.log(`   🎫 Lead ID: ${criadorResult.leadId}`);
      console.log(`   📊 Status: ${criadorResult.data.status}`);
      console.log(`   🎯 Business Stage: ${criadorResult.data.business_stage}`);
      
      // Verificar se foi criado na tabela leads
      const { data: leadCheck, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('converted_to_business_id', criadorResult.data.id)
        .single();
        
      if (leadError) {
        console.log('❌ Lead não encontrado na tabela leads:', leadError.message);
      } else {
        console.log('✅ Lead encontrado na tabela leads!');
        console.log(`   📧 Email: ${leadCheck.email}`);
        console.log(`   📱 Phone: ${leadCheck.phone}`);
        console.log(`   🏢 Company: ${leadCheck.company || 'N/A'}`);
        console.log(`   📊 Score: ${leadCheck.score}`);
        console.log(`   🔗 Source: ${leadCheck.source}`);
      }
      
    } else {
      console.log('❌ Erro ao salvar criador:', criadorResult.error);
    }
  } catch (error) {
    console.log('❌ Erro na requisição criador:', error);
  }
  
  // 3. VERIFICAR TODOS OS LEADS DO CHATBOT
  console.log('\n📊 3. Verificando todos os leads do chatbot...');
  
  const { data: allChatbotLeads, error: allLeadsError } = await supabase
    .from('leads')
    .select('*')
    .eq('source', 'criavoz-chatbot')
    .order('created_at', { ascending: false });
    
  if (allLeadsError) {
    console.log('❌ Erro ao buscar leads do chatbot:', allLeadsError.message);
  } else {
    console.log(`✅ Total de leads do chatbot: ${allChatbotLeads.length}`);
    
    allChatbotLeads.forEach((lead, i) => {
      const contactInfo = JSON.parse(lead.contact_info || '{}');
      console.log(`\n   ${i+1}. ${lead.name}`);
      console.log(`      📧 Email: ${lead.email}`);
      console.log(`      📱 Phone: ${lead.phone}`);
      console.log(`      🏢 Company: ${lead.company || 'N/A'}`);
      console.log(`      📊 Score: ${lead.score}`);
      console.log(`      🎫 Protocolo: ${contactInfo.protocolo || 'N/A'}`);
      console.log(`      🎯 Tipo: ${contactInfo.tipo || 'N/A'}`);
      console.log(`      📅 Criado: ${lead.created_at}`);
    });
  }
  
  // 4. VERIFICAR BUSINESSES DO CHATBOT
  console.log('\n🎯 4. Verificando businesses do chatbot...');

  const { data: chatbotBusinesses, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .eq('business_stage', 'Leads próprios quentes')
    .order('created_at', { ascending: false });

  if (businessError) {
    console.log('❌ Erro ao buscar businesses do chatbot:', businessError.message);
  } else {
    console.log(`✅ Total de businesses do chatbot: ${chatbotBusinesses.length}`);

    // Filtrar apenas os que vieram do chatbot
    const chatbotOnly = chatbotBusinesses.filter(business => {
      try {
        const customFields = typeof business.custom_fields === 'string'
          ? JSON.parse(business.custom_fields)
          : business.custom_fields || {};
        return customFields.protocoloChatbot;
      } catch (error) {
        return false;
      }
    });

    console.log(`✅ Total de businesses do chatbot (filtrados): ${chatbotOnly.length}`);

    chatbotOnly.forEach((business, i) => {
      const customFields = typeof business.custom_fields === 'string'
        ? JSON.parse(business.custom_fields)
        : business.custom_fields || {};
      const contactInfo = typeof business.contact_info === 'string'
        ? JSON.parse(business.contact_info)
        : business.contact_info || {};
      
      console.log(`\n   ${i+1}. ${business.name}`);
      console.log(`      📧 Email: ${contactInfo.email}`);
      console.log(`      📱 WhatsApp: ${contactInfo.whatsapp}`);
      console.log(`      🎫 Protocolo: ${customFields.protocoloChatbot || 'N/A'}`);
      console.log(`      🎯 Tipo: ${customFields.tipoUsuario || 'N/A'}`);
      console.log(`      📊 Status: ${business.status}`);
      console.log(`      🎯 Stage: ${business.business_stage}`);
      console.log(`      📅 Criado: ${business.created_at}`);
    });
  }
  
  console.log('\n🎉 Teste completo finalizado!');
}

// Executar teste
testNewLeadSystem().catch(console.error);
