'use client';

import React, { useState } from 'react';

interface AddCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CampaignFormData {
  campanha: string;                           // A = Campanha
  business: string;                           // B = Business
  influenciador: string;                      // C = Influenciador
  responsavel: string;                        // D = Responsável
  status: string;                             // E = Status
  mes: string;                                // F = Mês
  fim: string;                                // G = FIM
  briefingCompleto: string;                   // H = Briefing completo enviado para o influenciador?
  dataHoraVisita: string;                     // I = Data e hora Visita
  quantidadeConvidados: string;               // J = Quantidade de convidados
  visitaConfirmado: string;                   // K = Visita Confirmado
  dataHoraPostagem: string;                   // L = Data e hora da Postagem
  videoAprovado: string;                      // M = Vídeo aprovado?
  videoPostado: string;                       // N = Video/Reels postado?
  linkVideoInstagram: string;                 // O = Link Video Instagram
  notas: string;                              // P = Notas
  arquivo: string;                            // Q = Arquivo
  avaliacaoRestaurante: string;               // R = Avaliação Restaurante
  avaliacaoInfluenciador: string;             // S = Avaliação Influenciador
  statusCalendario: string;                   // T = Status do Calendário
  column22: string;                           // U = Column 22
  idEvento: string;                           // V = ID do Evento
  formato: string;                            // W = Formato
  perfilCriador: string;                      // X = Perfil do criador
  objetivo: string;                           // Y = Objetivo
  comunicacaoSecundaria: string;              // Z = Comunicação secundária
  datasHorariosGravacao: string;              // AA = Datas e horários para gravação
  oQuePrecisaSerFalado: string;               // AB = O que precisa ser falado no vídeo (de forma natural) - História
  promocaoCTA: string;                        // AC = Promoção CTA
  column31: string;                           // AD = Column 31
  objetivo1: string;                          // AE = Objetivo 1
}

export default function AddCampaignModal({ isOpen, onClose, onSuccess }: AddCampaignModalProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    campanha: '',                           // A = Campanha
    business: '',                           // B = Business
    influenciador: '',                      // C = Influenciador
    responsavel: '',                        // D = Responsável
    status: '',                             // E = Status
    mes: '',                                // F = Mês
    fim: '',                                // G = FIM
    briefingCompleto: '',                   // H = Briefing completo enviado para o influenciador?
    dataHoraVisita: '',                     // I = Data e hora Visita
    quantidadeConvidados: '',               // J = Quantidade de convidados
    visitaConfirmado: '',                   // K = Visita Confirmado
    dataHoraPostagem: '',                   // L = Data e hora da Postagem
    videoAprovado: '',                      // M = Vídeo aprovado?
    videoPostado: '',                       // N = Video/Reels postado?
    linkVideoInstagram: '',                 // O = Link Video Instagram
    notas: '',                              // P = Notas
    arquivo: '',                            // Q = Arquivo
    avaliacaoRestaurante: '',               // R = Avaliação Restaurante
    avaliacaoInfluenciador: '',             // S = Avaliação Influenciador
    statusCalendario: '',                   // T = Status do Calendário
    column22: '',                           // U = Column 22
    idEvento: '',                           // V = ID do Evento
    formato: '',                            // W = Formato
    perfilCriador: '',                      // X = Perfil do criador
    objetivo: '',                           // Y = Objetivo
    comunicacaoSecundaria: '',              // Z = Comunicação secundária
    datasHorariosGravacao: '',              // AA = Datas e horários para gravação
    oQuePrecisaSerFalado: '',               // AB = O que precisa ser falado no vídeo (de forma natural) - História
    promocaoCTA: '',                        // AC = Promoção CTA
    column31: '',                           // AD = Column 31
    objetivo1: ''                           // AE = Objetivo 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CampaignFormData>>({});

  // Opções para os selects
  const statusOptions = ['Ativa', 'Pausada', 'Finalizada', 'Cancelada', 'Planejamento'];
  const briefingOptions = ['Sim', 'Não', 'Em andamento'];
  const visitaConfirmadoOptions = ['Sim', 'Não', 'Pendente'];
  const videoAprovadoOptions = ['Sim', 'Não', 'Em análise'];
  const videoPostadoOptions = ['Sim', 'Não', 'Agendado'];
  const formatoOptions = ['Vídeo', 'Reels', 'Stories', 'Post', 'IGTV'];
  const perfilCriadorOptions = ['Nano', 'Micro', 'Macro', 'Mega'];
  const statusCalendarioOptions = ['Agendado', 'Confirmado', 'Realizado', 'Cancelado'];

  const handleInputChange = (field: keyof CampaignFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Remove erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CampaignFormData> = {};

    // Campos obrigatórios
    if (!formData.campanha.trim()) {
      newErrors.campanha = 'Nome da campanha é obrigatório';
    }
    if (!formData.business.trim()) {
      newErrors.business = 'Business é obrigatório';
    }
    if (!formData.influenciador.trim()) {
      newErrors.influenciador = 'Influenciador é obrigatório';
    }
    if (!formData.status.trim()) {
      newErrors.status = 'Status é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Iniciando submissão da campanha...');
    
    if (!validateForm()) {
      console.log('❌ Validação falhou');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📝 Enviando dados da campanha:', formData);

      const response = await fetch('/api/add-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      console.log('📊 Resposta da API:', result);

      if (result.success) {
        console.log('✅ Campanha adicionada com sucesso!');
        
        // Reset form
        setFormData({
          campanha: '',                           // A = Campanha
          business: '',                           // B = Business
          influenciador: '',                      // C = Influenciador
          responsavel: '',                        // D = Responsável
          status: '',                             // E = Status
          mes: '',                                // F = Mês
          fim: '',                                // G = FIM
          briefingCompleto: '',                   // H = Briefing completo enviado para o influenciador?
          dataHoraVisita: '',                     // I = Data e hora Visita
          quantidadeConvidados: '',               // J = Quantidade de convidados
          visitaConfirmado: '',                   // K = Visita Confirmado
          dataHoraPostagem: '',                   // L = Data e hora da Postagem
          videoAprovado: '',                      // M = Vídeo aprovado?
          videoPostado: '',                       // N = Video/Reels postado?
          linkVideoInstagram: '',                 // O = Link Video Instagram
          notas: '',                              // P = Notas
          arquivo: '',                            // Q = Arquivo
          avaliacaoRestaurante: '',               // R = Avaliação Restaurante
          avaliacaoInfluenciador: '',             // S = Avaliação Influenciador
          statusCalendario: '',                   // T = Status do Calendário
          column22: '',                           // U = Column 22
          idEvento: '',                           // V = ID do Evento
          formato: '',                            // W = Formato
          perfilCriador: '',                      // X = Perfil do criador
          objetivo: '',                           // Y = Objetivo
          comunicacaoSecundaria: '',              // Z = Comunicação secundária
          datasHorariosGravacao: '',              // AA = Datas e horários para gravação
          oQuePrecisaSerFalado: '',               // AB = O que precisa ser falado no vídeo (de forma natural) - História
          promocaoCTA: '',                        // AC = Promoção CTA
          column31: '',                           // AD = Column 31
          objetivo1: ''                           // AE = Objetivo 1
        });
        
        onSuccess();
        onClose();
      } else {
        console.error('❌ Erro da API:', result.error);
        alert(`Erro ao adicionar campanha: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao enviar campanha:', error);
      alert('Erro ao adicionar campanha. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header Fixo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Adicionar Nova Campanha</h2>
            <p className="text-purple-100 mt-1">
              Preencha as informações da campanha para adicionar à base
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-3 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 backdrop-blur-sm border border-white/30"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto">
          <form id="campaign-form" onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Campanha *
                  </label>
                  <input
                    type="text"
                    value={formData.campanha}
                    onChange={(e) => handleInputChange('campanha', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.campanha ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nome da campanha"
                  />
                  {errors.campanha && <p className="text-red-500 text-sm mt-1">{errors.campanha}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business *
                  </label>
                  <input
                    type="text"
                    value={formData.business}
                    onChange={(e) => handleInputChange('business', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.business ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nome do business"
                  />
                  {errors.business && <p className="text-red-500 text-sm mt-1">{errors.business}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Influenciador *
                  </label>
                  <input
                    type="text"
                    value={formData.influenciador}
                    onChange={(e) => handleInputChange('influenciador', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.influenciador ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nome do influenciador"
                  />
                  {errors.influenciador && <p className="text-red-500 text-sm mt-1">{errors.influenciador}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={formData.responsavel}
                    onChange={(e) => handleInputChange('responsavel', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Responsável pela campanha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione o status</option>
                    {statusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mês
                  </label>
                  <input
                    type="text"
                    value={formData.mes}
                    onChange={(e) => handleInputChange('mes', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Mês da campanha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data FIM
                  </label>
                  <input
                    type="date"
                    value={formData.fim}
                    onChange={(e) => handleInputChange('fim', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato
                  </label>
                  <select
                    value={formData.formato}
                    onChange={(e) => handleInputChange('formato', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione o formato</option>
                    {formatoOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Perfil do Criador
                  </label>
                  <select
                    value={formData.perfilCriador}
                    onChange={(e) => handleInputChange('perfilCriador', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione o perfil</option>
                    {perfilCriadorOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Briefing e Planejamento */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Briefing e Planejamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Briefing Completo Enviado?
                  </label>
                  <select
                    value={formData.briefingCompleto}
                    onChange={(e) => handleInputChange('briefingCompleto', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    {briefingOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data e Hora da Visita
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dataHoraVisita}
                    onChange={(e) => handleInputChange('dataHoraVisita', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade de Convidados
                  </label>
                  <input
                    type="number"
                    value={formData.quantidadeConvidados}
                    onChange={(e) => handleInputChange('quantidadeConvidados', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Número de convidados"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visita Confirmada?
                  </label>
                  <select
                    value={formData.visitaConfirmado}
                    onChange={(e) => handleInputChange('visitaConfirmado', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    {visitaConfirmadoOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status do Calendário
                  </label>
                  <select
                    value={formData.statusCalendario}
                    onChange={(e) => handleInputChange('statusCalendario', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    {statusCalendarioOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID do Evento
                  </label>
                  <input
                    type="text"
                    value={formData.idEvento}
                    onChange={(e) => handleInputChange('idEvento', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="ID do evento no calendário"
                  />
                </div>
              </div>
            </div>

            {/* Produção de Conteúdo */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Produção de Conteúdo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data e Hora da Postagem
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dataHoraPostagem}
                    onChange={(e) => handleInputChange('dataHoraPostagem', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vídeo Aprovado?
                  </label>
                  <select
                    value={formData.videoAprovado}
                    onChange={(e) => handleInputChange('videoAprovado', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    {videoAprovadoOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video/Reels Postado?
                  </label>
                  <select
                    value={formData.videoPostado}
                    onChange={(e) => handleInputChange('videoPostado', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    {videoPostadoOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link do Vídeo Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.linkVideoInstagram}
                    onChange={(e) => handleInputChange('linkVideoInstagram', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Datas e Horários para Gravação
                  </label>
                  <input
                    type="text"
                    value={formData.datasHorariosGravacao}
                    onChange={(e) => handleInputChange('datasHorariosGravacao', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Datas e horários disponíveis"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arquivo
                  </label>
                  <input
                    type="text"
                    value={formData.arquivo}
                    onChange={(e) => handleInputChange('arquivo', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Link ou referência do arquivo"
                  />
                </div>
              </div>
            </div>

            {/* Objetivos e Estratégia */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Objetivos e Estratégia</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivo Principal
                  </label>
                  <textarea
                    value={formData.objetivo}
                    onChange={(e) => handleInputChange('objetivo', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Objetivo principal da campanha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivo 1 (Secundário)
                  </label>
                  <textarea
                    value={formData.objetivo1}
                    onChange={(e) => handleInputChange('objetivo1', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Objetivo secundário da campanha"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comunicação Secundária
                  </label>
                  <textarea
                    value={formData.comunicacaoSecundaria}
                    onChange={(e) => handleInputChange('comunicacaoSecundaria', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Mensagens secundárias a serem comunicadas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    O que precisa ser falado no vídeo (História)
                  </label>
                  <textarea
                    value={formData.oQuePrecisaSerFalado}
                    onChange={(e) => handleInputChange('oQuePrecisaSerFalado', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Roteiro ou pontos principais que devem ser abordados no vídeo de forma natural"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Promoção CTA
                  </label>
                  <textarea
                    value={formData.promocaoCTA}
                    onChange={(e) => handleInputChange('promocaoCTA', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Call-to-action e promoções a serem mencionadas"
                  />
                </div>
              </div>
            </div>

            {/* Avaliações e Observações */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Avaliações e Observações</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avaliação do Restaurante
                  </label>
                  <textarea
                    value={formData.avaliacaoRestaurante}
                    onChange={(e) => handleInputChange('avaliacaoRestaurante', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Avaliação do estabelecimento/restaurante"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avaliação do Influenciador
                  </label>
                  <textarea
                    value={formData.avaliacaoInfluenciador}
                    onChange={(e) => handleInputChange('avaliacaoInfluenciador', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Avaliação do desempenho do influenciador"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Gerais
                  </label>
                  <textarea
                    value={formData.notas}
                    onChange={(e) => handleInputChange('notas', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Observações gerais sobre a campanha"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Fixo com Botões */}
        <div className="border-t border-gray-200 bg-gray-50 p-6 rounded-b-2xl">
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="campaign-form"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Adicionar Campanha
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
