'use client';

import React, { useState } from 'react';

interface CreatorData {
  id: string;
  name: string;
  social_media?: {
    instagram?: {
      username: string;
      followers: number;
      engagement_rate: number;
      verified: boolean;
    };
    tiktok?: {
      username: string;
      followers: number;
    };
  };
  contact_info?: {
    whatsapp: string;
    email: string;
  };
  profile_info?: {
    category: string;
    location?: {
      city: string;
      state: string;
    };
    rates?: {
      post: number;
      story: number;
      reel: number;
    };
  };
  performance_metrics?: {
    total_campaigns: number;
    avg_engagement: number;
    completion_rate: number;
    rating: number;
  };
  status: string;
}

interface CreatorDeliverables {
  briefing_complete: string;
  visit_datetime: string;
  guest_quantity: number;
  visit_confirmed: string;
  post_datetime: string;
  video_approved: string;
  video_posted: string;
}

interface CreatorAdvancedCardProps {
  creator: CreatorData;
  deliverables?: CreatorDeliverables;
  campaignData?: any;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function CreatorAdvancedCard({ 
  creator, 
  deliverables, 
  campaignData,
  isExpanded = false,
  onToggleExpand 
}: CreatorAdvancedCardProps) {
  const [showDetails, setShowDetails] = useState(isExpanded);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sim':
      case 'confirmada':
      case 'aprovado':
      case 'postado':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'nao':
      case 'não':
      case 'rejeitado':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pendente':
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'sim':
      case 'confirmada':
      case 'aprovado':
      case 'postado':
        return '✅';
      case 'nao':
      case 'não':
      case 'rejeitado':
        return '❌';
      case 'pendente':
      default:
        return '⏳';
    }
  };

  const openInstagram = () => {
    const username = creator.social_media?.instagram?.username;
    if (username) {
      window.open(`https://instagram.com/${username.replace('@', '')}`, '_blank');
    }
  };

  const openTikTok = () => {
    const username = creator.social_media?.tiktok?.username;
    if (username) {
      window.open(`https://tiktok.com/@${username.replace('@', '')}`, '_blank');
    }
  };

  const openWhatsApp = () => {
    const whatsapp = creator.contact_info?.whatsapp;
    if (whatsapp) {
      const cleanNumber = whatsapp.replace(/\D/g, '');
      const message = encodeURIComponent(`Olá ${creator.name}! Sobre a campanha...`);
      window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header do Card */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-semibold text-xl shadow-sm"
              style={{ backgroundColor: '#00629B' }}
            >
              {creator.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Info Principal */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {creator.name}
              </h4>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                {creator.profile_info?.category && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {creator.profile_info.category}
                  </span>
                )}
                {creator.profile_info?.location?.city && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {creator.profile_info.location.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botão Expandir */}
          <button
            onClick={() => {
              setShowDetails(!showDetails);
              onToggleExpand?.();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Métricas Rápidas */}
        <div className="flex items-center space-x-6 mt-4">
          {creator.social_media?.instagram?.followers && (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {formatNumber(creator.social_media.instagram.followers)}
              </span>
            </div>
          )}

          {creator.social_media?.tiktok?.followers && (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {formatNumber(creator.social_media.tiktok.followers)}
              </span>
            </div>
          )}

          {creator.performance_metrics?.rating && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {creator.performance_metrics.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Detalhes Expandidos */}
      {showDetails && (
        <div className="border-t border-gray-100 p-6 pt-4 space-y-4">
          {/* Status dos Entregáveis */}
          {deliverables && (
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Status dos Entregáveis</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Briefing</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deliverables.briefing_complete)}`}>
                    {getStatusIcon(deliverables.briefing_complete)} {deliverables.briefing_complete}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Visita</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deliverables.visit_confirmed)}`}>
                    {getStatusIcon(deliverables.visit_confirmed)} {deliverables.visit_confirmed}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Aprovação</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deliverables.video_approved)}`}>
                    {getStatusIcon(deliverables.video_approved)} {deliverables.video_approved}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Postagem</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(deliverables.video_posted)}`}>
                    {getStatusIcon(deliverables.video_posted)} {deliverables.video_posted}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center space-x-3 pt-2">
            {creator.social_media?.instagram?.username && (
              <button
                onClick={openInstagram}
                className="flex items-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </button>
            )}

            {creator.social_media?.tiktok?.username && (
              <button
                onClick={openTikTok}
                className="flex items-center px-3 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
                TikTok
              </button>
            )}

            {creator.contact_info?.whatsapp && (
              <button
                onClick={openWhatsApp}
                className="flex items-center px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
