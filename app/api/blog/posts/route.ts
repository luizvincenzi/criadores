import { NextRequest, NextResponse } from 'next/server';
import { blogService } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] Buscando posts do blog...');
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const audience = searchParams.get('audience') as 'EMPRESAS' | 'CRIADORES' | 'AMBOS' | null;
    
    let posts;
    
    if (audience) {
      posts = await blogService.getPostsByAudience(audience);
    } else {
      posts = await blogService.getAllPosts();
    }
    
    // Limitar resultados
    const limitedPosts = posts.slice(0, limit);
    
    console.log(`✅ [API] ${limitedPosts.length} posts encontrados`);
    
    return NextResponse.json({
      success: true,
      posts: limitedPosts,
      total: posts.length
    });
    
  } catch (error) {
    console.error('❌ [API] Erro ao buscar posts:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar posts',
      posts: []
    }, { status: 500 });
  }
}
