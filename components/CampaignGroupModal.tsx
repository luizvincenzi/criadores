'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import CreatorAdvancedCard from '@/components/CreatorAdvancedCard';
import CampaignSharePanel from '@/components/CampaignSharePanel';

// Tipo para dados agrupados de campanhas
interface GroupedCampaignData {
  businessName: string;
  businessId: string;
  month: string;
  monthYearId?: number; // 🎯 ID único do mês/ano (ex: 202507)
  campaigns: any[];
  criadores: string[];
  totalCreators: number;
  status: string;
  mes?: string; // Para compatibilidade
  campanhas?: any[]; // Para compatibilidade
  quantidadeCriadores?: number; // Para compatibilidade
  totalCampanhas?: number; // Para compatibilidade
  // Novos campos para identificação única
  campaignId?: string; // UUID único da campanha principal
  primaryCampaignId?: string; // Para compatibilidade
}

interface CampaignGroupModalProps {
  campaignGroup: GroupedCampaignData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CampaignGroupModal({ campaignGroup, isOpen, onClose }: CampaignGroupModalProps) {
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [campaignUrl, setCampaignUrl] = useState<string | null>(null);
  const [landingPageGenerated, setLandingPageGenerated] = useState(false);
  const [creatorsData, setCreatorsData] = useState<any[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(false);
  const [expandedCreators, setExpandedCreators] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});
  const [businessData, setBusinessData] = useState<any>(null);

  // Função para formatar data no padrão "Jun 25"
  const formatMonthYearShort = (monthKey: string) => {
    // Se for formato YYYYMM (ex: 202507)
    if (monthKey && monthKey.length === 6 && /^\d{6}$/.test(monthKey)) {
      const year = monthKey.substring(0, 4);
      const month = monthKey.substring(4, 6);

      const monthNames = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];

      const monthIndex = parseInt(month) - 1;
      const shortYear = year.substring(2, 4);

      if (monthIndex >= 0 && monthIndex < 12) {
        return `${monthNames[monthIndex]} ${shortYear}`;
      }
    }

    // Se for formato "2025-07"
    if (monthKey && monthKey.includes('-') && monthKey.length === 7) {
      const [year, month] = monthKey.split('-');
      const monthNames = [
        'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
        'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
      ];

      const monthIndex = parseInt(month) - 1;
      const shortYear = year.substring(2, 4);

      if (monthIndex >= 0 && monthIndex < 12) {
        return `${monthNames[monthIndex]} ${shortYear}`;
      }
    }

    // Fallback para outros formatos
    return monthKey;
  };

  useEffect(() => {
    if (isOpen && campaignGroup) {
      loadCreatorsData();
      loadCampaignData();
      loadBusinessData();
      // Gerar landing page automaticamente quando abrir o modal
      generateLandingPageAutomatically();
    }
  }, [isOpen, campaignGroup]);

  // Gerar landing page automaticamente quando fechar o modal
  useEffect(() => {
    if (!isOpen && campaignGroup && landingPageGenerated) {
      console.log('🔄 [AUTO GENERATION] Modal fechado, landing page já foi gerada');
    }
  }, [isOpen]);

  const loadCampaignData = async () => {
    if (!campaignGroup) return;

    try {
      // 🎯 USAR UUID ÚNICO DA CAMPANHA para busca precisa
      const campaignId = campaignGroup.campaignId || campaignGroup.primaryCampaignId ||
                        (campaignGroup.campaigns && campaignGroup.campaigns[0]?.campaignId);

      const monthYearId = campaignGroup.monthYearId;
      const businessId = campaignGroup.businessId;

      console.log('🔍 [MODAL DEBUG] Carregando dados da campanha:', {
        campaignId,
        monthYearId,
        businessId,
        businessName: campaignGroup.businessName,
        month: campaignGroup.mes || campaignGroup.month,
        method: campaignId ? 'UUID_SPECIFIC' : monthYearId ? 'MONTH_YEAR_ID' : 'FALLBACK_BUSINESS_MONTH'
      });

      let response;

      if (campaignId) {
        // 🎯 BUSCA MAIS PRECISA: Usar UUID específico da campanha
        response = await fetch(`/api/supabase/campaigns?campaignId=${encodeURIComponent(campaignId)}`);
        console.log('✅ [MODAL DEBUG] Usando busca por UUID específico:', campaignId);
      } else if (businessId && monthYearId) {
        // 🎯 BUSCA PRECISA: Usar business_id + month_year_id
        response = await fetch(`/api/supabase/campaigns?business_id=${encodeURIComponent(businessId)}&monthYearId=${encodeURIComponent(monthYearId)}`);
        console.log('✅ [MODAL DEBUG] Usando busca por business_id + month_year_id:', { businessId, monthYearId });
      } else {
        // 🔄 FALLBACK: Usar businessName + month (método antigo)
        response = await fetch(`/api/supabase/campaigns?businessName=${encodeURIComponent(campaignGroup.businessName)}&month=${encodeURIComponent(campaignGroup.mes || campaignGroup.month)}`);
        console.log('⚠️ [MODAL DEBUG] Usando busca por businessName + month (fallback)');
      }

      const result = await response.json();

      console.log('📊 [MODAL DEBUG] Resultado da API:', result);

      if (result.success && result.data && result.data.length > 0) {
        const campaign = result.data[0]; // Primeira campanha do grupo
        console.log('📋 [MODAL DEBUG] Dados da campanha encontrada:', campaign);

        const formData = {
          title: campaign.title || campaign.nome || '',
          description: campaign.description || campaign.descricao || '',
          budget: campaign.budget || campaign.orcamento || 0,
          objectives: campaign.objectives?.primary || campaign.objetivos?.primary || '',
          comunicacaoSecundaria: campaign.objectives?.secondary?.[0] || campaign.briefing_details?.comunicacao_secundaria || '',
          formatos: campaign.briefing_details?.formatos || [],
          perfilCriador: campaign.briefing_details?.perfil_criador || '',
          datasGravacao: {
            dataInicio: campaign.briefing_details?.datas_gravacao?.data_inicio || '',
            dataFim: campaign.briefing_details?.datas_gravacao?.data_fim || '',
            horariosPreferenciais: campaign.briefing_details?.datas_gravacao?.horarios_preferenciais || [],
            observacoes: campaign.briefing_details?.datas_gravacao?.observacoes || ''
          },
          roteiroVideo: {
            oQueFalar: campaign.briefing_details?.roteiro_video?.o_que_falar || '',
            historia: campaign.briefing_details?.roteiro_video?.historia || '',
            promocaoCta: campaign.briefing_details?.roteiro_video?.promocao_cta || ''
          },
          deliverables: campaign.deliverables || campaign.entregaveis || { posts: 1, stories: 3, reels: 1 }
        };

        console.log('📝 [MODAL DEBUG] Dados do formulário preparados:', formData);
        setEditFormData(formData);
      } else {
        console.warn('⚠️ [MODAL DEBUG] Nenhuma campanha encontrada ou erro na API:', result);
      }
    } catch (error) {
      console.error('❌ [MODAL DEBUG] Erro ao carregar dados da campanha:', error);
    }
  };

  const loadBusinessData = async () => {
    if (!campaignGroup) return;

    try {
      console.log('🏢 [MODAL DEBUG] Carregando dados da empresa:', {
        businessName: campaignGroup.businessName,
        businessId: campaignGroup.businessId,
        campaignGroupKeys: Object.keys(campaignGroup)
      });

      // Buscar dados da empresa sempre por ID
      if (!campaignGroup.businessId) {
        console.warn('⚠️ [MODAL DEBUG] businessId não disponível no campaignGroup');
        console.log('📋 [MODAL DEBUG] campaignGroup completo:', campaignGroup);
        return;
      }

      const response = await fetch(`/api/supabase/businesses?id=${encodeURIComponent(campaignGroup.businessId)}`);
      console.log('✅ [MODAL DEBUG] Fazendo busca por ID da empresa:', campaignGroup.businessId);
      console.log('🌐 [MODAL DEBUG] URL da requisição:', `/api/supabase/businesses?id=${encodeURIComponent(campaignGroup.businessId)}`);

      if (response.ok) {
        const data = await response.json();
        console.log('📡 [MODAL DEBUG] Resposta da API businesses:', {
          success: data.success,
          dataLength: data.data?.length,
          error: data.error
        });

        if (data.success && data.data && data.data.length > 0) {
          const business = data.data[0];
          console.log('🏢 [MODAL DEBUG] Dados da empresa encontrados:', {
            id: business.id,
            name: business.name,
            apresentacao_empresa_preview: business.apresentacao_empresa?.substring(0, 100) + '...',
            apresentacao_empresa_full: business.apresentacao_empresa
          });

          console.log('💾 [MODAL DEBUG] Definindo businessData no estado...');
          setBusinessData(business);

          // Verificar se foi definido corretamente
          setTimeout(() => {
            console.log('🔍 [MODAL DEBUG] Estado businessData após definir:', businessData);
          }, 100);
        } else {
          console.warn('⚠️ [MODAL DEBUG] Nenhuma empresa encontrada na resposta da API');
        }
      } else {
        console.error('❌ [MODAL DEBUG] Erro na resposta da API:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ [MODAL DEBUG] Erro ao carregar dados da empresa:', error);
    }
  };

  const loadCreatorsData = async () => {
    if (!campaignGroup) return;

    try {
      setIsLoadingCreators(true);

      // Buscar dados detalhados dos criadores via API
      const response = await fetch(`/api/supabase/creator-slots?businessName=${encodeURIComponent(campaignGroup.businessName)}&mes=${encodeURIComponent(campaignGroup.mes || campaignGroup.month)}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.slots) {
          setCreatorsData(data.slots.filter((slot: any) => slot.influenciador && slot.influenciador.trim() !== ''));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos criadores:', error);
    } finally {
      setIsLoadingCreators(false);
    }
  };

  const saveCampaignData = async () => {
    if (!campaignGroup) return;

    try {
      // 🎯 USAR IDs ÚNICOS para atualização precisa
      const campaignId = campaignGroup.campaignId || campaignGroup.primaryCampaignId ||
                        (campaignGroup.campaigns && campaignGroup.campaigns[0]?.campaignId);

      const updateData = {
        // Priorizar UUID específico da campanha
        id: campaignId,
        // Fallback para business + month se não tiver campaignId
        businessName: campaignGroup.businessName,
        month: campaignGroup.mes || campaignGroup.month,
        monthYearId: campaignGroup.monthYearId,
        businessId: campaignGroup.businessId,
        ...editFormData
      };

      console.log('💾 [MODAL DEBUG] Salvando dados da campanha:', updateData);

      const response = await fetch('/api/supabase/campaigns', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log('📤 [MODAL DEBUG] Resposta da API PUT:', result);

      if (result.success) {
        console.log('✅ [MODAL DEBUG] Campanha atualizada com sucesso');
        setIsEditMode(false);
        // Recarregar dados
        loadCampaignData();
      } else {
        console.error('❌ [MODAL DEBUG] Erro ao salvar campanha:', result.error);
        alert(`Erro ao salvar: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ [MODAL DEBUG] Erro ao salvar campanha:', error);
      alert(`Erro ao salvar: ${error.message}`);
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // Cancelar edição - recarregar dados originais
      loadCampaignData();
    }
    setIsEditMode(!isEditMode);
  };

  const toggleCreatorExpansion = (creatorId: string) => {
    const newExpanded = new Set(expandedCreators);
    if (newExpanded.has(creatorId)) {
      newExpanded.delete(creatorId);
    } else {
      newExpanded.add(creatorId);
    }
    setExpandedCreators(newExpanded);
  };

  if (!isOpen || !campaignGroup) {
    return null;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativa':
      case 'ativo':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pausada':
      case 'pausado':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'finalizada':
      case 'finalizado':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelada':
      case 'cancelado':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'planejamento':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativa':
      case 'ativo':
        return '🟢';
      case 'pausada':
      case 'pausado':
        return '⏸️';
      case 'finalizada':
      case 'finalizado':
        return '✅';
      case 'cancelada':
      case 'cancelado':
        return '❌';
      case 'planejamento':
        return '📋';
      default:
        return '📄';
    }
  };

  const generateLandingPageAutomatically = async () => {
    try {
      console.log('🚀 [AUTO GENERATION] Gerando landing page automaticamente para:', {
        businessName: campaignGroup.businessName,
        month: campaignGroup.mes
      });

      // Gerar URL SEO-friendly
      const businessSlug = campaignGroup.businessName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim();

      // Converter month para formato legível
      let monthYear: string;
      if (typeof campaignGroup.mes === 'string') {
        if (campaignGroup.mes.includes(' ')) {
          const [monthName, year] = campaignGroup.mes.split(' ');
          const fullYear = year.length === 2 ? `20${year}` : year;
          monthYear = `${monthName.toLowerCase()}-${fullYear}`;
        } else if (/^\d{6}$/.test(campaignGroup.mes)) {
          const year = Math.floor(parseInt(campaignGroup.mes) / 100);
          const monthNum = parseInt(campaignGroup.mes) % 100;

          const monthNames = [
            '', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
            'jul', 'ago', 'set', 'out', 'nov', 'dez'
          ];

          monthYear = `${monthNames[monthNum]}-${year}`;
        } else {
          monthYear = campaignGroup.mes.toLowerCase();
        }
      } else {
        monthYear = 'unknown';
      }

      const seoUrl = `/campaign/${businessSlug}-${monthYear}`;
      const fullUrl = `${window.location.origin}${seoUrl}`;

      // Testar se a URL funciona
      const testResponse = await fetch(`/api/campaign-seo?url=${encodeURIComponent(seoUrl)}`);
      const testResult = await testResponse.json();

      if (testResult.success) {
        setCampaignUrl(fullUrl);
        setLandingPageGenerated(true);
        console.log('✅ [AUTO GENERATION] Landing page gerada automaticamente:', fullUrl);
        return fullUrl;
      } else {
        console.error('❌ [AUTO GENERATION] Erro na geração automática:', testResult.error);
        return null;
      }
    } catch (error) {
      console.error('❌ [AUTO GENERATION] Erro geral:', error);
      return null;
    }
  };

  const generateCampaignUrl = async () => {
    try {
      setIsGeneratingUrl(true);

      console.log('🔗 Gerando URL para campanha:', {
        businessName: campaignGroup.businessName,
        month: campaignGroup.mes,
        campaignId: campaignGroup.slots?.[0]?.campaign_id
      });

      const response = await fetch('/api/generate-campaign-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: campaignGroup.businessName,
          month: campaignGroup.mes,
          campaignId: campaignGroup.slots?.[0]?.campaign_id // Incluir ID da campanha para validação
        })
      });

      const result = await response.json();

      if (result.success) {
        setCampaignUrl(result.data.campaignUrl);

        // Testar se a URL funciona antes de confirmar
        try {
          const testResponse = await fetch(`/api/campaign/${result.data.businessSlug}/${result.data.monthSlug}`);
          const testResult = await testResponse.json();

          if (testResult.success) {
            // Copiar URL para clipboard
            await navigator.clipboard.writeText(result.data.campaignUrl);
            alert(`✅ URL da landing page gerada e validada!\n\nURL: ${result.data.campaignUrl}\n\n(Copiada para a área de transferência)`);
          } else {
            alert(`⚠️ URL gerada mas com problemas:\n\nURL: ${result.data.campaignUrl}\nErro: ${testResult.error}\n\nVerifique se a campanha está configurada corretamente.`);
          }
        } catch (testError) {
          alert(`⚠️ URL gerada mas não foi possível validar:\n\nURL: ${result.data.campaignUrl}\n\nTeste manualmente se necessário.`);
        }
      } else {
        alert('❌ Erro ao gerar URL: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Erro ao gerar URL:', error);
      alert('❌ Erro ao gerar URL da campanha');
    } finally {
      setIsGeneratingUrl(false);
    }
  };

  const openLandingPage = async () => {
    try {
      console.log('🔗 Abrindo landing page para:', {
        businessName: campaignGroup.businessName,
        month: campaignGroup.mes
      });

      // Usar a mesma lógica da API para gerar URL
      const businessSlug = campaignGroup.businessName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
        .trim();

      // Converter month para formato SEO-friendly (ex: jul-2025)
      let monthYear: string;
      if (typeof campaignGroup.mes === 'string') {
        if (campaignGroup.mes.includes(' ')) {
          // Formato "jul 25" -> "jul-2025"
          const [monthName, year] = campaignGroup.mes.split(' ');
          const fullYear = year.length === 2 ? `20${year}` : year;
          monthYear = `${monthName.toLowerCase()}-${fullYear}`;
        } else if (/^\d{6}$/.test(campaignGroup.mes)) {
          // Formato "202507" -> "jul-2025"
          const year = Math.floor(parseInt(campaignGroup.mes) / 100);
          const month = parseInt(campaignGroup.mes) % 100;

          const monthNames = [
            '', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
            'jul', 'ago', 'set', 'out', 'nov', 'dez'
          ];

          monthYear = `${monthNames[month]}-${year}`;
        } else {
          monthYear = campaignGroup.mes.toLowerCase();
        }
      } else {
        monthYear = 'unknown';
      }

      // URL SEO-friendly
      const seoUrl = `/campaign/${businessSlug}-${monthYear}`;

      console.log('🚀 [HYBRID SYSTEM] URL SEO gerada:', seoUrl);

      // Testar se a URL funciona usando API SEO
      const testResponse = await fetch(`/api/campaign-seo?url=${encodeURIComponent(seoUrl)}`);
      const testResult = await testResponse.json();

      if (testResult.success) {
        window.open(seoUrl, '_blank');
        console.log('✅ [HYBRID SYSTEM] Landing page aberta com sucesso');
      } else {
        console.error('❌ [HYBRID SYSTEM] Erro na API SEO:', testResult.error);

        // Fallback para sistema antigo
        console.log('🔄 [FALLBACK] Tentando sistema antigo...');

        let monthSlug = campaignGroup.mes;
        if (typeof monthSlug === 'string') {
          if (monthSlug.includes(' ')) {
            const [monthName, year] = monthSlug.split(' ');
            const monthMap: { [key: string]: string } = {
              'jan': '01', 'fev': '02', 'mar': '03', 'abr': '04',
              'mai': '05', 'jun': '06', 'jul': '07', 'ago': '08',
              'set': '09', 'out': '10', 'nov': '11', 'dez': '12'
            };
            const monthNum = monthMap[monthName.toLowerCase()] || '01';
            const fullYear = year.length === 2 ? `20${year}` : year;
            monthSlug = `${fullYear}${monthNum}`;
          } else {
            monthSlug = monthSlug.replace(/[^0-9]/g, '');
          }
        }

        const fallbackUrl = `/campaign/${businessSlug}/${monthSlug}`;
        const fallbackResponse = await fetch(`/api/campaign/${businessSlug}/${monthSlug}`);
        const fallbackResult = await fallbackResponse.json();

        if (fallbackResult.success) {
          window.open(fallbackUrl, '_blank');
          console.log('✅ [FALLBACK] Landing page aberta com sistema antigo');
        } else {
          alert(`❌ Erro ao abrir landing page:\n\nSistema SEO: ${testResult.error}\nSistema Antigo: ${fallbackResult.error}\n\nURL SEO: ${seoUrl}\nURL Antiga: ${fallbackUrl}`);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao abrir landing page:', error);
      alert('❌ Erro ao abrir landing page');
    }
  };

  const shareCampaign = async () => {
    try {
      const response = await fetch('/api/generate-campaign-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: campaignGroup.businessName,
          month: campaignGroup.mes
        })
      });

      const result = await response.json();

      if (result.success) {
        window.open(result.data.shareUrls.whatsapp, '_blank');
      } else {
        alert('Erro ao gerar link de compartilhamento: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      alert('Erro ao compartilhar campanha');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container - Material Design 3 */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[95vh] overflow-hidden"
          style={{ backgroundColor: '#ffffff' }}
        >

          {/* Header Premium */}
          <div
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8"
            style={{ borderBottom: '1px solid #e0e0e0' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-light text-white mb-3">
                  {campaignGroup.businessName}
                </h2>
                <div className="flex items-center space-x-6 text-blue-100">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatMonthYearShort(campaignGroup.mes || campaignGroup.month || '') || 'N/A'}
                  </span>
                  <div
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm"
                    style={{
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-2 bg-green-400"
                    />
                    {campaignGroup.status}
                  </div>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {campaignGroup.quantidadeCriadores || campaignGroup.totalCreators || (campaignGroup.criadores || []).length || 0} criadores contratados
                  </span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {campaignGroup.totalCampanhas || (campaignGroup.campanhas || campaignGroup.campaigns || []).length || 0} campanhas
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/10 rounded-full transition-colors"
                style={{ backgroundColor: 'transparent' }}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(95vh-200px)] overflow-y-auto">

            {/* Painel de Compartilhamento e Landing Page */}
            <div className="mb-8">
              <CampaignSharePanel
                businessName={campaignGroup.businessName}
                month={campaignGroup.mes || campaignGroup.month}
                campaignUrl={campaignUrl || undefined}
                onUrlGenerated={setCampaignUrl}
              />
            </div>

            {/* Seção: Comunicação para Criador */}
            <div className="mb-8">
              <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
                <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Comunicação para Criador
                    </h3>

                    {/* Botões de Ação */}
                    <div className="flex items-center space-x-3">
                      {!isEditMode ? (
                        <button
                          onClick={toggleEditMode}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <span>Editar</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={saveCampaignData}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Salvar</span>
                          </button>
                          <button
                            onClick={toggleEditMode}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Cancelar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Informações Básicas para Criador */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título da Campanha
                      </label>
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editFormData.title || ''}
                          onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Digite o título da campanha"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {editFormData.title || 'Inauguração Conveniência'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Permuta
                      </label>
                      {isEditMode ? (
                        <input
                          type="number"
                          value={editFormData.budget || ''}
                          onChange={(e) => setEditFormData({...editFormData, budget: parseFloat(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          R$ {(editFormData.budget || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição da Campanha
                    </label>
                    {isEditMode ? (
                      <textarea
                        value={editFormData.description || ''}
                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Descreva os objetivos e detalhes da campanha"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[80px]">
                        {editFormData.description || 'Não informado'}
                      </p>
                    )}
                  </div>

                  {/* Objetivos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Objetivo Principal
                      </label>
                      {isEditMode ? (
                        <textarea
                          value={editFormData.objectives || ''}
                          onChange={(e) => setEditFormData({...editFormData, objectives: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Qual o principal objetivo desta campanha?"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[80px]">
                          {editFormData.objectives || 'Não informado'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comunicação Secundária
                      </label>
                      {isEditMode ? (
                        <textarea
                          value={editFormData.comunicacaoSecundaria || ''}
                          onChange={(e) => setEditFormData({...editFormData, comunicacaoSecundaria: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Mensagens secundárias ou complementares"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[80px]">
                          {editFormData.comunicacaoSecundaria || 'Não informado'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Formatos e Perfil do Criador */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Formatos de Conteúdo
                      </label>
                      {isEditMode ? (
                        <div className="space-y-2">
                          {['Posts', 'Stories', 'Reels', 'IGTV', 'TikTok'].map((formato) => (
                            <label key={formato} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={(editFormData.formatos || []).includes(formato)}
                                onChange={(e) => {
                                  const formatos = editFormData.formatos || [];
                                  if (e.target.checked) {
                                    setEditFormData({...editFormData, formatos: [...formatos, formato]});
                                  } else {
                                    setEditFormData({...editFormData, formatos: formatos.filter(f => f !== formato)});
                                  }
                                }}
                                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{formato}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                          {(editFormData.formatos || []).join(', ') || 'Não informado'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Perfil do Criador
                      </label>
                      {isEditMode ? (
                        <textarea
                          value={editFormData.perfilCriador || ''}
                          onChange={(e) => setEditFormData({...editFormData, perfilCriador: e.target.value})}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Descreva o perfil ideal do criador para esta campanha"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[100px]">
                          {editFormData.perfilCriador || 'Não informado'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Apresentação da Empresa */}
                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <label className="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                      Apresentação da Empresa
                    </label>
                    <p className="text-sm text-gray-900 font-medium">
                      {(() => {
                        const apresentacao = businessData?.apresentacao_empresa ||
                                            businessData?.custom_fields?.apresentacaoEmpresa ||
                                            'Não informado';

                        console.log('🎨 [MODAL DEBUG] Renderizando apresentação da empresa:', {
                          businessData: !!businessData,
                          apresentacao_empresa: businessData?.apresentacao_empresa?.substring(0, 50) + '...',
                          custom_fields: businessData?.custom_fields?.apresentacaoEmpresa?.substring(0, 50) + '...',
                          resultado_final: apresentacao.substring(0, 50) + '...'
                        });

                        return apresentacao;
                      })()}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Para editar a apresentação da empresa, acesse a aba <strong>Empresas</strong>
                    </p>
                  </div>

                  {/* Datas de Gravação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Datas e Horários para Gravação
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Data de Início
                          </label>
                          {isEditMode ? (
                            <input
                              type="date"
                              value={editFormData.datasGravacao?.dataInicio || ''}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                datasGravacao: {...(editFormData.datasGravacao || {}), dataInicio: e.target.value}
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                              {editFormData.datasGravacao?.dataInicio || 'Não informado'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Data de Fim
                          </label>
                          {isEditMode ? (
                            <input
                              type="date"
                              value={editFormData.datasGravacao?.dataFim || ''}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                datasGravacao: {...(editFormData.datasGravacao || {}), dataFim: e.target.value}
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                              {editFormData.datasGravacao?.dataFim || 'Não informado'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Observações sobre Datas
                        </label>
                        {isEditMode ? (
                          <textarea
                            value={editFormData.datasGravacao?.observacoes || ''}
                            onChange={(e) => setEditFormData({
                              ...editFormData,
                              datasGravacao: {...(editFormData.datasGravacao || {}), observacoes: e.target.value}
                            })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Observações sobre horários preferenciais, restrições, etc."
                          />
                        ) : (
                          <p className="text-gray-900 bg-white px-3 py-2 rounded border min-h-[60px]">
                            {editFormData.datasGravacao?.observacoes || 'Não informado'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção: Comunicação Interna */}
            <div className="mb-8">
              <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
                <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                  <h3 className="text-lg font-semibold text-green-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Comunicação Interna
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  {/* O que precisa ser falado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      O que precisa ser falado no vídeo
                    </label>
                    {isEditMode ? (
                      <textarea
                        value={editFormData.roteiroVideo?.oQueFalar || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          roteiroVideo: {...(editFormData.roteiroVideo || {}), oQueFalar: e.target.value}
                        })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Descreva os pontos principais que devem ser abordados no vídeo"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[100px]">
                        {editFormData.roteiroVideo?.oQueFalar || 'Não informado'}
                      </p>
                    )}
                  </div>

                  {/* História */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      História / Narrativa
                    </label>
                    {isEditMode ? (
                      <textarea
                        value={editFormData.roteiroVideo?.historia || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          roteiroVideo: {...(editFormData.roteiroVideo || {}), historia: e.target.value}
                        })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Conte a história ou narrativa que deve ser seguida"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[100px]">
                        {editFormData.roteiroVideo?.historia || 'Não informado'}
                      </p>
                    )}
                  </div>

                  {/* Promoção / CTA */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Promoção / Call to Action
                    </label>
                    {isEditMode ? (
                      <textarea
                        value={editFormData.roteiroVideo?.promocaoCta || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          roteiroVideo: {...(editFormData.roteiroVideo || {}), promocaoCta: e.target.value}
                        })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Descreva a promoção ou call to action que deve ser incluído"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg min-h-[80px]">
                        {editFormData.roteiroVideo?.promocaoCta || 'Não informado'}
                      </p>
                    )}
                  </div>

                  {/* Entregáveis */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Entregáveis
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Posts
                          </label>
                          {isEditMode ? (
                            <input
                              type="number"
                              min="0"
                              value={editFormData.deliverables?.posts || 0}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                deliverables: {...(editFormData.deliverables || {}), posts: parseInt(e.target.value) || 0}
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                              {editFormData.deliverables?.posts || 0}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Stories
                          </label>
                          {isEditMode ? (
                            <input
                              type="number"
                              min="0"
                              value={editFormData.deliverables?.stories || 0}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                deliverables: {...(editFormData.deliverables || {}), stories: parseInt(e.target.value) || 0}
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                              {editFormData.deliverables?.stories || 0}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Reels
                          </label>
                          {isEditMode ? (
                            <input
                              type="number"
                              min="0"
                              value={editFormData.deliverables?.reels || 0}
                              onChange={(e) => setEditFormData({
                                ...editFormData,
                                deliverables: {...(editFormData.deliverables || {}), reels: parseInt(e.target.value) || 0}
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                              {editFormData.deliverables?.reels || 0}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Gestão de Criadores */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Criadores - Informações Parciais
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          {creatorsData.length}
                        </span>
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Para gestão completa dos criadores, acesse a aba <strong>Jornada</strong>
                      </p>
                    </div>

                    {isLoadingCreators && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Carregando dados...
                      </div>
                    )}
                  </div>

                  {creatorsData.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {creatorsData.map((creatorSlot, index) => {
                        // Simular dados do criador baseado no que temos
                        const mockCreatorData = {
                          id: creatorSlot.creatorId || `creator-${index}`,
                          name: creatorSlot.influenciador,
                          social_media: {
                            instagram: {
                              username: creatorSlot.influenciador.toLowerCase().replace(/\s+/g, ''),
                              followers: Math.floor(Math.random() * 100000) + 10000, // Mock data
                              engagement_rate: Math.random() * 5 + 2,
                              verified: Math.random() > 0.7
                            },
                            tiktok: {
                              username: creatorSlot.influenciador.toLowerCase().replace(/\s+/g, ''),
                              followers: Math.floor(Math.random() * 50000) + 5000
                            }
                          },
                          contact_info: {
                            whatsapp: '5511999999999', // Mock data
                            email: `${creatorSlot.influenciador.toLowerCase().replace(/\s+/g, '')}@email.com`
                          },
                          profile_info: {
                            category: 'Lifestyle',
                            location: {
                              city: 'São Paulo',
                              state: 'SP'
                            },
                            rates: {
                              post: 500,
                              story: 200,
                              reel: 800
                            }
                          },
                          performance_metrics: {
                            total_campaigns: Math.floor(Math.random() * 20) + 5,
                            avg_engagement: Math.random() * 5 + 2,
                            completion_rate: Math.floor(Math.random() * 20) + 80,
                            rating: Math.random() * 1 + 4
                          },
                          status: 'Ativo'
                        };

                        const deliverables = {
                          briefing_complete: creatorSlot.briefingCompleto || 'Pendente',
                          visit_datetime: creatorSlot.dataHoraVisita || '',
                          guest_quantity: parseInt(creatorSlot.quantidadeConvidados) || 0,
                          visit_confirmed: creatorSlot.visitaConfirmado || 'Pendente',
                          post_datetime: creatorSlot.dataHoraPostagem || '',
                          video_approved: creatorSlot.videoAprovado || 'Pendente',
                          video_posted: creatorSlot.videoPostado || 'Não'
                        };

                        return (
                          <CreatorAdvancedCard
                            key={mockCreatorData.id}
                            creator={mockCreatorData}
                            deliverables={deliverables}
                            campaignData={creatorSlot}
                            isExpanded={expandedCreators.has(mockCreatorData.id)}
                            onToggleExpand={() => toggleCreatorExpansion(mockCreatorData.id)}
                          />
                        );
                      })}
                    </div>
                  ) : !isLoadingCreators ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">👥</div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum criador encontrado</h4>
                      <p className="text-gray-500">Os dados dos criadores serão carregados quando disponíveis.</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
