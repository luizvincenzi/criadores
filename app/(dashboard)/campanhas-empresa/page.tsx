'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  created_at: string;
  updated_at: string;
}

export default function CampanhasEmpresaPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [businessId, setBusinessId] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');

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
      
      if (campaignsData.success) {
        // Ordenar por data de criação (mais recente primeiro)
        const sortedCampaigns = campaignsData.campaigns.sort((a: Campaign, b: Campaign) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setCampaigns(sortedCampaigns);
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
          <div className="relative">
            {/* Linha vertical da timeline */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Campanhas */}
            <div className="space-y-8">
              {campaigns.map((campaign, index) => (
                <div key={campaign.id} className="relative pl-20">
                  {/* Círculo na timeline */}
                  <div className="absolute left-6 top-6 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow"></div>

                  {/* Card da campanha */}
                  <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                    {/* Header do card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{campaign.title}</h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(campaign.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>

                    {/* Descrição */}
                    {campaign.description && (
                      <p className="text-gray-600 mb-4">{campaign.description}</p>
                    )}

                    {/* Informações principais */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Mês</p>
                        <p className="font-medium text-gray-900">{campaign.month}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Orçamento</p>
                        <p className="font-medium text-gray-900">{formatCurrency(campaign.budget)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Criadores</p>
                        <p className="font-medium text-gray-900">{campaign.deliverables?.creators_count || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Entregas</p>
                        <p className="font-medium text-gray-900">
                          {(campaign.deliverables?.posts || 0) + 
                           (campaign.deliverables?.reels || 0) + 
                           (campaign.deliverables?.stories || 0)} itens
                        </p>
                      </div>
                    </div>

                    {/* Objetivos */}
                    {campaign.objectives?.primary && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Objetivo Principal</p>
                        <p className="text-sm text-gray-700">{campaign.objectives.primary}</p>
                      </div>
                    )}

                    {/* Resultados (se disponível) */}
                    {campaign.results && (campaign.results.total_reach > 0 || campaign.results.total_engagement > 0) && (
                      <div className="border-t pt-4 mt-4">
                        <p className="text-xs font-semibold text-gray-700 mb-3">Resultados</p>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Alcance</p>
                            <p className="font-medium text-gray-900">{campaign.results.total_reach.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Engajamento</p>
                            <p className="font-medium text-gray-900">{campaign.results.total_engagement.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">ROI</p>
                            <p className="font-medium text-gray-900">{campaign.results.roi}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

