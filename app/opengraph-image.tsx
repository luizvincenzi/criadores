import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'crIAdores - Conectando Empresas Locais a Criadores de Conteudo';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a2d47 0%, #0b3553 100%)',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        {/* Logo text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'baseline',
            fontSize: 88,
            lineHeight: 1,
          }}
        >
          <span style={{ color: '#94a3b8', fontWeight: 300 }}>cr</span>
          <span style={{ color: '#ffffff', fontWeight: 700 }}>IA</span>
          <span style={{ color: '#94a3b8', fontWeight: 300 }}>dores</span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: 120,
            height: 2,
            backgroundColor: '#94a3b8',
            opacity: 0.3,
            marginTop: 32,
            marginBottom: 32,
            borderRadius: 1,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            color: '#94a3b8',
            fontWeight: 300,
            letterSpacing: '0.5px',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Conectando empresas locais a criadores de conteudo
        </div>

        {/* URL at the bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            fontSize: 18,
            color: '#64748b',
            fontWeight: 400,
            letterSpacing: '1px',
          }}
        >
          criadores.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
