'use client';

import React, { useState, useEffect } from 'react';

interface Business {
  id: string;
  name: string;
  category?: string;
  city?: string;
}

interface Creator {
  id: string;
  name: string;
  city?: string;
  instagram?: string;
  followers?: number;
  status?: string;
}

interface CampaignModalCompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CampaignFormData {
  businessId: string;
  title: string;
  description: string;
  month: string;
  campaign_date: string; // Timestamp para data específica
  quantidadeCriadores: number;
  budget: number;
  objectives: string;
  responsibleUserId: string; // Responsável pela campanha
  deliverables: {
    posts: number;
    stories: number;
    reels: number;
  };
  // Novos campos de briefing
  formatos: string[];
  perfilCriador: string;
  comunicacaoSecundaria: string;
  datasGravacao: {
    dataInicio: string;
    dataFim: string;
    horariosPreferenciais: string[];
    observacoes: string;
  };
  roteiroVideo: {
    oQueFalar: string;
    historia: string;
    promocaoCta: string;
  };
}

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export default function CampaignModalComplete({ isOpen, onClose, onSuccess }: CampaignModalCompleteProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState<CampaignFormData>({
    businessId: '',
    title: '',
    description: '',
    month: '',
    campaign_date: '',
    quantidadeCriadores: 1,
    budget: 0,
    objectives: '',
    responsibleUserId: '',
    deliverables: {
      posts: 1,
      stories: 3,
      reels: 1
    },
    // Novos campos de briefing
    formatos: [],
    perfilCriador: '',
    comunicacaoSecundaria: '',
    datasGravacao: {
      dataInicio: '',
      dataFim: '',
      horariosPreferenciais: [],
      observacoes: ''
    },
    roteiroVideo: {
      oQueFalar: '',
      historia: '',
      promocaoCta: ''
    }
  });

  // Gerar meses disponíveis usando month_year_id
  const generateAvailableMonths = () => {
    const months = [];
    const currentDate = new Date();

    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthYearId = year * 100 + month;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

      months.push({
        value: monthYearId.toString(), // Formato: "202507"
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        displayName: monthName,
        monthYearId: monthYearId
      });
    }

    return months;
  };

  const availableMonths = generateAvailableMonths();

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      // Definir mês atual como padrão
      const currentMonth = availableMonths[0];
      setFormData(prev => ({
        ...prev,
        month: currentMonth?.value || ''
      }));
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Carregar businesses
      const businessResponse = await fetch('/api/supabase/businesses');
      const businessResult = await businessResponse.json();
      
      if (businessResult.success) {
        setBusinesses(businessResult.data || []);
      }

      // Carregar criadores ativos
      const creatorsResponse = await fetch('/api/supabase/creators');
      const creatorsResult = await creatorsResponse.json();

      if (creatorsResult.success) {
        const activeCreators = creatorsResult.data.filter((creator: Creator) =>
          creator.status === 'Ativo'
        );
        setCreators(activeCreators);
        setFilteredCreators(activeCreators);
      }

      // Carregar usuários
      const usersResponse = await fetch('/api/supabase/users');
      const usersResult = await usersResponse.json();

      if (usersResult.success) {
        setUsers(usersResult.users || []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Contar criadores disponíveis por cidade do business selecionado
  useEffect(() => {
    if (formData.businessId) {
      const selectedBusiness = businesses.find(b => b.id === formData.businessId);
      if (selectedBusiness?.city) {
        const filtered = creators.filter(creator =>
          creator.city?.toLowerCase() === selectedBusiness.city?.toLowerCase()
        );
        setFilteredCreators(filtered);
      } else {
        setFilteredCreators(creators);
      }
    }
  }, [formData.businessId, businesses, creators]);

  const handleInputChange = (field: keyof CampaignFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Função removida - não precisamos mais de toggle de criadores individuais

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessId || !formData.title || !formData.month || formData.quantidadeCriadores < 1 || formData.formatos.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios: business, título, mês, quantidade de criadores e pelo menos um formato');
      return;
    }

    if (formData.quantidadeCriadores > filteredCreators.length) {
      alert(`Apenas ${filteredCreators.length} criadores disponíveis nesta cidade. Ajuste a quantidade.`);
      return;
    }

    try {
      setSaving(true);
      setSaveSuccess(false);

      const response = await fetch('/api/supabase/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: formData.businessId,
          title: formData.title,
          description: formData.description,
          month: formData.month,
          budget: formData.budget,
          responsible_user_id: formData.responsibleUserId || null,
          objectives: {
            primary: formData.objectives,
            secondary: [formData.comunicacaoSecundaria].filter(Boolean),
            kpis: { reach: 0, engagement: 0, conversions: 0 }
          },
          deliverables: formData.deliverables,
          quantidade_criadores: formData.quantidadeCriadores,
          briefing_details: {
            formatos: formData.formatos,
            perfil_criador: formData.perfilCriador,
            objetivo_detalhado: formData.objectives,
            comunicacao_secundaria: formData.comunicacaoSecundaria,
            datas_gravacao: {
              data_inicio: formData.datasGravacao.dataInicio || null,
              data_fim: formData.datasGravacao.dataFim || null,
              horarios_preferenciais: formData.datasGravacao.horariosPreferenciais,
              observacoes: formData.datasGravacao.observacoes
            },
            roteiro_video: {
              o_que_falar: formData.roteiroVideo.oQueFalar,
              historia: formData.roteiroVideo.historia,
              promocao_cta: formData.roteiroVideo.promocaoCta,
              tom_comunicacao: "",
              pontos_obrigatorios: []
            },
            requisitos_tecnicos: {
              duracao_video: "",
              qualidade: "HD",
              formato_entrega: formData.formato,
              hashtags_obrigatorias: []
            }
          }
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao criar campanha');
      }

      setSaveSuccess(true);
      
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 1500);

    } catch (error) {
      console.error('❌ Erro ao criar campanha:', error);
      alert(`❌ Erro ao criar campanha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      businessId: '',
      title: '',
      description: '',
      month: availableMonths[0]?.value || '',
      quantidadeCriadores: 1,
      budget: 0,
      objectives: '',
      responsibleUserId: '',
      deliverables: {
        posts: 1,
        stories: 3,
        reels: 1
      },
      formatos: [],
      perfilCriador: '',
      comunicacaoSecundaria: '',
      datasGravacao: {
        dataInicio: '',
        dataFim: '',
        horariosPreferenciais: [],
        observacoes: ''
      },
      roteiroVideo: {
        oQueFalar: '',
        historia: '',
        promocaoCta: ''
      }
    });
    setSaveSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[95vh] overflow-hidden flex flex-col">
          
          {/* Header com cor azul */}
          <div className="relative bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Nova Campanha
                </h1>
                <p className="text-gray-600">
                  Crie uma nova campanha vinculando business e criadores
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo do Modal */}
          <div className="flex-1 overflow-y-auto">
            <form id="campaign-form" onSubmit={handleSubmit} className="p-6 space-y-8">
              
              {/* Seção de Informações Básicas */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business *</label>
                    <select
                      value={formData.businessId}
                      onChange={(e) => handleInputChange('businessId', e.target.value)}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecione um business</option>
                      {businesses.map(business => (
                        <option key={business.id} value={business.id}>
                          {business.name} {business.city && `- ${business.city}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mês da Campanha *</label>
                    <select
                      value={formData.month}
                      onChange={(e) => handleInputChange('month', e.target.value)}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {availableMonths.map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Título da Campanha *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Campanha de Lançamento - Produto X"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva os objetivos e detalhes da campanha..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Responsável pela Campanha</label>
                    <select
                      value={formData.responsibleUserId}
                      onChange={(e) => handleInputChange('responsibleUserId', e.target.value)}
                      className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione um responsável</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Usuário responsável por gerenciar esta campanha
                    </p>
                  </div>
                </div>
              </div>

              {/* Seção de Quantidade de Criadores */}
              <div className="bg-orange-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Quantidade de Criadores
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número de Criadores *</label>
                    <input
                      type="number"
                      min="1"
                      max={filteredCreators.length || 10}
                      value={formData.quantidadeCriadores}
                      onChange={(e) => handleInputChange('quantidadeCriadores', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: 3"
                      required
                    />
                  </div>


                </div>
              </div>

              {/* Seção de Briefing Detalhado */}
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Briefing Detalhado
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Formatos *</label>
                    <div className="space-y-2">
                      {['Reels', 'Stories', 'TikTok'].map(formato => (
                        <label key={formato} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.formatos.includes(formato)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange('formatos', [...formData.formatos, formato]);
                              } else {
                                handleInputChange('formatos', formData.formatos.filter(f => f !== formato));
                              }
                            }}
                            className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{formato}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Perfil do Criador</label>
                    <input
                      type="text"
                      value={formData.perfilCriador}
                      onChange={(e) => handleInputChange('perfilCriador', e.target.value)}
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Ex: Lifestyle, Fitness, Culinária..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Objetivo Detalhado</label>
                    <textarea
                      value={formData.objectives}
                      onChange={(e) => handleInputChange('objectives', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Descreva o objetivo principal da campanha..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comunicação Secundária</label>
                    <textarea
                      value={formData.comunicacaoSecundaria}
                      onChange={(e) => handleInputChange('comunicacaoSecundaria', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Mensagens secundárias ou complementares..."
                    />
                  </div>
                </div>
              </div>

              {/* Seção de Datas e Horários */}
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Datas e Horários para Gravação
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
                    <input
                      type="date"
                      value={formData.datasGravacao.dataInicio}
                      onChange={(e) => handleInputChange('datasGravacao', {
                        ...formData.datasGravacao,
                        dataInicio: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Fim</label>
                    <input
                      type="date"
                      value={formData.datasGravacao.dataFim}
                      onChange={(e) => handleInputChange('datasGravacao', {
                        ...formData.datasGravacao,
                        dataFim: e.target.value
                      })}
                      className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações sobre Datas</label>
                    <textarea
                      value={formData.datasGravacao.observacoes}
                      onChange={(e) => handleInputChange('datasGravacao', {
                        ...formData.datasGravacao,
                        observacoes: e.target.value
                      })}
                      rows={2}
                      className="w-full px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Horários preferenciais, restrições, etc..."
                    />
                  </div>
                </div>
              </div>

              {/* Seção de Roteiro do Vídeo */}
              <div className="bg-yellow-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Roteiro do Vídeo
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">O que precisa ser falado no vídeo (de forma natural)</label>
                    <textarea
                      value={formData.roteiroVideo.oQueFalar}
                      onChange={(e) => handleInputChange('roteiroVideo', {
                        ...formData.roteiroVideo,
                        oQueFalar: e.target.value
                      })}
                      rows={4}
                      className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Descreva os pontos principais que devem ser mencionados de forma natural..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">História</label>
                    <textarea
                      value={formData.roteiroVideo.historia}
                      onChange={(e) => handleInputChange('roteiroVideo', {
                        ...formData.roteiroVideo,
                        historia: e.target.value
                      })}
                      rows={3}
                      className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Conte a história ou narrativa que deve ser seguida..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Promoção CTA</label>
                    <textarea
                      value={formData.roteiroVideo.promocaoCta}
                      onChange={(e) => handleInputChange('roteiroVideo', {
                        ...formData.roteiroVideo,
                        promocaoCta: e.target.value
                      })}
                      rows={2}
                      className="w-full px-4 py-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Call-to-action, promoções, códigos de desconto..."
                    />
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Botões de Ação Fixos */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="campaign-form"
              disabled={isSaving || formData.quantidadeCriadores < 1 || formData.formatos.length === 0}
              className={`px-6 py-3 text-white rounded-lg transition-colors flex items-center ${
                saveSuccess
                  ? 'bg-green-600 hover:bg-green-700'
                  : isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando Campanha...
                </>
              ) : saveSuccess ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Campanha Criada!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Criar Campanha
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
