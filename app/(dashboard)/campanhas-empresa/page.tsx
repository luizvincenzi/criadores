'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronDown,
  ChevronRight,
  Layout,
  Box,
  PlayCircle,
  Smartphone,
  Layers,
  Image as ImageIcon,
  ArrowUpRight
} from 'lucide-react';

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
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [currentQuarterLabel, setCurrentQuarterLabel] = useState<string>('');

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

      console.log('Campanhas recebidas:', campaignsData);

      if (campaignsData.success && campaignsData.data && Array.isArray(campaignsData.data)) {
        // Ordenar por data de criação (mais recente primeiro)
        const sortedCampaigns = campaignsData.data.sort((a: Campaign, b: Campaign) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setCampaigns(sortedCampaigns);

        // Calcular trimestre atual e expandir ele + todos os meses dele
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const currentQuarter = Math.ceil(currentMonth / 3);
        const quarterMonthMap: Record<number, string[]> = {
          1: ['Jan', 'Fev', 'Mar'],
          2: ['Abr', 'Mai', 'Jun'],
          3: ['Jul', 'Ago', 'Set'],
          4: ['Out', 'Nov', 'Dez']
        };
        const quarterLabel = `Q${currentQuarter} ${currentYear} (${quarterMonthMap[currentQuarter].join('-')})`;

        // Salvar o label do trimestre atual para impedir que seja fechado
        setCurrentQuarterLabel(quarterLabel);

        // Expandir o trimestre atual
        setExpandedQuarters(new Set([quarterLabel]));

        // Expandir todos os meses do trimestre atual
        const startMonth = (currentQuarter - 1) * 3 + 1;
        const monthsToExpand: string[] = [];
        for (let m = startMonth; m < startMonth + 3; m++) {
          monthsToExpand.push(`${currentYear}-${m.toString().padStart(2, '0')}`);
        }
        setExpandedMonths(new Set(monthsToExpand));
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
      'Aguardando aprovação': 'bg-amber-100 text-amber-800',
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
    console.log('getQuarter Debug:', {
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

  // Função para pegar o número da semana do ano
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
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

  // Agrupar conteúdos por mês e semana
  const groupContentsByMonthAndWeek = (quarterContents: ContentItem[]) => {
    const grouped: Record<string, Record<number, ContentItem[]>> = {};

    quarterContents.forEach(content => {
      const date = new Date(content.scheduled_date);
      const monthKey = format(date, 'MMMM yyyy', { locale: ptBR });
      const weekNum = getWeekNumber(date);

      if (!grouped[monthKey]) {
        grouped[monthKey] = {};
      }
      if (!grouped[monthKey][weekNum]) {
        grouped[monthKey][weekNum] = [];
      }
      grouped[monthKey][weekNum].push(content);
    });

    return grouped;
  };

  // Calcular resumo mensal
  const getMonthSummary = (monthContents: Record<number, ContentItem[]>) => {
    const allContents = Object.values(monthContents).flat();
    return {
      reels: allContents.filter(c => c.content_type === 'reels').length,
      posts: allContents.filter(c => c.content_type === 'post').length,
      stories: allContents.filter(c => c.content_type === 'story').length,
      total: allContents.length,
      executed: allContents.filter(c => c.is_executed).length
    };
  };

  // Toggle para expandir/colapsar trimestre (trimestre atual SEMPRE aberto)
  const toggleQuarter = (quarterLabel: string) => {
    // Não permitir fechar o trimestre atual
    if (quarterLabel === currentQuarterLabel) {
      return; // Trimestre atual sempre aberto
    }

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

  // Toggle para expandir/colapsar mês
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

  // Parse month string (formato "2025-12" ou "202512")
  const parseMonthString = (monthStr: string): { month: number; year: number } => {
    if (monthStr.includes('-')) {
      const [year, month] = monthStr.split('-').map(Number);
      return { month, year };
    } else if (monthStr.length === 6) {
      const year = parseInt(monthStr.substring(0, 4));
      const month = parseInt(monthStr.substring(4, 6));
      return { month, year };
    }
    return { month: new Date().getMonth() + 1, year: new Date().getFullYear() };
  };

  // Obter dados do trimestre a partir do mês
  const getQuarterFromMonth = (month: number, year: number) => {
    const quarter = Math.ceil(month / 3);
    const quarterRanges: Record<number, string> = {
      1: 'Jan-Mar',
      2: 'Abr-Jun',
      3: 'Jul-Set',
      4: 'Out-Dez'
    };
    return {
      quarter,
      year,
      label: `Q${quarter} ${year} (${quarterRanges[quarter]})`
    };
  };

  // Agrupar campanhas por Trimestre > Mês
  const groupCampaignsByQuarterAndMonth = (campaignsList: Campaign[]) => {
    const grouped: Record<string, Record<string, Campaign[]>> = {};

    campaignsList.forEach(campaign => {
      const { month, year } = parseMonthString(campaign.month);
      const quarterData = getQuarterFromMonth(month, year);
      const quarterLabel = quarterData.label;
      const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: ptBR });
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

      if (!grouped[quarterLabel]) {
        grouped[quarterLabel] = {};
      }
      if (!grouped[quarterLabel][monthKey]) {
        grouped[quarterLabel][monthKey] = [];
      }
      grouped[quarterLabel][monthKey].push(campaign);
    });

    return grouped;
  };

  // Obter conteúdos para um mês específico
  const getContentsForMonth = (monthKey: string): ContentItem[] => {
    const [year, month] = monthKey.split('-').map(Number);
    return contents.filter(content => {
      const contentDate = new Date(content.scheduled_date);
      return contentDate.getFullYear() === year && (contentDate.getMonth() + 1) === month;
    });
  };

  // Agrupar conteúdos por semana
  const groupContentsByWeek = (monthContents: ContentItem[]) => {
    const grouped: Record<number, ContentItem[]> = {};
    monthContents.forEach(content => {
      const weekNum = getWeekNumber(new Date(content.scheduled_date));
      if (!grouped[weekNum]) {
        grouped[weekNum] = [];
      }
      grouped[weekNum].push(content);
    });
    return grouped;
  };

  // Calcular stats do mês
  const calculateMonthStats = (monthCampaigns: Campaign[], monthContents: ContentItem[]) => {
    return {
      campaigns: monthCampaigns.length,
      contents: monthContents.length,
      executed: monthContents.filter(c => c.is_executed).length,
      reels: monthContents.filter(c => c.content_type === 'reels').length,
      posts: monthContents.filter(c => c.content_type === 'post').length,
      stories: monthContents.filter(c => c.content_type === 'story').length
    };
  };

  // Calcular stats do trimestre
  const calculateQuarterStats = (quarterData: Record<string, Campaign[]>) => {
    let totalCampaigns = 0;
    let totalContents = 0;
    let executedContents = 0;

    Object.entries(quarterData).forEach(([monthKey, monthCampaigns]) => {
      totalCampaigns += monthCampaigns.length;
      const monthContents = getContentsForMonth(monthKey);
      totalContents += monthContents.length;
      executedContents += monthContents.filter(c => c.is_executed).length;
    });

    return { totalCampaigns, totalContents, executedContents };
  };

  // Formatar nome do mês a partir da key
  const formatMonthLabel = (monthKey: string): string => {
    const [year, month] = monthKey.split('-').map(Number);
    return format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: ptBR });
  };

  const openCampaignModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const closeCampaignModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedCampaign(null), 300);
  };

  // Componente para Status Pill
  const StatusPill = ({ status, color }: { status: string; color: string }) => {
    const styles: Record<string, string> = {
      blue: "bg-blue-100/50 text-blue-700 border-blue-200",
      green: "bg-emerald-100/50 text-emerald-700 border-emerald-200",
      amber: "bg-amber-100/50 text-amber-700 border-amber-200",
      gray: "bg-gray-100 text-gray-600 border-gray-200",
    };
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[color] || styles.gray}`}>
        {status}
      </span>
    );
  };

  // Componente para ícone de conteúdo
  const ContentIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'reels': return <div className="p-2 bg-pink-50 text-pink-600 rounded-lg"><PlayCircle size={18} /></div>;
      case 'story': return <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Smartphone size={18} /></div>;
      case 'post': return <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Layers size={18} /></div>;
      default: return <div className="p-2 bg-gray-50 text-gray-600 rounded-lg"><ImageIcon size={18} /></div>;
    }
  };

  // Calcular total de conteúdos
  const totalContentsCount = contents.length;
  const executedContentsCount = contents.filter(c => c.is_executed).length;

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans">

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto px-6 pt-8 pb-20">

        {/* PAGE TITLE & TOTALS */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-2">
            Timeline de Entregas
          </h1>
          <p className="text-lg text-gray-500 mb-6">{businessName}</p>

          <div className="flex flex-wrap gap-4">
            <div className="px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layout size={18} /></div>
               <div>
                 <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Campanhas</p>
                 <p className="text-xl font-bold text-gray-900">{campaigns.length}</p>
               </div>
            </div>
            <div className="px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
               <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Box size={18} /></div>
               <div>
                 <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Conteúdos</p>
                 <p className="text-xl font-bold text-gray-900">{totalContentsCount}</p>
               </div>
            </div>
            {totalContentsCount > 0 && (
              <div className="px-5 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                 <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                   <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                   </svg>
                 </div>
                 <div>
                   <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Postados</p>
                   <p className="text-xl font-bold text-gray-900">{executedContentsCount}/{totalContentsCount}</p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* QUARTERS LIST */}
        <div className="relative">
          {campaigns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Layout size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
              <p className="text-gray-500">Suas campanhas aparecerão aqui quando forem criadas.</p>
            </div>
          ) : (
            <div className="space-y-20">
              {Object.entries(groupCampaignsByQuarterAndMonth(campaigns))
                .sort(([a], [b]) => {
                  const yearA = parseInt(a.match(/\d{4}/)?.[0] || '0');
                  const yearB = parseInt(b.match(/\d{4}/)?.[0] || '0');
                  const qA = parseInt(a.match(/Q(\d)/)?.[1] || '0');
                  const qB = parseInt(b.match(/Q(\d)/)?.[1] || '0');
                  if (yearA !== yearB) return yearB - yearA;
                  return qB - qA;
                })
                .map(([quarterLabel, monthsData]) => {
                  const quarterStats = calculateQuarterStats(monthsData);
                  const isQuarterExpanded = expandedQuarters.has(quarterLabel);
                  const quarterMonths = quarterLabel.match(/\(([^)]+)\)/)?.[1] || '';
                  const quarterYear = quarterLabel.match(/\d{4}/)?.[0] || '';
                  const quarterNum = quarterLabel.match(/Q(\d)/)?.[1] || '';
                  const isCurrentQuarter = quarterLabel === currentQuarterLabel;

                  return (
                    <div key={quarterLabel} className="group">

                      {/* Quarter Header - Novo Design Cinza */}
                      <div
                        className={`bg-gray-100 rounded-2xl p-6 md:p-8 mb-10 ${
                          isCurrentQuarter ? '' : 'cursor-pointer hover:bg-gray-200/70'
                        } transition-all`}
                        onClick={() => toggleQuarter(quarterLabel)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {!isCurrentQuarter && (
                              isQuarterExpanded ? (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                              )
                            )}
                            <div>
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                                {isCurrentQuarter ? '● Trimestre Atual' : `${quarterNum}º Trimestre`}
                              </span>
                              <h2 className="text-2xl font-bold text-gray-900">{quarterMonths} {quarterYear}</h2>
                            </div>
                          </div>
                          <div className="flex gap-6 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                            <div className="text-right">
                              <p className="text-xs text-gray-400 font-medium">Campanhas</p>
                              <p className="text-lg font-bold text-gray-900">{quarterStats.totalCampaigns}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-400 font-medium">Conteúdos</p>
                              <p className="text-lg font-bold text-gray-900">{quarterStats.totalContents}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Months within Quarter */}
                      {isQuarterExpanded && (
                        <div className="space-y-12">
                          {Object.entries(monthsData)
                            .sort(([a], [b]) => b.localeCompare(a))
                            .map(([monthKey, monthCampaigns]) => {
                              const monthContents = getContentsForMonth(monthKey);
                              const monthStats = calculateMonthStats(monthCampaigns, monthContents);
                              const isMonthExpanded = expandedMonths.has(monthKey);
                              const monthLabel = formatMonthLabel(monthKey);

                              return (
                                <div key={monthKey} className="relative pl-8 md:pl-0">
                                  <div className="grid md:grid-cols-[180px_1fr] gap-8 mb-12">

                                    {/* Lado Esquerdo: Resumo do Mês (Sticky) */}
                                    <div className="md:sticky md:top-32 h-fit">
                                      <div
                                        className="flex items-center gap-3 mb-2 cursor-pointer"
                                        onClick={() => toggleMonth(monthKey)}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full ${isMonthExpanded ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                        <h3 className="text-lg font-bold text-gray-900 capitalize">{monthLabel}</h3>
                                        {isMonthExpanded ? (
                                          <ChevronDown className="w-4 h-4 text-gray-400" />
                                        ) : (
                                          <ChevronRight className="w-4 h-4 text-gray-400" />
                                        )}
                                      </div>

                                      {/* Mini Dashboard do Mês */}
                                      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm mt-3">
                                        <div className="space-y-3">
                                          <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 flex items-center gap-2">
                                              <Layout size={14} /> Campanhas
                                            </span>
                                            <span className="font-bold text-gray-900">{monthStats.campaigns}</span>
                                          </div>
                                          <div className="w-full h-px bg-gray-100"></div>
                                          <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500 flex items-center gap-2">
                                              <Box size={14} /> Conteúdos
                                            </span>
                                            <span className="font-bold text-gray-900">{monthStats.contents}</span>
                                          </div>
                                          {monthStats.contents > 0 && (
                                            <>
                                              <div className="w-full h-px bg-gray-100"></div>
                                              <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Postados</span>
                                                <span className="font-bold text-emerald-600">{monthStats.executed}/{monthStats.contents}</span>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Lado Direito: Itens */}
                                    {isMonthExpanded && (
                                      <div className="space-y-4">
                                        {/* Campanhas do Mês */}
                                        {monthCampaigns.map((campaign: Campaign) => {
                                          const creatorsCount = campaign.totalCriadores || campaign.deliverables?.creators_count || 0;
                                          const totalDeliverables = (campaign.deliverables?.posts || 0) + (campaign.deliverables?.reels || 0) + (campaign.deliverables?.stories || 0);

                                          // Determinar cor do status
                                          const statusColorMap: Record<string, string> = {
                                            'Em produção': 'blue',
                                            'Planejamento': 'amber',
                                            'Concluído': 'green',
                                            'Concluída': 'green',
                                            'Em andamento': 'blue',
                                            'Cancelado': 'gray',
                                          };
                                          const statusColor = statusColorMap[campaign.status] || 'gray';

                                          return (
                                            <div
                                              key={campaign.id}
                                              className="group/card bg-white rounded-2xl p-5 border border-gray-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                                              onClick={() => openCampaignModal(campaign)}
                                            >
                                              {/* Decorative Gradient Background */}
                                              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover/card:opacity-100 transition-opacity"></div>

                                              <div className="flex justify-between items-start mb-4 relative z-10">
                                                <div>
                                                  <span className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
                                                    <Layout size={12} /> Campanha
                                                  </span>
                                                  <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover/card:text-blue-700 transition-colors">
                                                    {campaign.title}
                                                  </h4>
                                                </div>
                                                <StatusPill status={campaign.status} color={statusColor} />
                                              </div>

                                              {campaign.description && (
                                                <p className="text-sm text-gray-500 mb-5 leading-relaxed line-clamp-2">
                                                  {campaign.description}
                                                </p>
                                              )}

                                              <div className="flex items-center gap-4 border-t border-gray-50 pt-4">
                                                {creatorsCount > 0 && (
                                                  <div className="flex -space-x-2">
                                                    {[...Array(Math.min(creatorsCount, 4))].map((_, i) => (
                                                      <div key={i} className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-500">
                                                        {String.fromCharCode(65 + i)}
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                                <span className="text-xs font-medium text-gray-400">
                                                  {creatorsCount > 0 && `${creatorsCount} criadores`}
                                                  {creatorsCount > 0 && totalDeliverables > 0 && ' • '}
                                                  {totalDeliverables > 0 && `${totalDeliverables} peças`}
                                                </span>

                                                <div className="ml-auto p-1.5 rounded-full hover:bg-gray-50 text-gray-400 group-hover/card:text-blue-600 transition-colors">
                                                  <ArrowUpRight size={16} />
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        })}

                                        {/* Conteúdos do Mês */}
                                        {monthContents.map((content) => {
                                          const statusColorMap: Record<string, string> = {
                                            'Postado': 'green',
                                            'Aprovado': 'green',
                                            'Agendado': 'amber',
                                            'Pendente': 'gray',
                                          };
                                          const contentStatus = content.is_executed ? 'Postado' : 'Pendente';
                                          const statusColor = statusColorMap[contentStatus] || 'gray';

                                          return (
                                            <div
                                              key={content.id}
                                              className="group/content flex items-start gap-4 p-4 bg-white/60 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 hover:shadow-sm transition-all cursor-pointer"
                                            >
                                              <ContentIcon type={content.content_type} />

                                              <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                  <div>
                                                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5 mb-0.5">
                                                      {content.content_type === 'reels' ? 'Reels' : content.content_type === 'story' ? 'Stories' : 'Post'} • {format(new Date(content.scheduled_date), "dd MMM", { locale: ptBR })}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-gray-900 truncate pr-2 group-hover/content:text-blue-600 transition-colors">
                                                      {content.title}
                                                    </h4>
                                                  </div>
                                                  <div className="opacity-0 group-hover/content:opacity-100 transition-opacity">
                                                    <StatusPill status={contentStatus} color={statusColor} />
                                                  </div>
                                                </div>
                                              </div>

                                              {content.post_url && (
                                                <a
                                                  href={content.post_url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                                                  onClick={(e) => e.stopPropagation()}
                                                >
                                                  <ArrowUpRight size={16} />
                                                </a>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Detalhes da Campanha */}
      {isModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center p-4" onClick={closeCampaignModal}>
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header do Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCampaign.title}</h2>
                <p className="text-sm text-gray-500 mt-1">{formatMonthYear(selectedCampaign.month)}</p>
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
                    {format(new Date(selectedCampaign.start_date), "dd 'de' MMMM", { locale: ptBR })} - {format(new Date(selectedCampaign.end_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>

              {/* Descrição */}
              {selectedCampaign.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Descrição</h3>
                  <p className="text-gray-600">{selectedCampaign.description}</p>
                </div>
              )}

              {/* Objetivos */}
              {selectedCampaign.objectives && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Objetivos</h3>
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
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumo da Campanha</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg text-center">
                    <p className="text-xs text-teal-600 mb-1">Criadores</p>
                    <p className="text-2xl font-bold text-teal-700">{selectedCampaign.totalCriadores || selectedCampaign.deliverables?.creators_count || 0}</p>
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
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Criadores e Conteúdo Publicado</h3>
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
                                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
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
                                <span>• {creator.cidade}</span>
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
                            <p className="text-xs font-semibold text-gray-700 mb-2">Conteúdo Publicado</p>
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
                            <p className="text-xs font-semibold text-gray-700 mb-2">Vídeos Publicados</p>
                            <div className="space-y-2">
                              {creator.video_instagram_link && (
                                <a
                                  href={creator.video_instagram_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-gradient-to-r from-gray-50 to-red-50 hover:from-gray-100 hover:to-red-100 rounded-lg transition-colors group"
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-red-600 flex-shrink-0">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
                                  <span className="text-sm text-gray-700 group-hover:text-red-700 truncate">Vídeo Instagram</span>
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
                                  <span className="text-sm text-white truncate">Vídeo TikTok</span>
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
                            <p className="text-xs font-semibold text-gray-700 mb-2">Status de Entrega</p>
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

