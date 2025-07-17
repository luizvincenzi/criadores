'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface SlotData {
  index: number;
  influenciador: string;
  briefingCompleto: string;
  dataHoraVisita: string;
  quantidadeConvidados: string;
  visitaConfirmado: string;
  dataHoraPostagem: string;
  videoAprovado: string;
  videoPostado: string;
  videoInstagramLink: string;
  videoTiktokLink: string;
  isExisting: boolean;
  rowIndex: number;
  businessName: string;
  businessId: string;
  campaignId: string;
  creatorId: string | null;
  creatorData: {
    id: string;
    name: string;
  } | null;
}

interface CreatorData {
  id: string;
  nome: string;
  cidade: string;
  seguidores: number;
  instagram: string;
  whatsapp: string;
  status: string;
}

interface CampaignSlotsResponse {
  success: boolean;
  slots: SlotData[];
  availableCreators: CreatorData[];
  campaignId: string;
  businessId: string;
  source: string;
  validation: {
    isValid: boolean;
    errors: string[];
  };
}

interface UseCampaignSlotsReturn {
  slots: SlotData[];
  availableCreators: CreatorData[];
  campaignId: string;
  loading: boolean;
  error: string | null;
  validation: { isValid: boolean; errors: string[] };
  
  // Actions
  refresh: () => Promise<void>;
  addCreator: (creatorId: string, increaseSlots?: boolean) => Promise<boolean>;
  removeCreator: (creatorId: string, deleteLine?: boolean) => Promise<boolean>;
  
  // State
  isAdding: boolean;
  isRemoving: boolean;
  lastUpdated: Date | null;
}

export const useCampaignSlots = (
  businessName: string, 
  mes: string,
  autoRefreshInterval: number = 0 // 0 = sem auto-refresh automático
): UseCampaignSlotsReturn => {
  
  // Estados principais
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [availableCreators, setAvailableCreators] = useState<CreatorData[]>([]);
  const [campaignId, setCampaignId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: true,
    errors: []
  });
  
  // Estados de operações
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Refs para controle
  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função principal de busca de dados
  const fetchSlots = useCallback(async (silent: boolean = false): Promise<CampaignSlotsResponse | null> => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Criar novo AbortController
    abortControllerRef.current = new AbortController();
    
    if (!silent) {
      setLoading(true);
    }
    
    try {
      console.log('🔄 Buscando slots:', { businessName, mes, silent });
      
      const response = await fetch(
        `/api/supabase/creator-slots?businessName=${encodeURIComponent(businessName)}&mes=${encodeURIComponent(mes)}`,
        { 
          signal: abortControllerRef.current.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data: CampaignSlotsResponse = await response.json();
      
      if (data.success) {
        setSlots(data.slots || []);
        setAvailableCreators(data.availableCreators || []);
        setCampaignId(data.campaignId || '');
        setValidation(data.validation || { isValid: true, errors: [] });
        setError(null);
        setLastUpdated(new Date());
        
        console.log('✅ Slots atualizados:', {
          slotsCount: data.slots?.length || 0,
          creatorsCount: data.availableCreators?.length || 0,
          isValid: data.validation?.isValid,
          silent
        });
        
        return data;
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('🚫 Requisição cancelada');
        return null;
      }
      
      console.error('❌ Erro ao buscar slots:', err);
      setError(err.message || 'Erro ao carregar dados');
      return null;
      
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [businessName, mes]);

  // Função pública de refresh
  const refresh = useCallback(async (): Promise<void> => {
    await fetchSlots(false);
  }, [fetchSlots]);

  // Função para adicionar criador
  const addCreator = useCallback(async (
    creatorId: string, 
    increaseSlots: boolean = false
  ): Promise<boolean> => {
    setIsAdding(true);
    setError(null);
    
    try {
      console.log('➕ Adicionando criador:', { creatorId, increaseSlots });
      
      const response = await fetch('/api/supabase/campaign-creators/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessName,
          mes,
          creatorId,
          userEmail: 'usuario@sistema.com',
          increaseSlots
        })
      });
      
      const result = await response.json();
      
      if (result.success && result.data?.atomicResult?.success) {
        console.log('✅ Criador adicionado com sucesso');
        
        // Auto-refresh silencioso após sucesso
        await fetchSlots(true);
        return true;
        
      } else {
        const errorMsg = result.data?.atomicResult?.error || result.error || 'Erro ao adicionar criador';
        console.error('❌ Erro ao adicionar criador:', errorMsg);
        setError(errorMsg);
        return false;
      }
      
    } catch (err: any) {
      console.error('❌ Erro na requisição de adição:', err);
      setError(err.message || 'Erro de conexão');
      return false;
      
    } finally {
      setIsAdding(false);
    }
  }, [businessName, mes, fetchSlots]);

  // Função para remover criador
  const removeCreator = useCallback(async (
    creatorId: string, 
    deleteLine: boolean = false
  ): Promise<boolean> => {
    setIsRemoving(true);
    setError(null);
    
    try {
      console.log('🗑️ Removendo criador:', { creatorId, deleteLine });
      
      const response = await fetch('/api/supabase/campaign-creators/delete-line', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessName,
          mes,
          creatorId,
          userEmail: 'usuario@sistema.com'
        })
      });
      
      const result = await response.json();

      console.log('📊 Resposta da API de remoção:', result);

      if (result.success) {
        // Verificar se a função atômica foi bem-sucedida
        if (result.data?.atomicResult?.success || result.message) {
          console.log('✅ Criador removido com sucesso');

          // Auto-refresh silencioso após sucesso
          await fetchSlots(true);
          return true;
        } else {
          const errorMsg = result.data?.atomicResult?.error || 'Função atômica falhou';
          console.error('❌ Erro na função atômica:', errorMsg);
          setError(errorMsg);
          return false;
        }
      } else {
        const errorMsg = result.error || 'Erro ao remover criador';
        console.error('❌ Erro na API de remoção:', errorMsg);
        setError(errorMsg);
        return false;
      }
      
    } catch (err: any) {
      console.error('❌ Erro na requisição de remoção:', err);
      setError(err.message || 'Erro de conexão');
      return false;
      
    } finally {
      setIsRemoving(false);
    }
  }, [businessName, mes, fetchSlots]);

  // Auto-refresh periódico (se configurado)
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        fetchSlots(true); // Silent refresh
      }, autoRefreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, fetchSlots]);

  // Busca inicial
  useEffect(() => {
    if (businessName && mes) {
      fetchSlots(false);
    }
  }, [businessName, mes, fetchSlots]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Função para trocar criador (swap)
  const swapCreator = useCallback(async (
    oldCreatorId: string,
    newCreatorId: string
  ): Promise<boolean> => {
    setIsAdding(true);
    setError(null);

    try {
      console.log('🔄 Trocando criador:', { oldCreatorId, newCreatorId });

      const response = await fetch('/api/supabase/campaign-creators/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          businessName,
          mes,
          oldCreatorId,
          newCreatorId,
          userEmail: 'usuario@sistema.com'
        })
      });

      const result = await response.json();

      console.log('📊 Resposta da API de swap:', result);

      if (result.success) {
        console.log('✅ Criador trocado com sucesso');

        // Auto-refresh silencioso após sucesso
        await fetchSlots(true);
        return true;

      } else {
        const errorMsg = result.error || 'Erro ao trocar criador';
        console.error('❌ Erro ao trocar criador:', errorMsg);
        setError(errorMsg);
        return false;
      }

    } catch (err: any) {
      console.error('❌ Erro na requisição de troca:', err);
      setError(err.message || 'Erro de conexão');
      return false;

    } finally {
      setIsAdding(false);
    }
  }, [businessName, mes, fetchSlots]);

  return {
    slots,
    availableCreators,
    campaignId,
    loading,
    error,
    validation,
    refresh,
    addCreator,
    removeCreator,
    swapCreator,
    isAdding,
    isRemoving,
    lastUpdated
  };
};
