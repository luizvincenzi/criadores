'use client';

import React from 'react';
import { Business } from '@/store/businessStore';
import Button from './ui/Button';

interface BusinessModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessModal({ business, isOpen, onClose }: BusinessModalProps) {
  if (!isOpen || !business) return null;

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
    const whatsappLink = formatWhatsAppLink(business.whatsapp);
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
    }
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
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {business.categoria || 'Sem categoria'}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {business.journeyStage}
                </span>
              </div>
            </div>

            {/* Grid de Informações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna Esquerda */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plano
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {business.plano || 'Não definido'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor
                  </label>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(business.value)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsável
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {business.responsavel || 'Não definido'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {business.email || 'Não informado'}
                  </p>
                </div>
              </div>

              {/* Coluna Direita */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg flex-1">
                      {business.whatsapp || 'Não informado'}
                    </p>
                    {business.whatsapp && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleWhatsAppClick}
                        icon="💬"
                      >
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {business.dataInicio || 'Não definida'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {business.dataFim || 'Não definida'}
                  </p>
                </div>
              </div>
            </div>

            {/* Descrição */}
            {business.descricao && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {business.descricao}
                  </p>
                </div>
              </div>
            )}

            {/* Observações */}
            {business.observacoes && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {business.observacoes}
                  </p>
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
