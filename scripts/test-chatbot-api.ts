import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testChatbotAPI() {
  console.log('🧪 Testando API do Chatbot...');
  
  // Simular dados do Paulo Henrique
  const testUserData = {
    userType: 'empresa',
    name: 'Paulo Henrique',
    businessName: 'Odontoclean',
    businessSegment: 'saude',
    businessGoal: 'clientes',
    hasWorkedWithInfluencers: 'nao',
    email: 'paulohlf2@gmail.com',
    whatsapp: '37988045355',
    instagram: '@drpaulohlf'
  };
  
  console.log('📋 Dados de teste (Paulo Henrique):', JSON.stringify(testUserData, null, 2));
  
  try {
    // Testar a API
    console.log('🔍 Chamando API do chatbot...');
    
    const response = await fetch('http://localhost:3000/api/chatbot/save-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUserData),
    });
    
    const result = await response.json();
    
    console.log('📊 Resposta da API:', JSON.stringify(result, null, 2));
    console.log('📊 Status HTTP:', response.status);
    
    if (result.success) {
      console.log('✅ API funcionou! Lead salvo com ID:', result.data?.id);
      console.log('✅ Lead ID gerado:', result.leadId);
      
      // Verificar se foi realmente salvo
      const { data: verification, error: verifyError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', result.data.id)
        .single();
        
      if (verifyError) {
        console.error('❌ Erro ao verificar salvamento:', verifyError);
      } else {
        console.log('✅ Verificação: Lead encontrado no banco!');
        console.log('📋 Dados salvos:', JSON.stringify(verification, null, 2));
      }
      
    } else {
      console.error('❌ API falhou:', result.error);
      console.error('❌ Lead ID que falhou:', result.leadId);
    }
    
  } catch (error) {
    console.error('❌ Erro ao chamar API:', error);
  }
  
  // Testar inserção direta no Supabase
  console.log('\n🔍 Testando inserção direta no Supabase...');
  
  try {
    const directData = {
      organization_id: "00000000-0000-0000-0000-000000000001",
      name: "Teste Direto - Paulo Henrique",
      slug: "teste-direto-paulo-henrique-" + Date.now(),
      contact_info: JSON.stringify({
        email: "paulohlf2@gmail.com",
        phone: "37988045355",
        whatsapp: "37988045355",
        instagram: "@drpaulohlf",
        primary_contact: "Paulo Henrique"
      }),
      address: JSON.stringify({
        city: "",
        state: "",
        street: "",
        country: "Brasil",
        zip_code: ""
      }),
      contract_info: JSON.stringify({
        files: [],
        terms: {},
        signed: false,
        valid_until: null,
        signature_date: null
      }),
      status: "Reunião de briefing",
      tags: [],
      custom_fields: JSON.stringify({
        notes: "Teste direto - Paulo Henrique",
        categoria: "Saúde/Bem-estar",
        comercial: "",
        planoAtual: "",
        responsavel: "Teste",
        grupoWhatsappCriado: "Não",
        tipoUsuario: "empresa",
        dadosCompletos: testUserData
      }),
      metrics: JSON.stringify({
        roi: 0,
        total_spent: 0,
        total_campaigns: 0,
        active_campaigns: 0
      }),
      is_active: true,
      business_stage: "Leads próprios quentes",
      estimated_value: "0.00",
      contract_creators_count: 0,
      priority: "Média",
      current_stage_since: new Date().toISOString(),
      expected_close_date: null,
      actual_close_date: null,
      is_won: false,
      is_lost: false,
      lost_reason: null,
      apresentacao_empresa: ""
    };
    
    const { data: directResult, error: directError } = await supabase
      .from('businesses')
      .insert([directData])
      .select();
      
    if (directError) {
      console.error('❌ Erro na inserção direta:', directError);
      console.error('❌ Detalhes:', JSON.stringify(directError, null, 2));
    } else {
      console.log('✅ Inserção direta funcionou!');
      console.log('📋 Dados inseridos:', JSON.stringify(directResult, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Erro na inserção direta:', error);
  }
  
  // Verificar estrutura da tabela businesses
  console.log('\n🔍 Verificando estrutura da tabela businesses...');
  
  try {
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .limit(1);
      
    if (businessError) {
      console.error('❌ Erro ao buscar businesses:', businessError);
    } else {
      console.log('✅ Tabela businesses acessível');
      if (businesses.length > 0) {
        console.log('📋 Campos disponíveis:', Object.keys(businesses[0]));
      }
    }
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
  }
}

// Executar teste
testChatbotAPI().catch(console.error);
