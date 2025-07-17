'use client';

import React from 'react';
import { useToast } from '@/hooks/useToast';

interface ToastItemProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, message, type, onClose }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'warning':
        return 'bg-yellow-500 text-white border-yellow-600';
      case 'info':
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`
        flex items-center justify-between
        p-3 mb-2 rounded-lg shadow-lg
        border-l-4 min-w-80 max-w-md
        transform transition-all duration-300 ease-in-out
        hover:scale-105
        ${getTypeStyles()}
      `}
      style={{
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getIcon()}</span>
        <span className="text-sm font-medium">{message}</span>
      </div>
      
      <button
        onClick={() => onClose(id)}
        className="ml-3 text-white hover:text-gray-200 transition-colors"
        aria-label="Fechar notificação"
      >
        <svg 
          className="w-4 h-4" 
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
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToast();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <>
      {/* CSS para animações */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>

      {/* Container fixo no canto superior direito */}
      <div
        className="fixed top-4 right-4 z-50 space-y-2"
        style={{
          pointerEvents: 'none' // Não interfere com cliques na página
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{ pointerEvents: 'auto' }} // Apenas os toasts são clicáveis
          >
            <ToastItem
              id={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={hideToast}
            />
          </div>
        ))}
      </div>
    </>
  );
};

// Componente para debug (opcional)
export const ToastDebugPanel: React.FC = () => {
  const { toasts, showSuccess, showError, showInfo, showWarning, clearAll } = useToast();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50">
      <h3 className="text-sm font-bold mb-2">Toast Debug ({toasts.length})</h3>
      
      <div className="space-x-2 mb-2">
        <button
          onClick={() => showSuccess('Teste sucesso')}
          className="px-2 py-1 bg-green-600 text-xs rounded"
        >
          Success
        </button>
        <button
          onClick={() => showError('Teste erro')}
          className="px-2 py-1 bg-red-600 text-xs rounded"
        >
          Error
        </button>
        <button
          onClick={() => showInfo('Teste info')}
          className="px-2 py-1 bg-blue-600 text-xs rounded"
        >
          Info
        </button>
        <button
          onClick={() => showWarning('Teste warning')}
          className="px-2 py-1 bg-yellow-600 text-xs rounded"
        >
          Warning
        </button>
      </div>
      
      <button
        onClick={clearAll}
        className="px-2 py-1 bg-gray-600 text-xs rounded"
      >
        Clear All
      </button>
    </div>
  );
};
