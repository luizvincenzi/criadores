'use client';

import { useState, useCallback, useEffect } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  timestamp: Date;
}

interface UseToastReturn {
  toasts: Toast[];
  showToast: (message: string, type?: Toast['type'], duration?: number) => void;
  hideToast: (id: string) => void;
  clearAll: () => void;
  
  // Helpers específicos
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Função principal para mostrar toast
  const showToast = useCallback((
    message: string, 
    type: Toast['type'] = 'info', 
    duration: number = 4000
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
      timestamp: new Date()
    };

    console.log(`🍞 Toast ${type}:`, message);

    setToasts(prev => [...prev, newToast]);

    // Auto-remove após duration
    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  // Função para esconder toast específico
  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Função para limpar todos os toasts
  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Helpers específicos
  const showSuccess = useCallback((message: string, duration?: number) => {
    showToast(message, 'success', duration);
  }, [showToast]);

  const showError = useCallback((message: string, duration?: number) => {
    showToast(message, 'error', duration || 6000); // Erros ficam mais tempo
  }, [showToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    showToast(message, 'info', duration);
  }, [showToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    showToast(message, 'warning', duration || 5000);
  }, [showToast]);

  // Limitar número máximo de toasts (evitar spam)
  useEffect(() => {
    if (toasts.length > 5) {
      setToasts(prev => prev.slice(-5)); // Manter apenas os 5 mais recentes
    }
  }, [toasts.length]);

  return {
    toasts,
    showToast,
    hideToast,
    clearAll,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
};

// Hook específico para operações de criadores
export const useCreatorToast = () => {
  const { showSuccess, showError, showInfo } = useToast();

  const notifyCreatorAdded = useCallback((creatorName: string) => {
    showSuccess(`✅ ${creatorName} adicionado com sucesso`);
  }, [showSuccess]);

  const notifyCreatorRemoved = useCallback((creatorName: string) => {
    showSuccess(`🗑️ ${creatorName} removido com sucesso`);
  }, [showSuccess]);

  const notifyCreatorSwapped = useCallback((oldName: string, newName: string) => {
    showSuccess(`🔄 ${oldName} → ${newName}`);
  }, [showSuccess]);

  const notifyError = useCallback((operation: string, error: string) => {
    showError(`❌ Erro ao ${operation}: ${error}`);
  }, [showError]);

  const notifyLoading = useCallback((operation: string) => {
    showInfo(`⏳ ${operation}...`, 2000);
  }, [showInfo]);

  return {
    notifyCreatorAdded,
    notifyCreatorRemoved,
    notifyCreatorSwapped,
    notifyError,
    notifyLoading
  };
};
