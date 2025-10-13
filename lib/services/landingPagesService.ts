// ============================================================================
// LANDING PAGES SERVICE
// ============================================================================
// Serviço para buscar Landing Pages do Supabase
// ============================================================================

import { createClient } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface LandingPageHero {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  urgency_badge?: string;
  social_proof?: Record<string, number>;
  trust_badges?: string[];
}

export interface LandingPageProblem {
  icon: string;
  title: string;
  description: string;
}

export interface LandingPageProblema {
  title: string;
  subtitle?: string;
  problems: LandingPageProblem[];
  agitation?: string;
}

export interface LandingPageSolution {
  order: number;
  product_id: string;
  title: string;
  description: string;
  benefits: string[];
  price_monthly?: number;
  price_semestral?: number;
  urgency?: string;
  cta_text: string;
  cta_url: string;
  compliance_note?: string;
}

export interface LandingPageCombo {
  title: string;
  description: string;
  price_monthly: number;
  price_semestral: number;
  discount_percentage: number;
  urgency?: string;
  exclusive_benefits?: string[];
  bonus?: string[];
  guarantee?: string;
}

export interface LandingPageProcessStep {
  number: number;
  title: string;
  description: string;
}

export interface LandingPageTestimonial {
  name: string;
  company: string;
  role?: string;
  photo?: string;
  text: string;
  result?: string;
}

export interface LandingPageFAQ {
  question: string;
  answer: string;
}

export interface LandingPageCTA {
  title: string;
  subtitle?: string;
  cta_text: string;
  cta_url: string;
}

export interface LandingPageTheme {
  primary_color: string;
  secondary_color: string;
  font_family?: string;
  border_radius?: string;
}

export interface LandingPageMentor {
  show: boolean;
  name?: string;
  title?: string;
  bio?: string;
  photo?: string;
}

export interface LandingPageCompliance {
  title: string;
  description: string;
  rules: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export interface LandingPageVariables {
  hero: LandingPageHero;
  problema?: LandingPageProblema;
  solucoes?: LandingPageSolution[];
  combo?: LandingPageCombo;
  processo?: {
    title: string;
    steps: LandingPageProcessStep[];
  };
  depoimentos?: LandingPageTestimonial[];
  urgencia?: {
    title: string;
    message: string;
    countdown?: { enabled: boolean };
    scarcity_type?: string;
  };
  faq?: LandingPageFAQ[];
  cta_final?: LandingPageCTA;
  theme?: LandingPageTheme;
  mentor?: LandingPageMentor;
  compliance?: LandingPageCompliance;
}

export interface LandingPageSEO {
  title: string;
  description: string;
  keywords?: string[];
  og_image?: string;
  og_type?: string;
  canonical?: string;
  robots?: string;
}

export interface LandingPageConfig {
  chatbot_url?: string;
  conversion_goal?: string;
  analytics?: {
    ga4_id?: string;
    meta_pixel_id?: string;
  };
  features?: {
    show_urgency?: boolean;
    show_countdown?: boolean;
    show_mentor?: boolean;
    show_compliance?: boolean;
  };
  segment?: string;
}

export interface LandingPage {
  id: string;
  slug: string;
  name: string;
  category: string;
  template_id: string;
  variables: LandingPageVariables;
  config: LandingPageConfig;
  seo: LandingPageSEO;
  status: string;
  is_active: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LandingPageWithProducts extends LandingPage {
  products?: Array<{
    id: string;
    name: string;
    slug: string;
    default_price: number;
    order_index: number;
  }>;
}

// ============================================================================
// SERVICE
// ============================================================================

export class LandingPagesService {
  private supabase = createClient();

  /**
   * Buscar LP por slug (SEMPRE da última versão em lp_versions)
   */
  async getLandingPageBySlug(slug: string): Promise<LandingPageWithProducts | null> {
    try {
      // PASSO 1: Buscar LP básica para pegar o ID
      const { data: lpBasic, error: lpBasicError } = await this.supabase
        .from('landing_pages')
        .select('id, slug, name, category, template_id, status, is_active')
        .eq('slug', slug)
        .eq('status', 'active')
        .eq('is_active', true)
        .single();

      if (lpBasicError || !lpBasic) {
        console.error('Error fetching landing page:', lpBasicError);
        return null;
      }

      // PASSO 2: Buscar ÚLTIMA VERSÃO da LP (snapshot mais recente)
      const { data: latestVersion, error: versionError } = await this.supabase
        .from('lp_versions')
        .select('snapshot, version_number, created_at')
        .eq('lp_id', lpBasic.id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      if (versionError || !latestVersion) {
        console.error('Error fetching latest version:', versionError);
        console.warn('⚠️ Nenhuma versão encontrada, usando dados da tabela principal');

        // Fallback: usar dados da tabela principal se não houver versões
        const { data: lpFallback } = await this.supabase
          .from('landing_pages')
          .select('*')
          .eq('id', lpBasic.id)
          .single();

        if (!lpFallback) return null;

        // Buscar produtos
        const { data: lpProducts } = await this.supabase
          .from('lp_products')
          .select(`
            order_index,
            products (
              id,
              name,
              slug,
              default_price
            )
          `)
          .eq('lp_id', lpBasic.id)
          .order('order_index');

        const products = lpProducts?.map((lpp: any) => ({
          ...lpp.products,
          order_index: lpp.order_index,
        })) || [];

        return {
          ...lpFallback,
          products,
        } as LandingPageWithProducts;
      }

      console.log(`✅ Usando versão ${latestVersion.version_number} da LP ${slug}`);

      // PASSO 3: Montar LP com dados da última versão
      const lp = {
        id: lpBasic.id,
        slug: lpBasic.slug,
        name: lpBasic.name,
        category: lpBasic.category,
        template_id: lpBasic.template_id,
        status: lpBasic.status,
        is_active: lpBasic.is_active,
        ...latestVersion.snapshot, // ← DADOS DA ÚLTIMA VERSÃO
        version_number: latestVersion.version_number,
        version_created_at: latestVersion.created_at,
      };

      // PASSO 4: Buscar produtos relacionados
      const { data: lpProducts, error: productsError } = await this.supabase
        .from('lp_products')
        .select(`
          order_index,
          products (
            id,
            name,
            slug,
            default_price
          )
        `)
        .eq('lp_id', lpBasic.id)
        .order('order_index');

      if (productsError) {
        console.error('Error fetching products:', productsError);
      }

      // Formatar produtos
      const products = lpProducts?.map((lpp: any) => ({
        ...lpp.products,
        order_index: lpp.order_index,
      })) || [];

      return {
        ...lp,
        products,
      } as LandingPageWithProducts;
    } catch (error) {
      console.error('Error in getLandingPageBySlug:', error);
      return null;
    }
  }

  /**
   * Buscar todas as LPs ativas
   */
  async getActiveLandingPages(): Promise<LandingPage[]> {
    try {
      const { data, error } = await this.supabase
        .from('landing_pages')
        .select('*')
        .eq('status', 'active')
        .eq('is_active', true)
        .order('created_at');

      if (error) {
        console.error('Error fetching landing pages:', error);
        return [];
      }

      return data as LandingPage[];
    } catch (error) {
      console.error('Error in getActiveLandingPages:', error);
      return [];
    }
  }

  /**
   * Buscar LP por ID (SEMPRE da última versão em lp_versions)
   */
  async getLandingPageById(id: string): Promise<LandingPageWithProducts | null> {
    try {
      // PASSO 1: Buscar LP básica
      const { data: lpBasic, error: lpBasicError } = await this.supabase
        .from('landing_pages')
        .select('id, slug, name, category, template_id, status, is_active')
        .eq('id', id)
        .single();

      if (lpBasicError || !lpBasic) {
        console.error('Error fetching landing page:', lpBasicError);
        return null;
      }

      // PASSO 2: Buscar ÚLTIMA VERSÃO
      const { data: latestVersion, error: versionError } = await this.supabase
        .from('lp_versions')
        .select('snapshot, version_number, created_at')
        .eq('lp_id', id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      if (versionError || !latestVersion) {
        console.error('Error fetching latest version:', versionError);
        console.warn('⚠️ Nenhuma versão encontrada, usando dados da tabela principal');

        // Fallback
        const { data: lpFallback } = await this.supabase
          .from('landing_pages')
          .select('*')
          .eq('id', id)
          .single();

        if (!lpFallback) return null;

        const { data: lpProducts } = await this.supabase
          .from('lp_products')
          .select(`
            order_index,
            products (
              id,
              name,
              slug,
              default_price
            )
          `)
          .eq('lp_id', id)
          .order('order_index');

        const products = lpProducts?.map((lpp: any) => ({
          ...lpp.products,
          order_index: lpp.order_index,
        })) || [];

        return {
          ...lpFallback,
          products,
        } as LandingPageWithProducts;
      }

      console.log(`✅ Usando versão ${latestVersion.version_number} da LP ID ${id}`);

      // PASSO 3: Montar LP com dados da última versão
      const lp = {
        id: lpBasic.id,
        slug: lpBasic.slug,
        name: lpBasic.name,
        category: lpBasic.category,
        template_id: lpBasic.template_id,
        status: lpBasic.status,
        is_active: lpBasic.is_active,
        ...latestVersion.snapshot,
        version_number: latestVersion.version_number,
        version_created_at: latestVersion.created_at,
      };

      // PASSO 4: Buscar produtos
      const { data: lpProducts, error: productsError } = await this.supabase
        .from('lp_products')
        .select(`
          order_index,
          products (
            id,
            name,
            slug,
            default_price
          )
        `)
        .eq('lp_id', id)
        .order('order_index');

      if (productsError) {
        console.error('Error fetching products:', productsError);
      }

      const products = lpProducts?.map((lpp: any) => ({
        ...lpp.products,
        order_index: lpp.order_index,
      })) || [];

      return {
        ...lp,
        products,
      } as LandingPageWithProducts;
    } catch (error) {
      console.error('Error in getLandingPageById:', error);
      return null;
    }
  }

  /**
   * Criar nova versão de uma LP
   */
  async createVersion(
    lpId: string,
    data: {
      variables?: any;
      config?: any;
      seo?: any;
      products?: any[];
      change_description?: string;
      created_by?: string;
    }
  ): Promise<any> {
    try {
      // PASSO 1: Buscar última versão
      const { data: lastVersion } = await this.supabase
        .from('lp_versions')
        .select('version_number, snapshot')
        .eq('lp_id', lpId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      const newVersionNumber = lastVersion ? lastVersion.version_number + 1 : 1;

      // PASSO 2: Criar snapshot (merge com dados anteriores se existirem)
      const snapshot = {
        variables: data.variables || lastVersion?.snapshot?.variables || {},
        config: data.config || lastVersion?.snapshot?.config || {},
        seo: data.seo || lastVersion?.snapshot?.seo || {},
        products: data.products || lastVersion?.snapshot?.products || []
      };

      // PASSO 3: Inserir nova versão
      const { data: newVersion, error } = await this.supabase
        .from('lp_versions')
        .insert({
          lp_id: lpId,
          version_number: newVersionNumber,
          snapshot: snapshot,
          change_description: data.change_description || `Versão ${newVersionNumber}`,
          created_by: data.created_by || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating version:', error);
        throw error;
      }

      console.log(`✅ Versão ${newVersionNumber} criada para LP ${lpId}`);

      // PASSO 4: Atualizar tabela principal (fallback)
      await this.supabase
        .from('landing_pages')
        .update({
          variables: snapshot.variables,
          config: snapshot.config,
          seo: snapshot.seo,
          updated_at: new Date().toISOString()
        })
        .eq('id', lpId);

      return newVersion;
    } catch (error) {
      console.error('Error in createVersion:', error);
      throw error;
    }
  }

  /**
   * Buscar histórico de versões
   */
  async getVersionHistory(lpId: string): Promise<any[]> {
    try {
      const { data: versions, error } = await this.supabase
        .from('lp_versions')
        .select('id, version_number, created_at, created_by, change_description')
        .eq('lp_id', lpId)
        .order('version_number', { ascending: false });

      if (error) {
        console.error('Error fetching version history:', error);
        return [];
      }

      return versions || [];
    } catch (error) {
      console.error('Error in getVersionHistory:', error);
      return [];
    }
  }

  /**
   * Buscar versão específica
   */
  async getVersion(lpId: string, versionNumber: number): Promise<any | null> {
    try {
      const { data: version, error } = await this.supabase
        .from('lp_versions')
        .select('*')
        .eq('lp_id', lpId)
        .eq('version_number', versionNumber)
        .single();

      if (error) {
        console.error('Error fetching version:', error);
        return null;
      }

      return version;
    } catch (error) {
      console.error('Error in getVersion:', error);
      return null;
    }
  }

  /**
   * Atualizar LP (cria nova versão automaticamente)
   */
  async updateLandingPage(
    lpId: string,
    updates: {
      variables?: any;
      config?: any;
      seo?: any;
      products?: any[];
      change_description?: string;
      created_by?: string;
    }
  ): Promise<any> {
    return this.createVersion(lpId, updates);
  }
}

// Singleton instance
export const landingPagesService = new LandingPagesService();

