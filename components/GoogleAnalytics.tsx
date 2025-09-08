'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID: string
}

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        onError={() => {
          // Silently handle script loading errors (ad blockers, network issues)
          if (process.env.NODE_ENV === 'development') {
            console.warn('Google Analytics script could not be loaded (ad blocker or network issue)')
          }
        }}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            try {
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_title: document.title,
                page_location: window.location.href,
              });
            } catch (error) {
              // Silently handle initialization errors
              if (typeof console !== 'undefined' && console.warn) {
                console.warn('Google Analytics initialization failed:', error);
              }
            }
          `,
        }}
      />
    </>
  )
}
