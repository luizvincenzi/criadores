'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Building2, Clock, CheckCircle, CircleDot, PauseCircle, XCircle, ChevronRight, ExternalLink, Megaphone } from 'lucide-react';
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
  video_instagram_link?: string;
  video_tiktok_link?: string;
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

      const { data: campaignCreators, error: ccError } = await supabase
        .from('campaign_creators')
        .select(`
          campaign_id,
          role,
          status,
          video_instagram_link,
          video_tiktok_link,
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
            creator_status: cc.status,
            video_instagram_link: cc.video_instagram_link,
            video_tiktok_link: cc.video_tiktok_link
          };
        });

      console.log('[campanhas] Campanhas carregadas:', transformedCampaigns.length);
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <div className="h-7 bg-slate-200/60 rounded-xl w-48 mb-3 animate-pulse" />
            <div className="h-4 bg-slate-200/60 rounded-xl w-32 animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl p-5 border border-white/40 animate-pulse">
                <div className="h-5 bg-slate-200/60 rounded-xl w-2/3 mb-3" />
                <div className="h-4 bg-slate-200/60 rounded-xl w-1/3 mb-3" />
                <div className="flex gap-3">
                  <div className="h-5 bg-slate-200/60 rounded-2xl w-20" />
                  <div className="h-5 bg-slate-200/60 rounded-2xl w-24" />
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-2">
        <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Minhas Campanhas</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {campaigns.length} {campaigns.length === 1 ? 'campanha' : 'campanhas'}
            </p>
          </div>

          {campaigns.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {stats.ativas > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-50/80 text-green-700 text-[11px] font-medium">
                  {stats.ativas} {stats.ativas === 1 ? 'ativa' : 'ativas'}
                </span>
              )}
              {stats.concluidas > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50/80 text-blue-700 text-[11px] font-medium">
                  {stats.concluidas} {stats.concluidas === 1 ? 'concluida' : 'concluidas'}
                </span>
              )}
              {stats.planejamento > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50/80 text-amber-700 text-[11px] font-medium">
                  {stats.planejamento} planejamento
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {campaigns.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <div className="bg-slate-100/80 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-5">
              <Megaphone className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1.5">Nenhuma campanha ainda</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Suas campanhas aparecerão aqui quando estiverem disponíveis.
            </p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10">
            {months.map((month) => (
              <div key={month}>
                {/* Month separator */}
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider capitalize">{month}</h2>
                  <div className="flex-1 h-px bg-slate-200/60" />
                  <span className="text-xs text-slate-300">
                    {groupedCampaigns[month].length}
                  </span>
                </div>

                {/* Campaign cards */}
                <div className="space-y-3">
                  {groupedCampaigns[month].map((campaign) => (
                    <div
                      key={campaign.id}
                      className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      {/* Top row: name + status */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                          {campaign.name}
                        </h3>
                        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusColor(campaign.status)}`}>
                          {getStatusIcon(campaign.status)}
                          {getStatusLabel(campaign.status)}
                        </span>
                      </div>

                      {/* Description */}
                      {campaign.description && (
                        <p className="text-xs text-slate-400 line-clamp-1 mb-2.5">{campaign.description}</p>
                      )}

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                        {campaign.business && (
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{campaign.business.name}</span>
                          </div>
                        )}

                        {campaign.start_date && (
                          <div className="flex items-center gap-1">
                            <span>{formatDate(campaign.start_date)}</span>
                            {campaign.end_date && (
                              <>
                                <ChevronRight className="w-3 h-3 text-slate-300" />
                                <span>{formatDate(campaign.end_date)}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Post links */}
                      {(campaign.video_instagram_link || campaign.video_tiktok_link) && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100/80">
                          {campaign.video_instagram_link && (
                            <a
                              href={campaign.video_instagram_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-50/80 hover:bg-slate-100 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                              </svg>
                              Ver no Instagram
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          )}
                          {campaign.video_tiktok_link && (
                            <a
                              href={campaign.video_tiktok_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-50/80 hover:bg-slate-100 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.3a6.34 6.34 0 0010.86 4.43v-7.15a8.16 8.16 0 005.58 2.2V11.4a4.85 4.85 0 01-3.77-1.87V6.69h3.77z"/>
                              </svg>
                              Ver no TikTok
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          )}
                        </div>
                      )}
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
