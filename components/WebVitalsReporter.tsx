'use client';

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/web-vitals';

/**
 * Componente para reportar Core Web Vitals
 * Carrega dinamicamente a biblioteca web-vitals para não afetar o bundle inicial
 * Compatível com web-vitals v5.x
 */
export default function WebVitalsReporter() {
  useEffect(() => {
    // Carregar web-vitals dinamicamente
    import('web-vitals').then((webVitals) => {
      try {
        // web-vitals v5.x usa uma API diferente
        if (webVitals.onCLS && typeof webVitals.onCLS === 'function') {
          webVitals.onCLS(reportWebVitals);
        }
        if (webVitals.onINP && typeof webVitals.onINP === 'function') {
          // INP substitui FID na v5.x
          webVitals.onINP(reportWebVitals);
        } else if (webVitals.onFID && typeof webVitals.onFID === 'function') {
          // Fallback para FID se INP não estiver disponível
          webVitals.onFID(reportWebVitals);
        }
        if (webVitals.onFCP && typeof webVitals.onFCP === 'function') {
          webVitals.onFCP(reportWebVitals);
        }
        if (webVitals.onLCP && typeof webVitals.onLCP === 'function') {
          webVitals.onLCP(reportWebVitals);
        }
        if (webVitals.onTTFB && typeof webVitals.onTTFB === 'function') {
          webVitals.onTTFB(reportWebVitals);
        }

        console.log('✅ [WEB VITALS] Biblioteca carregada com sucesso');
      } catch (error) {
        console.warn('⚠️ [WEB VITALS] Erro ao configurar métricas:', error);
      }
    }).catch((error) => {
      console.warn('⚠️ [WEB VITALS] Erro ao carregar biblioteca:', error);
    });
  }, []);

  // Componente não renderiza nada visualmente
  return null;
}
