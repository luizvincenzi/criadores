'use client';

import { useState, useCallback } from 'react';
import { useCreatorToast } from './useToast';

interface BulkOperation {
  type: 'add' | 'remove' | 'swap';
  slotIndex: number;
  creatorId?: string;
  oldCreatorId?: string;
  newCreatorId?: string;
}

interface BulkOperationResult {
  success: boolean;
  operation: BulkOperation;
  error?: string;
}

interface UseBulkOperationsReturn {
  selectedSlots: number[];
  isProcessing: boolean;
  results: BulkOperationResult[];
  
  // Selection
  toggleSlotSelection: (index: number) => void;
  selectAllSlots: () => void;
  clearSelection: () => void;
  
  // Operations
  bulkAddCreators: (creatorIds: string[]) => Promise<boolean>;
  bulkRemoveCreators: () => Promise<boolean>;
  bulkSwapCreators: (newCreatorIds: string[]) => Promise<boolean>;
  
  // Utils
  getSelectedSlotsData: () => any[];
  canPerformBulkOperation: (operation: string) => boolean;
}

export const useBulkOperations = (
  slots: any[],
  addCreator: (creatorId: string) => Promise<boolean>,
  removeCreator: (creatorId: string) => Promise<boolean>,
  swapCreator: (oldCreatorId: string, newCreatorId: string) => Promise<boolean>
): UseBulkOperationsReturn => {
  
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<BulkOperationResult[]>([]);
  
  const { notifyCreatorAdded, notifyCreatorRemoved, notifyCreatorSwapped, notifyError, notifyLoading } = useCreatorToast();

  // Alternar seleção de slot
  const toggleSlotSelection = useCallback((index: number) => {
    setSelectedSlots(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  }, []);

  // Selecionar todos os slots
  const selectAllSlots = useCallback(() => {
    setSelectedSlots(slots.map((_, index) => index));
  }, [slots]);

  // Limpar seleção
  const clearSelection = useCallback(() => {
    setSelectedSlots([]);
  }, []);

  // Obter dados dos slots selecionados
  const getSelectedSlotsData = useCallback(() => {
    return selectedSlots.map(index => slots[index]).filter(Boolean);
  }, [selectedSlots, slots]);

  // Verificar se pode realizar operação em lote
  const canPerformBulkOperation = useCallback((operation: string) => {
    if (selectedSlots.length === 0) return false;
    
    const selectedSlotsData = getSelectedSlotsData();
    
    switch (operation) {
      case 'add':
        // Pode adicionar apenas em slots vazios
        return selectedSlotsData.every(slot => !slot.influenciador || slot.influenciador.trim() === '');
      
      case 'remove':
        // Pode remover apenas de slots ocupados
        return selectedSlotsData.every(slot => slot.influenciador && slot.influenciador.trim() !== '');
      
      case 'swap':
        // Pode trocar apenas em slots ocupados
        return selectedSlotsData.every(slot => slot.influenciador && slot.influenciador.trim() !== '' && slot.creatorId);
      
      default:
        return false;
    }
  }, [selectedSlots, getSelectedSlotsData]);

  // Operação em lote: Adicionar criadores
  const bulkAddCreators = useCallback(async (creatorIds: string[]): Promise<boolean> => {
    if (!canPerformBulkOperation('add')) {
      notifyError('operação em lote', 'Selecione apenas slots vazios para adicionar criadores');
      return false;
    }

    if (creatorIds.length !== selectedSlots.length) {
      notifyError('operação em lote', 'Número de criadores deve ser igual ao número de slots selecionados');
      return false;
    }

    setIsProcessing(true);
    setResults([]);
    
    notifyLoading(`Adicionando ${creatorIds.length} criadores...`);

    const operationResults: BulkOperationResult[] = [];
    let successCount = 0;

    try {
      for (let i = 0; i < selectedSlots.length; i++) {
        const slotIndex = selectedSlots[i];
        const creatorId = creatorIds[i];

        try {
          const success = await addCreator(creatorId);
          
          operationResults.push({
            success,
            operation: { type: 'add', slotIndex, creatorId },
            error: success ? undefined : 'Falha na adição'
          });

          if (success) {
            successCount++;
          }
        } catch (error) {
          operationResults.push({
            success: false,
            operation: { type: 'add', slotIndex, creatorId },
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }

      setResults(operationResults);

      if (successCount === selectedSlots.length) {
        notifyCreatorAdded(`${successCount} criadores adicionados com sucesso`);
        clearSelection();
        return true;
      } else {
        notifyError('operação em lote', `${successCount}/${selectedSlots.length} criadores adicionados`);
        return false;
      }

    } catch (error) {
      notifyError('operação em lote', error instanceof Error ? error.message : 'Erro na operação');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedSlots, canPerformBulkOperation, addCreator, notifyLoading, notifyCreatorAdded, notifyError, clearSelection]);

  // Operação em lote: Remover criadores
  const bulkRemoveCreators = useCallback(async (): Promise<boolean> => {
    if (!canPerformBulkOperation('remove')) {
      notifyError('operação em lote', 'Selecione apenas slots ocupados para remover criadores');
      return false;
    }

    const selectedSlotsData = getSelectedSlotsData();
    const confirmMessage = `Tem certeza que deseja remover ${selectedSlotsData.length} criadores?\n\n${selectedSlotsData.map(slot => `• ${slot.influenciador}`).join('\n')}`;
    
    if (!window.confirm(confirmMessage)) {
      return false;
    }

    setIsProcessing(true);
    setResults([]);
    
    notifyLoading(`Removendo ${selectedSlotsData.length} criadores...`);

    const operationResults: BulkOperationResult[] = [];
    let successCount = 0;

    try {
      for (const slotIndex of selectedSlots) {
        const slot = slots[slotIndex];
        
        try {
          const success = await removeCreator(slot.creatorId);
          
          operationResults.push({
            success,
            operation: { type: 'remove', slotIndex, creatorId: slot.creatorId },
            error: success ? undefined : 'Falha na remoção'
          });

          if (success) {
            successCount++;
          }
        } catch (error) {
          operationResults.push({
            success: false,
            operation: { type: 'remove', slotIndex, creatorId: slot.creatorId },
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }

      setResults(operationResults);

      if (successCount === selectedSlots.length) {
        notifyCreatorRemoved(`${successCount} criadores removidos com sucesso`);
        clearSelection();
        return true;
      } else {
        notifyError('operação em lote', `${successCount}/${selectedSlots.length} criadores removidos`);
        return false;
      }

    } catch (error) {
      notifyError('operação em lote', error instanceof Error ? error.message : 'Erro na operação');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedSlots, slots, canPerformBulkOperation, removeCreator, getSelectedSlotsData, notifyLoading, notifyCreatorRemoved, notifyError, clearSelection]);

  // Operação em lote: Trocar criadores
  const bulkSwapCreators = useCallback(async (newCreatorIds: string[]): Promise<boolean> => {
    if (!canPerformBulkOperation('swap')) {
      notifyError('operação em lote', 'Selecione apenas slots ocupados para trocar criadores');
      return false;
    }

    if (newCreatorIds.length !== selectedSlots.length) {
      notifyError('operação em lote', 'Número de novos criadores deve ser igual ao número de slots selecionados');
      return false;
    }

    setIsProcessing(true);
    setResults([]);
    
    notifyLoading(`Trocando ${selectedSlots.length} criadores...`);

    const operationResults: BulkOperationResult[] = [];
    let successCount = 0;

    try {
      for (let i = 0; i < selectedSlots.length; i++) {
        const slotIndex = selectedSlots[i];
        const slot = slots[slotIndex];
        const newCreatorId = newCreatorIds[i];

        try {
          const success = await swapCreator(slot.creatorId, newCreatorId);
          
          operationResults.push({
            success,
            operation: { 
              type: 'swap', 
              slotIndex, 
              oldCreatorId: slot.creatorId, 
              newCreatorId 
            },
            error: success ? undefined : 'Falha na troca'
          });

          if (success) {
            successCount++;
          }
        } catch (error) {
          operationResults.push({
            success: false,
            operation: { 
              type: 'swap', 
              slotIndex, 
              oldCreatorId: slot.creatorId, 
              newCreatorId 
            },
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }

      setResults(operationResults);

      if (successCount === selectedSlots.length) {
        notifyCreatorSwapped(`${successCount} criadores trocados com sucesso`);
        clearSelection();
        return true;
      } else {
        notifyError('operação em lote', `${successCount}/${selectedSlots.length} criadores trocados`);
        return false;
      }

    } catch (error) {
      notifyError('operação em lote', error instanceof Error ? error.message : 'Erro na operação');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [selectedSlots, slots, canPerformBulkOperation, swapCreator, notifyLoading, notifyCreatorSwapped, notifyError, clearSelection]);

  return {
    selectedSlots,
    isProcessing,
    results,
    toggleSlotSelection,
    selectAllSlots,
    clearSelection,
    bulkAddCreators,
    bulkRemoveCreators,
    bulkSwapCreators,
    getSelectedSlotsData,
    canPerformBulkOperation
  };
};
