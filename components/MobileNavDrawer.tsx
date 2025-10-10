'use client';

import React, { useEffect } from 'react';

export interface MobileNavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}

interface MobileNavDrawerProps {
  items: MobileNavItem[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function MobileNavDrawer({ items, isOpen, onClose, title = 'Navegação' }: MobileNavDrawerProps) {
  // Fechar drawer ao pressionar ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevenir scroll do body quando drawer está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fechar menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-600"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {items.map((item) => {
            const ItemWrapper = item.href ? 'a' : 'button';

            return (
              <ItemWrapper
                key={item.id}
                href={item.href}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  }
                  onClose(); // Fechar drawer após clicar
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  item.active
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className={`flex-shrink-0 ${item.active ? 'text-blue-700' : 'text-gray-600'}`}>
                  {item.icon}
                </div>
                <span className="text-base">{item.label}</span>
                {item.active && (
                  <div className="ml-auto">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-blue-700"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </ItemWrapper>
            );
          })}
        </nav>

        {/* Footer (opcional) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Navegue entre as diferentes views
          </p>
        </div>
      </div>
    </>
  );
}

