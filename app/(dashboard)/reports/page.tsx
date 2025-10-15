'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { fetchCampaigns } from '@/lib/dataSource';

interface PostReport {
  id: string;
  campaignName: string;
  creatorName: string;
  postUrl: string;
  postDate: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  metrics: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    reach: number;
    engagement: number;
  };
  businessName: string;
  month: string;
}

export default function ReportsPage() {
  const { user, session } = useAuthStore();
  const router = useRouter();
  const [posts, setPosts] = useState<PostReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'instagram' | 'tiktok' | 'youtube'>('all');
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');

  // 🚫 BLOQUEAR ACESSO DE CREATORS E MARKETING STRATEGISTS
  useEffect(() => {
    if (!user) return;

    const isCreator = user.role === 'creator' || (user.roles && user.roles.includes('creator'));
    const isMarketingStrategist = user.role === 'marketing_strategist' || (user.roles && user.roles.includes('marketing_strategist'));
    const isOnlyCreator = user.role === 'creator' && (!user.roles || user.roles.length === 1 || (user.roles.length === 1 && user.roles[0] === 'creator'));
    const isOnlyStrategist = user.role === 'marketing_strategist' && (!user.roles || user.roles.length === 1 || (user.roles.length === 1 && user.roles[0] === 'marketing_strategist'));

    if (isOnlyCreator) {
      console.log('🚫 Creator tentando acessar /reports - redirecionando para /campanhas-criador');
      router.push('/campanhas-criador');
      return;
    }

    if (isOnlyStrategist) {
      console.log('🚫 Marketing Strategist tentando acessar /reports - redirecionando para /conteudo-estrategista');
      router.push('/conteudo-estrategista');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    loadPostReports();
  }, [user, session]);

  const loadPostReports = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Carregando relatórios de postagens...');

      // Obter business_id do usuário logado
      const businessId = session?.business_id || user?.business_id;
      
      // Buscar campanhas do business
      const campaignsData = await fetchCampaigns();
      
      // Filtrar campanhas pelo business_id do usuário (se não for admin)
      let filteredCampaigns = campaignsData;
      if (user?.role !== 'admin' && businessId) {
        filteredCampaigns = campaignsData.filter(campaign => 
          campaign.businessId === businessId || 
          campaign.business_id === businessId
        );
      }

      // Simular dados de postagens baseados nas campanhas
      const simulatedPosts = generateSimulatedPosts(filteredCampaigns);
      setPosts(simulatedPosts);
      
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSimulatedPosts = (campaigns: any[]): PostReport[] => {
    const posts: PostReport[] = [];
    
    campaigns.forEach(campaign => {
      const creatorCount = campaign.criadores?.length || 3;
      
      // Gerar postagens para cada criador da campanha
      for (let i = 0; i < creatorCount; i++) {
        // Verificar se criadores é um array de objetos ou strings
        let creatorName = `Criador ${i + 1}`;
        if (campaign.criadores && campaign.criadores[i]) {
          const creator = campaign.criadores[i];
          // Se for um objeto, pegar o nome
          if (typeof creator === 'object' && creator !== null) {
            creatorName = creator.nome || creator.name || `Criador ${i + 1}`;
          } else if (typeof creator === 'string') {
            creatorName = creator;
          }
        }

        const platforms: ('instagram' | 'tiktok' | 'youtube')[] = ['instagram', 'tiktok', 'youtube'];
        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        
        posts.push({
          id: `${campaign.id}-${i}-${platform}`,
          campaignName: campaign.name || campaign.businessName || 'Campanha',
          creatorName,
          postUrl: `https://${platform}.com/p/example${i}`,
          postDate: campaign.campaign_date || new Date().toISOString(),
          platform,
          metrics: {
            likes: Math.floor(Math.random() * 1000) + 100,
            comments: Math.floor(Math.random() * 100) + 10,
            shares: Math.floor(Math.random() * 50) + 5,
            views: Math.floor(Math.random() * 5000) + 500,
            reach: Math.floor(Math.random() * 3000) + 300,
            engagement: Math.floor(Math.random() * 200) + 50
          },
          businessName: campaign.businessName || 'Empresa',
          month: campaign.mes || new Date(campaign.campaign_date || Date.now()).toISOString().slice(0, 7)
        });
      }
    });

    return posts.sort((a, b) => new Date(b.postDate).getTime() - new Date(a.postDate).getTime());
  };

  const filteredPosts = posts.filter(post => {
    if (selectedPlatform !== 'all' && post.platform !== selectedPlatform) {
      return false;
    }
    return true;
  });

  const totalMetrics = filteredPosts.reduce((acc, post) => ({
    likes: acc.likes + post.metrics.likes,
    comments: acc.comments + post.metrics.comments,
    shares: acc.shares + post.metrics.shares,
    views: acc.views + post.metrics.views,
    reach: acc.reach + post.metrics.reach,
    engagement: acc.engagement + post.metrics.engagement
  }), {
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    reach: 0,
    engagement: 0
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return (
          <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios de Postagens</h1>
          <p className="text-gray-600">Acompanhe o desempenho de todas as postagens dos criadores</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plataforma</label>
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas as Plataformas</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="last7days">Últimos 7 dias</option>
                <option value="last30days">Últimos 30 dias</option>
                <option value="last90days">Últimos 90 dias</option>
                <option value="all">Todo o período</option>
              </select>
            </div>
          </div>
        </div>

        {/* Métricas Resumidas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-blue-600">{formatNumber(totalMetrics.views)}</div>
            <div className="text-sm text-gray-600">Visualizações</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-pink-600">{formatNumber(totalMetrics.likes)}</div>
            <div className="text-sm text-gray-600">Curtidas</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-green-600">{formatNumber(totalMetrics.comments)}</div>
            <div className="text-sm text-gray-600">Comentários</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-purple-600">{formatNumber(totalMetrics.shares)}</div>
            <div className="text-sm text-gray-600">Compartilhamentos</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-orange-600">{formatNumber(totalMetrics.reach)}</div>
            <div className="text-sm text-gray-600">Alcance</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl font-bold text-indigo-600">{formatNumber(totalMetrics.engagement)}</div>
            <div className="text-sm text-gray-600">Engajamento</div>
          </div>
        </div>

        {/* Lista de Postagens */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Postagens ({filteredPosts.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Postagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plataforma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visualizações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Curtidas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comentários
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engajamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{post.campaignName}</div>
                        <div className="text-sm text-gray-500">{post.creatorName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getPlatformIcon(post.platform)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{post.platform}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(post.metrics.views)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(post.metrics.likes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(post.metrics.comments)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatNumber(post.metrics.engagement)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(post.postDate).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
