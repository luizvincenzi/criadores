// Tipo compatível com web-vitals v5.x
interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  id: string;
  navigationType?: string;
}

/**
 * Reporta Core Web Vitals para Google Analytics 4
 * Métricas: LCP, INP/FID, CLS, FCP, TTFB
 * Compatível com web-vitals v5.x
 */
export function reportWebVitals(metric: WebVitalsMetric) {
  // Só reportar em produção para evitar dados de desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    console.log('📊 [WEB VITALS DEV]', metric.name, metric.value, metric.rating);
    return;
  }

  try {
    // Reportar para Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      // Converter valor para inteiro (GA4 prefere inteiros)
      const value = Math.round(
        metric.name === 'CLS' ? metric.value * 1000 : metric.value
      );

      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: value,
        custom_parameter_1: metric.rating, // good, needs-improvement, poor
        custom_parameter_2: metric.navigationType || 'unknown',
        non_interaction: true,
      });

      console.log('📊 [WEB VITALS]', metric.name, value, metric.rating);
    }

  } catch (error) {
    // Falha silenciosa para não afetar UX
    console.warn('⚠️ [WEB VITALS] Erro ao reportar métricas:', error);
  }
}

/**
 * Thresholds para Core Web Vitals (valores em ms, exceto CLS)
 * Atualizado para web-vitals v5.x com INP
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: {
    good: 2500,
    needsImprovement: 4000,
  },
  FID: {
    good: 100,
    needsImprovement: 300,
  },
  INP: {
    good: 200,
    needsImprovement: 500,
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  FCP: {
    good: 1800,
    needsImprovement: 3000,
  },
  TTFB: {
    good: 800,
    needsImprovement: 1800,
  },
} as const;

/**
 * Avalia se uma métrica está dentro dos thresholds
 */
export function evaluateMetric(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[name as keyof typeof WEB_VITALS_THRESHOLDS];
  
  if (!thresholds) return 'poor';
  
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}
