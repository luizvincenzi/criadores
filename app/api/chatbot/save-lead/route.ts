import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
  const leadId = generateLeadId();

  try {
    const userData = await request.json();

    // 🔍 LOG DETALHADO - Dados recebidos
    console.log('🔍 [CHATBOT API] Dados recebidos:', JSON.stringify(userData, null, 2));
    console.log('🔍 [CHATBOT API] Lead ID gerado:', leadId);
    console.log('🔍 [CHATBOT API] Timestamp:', new Date().toISOString());

    // Validar dados obrigatórios
    if (!userData.name || !userData.email) {
      console.error('❌ [CHATBOT API] Dados obrigatórios faltando:', { name: userData.name, email: userData.email });
      return NextResponse.json(
        { success: false, error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Preparar dados para a tabela businesses do Supabase
    const businessData = {
      organization_id: "00000000-0000-0000-0000-000000000001",
      name: userData.userType === 'empresa' ? userData.businessName : userData.name,
      slug: generateSlug(userData.userType === 'empresa' ? userData.businessName : userData.name),
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
        notes: `Lead gerado via chatbot - ${userData.userType === 'empresa' ? 'Empresa' : 'Criador'} - Protocolo: ${leadId}`,
        categoria: getCategoryFromData(userData),
        comercial: "",
        planoAtual: "",
        responsavel: "Chatbot",
        grupoWhatsappCriado: "Não",
        tipoUsuario: userData.userType,
        dadosCompletos: userData,
        protocoloChatbot: leadId,
        timestampChatbot: new Date().toISOString()
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

    console.log('✅ [CHATBOT API] Lead salvo com sucesso:', JSON.stringify(data, null, 2));
    console.log('✅ [CHATBOT API] ID do registro criado:', data[0]?.id);

    // Verificar se realmente foi salvo
    const { data: verification, error: verifyError } = await supabase
      .from('businesses')
      .select('id, name, contact_info, custom_fields')
      .eq('id', data[0]?.id)
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
