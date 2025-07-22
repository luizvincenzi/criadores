import React, { useState, useEffect } from 'react';
import AddNoteModal from './AddNoteModal';

interface Deal {
  id: string;
  name: string;
  business_name: string;
  business_id: string;
  stage: string;
  priority: string;
  estimated_value: number;
  expected_close_date: string;
  owner_name: string;
  owner_email: string;
  current_stage_since: string;
  created_at: string;
  plan: string;
}

interface BusinessDetails {
  id: string;
  name: string;
  contact_info: {
    primary_contact: string;
    whatsapp: string;
    instagram: string;
    email: string;
    phone: string;
    website: string;
  };
  address: {
    city: string;
    state: string;
  };
  priority: string;
  business_stage: string;
  estimated_value: number;
  custom_fields: {
    categoria: string;
    responsavel: string;
  };
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  user_name: string;
}

interface DealDetailsModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
  onDealUpdated?: (deal: Deal) => void;
}

const DEAL_STAGES = [
  'Leads próprios frios',
  'Leads próprios quentes',
  'Leads indicados',
  'Enviando proposta',
  'Marcado reunião',
  'Reunião realizada',
  'Follow up',
  'Contrato assinado'
];

const PRIORITIES = ['Baixa', 'Média', 'Alta'];

export default function DealDetailsModalNew({ deal, isOpen, onClose, onDealUpdated }: DealDetailsModalProps) {
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('info');



  // Estados para notas
  const [notes, setNotes] = useState<Note[]>([]);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  // Estados para edição
  const [editData, setEditData] = useState({
    stage: '',
    priority: '',
    estimated_value: 0
  });

  // Estados para edição inline individual
  const [isEditingStage, setIsEditingStage] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [tempStage, setTempStage] = useState('');
  const [tempPriority, setTempPriority] = useState('');
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    if (isOpen && deal) {
      loadBusinessDetails();
      loadNotes();
      setEditData({
        stage: deal.stage,
        priority: deal.priority,
        estimated_value: deal.estimated_value
      });
      // Inicializar valores temporários
      setTempStage(deal.stage);
      setTempPriority(deal.priority);
      setTempValue(deal.estimated_value.toString());
    }
  }, [isOpen, deal]);

  const loadBusinessDetails = async () => {
    if (!deal) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/supabase/businesses?id=${deal.business_id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.businesses && data.businesses.length > 0) {
          const business = data.businesses[0];
          setBusinessDetails(business);
          console.log('✅ Detalhes do negócio carregados:', business);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    if (!deal) return;

    setIsNotesLoading(true);
    try {
      const response = await fetch(`/api/crm/notes?business_id=${deal.business_id}`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      console.error('Erro ao carregar notas:', error);
    } finally {
      setIsNotesLoading(false);
    }
  };

  const handleNotesReload = () => {
    loadNotes();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysInStage = (stageDate: string) => {
    const days = Math.floor((Date.now() - new Date(stageDate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
  };

  const openInstagram = (instagram: string) => {
    if (!instagram) return;
    const cleanInstagram = instagram.replace('@', '');
    window.open(`https://instagram.com/${cleanInstagram}`, '_blank');
  };

  const openWebsite = (website: string) => {
    if (!website) return;
    const url = website.startsWith('http') ? website : `https://${website}`;
    window.open(url, '_blank');
  };





  // Funções de edição inline
  const updateDealField = async (field: string, value: any, previousValue?: any) => {
    if (!deal) return;

    setIsUpdating(true);
    try {
      let endpoint = '/api/deals';
      let body: any = { id: deal.business_id };

      if (field === 'stage') {
        body.stage = value;
        body.previous_stage = previousValue;
      } else if (field === 'priority') {
        endpoint = `/api/supabase/businesses`;
        body = { id: deal.business_id, priority: value };
      } else if (field === 'estimated_value') {
        endpoint = `/api/supabase/businesses`;
        body = { id: deal.business_id, estimated_value: parseFloat(value) || 0 };
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        // Atualizar deal local
        const updatedDeal = {
          ...deal,
          [field === 'estimated_value' ? 'estimated_value' : field]: value,
          ...(field === 'stage' && { current_stage_since: new Date().toISOString() })
        };

        // Notificar componente pai
        if (onDealUpdated) {
          onDealUpdated(updatedDeal);
        }

        console.log(`✅ ${field} atualizado com sucesso`);
      } else {
        throw new Error('Erro na atualização');
      }
    } catch (error) {
      console.error(`❌ Erro ao atualizar ${field}:`, error);
      alert(`Erro ao atualizar ${field}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStageUpdate = async () => {
    if (tempStage !== deal?.stage) {
      await updateDealField('stage', tempStage, deal?.stage);

      // Se moveu para "Contrato assinado", fechar modal
      if (tempStage === 'Contrato assinado') {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    }
    setIsEditingStage(false);
  };

  const handlePriorityUpdate = async () => {
    if (tempPriority !== deal?.priority) {
      await updateDealField('priority', tempPriority, deal?.priority);
    }
    setIsEditingPriority(false);
  };

  const handleValueUpdate = async () => {
    const newValue = parseFloat(tempValue) || 0;
    if (newValue !== deal?.estimated_value) {
      await updateDealField('estimated_value', newValue, deal?.estimated_value);
    }
    setIsEditingValue(false);
  };

  const handleSave = async () => {
    if (!deal) return;

    setIsUpdating(true);
    try {
      // Atualizar etapa
      if (editData.stage !== deal.stage) {
        const stageResponse = await fetch('/api/deals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: deal.business_id,
            stage: editData.stage,
            previous_stage: deal.stage
          })
        });

        if (!stageResponse.ok) {
          throw new Error('Erro ao atualizar etapa');
        }
      }

      // Atualizar prioridade e valor
      if (editData.priority !== deal.priority || editData.estimated_value !== deal.estimated_value) {
        const businessResponse = await fetch('/api/supabase/businesses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: deal.business_id,
            priority: editData.priority,
            estimated_value: editData.estimated_value
          })
        });

        if (!businessResponse.ok) {
          throw new Error('Erro ao atualizar dados');
        }
      }

      // Atualizar deal local
      const updatedDeal = {
        ...deal,
        stage: editData.stage,
        priority: editData.priority,
        estimated_value: editData.estimated_value,
        ...(editData.stage !== deal.stage && { current_stage_since: new Date().toISOString() })
      };

      if (onDealUpdated) {
        onDealUpdated(updatedDeal);
      }

      setIsEditing(false);

      // Se moveu para "Contrato assinado", fechar modal
      if (editData.stage === 'Contrato assinado') {
        setTimeout(() => {
          onClose();
        }, 1000);
      }

    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      stage: deal?.stage || '',
      priority: deal?.priority || '',
      estimated_value: deal?.estimated_value || 0
    });
    setIsEditing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen || !deal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-6 border-b border-gray-100 relative">
          {isUpdating && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm font-medium text-gray-600">Salvando...</span>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{deal?.business_name || 'Empresa'}</h1>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{getDaysInStage(deal?.current_stage_since || new Date().toISOString())} dias na etapa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Criado em {formatDate(deal?.created_at || new Date().toISOString()).split(' ')[0]}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs - Design Minimalista */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === 'notes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>Notas</span>
                {notes.length > 0 && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {notes.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Carregando detalhes...</span>
                </div>
              ) : (
                <div className="space-y-6">
              {/* Cards de Informações - Design Premium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Etapa Atual */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Etapa Atual</h3>
                    <button
                      onClick={() => setIsEditingStage(true)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  {isEditingStage ? (
                    <div className="space-y-3">
                      <select
                        value={tempStage}
                        onChange={(e) => setTempStage(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Leads próprios frios">Leads próprios frios</option>
                        <option value="Leads próprios quentes">Leads próprios quentes</option>
                        <option value="Reunião de briefing">Reunião de briefing</option>
                        <option value="Proposta enviada">Proposta enviada</option>
                        <option value="Negociação">Negociação</option>
                        <option value="Contrato assinado">Contrato assinado</option>
                      </select>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleStageUpdate}
                          disabled={isUpdating}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isUpdating ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingStage(false);
                            setTempStage(deal?.stage || '');
                          }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-gray-900">{deal.stage}</p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Em andamento</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Valor Estimado */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Valor Estimado</h3>
                    <button
                      onClick={() => setIsEditingValue(true)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  {isEditingValue ? (
                    <div className="space-y-3">
                      <input
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        step="0.01"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleValueUpdate}
                          disabled={isUpdating}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isUpdating ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingValue(false);
                            setTempValue(deal?.estimated_value.toString() || '0');
                          }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(deal.estimated_value)}</p>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-sm text-gray-600">Potencial de receita</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prioridade */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Prioridade</h3>
                    <button
                      onClick={() => setIsEditingPriority(true)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                  {isEditingPriority ? (
                    <div className="space-y-3">
                      <select
                        value={tempPriority}
                        onChange={(e) => setTempPriority(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Baixa">Baixa</option>
                        <option value="Média">Média</option>
                        <option value="Alta">Alta</option>
                      </select>
                      <div className="flex space-x-2">
                        <button
                          onClick={handlePriorityUpdate}
                          disabled={isUpdating}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isUpdating ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPriority(false);
                            setTempPriority(deal?.priority || 'Média');
                          }}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        deal.priority === 'Alta' ? 'bg-red-100 text-red-800 border border-red-200' :
                        deal.priority === 'Média' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {deal.priority}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          deal.priority === 'Alta' ? 'bg-red-500' :
                          deal.priority === 'Média' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="text-sm text-gray-600">Nível de urgência</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção de Contatos e Responsável */}
              {businessDetails && (
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.196-2.121M9 12a4 4 0 100-8 4 4 0 000 8zm8 0a4 4 0 100-8 4 4 0 000 8zm-8 8a6 6 0 0112 0H9z" />
                      </svg>
                    </div>
                    Contatos e Responsável
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Responsável */}
                    {businessDetails.custom_fields?.responsavel && (
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center mr-2">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-600">Responsável</span>
                        </div>
                        <p className="text-base font-semibold text-gray-900">{businessDetails.custom_fields.responsavel}</p>
                      </div>
                    )}

                    {/* WhatsApp */}
                    {businessDetails.contact_info?.whatsapp && (
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382z"/>
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-600">WhatsApp</span>
                          </div>
                          <button
                            onClick={() => window.open(`https://wa.me/55${businessDetails.contact_info.whatsapp.replace(/\D/g, '')}`, '_blank')}
                            className="text-green-600 hover:text-green-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-base font-semibold text-gray-900">{businessDetails.contact_info.whatsapp}</p>
                      </div>
                    )}

                    {/* Instagram */}
                    {businessDetails.contact_info?.instagram && (
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-pink-500 rounded-lg flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Instagram</span>
                          </div>
                          <button
                            onClick={() => window.open(`https://instagram.com/${businessDetails.contact_info.instagram.replace('@', '')}`, '_blank')}
                            className="text-pink-600 hover:text-pink-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-base font-semibold text-gray-900">{businessDetails.contact_info.instagram}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Histórico de Atividades */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Atividade Recente</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">Negócio criado</p>
                      <p className="text-xs text-gray-500">
                        {new Date(deal.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })} às {new Date(deal.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">Movido para "{deal.stage}"</p>
                      <p className="text-xs text-gray-500">
                        {new Date(deal.updated_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })} às {new Date(deal.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {notes.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">
                          {notes.length} nota{notes.length > 1 ? 's' : ''} adicionada{notes.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          Última nota em {new Date(notes[0]?.created_at || deal.updated_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Notas do Negócio
                </h3>
                <button
                  onClick={() => setIsAddNoteModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nova Nota</span>
                </button>
              </div>

              {isNotesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Carregando notas...</span>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma nota ainda</h3>
                  <p className="text-gray-500 mb-4">Adicione a primeira nota para este negócio</p>
                  <button
                    onClick={() => setIsAddNoteModalOpen(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Adicionar Nota</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {(note.user_name || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{note.user_name || 'Usuário'}</p>
                            <p className="text-xs text-gray-500">{formatDate(note.created_at)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer com Botões */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isUpdating}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Salvar</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Editar</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Adicionar Nota */}
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        businessId={deal?.business_id || ''}
        onNoteAdded={handleNotesReload}
      />
    </div>
  );
}
