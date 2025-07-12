'use client';

import React from 'react';
import { CreatorData } from '@/app/actions/sheetsActions';

interface CreatorModalProps {
  creator: CreatorData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatorModalNew({ creator, isOpen, onClose }: CreatorModalProps) {
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
      {/* Backdrop com blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100 max-h-[95vh] overflow-hidden">

          {/* Header com gradiente */}
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl font-bold border border-white/30 shadow-lg">
                  {creator.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{creator.nome}</h2>
                  <div className="flex items-center space-x-4 text-white/90">
                    {creator.instagram && (
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        <span>{creator.instagram}</span>
                      </span>
                    )}
                    {creator.perfil && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 border border-white/30`}>
                        {creator.perfil}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm border border-white/30"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content com scroll */}
          <div className="p-8 max-h-[calc(95vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

              {/* Coluna 1: Informações Básicas */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    Informações Básicas
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium border shadow-sm ${getStatusColor(creator.status)}`}>
                          <div className="w-2 h-2 rounded-full bg-current mr-2"></div>
                          {creator.status}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cidade</label>
                      <p className="text-base font-medium text-gray-900 mt-1">{creator.cidade || 'Não informado'}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prospecção</label>
                      <p className="text-base font-medium text-gray-900 mt-1">{creator.prospeccao || 'Não informado'}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Responsável</label>
                      <p className="text-base font-medium text-gray-900 mt-1">{creator.responsavel || 'Não informado'}</p>
                    </div>

                    {creator.perfil && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Perfil</label>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium border shadow-sm ${getPerfilColor(creator.perfil)}`}>
                            {creator.perfil}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contato */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    Contato
                  </h3>

                  {creator.whatsapp && (
                    <button
                      onClick={openWhatsApp}
                      className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group mb-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                            </svg>
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">WhatsApp</p>
                            <p className="text-base font-medium text-gray-900">{creator.whatsapp}</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Coluna 2: Redes Sociais */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                      </svg>
                    </div>
                    Redes Sociais
                  </h3>

                  <div className="space-y-4">
                    {/* Instagram */}
                    {creator.instagram && (
                      <button
                        onClick={openInstagram}
                        className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Instagram</p>
                              <p className="text-base font-medium text-gray-900">{creator.instagram}</p>
                              {creator.seguidoresInstagram && (
                                <p className="text-sm text-gray-600">{formatFollowers(creator.seguidoresInstagram)} seguidores</p>
                              )}
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-pink-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </button>
                    )}

                    {/* TikTok */}
                    {creator.tiktok && (
                      <button
                        onClick={openTikTok}
                        className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                              </svg>
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">TikTok</p>
                              <p className="text-base font-medium text-gray-900">{creator.tiktok}</p>
                              {creator.seguidoresTiktok && (
                                <p className="text-sm text-gray-600">{formatFollowers(creator.seguidoresTiktok)} seguidores</p>
                              )}
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Gestão */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    Gestão
                  </h3>

                  <div className="space-y-4">
                    {creator.onboardingInicial && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Onboarding Inicial</label>
                        <p className="text-base font-medium text-gray-900 mt-1">{creator.onboardingInicial}</p>
                      </div>
                    )}

                    {(creator.startDate || creator.endDate) && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Período</label>
                        <div className="mt-1 space-y-1">
                          {creator.startDate && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Início:</span> {formatDate(creator.startDate)}
                            </p>
                          )}
                          {creator.endDate && (
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Fim:</span> {formatDate(creator.endDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {creator.relatedFiles && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Arquivos Relacionados</label>
                        <p className="text-base font-medium text-gray-900 mt-1">{creator.relatedFiles}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Coluna 3: Preferências e Observações */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    Preferências
                  </h3>

                  <div className="space-y-4">
                    {creator.preferencias && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Aceita</label>
                        <p className="text-base font-medium text-gray-900 mt-1">{creator.preferencias}</p>
                      </div>
                    )}

                    {creator.naoAceita && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Não Aceita</label>
                        <p className="text-base font-medium text-gray-900 mt-1">{creator.naoAceita}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Descrição e Observações */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    Descrição
                  </h3>

                  <div className="space-y-4">
                    {creator.descricaoCriador && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descrição do Criador</label>
                        <p className="text-base font-medium text-gray-900 mt-1 leading-relaxed">{creator.descricaoCriador}</p>
                      </div>
                    )}

                    {creator.notes && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Observações</label>
                        <p className="text-base font-medium text-gray-900 mt-1 leading-relaxed">{creator.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}