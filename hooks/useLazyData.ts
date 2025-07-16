import { useState, useEffect, useCallback, useRef } from 'react';
import { crmCache } from '@/lib/cache';

interface LazyDataOptions<T> {
  cacheKey?: string;
  cacheTTL?: number;
  enableCache?: boolean;
  dependencies?: any[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryAttempts?: number;
  retryDelay?: number;
  debounceMs?: number;
}

interface LazyDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetch: Date | null;
  retryCount: number;
}

export function useLazyData<T>(
  fetchFunction: () => Promise<T>,
  options: LazyDataOptions<T> = {}
) {
  const {
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutos
    enableCache = true,
    dependencies = [],
    onSuccess,
    onError,
    retryAttempts = 3,
    retryDelay = 1000,
    debounceMs = 300
  } = options;

  const [state, setState] = useState<LazyDataState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetch: null,
    retryCount: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Função para buscar dados
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Verificar cache primeiro (se habilitado e não forçando refresh)
    if (enableCache && cacheKey && !forceRefresh) {
      const cachedData = crmCache.getReports(cacheKey); // Usar método genérico do cache
      if (cachedData) {
        setState(prev => ({
          ...prev,
          data: cachedData,
          loading: false,
          error: null,
          lastFetch: new Date()
        }));
        onSuccess?.(cachedData);
        return cachedData;
      }
    }

    // Criar novo AbortController
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const data = await fetchFunction();

      // Verificar se o componente ainda está montado
      if (!isMountedRef.current) {
        return null;
      }

      // Salvar no cache se habilitado
      if (enableCache && cacheKey) {
        crmCache.setReports(cacheKey, data); // Usar método genérico do cache
      }

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        lastFetch: new Date(),
        retryCount: 0
      }));

      onSuccess?.(data);
      return data;

    } catch (error) {
      if (!isMountedRef.current) {
        return null;
      }

      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Se foi cancelado, não atualizar o estado
      if (errorObj.name === 'AbortError') {
        return null;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorObj,
        retryCount: prev.retryCount + 1
      }));

      onError?.(errorObj);
      throw errorObj;
    }
  }, [fetchFunction, enableCache, cacheKey, onSuccess, onError]);

  // Função para retry com delay
  const retryFetch = useCallback(async () => {
    if (state.retryCount < retryAttempts) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, state.retryCount)));
      return fetchData();
    }
    throw new Error(`Máximo de tentativas (${retryAttempts}) excedido`);
  }, [state.retryCount, retryAttempts, retryDelay, fetchData]);

  // Função debounced para buscar dados
  const debouncedFetch = useCallback((forceRefresh = false) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchData(forceRefresh);
    }, debounceMs);
  }, [fetchData, debounceMs]);

  // Função para refresh manual
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Função para limpar dados
  const clear = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastFetch: null,
      retryCount: 0
    });

    if (enableCache && cacheKey) {
      // Limpar cache específico
      // crmCache.delete(cacheKey); // Implementar método delete genérico
    }
  }, [enableCache, cacheKey]);

  // Efeito para buscar dados quando dependências mudam
  useEffect(() => {
    debouncedFetch();
  }, dependencies);

  return {
    ...state,
    fetch: fetchData,
    debouncedFetch,
    refresh,
    retry: retryFetch,
    clear,
    isStale: state.lastFetch ? (Date.now() - state.lastFetch.getTime()) > cacheTTL : true,
    canRetry: state.retryCount < retryAttempts
  };
}

// Hook específico para dados do CRM
export function useLazyBusinesses(options: Omit<LazyDataOptions<any[]>, 'cacheKey'> = {}) {
  return useLazyData(
    async () => {
      const response = await fetch('/api/supabase/businesses');
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    {
      ...options,
      cacheKey: 'businesses',
      cacheTTL: 2 * 60 * 1000 // 2 minutos
    }
  );
}

export function useLazyCreators(options: Omit<LazyDataOptions<any[]>, 'cacheKey'> = {}) {
  return useLazyData(
    async () => {
      const response = await fetch('/api/supabase/creators');
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    {
      ...options,
      cacheKey: 'creators',
      cacheTTL: 2 * 60 * 1000 // 2 minutos
    }
  );
}

export function useLazyCampaigns(options: Omit<LazyDataOptions<any[]>, 'cacheKey'> = {}) {
  return useLazyData(
    async () => {
      const response = await fetch('/api/supabase/campaigns');
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    {
      ...options,
      cacheKey: 'campaigns',
      cacheTTL: 1 * 60 * 1000 // 1 minuto
    }
  );
}

export function useLazyReports(period: string, options: Omit<LazyDataOptions<any>, 'cacheKey'> = {}) {
  return useLazyData(
    async () => {
      const response = await fetch(`/api/reports?period=${period}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    {
      ...options,
      cacheKey: `reports_${period}`,
      cacheTTL: 10 * 60 * 1000, // 10 minutos
      dependencies: [period]
    }
  );
}

export function useLazyAuditLogs(entityType?: string, options: Omit<LazyDataOptions<any[]>, 'cacheKey'> = {}) {
  return useLazyData(
    async () => {
      const params = entityType ? `?entity_type=${entityType}` : '';
      const response = await fetch(`/api/supabase/audit-logs${params}`);
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    {
      ...options,
      cacheKey: `audit_logs${entityType ? `_${entityType}` : ''}`,
      cacheTTL: 5 * 60 * 1000, // 5 minutos
      dependencies: [entityType]
    }
  );
}

// Hook para dados do dashboard
export function useLazyDashboardStats(options: Omit<LazyDataOptions<any>, 'cacheKey'> = {}) {
  return useLazyData(
    async () => {
      // Buscar dados de múltiplas fontes em paralelo
      const [businessesRes, creatorsRes, campaignsRes] = await Promise.all([
        fetch('/api/supabase/businesses'),
        fetch('/api/supabase/creators'),
        fetch('/api/supabase/campaigns')
      ]);

      const [businessesData, creatorsData, campaignsData] = await Promise.all([
        businessesRes.json(),
        creatorsRes.json(),
        campaignsRes.json()
      ]);

      // Calcular estatísticas
      const stats = {
        totalBusinesses: businessesData.success ? businessesData.data.length : 0,
        totalCreators: creatorsData.success ? creatorsData.data.length : 0,
        totalCampaigns: campaignsData.success ? campaignsData.data.length : 0,
        activeCampaigns: campaignsData.success ? 
          campaignsData.data.filter((c: any) => c.status !== 'Finalizado').length : 0
      };

      return stats;
    },
    {
      ...options,
      cacheKey: 'dashboard_stats',
      cacheTTL: 5 * 60 * 1000 // 5 minutos
    }
  );
}
