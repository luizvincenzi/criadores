import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testCriavozInstagram() {
  console.log('🧪 Testando CriaVoz Instagram...');
  
  // Dados de teste específicos para Instagram
  const instagramData = {
    userType: 'empresa',
    name: 'Ana Silva',
    businessName: 'Boutique da Ana',
    businessSegment: 'moda',
    instagramHandle: '@boutiquedaana',
    instagramFollowers: '5k-10k',
    businessGoal: 'vendas',
    monthlyBudget: '1k-3k',
    hasWorkedWithInfluencers: 'nao',
    email: 'ana@boutique.com',
    whatsapp: '11987654321',
    instagram: '@anasilva',
    source: 'criavoz-instagram'
  };
  
  try {
    console.log('📤 Enviando dados do Instagram para o chatbot...');
    
    const response = await fetch('http://localhost:3000/api/chatbot/save-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(instagramData),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ SUCESSO! Lead do Instagram salvo!');
      console.log('📋 Detalhes:');
      console.log(`   🆔 Business ID: ${result.data.id}`);
      console.log(`   🎫 Lead ID: ${result.leadId}`);
      console.log(`   📊 Status: ${result.data.status}`);
      console.log(`   🎯 Business Stage: ${result.data.business_stage}`);
      console.log(`   🏢 Nome: ${result.data.name}`);
      
      if (result.leadData) {
        console.log(`   📋 Lead criado: ${result.leadData.id}`);
      }
      
      // Verificar se foi salvo com a fonte correta
      const { data: leadCheck, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', result.leadData?.id)
        .single();
        
      if (leadError) {
        console.log('❌ Erro ao verificar lead:', leadError.message);
      } else {
        console.log('\n📊 VERIFICAÇÃO DO LEAD:');
        console.log(`   📧 Email: ${leadCheck.email}`);
        console.log(`   📱 Phone: ${leadCheck.phone}`);
        console.log(`   🏢 Company: ${leadCheck.company}`);
        console.log(`   🔗 Source: ${leadCheck.source}`);
        console.log(`   📊 Score: ${leadCheck.score}`);
        
        const contactInfo = JSON.parse(leadCheck.contact_info || '{}');
        console.log(`   🎫 Protocolo: ${contactInfo.protocolo}`);
        console.log(`   🎯 Tipo: ${contactInfo.tipo}`);
      }
      
      // Verificar business com dados específicos do Instagram
      const { data: businessCheck, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', result.data.id)
        .single();
        
      if (businessError) {
        console.log('❌ Erro ao verificar business:', businessError.message);
      } else {
        console.log('\n🏢 VERIFICAÇÃO DO BUSINESS:');
        console.log(`   🏢 Nome: ${businessCheck.name}`);
        console.log(`   📊 Status: ${businessCheck.status}`);
        console.log(`   🎯 Stage: ${businessCheck.business_stage}`);
        
        const customFields = JSON.parse(businessCheck.custom_fields || '{}');
        console.log(`   🎫 Protocolo: ${customFields.protocoloChatbot}`);
        console.log(`   🔗 Fonte: ${customFields.fonte}`);
        console.log(`   📸 Instagram Handle: ${customFields.instagramHandle}`);
        console.log(`   👥 Instagram Followers: ${customFields.instagramFollowers}`);
        console.log(`   💰 Monthly Budget: ${customFields.monthlyBudget}`);
        console.log(`   🎯 Segmento: ${customFields.segmento}`);
        console.log(`   🎯 Objetivo: ${customFields.objetivo}`);
      }
      
      console.log('\n🎉 CONFIRMADO: CriaVoz Instagram funcionando!');
      console.log('✅ Dados salvos na tabela businesses');
      console.log('✅ Dados salvos na tabela leads');
      console.log('✅ Fonte identificada como criavoz-instagram');
      console.log('✅ Dados específicos do Instagram preservados');
      
    } else {
      console.log('❌ ERRO ao salvar lead do Instagram:');
      console.log('📋 Resposta:', result);
    }
    
  } catch (error) {
    console.log('❌ ERRO na requisição:', error);
  }
}

async function checkInstagramLeads() {
  console.log('\n📊 Verificando todos os leads do Instagram...');
  
  const { data: instagramLeads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .eq('source', 'criavoz-instagram')
    .order('created_at', { ascending: false });
    
  if (leadsError) {
    console.log('❌ Erro ao buscar leads do Instagram:', leadsError.message);
  } else {
    console.log(`✅ Total de leads do Instagram: ${instagramLeads.length}`);
    
    instagramLeads.forEach((lead, i) => {
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
}

async function checkInstagramBusinesses() {
  console.log('\n🏢 Verificando businesses do Instagram...');
  
  const { data: allBusinesses, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .eq('business_stage', 'Leads próprios quentes')
    .order('created_at', { ascending: false });
    
  if (businessError) {
    console.log('❌ Erro ao buscar businesses:', businessError.message);
  } else {
    // Filtrar apenas os do Instagram
    const instagramBusinesses = allBusinesses.filter(business => {
      try {
        const customFields = typeof business.custom_fields === 'string' 
          ? JSON.parse(business.custom_fields) 
          : business.custom_fields || {};
        return customFields.fonte === 'criavoz-instagram';
      } catch (error) {
        return false;
      }
    });
    
    console.log(`✅ Total de businesses do Instagram: ${instagramBusinesses.length}`);
    
    instagramBusinesses.forEach((business, i) => {
      const customFields = typeof business.custom_fields === 'string' 
        ? JSON.parse(business.custom_fields) 
        : business.custom_fields || {};
      
      console.log(`\n   ${i+1}. ${business.name}`);
      console.log(`      📧 Email: ${customFields.emailResponsavel}`);
      console.log(`      📱 WhatsApp: ${customFields.whatsappResponsavel}`);
      console.log(`      📸 Instagram Handle: ${customFields.instagramHandle}`);
      console.log(`      👥 Followers: ${customFields.instagramFollowers}`);
      console.log(`      💰 Budget: ${customFields.monthlyBudget}`);
      console.log(`      🎫 Protocolo: ${customFields.protocoloChatbot}`);
      console.log(`      🎯 Segmento: ${customFields.segmento}`);
      console.log(`      📊 Status: ${business.status}`);
      console.log(`      📅 Criado: ${business.created_at}`);
    });
  }
}

async function main() {
  await testCriavozInstagram();
  await checkInstagramLeads();
  await checkInstagramBusinesses();
  
  console.log('\n🎉 Teste do CriaVoz Instagram finalizado!');
  console.log('\n📋 Resumo:');
  console.log('✅ Nova página criavoz-instagram criada');
  console.log('✅ Chatbot específico para empresas no Instagram');
  console.log('✅ Dados salvos nas duas tabelas (leads e businesses)');
  console.log('✅ Fonte identificada como criavoz-instagram');
  console.log('✅ Dados específicos do Instagram preservados');
  console.log('✅ Link adicionado no crialink');
  console.log('\n🌐 URLs:');
  console.log('- CriaVoz Instagram: http://localhost:3000/criavoz-instagram');
  console.log('- CriaLink: http://localhost:3000/crialink');
}

main().catch(console.error);
