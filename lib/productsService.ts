import { supabase } from './supabase';

export interface Product {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  default_price: number;
  pricing_model: 'recurring' | 'fixed';
  billing_cycle: 'monthly' | 'one-time';
  is_active: boolean;
  requires_contract: boolean;
  min_duration_months: number;
  max_duration_months: number;
  features: string[];
  terms: any;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const productsService = {
  // Buscar todos os produtos ativos
  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('default_price', { ascending: true });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }

    return data || [];
  },

  // Buscar produto por slug
  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }

    return data;
  },

  // Buscar produtos por categoria
  async getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('default_price', { ascending: true });

    if (error) {
      console.error('Erro ao buscar produtos por categoria:', error);
      return [];
    }

    return data || [];
  },

  // Calcular preço do combo (todos os produtos de serviço)
  async getComboPrice(): Promise<{ monthly: number; semestral: number; discount: number }> {
    const products = await this.getAllProducts();
    const serviceProducts = products.filter(p => p.category === 'Serviço' && p.pricing_model === 'recurring');
    
    const monthlyTotal = serviceProducts.reduce((sum, p) => sum + Number(p.default_price), 0);
    
    // Desconto de 22% no combo
    const comboMonthly = monthlyTotal * 0.78; // 78% do total (22% de desconto)
    
    // Preço semestral com desconto adicional (assumindo que o semestral é ~60% do mensal)
    const comboSemestral = comboMonthly * 0.66; // ~34% de desconto total
    
    return {
      monthly: Math.round(comboMonthly),
      semestral: Math.round(comboSemestral),
      discount: Math.round(monthlyTotal - comboMonthly)
    };
  },

  // Formatar preço para exibição
  formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }
};

