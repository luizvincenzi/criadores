import { Metadata } from 'next';
import { blogService } from '@/lib/supabase';
import BlogFilteredList from '@/components/blog/BlogFilteredList';
import { BreadcrumbSchema, CollectionPageSchema } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Blog | crIAdores',
  description: 'Insights, tendencias e estrategias para empresas locais e criadores de conteudo. Marketing digital, micro-influenciadores e mais.',
  keywords: 'blog marketing, criadores de conteudo, marketing local, micro influenciadores, social media empresas',
  openGraph: {
    title: 'Blog crIAdores - Marketing para Negocios Locais',
    description: 'Estrategias de marketing digital para empresas locais e criadores de conteudo.',
    url: 'https://www.criadores.app/blog',
    siteName: 'crIAdores',
    locale: 'pt_BR',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.criadores.app/blog',
  },
};

export const revalidate = 3600;

export default async function BlogPage() {
  let posts: any[] = [];

  try {
    posts = await blogService.getAllPosts();
  } catch (error) {
    console.error('Erro ao carregar posts:', error);
  }

  const featuredPost = posts.find(post => post.is_featured);

  return (
    <div className="pt-20 min-h-screen bg-white">
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.criadores.app' },
        { name: 'Blog', url: 'https://www.criadores.app/blog' },
      ]} />
      <CollectionPageSchema
        name="Blog crIAdores"
        description="Insights, tendencias e estrategias para empresas locais e criadores de conteudo."
        url="https://www.criadores.app/blog"
        itemCount={posts.length}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-20 py-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Blog <span className="text-gray-600 font-light">cr</span><span className="text-black font-bold">IA</span><span className="text-gray-600 font-light">dores</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Insights, tendências e estratégias para empresas locais e criadores de conteúdo.
            Conectamos negócios aos melhores criadores da região.
          </p>
        </div>

        <BlogFilteredList posts={posts} featuredPost={featuredPost} />

        {/* Newsletter CTA */}
        <div className="mt-32 mb-32 bg-gradient-to-r from-[#0b3553] to-[#0d4a6b] rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">
            Não perca nenhum insight
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
            Receba semanalmente as melhores estratégias de marketing local e criação de conteúdo direto no seu e-mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-6 py-4 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white text-lg"
            />
            <button className="bg-white text-[#0b3553] px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors text-lg">
              Inscrever
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
