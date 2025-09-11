'use client';

import { useEffect, useState } from 'react';

export default function TestAnalyticsPage() {
  const [analyticsStatus, setAnalyticsStatus] = useState({
    gtag: false,
    dataLayer: false,
    gtmLoaded: false,
    gaLoaded: false,
    errors: [] as string[]
  });

  useEffect(() => {
    // Aguardar um pouco para os scripts carregarem
    const timer = setTimeout(() => {
      const status = {
        gtag: typeof window.gtag === 'function',
        dataLayer: Array.isArray(window.dataLayer),
        gtmLoaded: false,
        gaLoaded: false,
        errors: [] as string[]
      };

      // Verificar se GTM foi carregado
      if (window.dataLayer) {
        status.gtmLoaded = window.dataLayer.some((item: any) => 
          item.event === 'gtm.js' || item['gtm.start']
        );
      }

      // Verificar se GA foi carregado
      status.gaLoaded = typeof window.gtag === 'function';

      // Verificar erros no console
      const originalError = console.error;
      const errors: string[] = [];
      console.error = (...args) => {
        const message = args.join(' ');
        if (message.includes('Content Security Policy') || 
            message.includes('googletagmanager') || 
            message.includes('google-analytics')) {
          errors.push(message);
        }
        originalError.apply(console, args);
      };

      status.errors = errors;
      setAnalyticsStatus(status);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const testGoogleAnalytics = () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'test_event', {
        event_category: 'test',
        event_label: 'analytics_test',
        value: 1
      });
      alert('Evento de teste enviado para Google Analytics!');
    } else {
      alert('Google Analytics não está carregado!');
    }
  };

  const testGTM = () => {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'test_gtm_event',
        test_category: 'gtm_test',
        test_action: 'button_click'
      });
      alert('Evento de teste enviado para GTM DataLayer!');
    } else {
      alert('GTM DataLayer não está disponível!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Teste do Google Analytics & GTM
          </h1>

          {/* Status do Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📊 Status do Google Analytics
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-3 ${analyticsStatus.gtag ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>gtag function: {analyticsStatus.gtag ? '✅ Disponível' : '❌ Não encontrada'}</span>
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-3 ${analyticsStatus.gaLoaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>GA Carregado: {analyticsStatus.gaLoaded ? '✅ Sim' : '❌ Não'}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                🏷️ Status do Google Tag Manager
              </h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-3 ${analyticsStatus.dataLayer ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>dataLayer: {analyticsStatus.dataLayer ? '✅ Disponível' : '❌ Não encontrada'}</span>
                </div>
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-3 ${analyticsStatus.gtmLoaded ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>GTM Carregado: {analyticsStatus.gtmLoaded ? '✅ Sim' : '❌ Não'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Variáveis de Ambiente */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔧 Configuração
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <strong>GA Measurement ID:</strong> {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '❌ Não configurado'}
              </div>
              <div>
                <strong>GTM Container ID:</strong> {process.env.NEXT_PUBLIC_GTM_ID || '❌ Não configurado'}
              </div>
            </div>
          </div>

          {/* Erros */}
          {analyticsStatus.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-red-900 mb-4">
                ⚠️ Erros Detectados
              </h2>
              <div className="space-y-2">
                {analyticsStatus.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões de Teste */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={testGoogleAnalytics}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🧪 Testar Google Analytics
            </button>
            <button
              onClick={testGTM}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              🧪 Testar GTM DataLayer
            </button>
          </div>

          {/* Instruções */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📋 Como verificar se está funcionando
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <strong>1. Console do Navegador:</strong> Abra F12 → Console e procure por erros de CSP
              </div>
              <div>
                <strong>2. Network Tab:</strong> Verifique se há requisições para googletagmanager.com e google-analytics.com
              </div>
              <div>
                <strong>3. Google Analytics Real-Time:</strong> Acesse GA4 e veja se aparecem usuários ativos
              </div>
              <div>
                <strong>4. GTM Preview:</strong> Use o modo preview do GTM para ver eventos sendo disparados
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Declarar tipos globais para TypeScript
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: any
    ) => void;
    dataLayer: any[];
  }
}
