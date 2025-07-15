// Sistema de cache para reduzir chamadas à API do Google Sheets
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  // TTL aumentado para reduzir quota do Google Sheets
  private defaultTTL = {
    campaigns: 2 * 60 * 1000, // 2 minutos
    creators: 10 * 60 * 1000, // 10 minutos
    businesses: 10 * 60 * 1000, // 10 minutos
    journey: 2 * 60 * 1000, // 2 minutos
    slots: 2 * 60 * 1000, // 2 minutos
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

// Nota: Hook React removido para evitar problemas no servidor
// Use o apiCache diretamente nas APIs do servidor

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
