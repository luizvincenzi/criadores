'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

/**
 * Componente para reportar Core Web Vitals
 * Carrega dinamicamente a biblioteca web-vitals para não afetar o bundle inicial
 */
export default function WebVitalsReporter() {
  useEffect(() => {
    // Carregar web-vitals dinamicamente
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      // Reportar todas as métricas Core Web Vitals
      onCLS(reportWebVitals);
      onFID(reportWebVitals);
      onFCP(reportWebVitals);
      onLCP(reportWebVitals);
      onTTFB(reportWebVitals);
    }).catch((error) => {
      console.warn('⚠️ [WEB VITALS] Erro ao carregar biblioteca:', error);
    });
  }, []);

  // Componente não renderiza nada visualmente
  return null;
}
