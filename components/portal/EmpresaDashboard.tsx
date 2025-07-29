'use client';

import React, { useState, useEffect } from 'react';
import { PortalUser } from '@/hooks/usePortalAuth';

interface EmpresaDashboardProps {
  user: PortalUser;
}

interface DashboardStats {
  campanhas: {
    ativas: number;
    finalizadas: number;
    total: number;
  };
  criadores: {
    trabalhando: number;
    total: number;
  };
  metricas: {
    alcanceTotal: number;
    engajamentoMedio: number;
    investimentoTotal: number;
  };
}

export default function EmpresaDashboard({ user }: EmpresaDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user.entity_id]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch('/api/portal/dashboard/empresa', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface rounded-2xl p-6 border border-outline-variant">
              <div className="animate-pulse">
                <div className="h-4 bg-surface-container rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-surface-container rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Campanhas */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs text-on-surface-variant">Campanhas</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-on-surface">
              {stats?.campanhas.ativas || 0}
            </div>
            <div className="text-sm text-on-surface-variant">
              Campanhas ativas
            </div>
            <div className="text-xs text-on-surface-variant">
              {stats?.campanhas.total || 0} total • {stats?.campanhas.finalizadas || 0} finalizadas
            </div>
          </div>
        </div>

        {/* Criadores */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs text-on-surface-variant">Criadores</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-on-surface">
              {stats?.criadores.trabalhando || 0}
            </div>
            <div className="text-sm text-on-surface-variant">
              Trabalhando agora
            </div>
            <div className="text-xs text-on-surface-variant">
              {stats?.criadores.total || 0} criadores no total
            </div>
          </div>
        </div>

        {/* Métricas */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-tertiary-container rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs text-on-surface-variant">Performance</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-on-surface">
              {((stats?.metricas.alcanceTotal || 0) / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-on-surface-variant">
              Alcance total
            </div>
            <div className="text-xs text-on-surface-variant">
              {(stats?.metricas.engajamentoMedio || 0).toFixed(1)}% engajamento médio
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campanhas Recentes */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant">
          <h3 className="text-lg font-semibold text-on-surface mb-4">
            Campanhas Recentes
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-surface-container rounded-xl">
                <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
                  <span className="text-primary text-sm font-medium">C{i}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-on-surface">
                    Campanha {i}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    Em andamento • 2 criadores
                  </div>
                </div>
                <div className="text-xs text-on-surface-variant">
                  2 dias
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximas Entregas */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant">
          <h3 className="text-lg font-semibold text-on-surface mb-4">
            Próximas Entregas
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-surface-container rounded-xl">
                <div className="w-10 h-10 bg-secondary-container rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-on-surface">
                    Entrega {i}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    Criador {i} • Campanha {i}
                  </div>
                </div>
                <div className="text-xs text-warning">
                  {i} dia{i > 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
