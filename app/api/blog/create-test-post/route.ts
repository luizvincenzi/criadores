import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 [API] Criando post de teste...');
    
    // Inserir post de teste
    const { data, error } = await supabase
      .from('posts')
      .insert({
        organization_id: '00000000-0000-0000-0000-000000000001',
        category_id: '00000000-0000-0000-0000-000000000001',
        author_id: '00000000-0000-0000-0000-000000000001',
        title: 'IA aumenta vendas de PMEs do interior em 300%',
        slug: 'ia-aumenta-vendas-pmes-interior',
        excerpt: 'Descubra como pequenas empresas estão usando inteligência artificial para triplicar suas vendas.',
        content: 'Conteúdo do post sobre IA e vendas...',
        featured_image_url: 'https://ecbhcalmulaiszslwhqz.supabase.co/storage/v1/object/public/blog/00000000-0000-0000-0000-000000000002/1757281328042-i5l5a3pstzg.png',
        featured_image_alt: 'IA para PMEs',
        tags: ['ia', 'vendas', 'pmes'],
        audience_target: 'EMPRESAS',
        status: 'PUBLICADO',
        is_featured: true,
        published_at: new Date().toISOString(),
        meta_title: 'IA aumenta vendas de PMEs do interior em 300%',
        meta_description: 'Descubra como pequenas empresas estão usando inteligência artificial para triplicar suas vendas.',
        read_time_minutes: 3,
        view_count: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ [API] Erro ao criar post:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }
    
    console.log('✅ [API] Post criado com sucesso:', data.id);
    
    return NextResponse.json({
      success: true,
      post: data
    });
    
  } catch (error) {
    console.error('❌ [API] Erro geral:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar post de teste'
    }, { status: 500 });
  }
}
