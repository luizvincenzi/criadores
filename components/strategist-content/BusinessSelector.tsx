'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface Business {
  id: string;
  name: string;
  logo_url?: string;
  is_active: boolean;
  has_strategist: boolean;
  strategist_id: string;
  content_stats?: {
    total: number;
    executed: number;
    pending: number;
  };
}

interface BusinessSelectorProps {
  businesses: Business[];
  selectedBusinessId: string | null;
  onSelectBusiness: (businessId: string) => void;
  loading?: boolean;
}

export default function BusinessSelector({
  businesses,
  selectedBusinessId,
  onSelectBusiness,
  loading = false
}: BusinessSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  // Filtrar businesses pela busca
  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Gerar avatar com inicial do nome
  const getBusinessAvatar = (business: Business) => {
    if (business.logo_url) {
      return (
        <img
          src={business.logo_url}
          alt={business.name}
          className="w-full h-full object-cover"
        />
      );
    }

    const initial = business.name.charAt(0).toUpperCase();
    const colors = [
      'from-black-500 to-blue-500',
      'from-orange-500 to-amber-500',
      'from-green-500 to-emerald-500',
      'from-cyan-500 to-blue-500',
      'from-indigo-500 to-green-500',
    ];
    const colorIndex = business.name.charCodeAt(0) % colors.length;

    return (
      <div className={`w-full h-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm`}>
        {initial}
      </div>
    );
  };

  const handleSelectBusiness = (businessId: string) => {
    onSelectBusiness(businessId);
    setIsOpen(false);
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="mb-4">
        <div className="w-full px-4 py-3 bg-gray-100 rounded-lg animate-pulse">
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          Nenhum business encontrado. Entre em contato com o administrador.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      {/* Botão Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all flex items-center justify-between group shadow-sm hover:shadow"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedBusiness ? (
            <>
              
              <div className="text-left flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {selectedBusiness.name}
                </div>
                {selectedBusiness.content_stats && (
                  <div className="text-xs text-gray-500 truncate">
                    {selectedBusiness.content_stats.total} conteúdos
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">Selecione um business...</div>
          )}
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Campo de Busca */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar business..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de Businesses */}
          <div className="max-h-80 overflow-y-auto p-2">
            {filteredBusinesses.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Nenhum business encontrado
              </div>
            ) : (
              filteredBusinesses.map((business) => {
                const isSelected = selectedBusinessId === business.id;

                return (
                  <button
                    key={business.id}
                    onClick={() => handleSelectBusiness(business.id)}
                    className={`w-full px-3 py-3 rounded-lg transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-green-50 '
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    {/* Avatar */}
                   

                    {/* Info */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {business.name}
                        </span>
                        {isSelected && (
                          <svg
                            className="w-4 h-4 text-green-600 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      {business.content_stats && (
                        <div className="text-xs text-gray-500 mt-0.5 truncate">
                           {business.content_stats.total} conteúdos • {business.content_stats.executed} executados
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        business.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {business.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

