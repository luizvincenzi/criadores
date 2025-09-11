import { notFound } from 'next/navigation';
import { blogService } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function TestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  console.log(`🧪 [TEST] Testando slug: ${slug}`);
  
  try {
    const post = await blogService.getPostBySlug(slug);
    
    if (!post) {
      console.log(`❌ [TEST] Post não encontrado: ${slug}`);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Post não encontrado</h1>
            <p className="text-gray-600">Slug: {slug}</p>
          </div>
        </div>
      );
    }
    
    console.log(`✅ [TEST] Post encontrado: ${post.title}`);
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl p-8">
          <h1 className="text-3xl font-bold text-green-600 mb-4">✅ TESTE FUNCIONANDO!</h1>
          <div className="bg-gray-100 p-4 rounded-lg text-left">
            <p><strong>Slug:</strong> {slug}</p>
            <p><strong>Título:</strong> {post.title}</p>
            <p><strong>Status:</strong> {post.status}</p>
            <p><strong>ID:</strong> {post.id}</p>
          </div>
        </div>
      </div>
    );
    
  } catch (error) {
    console.error(`❌ [TEST] Erro ao carregar post ${slug}:`, error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Erro no servidor</h1>
          <p className="text-gray-600">Slug: {slug}</p>
          <p className="text-red-500">Erro: {error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        </div>
      </div>
    );
  }
}
