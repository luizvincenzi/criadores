'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Calendar, Building2, Megaphone, Clock, CheckCircle, CircleDot, PauseCircle, XCircle, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Campaign {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  business_id: string;
  business?: {
    name: string;
    slug: string;
  };
  created_at: string;
  creator_role?: string;
  creator_status?: string;
}

export default function CampaignsCreatorPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const isCreator = user.role === 'creator' || (user.roles && user.roles.includes('creator'));

    if (!isCreator) {
      console.log('[campanhas] Usuario nao e creator, redirecionando...');
      router.push('/campaigns');
      return;
    }

    loadCreatorCampaigns();
  }, [user]);

  const loadCreatorCampaigns = async () => {
    if (!user?.creator_id) {
      console.log('[campanhas] Creator ID nao encontrado');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('[campanhas] Carregando campanhas do creator:', user.creator_id);
      console.log('[campanhas] Creator:', user.full_name);

      const { data: campaignCreators, error: ccError } = await supabase
        .from('campaign_creators')
        .select(`
          campaign_id,
          role,
          status,
          campaigns:campaign_id (
            id,
            title,
            description,
            start_date,
            end_date,
            status,
            business_id,
            created_at,
            businesses:business_id (
              name,
              slug
            )
          )
        `)
        .eq('creator_id', user.creator_id)
        .order('created_at', { ascending: false });

      if (ccError) {
        console.error('[campanhas] Erro ao buscar campanhas do creator:', ccError);
        setCampaigns([]);
        return;
      }

      const transformedCampaigns = (campaignCreators || [])
        .filter(cc => cc.campaigns)
        .map(cc => {
          const campaign = cc.campaigns as any;
          return {
            id: campaign.id,
            name: campaign.title,
            description: campaign.description,
            start_date: campaign.start_date,
            end_date: campaign.end_date,
            status: campaign.status,
            business_id: campaign.business_id,
            business: campaign.businesses,
            created_at: campaign.created_at,
            creator_role: cc.role,
            creator_status: cc.status
          };
        });

      console.log('[campanhas] Campanhas carregadas:', transformedCampaigns.length);

      if (transformedCampaigns.length > 0) {
        console.log('[campanhas] Lista:', transformedCampaigns.map(c => ({
          id: c.id,
          name: c.name,
          business: c.business?.name,
          role: c.creator_role,
          status: c.creator_status
        })));
      } else {
        console.log('[campanhas] Nenhuma campanha encontrada para este creator');
      }

      setCampaigns(transformedCampaigns);

    } catch (error) {
      console.error('[campanhas] Erro ao carregar campanhas:', error);
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-50/80 text-green-700 border-green-200/60',
      'completed': 'bg-blue-50/80 text-blue-700 border-blue-200/60',
      'planning': 'bg-amber-50/80 text-amber-700 border-amber-200/60',
      'paused': 'bg-amber-50/80 text-amber-600 border-amber-200/60',
      'cancelled': 'bg-red-50/80 text-red-600 border-red-200/60',
    };
    return colors[status] || 'bg-slate-100 text-slate-600 border-slate-200/60';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      'active': <CheckCircle className="w-3 h-3" />,
      'completed': <CircleDot className="w-3 h-3" />,
      'planning': <Clock className="w-3 h-3" />,
      'paused': <PauseCircle className="w-3 h-3" />,
      'cancelled': <XCircle className="w-3 h-3" />,
    };
    return icons[status] || null;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'active': 'Ativa',
      'completed': 'Concluida',
      'planning': 'Planejamento',
      'paused': 'Pausada',
      'cancelled': 'Cancelada',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(parseISO(dateString), "dd MMM yyyy", { locale: ptBR });
    } catch {
      return '';
    }
  };

  const groupCampaignsByMonth = (campaigns: Campaign[]) => {
    const grouped: Record<string, Campaign[]> = {};

    campaigns.forEach(campaign => {
      try {
        const date = parseISO(campaign.start_date || campaign.created_at);
        const monthYear = format(date, 'MMMM yyyy', { locale: ptBR });

        if (!grouped[monthYear]) {
          grouped[monthYear] = [];
        }
        grouped[monthYear].push(campaign);
      } catch {
        // Skip campaigns with invalid dates
      }
    });

    return grouped;
  };

  const stats = useMemo(() => {
    const ativas = campaigns.filter(c => c.status === 'active').length;
    const concluidas = campaigns.filter(c => c.status === 'completed').length;
    const planejamento = campaigns.filter(c => c.status === 'planning').length;
    return { ativas, concluidas, planejamento };
  }, [campaigns]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-slate-200/60 rounded-xl w-56 mb-3 animate-pulse" />
            <div className="h-5 bg-slate-200/60 rounded-xl w-40 animate-pulse" />
          </div>
          {/* Card skeletons */}
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-white/40 animate-pulse">
                <div className="h-5 bg-slate-200/60 rounded-xl w-2/3 mb-3" />
                <div className="h-4 bg-slate-200/60 rounded-xl w-1/2 mb-4" />
                <div className="flex gap-3">
                  <div className="h-6 bg-slate-200/60 rounded-2xl w-20" />
                  <div className="h-6 bg-slate-200/60 rounded-2xl w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const groupedCampaigns = groupCampaignsByMonth(campaigns);
  const months = Object.keys(groupedCampaigns).sort((a, b) => {
    try {
      const dateA = parseISO(groupedCampaigns[a][0].start_date || groupedCampaigns[a][0].created_at);
      const dateB = parseISO(groupedCampaigns[b][0].start_date || groupedCampaigns[b][0].created_at);
      return dateB.getTime() - dateA.getTime();
    } catch {
      return 0;
    }
  });

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#f5f5f5]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Minhas Campanhas</h1>
              <p className="text-sm text-slate-500 mt-1">
                {campaigns.length} {campaigns.length === 1 ? 'campanha' : 'campanhas'} realizadas
              </p>
            </div>

            {campaigns.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {stats.ativas > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-green-50/80 text-green-700 text-xs font-medium border border-green-200/60">
                    <CheckCircle className="w-3 h-3" />
                    {stats.ativas} {stats.ativas === 1 ? 'ativa' : 'ativas'}
                  </span>
                )}
                {stats.concluidas > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-blue-50/80 text-blue-700 text-xs font-medium border border-blue-200/60">
                    <CircleDot className="w-3 h-3" />
                    {stats.concluidas} {stats.concluidas === 1 ? 'concluida' : 'concluidas'}
                  </span>
                )}
                {stats.planejamento > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-amber-50/80 text-amber-700 text-xs font-medium border border-amber-200/60">
                    <Clock className="w-3 h-3" />
                    {stats.planejamento} planejamento
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {campaigns.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <div className="bg-blue-50/50 rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-10 h-10 text-[#007AFF]" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhuma campanha ainda</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Suas campanhas aparecerão aqui quando estiverem disponíveis.
            </p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {months.map((month) => (
              <div key={month} className="space-y-4">
                {/* Month Header */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-[#007AFF] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize">{month}</h2>
                    <p className="text-sm text-slate-500">
                      {groupedCampaigns[month].length} {groupedCampaigns[month].length === 1 ? 'campanha' : 'campanhas'}
                    </p>
                  </div>
                </div>

                {/* Campaigns Timeline */}
                <div className="ml-6 sm:ml-7 border-l-2 border-slate-200/60 pl-6 sm:pl-8 space-y-4 sm:space-y-6">
                  {groupedCampaigns[month].map((campaign) => (
                    <div
                      key={campaign.id}
                      className="relative bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[33px] sm:-left-[37px] top-6 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-[#007AFF] rounded-full ring-4 ring-white shadow-lg shadow-blue-500/30" />

                      {/* Campaign Content */}
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 truncate">
                              {campaign.name}
                            </h3>
                            {campaign.description && (
                              <p className="text-sm text-slate-500 line-clamp-2">{campaign.description}</p>
                            )}
                          </div>
                          <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-2xl text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                            {getStatusIcon(campaign.status)}
                            {getStatusLabel(campaign.status)}
                          </span>
                        </div>

                        {/* Business Info */}
                        {campaign.business && (
                          <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <Building2 className="w-4 h-4 flex-shrink-0 text-slate-400" />
                            <span className="font-medium truncate">{campaign.business.name}</span>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-400">
                          {campaign.start_date && (
                            <div className="flex items-center space-x-1.5">
                              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                              <span>{formatDate(campaign.start_date)}</span>
                            </div>
                          )}
                          {campaign.end_date && (
                            <>
                              <ChevronRight className="w-3 h-3 text-slate-300" />
                              <div className="flex items-center space-x-1.5">
                                <span>{formatDate(campaign.end_date)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
