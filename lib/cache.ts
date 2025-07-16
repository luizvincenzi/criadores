// Sistema de cache para otimização de performance
// Suporta cache em memória e localStorage

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em milissegundos
}

interface CacheOptions {
  ttl?: number; // Padrão: 5 minutos
  storage?: 'memory' | 'localStorage' | 'both'; // Padrão: memory
  prefix?: string; // Prefixo para chaves do localStorage
}

class CacheManager {
  private memoryCache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutos
  private defaultPrefix = 'crm_cache_';

  // Definir um item no cache
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const {
      ttl = this.defaultTTL,
      storage = 'memory',
      prefix = this.defaultPrefix
    } = options;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    // Cache em memória
    if (storage === 'memory' || storage === 'both') {
      this.memoryCache.set(key, cacheItem);
    }

    // Cache no localStorage (apenas no browser)
    if ((storage === 'localStorage' || storage === 'both') && typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          `${prefix}${key}`,
          JSON.stringify(cacheItem)
        );
      } catch (error) {
        console.warn('Erro ao salvar no localStorage:', error);
      }
    }
  }

  // Buscar um item do cache
  get<T>(key: string, options: CacheOptions = {}): T | null {
    const {
      storage = 'memory',
      prefix = this.defaultPrefix
    } = options;

    let cacheItem: CacheItem<T> | null = null;

    // Tentar buscar do cache em memória primeiro
    if (storage === 'memory' || storage === 'both') {
      cacheItem = this.memoryCache.get(key) || null;
    }

    // Se não encontrou em memória, tentar localStorage
    if (!cacheItem && (storage === 'localStorage' || storage === 'both') && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${prefix}${key}`);
        if (stored) {
          cacheItem = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Erro ao ler do localStorage:', error);
      }
    }

    // Verificar se o item existe e não expirou
    if (cacheItem) {
      const now = Date.now();
      const isExpired = (now - cacheItem.timestamp) > cacheItem.ttl;

      if (isExpired) {
        // Item expirado, remover do cache
        this.delete(key, options);
        return null;
      }

      return cacheItem.data;
    }

    return null;
  }

  // Remover um item do cache
  delete(key: string, options: CacheOptions = {}): void {
    const {
      storage = 'memory',
      prefix = this.defaultPrefix
    } = options;

    // Remover do cache em memória
    if (storage === 'memory' || storage === 'both') {
      this.memoryCache.delete(key);
    }

    // Remover do localStorage
    if ((storage === 'localStorage' || storage === 'both') && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`${prefix}${key}`);
      } catch (error) {
        console.warn('Erro ao remover do localStorage:', error);
      }
    }
  }

  // Limpar todo o cache
  clear(options: CacheOptions = {}): void {
    const {
      storage = 'memory',
      prefix = this.defaultPrefix
    } = options;

    // Limpar cache em memória
    if (storage === 'memory' || storage === 'both') {
      this.memoryCache.clear();
    }

    // Limpar localStorage
    if ((storage === 'localStorage' || storage === 'both') && typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Erro ao limpar localStorage:', error);
      }
    }
  }

  // Verificar se um item existe no cache (sem retornar os dados)
  has(key: string, options: CacheOptions = {}): boolean {
    return this.get(key, options) !== null;
  }

  // Obter estatísticas do cache
  getStats(): {
    memorySize: number;
    localStorageSize: number;
    memoryKeys: string[];
  } {
    const memoryKeys = Array.from(this.memoryCache.keys());
    let localStorageSize = 0;

    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage);
        localStorageSize = keys.filter(key => 
          key.startsWith(this.defaultPrefix)
        ).length;
      } catch (error) {
        console.warn('Erro ao calcular tamanho do localStorage:', error);
      }
    }

    return {
      memorySize: this.memoryCache.size,
      localStorageSize,
      memoryKeys
    };
  }

  // Limpar itens expirados
  cleanup(options: CacheOptions = {}): number {
    const {
      storage = 'memory',
      prefix = this.defaultPrefix
    } = options;

    let removedCount = 0;
    const now = Date.now();

    // Limpar cache em memória
    if (storage === 'memory' || storage === 'both') {
      for (const [key, item] of this.memoryCache.entries()) {
        const isExpired = (now - item.timestamp) > item.ttl;
        if (isExpired) {
          this.memoryCache.delete(key);
          removedCount++;
        }
      }
    }

    // Limpar localStorage
    if ((storage === 'localStorage' || storage === 'both') && typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(prefix)) {
            try {
              const stored = localStorage.getItem(key);
              if (stored) {
                const item: CacheItem<any> = JSON.parse(stored);
                const isExpired = (now - item.timestamp) > item.ttl;
                if (isExpired) {
                  localStorage.removeItem(key);
                  removedCount++;
                }
              }
            } catch (error) {
              // Item corrompido, remover
              localStorage.removeItem(key);
              removedCount++;
            }
          }
        });
      } catch (error) {
        console.warn('Erro ao limpar localStorage:', error);
      }
    }

    return removedCount;
  }
}

// Instância singleton do cache
export const cache = new CacheManager();

// Funções de conveniência para uso específico do CRM
export const cacheKeys = {
  businesses: 'businesses',
  creators: 'creators',
  campaigns: 'campaigns',
  reports: (period: string) => `reports_${period}`,
  auditLogs: (entityType?: string) => `audit_logs${entityType ? `_${entityType}` : ''}`,
  userSession: 'user_session',
  dashboardStats: 'dashboard_stats'
};

// Cache específico para dados do CRM
export const crmCache = {
  // Cache para negócios
  setBusinesses: (data: any[]) => cache.set(cacheKeys.businesses, data, { 
    ttl: 2 * 60 * 1000, // 2 minutos
    storage: 'both' 
  }),
  getBusinesses: () => cache.get(cacheKeys.businesses, { storage: 'both' }),

  // Cache para criadores
  setCreators: (data: any[]) => cache.set(cacheKeys.creators, data, { 
    ttl: 2 * 60 * 1000, // 2 minutos
    storage: 'both' 
  }),
  getCreators: () => cache.get(cacheKeys.creators, { storage: 'both' }),

  // Cache para campanhas
  setCampaigns: (data: any[]) => cache.set(cacheKeys.campaigns, data, { 
    ttl: 1 * 60 * 1000, // 1 minuto (dados mais dinâmicos)
    storage: 'both' 
  }),
  getCampaigns: () => cache.get(cacheKeys.campaigns, { storage: 'both' }),

  // Cache para relatórios
  setReports: (period: string, data: any) => cache.set(cacheKeys.reports(period), data, { 
    ttl: 10 * 60 * 1000, // 10 minutos
    storage: 'both' 
  }),
  getReports: (period: string) => cache.get(cacheKeys.reports(period), { storage: 'both' }),

  // Cache para audit logs
  setAuditLogs: (data: any[], entityType?: string) => cache.set(cacheKeys.auditLogs(entityType), data, { 
    ttl: 5 * 60 * 1000, // 5 minutos
    storage: 'memory' // Apenas em memória para logs
  }),
  getAuditLogs: (entityType?: string) => cache.get(cacheKeys.auditLogs(entityType), { storage: 'memory' }),

  // Cache para sessão do usuário
  setUserSession: (data: any) => cache.set(cacheKeys.userSession, data, { 
    ttl: 30 * 60 * 1000, // 30 minutos
    storage: 'localStorage' 
  }),
  getUserSession: () => cache.get(cacheKeys.userSession, { storage: 'localStorage' }),

  // Cache para estatísticas do dashboard
  setDashboardStats: (data: any) => cache.set(cacheKeys.dashboardStats, data, { 
    ttl: 5 * 60 * 1000, // 5 minutos
    storage: 'both' 
  }),
  getDashboardStats: () => cache.get(cacheKeys.dashboardStats, { storage: 'both' }),

  // Invalidar cache relacionado a uma entidade
  invalidateEntity: (entityType: 'business' | 'creator' | 'campaign') => {
    switch (entityType) {
      case 'business':
        cache.delete(cacheKeys.businesses, { storage: 'both' });
        break;
      case 'creator':
        cache.delete(cacheKeys.creators, { storage: 'both' });
        break;
      case 'campaign':
        cache.delete(cacheKeys.campaigns, { storage: 'both' });
        break;
    }
    
    // Invalidar também estatísticas do dashboard e relatórios
    cache.delete(cacheKeys.dashboardStats, { storage: 'both' });
    ['last30days', 'last3months', 'last6months', 'lastyear'].forEach(period => {
      cache.delete(cacheKeys.reports(period), { storage: 'both' });
    });
  },

  // Limpar todo o cache do CRM
  clearAll: () => {
    cache.clear({ storage: 'both' });
  },

  // Obter estatísticas do cache
  getStats: () => cache.getStats(),

  // Limpar itens expirados
  cleanup: () => cache.cleanup({ storage: 'both' })
};

// Auto-cleanup a cada 10 minutos (apenas no browser)
if (typeof window !== 'undefined') {
  setInterval(() => {
    const removed = crmCache.cleanup();
    if (removed > 0) {
      console.log(`🧹 Cache cleanup: ${removed} itens expirados removidos`);
    }
  }, 10 * 60 * 1000);
}

export default cache;
