'use client';

import React from 'react';

interface MobileNavButtonProps {
  onClick: () => void;
  activeLabel?: string;
}

export default function MobileNavButton({ onClick, activeLabel }: MobileNavButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 z-30 md:hidden flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-200"
      aria-label="Abrir menu de navegação"
    >
      {/* Ícone de Menu */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="flex-shrink-0"
      >
        <path d="M3 12h18M3 6h18M3 18h18" />
      </svg>
      
      {/* Label da view ativa */}
      {activeLabel && (
        <span className="text-sm font-medium">{activeLabel}</span>
      )}
    </button>
  );
}

