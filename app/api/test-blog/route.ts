import { NextResponse } from 'next/server';
import { blogService } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 [TEST] Testando conexão com blog...');
    
    // Testar getAllPosts
    const posts = await blogService.getAllPosts();
    console.log(`📝 [TEST] Posts encontrados: ${posts.length}`);
    
    // Testar getPostBySlug com um post específico
    let testPost = null;
    if (posts.length > 0) {
      const firstPost = posts[0];
      testPost = await blogService.getPostBySlug(firstPost.slug);
      console.log(`📖 [TEST] Post teste carregado: ${testPost?.title || 'ERRO'}`);
    }
    
    return NextResponse.json({
      success: true,
      totalPosts: posts.length,
      posts: posts.map(p => ({ slug: p.slug, title: p.title, status: p.status })),
      testPost: testPost ? { slug: testPost.slug, title: testPost.title } : null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ [TEST] Erro ao testar blog:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
