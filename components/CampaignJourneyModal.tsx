'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getApiUrl, isUsingSupabase } from '@/lib/dataSource';

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

export default function CampaignJourneyModal({ campaign, isOpen, onClose, onStatusUpdate }: CampaignJourneyModalProps) {
  const { user } = useAuthStore();
  const [currentStatus, setCurrentStatus] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Função para fechar modal e cancelar modo edição
  const handleClose = () => {
    setIsEditMode(false);
    setPendingRemovals([]);
    onClose();
  };
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

      console.log(`🚀 Fazendo fetch para ${getApiUrl('creatorSlots')} com payload:`, requestPayload);

      const apiUrl = getApiUrl('creatorSlots');
      const params = new URLSearchParams({
        businessName: campaign.businessName,
        mes: campaign.mes,
        quantidadeContratada: quantidadeContratada.toString()
      });

      const response = await fetch(`${apiUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
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
      let responseText = '';
      try {
        responseText = await response.text();
        console.log('📄 Resposta raw da API (primeiros 500 chars):', responseText.substring(0, 500));
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        console.error('❌ Resposta que causou o erro:', responseText);
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

        // Debug das contagens
        console.log('📊 Contagens de status:');
        console.log('Selecionados:', result.slots.filter(slot => slot.influenciador && slot.influenciador !== '').length);
        console.log('Confirmadas:', result.slots.filter(slot => slot.visitaConfirmado === 'sim' || slot.visitaConfirmado === 'Sim').length);
        console.log('Aprovados:', result.slots.filter(slot => slot.videoAprovado === 'sim' || slot.videoAprovado === 'Sim').length);
        console.log('Postados:', result.slots.filter(slot => slot.videoPostado === 'sim' || slot.videoPostado === 'Sim').length);

        setCreatorSlots(result.slots);
        setAvailableCreators(result.availableCreators);
        setEditedData(result.slots);
        console.log(`✅ ${result.slots.length} slots de criadores carregados`);
        console.log(`✅ ${result.availableCreators?.length || 0} criadores disponíveis carregados`);
        console.log('🔍 Primeiros 3 criadores:', result.availableCreators?.slice(0, 3));
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
          videoInstagramLink: '',
          videoTiktokLink: '',
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
        videoInstagramLink: '',
        videoTiktokLink: '',
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

  const updateCreatorData = async (index: number, field: string, value: string) => {
    console.log(`🔄 Atualizando campo ${field} do slot ${index} para: ${value}`);

    const newEditedData = [...editedData];
    newEditedData[index] = { ...newEditedData[index], [field]: value };
    setEditedData(newEditedData);

    // Se o campo é 'influenciador' e um criador foi selecionado, adicionar à campanha
    if (field === 'influenciador' && value && value !== '') {
      console.log(`🎯 Adicionando criador ${value} à campanha...`);

      try {
        // Encontrar o criador selecionado
        const selectedCreator = availableCreators.find(creator => creator.nome === value);
        if (!selectedCreator) {
          console.error('❌ Criador não encontrado:', value);
          return;
        }

        console.log('👤 Criador selecionado:', selectedCreator);

        // Chamar API para adicionar criador à campanha
        const response = await fetch(getApiUrl('addCampaignCreator'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessName: campaign.businessName,
            mes: campaign.mes,
            creatorId: selectedCreator.id,
            creatorData: selectedCreator,
            userEmail: 'admin@crm.com' // TODO: pegar do contexto de usuário
          })
        });

        const result = await response.json();

        if (result.success) {
          console.log('✅ Criador adicionado à campanha:', result);

          // Atualizar dados do criador no slot
          newEditedData[index] = {
            ...newEditedData[index],
            creatorData: selectedCreator,
            relationId: result.data?.relationId
          };
          setEditedData([...newEditedData]);

        } else {
          console.error('❌ Erro ao adicionar criador:', result.error);
          // Reverter seleção em caso de erro
          newEditedData[index] = { ...newEditedData[index], [field]: '' };
          setEditedData([...newEditedData]);
          alert(`Erro ao adicionar criador: ${result.error}`);
        }
      } catch (error) {
        console.error('❌ Erro na requisição:', error);
        // Reverter seleção em caso de erro
        newEditedData[index] = { ...newEditedData[index], [field]: '' };
        setEditedData([...newEditedData]);
        alert(`Erro ao adicionar criador: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
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
      videoInstagramLink: '',
      videoTiktokLink: '',
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
            removedCreators.push({
              index: i,
              creatorData: { influenciador: originalInfluenciador }
            });
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

        // 3. Processar remoções de criadores
        for (const removal of removedCreators) {
          console.log('🗑️ Processando remoção de criador:', removal);

          const removeResponse = await fetch('/api/supabase/campaign-creators/remove', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessName: campaign.businessName,
              mes: campaign.mes,
              creatorId: removal.creatorData?.id,
              userEmail: user?.email || 'Sistema'
            })
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

        const totalChanges = creatorChanges.length + addedCreators.length + removedCreators.length;

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
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-start justify-center p-4 pt-6 pb-8">
        <div className="relative w-full max-w-[90vw] bg-white rounded-3xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
          
          {/* Header Premium */}
          <div className="bg-[#f5f5f5] border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {campaign.businessName}
                  </h1>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <div className="flex items-center text-blue-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-base font-semibold">Campanha {campaign.mes}</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Gestão completa dos criadores e acompanhamento de entregas
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            
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
              
              <p className="text-xs text-gray-600 mt-3 flex items-start">
                <svg className="w-4 h-4 mr-1 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span>
                  <strong>Finalizar campanha:</strong> Remove da jornada permanentemente.
                  Todos os criadores devem ter dados completos (briefing, visita, aprovação, postagem, datas e links).
                </span>
              </p>
            </div>



            {/* Tabela de Criadores da Campanha */}
            <div className="mt-8">
              {/* Status Compacto */}
              <div className="mb-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{creatorSlots.filter(slot => slot.influenciador && slot.influenciador !== '').length}</div>
                    <div className="text-sm text-gray-600">de {campaign.quantidadeCriadores} selecionados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{creatorSlots.filter(slot => slot.visitaConfirmado === 'sim' || slot.visitaConfirmado === 'Sim').length}</div>
                    <div className="text-sm text-gray-600">de {campaign.quantidadeCriadores} confirmadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{creatorSlots.filter(slot => slot.videoAprovado === 'sim' || slot.videoAprovado === 'Sim').length}</div>
                    <div className="text-sm text-gray-600">de {campaign.quantidadeCriadores} aprovados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{creatorSlots.filter(slot => slot.videoPostado === 'sim' || slot.videoPostado === 'Sim').length}</div>
                    <div className="text-sm text-gray-600">de {campaign.quantidadeCriadores} postados</div>
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
                        loadCreatorSlots();
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
                      px-8 py-3 text-sm font-semibold rounded-xl border-2 transition-all duration-200 shadow-md hover:shadow-lg
                      ${isEditMode
                        ? isSaving
                          ? 'text-gray-500 bg-gray-100 border-gray-300 cursor-not-allowed'
                          : 'text-white bg-green-600 border-green-600 hover:bg-green-700 hover:border-green-700 hover:scale-105'
                        : 'text-white bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700 hover:scale-105'
                      }
                    `}
                  >
                    {isEditMode ? (
                      isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                          Salvando...
                        </>
                      ) : (
                        'Salvar'
                      )
                    ) : (
                      'Editar'
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-slate-100 to-gray-100">
                      <tr>
                        <th className="px-6 py-5 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Criador
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-bold text-gray-800 uppercase tracking-wider">
                          Briefing
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
                    <tbody className="bg-white divide-y divide-gray-100">
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
                              <select
                                value={editedData[index]?.briefingCompleto || 'pendente'}
                                onChange={(e) => updateCreatorData(index, 'briefingCompleto', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
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
                              <button
                                onClick={() => handleDeleteCreator(index)}
                                className="inline-flex items-center justify-center w-8 h-8 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200"
                                title="Remover criador"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
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

              {/* Grid de Informações - Movido para depois da tabela */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
