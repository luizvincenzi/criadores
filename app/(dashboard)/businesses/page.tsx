'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessStore, Business } from '@/store/businessStore';
import { fetchBusinesses, isUsingSupabase } from '@/lib/dataSource';
import BusinessCard from '@/components/BusinessCard';
import AddBusinessModalNew from '@/components/AddBusinessModalNew';
import BusinessModalNew from '@/components/BusinessModalNew';
import BusinessTimeline from '@/components/BusinessTimeline';
import AddNoteModal from '@/components/AddNoteModal';
import PlanBadge from '@/components/PlanBadge';
import PriorityBadge from '@/components/PriorityBadge';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';



export default function BusinessesPage() {
  const { businesses: storeBusinesses, getStats, loadBusinessesFromSheet } = useBusinessStore();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [timelineBusinessId, setTimelineBusinessId] = useState<string>('');

  // Evitar erro de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carregar negócios do Supabase
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setIsLoading(true);
        console.log('🏢 Carregando negócios...');

        if (isUsingSupabase()) {
          const businessesData = await fetchBusinesses();
          console.log('✅ Negócios carregados:', businessesData);
          setBusinesses(businessesData);
        } else {
          // Fallback para store
          await loadBusinessesFromSheet();
          setBusinesses(storeBusinesses);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar negócios:', error);
        setBusinesses([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinesses();
  }, [loadBusinessesFromSheet, storeBusinesses]);

  // Calcular estatísticas dos negócios carregados
  const stats = isClient ? {
    total: businesses.length,
    byStage: businesses.reduce((acc: any, business: any) => {
      const stage = business.prospeccao || business.status || 'Reunião Briefing';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {}),
    byBusinessStage: businesses.reduce((acc: any, business: any) => {
      const stage = business.businessStage || 'Leads próprios frios';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {}),
    totalEstimatedValue: businesses.reduce((sum: number, business: any) => {
      return sum + (business.estimatedValue || business.value || 0);
    }, 0),
    conversionRate: businesses.length > 0 ? Math.round((businesses.filter((b: any) => b.prospeccao === 'Entrega Final').length / businesses.length) * 100) : 0
  } : {
    total: 0,
    byStage: {},
    byBusinessStage: {},
    totalEstimatedValue: 0,
    conversionRate: 0
  };

  const handleAddSuccess = async () => {
    // Recarregar a lista de negócios após adicionar um novo
    try {
      if (isUsingSupabase()) {
        const businessesData = await fetchBusinesses();
        setBusinesses(businessesData);
      } else {
        await loadBusinessesFromSheet();
        setBusinesses(storeBusinesses);
      }
    } catch (error) {
      console.error('❌ Erro ao recarregar negócios:', error);
    }
  };

  const handleOpenTimeline = (businessId: string) => {
    setTimelineBusinessId(businessId);
    setIsTimelineOpen(true);
  };

  const handleOpenAddNote = (businessId: string) => {
    setTimelineBusinessId(businessId);
    setIsAddNoteOpen(true);
  };

  const handleNoteAdded = () => {
    // Recarregar dados se necessário
    console.log('Nota adicionada com sucesso');
  };

  const handleOpenDetails = (business: Business) => {
    setSelectedBusiness(business);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedBusiness(null);
    setIsDetailModalOpen(false);
  };

  const handleBusinessUpdated = async (updatedBusiness: any) => {
    console.log('🔄 Negócio atualizado, recarregando lista...', updatedBusiness);

    // Recarregar a lista de negócios para refletir as mudanças
    try {
      if (isUsingSupabase()) {
        const businessesData = await fetchBusinesses();
        setBusinesses(businessesData);
      } else {
        await loadBusinessesFromSheet();
        setBusinesses(storeBusinesses);
      }
    } catch (error) {
      console.error('❌ Erro ao recarregar negócios após atualização:', error);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Reunião Briefing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Agendamentos':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Entrega Final':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Reunião Briefing':
        return '📋';
      case 'Agendamentos':
        return '📅';
      case 'Entrega Final':
        return '✅';
      default:
        return '📄';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2">Empresas</h1>
          <p className="text-on-surface-variant">Gerencie suas empresas clientes e relacionamentos</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outlined" icon="📊">
            Relatórios
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            Nova Empresa
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant font-medium">Total de Empresas</p>
                <p className="text-3xl font-bold text-on-surface mt-1">{stats.total}</p>
                <p className="text-xs text-secondary mt-1">+12% este mês</p>
              </div>
              <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <path d="M3 21h18"/>
                  <path d="M5 21V7l8-4v18"/>
                  <path d="M19 21V11l-6-4"/>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant font-medium">Em Agendamentos</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  {stats.byStage['Agendamentos'] || 0}
                </p>
                <p className="text-xs text-primary mt-1">Requer atenção</p>
              </div>
              <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant font-medium">Finalizados</p>
                <p className="text-3xl font-bold text-secondary mt-1">
                  {stats.byStage['Entrega Final'] || 0}
                </p>
                <p className="text-xs text-secondary mt-1">Sucesso!</p>
              </div>
              <div className="w-12 h-12 bg-secondary-container rounded-2xl flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant font-medium">Valor Total</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {formatCurrency(stats.totalEstimatedValue)}
                </p>
                <p className="text-xs text-green-600 mt-1">Pipeline</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant font-medium">Taxa Conversão</p>
                <p className="text-3xl font-bold text-primary mt-1">{stats.conversionRate}%</p>
                <p className="text-xs text-primary mt-1">
                  {stats.conversionRate >= 80 ? 'Excelente!' : stats.conversionRate >= 60 ? 'Bom!' : 'Melhorar'}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-on-surface">Todas as Empresas</h2>
          <div className="flex space-x-2">
            <Button variant="text" size="sm">
              Filtrar
            </Button>
            <Button variant="text" size="sm">
              Ordenar
            </Button>
          </div>
        </div>

        {/* Lista de Negócios */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Carregando negócios...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    {/* Informações principais */}
                    <div className="flex items-center space-x-6 flex-1">
                      {/* Nome e Categoria */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {business.name || business.nome || business.businessName || 'Sem Nome'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {business.categoria || business.category || 'Sem Categoria'}
                        </p>
                      </div>

                      {/* Plano */}
                      <div className="flex items-center">
                        <PlanBadge
                          plan={business.planoAtual || business.currentPlan || business.plano || ''}
                          size="sm"
                        />
                      </div>

                      {/* Prioridade */}
                      <div className="flex items-center">
                        <PriorityBadge
                          priority={business.priority || 'Média'}
                          size="sm"
                        />
                      </div>

                      {/* Status */}
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(business.prospeccao || business.status || 'Reunião Briefing')}`}>
                          <span className="mr-2">{getStatusIcon(business.prospeccao || business.status || 'Reunião Briefing')}</span>
                          {business.prospeccao || business.status || 'Reunião Briefing'}
                        </span>
                      </div>

                    {/* Informações adicionais */}
                    <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                      {/* Cidade */}
                      {(business.cidade || business.address?.city) && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{business.cidade || business.address?.city}</span>
                        </div>
                      )}

                      {/* Responsável */}
                      {(business.responsavel || business.contact_info?.responsible_name) && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{business.responsavel || business.contact_info?.responsible_name}</span>
                        </div>
                      )}

                      {/* Valor em R$ */}
                      {(business.estimatedValue > 0 || business.value > 0) && (
                        <div className="flex items-center font-semibold text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span>{formatCurrency(business.estimatedValue || business.value || 0)}</span>
                        </div>
                      )}

                      {/* Etapa do Negócio */}
                      {business.businessStage && (
                        <div className="flex items-center text-blue-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm">{business.businessStage}</span>
                        </div>
                      )}

                      {/* Criadores no Contrato */}
                      {business.contractCreatorsCount > 0 && (
                        <div className="flex items-center text-purple-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm">{business.contractCreatorsCount} criadores</span>
                        </div>
                      )}

                      {/* Proprietário */}
                      {business.ownerName && (
                        <div className="flex items-center text-indigo-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm">{business.ownerName}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão de ação */}
                  <div className="flex items-center space-x-3">
                    {/* WhatsApp (se disponível) */}
                    {(business.whatsappResponsavel || business.whatsapp || business.contact_info?.whatsapp) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const whatsappNumber = business.whatsappResponsavel || business.whatsapp || business.contact_info?.whatsapp;
                          const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
                          if (cleanNumber.length >= 10) {
                            window.open(`https://wa.me/55${cleanNumber}`, '_blank');
                          }
                        }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Conversar no WhatsApp"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                      </button>
                    )}

                    {/* Botões CRM */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTimeline(business.id);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver Timeline"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddNote(business.id);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Adicionar Nota"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Botão Ver Detalhes */}
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={() => handleOpenDetails(business)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>

      {!isLoading && businesses.length === 0 && (
        <Card className="text-center py-16">
          <CardContent>
            <div className="text-6xl mb-6">🏢</div>
            <h3 className="text-2xl font-semibold text-on-surface mb-3">
              Nenhum negócio encontrado
            </h3>
            <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
              Configure o Google Sheets para ver os dados dos negócios ou adicione seu primeiro negócio.
            </p>
            <Button
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              Adicionar Primeira Empresa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal para Adicionar Negócio */}
      <AddBusinessModalNew
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Modal de Detalhes do Negócio */}
      <BusinessModalNew
        business={selectedBusiness}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetails}
        onBusinessUpdated={handleBusinessUpdated}
      />

      {/* Timeline Modal */}
      <BusinessTimeline
        businessId={timelineBusinessId}
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
      />

      {/* Add Note Modal */}
      <AddNoteModal
        businessId={timelineBusinessId}
        userId="current-user-id" // TODO: Pegar do contexto de autenticação
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        onNoteAdded={handleNoteAdded}
      />
    </div>
  );
}
