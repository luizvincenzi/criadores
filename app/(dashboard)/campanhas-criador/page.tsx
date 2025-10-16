'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

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
}

export default function CampaignsCreatorPage() {
  const { user, session } = useAuthStore();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se é creator
  useEffect(() => {
    if (!user) return;

    const isCreator = user.role === 'creator' || (user.roles && user.roles.includes('creator'));
    
    if (!isCreator) {
      console.log('❌ Usuário não é creator, redirecionando...');
      router.push('/campaigns');
      return;
    }

    loadCreatorCampaigns();
  }, [user]);

  const loadCreatorCampaigns = async () => {
    if (!user?.creator_id) {
      console.log('❌ Creator ID não encontrado');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('📊 Carregando campanhas do creator:', user.creator_id);
      console.log('👤 Creator:', user.full_name);

      // IMPORTANTE: Buscar APENAS campanhas onde este creator participou
      // Usar tabela campaign_creators para relacionamento
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
        .eq('creator_id', user.creator_id) // FILTRO CRÍTICO: apenas campanhas deste creator
        .order('created_at', { ascending: false });

      if (ccError) {
        console.error('❌ Erro ao buscar campanhas do creator:', ccError);
        setCampaigns([]);
        return;
      }

      // Transformar dados para o formato esperado
      const transformedCampaigns = (campaignCreators || [])
        .filter(cc => cc.campaigns) // Filtrar apenas registros com campanha válida
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
            creator_role: cc.role, // Role do creator nesta campanha
            creator_status: cc.status // Status do creator nesta campanha
          };
        });

      console.log('✅ Campanhas do creator carregadas:', transformedCampaigns.length);

      // Log de segurança
      if (transformedCampaigns.length > 0) {
        console.log('📋 Campanhas:', transformedCampaigns.map(c => ({
          id: c.id,
          name: c.name,
          business: c.business?.name,
          role: c.creator_role,
          status: c.creator_status
        })));
      } else {
        console.log('ℹ️ Nenhuma campanha encontrada para este creator');
      }

      setCampaigns(transformedCampaigns);

    } catch (error) {
      console.error('❌ Erro ao carregar campanhas:', error);
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'completed': 'bg-blue-100 text-blue-800 border-blue-200',
      'planning': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'paused': 'bg-orange-100 text-orange-800 border-orange-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'active': 'Ativa',
      'completed': 'Concluída',
      'planning': 'Planejamento',
      'paused': 'Pausada',
      'cancelled': 'Cancelada',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const groupCampaignsByMonth = (campaigns: Campaign[]) => {
    const grouped: Record<string, Campaign[]> = {};
    
    campaigns.forEach(campaign => {
      const date = new Date(campaign.start_date || campaign.created_at);
      const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(campaign);
    });

    return grouped;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando suas campanhas...</p>
        </div>
      </div>
    );
  }

  const groupedCampaigns = groupCampaignsByMonth(campaigns);
  const months = Object.keys(groupedCampaigns).sort((a, b) => {
    const dateA = new Date(groupedCampaigns[a][0].start_date || groupedCampaigns[a][0].created_at);
    const dateB = new Date(groupedCampaigns[b][0].start_date || groupedCampaigns[b][0].created_at);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <div className="sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Minhas Campanhas</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {campaigns.length} {campaigns.length === 1 ? 'campanha' : 'campanhas'} realizadas
              </p>
            </div>
            
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {campaigns.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 11l18-5v12L3 14v-3z"/>
                <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-sm sm:text-base text-gray-600">Suas campanhas aparecerão aqui quando estiverem disponíveis.</p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {months.map((month) => (
              <div key={month} className="space-y-4">
                {/* Month Header */}
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 capitalize">{month}</h2>
                    <p className="text-sm text-gray-600">
                      {groupedCampaigns[month].length} {groupedCampaigns[month].length === 1 ? 'campanha' : 'campanhas'}
                    </p>
                  </div>
                </div>

                {/* Campaigns Timeline */}
                <div className="ml-6 sm:ml-8 border-l-2 border-gray-200 pl-6 sm:pl-8 space-y-6">
                  {groupedCampaigns[month].map((campaign, index) => (
                    <div
                      key={campaign.id}
                      className="relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[37px] sm:-left-[41px] top-6 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full border-4 border-white"></div>

                      {/* Campaign Content */}
                      <div className="space-y-3 sm:space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                              {campaign.name}
                            </h3>
                            {campaign.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                            )}
                          </div>
                          <span className={`flex-shrink-0 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                            {getStatusLabel(campaign.status)}
                          </span>
                        </div>

                        {/* Business Info */}
                        {campaign.business && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="font-medium truncate">{campaign.business.name}</span>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                          {campaign.start_date && (
                            <div className="flex items-center space-x-1.5">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(campaign.start_date)}</span>
                            </div>
                          )}
                          {campaign.end_date && (
                            <>
                              <span className="text-gray-300">→</span>
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

