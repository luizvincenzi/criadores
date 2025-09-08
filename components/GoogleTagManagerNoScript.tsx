interface GoogleTagManagerNoScriptProps {
  GTM_ID: string
}

export default function GoogleTagManagerNoScript({ GTM_ID }: GoogleTagManagerNoScriptProps) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  )
}
