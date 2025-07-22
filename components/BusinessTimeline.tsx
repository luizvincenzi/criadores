import React, { useState, useEffect } from 'react';
import PriorityBadge from './PriorityBadge';

interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  old_stage?: string;
  new_stage?: string;
  time_in_previous_stage?: string;
  old_priority?: string;
  new_priority?: string;
  old_value?: number;
  new_value?: number;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
}

interface BusinessTimelineProps {
  businessId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessTimeline({ businessId, isOpen, onClose }: BusinessTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && businessId) {
      loadActivities();
    }
  }, [isOpen, businessId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/crm/activities?business_id=${businessId}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'stage_change': return '🔄';
      case 'priority_change': return '🎯';
      case 'value_change': return '💰';
      case 'note': return '📝';
      case 'call': return '📞';
      case 'email': return '📧';
      case 'meeting': return '🤝';
      case 'created': return '✨';
      default: return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'stage_change': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'priority_change': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'value_change': return 'bg-green-100 text-green-800 border-green-200';
      case 'note': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'created': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatTimeInStage = (interval: string) => {
    if (!interval) return '';
    
    // Converter interval PostgreSQL para formato legível
    const match = interval.match(/(\d+):(\d+):(\d+)/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h ${minutes}m`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }
    
    return interval;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📈</span>
                <h2 className="text-2xl font-bold">Timeline da Empresa</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Carregando atividades...</span>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">📋</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade encontrada</h3>
                <p className="text-gray-500">As atividades aparecerão aqui conforme forem sendo realizadas.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activities.map((activity, index) => (
                  <div key={activity.id} className="relative">
                    {/* Timeline line */}
                    {index < activities.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                    )}
                    
                    {/* Activity item */}
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className={`
                        flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg
                        ${getActivityColor(activity.activity_type)}
                      `}>
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                {activity.title}
                              </h4>
                              
                              {activity.description && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {activity.description}
                                </p>
                              )}
                              
                              {/* Stage change details */}
                              {activity.activity_type === 'stage_change' && activity.old_stage && activity.new_stage && (
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                    {activity.old_stage}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {activity.new_stage}
                                  </span>
                                  {activity.time_in_previous_stage && (
                                    <span className="text-xs text-gray-500">
                                      ({formatTimeInStage(activity.time_in_previous_stage)})
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              {/* Priority change details */}
                              {activity.activity_type === 'priority_change' && activity.old_priority && activity.new_priority && (
                                <div className="flex items-center space-x-2 mb-2">
                                  <PriorityBadge priority={activity.old_priority} size="sm" />
                                  <span className="text-gray-400">→</span>
                                  <PriorityBadge priority={activity.new_priority} size="sm" />
                                </div>
                              )}
                              
                              {/* Value change details */}
                              {activity.activity_type === 'value_change' && (
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                                    R$ {activity.old_value?.toFixed(2) || '0,00'}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    R$ {activity.new_value?.toFixed(2) || '0,00'}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-500">
                                {formatDate(activity.created_at)}
                              </p>
                              <p className="text-xs text-gray-400">
                                {activity.user.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
