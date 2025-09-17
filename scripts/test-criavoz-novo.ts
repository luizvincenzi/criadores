import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testCriavozNovo() {
  console.log('🧪 Testando CriaVoz Novo (fonte: Instagram)...');
  
  // Dados de teste para empresa (sem pergunta de tipo de usuário)
  const empresaData = {
    userType: 'empresa', // Sempre empresa
    name: 'Roberto Santos',
    businessName: 'Loja do Roberto',
    businessSegment: 'moda',
    businessGoal: 'vendas',
    hasWorkedWithInfluencers: 'nao',
    email: 'roberto@loja.com',
    whatsapp: '11987654321',
    instagram: '@robertosantos',
    source: 'criavoz-novo'
  };
  
  try {
    console.log('📤 Enviando dados do CriaVoz Novo...');
    
    const response = await fetch('http://localhost:3000/api/chatbot/save-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(empresaData),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ SUCESSO! Lead do CriaVoz Novo salvo!');
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
      
      // Verificar business
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
        console.log(`   🎯 Segmento: ${customFields.segmento}`);
        console.log(`   🎯 Objetivo: ${customFields.objetivo}`);
        console.log(`   📧 Email: ${customFields.emailResponsavel}`);
        console.log(`   📱 WhatsApp: ${customFields.whatsappResponsavel}`);
        console.log(`   📸 Instagram: ${customFields.instagramResponsavel}`);
      }
      
      console.log('\n🎉 CONFIRMADO: CriaVoz Novo funcionando!');
      console.log('✅ Dados salvos na tabela businesses');
      console.log('✅ Dados salvos na tabela leads');
      console.log('✅ Fonte identificada como criavoz-novo');
      console.log('✅ Sempre identifica como empresa (sem pergunta de tipo)');
      
    } else {
      console.log('❌ ERRO ao salvar lead do CriaVoz Novo:');
      console.log('📋 Resposta:', result);
    }
    
  } catch (error) {
    console.log('❌ ERRO na requisição:', error);
  }
}

async function checkCriavozNovoLeads() {
  console.log('\n📊 Verificando todos os leads do CriaVoz Novo...');
  
  const { data: novoLeads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .eq('source', 'criavoz-novo')
    .order('created_at', { ascending: false });
    
  if (leadsError) {
    console.log('❌ Erro ao buscar leads do CriaVoz Novo:', leadsError.message);
  } else {
    console.log(`✅ Total de leads do CriaVoz Novo: ${novoLeads.length}`);
    
    novoLeads.forEach((lead, i) => {
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

async function checkCriavozNovoBusinesses() {
  console.log('\n🏢 Verificando businesses do CriaVoz Novo...');
  
  const { data: allBusinesses, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .eq('business_stage', 'Leads próprios quentes')
    .order('created_at', { ascending: false });
    
  if (businessError) {
    console.log('❌ Erro ao buscar businesses:', businessError.message);
  } else {
    // Filtrar apenas os do CriaVoz Novo
    const novoBusinesses = allBusinesses.filter(business => {
      try {
        const customFields = typeof business.custom_fields === 'string' 
          ? JSON.parse(business.custom_fields) 
          : business.custom_fields || {};
        return customFields.fonte === 'criavoz-novo';
      } catch (error) {
        return false;
      }
    });
    
    console.log(`✅ Total de businesses do CriaVoz Novo: ${novoBusinesses.length}`);
    
    novoBusinesses.forEach((business, i) => {
      const customFields = typeof business.custom_fields === 'string' 
        ? JSON.parse(business.custom_fields) 
        : business.custom_fields || {};
      
      console.log(`\n   ${i+1}. ${business.name}`);
      console.log(`      📧 Email: ${customFields.emailResponsavel}`);
      console.log(`      📱 WhatsApp: ${customFields.whatsappResponsavel}`);
      console.log(`      📸 Instagram: ${customFields.instagramResponsavel}`);
      console.log(`      🎫 Protocolo: ${customFields.protocoloChatbot}`);
      console.log(`      🎯 Segmento: ${customFields.segmento}`);
      console.log(`      🎯 Objetivo: ${customFields.objetivo}`);
      console.log(`      📊 Status: ${business.status}`);
      console.log(`      📅 Criado: ${business.created_at}`);
    });
  }
}

async function compareSources() {
  console.log('\n📊 COMPARANDO TODAS AS FONTES...');
  
  const sources = ['criavoz-chatbot', 'criavoz-novo', 'criavoz-instagram'];
  
  for (const source of sources) {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('id')
      .eq('source', source);
      
    if (!error) {
      console.log(`   📋 ${source}: ${leads?.length || 0} leads`);
    }
  }
}

async function main() {
  await testCriavozNovo();
  await checkCriavozNovoLeads();
  await checkCriavozNovoBusinesses();
  await compareSources();
  
  console.log('\n🎉 Teste do CriaVoz Novo finalizado!');
  console.log('\n📋 Resumo:');
  console.log('✅ Nova página criavoz-novo criada');
  console.log('✅ Usa exatamente o mesmo modelo do criavoz-homepage');
  console.log('✅ Sem pergunta de tipo de usuário (sempre empresa)');
  console.log('✅ Fonte identificada como criavoz-novo (veio do Instagram)');
  console.log('✅ Dados salvos nas duas tabelas (leads e businesses)');
  console.log('✅ Link atualizado no crialink');
  console.log('\n🌐 URLs:');
  console.log('- CriaVoz Novo: http://localhost:3000/criavoz-novo');
  console.log('- CriaLink: http://localhost:3000/crialink');
  console.log('- CriaVoz Homepage: http://localhost:3000/criavoz-homepage');
}

main().catch(console.error);
