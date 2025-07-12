'use client';

import React, { useState } from 'react';
import { Business, useBusinessStore } from '@/store/businessStore';
import { useAuthStore } from '@/store/authStore';

interface BusinessModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessModalNew({ business, isOpen, onClose }: BusinessModalProps) {
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

  // Opções de status do Kanban com Material Design
  const statusOptions = [
    { value: 'Reunião Briefing', label: 'Reunião Briefing', icon: '📋', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'Agendamentos', label: 'Agendamentos', icon: '📅', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { value: 'Entrega Final', label: 'Entrega Final', icon: '✅', color: 'bg-green-50 text-green-700 border-green-200' }
  ];

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

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatWhatsAppLink = (whatsapp: string): string | null => {
    if (!whatsapp) return null;
    const cleanNumber = whatsapp.replace(/[^\d]/g, '');
    if (cleanNumber.length >= 10) {
      return `https://wa.me/55${cleanNumber}`;
    }
    return null;
  };

  const handleWhatsAppClick = () => {
    const whatsappNumber = (business as any).whatsappResponsavel || business.whatsapp;
    const whatsappLink = formatWhatsAppLink(whatsappNumber);
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    }
  };

  const openInstagram = () => {
    const instagram = (business as any).instagram;
    if (instagram) {
      const username = instagram.replace('@', '');
      window.open(`https://instagram.com/${username}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop com blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[95vh] overflow-hidden">
          
          {/* Header Simples */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{business.businessName}</h2>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span>{business.categoria}</span>
                  {business.value > 0 && (
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(business.value)}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content com scroll */}
          <div className="p-6 max-h-[calc(95vh-200px)] overflow-y-auto">
            <div className="max-w-4xl mx-auto">

              {/* Status da Jornada - Editável */}
              <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status da Jornada
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={isUpdatingStatus}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white text-base font-medium shadow-sm"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Badge visual do status atual */}
                  <span className={`inline-flex items-center px-4 py-3 rounded-lg text-sm font-medium ${getStatusOption(currentStatus).color} border shadow-sm`}>
                    <span className="mr-2">{getStatusOption(currentStatus).icon}</span>
                    {getStatusOption(currentStatus).label}
                  </span>

                  {isUpdatingStatus && (
                    <div className="flex items-center text-blue-600">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm font-medium">Atualizando...</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-600 mt-3 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Alterar o status aqui atualiza automaticamente o Kanban e o Google Sheets
                </p>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Coluna Esquerda: Informações do Negócio */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Informações do Negócio
                  </h3>

                  <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <label className="text-sm font-medium text-blue-600 uppercase tracking-wide">Plano Atual</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{business.plano || 'Não definido'}</p>
                  </div>

                  {(business as any).comercial && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="text-sm font-medium text-blue-600 uppercase tracking-wide">Informações Comerciais</label>
                      <p className="text-base text-gray-900 mt-1">{(business as any).comercial}</p>
                    </div>
                  )}

                  {(business as any).cidade && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="text-sm font-medium text-blue-600 uppercase tracking-wide">Cidade</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{(business as any).cidade}</p>
                    </div>
                  )}

                  {(business as any).prospeccao && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="text-sm font-medium text-blue-600 uppercase tracking-wide">Origem da Prospecção</label>
                      <p className="text-base text-gray-900 mt-1">{(business as any).prospeccao}</p>
                    </div>
                  )}
                </div>

                {/* Coluna Direita: Responsáveis e Contatos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Responsáveis e Contatos
                  </h3>

                  {(business as any).nomeResponsavel && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="text-sm font-medium text-green-600 uppercase tracking-wide">Responsável do Cliente</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{(business as any).nomeResponsavel}</p>
                    </div>
                  )}

                  {business.responsavel && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="text-sm font-medium text-green-600 uppercase tracking-wide">Responsável Interno</label>
                      <p className="text-base text-gray-900 mt-1">{business.responsavel}</p>
                    </div>
                  )}

                  {/* Botão WhatsApp - Material Design */}
                  {((business as any).whatsappResponsavel || business.whatsapp) && (
                    <button
                      onClick={handleWhatsAppClick}
                      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 transition-all duration-200 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span className="font-semibold">Conversar no WhatsApp</span>
                    </button>
                  )}

                  {(business as any).instagram && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="text-sm font-medium text-green-600 uppercase tracking-wide">Instagram</label>
                      <button
                        onClick={openInstagram}
                        className="text-base text-blue-600 hover:text-blue-800 mt-1 font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        {(business as any).instagram}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* Seção de Contratos e Observações */}
              {(((business as any).contratoAssinadoEnviado || (business as any).dataAssinaturaContrato || (business as any).contratoValidoAte || business.observacoes || (business as any).notes)) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Contratos e Observações
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {(business as any).contratoAssinadoEnviado && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <label className="text-sm font-medium text-purple-600 uppercase tracking-wide">Status do Contrato</label>
                        <p className="text-base text-gray-900 mt-1">{(business as any).contratoAssinadoEnviado}</p>
                      </div>
                    )}

                    {(business as any).dataAssinaturaContrato && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <label className="text-sm font-medium text-purple-600 uppercase tracking-wide">Data de Assinatura</label>
                        <p className="text-base text-gray-900 mt-1">{(business as any).dataAssinaturaContrato}</p>
                      </div>
                    )}

                    {(business as any).contratoValidoAte && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                        <label className="text-sm font-medium text-purple-600 uppercase tracking-wide">Válido Até</label>
                        <p className="text-base text-gray-900 mt-1">{(business as any).contratoValidoAte}</p>
                      </div>
                    )}
                  </div>

                  {(business.observacoes || (business as any).notes) && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                      <label className="text-sm font-medium text-purple-600 uppercase tracking-wide mb-2 block">Observações</label>
                      <p className="text-base text-gray-900 leading-relaxed">{business.observacoes || (business as any).notes}</p>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
