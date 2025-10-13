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
   * Buscar LP por slug
   */
  async getLandingPageBySlug(slug: string): Promise<LandingPageWithProducts | null> {
    try {
      // Buscar LP
      const { data: lp, error: lpError } = await this.supabase
        .from('landing_pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .eq('is_active', true)
        .single();

      if (lpError || !lp) {
        console.error('Error fetching landing page:', lpError);
        return null;
      }

      // Buscar produtos relacionados
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
        .eq('lp_id', lp.id)
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
   * Buscar LP por ID
   */
  async getLandingPageById(id: string): Promise<LandingPageWithProducts | null> {
    try {
      const { data: lp, error: lpError } = await this.supabase
        .from('landing_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (lpError || !lp) {
        console.error('Error fetching landing page:', lpError);
        return null;
      }

      // Buscar produtos relacionados
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
        .eq('lp_id', lp.id)
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
}

// Singleton instance
export const landingPagesService = new LandingPagesService();

