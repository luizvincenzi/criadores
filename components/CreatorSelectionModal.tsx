'use client';

import React, { useState, useEffect } from 'react';

interface Creator {
  id: string;
  name: string;
  status: string;
  social_media?: {
    instagram?: {
      username: string;
      followers: number;
      engagement_rate: number;
    };
    tiktok?: {
      username: string;
      followers: number;
    };
  };
  contact_info?: {
    whatsapp: string;
    email: string;
  };
  profile_info?: {
    category: string;
    location?: {
      city: string;
      state: string;
    };
  };
  performance_metrics?: {
    total_campaigns: number;
    completion_rate: number;
    rating: number;
  };
}

interface CreatorSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignData: {
    business: { name: string };
    campaign: { title: string; month: string };
  };
  campaignUrl: string;
  onSendToCreators?: (selectedCreators: Creator[], template: string) => void;
}

export default function CreatorSelectionModal({
  isOpen,
  onClose,
  campaignData,
  campaignUrl,
  onSendToCreators
}: CreatorSelectionModalProps) {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreators, setSelectedCreators] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState('opportunity');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (isOpen) {
      loadCreators();
    }
  }, [isOpen]);

  const loadCreators = async () => {
    try {
      setIsLoading(true);

      // Buscar todos os criadores disponíveis
      const response = await fetch('/api/supabase/creators/available');
      const result = await response.json();

      if (result.success) {
        setCreators(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar criadores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || creator.profile_info?.category === filterCategory;
    const matchesLocation = filterLocation === 'all' || creator.profile_info?.location?.city === filterLocation;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const toggleCreatorSelection = (creatorId: string) => {
    const newSelected = new Set(selectedCreators);
    if (newSelected.has(creatorId)) {
      newSelected.delete(creatorId);
    } else {
      newSelected.add(creatorId);
    }
    setSelectedCreators(newSelected);
  };

  const selectAll = () => {
    setSelectedCreators(new Set(filteredCreators.map(c => c.id)));
  };

  const clearSelection = () => {
    setSelectedCreators(new Set());
  };

  const getWhatsAppTemplate = () => {
    const templates = {
      opportunity: `🎯 *Nova Oportunidade de Campanha!*

Olá ${'{nome}'}! 

Temos uma nova campanha que pode ser perfeita para você:

🏢 *Empresa:* ${campaignData.business.name}
📅 *Período:* ${campaignData.campaign.month}
🎬 *Campanha:* ${campaignData.campaign.title}

📊 Veja todos os detalhes da campanha:
${campaignUrl}

💬 Interessado(a)? Responda esta mensagem para conversarmos sobre os detalhes!

#OportunidadeCriador #MarketingDigital`,

      invitation: `✨ *Convite Especial para Campanha*

Oi ${'{nome}'}!

Você foi selecionado(a) para participar de uma campanha exclusiva:

🎯 ${campaignData.business.name} - ${campaignData.campaign.month}

Sua audiência e estilo de conteúdo são exatamente o que estamos procurando para esta campanha!

🔗 Confira todos os detalhes:
${campaignUrl}

Vamos conversar? 😊`,

      followup: `👋 Oi ${'{nome}'}!

Espero que esteja tudo bem! 

Queria te lembrar sobre a oportunidade da campanha ${campaignData.business.name}.

📱 Caso tenha perdido, aqui estão os detalhes:
${campaignUrl}

Ainda temos algumas vagas disponíveis. Que tal conversarmos?

Aguardo seu retorno! 🚀`
    };

    return templates[selectedTemplate as keyof typeof templates];
  };

  const handleSendToCreators = () => {
    if (selectedCreators.size === 0) {
      alert('Por favor, selecione pelo menos um criador para enviar a campanha.');
      return;
    }
    setShowConfirmation(true);
  };

  const confirmSendToCreators = async () => {
    const selectedCreatorsList = creators.filter(c => selectedCreators.has(c.id));
    const template = getWhatsAppTemplate();

    setShowConfirmation(false);
    setIsSending(true);
    setSendingProgress({ current: 0, total: selectedCreatorsList.length });

    console.log(`🚀 Iniciando envio para ${selectedCreatorsList.length} criadores`);

    try {
      const validCreators = [];

      // Primeiro, validar todos os criadores e preparar as URLs
      for (let i = 0; i < selectedCreatorsList.length; i++) {
        const creator = selectedCreatorsList[i];

        // Personalizar mensagem para cada criador
        const personalizedMessage = template.replace(/{nome}/g, creator.name);

        // Limpar e formatar número do WhatsApp
        const whatsappNumber = creator.contact_info?.whatsapp?.replace(/\D/g, '') || '';

        if (whatsappNumber) {
          // Adicionar código do país se não tiver
          const formattedNumber = whatsappNumber.startsWith('55') ? whatsappNumber : `55${whatsappNumber}`;
          const encodedMessage = encodeURIComponent(personalizedMessage);

          // Criar URL do WhatsApp
          const whatsappUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;

          validCreators.push({
            creator,
            url: whatsappUrl,
            formattedNumber
          });

          console.log(`✅ Preparado para ${creator.name}: ${formattedNumber}`);
        } else {
          console.warn(`⚠️ Criador ${creator.name} não tem WhatsApp cadastrado`);
        }
      }

      // Agora abrir todas as abas com delay
      for (let i = 0; i < validCreators.length; i++) {
        const { creator, url } = validCreators[i];

        setSendingProgress({ current: i + 1, total: validCreators.length });

        console.log(`📱 Abrindo WhatsApp para ${creator.name}...`);

        // Abrir WhatsApp Web em nova aba com nome único
        const newWindow = window.open(url, `whatsapp_${creator.id}_${Date.now()}`);

        if (newWindow) {
          console.log(`✅ Aba aberta para ${creator.name}`);
        } else {
          console.error(`❌ Falha ao abrir aba para ${creator.name} - popup bloqueado?`);
        }

        // Aguardar entre os envios para dar tempo do usuário ver
        if (i < validCreators.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      // Callback opcional para o componente pai
      if (onSendToCreators) {
        onSendToCreators(selectedCreatorsList, template);
      }

      const message = validCreators.length === selectedCreatorsList.length
        ? `✅ ${validCreators.length} abas do WhatsApp Web foram abertas! Verifique seu navegador.`
        : `✅ ${validCreators.length} de ${selectedCreatorsList.length} abas foram abertas. Alguns criadores não tinham WhatsApp cadastrado.`;

      alert(message);

    } catch (error) {
      console.error('Erro ao enviar mensagens:', error);
      alert('❌ Erro ao abrir algumas abas do WhatsApp. Verifique o console para detalhes.');
    } finally {
      setIsSending(false);
      setSendingProgress({ current: 0, total: 0 });
    }
  };

  const cancelSend = () => {
    setShowConfirmation(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#f5f5f5' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Enviar Campanha para Criadores
              </h2>
              <p className="text-gray-600 mt-1">
                {campaignData.business.name} - {campaignData.campaign.month}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-200px)]">
          {/* Sidebar - Filtros e Template */}
          <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto" style={{ backgroundColor: '#fafafa' }}>
            {/* Filtros */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nome do criador..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas as categorias</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Food">Food</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Tech">Tech</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas as cidades</option>
                    <option value="São Paulo">São Paulo</option>
                    <option value="Rio de Janeiro">Rio de Janeiro</option>
                    <option value="Belo Horizonte">Belo Horizonte</option>
                    <option value="Brasília">Brasília</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Template da Mensagem</h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="opportunity"
                    checked={selectedTemplate === 'opportunity'}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Oportunidade</div>
                    <div className="text-sm text-gray-600">Para novos criadores</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    value="invitation"
                    checked={selectedTemplate === 'invitation'}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Convite Especial</div>
                    <div className="text-sm text-gray-600">Para criadores selecionados</div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    value="followup"
                    checked={selectedTemplate === 'followup'}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Follow-up</div>
                    <div className="text-sm text-gray-600">Para lembrar criadores</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Preview do Template */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Preview da Mensagem</h4>
              <div className="p-3 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 max-h-32 overflow-y-auto">
                {getWhatsAppTemplate().replace('{nome}', '[Nome do Criador]')}
              </div>
            </div>
          </div>

          {/* Main Content - Lista de Criadores */}
          <div className="flex-1 flex flex-col">
            {/* Header da Lista */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Criadores Disponíveis ({filteredCreators.length})
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedCreators.size} selecionado(s)
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={selectAll}
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Selecionar Todos
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Limpar Seleção
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Criadores */}
            <div className="flex-1 overflow-y-auto p-4 max-h-96">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando criadores...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {filteredCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className={`p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 h-24 ${
                        selectedCreators.has(creator.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => toggleCreatorSelection(creator.id)}
                    >
                      <div className="flex flex-col h-full">
                        {/* Header com avatar e checkbox */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                                style={{ backgroundColor: '#00629B' }}
                              >
                                {creator.name?.charAt(0)?.toUpperCase() || 'C'}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate text-sm leading-tight">
                                {creator.name?.trim() || 'Nome não informado'}
                              </h4>
                              <p className="text-xs text-gray-600 truncate leading-tight">
                                {creator.profile_info?.category?.trim() ||
                                 creator.profile_info?.profession?.trim() ||
                                 (creator.social_media?.instagram?.followers > 10000 ? 'Influenciador' : 'Criador')}
                              </p>
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedCreators.has(creator.id)
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedCreators.has(creator.id) && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Informações adicionais */}
                        <div className="flex flex-col space-y-1 text-xs text-gray-500 overflow-hidden">
                          {creator.social_media?.instagram?.followers > 0 && (
                            <div className="flex items-center min-w-0">
                              <svg className="w-3 h-3 mr-1 flex-shrink-0 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                              <span className="truncate text-xs">{formatNumber(creator.social_media.instagram.followers)}</span>
                            </div>
                          )}

                          {(creator.profile_info?.location?.city || creator.contact_info?.city) && (
                            <div className="flex items-center min-w-0">
                              <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span className="truncate text-xs">
                                {(creator.profile_info?.location?.city || creator.contact_info?.city || '').trim() || 'Cidade não informada'}
                              </span>
                            </div>
                          )}

                          {creator.contact_info?.whatsapp?.trim() && (
                            <div className="flex items-center min-w-0">
                              <svg className="w-3 h-3 mr-1 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                              </svg>
                              <span className="truncate text-xs text-green-600">WhatsApp</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedCreators.size} criador(es) selecionado(s)
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSendToCreators}
                disabled={selectedCreators.size === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Enviar para {selectedCreators.size} Criador(es)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Confirmar Envio da Campanha
              </h3>

              <p className="text-gray-600 text-center mb-6">
                Você tem certeza que deseja enviar esta oportunidade de campanha para{' '}
                <span className="font-semibold text-gray-900">{selectedCreators.size} criador(es)</span>?
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Empresa:</span> {campaignData.business.name}</p>
                  <p><span className="font-medium">Campanha:</span> {campaignData.campaign.title}</p>
                  <p><span className="font-medium">Período:</span> {campaignData.campaign.month}</p>
                  <p><span className="font-medium">Template:</span> {selectedTemplate === 'opportunity' ? 'Nova Oportunidade' : selectedTemplate === 'invitation' ? 'Convite Especial' : 'Follow-up'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={cancelSend}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  onClick={confirmSendToCreators}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Sim, Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Progresso do Envio */}
      {isSending && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Enviando Mensagens
              </h3>

              <p className="text-gray-600 text-center mb-6">
                Abrindo WhatsApp Web para cada criador...
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progresso</span>
                  <span>{sendingProgress.current} de {sendingProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(sendingProgress.current / sendingProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Aguarde enquanto abrimos uma aba do WhatsApp Web para cada criador selecionado.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
