'use client'

import { useEffect, useState } from 'react'

export default function AnalyticsDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const info = {
      ga_id: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      gtm_id: process.env.NEXT_PUBLIC_GTM_ID,
      node_env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      gtag_exists: typeof window !== 'undefined' && typeof window.gtag !== 'undefined',
      dataLayer_exists: typeof window !== 'undefined' && Array.isArray(window.dataLayer),
      dataLayer_length: typeof window !== 'undefined' && window.dataLayer ? window.dataLayer.length : 0,
    }
    setDebugInfo(info)
  }, [])

  // Só mostrar em produção se houver problema
  if (process.env.NODE_ENV === 'development' || !debugInfo.ga_id || !debugInfo.gtm_id) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: '#ff4444',
        color: '#fff',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
        fontFamily: 'monospace'
      }}>
        <h4>⚠️ Analytics Debug</h4>
        <div><strong>GA ID:</strong> {debugInfo.ga_id || '❌ NOT SET'}</div>
        <div><strong>GTM ID:</strong> {debugInfo.gtm_id || '❌ NOT SET'}</div>
        <div><strong>Environment:</strong> {debugInfo.node_env}</div>
        <div><strong>gtag:</strong> {debugInfo.gtag_exists ? '✅' : '❌'}</div>
        <div><strong>dataLayer:</strong> {debugInfo.dataLayer_exists ? '✅' : '❌'}</div>
        <div><strong>URL:</strong> {debugInfo.url}</div>
        <div style={{ marginTop: '10px', fontSize: '10px' }}>
          {!debugInfo.ga_id && '• Configure NEXT_PUBLIC_GA_MEASUREMENT_ID'}<br/>
          {!debugInfo.gtm_id && '• Configure NEXT_PUBLIC_GTM_ID'}<br/>
          • Redeploy after setting env vars
        </div>
      </div>
    )
  }

  return null
}
