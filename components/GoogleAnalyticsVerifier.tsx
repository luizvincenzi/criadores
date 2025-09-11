'use client'

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface GAStatus {
  gtagAvailable: boolean;
  dataLayerExists: boolean;
  gaConfigured: boolean;
  gtmScriptExists: boolean;
  pageTracked: boolean;
}

export default function GoogleAnalyticsVerifier() {
  const pathname = usePathname();
  const [gaStatus, setGaStatus] = useState<GAStatus | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Só verificar em desenvolvimento
    if (process.env.NODE_ENV !== 'development') return;

    const verifyGA = () => {
      const status: GAStatus = {
        gtagAvailable: typeof window.gtag === 'function',
        dataLayerExists: Array.isArray(window.dataLayer),
        gaConfigured: false,
        gtmScriptExists: false,
        pageTracked: false
      };

      // Verificar se GA está configurado
      if (window.dataLayer) {
        status.gaConfigured = window.dataLayer.some(item => 
          item && typeof item === 'object' && 
          (item.event === 'config' || item[0] === 'config')
        );
      }

      // Verificar se GTM script existe
      const scripts = Array.from(document.querySelectorAll('script'));
      status.gtmScriptExists = scripts.some(script => 
        script.src && script.src.includes('googletagmanager.com/gtm.js')
      );

      // Verificar se a página foi rastreada
      if (window.dataLayer) {
        status.pageTracked = window.dataLayer.some(item =>
          item && typeof item === 'object' && 
          (item.event === 'page_view' || item[0] === 'config')
        );
      }

      setGaStatus(status);

      // Mostrar aviso se algo estiver faltando
      const hasIssues = !status.gtagAvailable || !status.dataLayerExists || 
                       !status.gaConfigured || !status.gtmScriptExists;
      setShowWarning(hasIssues);

      if (hasIssues) {
        console.warn('🚨 [GA VERIFIER] Problemas detectados no Google Analytics:', {
          página: pathname,
          gtagDisponível: status.gtagAvailable,
          dataLayerExiste: status.dataLayerExists,
          gaConfigurado: status.gaConfigured,
          gtmScript: status.gtmScriptExists,
          páginaRastreada: status.pageTracked
        });
      } else {
        console.log('✅ [GA VERIFIER] Google Analytics funcionando corretamente em:', pathname);
      }
    };

    // Verificar após um delay para garantir que scripts carregaram
    const timer = setTimeout(verifyGA, 2000);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Só mostrar em desenvolvimento e se houver problemas
  if (process.env.NODE_ENV !== 'development' || !showWarning || !gaStatus) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        backgroundColor: '#ff4444',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        🚨 Google Analytics - Problemas Detectados
      </div>
      <div style={{ fontSize: '11px' }}>
        {!gaStatus.gtagAvailable && <div>❌ gtag não disponível</div>}
        {!gaStatus.dataLayerExists && <div>❌ dataLayer não existe</div>}
        {!gaStatus.gaConfigured && <div>❌ GA não configurado</div>}
        {!gaStatus.gtmScriptExists && <div>❌ GTM script não encontrado</div>}
        <div style={{ marginTop: '5px', fontSize: '10px', opacity: 0.8 }}>
          Página: {pathname}
        </div>
      </div>
    </div>
  );
}
