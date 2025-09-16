// Blog Tracking Service - Sistema completo de tracking para blog
import { supabase } from './supabase';

// Tipos para o sistema de tracking
export interface BlogInteraction {
  id?: string;
  post_id?: string;
  post_slug: string;
  post_title: string;
  user_id?: string;
  user_email?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  interaction_type: 'like' | 'share' | 'view' | 'copy_link' | 'newsletter_signup' | 'cta_click';
  platform?: 'twitter' | 'linkedin' | 'whatsapp' | 'instagram' | 'copy' | 'email' | 'sms' | 'telegram';
  metadata?: Record<string, any>;
  country?: string;
  city?: string;
  created_at?: string;
}

export interface BlogStats {
  post_slug: string;
  post_title: string;
  total_views: number;
  total_likes: number;
  total_shares: number;
  total_copy_links: number;
  twitter_shares: number;
  linkedin_shares: number;
  whatsapp_shares: number;
  instagram_shares: number;
  engagement_rate: number;
  last_interaction_at?: string;
}

// Classe para gerenciar tracking do blog
export class BlogTrackingService {
  private static instance: BlogTrackingService;
  private sessionId: string;

  constructor() {
    // Gerar ou recuperar session ID para usuários anônimos
    this.sessionId = this.getOrCreateSessionId();
  }

  public static getInstance(): BlogTrackingService {
    if (!BlogTrackingService.instance) {
      BlogTrackingService.instance = new BlogTrackingService();
    }
    return BlogTrackingService.instance;
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = localStorage.getItem('blog_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('blog_session_id', sessionId);
    }
    return sessionId;
  }

  private async getUserInfo() {
    if (typeof window === 'undefined') return {};
    
    return {
      session_id: this.sessionId,
      user_agent: navigator.userAgent,
      // IP será capturado no backend se necessário
    };
  }

  // Registrar interação no banco de dados
  async trackInteraction(interaction: Omit<BlogInteraction, 'session_id' | 'user_agent'>): Promise<boolean> {
    try {
      const userInfo = await this.getUserInfo();
      
      const { error } = await supabase
        .from('blog_interactions')
        .insert({
          ...interaction,
          ...userInfo,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao registrar interação:', error.message || error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao trackear interação:', error instanceof Error ? error.message : error);
      return false;
    }
  }

  // Registrar visualização de post
  async trackView(postSlug: string, postTitle: string, postId?: string): Promise<boolean> {
    return this.trackInteraction({
      post_id: postId,
      post_slug: postSlug,
      post_title: postTitle,
      interaction_type: 'view'
    });
  }

  // Registrar like
  async trackLike(postSlug: string, postTitle: string, postId?: string): Promise<boolean> {
    return this.trackInteraction({
      post_id: postId,
      post_slug: postSlug,
      post_title: postTitle,
      interaction_type: 'like'
    });
  }

  // Registrar compartilhamento
  async trackShare(
    postSlug: string, 
    postTitle: string, 
    platform: BlogInteraction['platform'],
    postId?: string
  ): Promise<boolean> {
    return this.trackInteraction({
      post_id: postId,
      post_slug: postSlug,
      post_title: postTitle,
      interaction_type: 'share',
      platform
    });
  }

  // Registrar cópia de link
  async trackCopyLink(postSlug: string, postTitle: string, postId?: string): Promise<boolean> {
    return this.trackInteraction({
      post_id: postId,
      post_slug: postSlug,
      post_title: postTitle,
      interaction_type: 'copy_link',
      platform: 'copy'
    });
  }

  // Obter estatísticas de um post
  async getPostStats(postSlug: string): Promise<BlogStats | null> {
    try {
      const { data, error } = await supabase
        .from('blog_stats')
        .select('*')
        .eq('post_slug', postSlug)
        .single();

      if (error) {
        console.error('Erro ao buscar estatísticas:', error.message || error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error instanceof Error ? error.message : error);
      return null;
    }
  }

  // Verificar se usuário já curtiu o post
  async hasUserLiked(postSlug: string): Promise<boolean> {
    try {
      const userInfo = await this.getUserInfo();
      
      const { data, error } = await supabase
        .from('blog_interactions')
        .select('id')
        .eq('post_slug', postSlug)
        .eq('interaction_type', 'like')
        .eq('session_id', userInfo.session_id)
        .limit(1);

      if (error) {
        console.error('Erro ao verificar like:', error.message || error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar like do usuário:', error instanceof Error ? error.message : error);
      return false;
    }
  }

  // Obter top posts por engajamento
  async getTopPosts(limit: number = 10): Promise<BlogStats[]> {
    try {
      const { data, error } = await supabase
        .from('blog_stats')
        .select('*')
        .order('engagement_rate', { ascending: false })
        .order('total_views', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar top posts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao obter top posts:', error);
      return [];
    }
  }

  // Obter analytics de um período
  async getAnalytics(days: number = 7): Promise<{
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    topPosts: BlogStats[];
    platformBreakdown: Record<string, number>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Buscar interações do período
      const { data: interactions, error: interactionsError } = await supabase
        .from('blog_interactions')
        .select('interaction_type, platform')
        .gte('created_at', startDate.toISOString());

      if (interactionsError) {
        console.error('Erro ao buscar analytics:', interactionsError);
        return {
          totalViews: 0,
          totalLikes: 0,
          totalShares: 0,
          topPosts: [],
          platformBreakdown: {}
        };
      }

      // Processar dados
      const totalViews = interactions?.filter(i => i.interaction_type === 'view').length || 0;
      const totalLikes = interactions?.filter(i => i.interaction_type === 'like').length || 0;
      const totalShares = interactions?.filter(i => i.interaction_type === 'share').length || 0;

      // Breakdown por plataforma
      const platformBreakdown: Record<string, number> = {};
      interactions?.forEach(interaction => {
        if (interaction.interaction_type === 'share' && interaction.platform) {
          platformBreakdown[interaction.platform] = (platformBreakdown[interaction.platform] || 0) + 1;
        }
      });

      // Top posts
      const topPosts = await this.getTopPosts(5);

      return {
        totalViews,
        totalLikes,
        totalShares,
        topPosts,
        platformBreakdown
      };
    } catch (error) {
      console.error('Erro ao obter analytics:', error);
      return {
        totalViews: 0,
        totalLikes: 0,
        totalShares: 0,
        topPosts: [],
        platformBreakdown: {}
      };
    }
  }
}

// Instância singleton
export const blogTracking = BlogTrackingService.getInstance();

// Funções de conveniência para uso direto
export const trackBlogView = (postSlug: string, postTitle: string, postId?: string) => 
  blogTracking.trackView(postSlug, postTitle, postId);

export const trackBlogLike = (postSlug: string, postTitle: string, postId?: string) => 
  blogTracking.trackLike(postSlug, postTitle, postId);

export const trackBlogShare = (postSlug: string, postTitle: string, platform: BlogInteraction['platform'], postId?: string) => 
  blogTracking.trackShare(postSlug, postTitle, platform, postId);

export const trackBlogCopyLink = (postSlug: string, postTitle: string, postId?: string) => 
  blogTracking.trackCopyLink(postSlug, postTitle, postId);

export const getBlogPostStats = (postSlug: string) => 
  blogTracking.getPostStats(postSlug);

export const hasUserLikedPost = (postSlug: string) => 
  blogTracking.hasUserLiked(postSlug);
