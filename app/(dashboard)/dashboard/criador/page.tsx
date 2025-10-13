'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  TrendingUp, 
  Eye, 
  Heart,
  Video,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function CriadorDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    totalViews: 0,
    totalEngagement: 0,
    pendingTasks: 0,
    upcomingDeadlines: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se é criador
    if (user && !['creator', 'creator_strategist', 'marketing_strategist'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }

    loadStats();
  }, [user, router]);

  const loadStats = async () => {
    try {
      setLoading(true);
      // TODO: Implementar chamada à API para buscar estatísticas do criador
      // const response = await fetch('/api/creator/stats');
      // const data = await response.json();
      // setStats(data);
      
      // Mock data por enquanto
      setStats({
        totalCampaigns: 12,
        activeCampaigns: 3,
        completedCampaigns: 9,
        totalViews: 45000,
        totalEngagement: 3200,
        pendingTasks: 5,
        upcomingDeadlines: 2
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !['creator', 'creator_strategist', 'marketing_strategist'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
            <h1 className="text-2xl font-bold text-gray-900">Olá, {user?.full_name || 'Criador'}! 👋</h1>
            <p className="text-gray-600 mt-1">Aqui está um resumo das suas atividades</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push('/conteudo')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendário de Conteúdo
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Campaigns */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Campanhas Ativas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeCampaigns}</p>
              <p className="text-sm text-blue-600 mt-1">
                {stats.totalCampaigns} no total
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Visualizações</p>
              <p className="text-3xl font-bold text-gray-900">
                {(stats.totalViews / 1000).toFixed(1)}k
              </p>
              <p className="text-sm text-green-600 mt-1">
                +15% este mês
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Engagement */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Engajamento</p>
              <p className="text-3xl font-bold text-gray-900">
                {(stats.totalEngagement / 1000).toFixed(1)}k
              </p>
              <p className="text-sm text-green-600 mt-1">
                Taxa: {((stats.totalEngagement / stats.totalViews) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-pink-600" />
            </div>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tarefas Pendentes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingTasks}</p>
              <p className="text-sm text-orange-600 mt-1">
                {stats.upcomingDeadlines} prazos próximos
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conteúdos Recentes</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Video className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Reels - Produto do Dia</p>
                  <p className="text-xs text-gray-500">Instagram • Publicado há 2 dias</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">12.5k</p>
                <p className="text-xs text-gray-500">visualizações</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Post - Novidade da Semana</p>
                  <p className="text-xs text-gray-500">Instagram • Publicado há 4 dias</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">8.2k</p>
                <p className="text-xs text-gray-500">visualizações</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Video className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Story - Bastidores</p>
                  <p className="text-xs text-gray-500">Instagram • Publicado há 1 semana</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">5.8k</p>
                <p className="text-xs text-gray-500">visualizações</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos Prazos</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Reels - Campanha Novembro</p>
                <p className="text-xs text-gray-600 mt-1">Restaurante ABC</p>
                <p className="text-xs text-orange-600 font-medium mt-2">Entrega: Amanhã</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Post - Evento Especial</p>
                <p className="text-xs text-gray-600 mt-1">Empresa XYZ</p>
                <p className="text-xs text-blue-600 font-medium mt-2">Entrega: Em 3 dias</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Story - Promoção</p>
                <p className="text-xs text-gray-600 mt-1">Loja 123</p>
                <p className="text-xs text-green-600 font-medium mt-2">Entrega: Em 1 semana</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => router.push('/conteudo')}
            className="flex items-center justify-center px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">Ver Calendário</span>
          </button>
          
          <button 
            onClick={() => router.push('/campaigns')}
            className="flex items-center justify-center px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
          >
            <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-700">Minhas Campanhas</span>
          </button>
          
          <button 
            onClick={() => router.push('/reports')}
            className="flex items-center justify-center px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
          >
            <Eye className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-700">Ver Métricas</span>
          </button>
        </div>
      </div>
    </div>
  );
}

