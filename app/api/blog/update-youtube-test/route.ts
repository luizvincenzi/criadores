import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('🔧 [API] Atualizando post de teste com vídeo funcional...');
    
    const updatedContent = `
      <h2><strong>O poder do vídeo marketing</strong></h2>
      <p>Neste post, vamos explorar como criar conteúdo viral no YouTube e como isso pode impactar seu negócio.</p>
      
      <h3>Principais estratégias:</h3>
      <ul>
        <li><strong>Conteúdo autêntico e relevante</strong> - Seja genuíno e ofereça valor real</li>
        <li><strong>Thumbnails atrativas</strong> - Primeira impressão é fundamental</li>
        <li><strong>Títulos que geram curiosidade</strong> - Desperte o interesse sem clickbait</li>
        <li><strong>Engajamento com a audiência</strong> - Responda comentários e crie comunidade</li>
      </ul>
      
      <p>Assista ao vídeo abaixo para ver essas estratégias em ação!</p>
      
      <div style="margin: 20px 0; text-align: center;">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/ScMzIvxBSi4" 
                title="YouTube video player" frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen>
        </iframe>
      </div>
      
      <p>Se você consegue ver o vídeo acima, significa que o CSP está funcionando corretamente!</p>
      
      <h3>Resultados esperados:</h3>
      <p>Com essas estratégias, você pode esperar:</p>
      <ul>
        <li>📈 <strong>Aumento de 40% no engajamento</strong></li>
        <li>🎯 <strong>Maior alcance orgânico</strong></li>
        <li>💰 <strong>Conversões mais efetivas</strong></li>
      </ul>
    `;

    // Atualizar o post existente
    const { data, error } = await supabase
      .from('posts')
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'teste-youtube-csp-video')
      .select()
      .single();

    if (error) {
      console.error('❌ [API] Erro ao atualizar post:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    console.log('✅ [API] Post atualizado com sucesso:', data.id);
    
    return NextResponse.json({
      success: true,
      post: data,
      testUrl: `http://localhost:3000/blog/${data.slug}`
    });
    
  } catch (error) {
    console.error('❌ [API] Erro geral:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}
