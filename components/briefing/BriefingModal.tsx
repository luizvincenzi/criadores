'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, FileText, CheckCircle, Clock, TrendingUp, Download, Copy } from 'lucide-react';

interface BriefingModalProps {
  briefingId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface BriefingDetail {
  id: string;
  refCode: string;
  businessName: string;
  referenceMonth: string;
  meetingDate: string;
  status: string;
  participants: {
    criadores: string[];
    client: string[];
  };
  executiveSummary: {
    month_campaigns: string[];
    next_step: string;
    identified_needs: string[];
    previous_month_feedback: string;
  };
  productInfo: {
    description: string;
    price: string;
    place: string;
    promotion: string;
    ideal_audience: string;
    benefits: string[];
  };
  campaignContext: {
    objective: string;
    strategy: string;
    pillars: string;
  };
  dosAndDonts: {
    dos: string[];
    donts: string[];
  };
  conversionTips: string[];
  tasks: {
    internal: Array<{
      id: string;
      description: string;
      status: string;
      priority: number;
      assignedTo: string;
      dueDate: string;
    }>;
    client: Array<{
      id: string;
      description: string;
      status: string;
      priority: number;
      assignedTo: string;
      dueDate: string;
    }>;
  };
  checklist: Array<{
    id: string;
    description: string;
    checked: boolean;
    evidence: string;
    category: string;
  }>;
  stats: {
    performanceScore: number;
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    checklistTotal: number;
    checklistCompleted: number;
  };
}

export default function BriefingModal({ briefingId, isOpen, onClose }: BriefingModalProps) {
  const [briefing, setBriefing] = useState<BriefingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('resumo');

  useEffect(() => {
    if (isOpen && briefingId) {
      loadBriefingDetail();
    }
  }, [isOpen, briefingId]);

  const loadBriefingDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/briefings/${briefingId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar briefing');
      }

      setBriefing(data);
    } catch (err) {
      console.error('Erro ao carregar briefing:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'todo': 'bg-red-100 text-red-800',
      'doing': 'bg-yellow-100 text-yellow-800',
      'done': 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return '✅';
      case 'doing': return '🔄';
      default: return '⏳';
    }
  };

  const copyWhatsAppSummary = () => {
    if (!briefing) return;

    let summary = `*Resumo do Briefing - ${briefing.referenceMonth}*\n\n`;
    summary += `*Campanhas do Mês:*\n`;
    briefing.executiveSummary.month_campaigns.forEach(campaign => {
      summary += `• ${campaign}\n`;
    });
    summary += `\n*Próximo Passo:*\n${briefing.executiveSummary.next_step}\n\n`;
    
    const pendingTasks = [...briefing.tasks.internal, ...briefing.tasks.client]
      .filter(task => task.status !== 'done');
    
    if (pendingTasks.length > 0) {
      summary += `*Tarefas Pendentes:*\n`;
      pendingTasks.forEach(task => {
        summary += `• ${task.description}\n`;
      });
    }

    navigator.clipboard.writeText(summary);
    alert('Resumo copiado para o WhatsApp!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {briefing ? `Briefing ${briefing.referenceMonth}` : 'Carregando...'}
                </h2>
                {briefing && (
                  <p className="text-sm text-gray-600">
                    {briefing.businessName} • {briefing.refCode}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {briefing && (
                  <>
                    <button
                      onClick={copyWhatsAppSummary}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copiar Resumo</span>
                    </button>
                    
                    <button className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      <Download className="h-4 w-4" />
                      <span>PDF</span>
                    </button>
                  </>
                )}
                
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            {briefing && (
              <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'resumo', label: 'Resumo' },
                  { id: 'campanhas', label: 'Campanhas' },
                  { id: 'tarefas', label: 'Tarefas' },
                  { id: 'performance', label: 'Performance' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Carregando briefing...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="text-red-600 mb-2">❌ {error}</div>
                <button
                  onClick={loadBriefingDetail}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {briefing && (
              <>
                {/* Tab: Resumo */}
                {activeTab === 'resumo' && (
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600 font-medium">Performance</p>
                            <p className="text-2xl font-bold text-blue-900">{briefing.stats.performanceScore}%</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-600 font-medium">Tarefas</p>
                            <p className="text-2xl font-bold text-green-900">
                              {briefing.stats.completedTasks}/{briefing.stats.totalTasks}
                            </p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-600 font-medium">Participantes</p>
                            <p className="text-2xl font-bold text-purple-900">
                              {briefing.participants.criadores.length + briefing.participants.client.length}
                            </p>
                          </div>
                          <Users className="h-8 w-8 text-purple-600" />
                        </div>
                      </div>
                      
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-orange-600 font-medium">Campanhas</p>
                            <p className="text-2xl font-bold text-orange-900">
                              {briefing.executiveSummary.month_campaigns.length}
                            </p>
                          </div>
                          <FileText className="h-8 w-8 text-orange-600" />
                        </div>
                      </div>
                    </div>

                    {/* Resumo Executivo */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Executivo</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Participantes (crIAdores)</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {briefing.participants.criadores.map((participant, index) => (
                              <li key={index}>• {participant}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Participantes (Cliente)</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {briefing.participants.client.map((participant, index) => (
                              <li key={index}>• {participant}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {briefing.executiveSummary.next_step && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">Próximo Passo Imediato</h4>
                          <p className="text-blue-700 text-sm">{briefing.executiveSummary.next_step}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Campanhas */}
                {activeTab === 'campanhas' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Campanhas do Mês</h3>
                      <div className="space-y-3">
                        {briefing.executiveSummary.month_campaigns.map((campaign, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{campaign}</span>
                              <span className="text-sm text-gray-500">#{index + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contexto da Campanha */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contexto da Campanha</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Objetivo Principal</h4>
                          <p className="text-sm text-gray-600">{briefing.campaignContext.objective}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Estratégia Central</h4>
                          <p className="text-sm text-gray-600">{briefing.campaignContext.strategy}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Pilares de Conteúdo</h4>
                          <p className="text-sm text-gray-600">{briefing.campaignContext.pillars}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Tarefas */}
                {activeTab === 'tarefas' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Tarefas Internas */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Ações Internas (crIAdores)
                        </h3>
                        <div className="space-y-3">
                          {briefing.tasks.internal.map((task) => (
                            <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">{task.description}</p>
                                  {task.assignedTo && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Responsável: {task.assignedTo}
                                    </p>
                                  )}
                                </div>
                                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                  {getStatusIcon(task.status)} {
                                    task.status === 'todo' ? 'A Fazer' :
                                    task.status === 'doing' ? 'Em Progresso' : 'Concluído'
                                  }
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tarefas do Cliente */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Próximos Passos (Cliente)
                        </h3>
                        <div className="space-y-3">
                          {briefing.tasks.client.map((task) => (
                            <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-900">{task.description}</p>
                                  {task.assignedTo && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Responsável: {task.assignedTo}
                                    </p>
                                  )}
                                </div>
                                <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                  {getStatusIcon(task.status)} {
                                    task.status === 'todo' ? 'A Fazer' :
                                    task.status === 'doing' ? 'Em Progresso' : 'Concluído'
                                  }
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Performance */}
                {activeTab === 'performance' && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Análise de Performance da Call
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {briefing.stats.performanceScore}%
                          </div>
                          <div className="text-sm text-gray-600">Score Geral</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            {briefing.stats.checklistCompleted}
                          </div>
                          <div className="text-sm text-gray-600">Itens Completos</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-600 mb-1">
                            {briefing.stats.checklistTotal}
                          </div>
                          <div className="text-sm text-gray-600">Total de Itens</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-700">Checklist de Itens Discutidos</h4>
                        {briefing.checklist.map((item) => (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <span className="text-lg mt-1">
                                {item.checked ? '✅' : '❌'}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{item.description}</p>
                                {item.evidence && item.checked && (
                                  <p className="text-xs text-gray-500 mt-2 italic">
                                    Evidência: {item.evidence}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
