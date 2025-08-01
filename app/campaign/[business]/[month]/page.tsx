'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';

interface LandingPageData {
  campaign: {
    id: string;
    title: string;
    status: string;
    month: string;
    monthYear: number;
    quantidadeCriadores: number;
    createdAt: string;
  };
  business: {
    id: string;
    name: string;
    category: string;
    currentPlan: string;
    commercial: string;
    whatsapp: string;
    email: string;
    city: string;
    state: string;
    responsavel: string;
    whatsappResponsavel: string;
  };
  creators: Array<{
    id: string;
    name: string;
    status: string;
    social_media: any;
    contact_info: any;
    profile_info: any;
    deliverables: any;
  }>;
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
  const [campaignData, setCampaignData] = useState<LandingPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const businessSlug = params.business as string;
  const monthSlug = params.month as string;

  useEffect(() => {
    loadCampaignData();
  }, [businessSlug, monthSlug]);

  const loadCampaignData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Carregando campanha:', { businessSlug, monthSlug });

      // Forçar revalidação sem cache
      const response = await fetch(`/api/campaign/${businessSlug}/${monthSlug}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const result = await response.json();

      if (result.success) {
        setCampaignData(result.data);
        console.log('✅ Dados carregados:', result.data);
      } else {
        setError(result.error || 'Campanha não encontrada');
        console.error('❌ Erro da API:', result.error);
      }
    } catch (err) {
      console.error('❌ Erro ao carregar campanha:', err);
      setError('Erro ao carregar dados da campanha');
    } finally {
      setIsLoading(false);
    }
  };

  const formatWhatsAppNumber = (number: string) => {
    if (!number) return '';
    // Remove caracteres não numéricos
    const cleaned = number.replace(/\D/g, '');
    // Adiciona código do país se não tiver
    if (cleaned.length === 11 && !cleaned.startsWith('55')) {
      return `55${cleaned}`;
    }
    return cleaned;
  };

  const openWhatsApp = () => {
    if (!campaignData?.business?.whatsappResponsavel) return;

    const whatsappNumber = formatWhatsAppNumber(campaignData.business.whatsappResponsavel);
    const message = encodeURIComponent(
      `Olá! Vim através da landing page da campanha ${campaignData.business.name} - ${campaignData.campaign.month}. Gostaria de saber mais informações sobre a campanha.`
    );

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativa':
      case 'ativo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'finalizada':
      case 'finalizado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando campanha...</p>
        </div>
      </div>
    );
  }

  if (error || !campaignData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campanha não encontrada</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            variant="primary"
            onClick={() => window.location.href = '/'}
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header - Material Design 3 */}
      <header className="bg-white shadow-sm" style={{ borderBottom: '1px solid #e0e0e0' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: '#00629B' }}
              >
                <span className="text-white font-medium text-xl">
                  {campaignData.business.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-medium text-gray-900 mb-1">
                  {campaignData.business.name}
                </h1>
                <p className="text-sm text-gray-600">
                  Campanha {campaignData.campaign.month} • {campaignData.campaign.quantidadeCriadores} criadores selecionados
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: campaignData.campaign.status.toLowerCase().includes('ativa') ? '#e8f5e8' : '#f3f4f6',
                  color: campaignData.campaign.status.toLowerCase().includes('ativa') ? '#2e7d32' : '#6b7280',
                  border: `1px solid ${campaignData.campaign.status.toLowerCase().includes('ativa') ? '#c8e6c9' : '#d1d5db'}`
                }}
              >
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={{
                    backgroundColor: campaignData.campaign.status.toLowerCase().includes('ativa') ? '#4caf50' : '#9ca3af'
                  }}
                />
                {campaignData.campaign.status}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Material Design 3 */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-light text-gray-900 mb-6" style={{ lineHeight: '1.2' }}>
            Campanha de Marketing Digital
          </h2>
          <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto" style={{ lineHeight: '1.6' }}>
            Acompanhe o progresso da sua campanha com {campaignData.campaign.quantidadeCriadores} criadores de conteúdo
            selecionados especialmente para potencializar o alcance do seu negócio.
          </p>

          {/* CTA Principal - Material Design 3 */}
          {campaignData.business?.whatsappResponsavel && (
            <div className="mb-16">
              <button
                onClick={openWhatsApp}
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: '#25D366',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#20BA5A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#25D366';
                }}
              >
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Entrar em Contato via WhatsApp
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Informações da Campanha - Material Design 3 */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-light text-gray-900 mb-12 text-center">
            Detalhes da Campanha
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Card Informações Gerais - Material Design 3 */}
            <div
              className="rounded-3xl p-8 shadow-sm border"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#e0e0e0'
              }}
            >
              <div className="flex items-center mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4"
                  style={{ backgroundColor: '#00629B' }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900">Informações Gerais</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Período</p>
                  <p className="text-lg text-gray-900">{campaignData.campaign.month}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                  <p className="text-lg text-gray-900">{campaignData.campaign.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Título da Campanha</p>
                  <p className="text-lg text-gray-900">{campaignData.campaign.title}</p>
                </div>
              </div>
            </div>

            {/* Card Criadores - Material Design 3 */}
            <div
              className="rounded-3xl p-8 shadow-sm border"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#e0e0e0'
              }}
            >
              <div className="flex items-center mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4"
                  style={{ backgroundColor: '#4CAF50' }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900">Criadores</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Quantidade Contratada</p>
                  <p className="text-lg text-gray-900">{campaignData.campaign.quantidadeCriadores} criadores</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Selecionados</p>
                  <p className="text-lg text-gray-900">{campaignData.creators.length} confirmados</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Briefings Completos</p>
                  <p className="text-lg text-gray-900">{campaignData.stats.completedBriefings} de {campaignData.creators.length}</p>
                </div>
              </div>
            </div>

            {/* Card Contato - Material Design 3 */}
            <div
              className="rounded-3xl p-8 shadow-sm border"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#e0e0e0'
              }}
            >
              <div className="flex items-center mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4"
                  style={{ backgroundColor: '#FF9800' }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h4 className="text-xl font-medium text-gray-900">Contato</h4>
              </div>
              <div className="space-y-4">
                {campaignData.business?.responsavel && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Responsável</p>
                    <p className="text-lg text-gray-900">{campaignData.business.responsavel}</p>
                  </div>
                )}
                {campaignData.business?.city && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Localização</p>
                    <p className="text-lg text-gray-900">{campaignData.business.city}, {campaignData.business.state}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Categoria</p>
                  <p className="text-lg text-gray-900">{campaignData.business.category}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Criadores Selecionados - Material Design 3 */}
      <section className="py-16 px-6" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-light text-gray-900 mb-12 text-center">
            Criadores Selecionados
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {campaignData.creators.map((creator, index) => (
              <div
                key={creator.id}
                className="bg-white rounded-3xl p-6 shadow-sm border hover:shadow-md transition-all duration-300"
                style={{ borderColor: '#e0e0e0' }}
              >
                <div className="flex items-center mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mr-4"
                    style={{
                      backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                    }}
                  >
                    <span className="text-white font-medium text-xl">
                      {creator.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-lg mb-1">{creator.name}</h4>
                    <p className="text-sm text-gray-600">
                      {creator.profile_info?.category || 'Criador de Conteúdo'}
                    </p>
                    {creator.social_media?.instagram?.followers && (
                      <p className="text-xs text-gray-500 mt-1">
                        {creator.social_media.instagram.followers.toLocaleString()} seguidores
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-sm" style={{ color: '#4CAF50' }}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {creator.deliverables?.visit_confirmed === 'Confirmada' ? 'Confirmado' : 'Selecionado'} para esta campanha
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Final - Material Design 3 */}
      <section
        className="py-20 px-6"
        style={{ backgroundColor: '#00629B' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-light text-white mb-6" style={{ lineHeight: '1.2' }}>
            Pronto para Impulsionar Seu Negócio?
          </h3>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto" style={{ lineHeight: '1.6' }}>
            Entre em contato conosco para saber mais detalhes sobre sua campanha
            ou para discutir novas oportunidades de marketing digital.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {campaignData.business?.whatsappResponsavel && (
              <button
                onClick={openWhatsApp}
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: '#25D366',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#20BA5A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#25D366';
                }}
              >
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                Falar no WhatsApp
              </button>
            )}

            <button
              onClick={() => window.location.href = '/campaigns'}
              className="inline-flex items-center px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              Ver Todas as Campanhas
            </button>
          </div>
        </div>
      </section>

      {/* Footer - Material Design 3 */}
      <footer
        className="py-12 px-6"
        style={{ backgroundColor: '#1a1a1a' }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4"
              style={{ backgroundColor: '#00629B' }}
            >
              <span className="text-white font-medium text-lg">C</span>
            </div>
            <span className="text-white font-medium text-xl">CRM crIAdores</span>
          </div>
          <p className="text-gray-400 text-base mb-4">
            Gestão Inteligente de Campanhas de Marketing Digital
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 CRM crIAdores. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
