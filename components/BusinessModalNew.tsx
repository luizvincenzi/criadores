'use client';

import React, { useState, useEffect } from 'react';

interface BusinessModalProps {
  business: any;
  isOpen: boolean;
  onClose: () => void;
  onBusinessUpdated?: (updatedBusiness: any) => void;
}

interface CampaignData {
  id: string;
  title: string;
  month: string;
  status: string;
  budget: number;
  totalCriadores: number;
  created_at: string;
}

interface BusinessFormData {
  // Informações Básicas (seguindo exatamente o formulário AddBusiness)
  businessName: string;        // A = Nome
  category: string;            // B = Categoria
  currentPlan: string;         // C = Plano atual
  comercial: string;           // D = Comercial
  nomeResponsavel: string;     // E = Nome Responsável
  cidade: string;              // F = Cidade
  whatsappResponsavel: string; // G = WhatsApp Responsável
  prospeccao: string;          // H = Prospecção
  responsavel: string;         // I = Responsável
  instagram: string;           // J = Instagram
  website: string;             // K = Website

  // Contratos e Documentos
  grupoWhatsappCriado: string; // K = Grupo WhatsApp criado
  contratoAssinadoEnviado: string; // L = Contrato assinado e enviado
  dataAssinaturaContrato: string;  // M = Data assinatura do contrato
  contratoValidoAte: string;       // N = Contrato válido até
  relatedFiles: string;            // O = Related files
  notes: string;                   // P = Notes

  // Novos campos
  businessStage: string;           // Q = Etapa do negócio
  estimatedValue: string;          // R = Valor estimado
  contractCreatorsCount: string;   // S = Quantidade de criadores no contrato
  ownerUserId: string;             // T = Proprietário do negócio
  priority: string;                // U = Prioridade
  apresentacaoEmpresa: string;     // V = Apresentação da empresa
}

export default function BusinessModalNew({ business, isOpen, onClose, onBusinessUpdated }: BusinessModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);
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
    grupoWhatsappCriado: '',
    contratoAssinadoEnviado: '',
    dataAssinaturaContrato: '',
    contratoValidoAte: '',
    relatedFiles: '',
    notes: '',
    businessStage: 'Leads próprios frios',
    estimatedValue: '',
    contractCreatorsCount: '',
    ownerUserId: '',
    priority: 'Média',
    apresentacaoEmpresa: ''
  });
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [users, setUsers] = useState<Array<{id: string, name?: string, full_name?: string, email: string}>>([]);

  // Carregar usuários quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadUsers();
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

  // Inicializar dados quando business mudar
  useEffect(() => {
    if (business) {
      // Mapear dados do business para o formato do formulário (PADRONIZADO)
      setFormData({
        businessName: business.name || business.nome || business.businessName || '',  // ✅ 'name' como prioridade
        category: business.categoria || '',
        currentPlan: business.planoAtual || business.plano || business.currentPlan || '',
        comercial: business.comercial || '',
        nomeResponsavel: business.nomeResponsavel || business.responsavel || '',
        cidade: business.cidade || '',
        whatsappResponsavel: business.whatsappResponsavel || business.whatsapp || '',
        prospeccao: business.prospeccao || business.status || '',
        responsavel: business.responsavel || '',
        instagram: business.instagram || '',
        website: business.website || '',
        grupoWhatsappCriado: business.grupoWhatsappCriado || '',
        contratoAssinadoEnviado: business.contratoAssinadoEnviado || '',
        dataAssinaturaContrato: business.dataAssinaturaContrato || '',
        contratoValidoAte: business.contratoValidoAte || '',
        relatedFiles: business.relatedFiles || '',
        notes: business.notes || business.observacoes || '',
        businessStage: business.businessStage || 'Leads próprios frios',
        estimatedValue: business.estimatedValue ? business.estimatedValue.toString() : '',
        contractCreatorsCount: business.contractCreatorsCount ? business.contractCreatorsCount.toString() : '',
        ownerUserId: business.ownerUserId || business.owner_user_id || '',
        priority: business.priority || 'Média',
        apresentacaoEmpresa: business.apresentacao_empresa || ''
      });

      // Buscar campanhas
      if (business.id) {
        fetchCampaigns(business.id);
      }
    }
  }, [business]);

  const fetchCampaigns = async (businessId: string) => {
    setIsLoadingCampaigns(true);
    try {
      const response = await fetch(`/api/supabase/campaigns?business_id=${businessId}`);
      const result = await response.json();
      
      if (result.success) {
        setCampaigns(result.data.map((campaign: any) => ({
          id: campaign.id,
          title: campaign.nome || campaign.title,
          month: campaign.mes || campaign.month,
          status: campaign.status,
          budget: campaign.orcamento || campaign.budget || 0,
          totalCriadores: campaign.totalCriadores || 0,
          created_at: campaign.created_at
        })));
      }
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error);
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  const handleInputChange = (field: keyof BusinessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      console.log('💾 Iniciando salvamento dos dados:', formData);

      if (!business?.id) {
        console.error('❌ ID do negócio não encontrado');
        alert('Erro: ID do negócio não encontrado');
        return;
      }

      // Preparar dados para envio à API
      const updateData = {
        id: business.id,
        name: formData.businessName,
        contact_info: {
          primary_contact: formData.nomeResponsavel,
          whatsapp: formData.whatsappResponsavel,
          instagram: formData.instagram,
          website: formData.website
        },
        address: {
          city: formData.cidade
        },
        custom_fields: {
          plano_atual: formData.currentPlan,
          comercial: formData.comercial,
          responsavel: formData.responsavel,
          grupo_whatsapp_criado: formData.grupoWhatsappCriado === 'Sim',
          contrato_assinado_enviado: formData.contratoAssinadoEnviado === 'Sim',
          data_assinatura_contrato: formData.dataAssinaturaContrato,
          contrato_valido_ate: formData.contratoValidoAte,
          related_files: formData.relatedFiles,
          notes: formData.notes
        },
        tags: formData.category ? [formData.category] : [],
        status: formData.prospeccao,
        business_stage: formData.businessStage,
        estimated_value: parseFloat(formData.estimatedValue) || 0,
        contract_creators_count: parseInt(formData.contractCreatorsCount) || 0,
        owner_user_id: formData.ownerUserId || null,
        priority: formData.priority,
        apresentacao_empresa: formData.apresentacaoEmpresa
      };

      console.log('📤 Enviando dados para API:', updateData);

      // Fazer requisição PUT para a API
      const response = await fetch('/api/supabase/businesses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao salvar dados');
      }

      console.log('✅ Dados salvos com sucesso:', result);

      // Mostrar feedback de sucesso
      setSaveSuccess(true);

      // Notificar o componente pai sobre a atualização
      if (onBusinessUpdated && result.data) {
        onBusinessUpdated(result.data);
      }

      // Sair do modo de edição após um breve delay
      setTimeout(() => {
        setIsEditMode(false);
        setSaveSuccess(false);
      }, 1500);

    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      alert(`❌ Erro ao salvar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const openWhatsApp = () => {
    if (formData.whatsappResponsavel) {
      const phone = formData.whatsappResponsavel.replace(/\D/g, '');
      const message = `Olá ${formData.nomeResponsavel}! Sou da equipe CRM crIAdores.`;
      window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const openInstagram = () => {
    if (formData.instagram) {
      const username = formData.instagram.replace('@', '');
      window.open(`https://instagram.com/${username}`, '_blank');
    }
  };

  const openWebsite = () => {
    if (formData.website) {
      let url = formData.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      window.open(url, '_blank');
    }
  };

  const renderField = (
    label: string,
    field: keyof BusinessFormData,
    type: 'text' | 'select' | 'textarea' | 'number' = 'text',
    options?: string[] | Array<{value: string, label: string}>
  ) => {
    const value = formData[field];

    return (
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <label className="block text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
          {label}
        </label>
        {isEditMode ? (
          type === 'select' ? (
            <select
              value={value}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Selecione...</option>
              {options?.map(option => {
                if (typeof option === 'string') {
                  return <option key={option} value={option}>{option}</option>;
                } else {
                  return <option key={option.value} value={option.value}>{option.label}</option>;
                }
              })}
            </select>
          ) : type === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field, e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder={`Digite ${label.toLowerCase()}`}
            />
          ) : type === 'number' ? (
            <input
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder={field === 'estimatedValue' ? 'Ex: 15000.00' : `Digite ${label.toLowerCase()}`}
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder={`Digite ${label.toLowerCase()}`}
            />
          )
        ) : (
          <p className="text-sm text-gray-900 font-medium">
            {field === 'ownerUserId' && value
              ? users.find(u => u.id === value)?.full_name || users.find(u => u.id === value)?.name || 'Usuário não encontrado'
              : value || 'Não informado'
            }
          </p>
        )}
      </div>
    );
  };

  if (!isOpen || !business) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Enhanced Shadowbox/Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 scale-100 animate-in zoom-in-95 slide-in-from-bottom-4"
          onClick={(e) => e.stopPropagation()}
        >
        
        {/* Header Profissional */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{formData.businessName}</h1>
                <div className="flex items-center space-x-4 text-blue-100 mt-2">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {formData.category || 'Categoria não definida'}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {formData.cidade || 'Cidade não informada'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Botão de Fechar */}
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Seção de Campanhas */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Campanhas ({campaigns.length})
            </h2>
            
            {isLoadingCampaigns ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-blue-700">Carregando campanhas...</span>
              </div>
            ) : campaigns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 truncate">{campaign.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'Finalizado' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'Entrega final' ? 'bg-blue-100 text-blue-800' :
                        campaign.status === 'Agendamentos' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Mês:</span>
                        <span className="font-medium">{campaign.month}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Criadores:</span>
                        <span className="font-medium">{campaign.totalCriadores}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Orçamento:</span>
                        <span className="font-medium">R$ {campaign.budget.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-blue-600">
                <svg className="w-12 h-12 mx-auto mb-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-lg font-medium">Nenhuma campanha criada</p>
                <p className="text-sm text-blue-500 mt-1">Este negócio ainda não possui campanhas</p>
              </div>
            )}
          </div>

          {/* Grid de Informações Completas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Coluna Esquerda: Informações Básicas */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Informações Básicas
                </h2>

                {/* Botão de Editar */}
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                  </svg>
                  <span>{isEditMode ? 'Cancelar' : 'Editar'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  {renderField('Nome do Negócio', 'businessName')}
                </div>
                {renderField('Categoria', 'category', 'select', [
                  'Alimentação', 'Moda', 'Beleza', 'Tecnologia', 'Saúde', 'Educação', 'Entretenimento', 'Outros'
                ])}
                {renderField('Cidade', 'cidade')}
                {renderField('Plano Atual', 'currentPlan', 'select', [
                  'Silver', 'Gold', 'Diamond', 'Personalizado'
                ])}
                {renderField('Status', 'prospeccao', 'select', [
                  'Reunião de briefing', 'Agendamentos', 'Entrega final', 'Finalizado'
                ])}
                {renderField('Etapa do Negócio', 'businessStage', 'select', [
                  'Leads próprios frios', 'Leads próprios quentes', 'Leads indicados',
                  'Enviando proposta', 'Marcado reunião', 'Reunião realizada',
                  'Follow up', 'Negócio Fechado', 'Contrato assinado', 'Não teve interesse', 'Não responde', 'Declinado'
                ])}
                {renderField('Prioridade', 'priority', 'select', [
                  { value: 'Baixa', label: '🟢 Baixa' },
                  { value: 'Média', label: '🟡 Média' },
                  { value: 'Alta', label: '🔴 Alta' }
                ])}
                {renderField('Valor em R$', 'estimatedValue', 'number')}
                {renderField('Criadores no Contrato', 'contractCreatorsCount', 'number')}
                <div className="md:col-span-2">
                  {renderField('Proprietário do Negócio', 'ownerUserId', 'select', users.map(u => ({ value: u.id, label: `${u.full_name || u.name} (${u.email})` })))}
                </div>
                <div className="md:col-span-2">
                  {renderField('Apresentação da Empresa', 'apresentacaoEmpresa', 'textarea')}
                </div>
              </div>
            </div>

            {/* Coluna Direita: Contatos e Responsáveis */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Contatos e Responsáveis
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  {renderField('Nome do Responsável', 'nomeResponsavel')}
                </div>
                {renderField('WhatsApp do Responsável', 'whatsappResponsavel')}
                {renderField('Responsável Interno', 'responsavel')}
                {renderField('Instagram', 'instagram')}
                {renderField('Website', 'website')}

                {/* Botões de Ação */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <button
                    onClick={openWhatsApp}
                    disabled={!formData.whatsappResponsavel}
                    className="flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button
                    onClick={openInstagram}
                    disabled={!formData.instagram}
                    className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </button>
                  <button
                    onClick={openWebsite}
                    disabled={!formData.website}
                    className="flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    Website
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Contratos e Documentos */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Contratos e Documentos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField('Grupo WhatsApp Criado', 'grupoWhatsappCriado', 'select', ['Sim', 'Não'])}
              {renderField('Contrato Assinado e Enviado', 'contratoAssinadoEnviado', 'select', ['Sim', 'Não'])}
              {renderField('Data Assinatura do Contrato', 'dataAssinaturaContrato')}
              {renderField('Contrato Válido Até', 'contratoValidoAte')}
              {renderField('Arquivos Relacionados', 'relatedFiles')}
              <div className="md:col-span-2">
                {renderField('Observações', 'notes', 'textarea')}
              </div>
            </div>
          </div>
        </div>

        {/* Footer com Botões de Ação */}
        {isEditMode && (
          <div className="border-t border-gray-200 bg-gray-50 p-6 flex items-center justify-end space-x-4">
            <button
              onClick={() => setIsEditMode(false)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
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
                  Salvando...
                </>
              ) : saveSuccess ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvo com Sucesso!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
