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
  onSendToCreators: (selectedCreators: Creator[], template: string) => void;
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

  useEffect(() => {
    if (isOpen) {
      loadCreators();
    }
  }, [isOpen]);

  const loadCreators = async () => {
    try {
      setIsLoading(true);
      
      // Buscar todos os criadores ativos
      const response = await fetch('/api/supabase/creators?status=Ativo');
      const result = await response.json();
      
      if (result.success) {
        setCreators(result.creators || []);
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
    const selectedCreatorsList = creators.filter(c => selectedCreators.has(c.id));
    const template = getWhatsAppTemplate();
    onSendToCreators(selectedCreatorsList, template);
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
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando criadores...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                        selectedCreators.has(creator.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onClick={() => toggleCreatorSelection(creator.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: '#00629B' }}
                          >
                            {creator.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{creator.name}</h4>
                          <p className="text-sm text-gray-600">
                            {creator.profile_info?.category || 'Criador'}
                          </p>
                          
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {creator.social_media?.instagram?.followers && (
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                                {formatNumber(creator.social_media.instagram.followers)}
                              </span>
                            )}
                            
                            {creator.profile_info?.location?.city && (
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {creator.profile_info.location.city}
                              </span>
                            )}
                            
                            {creator.performance_metrics?.rating && (
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                {creator.performance_metrics.rating.toFixed(1)}
                              </span>
                            )}
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
    </div>
  );
}
