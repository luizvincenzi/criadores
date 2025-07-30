/**
 * Sistema Híbrido Premium: UUIDs + SEO URLs
 * Backend usa UUIDs, Frontend usa URLs SEO-friendly
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cache em memória para evitar consultas desnecessárias
const urlCache = new Map<string, CampaignData>();
const reverseCache = new Map<string, string>();

export interface CampaignData {
  campaignId: string;
  businessId: string;
  businessName: string;
  monthYearId: number;
  campaignTitle: string;
  seoUrl: string;
  createdAt: string;
}

/**
 * Normaliza string para URL SEO-friendly
 */
function normalizeForUrl(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-+|-+$/g, '') // Remove hífens no início e fim
    .trim();
}

/**
 * Converte month_year_id para formato legível
 */
function formatMonthYear(monthYearId: number): string {
  const year = Math.floor(monthYearId / 100);
  const month = monthYearId % 100;
  
  const monthNames = [
    '', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ];
  
  return `${monthNames[month]}-${year}`;
}

/**
 * Converte formato legível para month_year_id
 */
function parseMonthYear(monthYearStr: string): number | null {
  const monthMap: Record<string, number> = {
    'jan': 1, 'fev': 2, 'mar': 3, 'abr': 4, 'mai': 5, 'jun': 6,
    'jul': 7, 'ago': 8, 'set': 9, 'out': 10, 'nov': 11, 'dez': 12
  };
  
  const parts = monthYearStr.split('-');
  if (parts.length !== 2) return null;
  
  const [monthStr, yearStr] = parts;
  const month = monthMap[monthStr];
  const year = parseInt(yearStr);
  
  if (!month || !year || year < 2020 || year > 2030) return null;
  
  return year * 100 + month;
}

/**
 * Gera URL SEO-friendly para uma campanha
 */
export function generateSeoUrl(businessName: string, monthYearId: number): string {
  const businessSlug = normalizeForUrl(businessName);
  const monthYear = formatMonthYear(monthYearId);
  return `/campaign/${businessSlug}-${monthYear}`;
}

/**
 * Busca campanha por UUIDs (método interno confiável)
 */
export async function getCampaignByIds(
  businessId: string, 
  monthYearId: number
): Promise<CampaignData | null> {
  try {
    console.log('🔍 [UUID SYSTEM] Buscando campanha por IDs:', { businessId, monthYearId });

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        business_id,
        month_year_id,
        created_at,
        businesses!inner(
          id,
          name
        )
      `)
      .eq('business_id', businessId)
      .eq('month_year_id', monthYearId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ [UUID SYSTEM] Erro ao buscar campanha:', error);
      return null;
    }

    if (!campaigns || campaigns.length === 0) {
      console.log('❌ [UUID SYSTEM] Campanha não encontrada');
      return null;
    }

    const campaign = campaigns[0];
    const campaignData: CampaignData = {
      campaignId: campaign.id,
      businessId: campaign.business_id,
      businessName: campaign.businesses.name,
      monthYearId: campaign.month_year_id,
      campaignTitle: campaign.title,
      seoUrl: generateSeoUrl(campaign.businesses.name, campaign.month_year_id),
      createdAt: campaign.created_at
    };

    console.log('✅ [UUID SYSTEM] Campanha encontrada:', campaignData);
    return campaignData;

  } catch (error) {
    console.error('❌ [UUID SYSTEM] Erro geral:', error);
    return null;
  }
}

/**
 * Busca campanha por URL SEO-friendly para Landing Page
 */
export async function getCampaignBySeoUrl(seoUrl: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    // Verificar cache primeiro
    if (urlCache.has(seoUrl)) {
      console.log('💾 [CACHE] URL encontrada no cache:', seoUrl);
      return urlCache.get(seoUrl)!;
    }

    console.log('🔍 [SEO URL] Analisando URL:', seoUrl);

    // Extrair business e month da URL
    // Formato esperado: /campaign/business-name-mes-ano
    const urlParts = seoUrl.replace('/campaign/', '').split('-');

    if (urlParts.length < 3) {
      console.error('❌ [SEO URL] Formato de URL inválido:', seoUrl);
      return null;
    }

    // Últimas duas partes são mês-ano
    const year = urlParts.pop()!;
    const month = urlParts.pop()!;
    const businessSlug = urlParts.join('-');

    const monthYearId = parseMonthYear(`${month}-${year}`);
    if (!monthYearId) {
      console.error('❌ [SEO URL] Formato de data inválido:', `${month}-${year}`);
      return null;
    }

    console.log('📊 [SEO URL] Dados extraídos:', { businessSlug, monthYearId });

    // Buscar business por slug normalizado
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('organization_id', DEFAULT_ORG_ID);

    if (businessError || !businesses) {
      console.error('❌ [SEO URL] Erro ao buscar businesses:', businessError);
      return null;
    }

    // Encontrar business que corresponde ao slug
    let matchedBusiness = null;
    for (const business of businesses) {
      const normalizedName = normalizeForUrl(business.name);
      if (normalizedName === businessSlug) {
        matchedBusiness = business;
        break;
      }
    }

    if (!matchedBusiness) {
      console.error('❌ [SEO URL] Business não encontrado para slug:', businessSlug);
      return null;
    }

    console.log('✅ [SEO URL] Business encontrado:', matchedBusiness);

    // Buscar campanha completa para landing page
    const { data: campaigns, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        description,
        month_year_id,
        month,
        status,
        budget,
        start_date,
        end_date,
        objectives,
        deliverables,
        briefing_details,
        created_at,
        businesses!inner(
          id,
          name,
          contact_info,
          address,
          custom_fields
        )
      `)
      .eq('business_id', matchedBusiness.id)
      .eq('month_year_id', monthYearId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (campaignError || !campaigns) {
      console.error('❌ [SEO URL] Campanha não encontrada:', campaignError);
      return {
        success: false,
        error: 'Campanha não encontrada'
      };
    }

    // Buscar estatísticas dos criadores
    const { data: creatorStats, error: statsError } = await supabase
      .from('campaign_creators')
      .select('*')
      .eq('campaign_id', campaigns.id);

    const stats = {
      totalCreators: creatorStats?.length || 0,
      confirmedCreators: creatorStats?.filter(c => c.confirmada === 'CONFIRMADA').length || 0,
      completedBriefings: creatorStats?.filter(c => c.briefing === 'SIM').length || 0,
      approvedVideos: creatorStats?.filter(c => c.aprovado === 'APROVADO').length || 0,
      postedVideos: creatorStats?.filter(c => c.postado === 'POSTADO').length || 0
    };

    const result = {
      campaign: {
        ...campaigns,
        seo_url: seoUrl
      },
      business: campaigns.businesses,
      stats
    };

    console.log('✅ [SEO URL] Dados completos carregados:', result);

    return {
      success: true,
      data: result
    };

  } catch (error) {
    console.error('❌ [SEO URL] Erro geral:', error);
    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}

/**
 * Busca campanha por Campaign ID único
 */
export async function getCampaignById(campaignId: string): Promise<CampaignData | null> {
  try {
    console.log('🔍 [CAMPAIGN ID] Buscando campanha por ID:', campaignId);

    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        business_id,
        month_year_id,
        created_at,
        businesses!inner(
          id,
          name
        )
      `)
      .eq('id', campaignId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (error || !campaigns) {
      console.error('❌ [CAMPAIGN ID] Campanha não encontrada:', error);
      return null;
    }

    const campaignData: CampaignData = {
      campaignId: campaigns.id,
      businessId: campaigns.business_id,
      businessName: campaigns.businesses.name,
      monthYearId: campaigns.month_year_id,
      campaignTitle: campaigns.title,
      seoUrl: generateSeoUrl(campaigns.businesses.name, campaigns.month_year_id),
      createdAt: campaigns.created_at
    };

    console.log('✅ [CAMPAIGN ID] Campanha encontrada:', campaignData);
    return campaignData;

  } catch (error) {
    console.error('❌ [CAMPAIGN ID] Erro geral:', error);
    return null;
  }
}

/**
 * Lista todas as campanhas com suas URLs SEO
 */
export async function getAllCampaignUrls(): Promise<CampaignData[]> {
  try {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select(`
        id,
        title,
        business_id,
        month_year_id,
        created_at,
        businesses!inner(
          id,
          name
        )
      `)
      .eq('organization_id', DEFAULT_ORG_ID)
      .order('created_at', { ascending: false });

    if (error || !campaigns) {
      console.error('❌ [ALL CAMPAIGNS] Erro ao buscar campanhas:', error);
      return [];
    }

    return campaigns.map(campaign => ({
      campaignId: campaign.id,
      businessId: campaign.business_id,
      businessName: campaign.businesses.name,
      monthYearId: campaign.month_year_id,
      campaignTitle: campaign.title,
      seoUrl: generateSeoUrl(campaign.businesses.name, campaign.month_year_id),
      createdAt: campaign.created_at
    }));

  } catch (error) {
    console.error('❌ [ALL CAMPAIGNS] Erro geral:', error);
    return [];
  }
}

/**
 * Limpa cache (útil para desenvolvimento)
 */
export function clearCache(): void {
  urlCache.clear();
  reverseCache.clear();
  console.log('🧹 [CACHE] Cache limpo');
}
