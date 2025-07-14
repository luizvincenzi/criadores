'use client';

import React, { useState, useEffect } from 'react';
import { CampaignJourneyData } from '@/app/actions/sheetsActions';
import { useAuthStore } from '@/store/authStore';

interface CampaignJourneyModalProps {
  campaign: CampaignJourneyData | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

export default function CampaignJourneyModal({ campaign, isOpen, onClose, onStatusUpdate }: CampaignJourneyModalProps) {
  const { user } = useAuthStore();
  const [currentStatus, setCurrentStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState<any[]>([]);
  const [creatorSlots, setCreatorSlots] = useState<any[]>([]);
  const [availableCreators, setAvailableCreators] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [pendingRemovals, setPendingRemovals] = useState<any[]>([]);

  // Função para converter data do formato brasileiro para datetime-local
  const formatDateForInput = (dateString: string): string => {
    if (!dateString || dateString === '-') return '';

    try {
      // Se já está no formato correto (yyyy-MM-ddThh:mm), retorna como está
      if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)) {
        return dateString;
      }

      // Tenta converter formatos brasileiros como "21/Jul 0:00" ou "21/07/2024 14:30"
      let date: Date;

      if (dateString.includes('/')) {
        // Formato brasileiro: "21/Jul 0:00" ou "21/07/2024 14:30"
        const parts = dateString.split(' ');
        const datePart = parts[0];
        const timePart = parts[1] || '00:00';

        if (datePart.includes('Jul')) {
          // Formato "21/Jul" - assumir ano atual
          const day = datePart.split('/')[0];
          const year = new Date().getFullYear();
          date = new Date(`${year}-07-${day.padStart(2, '0')}T${timePart}`);
        } else {
          // Formato "21/07/2024"
          const [day, month, year] = datePart.split('/');
          date = new Date(`${year || new Date().getFullYear()}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart}`);
        }
      } else {
        // Tentar parse direto
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        return '';
      }

      // Retorna no formato yyyy-MM-ddThh:mm
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.warn('Erro ao formatar data:', dateString, error);
      return '';
    }
  };

  useEffect(() => {
    if (campaign) {
      setCurrentStatus(campaign.journeyStage);
      loadCreatorSlots();
    }
  }, [campaign]);

  const loadCreatorSlots = async () => {
    if (!campaign) return;

    setIsLoadingSlots(true);
    try {
      console.log('🔄 Carregando slots de criadores...');
      console.log('📊 DEBUG: Dados da campanha:', {
        businessName: campaign.businessName,
        mes: campaign.mes,
        quantidadeCriadores: campaign.quantidadeCriadores,
        totalCampaigns: campaign.totalCampaigns,
        campaignObject: campaign
      });

      // Usar totalCampaigns como fallback se quantidadeCriadores não estiver disponível
      const quantidadeContratada = campaign.quantidadeCriadores || campaign.totalCampaigns || 6;

      console.log('📤 Enviando para API:', {
        businessName: campaign.businessName,
        mes: campaign.mes,
        quantidadeContratada
      });

      // Adicionar timestamp para evitar cache
      const timestamp = Date.now();
      const requestPayload = {
        businessName: campaign.businessName,
        mes: campaign.mes,
        quantidadeContratada,
        _timestamp: timestamp
      };

      console.log('🚀 Fazendo fetch para /api/get-creator-slots com payload:', requestPayload);

      const response = await fetch('/api/get-creator-slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(requestPayload)
      });

      console.log('📡 Resposta da API recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        const responseText = await response.text();
        console.log('📄 Resposta raw da API (primeiros 500 chars):', responseText.substring(0, 500));
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        console.error('❌ Resposta que causou o erro:', await response.text());
        throw new Error(`Erro ao processar resposta da API: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      if (result.success) {
        console.log('🔍 DEBUG: Dados recebidos da API:', result.slots);

        // Verificar tipos de dados para debug
        result.slots.forEach((slot, index) => {
          console.log(`🔍 Slot ${index} (${slot.influenciador}):`, {
            briefingCompleto: { value: slot.briefingCompleto, type: typeof slot.briefingCompleto },
            visitaConfirmado: { value: slot.visitaConfirmado, type: typeof slot.visitaConfirmado },
            videoAprovado: { value: slot.videoAprovado, type: typeof slot.videoAprovado },
            videoPostado: { value: slot.videoPostado, type: typeof slot.videoPostado }
          });
        });

        setCreatorSlots(result.slots);
        setAvailableCreators(result.availableCreators);
        setEditedData(result.slots);
        console.log(`✅ ${result.slots.length} slots de criadores carregados`);
      } else {
        console.error('❌ Erro ao carregar slots:', result.error);
        // Fallback para dados vazios
        const quantidadeContratada = campaign.quantidadeCriadores || campaign.totalCampaigns || 6;
        const emptySlots = Array.from({ length: quantidadeContratada }, (_, i) => ({
          index: i,
          influenciador: '',
          briefingCompleto: 'pendente',
          dataHoraVisita: '',
          quantidadeConvidados: '',
          visitaConfirmado: 'pendente',
          dataHoraPostagem: '',
          videoAprovado: 'pendente',
          videoPostado: 'pendente',
          isExisting: false
        }));
        setCreatorSlots(emptySlots);
        setEditedData(emptySlots);
        setAvailableCreators([]);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar slots:', error);
      console.error('❌ Detalhes do erro:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      // Fallback para dados vazios
      const emptySlots = Array.from({ length: campaign.quantidadeCriadores }, (_, i) => ({
        index: i,
        influenciador: '',
        briefingCompleto: 'pendente',
        dataHoraVisita: '',
        quantidadeConvidados: '',
        visitaConfirmado: 'pendente',
        dataHoraPostagem: '',
        videoAprovado: 'pendente',
        videoPostado: 'pendente',
        isExisting: false
      }));
      setCreatorSlots(emptySlots);
      setEditedData(emptySlots);
      setAvailableCreators([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  if (!isOpen || !campaign) return null;

  // Opções de status da jornada
  const statusOptions = [
    { value: 'Reunião Briefing', label: 'Reunião Briefing', icon: '📋', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'Agendamentos', label: 'Agendamentos', icon: '📅', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { value: 'Entrega Final', label: 'Entrega Final', icon: '✅', color: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'Finalizado', label: 'Finalizado', icon: '🏁', color: 'bg-gray-50 text-gray-700 border-gray-200' }
  ];

  const getStatusOption = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || isUpdatingStatus) return;

    setIsUpdatingStatus(true);

    try {
      console.log(`🔄 Atualizando status da campanha: ${campaign.businessName} - ${campaign.mes}: ${currentStatus} → ${newStatus}`);

      const response = await fetch('/api/update-campaign-status-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: campaign.businessName,
          mes: campaign.mes,
          oldStatus: currentStatus,
          newStatus: newStatus,
          user: user?.email || 'Sistema'
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Status da campanha atualizado via audit_log');
        setCurrentStatus(newStatus);

        // Aguardar um pouco para garantir que o audit_log foi processado
        setTimeout(() => {
          if (newStatus === 'Finalizado') {
            alert('✅ Campanha finalizada! Ela será removida da jornada.');
          } else {
            alert(`✅ Status atualizado para: ${newStatus}`);
          }
          onStatusUpdate();
        }, 1000);
      } else {
        console.error('❌ Erro ao atualizar status:', result.error);
        alert(`❌ Erro ao atualizar status: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      alert('❌ Erro ao atualizar status. Tente novamente.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatWhatsAppLink = (whatsapp: string): string | null => {
    if (!whatsapp) return null;
    const cleanNumber = whatsapp.replace(/[^\d]/g, '');
    if (cleanNumber.length >= 10) {
      return `https://wa.me/55${cleanNumber}`;
    }
    return null;
  };

  const handleWhatsAppClick = () => {
    const whatsappNumber = campaign.businessData?.whatsappResponsavel;
    const whatsappLink = formatWhatsAppLink(whatsappNumber || '');
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    }
  };

  const updateCreatorData = (index: number, field: string, value: string) => {
    const newEditedData = [...editedData];
    newEditedData[index] = { ...newEditedData[index], [field]: value };
    setEditedData(newEditedData);
  };

  const handleAddNewCreator = () => {
    const newSlot = {
      index: creatorSlots.length,
      influenciador: '',
      briefingCompleto: 'pendente',
      dataHoraVisita: '',
      quantidadeConvidados: '',
      visitaConfirmado: 'pendente',
      dataHoraPostagem: '',
      videoAprovado: 'pendente',
      videoPostado: 'pendente',
      isExisting: false
    };

    const newCreatorSlots = [...creatorSlots, newSlot];
    const newEditedData = [...editedData, newSlot];

    setCreatorSlots(newCreatorSlots);
    setEditedData(newEditedData);

    console.log(`➕ Novo slot de criador adicionado. Total: ${newCreatorSlots.length}`);
  };

  const handleDeleteCreator = (index: number) => {
    if (creatorSlots.length <= 1) {
      alert('Não é possível remover o último criador. Uma campanha deve ter pelo menos um slot.');
      return;
    }

    const confirmDelete = window.confirm('Tem certeza que deseja remover este criador?');
    if (!confirmDelete) return;

    // Adicionar à lista de remoções pendentes
    const creatorToRemove = creatorSlots[index];
    setPendingRemovals(prev => [...prev, {
      index: index,
      creatorData: creatorToRemove
    }]);

    const newCreatorSlots = creatorSlots.filter((_, i) => i !== index);
    const newEditedData = editedData.filter((_, i) => i !== index);

    // Reindexar os slots restantes
    const reindexedSlots = newCreatorSlots.map((slot, i) => ({ ...slot, index: i }));
    const reindexedEditedData = newEditedData.map((slot, i) => ({ ...slot, index: i }));

    setCreatorSlots(reindexedSlots);
    setEditedData(reindexedEditedData);

    console.log(`🗑️ Slot de criador removido. Total restante: ${reindexedSlots.length}`);
    console.log(`📝 Remoção pendente adicionada:`, creatorToRemove);
  };

  const handleSaveChanges = async () => {
    if (!campaign) return;

    setIsSaving(true);
    try {
      console.log('💾 Salvando alterações dos criadores...');
      console.log('📊 Dados da campanha:', {
        businessName: campaign.businessName,
        mes: campaign.mes,
        id: campaign.id
      });
      console.log('📝 Dados editados:', editedData);

      // DEBUG: Primeiro enviar para API de debug
      const debugPayload = {
        businessName: campaign.businessName,
        mes: campaign.mes,
        creatorsData: editedData,
        user: user?.email || 'Sistema',
        campaignId: campaign.primaryCampaignId || campaign.campaignIds?.[0] || campaign.id
      };

      console.log('🔍 DEBUG: Enviando dados para debug:', debugPayload);

      const debugResponse = await fetch('/api/debug-modal-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(debugPayload)
      });

      const debugResult = await debugResponse.json();
      console.log('🔍 DEBUG: Resposta do debug:', debugResult);

      // Detectar mudanças: trocas, adições e remoções
      const creatorChanges = [];
      const addedCreators = [];
      const removedCreators = [...pendingRemovals]; // Usar remoções pendentes

      // Detectar trocas e atualizações
      for (let i = 0; i < editedData.length; i++) {
        const editedCreator = editedData[i];
        // Comparar com o estado original carregado, não com creatorSlots atual
        const originalCreator = creatorSlots[i];

        if (originalCreator && editedCreator.influenciador !== originalCreator.influenciador) {
          creatorChanges.push({
            index: i,
            oldCreator: originalCreator.influenciador,
            newCreator: editedCreator.influenciador,
            newCreatorData: editedCreator
          });
        }
      }

      // Detectar criadores adicionados (comparar com estado original)
      const originalSlotsCount = creatorSlots.length + pendingRemovals.length;
      if (editedData.length > originalSlotsCount) {
        for (let i = originalSlotsCount; i < editedData.length; i++) {
          addedCreators.push({
            index: i,
            creatorData: editedData[i]
          });
        }
      }

      console.log('🔄 Mudanças detectadas:', {
        trocas: creatorChanges,
        adicionados: addedCreators,
        removidos: removedCreators
      });

      let response;
      let result;

      // Processar todas as mudanças
      const hasChanges = creatorChanges.length > 0 || addedCreators.length > 0 || removedCreators.length > 0;

      if (hasChanges) {
        console.log('🔄 Processando mudanças nos criadores...');

        const allResults = [];

        // 1. Processar trocas de criadores
        for (const change of creatorChanges) {
          const changeResponse = await fetch('/api/change-campaign-creator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId: campaign.primaryCampaignId || campaign.campaignIds?.[0] || campaign.id,
              businessName: campaign.businessName,
              mes: campaign.mes,
              oldCreator: change.oldCreator,
              newCreator: change.newCreator,
              newCreatorData: change.newCreatorData,
              user: user?.email || 'Sistema'
            })
          });

          const changeResult = await changeResponse.json();
          allResults.push({ type: 'troca', result: changeResult });
        }

        // 2. Processar adições de criadores
        for (const addition of addedCreators) {
          const addResponse = await fetch('/api/add-campaign-creator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessName: campaign.businessName,
              mes: campaign.mes,
              creatorData: addition.creatorData,
              user: user?.email || 'Sistema'
            })
          });

          const addResult = await addResponse.json();
          allResults.push({ type: 'adicao', result: addResult });
        }

        // 3. Processar remoções de criadores
        for (const removal of removedCreators) {
          const removeResponse = await fetch('/api/remove-campaign-creator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessName: campaign.businessName,
              mes: campaign.mes,
              creatorData: removal.creatorData,
              user: user?.email || 'Sistema'
            })
          });

          const removeResult = await removeResponse.json();
          allResults.push({ type: 'remocao', result: removeResult });
        }

        // Consolidar resultados
        const allSuccessful = allResults.every(r => r.result.success);
        const totalChanges = creatorChanges.length + addedCreators.length + removedCreators.length;

        result = {
          success: allSuccessful,
          message: allSuccessful
            ? `✅ ${totalChanges} alteração(ões) realizada(s) com sucesso!`
            : `❌ Erro em algumas alterações`,
          allResults,
          updatedCount: allSuccessful ? totalChanges : 0
        };
      } else {
        console.log('📝 Usando API de atualização normal...');

        // Usar API normal para atualizações (versão estável)
        response = await fetch('/api/update-campaign-creators', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(debugPayload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro HTTP:', response.status, response.statusText, errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const responseText = await response.text();
        console.log('🔍 DEBUG: Resposta bruta da API:', responseText);

        if (!responseText || responseText.trim() === '') {
          throw new Error('Resposta vazia da API');
        }

        try {
          result = JSON.parse(responseText);
          if (!result) {
            throw new Error('Resultado JSON é null ou undefined');
          }
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse da resposta:', parseError);
          console.error('❌ Resposta recebida:', responseText);
          throw new Error(`Resposta inválida da API: ${responseText.substring(0, 100)}...`);
        }
      }

      console.log('🔍 DEBUG: Resultado final:', result);
      console.log('🔍 DEBUG: Tipo do resultado:', typeof result);
      console.log('🔍 DEBUG: Resultado é null?', result === null);
      console.log('🔍 DEBUG: Resultado é undefined?', result === undefined);

      if (!result) {
        const errorMsg = 'Resultado da API é null ou undefined';
        console.error('❌ Erro crítico:', errorMsg);
        alert(`❌ Erro crítico: ${errorMsg}`);
        return;
      }

      if (result.success === true) {
        console.log('✅ Dados dos criadores atualizados');
        const successMessage = result.message || `Dados atualizados com sucesso para ${result.updatedCount || 0} criadores!`;
        alert(`✅ ${successMessage}`);
        setIsEditMode(false);
        setPendingRemovals([]); // Limpar remoções pendentes

        // Recarregar apenas os slots de criadores sem fechar o modal
        await loadCreatorSlots();
      } else {
        const errorMessage = result?.error || result?.message || `Falha na operação (success: ${result?.success})`;
        console.error('❌ Erro ao salvar:', errorMessage);
        console.error('❌ Detalhes completos:', result);
        alert(`❌ Erro ao salvar: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar alterações:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`❌ Erro ao salvar alterações: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-7xl bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[95vh] overflow-hidden">
          
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {campaign.businessName}
                </h2>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Campanha de {campaign.mes}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {campaign.totalCampanhas} campanhas
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(95vh-200px)] overflow-y-auto">
            
            {/* Status da Jornada - Editável */}
            <div className="mb-8 bg-blue-50 rounded-lg p-4 border border-blue-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status da Jornada da Campanha
              </label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white text-base font-medium shadow-sm"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Badge visual do status atual */}
                <span className={`inline-flex items-center px-4 py-3 rounded-lg text-sm font-medium ${getStatusOption(currentStatus).color} border shadow-sm`}>
                  <span className="mr-2">{getStatusOption(currentStatus).icon}</span>
                  {getStatusOption(currentStatus).label}
                </span>
                
                {isUpdatingStatus && (
                  <div className="flex items-center text-blue-600">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm font-medium">Atualizando...</span>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-600 mt-3 flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Alterar para "Finalizado" remove a campanha da jornada
              </p>
            </div>

            {/* Grid de Informações */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Coluna Esquerda: Informações do Business */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Informações do Business
                </h3>
                
                {campaign.businessData?.planoAtual && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="text-sm font-medium text-blue-600 uppercase tracking-wide">Plano Atual</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{campaign.businessData.planoAtual}</p>
                  </div>
                )}

                {campaign.businessData?.nomeResponsavel && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="text-sm font-medium text-blue-600 uppercase tracking-wide">Responsável do Cliente</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{campaign.businessData.nomeResponsavel}</p>
                  </div>
                )}

                {campaign.businessData?.whatsappResponsavel && (
                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 transition-all duration-200 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    <span className="font-semibold">Conversar no WhatsApp</span>
                  </button>
                )}
              </div>

              {/* Coluna Direita: Estatísticas da Campanha */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                  Estatísticas da Campanha
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm text-center">
                    <div className="text-2xl font-bold text-blue-600">{campaign.totalCampanhas}</div>
                    <div className="text-sm text-gray-600">Total de Campanhas</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm text-center">
                    <div className="text-2xl font-bold text-green-600">{campaign.quantidadeCriadores}</div>
                    <div className="text-sm text-gray-600">Criadores Contratados</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Criadores da Campanha */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Criadores da Campanha ({campaign.quantidadeCriadores} contratados)
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={loadCreatorSlots}
                    disabled={isLoadingSlots}
                    className="px-4 py-2 rounded-lg font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                  >
                    {isLoadingSlots ? '🔄 Carregando...' : '🔄 Recarregar'}
                  </button>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isEditMode
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isEditMode ? '❌ Cancelar Edição' : '✏️ Habilitar Edição'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Criador
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Briefing Enviado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data/Hora Visita
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qtd. Convidados
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visita Confirmada
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data/Hora Postagem
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vídeo Aprovado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vídeo Postado
                        </th>
                        {isEditMode && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingSlots ? (
                        <tr>
                          <td colSpan={isEditMode ? 9 : 8} className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                              <span className="text-gray-600">Carregando criadores...</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        creatorSlots.map((slot, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="w-full">
                                {isEditMode ? (
                                  <div className="space-y-2">
                                    {/* Criador Selecionado - Visual Card */}
                                    {editedData[index]?.influenciador ? (
                                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                              </svg>
                                            </div>
                                            <div>
                                              <div className="font-semibold text-green-900 text-sm">
                                                {editedData[index]?.influenciador}
                                              </div>
                                              <div className="text-xs text-green-700">
                                                {availableCreators.find(c => c.nome === editedData[index]?.influenciador)?.cidade || 'Cidade não informada'}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                                            ✅ Selecionado
                                          </div>
                                        </div>
                                      </div>
                                    ) : null}

                                    {/* Dropdown de Seleção */}
                                    <select
                                      value={editedData[index]?.influenciador || ''}
                                      onChange={(e) => updateCreatorData(index, 'influenciador', e.target.value)}
                                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base font-medium transition-all ${
                                        editedData[index]?.influenciador
                                          ? 'border-green-300 bg-white text-gray-700'
                                          : 'border-gray-300 bg-white text-gray-700'
                                      }`}
                                    >
                                      <option value="">
                                        {editedData[index]?.influenciador ? '🔄 Trocar criador...' : '🔍 Selecionar criador...'}
                                      </option>
                                      {availableCreators.map((creator) => (
                                        <option key={creator.id} value={creator.nome}>
                                          👤 {creator.nome} - 📍 {creator.cidade}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ) : (
                                  <div>
                                    {slot.influenciador ? (
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="font-semibold text-gray-900 text-base">
                                            {slot.influenciador}
                                          </div>
                                          <div className="text-sm text-gray-600">
                                            {availableCreators.find(c => c.nome === slot.influenciador)?.cidade || 'Cidade não informada'}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                          </svg>
                                        </div>
                                        <div>
                                          <div className="text-gray-400 italic text-base">
                                            Criador não selecionado
                                          </div>
                                          <div className="text-xs text-gray-400">
                                            Clique em "Editar" para selecionar
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditMode ? (
                              <select
                                value={editedData[index]?.briefingCompleto || 'pendente'}
                                onChange={(e) => updateCreatorData(index, 'briefingCompleto', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="sim">✅ Sim</option>
                                <option value="nao">❌ Não</option>
                                <option value="pendente">⏳ Pendente</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                String(slot.briefingCompleto || '').toLowerCase() === 'sim'
                                  ? 'bg-green-100 text-green-800'
                                  : String(slot.briefingCompleto || '').toLowerCase() === 'nao'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {slot.briefingCompleto || 'Pendente'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditMode ? (
                              <input
                                type="datetime-local"
                                value={formatDateForInput(editedData[index]?.dataHoraVisita || slot.dataHoraVisita || '')}
                                onChange={(e) => updateCreatorData(index, 'dataHoraVisita', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {slot.dataHoraVisita || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditMode ? (
                              <input
                                type="number"
                                value={editedData[index]?.quantidadeConvidados || ''}
                                onChange={(e) => updateCreatorData(index, 'quantidadeConvidados', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {slot.quantidadeConvidados || '0'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditMode ? (
                              <select
                                value={editedData[index]?.visitaConfirmado || 'pendente'}
                                onChange={(e) => updateCreatorData(index, 'visitaConfirmado', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="sim">✅ Confirmada</option>
                                <option value="nao">❌ Não Confirmada</option>
                                <option value="pendente">⏳ Pendente</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                String(slot.visitaConfirmado || '').toLowerCase() === 'sim'
                                  ? 'bg-green-100 text-green-800'
                                  : String(slot.visitaConfirmado || '').toLowerCase() === 'nao'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {slot.visitaConfirmado || 'Pendente'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditMode ? (
                              <input
                                type="datetime-local"
                                value={formatDateForInput(editedData[index]?.dataHoraPostagem || slot.dataHoraPostagem || '')}
                                onChange={(e) => updateCreatorData(index, 'dataHoraPostagem', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {slot.dataHoraPostagem || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditMode ? (
                              <select
                                value={editedData[index]?.videoAprovado || 'pendente'}
                                onChange={(e) => updateCreatorData(index, 'videoAprovado', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="sim">✅ Aprovado</option>
                                <option value="nao">❌ Não Aprovado</option>
                                <option value="pendente">⏳ Pendente</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                String(slot.videoAprovado || '').toLowerCase() === 'sim'
                                  ? 'bg-green-100 text-green-800'
                                  : String(slot.videoAprovado || '').toLowerCase() === 'nao'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {slot.videoAprovado || 'Pendente'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditMode ? (
                              <select
                                value={editedData[index]?.videoPostado || 'pendente'}
                                onChange={(e) => updateCreatorData(index, 'videoPostado', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="sim">✅ Postado</option>
                                <option value="nao">❌ Não Postado</option>
                                <option value="pendente">⏳ Pendente</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                String(slot.videoPostado || '').toLowerCase() === 'sim'
                                  ? 'bg-green-100 text-green-800'
                                  : String(slot.videoPostado || '').toLowerCase() === 'nao'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {slot.videoPostado || 'Pendente'}
                              </span>
                            )}
                          </td>
                          {isEditMode && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleDeleteCreator(index)}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
                                title="Remover criador"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remover
                              </button>
                            </td>
                          )}
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Botão para Adicionar Novo Criador */}
                {isEditMode && (
                  <div className="bg-blue-50 px-6 py-4 border-t border-gray-200">
                    <button
                      onClick={handleAddNewCreator}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Adicionar Novo Criador
                    </button>
                  </div>
                )}

                {/* Botões de Ação para Modo de Edição */}
                {isEditMode && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => {
                          setIsEditMode(false);
                          setPendingRemovals([]); // Limpar remoções pendentes ao cancelar
                          loadCreatorSlots(); // Recarregar dados originais
                        }}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Salvando...</span>
                          </>
                        ) : (
                          <>
                            <span>💾</span>
                            <span>Salvar Alterações</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
