'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getApiUrl, isUsingSupabase } from '@/lib/dataSource';
import { useCampaignSlots } from '@/hooks/useCampaignSlots';
import { useCreatorToast } from '@/hooks/useToast';
import { useBulkOperations } from '@/hooks/useBulkOperations';
import { BulkOperationsPanel } from '@/components/ui/BulkOperationsPanel';

// Tipo local para dados da jornada de campanhas
interface CampaignJourneyData {
  id: string;
  businessName: string;
  businessId: string;
  mes: string;
  journeyStage: string;
  totalCampanhas: number;
  quantidadeCriadores: number;
  criadores: any[];
  campanhas: any[];
}

interface CampaignJourneyModalProps {
  campaign: CampaignJourneyData | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: () => void;
}

// Função para formatar a data de YYYYMM para "Mmm YY"
function formatMonthYear(monthYear: string): string {
  if (!monthYear || monthYear.length !== 6) return monthYear;

  const year = monthYear.substring(0, 4);
  const month = monthYear.substring(4, 6);

  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  const monthIndex = parseInt(month) - 1;
  const shortYear = year.substring(2, 4);

  if (monthIndex >= 0 && monthIndex < 12) {
    return `${monthNames[monthIndex]} ${shortYear}`;
  }

  return monthYear;
}

export default function CampaignJourneyModal({ campaign, isOpen, onClose, onStatusUpdate }: CampaignJourneyModalProps) {
  const { user } = useAuthStore();
  const [currentStatus, setCurrentStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState<any[]>([]);
  const [pendingRemovals, setPendingRemovals] = useState<any[]>([]);

  // 🚀 NOVO: Hook de auto-refresh para slots de criadores
  const {
    slots: creatorSlots,
    availableCreators,
    campaignId,
    loading: isLoadingSlots,
    error: slotsError,
    validation,
    refresh: refreshSlots,
    addCreator,
    removeCreator,
    swapCreator,
    isAdding,
    isRemoving,
    lastUpdated
  } = useCampaignSlots(
    campaign?.businessName || '',
    campaign?.mes || '',
    0 // Sem auto-refresh automático - apenas manual
  );

  // 🍞 Toast notifications
  const {
    notifyCreatorAdded,
    notifyCreatorRemoved,
    notifyCreatorSwapped,
    notifyError,
    notifyLoading
  } = useCreatorToast();

  // 🔄 Bulk operations
  const bulkOps = useBulkOperations(
    creatorSlots,
    addCreator,
    removeCreator,
    swapCreator
  );

  // Função para fechar modal e cancelar modo edição
  const handleClose = () => {
    setIsEditMode(false);
    setPendingRemovals([]);
    onClose();
  };

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

  // 🔄 Atualizar status quando campanha mudar
  useEffect(() => {
    if (campaign) {
      setCurrentStatus(campaign.journeyStage);
      // O hook useCampaignSlots já carrega automaticamente os dados
    }
  }, [campaign]);

  // 🔄 Sincronizar editedData com creatorSlots quando dados mudarem
  useEffect(() => {
    if (creatorSlots.length > 0) {
      setEditedData([...creatorSlots]);
    }
  }, [creatorSlots]);

  // 🍞 Mostrar erros via toast
  useEffect(() => {
    if (slotsError) {
      notifyError('carregar dados', slotsError);
    }
  }, [slotsError, notifyError]);

  if (!isOpen || !campaign) return null;

  // Opções de status da jornada
  const statusOptions = [
    { value: 'Reunião de briefing', label: 'Reunião de briefing', icon: '📋', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'Agendamentos', label: 'Agendamentos', icon: '📅', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { value: 'Entrega final', label: 'Entrega final', icon: '✅', color: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'Finalizado', label: 'Finalizado', icon: '🏁', color: 'bg-gray-50 text-gray-700 border-gray-200' }
  ];

  const getStatusOption = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  // Função para validar se a campanha pode ser finalizada
  const validateCampaignCompletion = () => {
    const errors = [];
    const warnings = [];

    // Verificar se há criadores selecionados
    const criadoresAtivos = creatorSlots.filter(slot => slot.influenciador && slot.influenciador !== '');

    if (criadoresAtivos.length === 0) {
      errors.push('❌ Nenhum criador foi selecionado para esta campanha');
      return { isValid: false, errors, warnings };
    }

    // Validar cada criador
    criadoresAtivos.forEach((slot, index) => {
      const criadorNum = index + 1;
      const criadorName = slot.influenciador;

      // Campos obrigatórios
      if (!slot.briefingCompleto || slot.briefingCompleto === 'pendente') {
        errors.push(`❌ ${criadorName}: Briefing não está marcado como "Sim"`);
      } else if (slot.briefingCompleto !== 'sim' && slot.briefingCompleto !== 'Sim') {
        errors.push(`❌ ${criadorName}: Briefing deve estar "Sim" (atual: ${slot.briefingCompleto})`);
      }

      if (!slot.visitaConfirmado || slot.visitaConfirmado === 'pendente') {
        errors.push(`❌ ${criadorName}: Visita não está confirmada`);
      } else if (slot.visitaConfirmado !== 'sim' && slot.visitaConfirmado !== 'Sim') {
        errors.push(`❌ ${criadorName}: Visita deve estar "Confirmada" (atual: ${slot.visitaConfirmado})`);
      }

      if (!slot.videoAprovado || slot.videoAprovado === 'pendente') {
        errors.push(`❌ ${criadorName}: Vídeo não está aprovado`);
      } else if (slot.videoAprovado !== 'sim' && slot.videoAprovado !== 'Sim') {
        errors.push(`❌ ${criadorName}: Vídeo deve estar "Aprovado" (atual: ${slot.videoAprovado})`);
      }

      if (!slot.videoPostado || slot.videoPostado === 'pendente') {
        errors.push(`❌ ${criadorName}: Vídeo não está postado`);
      } else if (slot.videoPostado !== 'sim' && slot.videoPostado !== 'Sim') {
        errors.push(`❌ ${criadorName}: Vídeo deve estar "Postado" (atual: ${slot.videoPostado})`);
      }

      // Datas obrigatórias
      if (!slot.dataHoraVisita || slot.dataHoraVisita.trim() === '') {
        errors.push(`❌ ${criadorName}: Data/hora da visita não preenchida`);
      }

      if (!slot.dataHoraPostagem || slot.dataHoraPostagem.trim() === '') {
        errors.push(`❌ ${criadorName}: Data/hora da postagem não preenchida`);
      }

      // Links obrigatórios
      const hasInstagramLink = slot.videoInstagramLink && slot.videoInstagramLink.trim() !== '';
      const hasTiktokLink = slot.videoTiktokLink && slot.videoTiktokLink.trim() !== '';

      if (!hasInstagramLink && !hasTiktokLink) {
        errors.push(`❌ ${criadorName}: Pelo menos um link (Instagram ou TikTok) deve ser preenchido`);
      }

      // Avisos (não impedem finalização)
      if (!slot.quantidadeConvidados || slot.quantidadeConvidados === '') {
        warnings.push(`⚠️ ${criadorName}: Quantidade de convidados não preenchida (opcional)`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalCriadores: criadoresAtivos.length
    };
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || isUpdatingStatus) return;

    // Validação especial para finalização
    if (newStatus === 'Finalizado') {
      const validation = validateCampaignCompletion();

      if (!validation.isValid) {
        const errorMessage = [
          '🚫 Não é possível finalizar a campanha. Problemas encontrados:',
          '',
          ...validation.errors,
          '',
          '📋 Todos os criadores devem ter:',
          '• Briefing: Sim',
          '• Visita: Confirmada',
          '• Vídeo: Aprovado',
          '• Postado: Sim',
          '• Datas preenchidas',
          '• Pelo menos 1 link (Instagram ou TikTok)'
        ].join('\n');

        alert(errorMessage);
        return;
      }

      // Mostrar avisos se houver
      let confirmMessage = [
        '⚠️ ATENÇÃO: Você tem certeza que deseja finalizar esta campanha?',
        '',
        '🔒 Após finalizar:',
        '• A campanha será REMOVIDA da visualização do Kanban',
        '• Não será mais possível visualizar ou editar',
        '• Esta ação NÃO pode ser desfeita',
        '',
        `✅ Validação: ${validation.totalCriadores} criador(es) com todos os dados completos`
      ];

      if (validation.warnings.length > 0) {
        confirmMessage.push('', '⚠️ Avisos (não impedem finalização):', ...validation.warnings);
      }

      confirmMessage.push('', '❓ Deseja continuar?');

      const confirmed = confirm(confirmMessage.join('\n'));
      if (!confirmed) {
        return;
      }
    }

    setIsUpdatingStatus(true);

    try {
      console.log(`🔄 Atualizando status da campanha: ${campaign.businessName} - ${campaign.mes}: ${currentStatus} → ${newStatus}`);

      const response = await fetch('/api/supabase/campaigns/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: campaign.businessName,
          mes: campaign.mes,
          newStatus: newStatus,
          userEmail: user?.email || 'Sistema'
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Status da campanha atualizado via audit_log');
        setCurrentStatus(newStatus);

        // Aguardar um pouco para garantir que o audit_log foi processado
        setTimeout(() => {
          if (newStatus === 'Finalizado') {
            alert('🎉 Campanha finalizada com sucesso!\n\n✅ Todos os dados foram validados\n🔒 A campanha foi removida da jornada\n📊 Os dados permanecem salvos no sistema');
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

  // 🔄 NOVA: Função para atualizar dados do criador usando hook atômico
  const updateCreatorData = async (index: number, field: string, value: string) => {
    console.log(`🔄 Atualizando campo ${field} do slot ${index} para: ${value}`);

    // Para campos que não são 'influenciador', apenas atualizar localmente
    if (field !== 'influenciador') {
      const newEditedData = [...editedData];
      newEditedData[index] = { ...newEditedData[index], [field]: value };
      setEditedData(newEditedData);
      return;
    }

    // Se o campo é 'influenciador' e um criador foi selecionado
    if (field === 'influenciador' && value && value !== '') {
      const currentSlot = creatorSlots[index];
      const isSwap = currentSlot && currentSlot.influenciador && currentSlot.influenciador.trim() !== '';

      console.log(`🎯 ${isSwap ? 'Trocando' : 'Adicionando'} criador ${value} à campanha...`);
      console.log('📊 Slot atual:', currentSlot);

      try {
        // Encontrar o criador selecionado
        const selectedCreator = availableCreators.find(creator => creator.nome === value);
        if (!selectedCreator) {
          notifyError('selecionar criador', 'Criador não encontrado na lista');
          return;
        }

        console.log('👤 Criador selecionado:', selectedCreator);

        if (isSwap) {
          // 🔄 TROCA: Usar função de swap atômica
          console.log(`🔄 Trocando ${currentSlot.influenciador} → ${selectedCreator.nome}`);

          notifyLoading(`Trocando ${currentSlot.influenciador} por ${selectedCreator.nome}`);

          // Usar função de swap atômica
          const swapSuccess = await swapCreator(currentSlot.creatorId, selectedCreator.id);
          if (swapSuccess) {
            notifyCreatorSwapped(currentSlot.influenciador, selectedCreator.nome);
            console.log('✅ Criador trocado com sucesso via swap atômico');
          } else {
            notifyError('trocar criador', 'Falha na operação de troca');
          }

        } else {
          // ➕ ADIÇÃO: Slot vazio, apenas adicionar
          notifyLoading('Adicionando criador');

          const success = await addCreator(selectedCreator.id, false);
          if (success) {
            notifyCreatorAdded(selectedCreator.nome);
            console.log('✅ Criador adicionado com sucesso via hook atômico');
          } else {
            notifyError('adicionar criador', 'Falha na operação');
          }
        }

      } catch (error) {
        console.error('❌ Erro ao processar criador:', error);
        notifyError(isSwap ? 'trocar criador' : 'adicionar criador', error instanceof Error ? error.message : 'Erro desconhecido');
      }
    } else if (field === 'influenciador' && (!value || value === '')) {
      // Se está limpando o campo (trocar criador), apenas atualizar localmente
      const newEditedData = [...editedData];
      newEditedData[index] = { ...newEditedData[index], [field]: value };
      setEditedData(newEditedData);
    }


  };

  const handleAddNewCreator = async () => {
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
      videoInstagramLink: '',
      videoTiktokLink: '',
      isExisting: false
    };

    // 🚀 Usar API direta para adicionar slot vazio
    try {
      notifyLoading('Adicionando novo slot');

      const response = await fetch('/api/supabase/campaign-creators/add-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessName: campaign.businessName,
          mes: campaign.mes,
          userEmail: 'usuario@sistema.com'
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`➕ Novo slot adicionado com sucesso`);
        notifyCreatorAdded('Novo slot adicionado');
        // Auto-refresh para mostrar o novo slot
        await refreshSlots();
      } else {
        notifyError('adicionar slot', result.error || 'Falha ao adicionar slot');
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar slot:', error);
      notifyError('adicionar slot', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  // 🗑️ NOVA: Função para remover criador usando hook atômico
  const handleRemoveCreator = async (index: number) => {
    const creatorToCheck = creatorSlots[index];

    // Verificar se o slot tem criador para remover
    if (!creatorToCheck.influenciador || creatorToCheck.influenciador.trim() === '') {
      notifyError('remover criador', 'Este slot está vazio. Não há criador para remover.');
      return;
    }

    // Verificar se tem creatorId (necessário para remoção no banco)
    if (!creatorToCheck.creatorId) {
      notifyError('remover criador', 'Dados de identificação do criador não encontrados.');
      return;
    }

    const confirmDelete = window.confirm(`Tem certeza que deseja remover o criador "${creatorToCheck.influenciador}" deste slot?\n\n⚠️ O slot permanecerá vazio e disponível.`);
    if (!confirmDelete) return;

    try {
      // 🚀 Usar hook atômico para remover criador
      notifyLoading('Removendo criador');

      const success = await removeCreator(creatorToCheck.creatorId, false); // false = não deletar linha

      if (success) {
        notifyCreatorRemoved(creatorToCheck.influenciador);
        console.log('✅ Criador removido com sucesso via hook atômico');
        // O hook já faz auto-refresh, não precisa atualizar manualmente
      } else {
        notifyError('remover criador', 'Falha na operação');
      }
    } catch (error) {
      console.error('❌ Erro ao remover criador:', error);
      notifyError('remover criador', error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  const handleDeleteLine = async (index: number) => {
    if (creatorSlots.length <= 1) {
      alert('Não é possível excluir a última linha. Uma campanha deve ter pelo menos um slot.');
      return;
    }

    const lineToCheck = creatorSlots[index];
    const hasCreator = lineToCheck.influenciador && lineToCheck.influenciador.trim() !== '';

    let confirmMessage = `Tem certeza que deseja excluir completamente a linha ${index + 1}?`;

    if (hasCreator) {
      confirmMessage = `Tem certeza que deseja excluir a linha ${index + 1} com o criador "${lineToCheck.influenciador}"?\n\n⚠️ Esta ação irá:\n• Remover o criador da campanha\n• Excluir a linha completamente\n• Reduzir o total de slots`;
    } else {
      confirmMessage += '\n\n⚠️ Esta linha está vazia e será removida permanentemente.';
    }

    const confirmDelete = window.confirm(confirmMessage);
    if (!confirmDelete) return;

    console.log('🔍 DEBUG: Dados da linha a excluir:', {
      index,
      influenciador: lineToCheck.influenciador,
      creatorId: lineToCheck.creatorId,
      id: lineToCheck.id,
      businessId: lineToCheck.businessId,
      campaignId: lineToCheck.campaignId,
      isExisting: lineToCheck.isExisting,
      hasCreator
    });

    // Chamar API para excluir linha (remove criador + reduz quantidade)
    try {
      const deleteResponse = await fetch('/api/supabase/campaign-creators/delete-line', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: campaign.businessName,
          mes: campaign.mes,
          creatorId: hasCreator ? (lineToCheck.creatorId || lineToCheck.id) : null,
          userEmail: user?.email || 'Sistema'
        })
      });

      const deleteResult = await deleteResponse.json();
      console.log('📊 Resultado da exclusão de linha:', deleteResult);

      if (deleteResult.success) {
        // Remover a linha da interface
        const newCreatorSlots = creatorSlots.filter((_, i) => i !== index);
        const newEditedData = editedData.filter((_, i) => i !== index);

        console.log(`✅ Linha ${index + 1} excluída com sucesso via API`);

        // Atualizar quantidade de criadores no estado local
        if (deleteResult.data?.newQuantidade) {
          // Atualizar o objeto da campanha com a nova quantidade
          const updatedCampaign = {
            ...campaign,
            quantidadeCriadores: deleteResult.data.newQuantidade
          };

          console.log(`🔄 Atualizando quantidade local: ${campaign.quantidadeCriadores} → ${deleteResult.data.newQuantidade}`);

          // Recarregar dados com a nova quantidade
          setTimeout(() => {
            refreshSlots();
          }, 500);
        } else {
          // Fallback: recarregar dados para sincronizar com o banco
          setTimeout(() => {
            refreshSlots();
          }, 500);
        }

      } else {
        console.error('❌ Erro ao excluir linha:', deleteResult.error);
        alert(`Erro ao excluir linha: ${deleteResult.error}`);
      }
    } catch (error) {
      console.error('❌ Erro na requisição de exclusão:', error);
      alert('Erro ao excluir linha. Tente novamente.');
    }
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

        const originalInfluenciador = originalCreator?.influenciador || '';
        const editedInfluenciador = editedCreator?.influenciador || '';

        console.log(`🔍 DEBUG: Slot ${i}:`, {
          original: originalInfluenciador || 'vazio',
          edited: editedInfluenciador || 'vazio',
          originalIsEmpty: !originalInfluenciador || originalInfluenciador.trim() === '',
          editedIsEmpty: !editedInfluenciador || editedInfluenciador.trim() === '',
          isChanged: editedInfluenciador !== originalInfluenciador
        });

        // Só processar se houve mudança
        if (editedInfluenciador !== originalInfluenciador) {
          // Se o slot original estava vazio e agora tem criador = adição
          if (!originalInfluenciador || originalInfluenciador.trim() === '') {
            if (editedInfluenciador && editedInfluenciador.trim() !== '') {
              console.log('➕ Detectada adição de criador (slot vazio):', editedInfluenciador);
              addedCreators.push({
                index: i,
                creatorData: editedCreator
              });
            }
          }
          // Se o slot original tinha criador e agora tem outro = troca
          else if (editedInfluenciador && editedInfluenciador.trim() !== '') {
            const change = {
              index: i,
              oldCreator: originalInfluenciador,
              newCreator: editedInfluenciador,
              newCreatorData: editedCreator
            };
            console.log('🔄 Mudança detectada (troca):', change);
            creatorChanges.push(change);
          }
          // Se o slot original tinha criador e agora está vazio = remoção
          else if (!editedInfluenciador || editedInfluenciador.trim() === '') {
            console.log('🗑️ Detectada remoção de criador:', originalInfluenciador);
            const originalSlot = creatorSlots[i];

            // Só adicionar à lista de remoções se o criador realmente existe no banco
            if (originalSlot?.creatorId || originalSlot?.id) {
              console.log('✅ Criador tem ID, adicionando à lista de remoções:', {
                creatorId: originalSlot.creatorId || originalSlot.id,
                influenciador: originalInfluenciador
              });
              removedCreators.push({
                index: i,
                creatorData: originalSlot,
                creatorId: originalSlot.creatorId || originalSlot.id
              });
            } else {
              console.log('⚠️ Criador não tem ID, ignorando remoção (provavelmente slot vazio):', originalInfluenciador);
            }
          }
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
        removidos: removedCreators,
        removidosValidos: removedCreators.filter(r => r.creatorId || r.creatorData?.id || r.creatorData?.creatorId)
      });

      let response;
      let result;

      // Processar todas as mudanças (usar apenas remoções válidas)
      const validRemovals = removedCreators.filter(removal => {
        const hasCreatorId = removal.creatorId || removal.creatorData?.id || removal.creatorData?.creatorId;
        const hasInfluenciador = removal.creatorData?.influenciador && removal.creatorData.influenciador.trim() !== '';

        console.log('🔍 VALIDAÇÃO: Verificando remoção:', {
          index: removal.index,
          influenciador: removal.creatorData?.influenciador,
          creatorId: removal.creatorId,
          creatorDataId: removal.creatorData?.id,
          creatorDataCreatorId: removal.creatorData?.creatorId,
          hasCreatorId,
          hasInfluenciador,
          isValid: hasCreatorId && hasInfluenciador,
          allCreatorDataKeys: removal.creatorData ? Object.keys(removal.creatorData) : []
        });

        return hasCreatorId && hasInfluenciador;
      });

      const hasChanges = creatorChanges.length > 0 || addedCreators.length > 0 || validRemovals.length > 0;

      if (hasChanges) {
        console.log('🔄 Processando mudanças nos criadores...');

        const allResults = [];

        // 1. Processar trocas de criadores
        for (const change of creatorChanges) {
          console.log('🔄 Processando troca de criador:', change);
          console.log('🔍 DEBUG: availableCreators count:', availableCreators.length);
          console.log('🔍 DEBUG: Primeiros 3 criadores disponíveis:', availableCreators.slice(0, 3).map(c => ({ id: c.id, nome: c.nome })));

          // Buscar IDs dos criadores pelos nomes
          const oldCreatorData = availableCreators.find(c => c.nome === change.oldCreator);
          const newCreatorData = availableCreators.find(c => c.nome === change.newCreator);

          console.log('🔍 DEBUG: Buscando criadores:');
          console.log('  - oldCreatorName:', change.oldCreator);
          console.log('  - newCreatorName:', change.newCreator);
          console.log('  - oldCreatorData:', oldCreatorData ? { id: oldCreatorData.id, nome: oldCreatorData.nome } : null);
          console.log('  - newCreatorData:', newCreatorData ? { id: newCreatorData.id, nome: newCreatorData.nome } : null);

          if (!oldCreatorData || !newCreatorData) {
            console.error('❌ Criador não encontrado:');
            console.error('  - oldCreator:', change.oldCreator, '(found:', !!oldCreatorData, ')');
            console.error('  - newCreator:', change.newCreator, '(found:', !!newCreatorData, ')');
            console.error('  - availableCreatorNames:', availableCreators.map(c => c.nome));
            allResults.push({
              type: 'troca',
              result: {
                success: false,
                error: 'Criador não encontrado para troca'
              }
            });
            continue;
          }

          const changeResponse = await fetch('/api/supabase/campaign-creators/replace', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessName: campaign.businessName,
              mes: campaign.mes,
              oldCreatorId: oldCreatorData.id,
              newCreatorId: newCreatorData.id,
              userEmail: user?.email || 'Sistema'
            })
          });

          const changeResult = await changeResponse.json();
          console.log('📊 Resultado da troca:', changeResult);
          allResults.push({ type: 'troca', result: changeResult });
        }

        // 2. Processar adições de criadores
        for (const addition of addedCreators) {
          console.log('➕ Processando adição de criador:', addition);

          // Buscar dados completos do criador pelo nome
          const creatorData = availableCreators.find(c => c.nome === addition.creatorData?.influenciador);

          if (!creatorData) {
            console.error('❌ Criador não encontrado para adição:', addition.creatorData?.influenciador);
            allResults.push({
              type: 'adicao',
              result: {
                success: false,
                error: 'Criador não encontrado para adição'
              }
            });
            continue;
          }

          console.log('👤 Dados do criador para adição:', { id: creatorData.id, nome: creatorData.nome });

          const addResponse = await fetch('/api/supabase/campaign-creators/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessName: campaign.businessName,
              mes: campaign.mes,
              creatorId: creatorData.id,
              creatorData: creatorData,
              userEmail: user?.email || 'Sistema'
            })
          });

          const addResult = await addResponse.json();
          console.log('📊 Resultado da adição:', addResult);

          // Tratar erro 409 (criador já existe) como aviso, não erro
          if (addResponse.status === 409) {
            console.log('ℹ️ Criador já estava na campanha, ignorando duplicata');
            allResults.push({
              type: 'adicao',
              result: {
                success: true,
                message: `${creatorData.nome} já estava na campanha`,
                warning: true
              }
            });
          } else {
            allResults.push({ type: 'adicao', result: addResult });
          }
        }

        // 3. Processar remoções de criadores (usar validRemovals já filtradas)
        console.log(`🔍 Remoções válidas: ${validRemovals.length} de ${removedCreators.length}`);

        for (const removal of validRemovals) {
          console.log('🗑️ Processando remoção de criador:', removal);
          console.log('🔍 DEBUG: Detalhes completos do removal:', {
            index: removal.index,
            creatorId: removal.creatorId,
            creatorDataId: removal.creatorData?.id,
            creatorDataCreatorId: removal.creatorData?.creatorId,
            influenciador: removal.creatorData?.influenciador,
            businessId: removal.creatorData?.businessId,
            campaignId: removal.creatorData?.campaignId,
            isExisting: removal.creatorData?.isExisting
          });

          const removePayload = {
            businessName: campaign.businessName || removal.businessName,
            mes: campaign.mes,
            creatorId: removal.creatorId || removal.creatorData?.id || removal.creatorData?.creatorId,
            userEmail: user?.email || 'Sistema'
          };

          console.log('🔍 DEBUG: Payload de remoção:', removePayload);
          console.log('🔍 DEBUG: Dados da campanha:', {
            businessName: campaign.businessName,
            mes: campaign.mes,
            campaignId: campaign.id
          });
          console.log('🔍 DEBUG: Dados do criador a remover:', removal);

          // Verificar se todos os campos obrigatórios estão preenchidos
          if (!removePayload.businessName || !removePayload.mes || !removePayload.creatorId) {
            console.error('❌ ERRO: Campos obrigatórios faltando no payload:', {
              businessName: removePayload.businessName,
              mes: removePayload.mes,
              creatorId: removePayload.creatorId
            });
            console.error('❌ ERRO: Dados completos do removal:', removal);
            console.error('❌ ERRO: Dados completos do creatorData:', removal.creatorData);

            allResults.push({
              type: 'remocao',
              result: {
                success: false,
                error: `Dados obrigatórios faltando: ${!removePayload.businessName ? 'businessName ' : ''}${!removePayload.mes ? 'mes ' : ''}${!removePayload.creatorId ? 'creatorId' : ''}`,
                debug: {
                  payload: removePayload,
                  removal: removal,
                  creatorData: removal.creatorData
                }
              }
            });
            continue;
          }

          const removeResponse = await fetch('/api/supabase/campaign-creators/remove', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(removePayload)
          });

          const removeResult = await removeResponse.json();
          console.log('📊 Resultado da remoção:', removeResult);
          allResults.push({ type: 'remocao', result: removeResult });
        }

        // Consolidar resultados
        console.log('📊 Todos os resultados das operações:', allResults);

        // Separar resultados reais de avisos
        const realFailures = allResults.filter(r => !r.result.success && !r.result.warning);
        const warnings = allResults.filter(r => r.result.success && r.result.warning);
        const successes = allResults.filter(r => r.result.success && !r.result.warning);

        const allSuccessful = realFailures.length === 0;

        if (realFailures.length > 0) {
          console.error('❌ Operações que falharam:', realFailures);
          realFailures.forEach((failed, index) => {
            console.error(`❌ Falha ${index + 1}:`, {
              tipo: failed.type,
              sucesso: failed.result.success,
              erro: failed.result.error,
              detalhes: failed.result
            });
          });
        }

        const totalChanges = creatorChanges.length + addedCreators.length + validRemovals.length;

        if (warnings.length > 0) {
          console.log('⚠️ Avisos:', warnings.map(w => w.result.message));
        }

        let message = '';
        if (allSuccessful) {
          const totalOperations = successes.length + warnings.length;
          message = `✅ ${totalOperations} operação(ões) processada(s)`;
          if (warnings.length > 0) {
            message += ` (${warnings.length} aviso(s))`;
          }
        } else {
          message = `❌ ${realFailures.length} de ${allResults.length} operações falharam. Verifique o console para detalhes.`;
        }

        result = {
          success: allSuccessful,
          message,
          allResults,
          updatedCount: allSuccessful ? (successes.length + warnings.length) : 0
        };
      } else {
        console.log('📝 Usando API de atualização do Supabase...');

        // Usar nova API de atualização para Supabase
        const updateResponse = await fetch('/api/supabase/campaign-creators/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessName: campaign.businessName,
            mes: campaign.mes,
            creatorsData: editedData,
            userEmail: user?.email || 'Sistema'
          })
        });

        result = await updateResponse.json();
        console.log('📊 Resultado da API de atualização:', result);
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
        await refreshSlots();
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
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-start justify-center p-4 pt-6 pb-8">
        <div className="relative w-full max-w-[90vw] bg-white rounded-3xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
          
          {/* Header Premium */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {campaign.businessName}
                  </h1>
                  <div className="flex items-center text-blue-100 text-sm mt-1">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatMonthYear(campaign.mes)}</span>
                  </div>
                </div>

                {/* Badge informativo */}
                <div className="flex items-center bg-white/20 rounded-full px-3 py-1">
                  <svg className="w-4 h-4 mr-1.5 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-blue-100 text-sm font-medium">{campaign.businessData?.criadoresNoContrato || 0} criadores</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            
            {/* Status da Jornada - Editável */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Status da Jornada
                </label>
                {isUpdatingStatus && (
                  <div className="flex items-center text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                    <span className="text-xs">Atualizando...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 mt-2">
                <div className="flex-1">
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white text-sm font-medium"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Badge compacto do status atual */}
                <span className={`inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium ${getStatusOption(currentStatus).color} border`}>
                  <span className="mr-1">{getStatusOption(currentStatus).icon}</span>
                  {getStatusOption(currentStatus).label}
                </span>
              </div>
            </div>



            {/* Tabela de Criadores da Campanha */}
            <div className="mt-8">
              {/* Status Compacto */}
              <div className="mb-8">
                <div className="grid grid-cols-4 gap-6">
                  {/* Selecionados */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl font-bold">{creatorSlots.filter(slot => slot.influenciador && slot.influenciador !== '').length}</div>
                      <div className="bg-white/20 rounded-full p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-blue-100 text-sm font-medium">de {campaign.quantidadeCriadores} selecionados</div>
                  </div>

                  {/* Confirmadas */}
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl font-bold">{creatorSlots.filter(slot => slot.visitaConfirmado === 'sim' || slot.visitaConfirmado === 'Sim').length}</div>
                      <div className="bg-white/20 rounded-full p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-green-100 text-sm font-medium">de {campaign.quantidadeCriadores} confirmadas</div>
                  </div>

                  {/* Aprovados */}
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl font-bold">{creatorSlots.filter(slot => slot.videoAprovado === 'sim' || slot.videoAprovado === 'Sim').length}</div>
                      <div className="bg-white/20 rounded-full p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-4v4m0 0V7a3 3 0 013-3h4a3 3 0 013 3v4M9 21h6a2 2 0 002-2v-1" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-purple-100 text-sm font-medium">de {campaign.quantidadeCriadores} aprovados</div>
                  </div>

                  {/* Postados */}
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl font-bold">{creatorSlots.filter(slot => slot.videoPostado === 'sim' || slot.videoPostado === 'Sim').length}</div>
                      <div className="bg-white/20 rounded-full p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v3M7 4H5a1 1 0 00-1 1v16a1 1 0 001 1h14a1 1 0 001-1V5a1 1 0 00-1-1h-2M7 4h10M9 9h6m-6 4h6m-6 4h6" />
                        </svg>
                      </div>
                    </div>
                    <div className="text-orange-100 text-sm font-medium">de {campaign.quantidadeCriadores} postados</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    Gestão de Criadores
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Acompanhe o progresso e gerencie as entregas dos {campaign.quantidadeCriadores} criadores
                  </p>
                </div>
                <div className="flex gap-3">
                  {/* Botão Cancelar */}
                  {isEditMode && (
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setPendingRemovals([]);
                        refreshSlots();
                      }}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Cancelar
                    </button>
                  )}

                  {/* Botão Editar/Salvar */}
                  <button
                    onClick={isEditMode ? handleSaveChanges : () => setIsEditMode(true)}
                    disabled={isSaving}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-full transition-colors
                      ${isEditMode
                        ? isSaving
                          ? 'text-gray-500 bg-gray-100 cursor-not-allowed'
                          : 'text-white bg-green-600 hover:bg-green-700'
                        : 'text-white bg-blue-600 hover:bg-blue-700'
                      }
                    `}
                  >
                    {isEditMode ? (
                      isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>Salvando...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Salvar</span>
                        </>
                      )
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Editar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 🔄 Painel de Operações em Lote */}
              {isEditMode && (
                <BulkOperationsPanel
                  selectedSlots={bulkOps.selectedSlots}
                  availableCreators={availableCreators}
                  isProcessing={bulkOps.isProcessing}
                  canPerformBulkOperation={bulkOps.canPerformBulkOperation}
                  selectAllSlots={bulkOps.selectAllSlots}
                  clearSelection={bulkOps.clearSelection}
                  bulkAddCreators={bulkOps.bulkAddCreators}
                  bulkRemoveCreators={bulkOps.bulkRemoveCreators}
                  bulkSwapCreators={bulkOps.bulkSwapCreators}
                  getSelectedSlotsData={bulkOps.getSelectedSlotsData}
                />
              )}

              <div className="bg-white w-full overflow-hidden">
                <div className="overflow-x-auto w-full">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        {isEditMode && (
                          <th className="px-3 py-5 text-center text-sm font-bold text-gray-800 uppercase tracking-wider w-12">
                            <input
                              type="checkbox"
                              checked={bulkOps.selectedSlots.length === creatorSlots.length && creatorSlots.length > 0}
                              onChange={() => {
                                if (bulkOps.selectedSlots.length === creatorSlots.length) {
                                  bulkOps.clearSelection();
                                } else {
                                  bulkOps.selectAllSlots();
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                          </th>
                        )}
                        <th className="px-6 py-5 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Criador
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Visita
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Convidados
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Confirmada
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Postagem
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Aprovado
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Postado
                        </th>
                        <th className="px-4 py-4 text-left text-sm font-bold text-gray-800 uppercase tracking-wider w-40">
                          Links
                        </th>
                        {isEditMode && (
                          <th className="px-3 py-4 text-center text-sm font-bold text-gray-800 uppercase tracking-wider w-16">
                            Ações
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {isLoadingSlots ? (
                        <tr>
                          <td colSpan={isEditMode ? 8 : 7} className="px-6 py-8 text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                              <span className="text-gray-600">Carregando criadores...</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        creatorSlots.map((slot, index) => (
                        <tr key={index} className={`${
                          bulkOps.selectedSlots.includes(index) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}>
                          {isEditMode && (
                            <td className="px-3 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={bulkOps.selectedSlots.includes(index)}
                                onChange={() => bulkOps.toggleSlotSelection(index)}
                                className="rounded border-gray-300"
                              />
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <div className="w-full">
                                {isEditMode ? (
                                  <div className="space-y-2">
                                    {/* Criador Selecionado - Visual Card */}
                                    {editedData[index]?.influenciador ? (
                                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="font-semibold text-green-900 text-base">
                                              {editedData[index]?.influenciador}
                                            </div>
                                            <div className="text-sm text-green-700">
                                              {availableCreators.find(c => c.nome === editedData[index]?.influenciador)?.cidade || 'Cidade não informada'}
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
                                          👤 {creator.nome} - 📱 {creator.instagram} - 👥 {creator.seguidores}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ) : (
                                  <div>
                                    {slot.influenciador ? (
                                      <div>
                                        <div className="font-semibold text-gray-900 text-base">
                                          {slot.influenciador}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {availableCreators.find(c => c.nome === slot.influenciador)?.cidade || 'Cidade não informada'}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-center py-4">
                                        <div className="text-gray-400 italic text-base mb-1">
                                          Criador não selecionado
                                        </div>
                                        <div className="text-sm text-gray-400">
                                          Clique em "Editar Criadores" para selecionar
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap">
                            {isEditMode ? (
                              <input
                                type="datetime-local"
                                value={formatDateForInput(editedData[index]?.dataHoraVisita || slot.dataHoraVisita || '')}
                                onChange={(e) => updateCreatorData(index, 'dataHoraVisita', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {slot.dataHoraVisita || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap">
                            {isEditMode ? (
                              <input
                                type="number"
                                value={editedData[index]?.quantidadeConvidados || ''}
                                onChange={(e) => updateCreatorData(index, 'quantidadeConvidados', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                                min="0"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {slot.quantidadeConvidados || '0'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap">
                            {isEditMode ? (
                              <select
                                value={editedData[index]?.visitaConfirmado || 'pendente'}
                                onChange={(e) => updateCreatorData(index, 'visitaConfirmado', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
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
                          <td className="px-6 py-2 whitespace-nowrap">
                            {isEditMode ? (
                              <input
                                type="datetime-local"
                                value={formatDateForInput(editedData[index]?.dataHoraPostagem || slot.dataHoraPostagem || '')}
                                onChange={(e) => updateCreatorData(index, 'dataHoraPostagem', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                              />
                            ) : (
                              <div className="text-sm text-gray-900">
                                {slot.dataHoraPostagem || '-'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap">
                            {isEditMode ? (
                              <select
                                value={editedData[index]?.videoAprovado || 'pendente'}
                                onChange={(e) => updateCreatorData(index, 'videoAprovado', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
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
                          <td className="px-6 py-2 whitespace-nowrap">
                            {isEditMode ? (
                              <select
                                value={editedData[index]?.videoPostado || 'pendente'}
                                onChange={(e) => updateCreatorData(index, 'videoPostado', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
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
                          <td className="px-4 py-2">
                            {isEditMode ? (
                              <div className="space-y-2">
                                <input
                                  type="url"
                                  placeholder="Link Instagram"
                                  value={editedData[index]?.videoInstagramLink || ''}
                                  onChange={(e) => updateCreatorData(index, 'videoInstagramLink', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xs"
                                />
                                <input
                                  type="url"
                                  placeholder="Link TikTok"
                                  value={editedData[index]?.videoTiktokLink || ''}
                                  onChange={(e) => updateCreatorData(index, 'videoTiktokLink', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-xs"
                                />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {slot.videoInstagramLink && (
                                  <a
                                    href={slot.videoInstagramLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-2 text-sm text-pink-600 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 hover:text-pink-800 transition-all duration-200"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                    Instagram
                                  </a>
                                )}
                                {slot.videoTiktokLink && (
                                  <a
                                    href={slot.videoTiktokLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
                                  >
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                                    </svg>
                                    TikTok
                                  </a>
                                )}
                                {!slot.videoInstagramLink && !slot.videoTiktokLink && (
                                  <div className="text-center py-4">
                                    <span className="text-gray-400 text-sm italic">Nenhum link adicionado</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          {isEditMode && (
                            <td className="px-3 py-2 text-center">
                              <div className="flex gap-1 justify-center">
                                {/* Botão Remover Criador - só aparece se tem criador */}
                                {slot.influenciador && slot.influenciador.trim() !== '' && (
                                  <button
                                    onClick={() => handleRemoveCreator(index)}
                                    className="inline-flex items-center justify-center w-8 h-8 text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-all duration-200"
                                    title="Remover criador (manter slot)"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                  </button>
                                )}

                                {/* Botão Excluir Linha - sempre aparece */}
                                <button
                                  onClick={() => handleDeleteLine(index)}
                                  className="inline-flex items-center justify-center w-8 h-8 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                                  title="Excluir linha completamente"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Botão para Adicionar Novo Criador - Material Design 3 */}
                {isEditMode && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 border-t border-gray-200">
                    <button
                      onClick={handleAddNewCreator}
                      className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-700 hover:border-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Adicionar Novo Criador
                    </button>
                  </div>
                )}
              </div>

              {/* Espaço vazio para facilitar navegação do modal */}
              <div className="h-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
