import { createClient } from '@supabase/supabase-js';

// SEGURANCA: Usar variáveis de ambiente (nunca hardcodar chaves)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [SUPABASE] NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios');
}

console.log('🔧 [SUPABASE] Configurando cliente Supabase...');

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

console.log('✅ [SUPABASE] Cliente configurado com sucesso');

// Cliente Admin (Service Role) - APENAS para uso em APIs server-side
// NUNCA exponha a service_role_key no client-side!
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Tipos para o blog (tabela posts)
export interface BlogPost {
  id: string;
  organization_id: string;
  category_id: string;
  author_id: string;
  last_edited_by?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  featured_image_credit?: string;
  youtube_video_url?: string;
  tags: string[];
  audience_target: 'EMPRESAS' | 'CRIADORES' | 'AMBOS';
  status: 'RASCUNHO' | 'PUBLICADO' | 'ARQUIVADO';
  is_featured: boolean;
  scheduled_for?: string;
  published_at?: string;
  status_changed_at?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_image_url?: string;
  read_time_minutes: number;
  view_count: number;
  cta_text?: string;
  cta_link?: string;
  revision: number;
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

// Funções para o blog (tabela posts)
export const blogService = {
  // Buscar todos os posts publicados
  async getAllPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'PUBLICADO')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts:', error);
      return [];
    }

    return data || [];
  },

  // Buscar post por slug
  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'PUBLICADO')
      .single();

    if (error) {
      console.error('Erro ao buscar post:', error);
      return null;
    }

    return data;
  },

  // Buscar posts por audience_target
  async getPostsByAudience(audience: 'EMPRESAS' | 'CRIADORES' | 'AMBOS'): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .or(`audience_target.eq.${audience},audience_target.eq.AMBOS`)
      .eq('status', 'PUBLICADO')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts por audiência:', error);
      return [];
    }

    return data || [];
  },

  // Buscar posts em destaque
  async getFeaturedPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'PUBLICADO')
      .order('published_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Erro ao buscar posts em destaque:', error);
      return [];
    }

    return data || [];
  },

  // Buscar posts relacionados por audience_target
  async getRelatedPosts(currentPostId: string, audience: string, limit: number = 3): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .or(`audience_target.eq.${audience},audience_target.eq.AMBOS`)
      .eq('status', 'PUBLICADO')
      .neq('id', currentPostId)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar posts relacionados:', error);
      return [];
    }

    return data || [];
  },

  // Incrementar view count
  async incrementViewCount(id: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .update({
        view_count: supabase.raw('view_count + 1'),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  },

  // Buscar posts por tags
  async getPostsByTag(tag: string): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .contains('tags', [tag])
      .eq('status', 'PUBLICADO')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts por tag:', error);
      return [];
    }

    return data || [];
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
