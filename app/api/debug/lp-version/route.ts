import { NextRequest, NextResponse } from 'next/server';
import { landingPagesService } from '@/lib/services/landingPagesService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug') || 'empresas/social-media-advogados';

    console.log(`🔍 DEBUG: Buscando LP com slug: ${slug}`);

    const lp = await landingPagesService.getLandingPageBySlug(slug);

    if (!lp) {
      return NextResponse.json({
        error: 'LP não encontrada',
        slug,
        timestamp: new Date().toISOString(),
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      slug: lp.slug,
      name: lp.name,
      version_number: lp.version_number,
      version_created_at: lp.version_created_at,
      hero_title: lp.variables?.hero?.title || 'N/A',
      hero_subtitle: lp.variables?.hero?.subtitle || 'N/A',
      timestamp: new Date().toISOString(),
      cache_headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('❌ Erro no debug endpoint:', error);
    return NextResponse.json({
      error: 'Erro ao buscar LP',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

