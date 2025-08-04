import { NextRequest, NextResponse } from 'next/server';
import { instagramAPI } from '@/lib/instagram-api';

export async function POST(request: NextRequest) {
  try {
    const { businessId } = await request.json();

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID é obrigatório' },
        { status: 400 }
      );
    }

    // Gerar URL de autorização do Instagram
    const authUrl = instagramAPI.getAuthorizationUrl(businessId);

    console.log('🔗 Instagram: URL de autorização gerada para business:', businessId);

    return NextResponse.json({
      success: true,
      authUrl,
      message: 'URL de autorização gerada com sucesso'
    });

  } catch (error) {
    console.error('❌ Instagram Connect Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
