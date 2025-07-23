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
import { PageGuard, ActionGuard } from '@/components/PermissionGuard';



export default function BusinessesPage() {
  const { businesses: storeBusinesses, getStats, loadBusinessesFromSheet } = useBusinessStore();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [timelineBusinessId, setTimelineBusinessId] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);

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

          // Ordenar negócios: contratos assinados primeiro
          const sortedBusinesses = businessesData.sort((a, b) => {
            const aHasContract = a.businessStage === 'Contrato assinado' || a.business_stage === 'Contrato assinado';
            const bHasContract = b.businessStage === 'Contrato assinado' || b.business_stage === 'Contrato assinado';

            if (aHasContract && !bHasContract) return -1;
            if (!aHasContract && bHasContract) return 1;

            // Se ambos têm ou não têm contrato, ordenar por nome
            const aName = a.name || a.nome || a.businessName || '';
            const bName = b.name || b.nome || b.businessName || '';
            return aName.localeCompare(bName);
          });

          setBusinesses(sortedBusinesses);

          // Extrair cidades únicas para o filtro
          const cities = [...new Set(
            sortedBusinesses
              .map(b => b.cidade || b.address?.city)
              .filter(Boolean)
              .sort()
          )];
          setAvailableCities(cities);

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

  // Filtrar negócios por cidade
  useEffect(() => {
    if (selectedCity) {
      const filtered = businesses.filter(business => {
        const businessCity = business.cidade || business.address?.city || '';
        return businessCity === selectedCity;
      });
      setFilteredBusinesses(filtered);
    } else {
      setFilteredBusinesses(businesses);
    }
  }, [businesses, selectedCity]);

  // Calcular estatísticas dos negócios carregados
  const stats = isClient ? {
    total: filteredBusinesses.length,
    byStage: filteredBusinesses.reduce((acc: any, business: any) => {
      const stage = business.prospeccao || business.status || 'Reunião Briefing';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {}),
    byBusinessStage: filteredBusinesses.reduce((acc: any, business: any) => {
      const stage = business.businessStage || 'Leads próprios frios';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {}),
    totalEstimatedValue: filteredBusinesses.reduce((sum: number, business: any) => {
      return sum + (business.estimatedValue || business.value || 0);
    }, 0),
    // Empresas com contrato assinado (baseado na etapa do negócio)
    contractSigned: filteredBusinesses.filter((b: any) => b.businessStage === 'Contrato assinado').length,
    // Taxa de conversão mensal (empresas adicionadas este mês vs contratos assinados este mês)
    monthlyConversionRate: (() => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const addedThisMonth = businesses.filter((b: any) => {
        const createdDate = new Date(b.created_at || b.createdAt || Date.now());
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
      }).length;

      const signedThisMonth = businesses.filter((b: any) => {
        const createdDate = new Date(b.created_at || b.createdAt || Date.now());
        return (
          createdDate.getMonth() === currentMonth &&
          createdDate.getFullYear() === currentYear &&
          b.businessStage === 'Contrato assinado'
        );
      }).length;

      return addedThisMonth > 0 ? Math.round((signedThisMonth / addedThisMonth) * 100) : 0;
    })()
  } : {
    total: 0,
    byStage: {},
    byBusinessStage: {},
    totalEstimatedValue: 0,
    contractSigned: 0,
    monthlyConversionRate: 0
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

    // Atualizar o selectedBusiness com os novos dados
    if (selectedBusiness && updatedBusiness && selectedBusiness.id === updatedBusiness.id) {
      setSelectedBusiness(updatedBusiness);
    }

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
    <PageGuard resource="businesses">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-on-surface mb-2">Empresas</h1>
            <p className="text-on-surface-variant">Gerencie suas empresas clientes e relacionamentos</p>
          </div>
          <div className="flex space-x-3">
            <ActionGuard resource="businesses" action="write">
              <Button
                variant="primary"
                onClick={() => setIsAddModalOpen(true)}
              >
                Nova Empresa
              </Button>
            </ActionGuard>
          </div>
        </div>

      {/* Filtros */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
          </svg>
          <label className="text-sm font-medium text-gray-700">Filtrar por cidade:</label>
        </div>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
        >
          <option value="">Todas as cidades</option>
          {availableCities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        {selectedCity && (
          <button
            onClick={() => setSelectedCity('')}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Stats Cards - Versão Simplificada */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:scale-105 transition-transform duration-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant font-medium">Total de Empresas</p>
                <p className="text-3xl font-bold text-on-surface mt-1">{stats.total}</p>
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

        <Card className="hover:scale-105 transition-transform duration-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant font-medium">Contratos Assinados</p>
                <p className="text-3xl font-bold text-primary mt-1">
                  {stats.contractSigned}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-600">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.35 0 4.48.9 6.08 2.38"/>
                  <path d="M17 3v4h-4"/>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:scale-105 transition-transform duration-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant font-medium">Taxa Conversão Mensal</p>
                <p className="text-3xl font-bold text-primary mt-1">{stats.monthlyConversionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-primary-container rounded-2xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <path d="M3 3v18h18"/>
                  <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-on-surface">
            {selectedCity ? `Empresas em ${selectedCity}` : 'Todas as Empresas'}
            <span className="text-sm font-normal text-gray-500 ml-2">({filteredBusinesses.length})</span>
          </h2>
          <div className="flex space-x-2">
            <Button variant="text" size="sm">
              Filtrar
            </Button>
            <Button variant="text" size="sm">
              Ordenar
            </Button>
          </div>
        </div>

        {/* Lista de Negócios - Versão Simplificada */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-gray-600">Carregando empresas...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBusinesses.map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-all duration-200 rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    {/* Informações principais */}
                    <div className="flex items-center space-x-6 flex-1">
                      {/* Nome da Empresa */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {business.name || business.nome || business.businessName || 'Sem Nome'}
                        </h3>
                      </div>

                      {/* Etapa do Negócio */}
                      <div className="flex items-center min-w-0">
                        {(() => {
                          const stage = business.businessStage || business.business_stage || 'Leads próprios frios';
                          const isContractSigned = stage === 'Contrato assinado';
                          return (
                            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                              isContractSigned
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {isContractSigned && (
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                              <span className="truncate max-w-[120px]">{stage}</span>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Cidade */}
                      <div className="flex items-center text-gray-600 min-w-0">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium truncate">
                          {business.cidade || business.address?.city || 'Não informado'}
                        </span>
                      </div>

                      {/* Proprietário do Negócio */}
                      <div className="flex items-center text-gray-600 min-w-0 mr-6">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm font-medium truncate">
                          {business.ownerName || 'Não informado'}
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center space-x-3">
                      {/* Botão WhatsApp */}
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
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 min-w-[100px]"
                          title="Conversar no WhatsApp"
                        >
                          WhatsApp
                        </button>
                      )}

                      {/* Botão Ver Detalhes */}
                      <button
                        onClick={() => handleOpenDetails(business)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 min-w-[100px]"
                      >
                        Ver Detalhes
                      </button>
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
        userId="00000000-0000-0000-0000-000000000001" // User padrão do sistema
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        onNoteAdded={handleNoteAdded}
      />
      </div>
    </PageGuard>
  );
}
