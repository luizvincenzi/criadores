import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Função para mapear source para lead_source aceito pelo banco
function mapSourceToLeadSource(source: string): string {
  // Mapeamento direto de sources para lead_source
  // Após executar SOLUÇÃO_SIMPLES_LEAD_SOURCE.sql, todos os valores serão aceitos
  const sourceMapping: { [key: string]: string } = {
    'chatcriadores-home': 'chatcriadores-home',
    'chatcriadores-novo': 'chatcriadores-novo',
    'chatcriadores-empresas': 'chatcriadores-empresas',
    'chatcriadores-criadores': 'chatcriadores-criadores',
    'chatcriadores-medicos': 'chatcriadores-medicos',
    'chatcriadores-advogados': 'chatcriadores-advogados',
    'chatcriadores-social-media': 'chatcriadores-social-media',
    'chatcriadores-mentoria': 'chatcriadores-mentoria',
    'criavoz-chatbot': 'proprio',
    'criavoz-homepage': 'proprio',
    'criavoz-novo': 'proprio',
    'proprio': 'proprio',
    'indicacao': 'indicacao',
    'socio': 'socio',
    'parceiro': 'parceiro',
    'organico': 'organico',
    'pago': 'pago'
  };

  return sourceMapping[source] || 'proprio';
}

// Configuração do Supabase com service role para operações sem autenticação
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  let leadId: string = '';

  try {
    leadId = generateLeadId();
    const userData = await request.json();

    // Determinar a fonte baseada nos dados enviados pelo chatbot
    const source = userData.source || 'criavoz-chatbot';

    // 🔍 LOG DETALHADO - Dados recebidos
    console.log('🔍 [CHATBOT API] Dados recebidos:', JSON.stringify(userData, null, 2));
    console.log('🔍 [CHATBOT API] Lead ID gerado:', leadId);
    console.log('🔍 [CHATBOT API] Fonte identificada:', source);
    console.log('🔍 [CHATBOT API] Timestamp:', new Date().toISOString());

    // Validar dados obrigatórios (email OU whatsapp como contato)
    if (!userData.name || (!userData.email && !userData.whatsapp)) {
      console.error('❌ [CHATBOT API] Dados obrigatórios faltando:', { name: userData.name, email: userData.email, whatsapp: userData.whatsapp });
      return NextResponse.json(
        { success: false, error: 'Nome e pelo menos um contato (email ou WhatsApp) são obrigatórios' },
        { status: 400 }
      );
    }

    // Preparar dados para a tabela businesses do Supabase
    const businessData = {
      organization_id: "00000000-0000-0000-0000-000000000001",
      name: userData.businessName || userData.name,
      slug: generateSlug(userData.businessName || userData.name),
      contact_info: JSON.stringify({
        email: userData.email,
        phone: userData.whatsapp,
        whatsapp: userData.whatsapp,
        instagram: userData.instagram,
        primary_contact: userData.name
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
        notes: `Lead gerado via ${source} - ${userData.userType === 'empresa' ? 'Empresa' : 'Criador'} - Protocolo: ${leadId}`,
        categoria: getCategoryFromData(userData),
        comercial: "",
        planoAtual: "",
        responsavel: "Chatbot",
        grupoWhatsappCriado: "Não",
        tipoUsuario: userData.userType,
        dadosCompletos: userData,
        protocoloChatbot: leadId,
        timestampChatbot: new Date().toISOString(),
        fonte: source,
        // Dados específicos do chatbot para facilitar acesso
        nomeResponsavel: userData.name,
        whatsappResponsavel: userData.whatsapp,
        emailResponsavel: userData.email,
        instagramResponsavel: userData.instagram,
        segmento: userData.userType === 'empresa' ? userData.businessSegment : userData.creatorNiche,
        objetivo: userData.userType === 'empresa' ? userData.businessGoal : 'criacao_conteudo',
        experienciaAnterior: userData.userType === 'empresa' ? userData.hasWorkedWithInfluencers : userData.hasWorkedWithBrands,
        desafioSocialMedia: userData.socialMediaPain || null,
        quantidadeSeguidores: userData.userType === 'criador' ? userData.followersCount : null,
        // Dados específicos do Instagram (se aplicável)
        instagramHandle: userData.instagramHandle || null,
        instagramFollowers: userData.instagramFollowers || null,
        monthlyBudget: userData.monthlyBudget || null
      }),
      metrics: JSON.stringify({
        roi: 0,
        total_spent: 0,
        total_campaigns: 0,
        active_campaigns: 0
      }),
      is_active: true,
      business_stage: "Leads próprios quentes",
      lead_source: mapSourceToLeadSource(source), // Mapear source para valores aceitos
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

    // 🔍 LOG DETALHADO - Dados preparados
    console.log('🔍 [CHATBOT API] Dados preparados para Supabase:', JSON.stringify(businessData, null, 2));

    // Salvar no Supabase
    console.log('🔍 [CHATBOT API] Iniciando inserção no Supabase...');
    const { data, error } = await supabase
      .from('businesses')
      .insert([businessData])
      .select();

    if (error) {
      console.error('❌ [CHATBOT API] Erro ao salvar no Supabase:', error);
      console.error('❌ [CHATBOT API] Detalhes do erro:', JSON.stringify(error, null, 2));
      console.error('❌ [CHATBOT API] Dados que causaram erro:', JSON.stringify(businessData, null, 2));

      // Tentar salvar em uma tabela de backup/logs
      try {
        await logFailedLead(userData, leadId, error);
      } catch (logError) {
        console.error('❌ [CHATBOT API] Erro ao salvar log de falha:', logError);
      }

      return NextResponse.json(
        { success: false, error: error.message, leadId, userData },
        { status: 500 }
      );
    }

    console.log('✅ [CHATBOT API] Business salvo com sucesso:', JSON.stringify(data, null, 2));
    console.log('✅ [CHATBOT API] ID do business criado:', data[0]?.id);

    const businessId = data[0]?.id;

    // 2. CRIAR LEAD NA TABELA LEADS
    console.log('🔍 [CHATBOT API] Criando lead na tabela leads...');

    const leadData = {
      organization_id: "00000000-0000-0000-0000-000000000001",
      name: userData.name,
      email: userData.email || null,
      phone: userData.whatsapp,
      company: userData.businessName || null,
      source: source,
      lead_source: '1 prospect', // SEMPRE 1 prospect para leads dos chatbots
      status: 'new',
      score: userData.userType === 'empresa' ? 80 : 60, // Empresas têm score maior
      contact_info: JSON.stringify({
        tipo: userData.userType,
        origem: 'CriaVoz Chatbot',
        protocolo: leadId,
        dados_originais: userData,
        business_id: businessId
      }),
      notes: `Lead gerado via chatbot - ${userData.userType === 'empresa' ? 'Empresa' : 'Criador'} - Protocolo: ${leadId}`,
      converted_to_business_id: businessId
    };

    const { data: leadResult, error: leadError } = await supabase
      .from('leads')
      .insert([leadData])
      .select();

    if (leadError) {
      console.error('❌ [CHATBOT API] Erro ao criar lead:', leadError);
      // Não falhar a operação por causa do lead, mas logar
    } else {
      console.log('✅ [CHATBOT API] Lead criado com sucesso:', leadResult[0]?.id);
    }

    // 3. ENVIAR NOTIFICAÇÕES
    console.log('🔍 [CHATBOT API] Enviando notificações...');

    try {
      await sendNotifications(userData, leadId, businessId);
    } catch (notificationError) {
      console.error('❌ [CHATBOT API] Erro ao enviar notificações:', notificationError);
      // Não falhar a operação por causa das notificações
    }

    // 4. Verificar se realmente foi salvo
    const { data: verification, error: verifyError } = await supabase
      .from('businesses')
      .select('id, name, contact_info, custom_fields')
      .eq('id', businessId)
      .single();

    if (verifyError) {
      console.error('⚠️ [CHATBOT API] Erro ao verificar salvamento:', verifyError);
    } else {
      console.log('✅ [CHATBOT API] Verificação de salvamento:', JSON.stringify(verification, null, 2));
    }

    return NextResponse.json({
      success: true,
      data: data[0],
      leadId,
      leadData: leadResult?.[0] || null,
      verification: verification || null
    });

  } catch (error) {
    console.error('❌ [CHATBOT API] Erro geral na API:', error);
    console.error('❌ [CHATBOT API] Stack trace:', error instanceof Error ? error.stack : 'N/A');

    // Tentar salvar em uma tabela de backup/logs
    try {
      await logFailedLead(null, leadId, error);
    } catch (logError) {
      console.error('❌ [CHATBOT API] Erro ao salvar log de falha geral:', logError);
    }

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor', leadId },
      { status: 500 }
    );
  }
}

// Função para enviar notificações sobre novo lead
async function sendNotifications(userData: any, leadId: string, businessId: string): Promise<void> {
  try {
    console.log('📧 [NOTIFICATIONS] Enviando notificações para novo lead...');

    // 1. LOG DETALHADO PARA MONITORAMENTO
    console.log('🔔 [NOTIFICATIONS] NOVO LEAD RECEBIDO!');
    console.log('📋 Dados do Lead:');
    console.log(`   👤 Nome: ${userData.name}`);
    console.log(`   🏢 Tipo: ${userData.userType === 'empresa' ? 'Empresa' : 'Criador'}`);
    console.log(`   🏢 Empresa: ${userData.userType === 'empresa' ? userData.businessName : 'N/A'}`);
    console.log(`   📧 Email: ${userData.email}`);
    console.log(`   📱 WhatsApp: ${userData.whatsapp}`);
    console.log(`   📸 Instagram: ${userData.instagram}`);
    console.log(`   🎫 Protocolo: ${leadId}`);
    console.log(`   🆔 Business ID: ${businessId}`);
    console.log(`   📅 Timestamp: ${new Date().toISOString()}`);

    // 2. CHAMAR API DE NOTIFICAÇÕES
    try {
      const notificationResponse = await fetch('http://localhost:3000/api/notifications/new-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadData: userData,
          businessId,
          leadId,
          source: 'chatbot'
        })
      });

      if (notificationResponse.ok) {
        console.log('✅ [NOTIFICATIONS] Notificações enviadas com sucesso');
      } else {
        console.log('⚠️ [NOTIFICATIONS] Falha no envio de notificações (não crítico)');
      }
    } catch (notificationError) {
      console.log('⚠️ [NOTIFICATIONS] Erro no envio de notificações:', notificationError);
    }

  } catch (error) {
    console.error('❌ [NOTIFICATIONS] Erro geral nas notificações:', error);
  }
}


// Função para salvar leads que falharam
async function logFailedLead(userData: any, leadId: string, error: any): Promise<void> {
  try {
    console.log('🔍 [BACKUP LOG] Salvando lead que falhou...');

    // Tentar salvar em uma tabela de logs ou como arquivo
    const failedLeadData = {
      leadId,
      userData,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
      userAgent: userData?.userAgent || 'N/A',
      source: 'chatbot'
    };

    // Salvar em console para debug
    console.log('🔍 [BACKUP LOG] Dados do lead que falhou:', JSON.stringify(failedLeadData, null, 2));

    // Tentar salvar em uma tabela de backup se existir
    try {
      const { error: backupError } = await supabase
        .from('failed_leads')
        .insert([{
          lead_id: leadId,
          user_data: userData,
          error_message: error instanceof Error ? error.message : String(error),
          error_details: JSON.stringify(error),
          created_at: new Date().toISOString()
        }]);

      if (backupError) {
        console.log('⚠️ [BACKUP LOG] Tabela failed_leads não existe, usando apenas console log');
      } else {
        console.log('✅ [BACKUP LOG] Lead salvo na tabela de backup');
      }
    } catch (backupError) {
      console.log('⚠️ [BACKUP LOG] Erro ao salvar em tabela de backup:', backupError);
    }

  } catch (logError) {
    console.error('❌ [BACKUP LOG] Erro ao criar log de falha:', logError);
  }
}

function generateSlug(name: string): string {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Math.random().toString(36).substring(2, 10);
}

function generateLeadId(): string {
  return 'CRI' + Date.now().toString().slice(-6);
}

function getCategoryFromData(userData: any): string {
  if (userData.userType === 'empresa') {
    return getSegmentText(userData.businessSegment);
  } else {
    return getNicheText(userData.creatorNiche);
  }
}

function getSegmentText(segment: string): string {
  const segments: Record<string, string> = {
    'alimentacao': 'Alimentação/Restaurantes',
    'moda': 'Moda/Beleza',
    'saude': 'Saúde/Bem-estar',
    'casa': 'Casa/Decoração',
    'automotivo': 'Automotivo',
    'educacao': 'Educação/Cursos',
    'outros': 'Outros'
  };
  return segments[segment] || segment;
}

function getNicheText(niche: string): string {
  const niches: Record<string, string> = {
    'gastronomia': 'Gastronomia',
    'moda': 'Moda/Lifestyle',
    'fitness': 'Fitness/Saúde',
    'entretenimento': 'Entretenimento',
    'educacao': 'Educação',
    'outros': 'Outros'
  };
  return niches[niche] || niche;
}


