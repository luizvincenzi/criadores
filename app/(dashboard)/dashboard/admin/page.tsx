'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  Settings,
  Shield
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalCampaigns: 0,
    totalRevenue: 0,
    activeUsers: 0,
    activeBusinesses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se é admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    loadStats();
  }, [user, router]);

  const loadStats = async () => {
    try {
      setLoading(true);
      // TODO: Implementar chamada à API para buscar estatísticas
      // const response = await fetch('/api/admin/stats');
      // const data = await response.json();
      // setStats(data);
      
      // Mock data por enquanto
      setStats({
        totalUsers: 45,
        totalBusinesses: 23,
        totalCampaigns: 156,
        totalRevenue: 125000,
        activeUsers: 38,
        activeBusinesses: 20
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
            <p className="text-gray-600 mt-1">Visão geral do sistema</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Usuários</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.activeUsers} ativos
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Businesses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Empresas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBusinesses}</p>
              <p className="text-sm text-green-600 mt-1">
                {stats.activeBusinesses} ativas
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Campaigns */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Campanhas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCampaigns}</p>
              <p className="text-sm text-blue-600 mt-1">
                Este mês
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita Total</p>
              <p className="text-3xl font-bold text-gray-900">
                R$ {(stats.totalRevenue / 1000).toFixed(0)}k
              </p>
              <p className="text-sm text-green-600 mt-1">
                +12% vs mês anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Growth */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Crescimento</p>
              <p className="text-3xl font-bold text-gray-900">+24%</p>
              <p className="text-sm text-green-600 mt-1">
                Últimos 3 meses
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Relatórios</p>
              <p className="text-3xl font-bold text-gray-900">12</p>
              <p className="text-sm text-blue-600 mt-1">
                Disponíveis
              </p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-pink-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => router.push('/businesses')}
            className="flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <Building2 className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Gerenciar Empresas</span>
          </button>
          
          <button 
            onClick={() => router.push('/creators')}
            className="flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <Users className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Gerenciar Criadores</span>
          </button>
          
          <button 
            onClick={() => router.push('/campaigns')}
            className="flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <Calendar className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Ver Campanhas</span>
          </button>
          
          <button 
            onClick={() => router.push('/reports')}
            className="flex items-center justify-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <BarChart3 className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Relatórios</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Novo usuário cadastrado</p>
                <p className="text-xs text-gray-500">João Silva - Business Owner</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">Há 2 horas</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nova empresa adicionada</p>
                <p className="text-xs text-gray-500">Restaurante XYZ</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">Há 5 horas</span>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Campanha finalizada</p>
                <p className="text-xs text-gray-500">Campanha Outubro - Restaurante ABC</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">Ontem</span>
          </div>
        </div>
      </div>
    </div>
  );
}

