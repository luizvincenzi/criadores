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
  try {
    const userData = await request.json();
    
    console.log('Dados recebidos do chatbot:', userData);
    
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
        notes: `Lead gerado via chatbot - ${userData.userType === 'empresa' ? 'Empresa' : 'Criador'}`,
        categoria: getCategoryFromData(userData),
        comercial: "",
        planoAtual: "",
        responsavel: "Chatbot",
        grupoWhatsappCriado: "Não",
        tipoUsuario: userData.userType,
        dadosCompletos: userData
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

    // Salvar no Supabase
    const { data, error } = await supabase
      .from('businesses')
      .insert([businessData])
      .select();

    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('Lead salvo com sucesso:', data);
    
    return NextResponse.json({
      success: true,
      data: data[0],
      leadId: generateLeadId()
    });

  } catch (error) {
    console.error('Erro na API do chatbot:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function generateSlug(name: string): string {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() + '-' + Math.random().toString(36).substr(2, 8);
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
