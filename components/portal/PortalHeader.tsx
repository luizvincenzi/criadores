'use client';

import React, { useState } from 'react';
import { usePortalAuth, PortalUser } from '@/hooks/usePortalAuth';
import Button from '@/components/ui/Button';

interface PortalHeaderProps {
  user: PortalUser;
}

export default function PortalHeader({ user }: PortalHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout } = usePortalAuth();

  const getUserTypeLabel = (type: string) => {
    return type === 'empresa' ? 'Empresa' : 'Criador';
  };

  const getUserTypeIcon = (type: string) => {
    return type === 'empresa' ? '🏢' : '🎨';
  };

  return (
    <header className="bg-surface border-b border-outline-variant">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e Título */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-on-primary font-bold text-sm">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-on-surface">crIAdores</h1>
              <p className="text-xs text-on-surface-variant">Portal do Cliente</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-surface-container transition-colors"
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={user.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-primary text-sm font-medium">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* User Info */}
              <div className="text-left">
                <div className="text-sm font-medium text-on-surface">
                  {user.full_name}
                </div>
                <div className="text-xs text-on-surface-variant flex items-center space-x-1">
                  <span>{getUserTypeIcon(user.user_type)}</span>
                  <span>{getUserTypeLabel(user.user_type)}</span>
                </div>
              </div>

              {/* Dropdown Arrow */}
              <svg 
                className={`w-4 h-4 text-on-surface-variant transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface rounded-xl shadow-lg border border-outline-variant z-50">
                <div className="p-4 border-b border-outline-variant">
                  <div className="text-sm font-medium text-on-surface">
                    {user.full_name}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {user.email}
                  </div>
                  <div className="text-xs text-primary mt-1 flex items-center space-x-1">
                    <span>{getUserTypeIcon(user.user_type)}</span>
                    <span>{getUserTypeLabel(user.user_type)}</span>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Aqui poderia abrir modal de perfil
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Meu Perfil</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Aqui poderia abrir modal de configurações
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Configurações</span>
                    </div>
                  </button>

                  <hr className="my-2 border-outline-variant" />

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-tertiary hover:bg-tertiary-container rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sair</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay para fechar menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
