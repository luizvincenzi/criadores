/**
 * Sistema Premium de Mapeamento de Slugs
 * Resolve problemas com acentos, caracteres especiais e variações de nomes
 */

// Mapeamento manual para casos especiais
const BUSINESS_SLUG_MAPPING: Record<string, string> = {
  'auto-posto-bela-suica': 'Auto Posto Bela Suíça',
  'auto-posto-bela-suiça': 'Auto Posto Bela Suíça',
  'boussole': 'Boussolé',
  'clinica-odontologica-natalia': 'Clinica Odontológica Natalia',
  'clinica-odontologica-natália': 'Clinica Odontológica Natalia',
  'govinda': 'Govinda',
  'porks': 'Porks',
  'cartagena': 'Cartagena'
};

/**
 * Normaliza uma string removendo acentos e caracteres especiais
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-+|-+$/g, '') // Remove hífens no início e fim
    .trim();
}

/**
 * Converte slug para nome do business usando múltiplas estratégias
 */
export function slugToBusinessName(slug: string): string {
  // Estratégia 1: Mapeamento manual (mais confiável)
  if (BUSINESS_SLUG_MAPPING[slug]) {
    return BUSINESS_SLUG_MAPPING[slug];
  }

  // Estratégia 2: Conversão automática
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Converte nome do business para slug
 */
export function businessNameToSlug(name: string): string {
  return normalizeString(name);
}

/**
 * Gera todas as variações possíveis de um nome para busca flexível
 */
export function generateBusinessNameVariations(slug: string): string[] {
  const variations = new Set<string>();
  
  // Variação 1: Mapeamento manual
  if (BUSINESS_SLUG_MAPPING[slug]) {
    variations.add(BUSINESS_SLUG_MAPPING[slug]);
  }
  
  // Variação 2: Conversão automática
  const autoConverted = slugToBusinessName(slug);
  variations.add(autoConverted);
  
  // Variação 3: Com acentos comuns
  const withAccents = autoConverted
    .replace(/a/g, '[aáàâã]')
    .replace(/e/g, '[eéèê]')
    .replace(/i/g, '[iíì]')
    .replace(/o/g, '[oóòôõ]')
    .replace(/u/g, '[uúù]')
    .replace(/c/g, '[cç]');
  variations.add(withAccents);
  
  // Variação 4: Sem acentos
  const withoutAccents = normalizeString(autoConverted);
  variations.add(withoutAccents);
  
  return Array.from(variations);
}

/**
 * Valida se um slug corresponde a um nome de business
 */
export function validateSlugBusinessMatch(slug: string, businessName: string): boolean {
  const expectedSlug = businessNameToSlug(businessName);
  const normalizedSlug = normalizeString(slug);
  
  return normalizedSlug === expectedSlug;
}

/**
 * Busca business por slug com fallbacks inteligentes
 */
export interface BusinessSearchResult {
  found: boolean;
  businessName?: string;
  confidence: 'exact' | 'mapped' | 'fuzzy' | 'none';
  variations: string[];
}

export function findBusinessBySlug(slug: string): BusinessSearchResult {
  const variations = generateBusinessNameVariations(slug);
  
  // Estratégia 1: Mapeamento exato
  if (BUSINESS_SLUG_MAPPING[slug]) {
    return {
      found: true,
      businessName: BUSINESS_SLUG_MAPPING[slug],
      confidence: 'exact',
      variations
    };
  }
  
  // Estratégia 2: Conversão automática
  const autoConverted = slugToBusinessName(slug);
  return {
    found: true,
    businessName: autoConverted,
    confidence: 'mapped',
    variations
  };
}

/**
 * Atualiza o mapeamento manual com novos businesses
 */
export function updateBusinessMapping(slug: string, businessName: string): void {
  BUSINESS_SLUG_MAPPING[slug] = businessName;
  
  // Também adiciona variação sem acentos
  const normalizedSlug = normalizeString(businessName);
  if (normalizedSlug !== slug) {
    BUSINESS_SLUG_MAPPING[normalizedSlug] = businessName;
  }
}

/**
 * Gera URL de landing page para uma campanha
 */
export function generateLandingPageUrl(businessName: string, monthYearId: number): string {
  const slug = businessNameToSlug(businessName);
  return `/campaign/${slug}/${monthYearId}`;
}

/**
 * Valida formato de month_year_id
 */
export function validateMonthYearId(monthSlug: string): { valid: boolean; monthYearId?: number; error?: string } {
  if (!/^\d{6}$/.test(monthSlug)) {
    return {
      valid: false,
      error: `Formato de mês inválido: ${monthSlug}. Use formato YYYYMM (ex: 202507)`
    };
  }
  
  const monthYearId = parseInt(monthSlug);
  
  if (monthYearId < 202001 || monthYearId > 203012) {
    return {
      valid: false,
      error: `Mês fora do intervalo válido: ${monthYearId}. Use entre 202001 e 203012`
    };
  }
  
  return {
    valid: true,
    monthYearId
  };
}

/**
 * Debug: Lista todos os mapeamentos disponíveis
 */
export function getAvailableMappings(): Record<string, string> {
  return { ...BUSINESS_SLUG_MAPPING };
}
