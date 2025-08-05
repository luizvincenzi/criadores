// Instagram API Integration
// Configuração para conectar contas Instagram Business

interface InstagramConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
  scopes: string[];
}

interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  user_id: string;
}

interface InstagramUserProfile {
  id: string;
  username: string;
  account_type: 'BUSINESS' | 'PERSONAL';
  media_count: number;
  followers_count?: number;
  following_count?: number;
}

interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  timestamp: string;
  caption?: string;
  like_count?: number;
  comments_count?: number;
  insights?: InstagramInsights;
}

interface InstagramInsights {
  impressions: number;
  reach: number;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profile_visits?: number;
  website_clicks?: number;
}

class InstagramAPI {
  private config: InstagramConfig;
  private baseUrl = 'https://graph.instagram.com';
  private authUrl = 'https://api.instagram.com/oauth/authorize';

  constructor() {
    this.config = {
      appId: process.env.INSTAGRAM_APP_ID || '582288514801639', // App principal do Facebook
      appSecret: process.env.INSTAGRAM_APP_SECRET || 'e73a71b54123c6a7ae9b5d11a9361b51',
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/callback`,
      scopes: [
        'instagram_graph_user_profile',
        'instagram_graph_user_media',
        'instagram_basic',
        'pages_show_list'
      ]
    };
  }

  // Gerar URL de autorização para Instagram Business
  getAuthorizationUrl(businessId: string): string {
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(','),
      response_type: 'code',
      state: businessId, // Para identificar qual business está conectando
      display: 'popup' // Melhor experiência para web
    });

    console.log('🔗 Instagram: Gerando URL de autorização', {
      appId: this.config.appId,
      redirectUri: this.config.redirectUri,
      scopes: this.config.scopes,
      businessId
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  // Trocar código por token de acesso
  async exchangeCodeForToken(code: string): Promise<InstagramTokenResponse> {
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.appId,
        client_secret: this.config.appSecret,
        grant_type: 'authorization_code',
        redirect_uri: this.config.redirectUri,
        code: code
      })
    });

    if (!response.ok) {
      throw new Error(`Instagram auth error: ${response.statusText}`);
    }

    return response.json();
  }

  // Obter token de longa duração
  async getLongLivedToken(shortToken: string): Promise<InstagramTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'ig_exchange_token',
      client_secret: this.config.appSecret,
      access_token: shortToken
    });

    const response = await fetch(`${this.baseUrl}/access_token?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Instagram long-lived token error: ${response.statusText}`);
    }

    return response.json();
  }

  // Renovar token de longa duração
  async refreshLongLivedToken(token: string): Promise<InstagramTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'ig_refresh_token',
      access_token: token
    });

    const response = await fetch(`${this.baseUrl}/refresh_access_token?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Instagram token refresh error: ${response.statusText}`);
    }

    return response.json();
  }

  // Obter perfil do usuário
  async getUserProfile(accessToken: string): Promise<InstagramUserProfile> {
    const fields = 'id,username,account_type,media_count';
    const response = await fetch(`${this.baseUrl}/me?fields=${fields}&access_token=${accessToken}`);
    
    if (!response.ok) {
      throw new Error(`Instagram profile error: ${response.statusText}`);
    }

    return response.json();
  }

  // Obter mídia do usuário
  async getUserMedia(accessToken: string, limit: number = 25): Promise<InstagramMedia[]> {
    const fields = 'id,media_type,media_url,permalink,timestamp,caption';
    const response = await fetch(
      `${this.baseUrl}/me/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      throw new Error(`Instagram media error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  // Obter insights de uma mídia (apenas para contas Business)
  async getMediaInsights(mediaId: string, accessToken: string): Promise<InstagramInsights> {
    const metrics = [
      'impressions',
      'reach', 
      'engagement',
      'likes',
      'comments',
      'shares',
      'saves'
    ].join(',');

    const response = await fetch(
      `${this.baseUrl}/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      // Se não conseguir insights, retornar dados básicos
      return {
        impressions: 0,
        reach: 0,
        engagement: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0
      };
    }

    const data = await response.json();
    const insights: any = {};
    
    data.data?.forEach((metric: any) => {
      insights[metric.name] = metric.values[0]?.value || 0;
    });

    return insights;
  }

  // Buscar posts que mencionam a empresa
  async searchMentions(accessToken: string, businessUsername: string): Promise<InstagramMedia[]> {
    try {
      // Esta funcionalidade requer aprovação especial do Instagram
      // Por enquanto, vamos simular buscando nas próprias mídias
      const media = await this.getUserMedia(accessToken, 50);
      
      return media.filter(post => 
        post.caption?.toLowerCase().includes(`@${businessUsername.toLowerCase()}`) ||
        post.caption?.toLowerCase().includes(businessUsername.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching mentions:', error);
      return [];
    }
  }

  // Validar se o token ainda é válido
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserProfile(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Obter dados de um post específico pelo ID
  async getMediaById(mediaId: string, accessToken: string): Promise<InstagramMedia | null> {
    try {
      const fields = 'id,media_type,media_url,permalink,timestamp,caption,like_count,comments_count';
      const url = `${this.baseUrl}/${mediaId}?fields=${fields}&access_token=${accessToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Erro na API do Instagram:', data.error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Erro ao obter dados do post:', error);
      return null;
    }
  }

  // Obter insights de um post específico
  async getMediaInsights(mediaId: string, accessToken: string): Promise<InstagramInsights | null> {
    try {
      // Insights disponíveis para posts
      const metrics = 'impressions,reach,engagement,likes,comments,saves,shares';
      const url = `${this.baseUrl}/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        console.error('❌ Erro ao obter insights:', data.error);
        return null;
      }

      // Converter array de insights em objeto
      const insights: any = {};
      if (data.data) {
        data.data.forEach((insight: any) => {
          insights[insight.name] = insight.values[0]?.value || 0;
        });
      }

      return {
        impressions: insights.impressions || 0,
        reach: insights.reach || 0,
        engagement: insights.engagement || 0,
        likes: insights.likes || 0,
        comments: insights.comments || 0,
        shares: insights.shares || 0,
        saves: insights.saves || 0
      };
    } catch (error) {
      console.error('❌ Erro ao obter insights do post:', error);
      return null;
    }
  }
}

// Funções utilitárias
export const instagramAPI = new InstagramAPI();

export const formatInstagramDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleDateString('pt-BR');
};

export const calculateEngagementRate = (likes: number, comments: number, followers: number): number => {
  if (followers === 0) return 0;
  return ((likes + comments) / followers) * 100;
};

export const getPostPerformanceLevel = (insights: InstagramInsights): 'low' | 'medium' | 'high' => {
  const engagementRate = (insights.likes + insights.comments) / Math.max(insights.reach, 1) * 100;
  
  if (engagementRate < 2) return 'low';
  if (engagementRate < 5) return 'medium';
  return 'high';
};

export type {
  InstagramConfig,
  InstagramTokenResponse,
  InstagramUserProfile,
  InstagramMedia,
  InstagramInsights
};
