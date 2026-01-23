'use client';

import React, { useEffect, useRef, useState } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'full' | 'auto' | string;
  // Novas props para mobile
  snapPoints?: number[];
  defaultSnap?: number;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  height = 'full',
  snapPoints,
  defaultSnap = 0
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState<number>(90);
  const [isDragging, setIsDragging] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const startY = useRef(0);
  const startHeight = useRef(0);

  // Calcular altura baseado em snapPoints ou height
  useEffect(() => {
    if (isOpen && snapPoints && snapPoints.length > 0) {
      const initialHeight = snapPoints[defaultSnap] || snapPoints[0];
      setSheetHeight(initialHeight);
    }
  }, [isOpen, snapPoints, defaultSnap]);

  // Prevenir scroll do body quando o sheet está aberto - versão melhorada para iOS
  useEffect(() => {
    if (isOpen) {
      // Salvar posição atual do scroll
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      // Método mais seguro para iOS: usar overflow hidden sem position fixed
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      // Apenas para iOS, prevenir bounce
      const preventScroll = (e: TouchEvent) => {
        const target = e.target as HTMLElement;
        // Permitir scroll dentro do sheet
        if (sheetRef.current && sheetRef.current.contains(target)) {
          return;
        }
        e.preventDefault();
      };

      document.addEventListener('touchmove', preventScroll, { passive: false });

      return () => {
        document.removeEventListener('touchmove', preventScroll);
      };
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Handle drag para fechar
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startHeight.current = sheetHeight;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const diff = startY.current - currentY;
    const diffPercent = (diff / window.innerHeight) * 100;
    const newHeight = Math.min(95, Math.max(20, startHeight.current + diffPercent));
    setSheetHeight(newHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // Se arrastou muito para baixo, fechar
    if (sheetHeight < 30) {
      onClose();
      return;
    }

    // Snap para o ponto mais próximo
    if (snapPoints && snapPoints.length > 0) {
      const closest = snapPoints.reduce((prev, curr) =>
        Math.abs(curr - sheetHeight) < Math.abs(prev - sheetHeight) ? curr : prev
      );
      setSheetHeight(closest);
    }
  };

  if (!isOpen) return null;

  // Usar snapPoints se fornecido, senão usar height
  const useSnapPoints = snapPoints && snapPoints.length > 0;

  const heightClass = !useSnapPoints
    ? (height === 'full'
        ? 'h-full'
        : height === 'auto'
        ? 'h-auto max-h-[90vh]'
        : height)
    : '';

  const dynamicStyle = useSnapPoints
    ? { height: `${sheetHeight}vh`, animation: isDragging ? 'none' : 'slideUp 0.3s ease-out' }
    : { animation: 'slideUp 0.3s ease-out' };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl transform transition-all flex flex-col ${heightClass}`}
        style={dynamicStyle}
      >
        {/* Header com Handle arrastável */}
        <div
          className="flex-shrink-0 z-10 bg-white rounded-t-2xl touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* Title & Close */}
          {title && (
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Fechar"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Content - usa flex-1 para preencher espaço disponível */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain min-h-0"
          style={{
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

