'use client';

import React, { useState, useEffect } from 'react';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface BusinessFormData {
  businessName: string;
  category: string;
  currentPlan: string;
  comercial: string;
  nomeResponsavel: string;
  cidade: string;
  whatsappResponsavel: string;
  prospeccao: string;
  responsavel: string;
  instagram: string;
  website: string;
  grupoWhatsappCriado: string;
  contratoAssinadoEnviado: string;
  dataAssinaturaContrato: string;
  contratoValidoAte: string;
  relatedFiles: string;
  notes: string;
  businessStage: string;
  estimatedValue: string;
  contractCreatorsCount: string;
  ownerUserId: string;
  priority: string;
  indicadoPorCriador: string;
}

export default function AddBusinessModalNew({ isOpen, onClose, onSuccess }: AddBusinessModalProps) {
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: '',
    category: '',
    currentPlan: '',
    comercial: '',
    nomeResponsavel: '',
    cidade: '',
    whatsappResponsavel: '',
    prospeccao: '',
    responsavel: '',
    instagram: '',
    website: '',
    grupoWhatsappCriado: 'Não',
    contratoAssinadoEnviado: 'Não',
    dataAssinaturaContrato: '',
    contratoValidoAte: '',
    relatedFiles: '',
    notes: '',
    businessStage: 'Leads próprios frios',
    estimatedValue: '',
    contractCreatorsCount: '',
    ownerUserId: '',
    priority: 'Média',
    indicadoPorCriador: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<BusinessFormData>>({});
  const [users, setUsers] = useState<Array<{id: string, full_name: string, email: string}>>([]);
  const [creators, setCreators] = useState<Array<{id: string, name: string, instagram: string}>>([]);

  const categories = [
    'Alimentação', 'Moda e Beleza', 'Tecnologia', 'Saúde e Bem-estar',
    'Educação', 'Entretenimento', 'Serviços', 'E-commerce', 'Imobiliário', 'Automotivo', 'Outros'
  ];

  const plans = ['Silver', 'Gold', 'Diamond', 'Personalizado'];
  const priorities = ['Baixa', 'Média', 'Alta'];
  const stages = [
    'Leads próprios frios', 'Leads próprios quentes', 'Leads indicados',
    'Enviando proposta', 'Marcado reunião', 'Reunião realizada', 'Follow up',
    'Contrato assinado', 'Declinado'
  ];

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadCreators();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/supabase/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadCreators = async () => {
    try {
      const response = await fetch('/api/supabase/creators?status=Ativo&limit=200');
      if (response.ok) {
        const data = await response.json();
        const creatorsData = data.creators || data.data || [];
        setCreators(creatorsData.map((creator: any) => ({
          id: creator.id,
          name: creator.nome || creator.name,
          instagram: creator.instagram || creator.social_media?.instagram?.username || ''
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar criadores:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BusinessFormData> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Nome da empresa é obrigatório';
    }
    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }
    if (!formData.nomeResponsavel.trim()) {
      newErrors.nomeResponsavel = 'Nome do responsável é obrigatório';
    }
    if (!formData.whatsappResponsavel.trim()) {
      newErrors.whatsappResponsavel = 'WhatsApp do responsável é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/supabase/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.businessName,
          categoria: formData.category,
          planoAtual: formData.currentPlan,
          comercial: formData.comercial,
          nomeResponsavel: formData.nomeResponsavel,
          cidade: formData.cidade,
          whatsappResponsavel: formData.whatsappResponsavel,
          prospeccao: formData.prospeccao || 'Reunião Briefing',
          responsavel: formData.responsavel,
          instagram: formData.instagram,
          website: formData.website,
          grupoWhatsappCriado: formData.grupoWhatsappCriado,
          contratoAssinadoEnviado: formData.contratoAssinadoEnviado,
          dataAssinaturaContrato: formData.dataAssinaturaContrato,
          contratoValidoAte: formData.contratoValidoAte,
          relatedFiles: formData.relatedFiles,
          notes: formData.notes,
          businessStage: formData.businessStage,
          estimatedValue: formData.estimatedValue,
          contractCreatorsCount: formData.contractCreatorsCount,
          ownerUserId: formData.ownerUserId,
          priority: formData.priority,
          indicadoPorCriador: formData.indicadoPorCriador
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao adicionar empresa');
      }

      // Reset form
      setFormData({
        businessName: '', category: '', currentPlan: '', comercial: '',
        nomeResponsavel: '', cidade: '', whatsappResponsavel: '', prospeccao: '',
        responsavel: '', instagram: '', website: '', grupoWhatsappCriado: 'Não',
        contratoAssinadoEnviado: 'Não', dataAssinaturaContrato: '', contratoValidoAte: '',
        relatedFiles: '', notes: '', businessStage: 'Leads próprios frios',
        estimatedValue: '', contractCreatorsCount: '', ownerUserId: '',
        priority: 'Média', indicadoPorCriador: ''
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('❌ Erro ao adicionar empresa:', error);
      alert(`Erro ao adicionar empresa: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold">Nova Empresa</h2>
              <p className="text-blue-100 mt-1">
                Preencha as informações da empresa para adicionar à base
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-3 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content with Scroll */}
          <div className="flex-1 overflow-y-auto">
            <form id="business-form" onSubmit={handleSubmit} className="p-6 space-y-8">
              
              {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">🏢</span>
                  </div>
                  Informações Básicas da Empresa
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Nome da Empresa */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.businessName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Ex: Fashion Store Ltda"
                    />
                    {errors.businessName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.businessName}
                      </p>
                    )}
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.category}
                      </p>
                    )}
                  </div>

                  {/* Plano Atual */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Plano Atual
                    </label>
                    <select
                      value={formData.currentPlan}
                      onChange={(e) => handleInputChange('currentPlan', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecione um plano</option>
                      {plans.map(plan => (
                        <option key={plan} value={plan}>{plan}</option>
                      ))}
                    </select>
                  </div>

                  {/* Cidade */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => handleInputChange('cidade', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Ex: São Paulo"
                    />
                  </div>

                  {/* Indicado por Criador */}
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Indicado por Criador
                    </label>
                    <select
                      value={formData.indicadoPorCriador}
                      onChange={(e) => handleInputChange('indicadoPorCriador', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Nenhum criador</option>
                      {creators.map(creator => (
                        <option key={creator.id} value={creator.id}>
                          {creator.name} {creator.instagram && `(@${creator.instagram})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: INFORMAÇÕES DE CONTATO */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-xl font-bold text-green-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  Informações de Contato
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Nome do Responsável */}
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      Nome do Responsável *
                    </label>
                    <input
                      type="text"
                      value={formData.nomeResponsavel}
                      onChange={(e) => handleInputChange('nomeResponsavel', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        errors.nomeResponsavel ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Ex: João Silva"
                    />
                    {errors.nomeResponsavel && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.nomeResponsavel}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp do Responsável */}
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      WhatsApp do Responsável *
                    </label>
                    <input
                      type="text"
                      value={formData.whatsappResponsavel}
                      onChange={(e) => handleInputChange('whatsappResponsavel', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                        errors.whatsappResponsavel ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Ex: (11) 99999-9999"
                    />
                    {errors.whatsappResponsavel && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="mr-1">⚠️</span>
                        {errors.whatsappResponsavel}
                      </p>
                    )}
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Ex: @empresa"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Ex: www.empresa.com"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: GESTÃO INTERNA */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">⚙️</span>
                  </div>
                  Gestão Interna
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Responsável Interno */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-2">
                      Responsável Interno
                    </label>
                    <input
                      type="text"
                      value={formData.responsavel}
                      onChange={(e) => handleInputChange('responsavel', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Ex: Maria Santos"
                    />
                  </div>

                  {/* Proprietário do Negócio */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-2">
                      Proprietário do Negócio
                    </label>
                    <select
                      value={formData.ownerUserId}
                      onChange={(e) => handleInputChange('ownerUserId', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecione um proprietário</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.full_name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status de Prospecção */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-2">
                      Status de Prospecção
                    </label>
                    <select
                      value={formData.prospeccao}
                      onChange={(e) => handleInputChange('prospeccao', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Selecione um status</option>
                      <option value="Reunião de briefing">Reunião de briefing</option>
                      <option value="Agendamentos">Agendamentos</option>
                      <option value="Entrega final">Entrega final</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>
                  </div>

                  {/* Etapa do Negócio */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-2">
                      Etapa do Negócio
                    </label>
                    <select
                      value={formData.businessStage}
                      onChange={(e) => handleInputChange('businessStage', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      {stages.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>

                  {/* Prioridade */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-2">
                      Prioridade
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  {/* Valor Estimado */}
                  <div>
                    <label className="block text-sm font-semibold text-purple-700 mb-2">
                      Valor Estimado (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Ex: 5000"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 4: INFORMAÇÕES CONTRATUAIS */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-xl font-bold text-orange-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">📄</span>
                  </div>
                  Informações Contratuais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Grupo WhatsApp Criado */}
                  <div>
                    <label className="block text-sm font-semibold text-orange-700 mb-2">
                      Grupo WhatsApp Criado
                    </label>
                    <select
                      value={formData.grupoWhatsappCriado}
                      onChange={(e) => handleInputChange('grupoWhatsappCriado', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="Não">Não</option>
                      <option value="Sim">Sim</option>
                    </select>
                  </div>

                  {/* Contrato Assinado e Enviado */}
                  <div>
                    <label className="block text-sm font-semibold text-orange-700 mb-2">
                      Contrato Assinado e Enviado
                    </label>
                    <select
                      value={formData.contratoAssinadoEnviado}
                      onChange={(e) => handleInputChange('contratoAssinadoEnviado', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="Não">Não</option>
                      <option value="Sim">Sim</option>
                    </select>
                  </div>

                  {/* Data Assinatura Contrato */}
                  <div>
                    <label className="block text-sm font-semibold text-orange-700 mb-2">
                      Data Assinatura Contrato
                    </label>
                    <input
                      type="date"
                      value={formData.dataAssinaturaContrato}
                      onChange={(e) => handleInputChange('dataAssinaturaContrato', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Contrato Válido Até */}
                  <div>
                    <label className="block text-sm font-semibold text-orange-700 mb-2">
                      Contrato Válido Até
                    </label>
                    <input
                      type="date"
                      value={formData.contratoValidoAte}
                      onChange={(e) => handleInputChange('contratoValidoAte', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Quantidade de Criadores no Contrato */}
                  <div>
                    <label className="block text-sm font-semibold text-orange-700 mb-2">
                      Quantidade de Criadores no Contrato
                    </label>
                    <input
                      type="number"
                      value={formData.contractCreatorsCount}
                      onChange={(e) => handleInputChange('contractCreatorsCount', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Ex: 3"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 5: OBSERVAÇÕES */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">📝</span>
                  </div>
                  Observações e Arquivos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      rows={4}
                      placeholder="Observações importantes sobre a empresa..."
                    />
                  </div>

                  {/* Arquivos Relacionados */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Arquivos Relacionados
                    </label>
                    <textarea
                      value={formData.relatedFiles}
                      onChange={(e) => handleInputChange('relatedFiles', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                      rows={4}
                      placeholder="Links ou referências de arquivos relacionados..."
                    />
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Footer com Botões */}
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
                form="business-form"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 flex items-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    Adicionar Empresa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
