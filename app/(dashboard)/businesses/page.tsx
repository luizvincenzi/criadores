'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessStore, Business } from '@/store/businessStore';
import BusinessCard from '@/components/BusinessCard';
import AddBusinessModal from '@/components/AddBusinessModal';
import BusinessModalNew from '@/components/BusinessModalNew';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';



export default function BusinessesPage() {
  const { businesses, getStats, loadBusinessesFromSheet } = useBusinessStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Evitar erro de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  const stats = isClient ? getStats() : {
    total: 0,
    byStage: {},
    totalValue: 0,
    conversionRate: 0
  };

  const handleAddSuccess = async () => {
    // Recarregar a lista de negócios após adicionar um novo
    await loadBusinessesFromSheet();
  };

  const handleOpenDetails = (business: Business) => {
    setSelectedBusiness(business);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedBusiness(null);
    setIsDetailModalOpen(false);
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
          <h1 className="text-3xl font-bold text-on-surface mb-2">Negócios</h1>
          <p className="text-on-surface-variant">Gerencie seus clientes e oportunidades de negócio</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outlined" icon="📊">
            Relatórios
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            Novo Negócio
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:scale-105 transition-transform duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant font-medium">Total de Negócios</p>
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
          <h2 className="text-xl font-semibold text-on-surface">Todos os Negócios</h2>
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
                        {business.businessName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {business.categoria}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(business.journeyStage)}`}>
                        <span className="mr-2">{getStatusIcon(business.journeyStage)}</span>
                        {business.journeyStage}
                      </span>
                    </div>

                    {/* Informações adicionais */}
                    <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
                      {/* Cidade */}
                      {(business as any).cidade && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{(business as any).cidade}</span>
                        </div>
                      )}

                      {/* Responsável */}
                      {business.responsavel && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>{business.responsavel}</span>
                        </div>
                      )}

                      {/* Valor */}
                      {business.value > 0 && (
                        <div className="flex items-center font-semibold text-green-600">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span>{formatCurrency(business.value)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão de ação */}
                  <div className="flex items-center space-x-3">
                    {/* WhatsApp (se disponível) */}
                    {((business as any).whatsappResponsavel || business.whatsapp) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const whatsappNumber = (business as any).whatsappResponsavel || business.whatsapp;
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
      </div>

      {businesses.length === 0 && (
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
              Adicionar Primeiro Negócio
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal para Adicionar Negócio */}
      <AddBusinessModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Modal de Detalhes do Negócio */}
      <BusinessModalNew
        business={selectedBusiness}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
}
