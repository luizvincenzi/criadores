// Sistema de cache para reduzir chamadas à API do Google Sheets
import React from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  // TTL padrão: 30 segundos para dados dinâmicos, 5 minutos para dados estáticos
  private defaultTTL = {
    campaigns: 30 * 1000, // 30 segundos
    creators: 5 * 60 * 1000, // 5 minutos
    businesses: 5 * 60 * 1000, // 5 minutos
    journey: 30 * 1000, // 30 segundos
    slots: 15 * 1000, // 15 segundos
  };

  set<T>(key: string, data: T, category: keyof typeof this.defaultTTL = 'campaigns'): void {
    const ttl = this.defaultTTL[category];
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    console.log(`📦 Cache SET: ${key} (TTL: ${ttl/1000}s)`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      console.log(`📦 Cache MISS: ${key}`);
      return null;
    }

    const now = Date.now();
    const isExpired = (now - entry.timestamp) > entry.ttl;

    if (isExpired) {
      console.log(`📦 Cache EXPIRED: ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.log(`📦 Cache HIT: ${key}`);
    return entry.data as T;
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      console.log(`📦 Cache CLEAR ALL`);
      this.cache.clear();
      return;
    }

    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes(pattern)
    );

    keysToDelete.forEach(key => {
      console.log(`📦 Cache INVALIDATE: ${key}`);
      this.cache.delete(key);
    });
  }

  // Invalidar cache relacionado a uma campanha específica
  invalidateCampaign(businessName: string, mes?: string): void {
    const pattern = mes ? `${businessName}-${mes}` : businessName;
    this.invalidate(pattern);
  }

  // Estatísticas do cache
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Instância global do cache
export const apiCache = new ApiCache();

// Hook para usar cache em componentes React
export function useCachedApi<T>(
  key: string,
  apiCall: () => Promise<T>,
  category: keyof typeof apiCache['defaultTTL'] = 'campaigns'
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    // Tentar buscar do cache primeiro
    const cachedData = apiCache.get<T>(key);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    // Se não estiver no cache, fazer chamada à API
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      apiCache.set(key, result, category);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error(`❌ Erro na API ${key}:`, err);
    } finally {
      setLoading(false);
    }
  }, [key, apiCall, category]);

  const refetch = React.useCallback(async () => {
    apiCache.invalidate(key);
    await fetchData();
  }, [key, fetchData]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Utilitários para gerar chaves de cache consistentes
export const cacheKeys = {
  campaigns: () => 'campaigns-all',
  journey: () => 'journey-all',
  creators: () => 'creators-all',
  businesses: () => 'businesses-all',
  creatorSlots: (businessName: string, mes: string) => `slots-${businessName}-${mes}`,
  businessId: (businessName: string) => `business-id-${businessName}`,
  creatorId: (creatorName: string) => `creator-id-${creatorName}`,
};
