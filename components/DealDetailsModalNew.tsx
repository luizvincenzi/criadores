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
  updated_at: string;
  plan: string;
}

interface BusinessDetails {
  id: string;
  name: string;
  categoria: string;
  cidade: string;
  responsavel: string;
  nomeResponsavel: string;
  whatsappResponsavel: string;
  instagram: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  note_type: string;
  business_id: string;
  user_id: string;
}

interface DealDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal | null;
  onDealUpdate: (updatedDeal: Deal) => void;
}

export default function DealDetailsModalNew({ isOpen, onClose, deal, onDealUpdate }: DealDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [tempStage, setTempStage] = useState('');
  const [tempValue, setTempValue] = useState('');
  const [tempPriority, setTempPriority] = useState('');

  useEffect(() => {
    if (isOpen && deal) {
      loadBusinessDetails();
      loadNotes();
      setTempStage(deal.stage);
      setTempValue(deal.estimated_value.toString());
      setTempPriority(deal.priority);
    }
  }, [isOpen, deal]);

  const getDaysInStage = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const loadBusinessDetails = async () => {
    if (!deal?.business_id) return;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(deal.business_id)) {
      console.error('❌ Business ID não é um UUID válido:', deal.business_id);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/supabase/businesses?id=${deal.business_id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          const business = data.data[0];
          if (business.id === deal.business_id) {
            setBusinessDetails(business);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do business:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    if (!deal?.business_id) return;
    setIsNotesLoading(true);
    try {
      console.log('🔍 Carregando notas para business_id:', deal.business_id);
      const response = await fetch(`/api/notes?business_id=${deal.business_id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notas carregadas:', data);
        setNotes(data.notes || []);
      } else {
        console.error('❌ Erro ao carregar notas:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar notas:', error);
    } finally {
      setIsNotesLoading(false);
    }
  };

  const handleSaveAll = async () => {
    if (!deal) return;

    // Verificar se houve mudanças
    const hasChanges =
      tempStage !== deal.stage ||
      tempValue !== deal.estimated_value.toString() ||
      tempPriority !== deal.priority;

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      console.log('🔄 Salvando alterações:', {
        dealId: deal.id,
        stage: tempStage,
        estimated_value: parseFloat(tempValue),
        priority: tempPriority
      });

      const response = await fetch('/api/deals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: deal.id,
          stage: tempStage,
          estimated_value: parseFloat(tempValue),
          priority: tempPriority,
          previous_stage: deal.stage
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Alterações salvas com sucesso:', responseData);

        // Usar o deal retornado pela API se disponível
        const updatedDeal = responseData.deal || {
          ...deal,
          stage: tempStage,
          estimated_value: parseFloat(tempValue),
          priority: tempPriority
        };

        // Atualizar o deal se a função foi fornecida
        if (typeof onDealUpdate === 'function') {
          onDealUpdate(updatedDeal);
        } else {
          console.warn('⚠️ onDealUpdate não é uma função válida');
        }

        setIsEditing(false);
      } else {
        console.error('❌ Erro na resposta:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('❌ Detalhes do erro:', errorData);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar alterações:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setTempStage(deal?.stage || '');
    setTempValue(deal?.estimated_value.toString() || '0');
    setTempPriority(deal?.priority || 'Média');
    setIsEditing(false);
  };

  const handleNotesReload = () => {
    loadNotes();
  };

  const startEditingNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const cancelEditingNote = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const saveEditedNote = async (noteId: string) => {
    if (!editingContent.trim()) {
      alert('O conteúdo da nota não pode estar vazio');
      return;
    }

    try {
      console.log('✏️ Salvando edição da nota:', { noteId, content: editingContent });

      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: noteId,
          content: editingContent.trim()
        })
      });

      if (response.ok) {
        console.log('✅ Nota editada com sucesso');
        setEditingNoteId(null);
        setEditingContent('');
        loadNotes(); // Recarregar notas
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('❌ Erro ao editar nota:', errorData);
        alert('Erro ao editar nota: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('❌ Erro ao editar nota:', error);
      alert('Erro de conexão ao editar nota');
    }
  };

  if (!isOpen || !deal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col border border-gray-100">
        {/* Header com Estilo Azul */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
          {isUpdating && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-20 rounded-t-2xl">
              <div className="flex items-center space-x-2 bg-white rounded-xl px-4 py-3 shadow-lg border border-gray-200">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm font-medium text-gray-700">Salvando...</span>
              </div>
            </div>
          )}

          <div className="p-6 border-b border-blue-500/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{deal?.business_name || 'Empresa'}</h1>
                  <p className="text-blue-100 mt-1">
                    {getDaysInStage(deal?.current_stage_since || new Date().toISOString())} dias na etapa •
                    Criado em {formatDate(deal?.created_at || new Date().toISOString())}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs com Estilo Azul */}
            <div className="flex mt-6 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'info'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Visão Geral</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'notes'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Notas</span>
                {notes.length > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center ${
                    activeTab === 'notes'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-white/20 text-white'
                  }`}>
                    {notes.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo com Scroll Fixo */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="mt-3 text-gray-600 text-sm">Carregando...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Header com Botão de Editar */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Informações do Negócio</h2>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Editar</span>
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveAll}
                          disabled={isUpdating}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors disabled:opacity-50"
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
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Cancelar</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cards com Bordas Totalmente Arredondadas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card Etapa */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                      <div className="mb-4">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Etapa</span>
                      </div>
                      {isEditing ? (
                        <select
                          value={tempStage}
                          onChange={(e) => setTempStage(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50"
                        >
                          <option value="Leads próprios frios">Leads próprios frios</option>
                          <option value="Leads próprios quentes">Leads próprios quentes</option>
                          <option value="Leads indicados">Leads indicados</option>
                          <option value="Enviando proposta">Enviando proposta</option>
                          <option value="Marcado reunião">Marcado reunião</option>
                          <option value="Reunião realizada">Reunião realizada</option>
                          <option value="Follow up">Follow up</option>
                          <option value="Negócio Fechado">Negócio Fechado</option>
                          <option value="Contrato assinado">Contrato assinado</option>
                          <option value="Declinado">Declinado</option>
                        </select>
                      ) : (
                        <div>
                          <p className="text-lg font-bold text-gray-900">{deal.stage}</p>
                          <p className="text-xs text-gray-500 mt-1">Status ativo</p>
                        </div>
                      )}
                    </div>

                    {/* Card Valor */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                      <div className="mb-4">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Valor Estimado</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-gray-50"
                          placeholder="0,00"
                          step="0.01"
                        />
                      ) : (
                        <div>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(deal.estimated_value)}</p>
                          <p className="text-xs text-gray-500 mt-1">Potencial de receita</p>
                        </div>
                      )}
                    </div>

                    {/* Card Prioridade */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                      <div className="mb-4">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prioridade</span>
                      </div>
                      {isEditing ? (
                        <select
                          value={tempPriority}
                          onChange={(e) => setTempPriority(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm bg-gray-50"
                        >
                          <option value="Baixa">Baixa</option>
                          <option value="Média">Média</option>
                          <option value="Alta">Alta</option>
                        </select>
                      ) : (
                        <div>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${
                            deal.priority === 'Alta' ? 'bg-red-100 text-red-700' :
                            deal.priority === 'Média' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {deal.priority}
                          </span>
                          <p className="text-xs text-gray-500 mt-2">Nível de urgência</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações da Empresa */}
                  {businessDetails && (
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Empresa</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {businessDetails.categoria && (
                          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 mb-2">Categoria</p>
                            <p className="text-sm font-medium text-gray-900">{businessDetails.categoria}</p>
                          </div>
                        )}

                        {businessDetails.cidade && (
                          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 mb-2">Cidade</p>
                            <p className="text-sm font-medium text-gray-900">{businessDetails.cidade}</p>
                          </div>
                        )}

                        {businessDetails.responsavel && (
                          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 mb-2">Responsável</p>
                            <p className="text-sm font-medium text-gray-900">{businessDetails.responsavel}</p>
                          </div>
                        )}

                        {businessDetails.nomeResponsavel && (
                          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 mb-2">Contato</p>
                            <p className="text-sm font-medium text-gray-900">{businessDetails.nomeResponsavel}</p>
                          </div>
                        )}
                      </div>

                      {/* Ações Rápidas */}
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {businessDetails.whatsappResponsavel && (
                          <button
                            onClick={() => {
                              const phone = businessDetails.whatsappResponsavel.replace(/\D/g, '');
                              const message = `Olá! Sou da equipe CRM crIAdores. Como posso ajudar?`;
                              window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382z"/>
                            </svg>
                            <span>WhatsApp</span>
                          </button>
                        )}

                        {businessDetails.instagram && (
                          <button
                            onClick={() => {
                              const username = businessDetails.instagram.replace('@', '');
                              window.open(`https://instagram.com/${username}`, '_blank');
                            }}
                            className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            <span>Instagram</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Histórico Simples */}
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Criado em {formatDate(deal.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Movido para "{deal.stage}"</span>
                      </div>
                      {notes.length > 0 && notes.map((note, index) => (
                        <div key={note.id} className="flex items-center space-x-3 text-sm">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Nota adicionada</span>
                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                              {new Date(note.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Notas</h3>
                <button
                  onClick={() => setIsAddNoteModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Nova Nota</span>
                </button>
              </div>

              {isNotesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="ml-2 text-gray-600 text-sm">Carregando...</span>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p className="text-gray-500 text-sm mb-3">Nenhuma nota ainda</p>
                  <button
                    onClick={() => setIsAddNoteModalOpen(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Adicionar</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => {
                    const getNoteIcon = (type: string) => {
                      switch (type) {
                        case 'internal': return '🔒';
                        case 'client_facing': return '👥';
                        case 'stage_change': return '🔄';
                        default: return '📋';
                      }
                    };

                    const isEditing = editingNoteId === note.id;
                    const wasEdited = note.updated_at && note.updated_at !== note.created_at;

                    return (
                      <div key={note.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getNoteIcon(note.note_type)}</span>
                            <span className="text-sm font-medium text-gray-900">{note.user_name}</span>
                            {wasEdited && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                ✏️ Editada
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-xs text-gray-500 text-right">
                              <div>Criada: {formatDate(note.created_at)}</div>
                              {wasEdited && (
                                <div>Editada: {formatDate(note.updated_at)}</div>
                              )}
                            </div>
                            {!isEditing && (
                              <button
                                onClick={() => startEditingNote(note)}
                                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                title="Editar nota"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="space-y-3">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={3}
                              placeholder="Digite o conteúdo da nota..."
                              maxLength={1000}
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {editingContent.length}/1000 caracteres
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={cancelEditingNote}
                                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => saveEditedNote(note.id)}
                                  disabled={!editingContent.trim()}
                                  className="px-4 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Salvar
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 leading-relaxed">{note.content}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        businessId={deal?.business_id || ''}
        userId="00000000-0000-0000-0000-000000000001"
        onNoteAdded={handleNotesReload}
      />
    </div>
  );
}
