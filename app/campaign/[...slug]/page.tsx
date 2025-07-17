'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCampaignBySeoUrl } from '@/lib/campaign-url-system';

interface CampaignData {
  campaign: {
    id: string;
    title: string;
    description?: string;
    month_year_id: number;
    month: string;
    status: string;
    budget: number;
    start_date?: string;
    end_date?: string;
    objectives?: any;
    deliverables?: any;
    briefing_details?: any;
    created_at: string;
    seo_url: string;
  };
  business: {
    id: string;
    name: string;
    contact_info?: any;
    address?: any;
  };
  stats: {
    totalCreators: number;
    confirmedCreators: number;
    completedBriefings: number;
    approvedVideos: number;
    postedVideos: number;
  };
}

export default function CampaignLandingPage() {
  const params = useParams();
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para formatar data
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não definida';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // Função para formatar moeda
  const formatCurrency = (value: number | null | undefined): string => {
    if (!value) return 'Não informado';

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar mês/ano
  const formatMonthYear = (monthYearId?: string | number) => {
    if (!monthYearId) return 'Não definido';
    const monthYear = monthYearId.toString();
    
    if (monthYear.length === 6) {
      const year = monthYear.substring(0, 4);
      const month = monthYear.substring(4, 6);
      
      const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      
      const monthIndex = parseInt(month) - 1;
      const monthName = months[monthIndex] || 'Mês inválido';
      
      return `${monthName} ${year}`;
    }
    
    return monthYear;
  };

  useEffect(() => {
    const loadCampaignData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!params.slug || !Array.isArray(params.slug)) {
          throw new Error('URL inválida');
        }

        const seoUrl = `/campaign/${params.slug.join('/')}`;
        console.log('🔍 [LANDING PAGE] Carregando URL:', seoUrl);

        const result = await getCampaignBySeoUrl(seoUrl);
        console.log('📊 [LANDING PAGE] Resultado da API:', result);

        if (!result.success) {
          throw new Error(result.error || 'Erro desconhecido');
        }

        setCampaignData(result.data);
        console.log('✅ [LANDING PAGE] Dados carregados:', result.data);

      } catch (err) {
        console.error('❌ [LANDING PAGE] Erro ao carregar:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      loadCampaignData();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando campanha...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campanha não encontrada</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  if (!campaignData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nenhum dado encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Premium Responsivo */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">

          {/* Layout Mobile */}
          <div className="block md:hidden space-y-4">
            {/* Logo crIAdores Mobile */}
            <div className="text-center">
              <span className="text-xl font-bold">
                cr<span className="text-blue-200">IA</span>dores
              </span>
            </div>

            {/* Banner Premium Mobile */}
            <div className="flex justify-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-lg blur-sm opacity-75"></div>
                <div className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white px-4 py-2 rounded-lg border border-gray-700 shadow-2xl">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Oportunidade Exclusiva
                    </span>
                    <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>

            {/* Título da Campanha Mobile */}
            <div className="text-center space-y-2">
              <h1 className="text-xl font-bold leading-tight">
                {campaignData.campaign.title}
              </h1>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm font-medium">
                  {campaignData.business.name}
                </p>
                <p className="text-blue-200 text-xs">
                  {campaignData.business.address?.city || campaignData.business.cidade || 'Cidade não informada'} • {formatMonthYear(campaignData.campaign.month)}
                </p>
              </div>
            </div>

            {/* Botão Aplicar-se Mobile */}
            <div className="px-4">
              <a
                href={`https://wa.me/5543991049779?text=${encodeURIComponent(`Olá! Me interessei pela campanha "${campaignData.campaign.title}" de ${formatMonthYear(campaignData.campaign.month)} do ${campaignData.business.name}. Gostaria de saber mais sobre como participar!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full px-6 py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all duration-200 active:scale-95"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.097"/>
                </svg>
                Aplicar-se via WhatsApp
              </a>
            </div>
          </div>

          {/* Layout Desktop */}
          <div className="hidden md:flex items-center justify-between">
            {/* Logo crIAdores */}
            <div className="flex items-center">
              <span className="text-2xl font-bold">
                cr<span className="text-blue-200">IA</span>dores
              </span>
            </div>

            {/* Informações da Campanha */}
            <div className="flex-1 text-center mx-8">
              <div className="mb-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-lg blur-sm opacity-75"></div>
                  <div className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900 text-white px-6 py-3 rounded-lg border border-gray-700 shadow-2xl">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Oportunidade Exclusiva para você crIAdor
                      </span>
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {campaignData.campaign.title}
              </h1>
              <p className="text-blue-100 text-lg">
                {campaignData.business.name} • {campaignData.business.address?.city || campaignData.business.cidade || 'Cidade não informada'} • {formatMonthYear(campaignData.campaign.month)}
              </p>
            </div>

            {/* Botão Aplicar-se */}
            <div>
              <a
                href={`https://wa.me/5543991049779?text=${encodeURIComponent(`Olá! Me interessei pela campanha "${campaignData.campaign.title}" de ${formatMonthYear(campaignData.campaign.month)} do ${campaignData.business.name}. Gostaria de saber mais sobre como participar!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.097"/>
                </svg>
                Aplique-se
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Barra de Informações Compacta */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-8">
            {/* Links do Business */}
            {campaignData.business.contact_info?.instagram && (
              <a
                href={`https://instagram.com/${campaignData.business.contact_info.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-200"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @{campaignData.business.contact_info.instagram.replace('@', '')}
              </a>
            )}

            {campaignData.business.contact_info?.website && (
              <a
                href={campaignData.business.contact_info.website.startsWith('http') ? campaignData.business.contact_info.website : `https://${campaignData.business.contact_info.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                Website
              </a>
            )}

            {/* Estatística de Criadores */}
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
              <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-800">
                {campaignData.stats.totalCreators} criadores
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações Gerais da Campanha */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">

          {/* Informações Básicas */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Informações Gerais
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Descrição</label>
                <p className="text-gray-900 mt-1">{campaignData.campaign.description || 'Não informada'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Início</label>
                  <p className="text-gray-900 mt-1">{formatDate(campaignData.campaign.start_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Fim</label>
                  <p className="text-gray-900 mt-1">{formatDate(campaignData.campaign.end_date)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Orçamento</label>
                <p className="text-gray-900 mt-1">{formatCurrency(campaignData.campaign.budget)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Quantidade de Criadores</label>
                <p className="text-gray-900 mt-1">{campaignData.stats.totalCreators}</p>
              </div>
            </div>
          </div>

          {/* Objetivos */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Objetivos
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Objetivo Principal</label>
                <p className="text-gray-900 mt-1">{campaignData.campaign.objectives?.primary || 'Não definido'}</p>
              </div>
              {campaignData.campaign.objectives?.secondary && campaignData.campaign.objectives.secondary.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Objetivos Secundários</label>
                  <ul className="mt-1 space-y-1">
                    {campaignData.campaign.objectives.secondary.map((objective: string, index: number) => (
                      <li key={index} className="text-gray-900 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Entregáveis */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4 flex items-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Entregáveis
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Posts</label>
                  <p className="text-gray-900 mt-1">{campaignData.campaign.deliverables?.posts || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stories</label>
                  <p className="text-gray-900 mt-1">{campaignData.campaign.deliverables?.stories || 0}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Reels</label>
                <p className="text-gray-900 mt-1">{campaignData.campaign.deliverables?.reels || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Briefing Detalhado */}
      {campaignData.campaign.briefing_details && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center">
              <svg className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Briefing Detalhado
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              {/* Formatos e Perfil */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
                  </svg>
                  Formatos e Perfil
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Formatos</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {campaignData.campaign.briefing_details.formatos && campaignData.campaign.briefing_details.formatos.length > 0 ? (
                        campaignData.campaign.briefing_details.formatos.map((formato: string, index: number) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                            {formato}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-900">Não especificados</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Perfil do Criador</label>
                    <p className="text-gray-900 mt-1">{campaignData.campaign.briefing_details.perfil_criador || 'Não especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Comunicação Secundária</label>
                    <p className="text-gray-900 mt-1">{campaignData.campaign.briefing_details.comunicacao_secundaria || 'Não especificada'}</p>
                  </div>
                </div>
              </div>

              {/* Datas de Gravação */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Datas de Gravação
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data de Início</label>
                      <p className="text-gray-900 mt-1">{formatDate(campaignData.campaign.briefing_details.datas_gravacao?.inicio)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data de Fim</label>
                      <p className="text-gray-900 mt-1">{formatDate(campaignData.campaign.briefing_details.datas_gravacao?.fim)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Observações</label>
                    <p className="text-gray-900 mt-1">{campaignData.campaign.briefing_details.datas_gravacao?.observacoes || 'Nenhuma observação'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Roteiro do Vídeo */}
            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Roteiro do Vídeo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">O que precisa ser falado no vídeo</label>
                  <p className="text-gray-900 mt-1">{campaignData.campaign.briefing_details.roteiro?.conteudo || 'Não especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">História</label>
                  <p className="text-gray-900 mt-1">{campaignData.campaign.briefing_details.roteiro?.historia || 'Não especificada'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Promoção/CTA</label>
                  <p className="text-gray-900 mt-1">{campaignData.campaign.briefing_details.roteiro?.promocao_cta || 'Não especificado'}</p>
                </div>
              </div>
            </div>

            {/* Requisitos Técnicos */}
            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Requisitos Técnicos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Duração do Vídeo</label>
                  <p className="text-gray-900 mt-1">{campaignData.campaign.briefing_details.requisitos_tecnicos?.duracao_video || 'Não especificada'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Qualidade</label>
                  <p className="text-gray-900 mt-1">{campaignData.campaign.briefing_details.requisitos_tecnicos?.qualidade || 'Não especificada'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Formato de Entrega</label>
                  <p className="text-gray-900 mt-1">{campaignData.campaign.briefing_details.requisitos_tecnicos?.formato_entrega || 'Não especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hashtags Obrigatórias</label>
                  <div className="mt-1">
                    {campaignData.campaign.briefing_details.requisitos_tecnicos?.hashtags_obrigatorias && campaignData.campaign.briefing_details.requisitos_tecnicos.hashtags_obrigatorias.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {campaignData.campaign.briefing_details.requisitos_tecnicos.hashtags_obrigatorias.map((hashtag: string, index: number) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            #{hashtag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-900">Nenhuma hashtag obrigatória</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer Premium */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Logo crIAdores Grande */}
            <div className="mb-6">
              <h2 className="text-4xl font-bold">
                cr<span className="text-blue-400">IA</span>dores
              </h2>
              <p className="text-blue-200 mt-2 text-lg">Conectando negócios locais com criadores locais</p>
            </div>
            
            {/* Informações da Campanha */}
            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-300">
                Criada em: {formatDate(campaignData.campaign.created_at)}
              </p>
              <p className="text-xs mt-2 text-gray-400">
                Powered by crIAdores © 2025
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
