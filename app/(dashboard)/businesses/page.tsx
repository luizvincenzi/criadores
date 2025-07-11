'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessStore } from '@/store/businessStore';
import BusinessCard from '@/components/BusinessCard';
import AddBusinessModal from '@/components/AddBusinessModal';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';



export default function BusinessesPage() {
  const { businesses, getStats, loadBusinessesFromSheet } = useBusinessStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

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
            icon="➕"
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
                <span className="text-2xl">🏢</span>
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

      {/* Business Cards Grid */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              businessName={business.businessName}
              journeyStage={business.journeyStage}
              nextAction={business.nextAction}
              creatorsCount={business.creators?.length || 0}
              value={business.value || 0}
              lastUpdate={business.lastUpdate || 'Hoje'}
              onClick={() => console.log('Clicked business:', business.businessName)}
            />
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
              icon="➕"
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
    </div>
  );
}
