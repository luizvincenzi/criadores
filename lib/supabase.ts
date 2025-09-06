import { createClient } from '@supabase/supabase-js';

// Configuração direta do Supabase
const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

console.log('🔧 [SUPABASE] Configurando cliente Supabase...');

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

console.log('✅ [SUPABASE] Cliente configurado com sucesso');

// Tipos para o blog
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: {
    context: string;
    data: string;
    application: string;
    conclusion: string;
  };
  category: string;
  category_color: string;
  date: string;
  read_time: string;
  image_url?: string;
  featured: boolean;
  published: boolean;
  author_id?: string;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  cta_text?: string;
  cta_link?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  created_at: string;
}

// Funções para o blog
export const blogService = {
  // Buscar todos os posts
  async getAllPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts:', error);
      return [];
    }

    return data || [];
  },

  // Buscar post por slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      console.error('Erro ao buscar post:', error);
      return null;
    }

    return data;
  },

  // Buscar posts por categoria
  async getPostsByCategory(category: string): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('category', category)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts por categoria:', error);
      return [];
    }

    return data || [];
  },

  // Buscar posts em destaque
  async getFeaturedPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('featured', true)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Erro ao buscar posts em destaque:', error);
      return [];
    }

    return data || [];
  },

  // Buscar posts relacionados
  async getRelatedPosts(currentPostId: string, category: string, limit: number = 3): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('category', category)
      .eq('published', true)
      .neq('id', currentPostId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar posts relacionados:', error);
      return [];
    }

    return data || [];
  },

  // Criar novo post
  async createPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([post])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar post:', error);
      return null;
    }

    return data;
  },

  // Atualizar post
  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar post:', error);
      return null;
    }

    return data;
  },

  // Deletar post
  async deletePost(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar post:', error);
      return false;
    }

    return true;
  },

  // Buscar categorias
  async getCategories(): Promise<BlogCategory[]> {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return [];
    }

    return data || [];
  }
};

export default supabase;
