'use client';

import React from 'react';
import { Calendar, Users, CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react';

interface BriefingCardProps {
  briefing: {
    id: string;
    refCode: string;
    businessName: string;
    referenceMonth: string;
    meetingDate: string;
    status: string;
    nextStep: string;
    monthCampaigns: string[];
    performanceScore: number;
    totalTasks: number;
    pendingTasks: number;
    participants: {
      criadores: string[];
      client: string[];
    };
  };
  onClick: () => void;
}

export default function BriefingCard({ briefing, onClick }: BriefingCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800 border-gray-200',
      'completed': 'bg-blue-100 text-blue-800 border-blue-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'archived': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'approved': return '🎯';
      case 'archived': return '📁';
      default: return '📝';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getStatusIcon(briefing.status)}</span>
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              Briefing {briefing.referenceMonth}
            </h3>
          </div>
          <p className="text-sm text-gray-600 font-medium">{briefing.businessName}</p>
          <p className="text-xs text-gray-500 mt-1">Ref: {briefing.refCode}</p>
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(briefing.status)}`}>
            {briefing.status === 'draft' ? 'Rascunho' :
             briefing.status === 'completed' ? 'Concluído' :
             briefing.status === 'approved' ? 'Aprovado' : 'Arquivado'}
          </span>
          
          {briefing.performanceScore > 0 && (
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3 text-gray-400" />
              <span className={`text-xs font-medium ${getPerformanceColor(briefing.performanceScore)}`}>
                {briefing.performanceScore}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Info */}
      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(briefing.meetingDate)}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4" />
          <span>{briefing.participants.criadores.length + briefing.participants.client.length} participantes</span>
        </div>
      </div>

      {/* Campaigns Preview */}
      {briefing.monthCampaigns.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            Campanhas do Mês ({briefing.monthCampaigns.length})
          </h4>
          <div className="space-y-1">
            {briefing.monthCampaigns.slice(0, 2).map((campaign, index) => (
              <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                • {campaign}
              </div>
            ))}
            {briefing.monthCampaigns.length > 2 && (
              <div className="text-xs text-gray-500 italic">
                +{briefing.monthCampaigns.length - 2} mais...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Step */}
      {briefing.nextStep && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
          <h4 className="text-xs font-medium text-blue-800 mb-1">Próximo Passo</h4>
          <p className="text-xs text-blue-700 line-clamp-2">{briefing.nextStep}</p>
        </div>
      )}

      {/* Tasks Summary */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>{briefing.totalTasks - briefing.pendingTasks}/{briefing.totalTasks} tarefas</span>
          </div>
          
          {briefing.pendingTasks > 0 && (
            <div className="flex items-center space-x-1 text-orange-600">
              <Clock className="h-3 w-3" />
              <span>{briefing.pendingTasks} pendentes</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-400">
          Clique para ver detalhes
        </div>
      </div>
    </div>
  );
}
