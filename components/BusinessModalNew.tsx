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

  // Opções de status do Kanban (apenas para visualização)
  const statusOptions = [
    { value: 'Reunião Briefing', label: 'Reunião Briefing', icon: '📋', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'Agendamentos', label: 'Agendamentos', icon: '📅', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    { value: 'Entrega Final', label: 'Entrega Final', icon: '✅', color: 'bg-gray-100 text-gray-800 border-gray-200' }
  ];

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

              {/* Status da Jornada */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status da Jornada
                </label>
                <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${getStatusOption(currentStatus).color} border`}>
                  <span className="mr-2">{getStatusOption(currentStatus).icon}</span>
                  {getStatusOption(currentStatus).label}
                </span>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Coluna Esquerda: Informações do Negócio */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Negócio</h3>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-600">Plano Atual</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">{business.plano || 'Não definido'}</p>
                  </div>

                  {(business as any).comercial && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-600">Informações Comerciais</label>
                      <p className="text-base text-gray-900 mt-1">{(business as any).comercial}</p>
                    </div>
                  )}

                  {(business as any).cidade && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-600">Cidade</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{(business as any).cidade}</p>
                    </div>
                  )}

                  {(business as any).prospeccao && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-600">Origem da Prospecção</label>
                      <p className="text-base text-gray-900 mt-1">{(business as any).prospeccao}</p>
                    </div>
                  )}
                </div>

                {/* Coluna Direita: Responsáveis e Contatos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsáveis e Contatos</h3>

                  {(business as any).nomeResponsavel && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-600">Responsável do Cliente</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{(business as any).nomeResponsavel}</p>
                    </div>
                  )}

                  {business.responsavel && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-600">Responsável Interno</label>
                      <p className="text-base text-gray-900 mt-1">{business.responsavel}</p>
                    </div>
                  )}

                  {/* Botão WhatsApp */}
                  {((business as any).whatsappResponsavel || business.whatsapp) && (
                    <button
                      onClick={handleWhatsAppClick}
                      className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 transition-colors duration-200 flex items-center justify-center space-x-3"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      <span className="font-medium">Conversar no WhatsApp</span>
                    </button>
                  )}

                  {(business as any).instagram && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-600">Instagram</label>
                      <button
                        onClick={openInstagram}
                        className="text-base text-blue-600 hover:text-blue-800 mt-1 font-medium"
                      >
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contratos e Observações</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {(business as any).contratoAssinadoEnviado && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-600">Status do Contrato</label>
                        <p className="text-base text-gray-900 mt-1">{(business as any).contratoAssinadoEnviado}</p>
                      </div>
                    )}

                    {(business as any).dataAssinaturaContrato && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-600">Data de Assinatura</label>
                        <p className="text-base text-gray-900 mt-1">{(business as any).dataAssinaturaContrato}</p>
                      </div>
                    )}

                    {(business as any).contratoValidoAte && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-600">Válido Até</label>
                        <p className="text-base text-gray-900 mt-1">{(business as any).contratoValidoAte}</p>
                      </div>
                    )}
                  </div>

                  {(business.observacoes || (business as any).notes) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-600 mb-2 block">Observações</label>
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
