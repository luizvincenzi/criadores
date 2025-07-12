'use client';

import React, { useState } from 'react';
import { Business, useBusinessStore } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';
import Button from './ui/Button';

interface BusinessModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessModal({ business, isOpen, onClose }: BusinessModalProps) {
  const { moveBusinessStage } = useBusinessStore();
  const { user } = useAuthStore();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(business?.journeyStage || '');

  // Atualizar o status local quando o business mudar
  React.useEffect(() => {
    if (business) {
      setCurrentStatus(business.journeyStage);
    }
  }, [business]);

  if (!isOpen || !business) return null;

  // Opções de status do Kanban
  const statusOptions = [
    { value: 'Reunião Briefing', label: 'Reunião Briefing', icon: '📋', color: 'bg-blue-100 text-blue-800' },
    { value: 'Agendamentos', label: 'Agendamentos', icon: '📅', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Entrega Final', label: 'Entrega Final', icon: '✅', color: 'bg-green-100 text-green-800' }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatWhatsAppLink = (whatsapp: string) => {
    if (!whatsapp) return '';
    
    // Remove caracteres não numéricos
    const cleanNumber = whatsapp.replace(/\D/g, '');
    
    // Adiciona código do país se não tiver
    const fullNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    
    return `https://wa.me/${fullNumber}`;
  };

  const handleWhatsAppClick = () => {
    const whatsappNumber = business.whatsappResponsavel || business.whatsapp;
    const whatsappLink = formatWhatsAppLink(whatsappNumber);
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || isUpdatingStatus) return;

    setIsUpdatingStatus(true);

    try {
      console.log(`🔄 Atualizando status de "${business.businessName}": ${currentStatus} → ${newStatus}`);

      // Atualizar via API (audit log)
      const response = await fetch('/api/update-business-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: business.businessName,
          oldStatus: currentStatus,
          newStatus: newStatus,
          user: user?.email || 'Sistema'
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Status atualizado no audit log');

        // Atualizar no store local (Kanban)
        moveBusinessStage(business.id, newStatus as Business['journeyStage']);

        // Atualizar estado local
        setCurrentStatus(newStatus);

        console.log('✅ Status atualizado no Kanban');
      } else {
        console.error('❌ Erro ao atualizar status:', result.error);
        alert(`Erro ao atualizar status: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Tente novamente.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusOption = (status: string) => {
    return statusOptions.find(option => option.value === status) || statusOptions[0];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Detalhes do Negócio
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Nome e Status */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {business.businessName}
              </h3>
              <div className="flex items-center space-x-3 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {business.categoria || 'Sem categoria'}
                </span>
              </div>

              {/* Status Editável */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status da Jornada
                </label>
                <div className="flex items-center space-x-3">
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>

                  {/* Badge visual do status atual */}
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${getStatusOption(currentStatus).color} border`}>
                    <span className="mr-2">{getStatusOption(currentStatus).icon}</span>
                    {getStatusOption(currentStatus).label}
                  </span>

                  {isUpdatingStatus && (
                    <div className="flex items-center text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm">Atualizando...</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  💡 Alterar o status aqui atualiza automaticamente o Kanban e o audit log
                </p>
              </div>
            </div>

            {/* Grid de Informações */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

              {/* Coluna 1: Informações Básicas */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    Informações do Negócio
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoria</label>
                      <p className="text-base font-medium text-gray-900 mt-1">{business.categoria || 'Não definido'}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Plano Atual</label>
                      <p className="text-base font-medium text-gray-900 mt-1">{business.planoAtual || business.plano || 'Não definido'}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Comercial</label>
                      <p className="text-base font-medium text-gray-900 mt-1">{business.comercial || 'Não informado'}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cidade</label>
                      <p className="text-base font-medium text-gray-900 mt-1">{business.cidade || 'Não informado'}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prospecção</label>
                      <p className="text-base font-medium text-gray-900 mt-1">{business.prospeccao || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna 2: Contatos e Responsáveis */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    Contatos e Responsáveis
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nome Responsável</label>
                      <p className="text-base font-medium text-gray-900 mt-1">{business.nomeResponsavel || 'Não informado'}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Responsável Interno</label>
                      <p className="text-base font-medium text-gray-900 mt-1">{business.responsavel || 'Não informado'}</p>
                    </div>

                    {(business.whatsappResponsavel || business.whatsapp) && (
                      <button
                        onClick={handleWhatsAppClick}
                        className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                              </svg>
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">WhatsApp Responsável</p>
                              <p className="text-base font-medium text-gray-900">{business.whatsappResponsavel || business.whatsapp}</p>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </button>
                    )}

                    {business.instagram && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Instagram</label>
                        <p className="text-base font-medium text-gray-900 mt-1">{business.instagram}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Coluna 3: Contratos e Gestão */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    Contratos e Gestão
                  </h3>

                  <div className="space-y-4">
                    {business.grupoWhatsappCriado && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Grupo WhatsApp Criado</label>
                        <p className="text-base font-medium text-gray-900 mt-1">{business.grupoWhatsappCriado}</p>
                      </div>
                    )}

                    {business.contratoAssinadoEnviado && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contrato Assinado e Enviado</label>
                        <p className="text-base font-medium text-gray-900 mt-1">{business.contratoAssinadoEnviado}</p>
                      </div>
                    )}

                    {business.dataAssinaturaContrato && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Data Assinatura do Contrato</label>
                        <p className="text-base font-medium text-gray-900 mt-1">{business.dataAssinaturaContrato}</p>
                      </div>
                    )}

                    {business.contratoValidoAte && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contrato Válido Até</label>
                        <p className="text-base font-medium text-gray-900 mt-1">{business.contratoValidoAte}</p>
                      </div>
                    )}

                    {business.relatedFiles && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Arquivos Relacionados</label>
                        <p className="text-base font-medium text-gray-900 mt-1">{business.relatedFiles}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Observações e Notas */}
            {(business.notes || business.observacoes) && (
              <div className="mt-8 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  Observações e Notas
                </h3>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <p className="text-base font-medium text-gray-900 leading-relaxed">{business.notes || business.observacoes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <Button
              variant="outlined"
              onClick={onClose}
            >
              Fechar
            </Button>
            {business.whatsapp && (
              <Button
                variant="primary"
                onClick={handleWhatsAppClick}
                icon="💬"
              >
                Contatar via WhatsApp
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
