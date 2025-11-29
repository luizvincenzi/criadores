'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronDown, ChevronRight, ExternalLink, FileText, Image, Film } from 'lucide-react';

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

// Interface para conteúdos do planejamento
interface ContentItem {
  id: string;
  title: string;
  content_type: 'post' | 'reels' | 'story';
  scheduled_date: string;
  status: string;
  is_executed: boolean;
  post_url?: string;
  description?: string;
}

// Interface para dados agrupados por mês
interface MonthData {
  month: number;
  year: number;
  label: string;
  campaigns: Campaign[];
  contents: ContentItem[];
  stats: {
    totalReels: number;
    totalStories: number;
    totalPosts: number;
    postedReels: number;
    postedStories: number;
    postedPosts: number;
  };
}

// Interface para dados agrupados por trimestre
interface QuarterData {
  quarter: number;
  year: number;
  label: string;
  months: MonthData[];
  stats: {
    totalCampaigns: number;
    totalContents: number;
    totalViews: number;
    avgEngagement: string;
  };
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

  // Estados para controlar acordeões
  const [expandedQuarters, setExpandedQuarters] = useState<Set<string>>(new Set());
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [expandedContentTypes, setExpandedContentTypes] = useState<Set<string>>(new Set());

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

      try {
        // Buscar informações do business
        const businessResponse = await fetch(`/api/businesses/${user.business_id}`);
        const business = await businessResponse.json();
        setBusinessName(business.name);

        // Buscar campanhas do business
        const campaignsResponse = await fetch(`/api/supabase/campaigns?business_id=${user.business_id}`);
        const campaignsData = await campaignsResponse.json();

        console.log('📊 Campanhas recebidas:', campaignsData);

        if (campaignsData.success && campaignsData.data && Array.isArray(campaignsData.data)) {
          const sortedCampaigns = campaignsData.data.sort((a: Campaign, b: Campaign) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setCampaigns(sortedCampaigns);
        } else {
          console.log('⚠️ Nenhuma campanha encontrada ou erro na API');
          setCampaigns([]);
        }

        // 🆕 Buscar conteúdos do planejamento (últimos 12 meses)
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

        const contentsResponse = await fetch(
          `/api/business-content?business_id=${user.business_id}&start=${format(startDate, 'yyyy-MM-dd')}&end=${format(endDate, 'yyyy-MM-dd')}`
        );
        const contentsData = await contentsResponse.json();

        console.log('📱 Conteúdos recebidos:', contentsData);

        if (contentsData.success && contentsData.contents) {
          setContents(contentsData.contents);
        }

        // Expandir o trimestre atual por padrão
        const currentQuarter = Math.ceil((today.getMonth() + 1) / 3);
        const currentQuarterKey = `Q${currentQuarter}-${today.getFullYear()}`;
        setExpandedQuarters(new Set([currentQuarterKey]));

        // Expandir o mês atual por padrão
        const currentMonthKey = `${today.getMonth() + 1}-${today.getFullYear()}`;
        setExpandedMonths(new Set([currentMonthKey]));

      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
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

  const calculateTrimestrStats = (campaignsInTrimester: Campaign[]) => {
    let totalPosts = 0;
    let totalViews = 0;
    let totalEngagement = 0;

    campaignsInTrimester.forEach(campaign => {
      if (campaign.criadores) {
        campaign.criadores.forEach(creator => {
          // Contar links de conteúdo
          if (creator.deliverables?.content_links) {
            totalPosts += creator.deliverables.content_links.length;
          }
          // Somar visualizações
          if (creator.deliverables?.total_views) {
            totalViews += creator.deliverables.total_views;
          }
          // Calcular engajamento médio
          if (creator.deliverables?.engagement_rate) {
            const rate = parseFloat(creator.deliverables.engagement_rate);
            if (!isNaN(rate)) {
              totalEngagement += rate;
            }
          }
        });
      }
    });

    return {
      totalPosts,
      totalViews,
      avgEngagement: campaignsInTrimester.length > 0
        ? (totalEngagement / campaignsInTrimester.length).toFixed(2)
        : '0'
    };
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

  // 🆕 Toggle functions para acordeões
  const toggleQuarter = (quarterKey: string) => {
    setExpandedQuarters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(quarterKey)) {
        newSet.delete(quarterKey);
      } else {
        newSet.add(quarterKey);
      }
      return newSet;
    });
  };

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(monthKey)) {
        newSet.delete(monthKey);
      } else {
        newSet.add(monthKey);
      }
      return newSet;
    });
  };

  const toggleCampaign = (campaignId: string) => {
    setExpandedCampaigns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(campaignId)) {
        newSet.delete(campaignId);
      } else {
        newSet.add(campaignId);
      }
      return newSet;
    });
  };

  const toggleContentType = (contentTypeKey: string) => {
    setExpandedContentTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentTypeKey)) {
        newSet.delete(contentTypeKey);
      } else {
        newSet.add(contentTypeKey);
      }
      return newSet;
    });
  };

  // 🆕 Agrupar campanhas e conteúdos por trimestre e mês
  const getGroupedData = () => {
    const quarterMap = new Map<string, {
      quarter: number;
      year: number;
      label: string;
      months: Map<string, MonthData>;
    }>();

    // Agrupar campanhas
    campaigns.forEach(campaign => {
      const { quarter, year, label } = getQuarter(campaign.month);
      const quarterKey = `Q${quarter}-${year}`;

      if (!quarterMap.has(quarterKey)) {
        quarterMap.set(quarterKey, {
          quarter,
          year,
          label,
          months: new Map()
        });
      }

      // Extrair mês da campanha
      let campaignMonth = 1;
      let campaignYear = year;

      if (campaign.month && campaign.month.match(/^\d{6}$/)) {
        campaignYear = parseInt(campaign.month.substring(0, 4));
        campaignMonth = parseInt(campaign.month.substring(4, 6));
      } else if (campaign.month && campaign.month.match(/^\d{4}-\d{2}$/)) {
        const [y, m] = campaign.month.split('-');
        campaignYear = parseInt(y);
        campaignMonth = parseInt(m);
      } else if (campaign.month) {
        const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                           'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
        const lowerMonth = campaign.month.toLowerCase();
        for (let i = 0; i < monthNames.length; i++) {
          if (lowerMonth.includes(monthNames[i])) {
            campaignMonth = i + 1;
            break;
          }
        }
        const yearMatch = campaign.month.match(/(\d{4})/);
        if (yearMatch) {
          campaignYear = parseInt(yearMatch[1]);
        }
      }

      const monthKey = `${campaignMonth}-${campaignYear}`;
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      const quarterData = quarterMap.get(quarterKey)!;
      if (!quarterData.months.has(monthKey)) {
        quarterData.months.set(monthKey, {
          month: campaignMonth,
          year: campaignYear,
          label: `${monthNames[campaignMonth - 1]} ${campaignYear}`,
          campaigns: [],
          contents: [],
          stats: {
            totalReels: 0,
            totalStories: 0,
            totalPosts: 0,
            postedReels: 0,
            postedStories: 0,
            postedPosts: 0
          }
        });
      }

      quarterData.months.get(monthKey)!.campaigns.push(campaign);
    });

    // Agrupar conteúdos
    contents.forEach(content => {
      if (!content.scheduled_date) return;

      const date = new Date(content.scheduled_date);
      const contentMonth = date.getMonth() + 1;
      const contentYear = date.getFullYear();
      const quarter = Math.ceil(contentMonth / 3);
      const quarterKey = `Q${quarter}-${contentYear}`;
      const monthKey = `${contentMonth}-${contentYear}`;

      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const monthRanges: Record<number, string> = {
        1: 'Jan-Mar',
        2: 'Abr-Jun',
        3: 'Jul-Set',
        4: 'Out-Dez'
      };

      if (!quarterMap.has(quarterKey)) {
        quarterMap.set(quarterKey, {
          quarter,
          year: contentYear,
          label: `Q${quarter} ${contentYear} (${monthRanges[quarter]})`,
          months: new Map()
        });
      }

      const quarterData = quarterMap.get(quarterKey)!;
      if (!quarterData.months.has(monthKey)) {
        quarterData.months.set(monthKey, {
          month: contentMonth,
          year: contentYear,
          label: `${monthNames[contentMonth - 1]} ${contentYear}`,
          campaigns: [],
          contents: [],
          stats: {
            totalReels: 0,
            totalStories: 0,
            totalPosts: 0,
            postedReels: 0,
            postedStories: 0,
            postedPosts: 0
          }
        });
      }

      const monthData = quarterData.months.get(monthKey)!;
      monthData.contents.push(content);

      // Atualizar stats
      if (content.content_type === 'reels') {
        monthData.stats.totalReels++;
        if (content.is_executed || content.post_url) monthData.stats.postedReels++;
      } else if (content.content_type === 'story') {
        monthData.stats.totalStories++;
        if (content.is_executed || content.post_url) monthData.stats.postedStories++;
      } else if (content.content_type === 'post') {
        monthData.stats.totalPosts++;
        if (content.is_executed || content.post_url) monthData.stats.postedPosts++;
      }
    });

    // Converter para array e ordenar (mais recente primeiro)
    const result = Array.from(quarterMap.entries())
      .map(([key, data]) => ({
        key,
        ...data,
        months: Array.from(data.months.entries())
          .map(([mKey, mData]) => ({ key: mKey, ...mData }))
          .sort((a, b) => b.month - a.month || b.year - a.year)
      }))
      .sort((a, b) => b.year - a.year || b.quarter - a.quarter);

    return result;
  };

  const groupedData = getGroupedData();

  // Calcular totais gerais
  const totalStats = {
    totalContents: contents.length,
    totalCampaigns: campaigns.length,
    postedContents: contents.filter(c => c.is_executed || c.post_url).length,
    totalViews: campaigns.reduce((sum, c) => sum + (c.results?.total_reach || 0), 0)
  };

  // Componente para acordeão de tipo de conteúdo
  const ContentTypeAccordion = ({
    type,
    label,
    icon,
    contents: typeContents,
    monthKey,
    expandedContentTypes: expanded,
    toggleContentType: toggle,
    postedCount,
    totalCount
  }: {
    type: string;
    label: string;
    icon: React.ReactNode;
    contents: ContentItem[];
    monthKey: string;
    expandedContentTypes: Set<string>;
    toggleContentType: (key: string) => void;
    postedCount: number;
    totalCount: number;
  }) => {
    const contentTypeKey = `${monthKey}-${type}`;
    const isExpanded = expanded.has(contentTypeKey);

    const bgColors: Record<string, string> = {
      reels: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
      post: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      story: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
    };

    const textColors: Record<string, string> = {
      reels: 'text-pink-700',
      post: 'text-blue-700',
      story: 'text-yellow-700'
    };

    return (
      <div className={`border rounded-lg overflow-hidden ${bgColors[type] || 'bg-gray-50 border-gray-200'}`}>
        <button
          onClick={() => toggle(contentTypeKey)}
          className="w-full px-3 py-2 flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown size={16} className={textColors[type]} /> : <ChevronRight size={16} className={textColors[type]} />}
            <span className={textColors[type]}>{icon}</span>
            <span className={`font-medium ${textColors[type]}`}>{label}</span>
          </div>
          <span className={`text-xs ${textColors[type]} font-medium`}>
            {postedCount}/{totalCount} postados
          </span>
        </button>

        {isExpanded && (
          <div className="px-3 pb-3 space-y-2">
            {typeContents.map((content) => {
              const isPosted = content.is_executed || !!content.post_url;

              return (
                <div
                  key={content.id}
                  className="bg-white rounded-lg p-3 border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={isPosted ? 'text-green-500' : 'text-yellow-500'}>
                        {isPosted ? '✅' : '⏳'}
                      </span>
                      <span className="font-medium text-gray-900 text-sm truncate">
                        {content.title || 'Sem título'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {format(new Date(content.scheduled_date), "dd 'de' MMM", { locale: ptBR })}
                    </p>
                  </div>

                  {content.post_url && (
                    <a
                      href={content.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs hover:bg-pink-200 transition-colors"
                    >
                      <ExternalLink size={12} />
                      Ver post
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-4 md:p-6">
      {/* Header com Resumo Geral */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">📊 Campanhas & Conteúdo</h1>
          <p className="text-gray-600">{businessName}</p>

          {/* Métricas Gerais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
              <p className="text-xs text-blue-600 font-medium">Campanhas</p>
              <p className="text-2xl font-bold text-blue-700">{totalStats.totalCampaigns}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center">
              <p className="text-xs text-purple-600 font-medium">Conteúdos</p>
              <p className="text-2xl font-bold text-purple-700">{totalStats.totalContents}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
              <p className="text-xs text-green-600 font-medium">Postados</p>
              <p className="text-2xl font-bold text-green-700">{totalStats.postedContents}</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-3 text-center">
              <p className="text-xs text-pink-600 font-medium">Alcance</p>
              <p className="text-2xl font-bold text-pink-700">{formatNumber(totalStats.totalViews)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline com Acordeões */}
      <div className="max-w-5xl mx-auto space-y-4">
        {groupedData.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum conteúdo encontrado</h3>
            <p className="text-gray-500">Suas campanhas e conteúdos aparecerão aqui.</p>
          </div>
        ) : (
          groupedData.map((quarterData) => {
            const isQuarterExpanded = expandedQuarters.has(quarterData.key);
            const quarterStats = calculateTrimestrStats(quarterData.months.flatMap(m => m.campaigns));
            const totalQuarterContents = quarterData.months.reduce((sum, m) => sum + m.contents.length, 0);

            return (
              <div key={quarterData.key} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header do Trimestre - Clicável */}
                <button
                  onClick={() => toggleQuarter(quarterData.key)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {isQuarterExpanded ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                    <div className="text-left">
                      <h2 className="text-xl font-bold">{quarterData.label}</h2>
                      <p className="text-blue-100 text-sm">
                        {quarterData.months.flatMap(m => m.campaigns).length} campanhas • {totalQuarterContents} conteúdos
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-sm">
                    <span className="bg-white/20 px-3 py-1 rounded-full">📊 {quarterStats.totalPosts} posts</span>
                    <span className="bg-white/20 px-3 py-1 rounded-full">👁️ {formatNumber(quarterStats.totalViews)} views</span>
                  </div>
                </button>

                {/* Conteúdo do Trimestre - Expandível */}
                {isQuarterExpanded && (
                  <div className="p-4 space-y-4">
                    {/* Métricas do Trimestre */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                        <p className="text-xs text-blue-600 font-semibold">POSTAGENS</p>
                        <p className="text-2xl font-bold text-blue-700">{quarterStats.totalPosts}</p>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-100">
                        <p className="text-xs text-indigo-600 font-semibold">VISUALIZAÇÕES</p>
                        <p className="text-2xl font-bold text-indigo-700">{formatNumber(quarterStats.totalViews)}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
                        <p className="text-xs text-purple-600 font-semibold">ENGAJAMENTO</p>
                        <p className="text-2xl font-bold text-purple-700">{quarterStats.avgEngagement}%</p>
                      </div>
                    </div>

                    {/* Meses do Trimestre */}
                    {quarterData.months.map((monthData) => {
                      const isMonthExpanded = expandedMonths.has(monthData.key);
                      const totalMonthContents = monthData.contents.length;
                      const postedContents = monthData.contents.filter(c => c.is_executed || c.post_url).length;

                      return (
                        <div key={monthData.key} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Header do Mês - Clicável */}
                          <button
                            onClick={() => toggleMonth(monthData.key)}
                            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              {isMonthExpanded ? <ChevronDown size={20} className="text-gray-600" /> : <ChevronRight size={20} className="text-gray-600" />}
                              <span className="font-semibold text-gray-900">{monthData.label}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              {monthData.campaigns.length > 0 && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  📢 {monthData.campaigns.length} campanha{monthData.campaigns.length > 1 ? 's' : ''}
                                </span>
                              )}
                              {totalMonthContents > 0 && (
                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                  📱 {postedContents}/{totalMonthContents} postados
                                </span>
                              )}
                              {monthData.stats.totalReels > 0 && (
                                <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-full hidden md:inline-flex">
                                  🎬 {monthData.stats.postedReels}/{monthData.stats.totalReels} Reels
                                </span>
                              )}
                            </div>
                          </button>

                          {/* Conteúdo do Mês - Expandível */}
                          {isMonthExpanded && (
                            <div className="p-4 space-y-4 bg-white">
                              {/* Campanhas do Mês */}
                              {monthData.campaigns.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">📢 CAMPANHAS</span>
                                  </h4>
                                  {monthData.campaigns.map((campaign) => {
                                    const isCampaignExpanded = expandedCampaigns.has(campaign.id);
                                    const creatorsCount = campaign.totalCriadores || campaign.deliverables?.creators_count || 0;

                                    return (
                                      <div key={campaign.id} className="border border-blue-200 rounded-lg overflow-hidden">
                                        <button
                                          onClick={() => toggleCampaign(campaign.id)}
                                          className="w-full px-4 py-3 bg-blue-50 flex items-center justify-between hover:bg-blue-100 transition-all"
                                        >
                                          <div className="flex items-center gap-2">
                                            {isCampaignExpanded ? <ChevronDown size={18} className="text-blue-600" /> : <ChevronRight size={18} className="text-blue-600" />}
                                            <span className="font-medium text-blue-900">{campaign.title}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(campaign.status)}`}>
                                              {campaign.status}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-blue-700">
                                            <span>👥 {creatorsCount} criadores</span>
                                            <span>👁️ {formatNumber(campaign.results?.total_reach || 0)}</span>
                                          </div>
                                        </button>

                                        {isCampaignExpanded && (
                                          <div className="p-4 space-y-3">
                                            {campaign.description && (
                                              <p className="text-sm text-gray-600">{campaign.description}</p>
                                            )}

                                            {/* Métricas da Campanha */}
                                            <div className="grid grid-cols-3 gap-2">
                                              <div className="bg-blue-50 p-2 rounded text-center">
                                                <p className="text-xs text-blue-600">Alcance</p>
                                                <p className="font-bold text-blue-700">{formatNumber(campaign.results?.total_reach || 0)}</p>
                                              </div>
                                              <div className="bg-pink-50 p-2 rounded text-center">
                                                <p className="text-xs text-pink-600">Engajamento</p>
                                                <p className="font-bold text-pink-700">{formatNumber(campaign.results?.total_engagement || 0)}</p>
                                              </div>
                                              <div className="bg-purple-50 p-2 rounded text-center">
                                                <p className="text-xs text-purple-600">Criadores</p>
                                                <p className="font-bold text-purple-700">{creatorsCount}</p>
                                              </div>
                                            </div>

                                            {/* Botão Ver Detalhes */}
                                            <button
                                              onClick={() => openCampaignModal(campaign)}
                                              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                            >
                                              <ExternalLink size={16} />
                                              Ver Detalhes Completos
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Planejamento de Conteúdo do Mês */}
                              {monthData.contents.length > 0 && (
                                <div className="space-y-3">
                                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs">📱 PLANEJAMENTO DE CONTEÚDO</span>
                                    <span className="text-gray-500 font-normal">
                                      ({monthData.contents.filter(c => c.is_executed || c.post_url).length} postados de {monthData.contents.length})
                                    </span>
                                  </h4>

                                  {/* Reels */}
                                  {monthData.stats.totalReels > 0 && (
                                    <ContentTypeAccordion
                                      type="reels"
                                      label="Reels"
                                      icon={<Film size={16} />}
                                      contents={monthData.contents.filter(c => c.content_type === 'reels')}
                                      monthKey={monthData.key}
                                      expandedContentTypes={expandedContentTypes}
                                      toggleContentType={toggleContentType}
                                      postedCount={monthData.stats.postedReels}
                                      totalCount={monthData.stats.totalReels}
                                    />
                                  )}

                                  {/* Posts */}
                                  {monthData.stats.totalPosts > 0 && (
                                    <ContentTypeAccordion
                                      type="post"
                                      label="Posts"
                                      icon={<Image size={16} />}
                                      contents={monthData.contents.filter(c => c.content_type === 'post')}
                                      monthKey={monthData.key}
                                      expandedContentTypes={expandedContentTypes}
                                      toggleContentType={toggleContentType}
                                      postedCount={monthData.stats.postedPosts}
                                      totalCount={monthData.stats.totalPosts}
                                    />
                                  )}

                                  {/* Stories */}
                                  {monthData.stats.totalStories > 0 && (
                                    <ContentTypeAccordion
                                      type="story"
                                      label="Stories"
                                      icon={<FileText size={16} />}
                                      contents={monthData.contents.filter(c => c.content_type === 'story')}
                                      monthKey={monthData.key}
                                      expandedContentTypes={expandedContentTypes}
                                      toggleContentType={toggleContentType}
                                      postedCount={monthData.stats.postedStories}
                                      totalCount={monthData.stats.totalStories}
                                    />
                                  )}
                                </div>
                              )}

                              {/* Mensagem se não há nada no mês */}
                              {monthData.campaigns.length === 0 && monthData.contents.length === 0 && (
                                <p className="text-gray-500 text-sm text-center py-4">
                                  Nenhuma campanha ou conteúdo neste mês.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
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
                <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Resultados Gerais</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center">
                    <p className="text-xs text-blue-600 mb-1">Alcance Total</p>
                    <p className="text-2xl font-bold text-blue-700">{formatNumber(selectedCampaign.results?.total_reach || 0)}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg text-center">
                    <p className="text-xs text-pink-600 mb-1">Engajamento</p>
                    <p className="text-2xl font-bold text-pink-700">{formatNumber(selectedCampaign.results?.total_engagement || 0)}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center">
                    <p className="text-xs text-green-600 mb-1">Conversões</p>
                    <p className="text-2xl font-bold text-green-700">{formatNumber(selectedCampaign.results?.total_conversions || 0)}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center">
                    <p className="text-xs text-purple-600 mb-1">Criadores</p>
                    <p className="text-2xl font-bold text-purple-700">{selectedCampaign.totalCriadores || selectedCampaign.deliverables?.creators_count || 0}</p>
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

                        {/* Performance do Criador */}
                        {creator.deliverables && (creator.deliverables.total_views || creator.deliverables.reach || creator.deliverables.likes) && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            {creator.deliverables.total_views && (
                              <div className="bg-blue-50 p-2 rounded text-center">
                                <p className="text-xs text-blue-600">👁️ Visualizações</p>
                                <p className="font-bold text-blue-700">{formatNumber(creator.deliverables.total_views)}</p>
                              </div>
                            )}
                            {creator.deliverables.reach && (
                              <div className="bg-purple-50 p-2 rounded text-center">
                                <p className="text-xs text-purple-600">📊 Alcance</p>
                                <p className="font-bold text-purple-700">{formatNumber(creator.deliverables.reach)}</p>
                              </div>
                            )}
                            {creator.deliverables.likes && (
                              <div className="bg-pink-50 p-2 rounded text-center">
                                <p className="text-xs text-pink-600">❤️ Curtidas</p>
                                <p className="font-bold text-pink-700">{formatNumber(creator.deliverables.likes)}</p>
                              </div>
                            )}
                            {creator.deliverables.engagement_rate && (
                              <div className="bg-green-50 p-2 rounded text-center">
                                <p className="text-xs text-green-600">📈 Taxa Eng.</p>
                                <p className="font-bold text-green-700">{creator.deliverables.engagement_rate}%</p>
                              </div>
                            )}
                          </div>
                        )}

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

