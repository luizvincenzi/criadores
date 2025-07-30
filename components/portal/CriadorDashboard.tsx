'use client';

import React, { useState, useEffect } from 'react';
import { PortalUser } from '@/hooks/usePortalAuth';

interface CriadorDashboardProps {
  user: PortalUser;
}

interface CriadorStats {
  campanhas: {
    ativas: number;
    concluidas: number;
    total: number;
  };
  performance: {
    alcanceTotal: number;
    engajamentoMedio: number;
    crescimentoSeguidores: number;
  };
  financeiro: {
    pagamentosRecebidos: number;
    pagamentosPendentes: number;
  };
}

export default function CriadorDashboard({ user }: CriadorDashboardProps) {
  const [stats, setStats] = useState<CriadorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user.entity_id]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('portal_token');
      const response = await fetch('/api/portal/dashboard/criador', {
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
              {stats?.campanhas.total || 0} total • {stats?.campanhas.concluidas || 0} concluídas
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs text-on-surface-variant">Performance</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-on-surface">
              {((stats?.performance.alcanceTotal || 0) / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-on-surface-variant">
              Alcance total
            </div>
            <div className="text-xs text-on-surface-variant">
              {(stats?.performance.engajamentoMedio || 0).toFixed(1)}% engajamento médio
            </div>
          </div>
        </div>

        {/* Financeiro */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-tertiary-container rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-on-surface-variant">Financeiro</span>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-on-surface">
              R$ {(stats?.financeiro.pagamentosRecebidos || 0).toLocaleString()}
            </div>
            <div className="text-sm text-on-surface-variant">
              Recebido este mês
            </div>
            <div className="text-xs text-on-surface-variant">
              R$ {(stats?.financeiro.pagamentosPendentes || 0).toLocaleString()} pendente
            </div>
          </div>
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campanhas Ativas */}
        <div className="bg-surface rounded-2xl p-6 border border-outline-variant">
          <h3 className="text-lg font-semibold text-on-surface mb-4">
            Campanhas Ativas
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
                    Empresa {i} • Em andamento
                  </div>
                </div>
                <div className="text-xs text-primary">
                  Ativa
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
                <div className="w-10 h-10 bg-warning-container rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-on-surface">
                    Entrega {i}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    Campanha {i} • Conteúdo
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

      {/* Performance Chart Placeholder */}
      <div className="bg-surface rounded-2xl p-6 border border-outline-variant">
        <h3 className="text-lg font-semibold text-on-surface mb-4">
          Performance dos Últimos 30 Dias
        </h3>
        <div className="h-48 bg-surface-container rounded-xl flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 text-on-surface-variant mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-on-surface-variant">
              Gráfico de performance em desenvolvimento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
