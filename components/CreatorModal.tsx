'use client';

import React from 'react';
import { CreatorData } from '@/app/actions/sheetsActions';

interface CreatorModalProps {
  creator: CreatorData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatorModal({ creator, isOpen, onClose }: CreatorModalProps) {
  if (!isOpen || !creator) return null;

  const formatFollowers = (count: string | number): string => {
    const num = typeof count === 'string' ? parseInt(count.replace(/[^\d]/g, '')) || 0 : count;
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100';
      case 'inativo':
        return 'bg-red-50 text-red-700 border-red-200 shadow-red-100';
      case 'pendente':
        return 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100';
      case 'bloqueado':
        return 'bg-gray-50 text-gray-700 border-gray-200 shadow-gray-100';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100';
    }
  };

  const getPerfilColor = (perfil: string) => {
    switch (perfil.toLowerCase()) {
      case 'nano':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'micro':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'macro':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'mega':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Não definido';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const openWhatsApp = () => {
    if (creator.whatsapp) {
      const cleanNumber = creator.whatsapp.replace(/[^\d]/g, '');
      window.open(`https://wa.me/55${cleanNumber}`, '_blank');
    }
  };

  const openInstagram = () => {
    if (creator.instagram) {
      const username = creator.instagram.replace('@', '');
      window.open(`https://instagram.com/${username}`, '_blank');
    }
  };

  const openTikTok = () => {
    if (creator.tiktok) {
      const username = creator.tiktok.replace('@', '');
      window.open(`https://tiktok.com/@${username}`, '_blank');
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
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Detalhes do Criador</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Informações Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações Pessoais</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome</label>
                      <p className="text-base font-semibold text-gray-900">{creator.nome}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(creator.status)}`}>
                          {creator.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cidade</label>
                      <p className="text-base text-gray-900">{creator.cidade || 'Não informado'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Categoria</label>
                      <p className="text-base text-gray-900">{creator.categoria || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Redes Sociais</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Instagram</label>
                      {creator.instagram ? (
                        <a 
                          href={creator.instagram.startsWith('http') ? creator.instagram : `https://instagram.com/${creator.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {creator.instagram}
                        </a>
                      ) : (
                        <p className="text-base text-gray-900">Não informado</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Seguidores</label>
                      <p className="text-xl font-bold text-blue-600">{formatFollowers(creator.seguidores)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Taxa de Engajamento</label>
                      <p className={`text-xl font-bold ${getEngagementColor(creator.engajamento)}`}>
                        {creator.engajamento.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contato */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                  {creator.whatsapp ? (
                    <a 
                      href={`https://wa.me/${creator.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-green-600 hover:text-green-800 font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      {creator.whatsapp}
                    </a>
                  ) : (
                    <p className="text-base text-gray-900">Não informado</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  {creator.email ? (
                    <a 
                      href={`mailto:${creator.email}`}
                      className="text-base text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {creator.email}
                    </a>
                  ) : (
                    <p className="text-base text-gray-900">Não informado</p>
                  )}
                </div>
              </div>
            </div>

            {/* Observações */}
            {creator.observacoes && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{creator.observacoes}</p>
                </div>
              </div>
            )}

            {/* Métricas Resumidas */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Performance</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{formatFollowers(creator.seguidores)}</div>
                  <div className="text-sm text-blue-800">Seguidores</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className={`text-2xl font-bold ${getEngagementColor(creator.engajamento)}`}>
                    {creator.engajamento.toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-800">Engajamento</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{creator.categoria || 'N/A'}</div>
                  <div className="text-sm text-purple-800">Categoria</div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className={`text-2xl font-bold ${creator.status === 'Ativo' ? 'text-green-600' : 'text-red-600'}`}>
                    {creator.status}
                  </div>
                  <div className="text-sm text-gray-800">Status</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
            <div className="flex justify-end space-x-3">
              {creator.whatsapp && (
                <a
                  href={`https://wa.me/${creator.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  Contatar via WhatsApp
                </a>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
