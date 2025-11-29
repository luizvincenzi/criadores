'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';

// Interface para conteúdos do planejamento
interface ContentItem {
  id: string;
  title: string;
  content_type: 'post' | 'reels' | 'story';
  scheduled_date: string;
  status: string;
  is_executed: boolean;
  post_url?: string;
}

interface Creator {
  id: string;
  nome: string;
  instagram: string;
  seguidores: number;
  cidade: string;
  whatsapp: string;
  role: string;
  status: string;
  fee: number;
  video_instagram_link?: string;
  video_tiktok_link?: string;
  deliverables: {
    briefing_complete: string;
    visit_datetime: string | null;
    guest_quantity: number;
    visit_confirmed: string;
    post_datetime: string | null;
    video_approved: string;
    video_posted: string;
    content_links: string[];
    total_views?: number;
    post_views?: number;
    story_views?: number;
    reel_views?: number;
    engagement_rate?: string;
    reach?: number;
    impressions?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
  };
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  month: string;
  start_date: string;
  end_date: string;
  budget: number;
  spent_amount: number;
  status: string;
  objectives: {
    primary: string;
    secondary: string[];
    kpis: {
      reach: number;
      engagement: number;
      conversions: number;
    };
  };
  deliverables: {
    posts: number;
    stories: number;
    reels: number;
    events: number;
    creators_count: number;
  };
  results: {
    total_reach: number;
    total_engagement: number;
    total_conversions: number;
    roi: number;
  };
  criadores?: Creator[];
  totalCriadores?: number;
  created_at: string;
  updated_at: string;
}

export default function CampanhasEmpresaPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [businessId, setBusinessId] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function checkBusinessOwnerAccess() {
      if (!user) {
        router.push('/login');
        return;
      }

      const isBusinessOwner = user.role === 'business_owner' ||
        (user.roles && user.roles.includes('business_owner'));

      if (!isBusinessOwner) {
        router.push('/dashboard');
        return;
      }

      if (!user.business_id) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      setBusinessId(user.business_id);
      setHasAccess(true);

      // Buscar informações do business
      const businessResponse = await fetch(`/api/businesses/${user.business_id}`);
      const business = await businessResponse.json();
      setBusinessName(business.name);

      // Buscar campanhas do business
      const campaignsResponse = await fetch(`/api/supabase/campaigns?business_id=${user.business_id}`);
      const campaignsData = await campaignsResponse.json();

      console.log('📊 Campanhas recebidas:', campaignsData);

      if (campaignsData.success && campaignsData.data && Array.isArray(campaignsData.data)) {
        // Ordenar por data de criação (mais recente primeiro)
        const sortedCampaigns = campaignsData.data.sort((a: Campaign, b: Campaign) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setCampaigns(sortedCampaigns);

        // Expandir o trimestre atual por padrão
        if (sortedCampaigns.length > 0) {
          const today = new Date();
          const currentQuarter = Math.ceil((today.getMonth() + 1) / 3);
          const currentYear = today.getFullYear();
          const monthRanges: Record<number, string> = { 1: 'Jan-Mar', 2: 'Abr-Jun', 3: 'Jul-Set', 4: 'Out-Dez' };
          const currentQuarterLabel = `Q${currentQuarter} ${currentYear} (${monthRanges[currentQuarter]})`;
          setExpandedQuarters(new Set([currentQuarterLabel]));
        }
      } else {
        // Se não houver campanhas ou erro, definir array vazio
        console.log('⚠️ Nenhuma campanha encontrada ou erro na API');
        setCampaigns([]);
      }

      // Buscar conteúdos do planejamento (últimos 12 meses)
      try {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

        const contentsResponse = await fetch(
          `/api/business-content?business_id=${user.business_id}&start=${format(startDate, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}`
        );
        const contentsData = await contentsResponse.json();

        if (contentsData.success && contentsData.contents) {
          setContents(contentsData.contents);
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar conteúdos:', error);
      }

      setLoading(false);
    }

    checkBusinessOwnerAccess();
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando campanhas...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'Reunião de briefing': 'bg-yellow-100 text-yellow-800',
      'Briefing enviado': 'bg-blue-100 text-blue-800',
      'Aguardando aprovação': 'bg-purple-100 text-purple-800',
      'Em produção': 'bg-indigo-100 text-indigo-800',
      'Concluída': 'bg-green-100 text-green-800',
      'Cancelada': 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const formatInstagramHandle = (handle: string) => {
    if (!handle) return '';
    // Remove @ if it exists, then add it back only once
    const cleanHandle = handle.replace(/^@+/, '');
    return cleanHandle;
  };

  const getInstagramProfileUrl = (handle: string) => {
    if (!handle) return '';
    const cleanHandle = handle.replace(/^@+/, '');
    return `https://instagram.com/${cleanHandle}`;
  };

  const formatMonthYear = (monthStr: string) => {
    // Se já está no formato "Mês Ano" (ex: "Setembro 2025"), retorna direto
    if (monthStr && monthStr.match(/^[A-Za-zç]+ \d{4}$/)) {
      return monthStr;
    }

    // Se está no formato YYYYMM (ex: "202510")
    if (monthStr && monthStr.match(/^\d{6}$/)) {
      const year = monthStr.substring(0, 4);
      const month = parseInt(monthStr.substring(4, 6));
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return `${monthNames[month - 1]} ${year}`;
    }

    // Se está no formato YYYY-MM (ex: "2025-10")
    if (monthStr && monthStr.match(/^\d{4}-\d{2}$/)) {
      const [year, month] = monthStr.split('-');
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    }

    return monthStr;
  };

  const getQuarter = (monthStr: string) => {
    let month = 0;
    let year = new Date().getFullYear();

    // Primeiro tentar formato YYYYMM (ex: "202511")
    if (monthStr && monthStr.match(/^\d{6}$/)) {
      year = parseInt(monthStr.substring(0, 4));
      month = parseInt(monthStr.substring(4, 6));
    }
    // Depois tentar formato YYYY-MM (ex: "2025-11")
    else if (monthStr && monthStr.match(/^\d{4}-\d{2}$/)) {
      const [y, m] = monthStr.split('-');
      year = parseInt(y);
      month = parseInt(m);
    }
    // Por último tentar extrair mês por nome
    else if (monthStr) {
      const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                         'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      const lowerMonth = monthStr.toLowerCase();
      for (let i = 0; i < monthNames.length; i++) {
        if (lowerMonth.includes(monthNames[i])) {
          month = i + 1;
          break;
        }
      }

      // Extrair ano se não foi encontrado nos formatos anteriores
      const yearMatch = monthStr.match(/(\d{4})/);
      if (yearMatch) {
        year = parseInt(yearMatch[1]);
      }
    }

    // Validar mês (1-12)
    if (month < 1 || month > 12) {
      console.warn('⚠️ Mês inválido detectado:', month, 'para monthStr:', monthStr);
      month = 1; // fallback para janeiro
    }

    // Calcular trimestre: Q1(1-3), Q2(4-6), Q3(7-9), Q4(10-12)
    const quarter = Math.ceil(month / 3);

    // Label com meses do trimestre
    const monthRanges: Record<number, string> = {
      1: 'Jan-Mar',
      2: 'Abr-Jun',
      3: 'Jul-Set',
      4: 'Out-Dez'
    };

    // Debug: verificar valores calculados
    console.log('🔍 getQuarter Debug:', {
      monthStr,
      month,
      year,
      quarter,
      label: `Q${quarter} ${year} (${monthRanges[quarter]})`
    });

    return { quarter, year, label: `Q${quarter} ${year} (${monthRanges[quarter]})` };
  };

  const calculateTrimestrStats = (campaignsInTrimester: Campaign[], quarterContents: ContentItem[]) => {
    let totalPosts = 0;

    campaignsInTrimester.forEach(campaign => {
      if (campaign.criadores) {
        campaign.criadores.forEach(creator => {
          // Contar links de conteúdo
          if (creator.deliverables?.content_links) {
            totalPosts += creator.deliverables.content_links.length;
          }
        });
      }
    });

    // Estatísticas de conteúdos
    const totalContents = quarterContents.length;
    const executedContents = quarterContents.filter(c => c.is_executed).length;

    return {
      totalPosts,
      totalContents,
      executedContents
    };
  };

  // Função para agrupar conteúdos por trimestre
  const getContentsForQuarter = (quarterLabel: string): ContentItem[] => {
    return contents.filter(content => {
      const contentDate = new Date(content.scheduled_date);
      const month = contentDate.getMonth() + 1;
      const year = contentDate.getFullYear();
      const quarter = Math.ceil(month / 3);
      const monthRanges: Record<number, string> = { 1: 'Jan-Mar', 2: 'Abr-Jun', 3: 'Jul-Set', 4: 'Out-Dez' };
      const contentQuarterLabel = `Q${quarter} ${year} (${monthRanges[quarter]})`;
      return contentQuarterLabel === quarterLabel;
    });
  };

  // Toggle para expandir/colapsar trimestre
  const toggleQuarter = (quarterLabel: string) => {
    setExpandedQuarters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quarterLabel)) {
        newSet.delete(quarterLabel);
      } else {
        newSet.add(quarterLabel);
      }
      return newSet;
    });
  };

  const groupCampaignsByQuarter = (campaignsList: Campaign[]) => {
    const grouped: Record<string, Campaign[]> = {};

    campaignsList.forEach(campaign => {
      const { label } = getQuarter(campaign.month);
      if (!grouped[label]) {
        grouped[label] = [];
      }
      grouped[label].push(campaign);
    });

    return grouped;
  };

  const openCampaignModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const closeCampaignModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCampaign(null), 300);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Campanhas</h1>
        <p className="text-gray-600">{businessName}</p>
        <p className="text-sm text-gray-500 mt-1">
          {campaigns.length} {campaigns.length === 1 ? 'campanha' : 'campanhas'} realizadas
        </p>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto">
        {campaigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-gray-500">Suas campanhas aparecerão aqui quando forem criadas.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupCampaignsByQuarter(campaigns)).map(([quarterLabel, campaignsInQuarter]) => {
              const quarterContents = getContentsForQuarter(quarterLabel);
              const stats = calculateTrimestrStats(campaignsInQuarter, quarterContents);
              const isExpanded = expandedQuarters.has(quarterLabel);

              return (
                <div key={quarterLabel} className="space-y-4">
                  {/* Card de Análise Trimestral - CLICÁVEL */}
                  <div
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => toggleQuarter(quarterLabel)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-6 h-6 text-blue-600" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-blue-600" />
                        )}
                        <div>
                          <h2 className="text-2xl font-bold text-blue-900">Trimestre {quarterLabel}</h2>
                          <p className="text-sm text-blue-700">Clique para {isExpanded ? 'colapsar' : 'expandir'}</p>
                        </div>
                      </div>

                      {/* Métricas resumidas */}
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-900">{campaignsInQuarter.length}</p>
                          <p className="text-xs text-blue-600">Campanhas</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-indigo-900">{stats.totalContents}</p>
                          <p className="text-xs text-indigo-600">Conteúdos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-700">{stats.executedContents}</p>
                          <p className="text-xs text-green-600">Postados</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo Expandido */}
                  {isExpanded && (
                    <>
                      {/* Campanhas do Trimestre */}
                      <div className="relative ml-4">
                        {/* Linha vertical da timeline */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                        {/* Campanhas */}
                        <div className="space-y-6">
                          {campaignsInQuarter.map((campaign) => {
                const creatorsCount = campaign.totalCriadores || campaign.deliverables?.creators_count || 0;

                return (
                  <div key={campaign.id} className="relative pl-20">
                    {/* Círculo na timeline */}
                    <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow"></div>

                    {/* Card da campanha - DETALHADO */}
                    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{campaign.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{formatMonthYear(campaign.month)}</span>
                            {campaign.start_date && campaign.end_date && (
                              <span>• {format(new Date(campaign.start_date), 'dd/MM')} - {format(new Date(campaign.end_date), 'dd/MM/yyyy')}</span>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>

                      {/* Descrição */}
                      {campaign.description && (
                        <p className="text-gray-600 mb-4 text-sm">{campaign.description}</p>
                      )}

                      {/* Objetivo Principal */}
                      {campaign.objectives?.primary && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-semibold text-blue-700 mb-1">🎯 Objetivo Principal</p>
                          <p className="text-sm text-blue-900">{campaign.objectives.primary}</p>
                        </div>
                      )}

                      {/* Métricas Principais */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                          <p className="text-xs text-purple-600 mb-1">Criadores</p>
                          <p className="text-2xl font-bold text-purple-700">{creatorsCount}</p>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                          <p className="text-xs text-blue-600 mb-1">Entregas</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {(campaign.deliverables?.posts || 0) + (campaign.deliverables?.reels || 0) + (campaign.deliverables?.stories || 0)}
                          </p>
                        </div>
                      </div>

                      {/* Entregas Planejadas */}
                      {campaign.deliverables && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Entregas Planejadas</p>
                          <div className="flex gap-3 flex-wrap">
                            {campaign.deliverables.posts > 0 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                {campaign.deliverables.posts} Posts
                              </span>
                            )}
                            {campaign.deliverables.reels > 0 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                {campaign.deliverables.reels} Reels
                              </span>
                            )}
                            {campaign.deliverables.stories > 0 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                {campaign.deliverables.stories} Stories
                              </span>
                            )}
                            {campaign.deliverables.events > 0 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                {campaign.deliverables.events} Eventos
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Preview de Criadores */}
                      {campaign.criadores && campaign.criadores.length > 0 && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-semibold text-gray-700 mb-2">👥 Criadores Participantes</p>
                          <div className="flex flex-wrap gap-2">
                            {campaign.criadores.slice(0, 6).map((creator, idx) => (
                              <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-gray-200">
                                <span className="text-sm font-medium text-gray-900">{creator.nome}</span>
                                {creator.instagram && (
                                  <span className="text-xs text-gray-500">@{formatInstagramHandle(creator.instagram)}</span>
                                )}
                              </div>
                            ))}
                            {campaign.criadores.length > 6 && (
                              <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                                +{campaign.criadores.length - 6} criadores
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Links de Vídeos - Instagram e TikTok */}
                      {campaign.criadores && campaign.criadores.some(c => c.video_instagram_link || c.video_tiktok_link) && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-3">🎬 Vídeos Publicados (Instagram & TikTok)</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {campaign.criadores.map((creator, idx) => {
                              if (!creator.video_instagram_link && !creator.video_tiktok_link) return null;

                              return (
                                <div key={idx} className="space-y-2">
                                  <p className="text-xs font-medium text-gray-600 mb-1">{creator.nome}</p>
                                  <div className="space-y-1">
                                    {creator.video_instagram_link && (
                                      <a
                                        href={creator.video_instagram_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 bg-gradient-to-r from-pink-50 to-red-50 hover:from-pink-100 hover:to-red-100 rounded-lg transition-all group"
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-red-600 flex-shrink-0">
                                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                                          <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                        </svg>
                                        <span className="text-xs text-gray-700 group-hover:text-red-700 truncate flex-1">🎥 Instagram</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-red-600 flex-shrink-0">
                                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                          <polyline points="15 3 21 3 21 9" />
                                          <line x1="10" y1="14" x2="21" y2="3" />
                                        </svg>
                                      </a>
                                    )}
                                    {creator.video_tiktok_link && (
                                      <a
                                        href={creator.video_tiktok_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black rounded-lg transition-all group"
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white flex-shrink-0">
                                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 5.1-1.82V9.75a6.45 6.45 0 0 0-6.45 6.45c0 3.56 2.97 6.45 6.45 6.45s6.45-2.89 6.45-6.45-2.89-6.45-6.45-6.45"/>
                                        </svg>
                                        <span className="text-xs text-white truncate flex-1">🎵 TikTok</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 group-hover:text-white flex-shrink-0">
                                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                          <polyline points="15 3 21 3 21 9" />
                                          <line x1="10" y1="14" x2="21" y2="3" />
                                        </svg>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Links do Instagram */}
                      {campaign.criadores && campaign.criadores.some(c => c.deliverables?.content_links && c.deliverables.content_links.length > 0) && (
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-700 mb-3">🔗 Posts Publicados no Instagram</p>
                          <div className="space-y-2">
                            {campaign.criadores.map((creator, idx) => {
                              if (!creator.deliverables?.content_links || creator.deliverables.content_links.length === 0) return null;

                              return (
                                <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-gray-900 text-sm">{creator.nome}</span>
                                    {creator.instagram && (
                                      <a
                                        href={getInstagramProfileUrl(creator.instagram)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-pink-600 hover:underline"
                                      >
                                        @{formatInstagramHandle(creator.instagram)}
                                      </a>
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    {creator.deliverables.content_links.map((link, linkIdx) => (
                                      <a
                                        key={linkIdx}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 rounded-lg transition-all group"
                                      >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-pink-600 flex-shrink-0">
                                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                                          <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                        </svg>
                                        <span className="text-sm text-gray-700 group-hover:text-pink-700 truncate flex-1">{link}</span>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-pink-600 flex-shrink-0">
                                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                          <polyline points="15 3 21 3 21 9" />
                                          <line x1="10" y1="14" x2="21" y2="3" />
                                        </svg>
                                      </a>
                                    ))}
                                  </div>

                                  {/* Links de Vídeo - Instagram e TikTok */}
                                  {(creator.video_instagram_link || creator.video_tiktok_link) && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                      {creator.video_instagram_link && (
                                        <a
                                          href={creator.video_instagram_link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 p-2 bg-gradient-to-r from-pink-50 to-red-50 hover:from-pink-100 hover:to-red-100 rounded-lg transition-all group"
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-600 flex-shrink-0">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                                            <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                          </svg>
                                          <span className="text-sm text-gray-700 group-hover:text-red-700 truncate flex-1">🎥 Vídeo Instagram</span>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-red-600 flex-shrink-0">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                            <polyline points="15 3 21 3 21 9" />
                                            <line x1="10" y1="14" x2="21" y2="3" />
                                          </svg>
                                        </a>
                                      )}
                                      {creator.video_tiktok_link && (
                                        <a
                                          href={creator.video_tiktok_link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 p-2 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black rounded-lg transition-all group"
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white flex-shrink-0">
                                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 5.1-1.82V9.75a6.45 6.45 0 0 0-6.45 6.45c0 3.56 2.97 6.45 6.45 6.45s6.45-2.89 6.45-6.45-2.89-6.45-6.45-6.45"/>
                                          </svg>
                                          <span className="text-sm text-white group-hover:text-gray-200 truncate flex-1">🎵 Vídeo TikTok</span>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 group-hover:text-white flex-shrink-0">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                            <polyline points="15 3 21 3 21 9" />
                                            <line x1="10" y1="14" x2="21" y2="3" />
                                          </svg>
                                        </a>
                                      )}
                                    </div>
                                  )}


                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Botão Ver Detalhes Completos */}
                      <button
                        className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
                        onClick={() => openCampaignModal(campaign)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Ver Detalhes Completos e Links dos Posts
                      </button>
                    </div>
                  </div>
                );
              })}
                        </div>
                      </div>

                      {/* Seção de Conteúdo Planejado */}
                      {quarterContents.length > 0 && (
                        <div className="ml-4 mt-4 bg-white rounded-lg shadow-sm p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            📱 Conteúdo Planejado
                            <span className="text-sm font-normal text-gray-500">
                              ({quarterContents.filter(c => c.is_executed).length}/{quarterContents.length} postados)
                            </span>
                          </h3>
                          <div className="space-y-3">
                            {quarterContents.map((content) => (
                              <div
                                key={content.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  content.is_executed
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">
                                    {content.content_type === 'reels' ? '🎬' :
                                     content.content_type === 'story' ? '📱' : '📷'}
                                  </span>
                                  <div>
                                    <p className="font-medium text-gray-900">{content.title}</p>
                                    <p className="text-xs text-gray-500">
                                      {format(new Date(content.scheduled_date), "dd 'de' MMMM", { locale: ptBR })} •
                                      <span className="capitalize ml-1">{content.content_type}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {content.is_executed ? (
                                    <span className="text-green-600 text-sm font-medium">✅ Postado</span>
                                  ) : (
                                    <span className="text-gray-500 text-sm">⏳ Pendente</span>
                                  )}
                                  {content.post_url && (
                                    <a
                                      href={content.post_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-medium hover:bg-pink-200 transition-colors"
                                    >
                                      Ver post <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Campanha */}
      {isModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center p-4" onClick={closeCampaignModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header do Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCampaign.title}</h2>
                <p className="text-sm text-gray-500 mt-1">📅 {formatMonthYear(selectedCampaign.month)}</p>
              </div>
              <button
                onClick={closeCampaignModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6">
              {/* Status e Datas */}
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedCampaign.status)}`}>
                  {selectedCampaign.status}
                </span>
                {selectedCampaign.start_date && selectedCampaign.end_date && (
                  <span className="text-sm text-gray-600">
                    📅 {format(new Date(selectedCampaign.start_date), "dd 'de' MMMM", { locale: ptBR })} - {format(new Date(selectedCampaign.end_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>

              {/* Descrição */}
              {selectedCampaign.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">📝 Descrição</h3>
                  <p className="text-gray-600">{selectedCampaign.description}</p>
                </div>
              )}

              {/* Objetivos */}
              {selectedCampaign.objectives && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">🎯 Objetivos</h3>
                  <div className="space-y-2">
                    {selectedCampaign.objectives.primary && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Principal</p>
                        <p className="text-sm text-blue-900">{selectedCampaign.objectives.primary}</p>
                      </div>
                    )}
                    {selectedCampaign.objectives.secondary && selectedCampaign.objectives.secondary.length > 0 && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Secundários</p>
                        <ul className="list-disc list-inside space-y-1">
                          {selectedCampaign.objectives.secondary.map((obj, idx) => (
                            <li key={idx} className="text-sm text-gray-600">{obj}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Métricas Gerais */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Resumo da Campanha</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center">
                    <p className="text-xs text-purple-600 mb-1">Criadores</p>
                    <p className="text-2xl font-bold text-purple-700">{selectedCampaign.totalCriadores || selectedCampaign.deliverables?.creators_count || 0}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
                    <p className="text-xs text-blue-600 mb-1">Entregas</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {(selectedCampaign.deliverables?.posts || 0) + (selectedCampaign.deliverables?.reels || 0) + (selectedCampaign.deliverables?.stories || 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
                    <p className="text-xs text-green-600 mb-1">Eventos</p>
                    <p className="text-2xl font-bold text-green-700">{selectedCampaign.deliverables?.events || 0}</p>
                  </div>
                </div>
              </div>

              {/* Criadores e Posts */}
              {selectedCampaign.criadores && selectedCampaign.criadores.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">👥 Criadores e Conteúdo Publicado</h3>
                  <div className="space-y-4">
                    {selectedCampaign.criadores.map((creator, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        {/* Header do Criador */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{creator.nome}</h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                              {creator.instagram && (
                                <a
                                  href={getInstagramProfileUrl(creator.instagram)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 hover:text-pink-600 transition-colors"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
                                  @{formatInstagramHandle(creator.instagram)}
                                </a>
                              )}
                              {creator.seguidores > 0 && (
                                <span>• {formatNumber(creator.seguidores)} seguidores</span>
                              )}
                              {creator.cidade && (
                                <span>• 📍 {creator.cidade}</span>
                              )}
                            </div>
                          </div>
                          {creator.status && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                              {creator.status}
                            </span>
                          )}
                        </div>

                        {/* Links de Conteúdo */}
                        {creator.deliverables?.content_links && creator.deliverables.content_links.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-700 mb-2">🔗 Conteúdo Publicado</p>
                            <div className="space-y-2">
                              {creator.deliverables.content_links.map((link, linkIdx) => (
                                <a
                                  key={linkIdx}
                                  href={link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-blue-600">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                  </svg>
                                  <span className="text-sm text-blue-600 group-hover:underline truncate">{link}</span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                  </svg>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Links de Vídeo - Instagram e TikTok */}
                        {(creator.video_instagram_link || creator.video_tiktok_link) && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold text-gray-700 mb-2">🎬 Vídeos Publicados</p>
                            <div className="space-y-2">
                              {creator.video_instagram_link && (
                                <a
                                  href={creator.video_instagram_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-gradient-to-r from-pink-50 to-red-50 hover:from-pink-100 hover:to-red-100 rounded-lg transition-colors group"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-600 flex-shrink-0">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
                                  <span className="text-sm text-gray-700 group-hover:text-red-700 truncate">🎥 Vídeo Instagram</span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-red-600 flex-shrink-0">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                  </svg>
                                </a>
                              )}
                              {creator.video_tiktok_link && (
                                <a
                                  href={creator.video_tiktok_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-gradient-to-r from-black to-gray-800 hover:from-gray-800 hover:to-black rounded-lg transition-colors group"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-white flex-shrink-0">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.89 2.89 0 0 1 5.1-1.82V9.75a6.45 6.45 0 0 0-6.45 6.45c0 3.56 2.97 6.45 6.45 6.45s6.45-2.89 6.45-6.45-2.89-6.45-6.45-6.45"/>
                                  </svg>
                                  <span className="text-sm text-white truncate">🎵 Vídeo TikTok</span>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 group-hover:text-white flex-shrink-0">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Status de Entrega */}
                        {creator.deliverables && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-700 mb-2">📋 Status de Entrega</p>
                            <div className="flex gap-2 flex-wrap">
                              {creator.deliverables.briefing_complete && (
                                <span className={`px-2 py-1 rounded text-xs ${creator.deliverables.briefing_complete === 'Concluído' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  Briefing: {creator.deliverables.briefing_complete}
                                </span>
                              )}
                              {creator.deliverables.video_approved && (
                                <span className={`px-2 py-1 rounded text-xs ${creator.deliverables.video_approved === 'Aprovado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  Vídeo: {creator.deliverables.video_approved}
                                </span>
                              )}
                              {creator.deliverables.video_posted && (
                                <span className={`px-2 py-1 rounded text-xs ${creator.deliverables.video_posted === 'Sim' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                  Postado: {creator.deliverables.video_posted}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={closeCampaignModal}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

