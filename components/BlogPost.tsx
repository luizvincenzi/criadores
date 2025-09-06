'use client';

import { useState } from 'react';

interface BlogPostProps {
  title: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: string;
  image: string;
  content: {
    context: string;
    data: string;
    application: string;
    conclusion: string;
  };
  cta: {
    text: string;
    link: string;
  };
  relatedPosts?: Array<{
    title: string;
    slug: string;
    category: string;
    image: string;
  }>;
}

const BlogPost = ({ 
  title, 
  excerpt, 
  category, 
  categoryColor, 
  date, 
  readTime, 
  image, 
  content, 
  cta, 
  relatedPosts = [] 
}: BlogPostProps) => {
  const [isSharing, setIsSharing] = useState(false);

  const sharePost = async (platform: string) => {
    const url = window.location.href;
    const text = `${title} - ${excerpt}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      copy: url
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setIsSharing(true);
        setTimeout(() => setIsSharing(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar link:', err);
      }
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank');
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li><a href="/blog" className="hover:text-[#0b3553]">Blog</a></li>
          <li><span className="mx-2">/</span></li>
          <li><span className={`px-2 py-1 rounded-full text-xs ${categoryColor}`}>{category}</span></li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor}`}>
            {category}
          </span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-gray-500 text-sm">{date}</span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-gray-500 text-sm">{readTime}</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
          {title}
        </h1>
        
        <p className="text-xl text-gray-600 leading-relaxed mb-8">
          {excerpt}
        </p>

        {/* Share Buttons */}
        <div className="flex items-center space-x-4 mb-8">
          <span className="text-sm text-gray-500">Compartilhar:</span>
          <button
            onClick={() => sharePost('twitter')}
            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
            title="Compartilhar no Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </button>
          <button
            onClick={() => sharePost('linkedin')}
            className="p-2 text-gray-400 hover:text-blue-700 transition-colors"
            title="Compartilhar no LinkedIn"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>
          <button
            onClick={() => sharePost('whatsapp')}
            className="p-2 text-gray-400 hover:text-green-500 transition-colors"
            title="Compartilhar no WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </button>
          <button
            onClick={() => sharePost('copy')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copiar link"
          >
            {isSharing ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Featured Image */}
      <div className="mb-8">
        <img 
          src={image} 
          alt={title}
          className="w-full h-64 md:h-96 object-cover rounded-xl"
        />
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        {/* Context Section */}
        <div className="mb-8">
          <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
            <span className="text-2xl mr-3">📍</span>
            CONTEXTO
          </h2>
          <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.context }} />
        </div>

        {/* Data Section */}
        <div className="mb-8">
          <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
            <span className="text-2xl mr-3">📊</span>
            DADOS & INSIGHTS
          </h2>
          <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.data }} />
        </div>

        {/* Application Section */}
        <div className="mb-8">
          <h2 className="flex items-center text-2xl font-bold text-gray-900 mb-4">
            <span className="text-2xl mr-3">💡</span>
            APLICAÇÃO PRÁTICA
          </h2>
          <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: content.application }} />
        </div>

        {/* Conclusion & CTA */}
        <div className="mb-12">
          <div className="text-gray-700 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: content.conclusion }} />
          
          <div className="bg-gradient-to-r from-[#0b3553] to-[#0d4a6b] rounded-xl p-6 text-center">
            <p className="text-white text-lg mb-4">{cta.text}</p>
            <a 
              href={cta.link}
              className="inline-block bg-white text-[#0b3553] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Saiba Mais →
            </a>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="border-t border-gray-200 pt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Posts Relacionados</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((post, index) => (
              <a 
                key={index}
                href={`/blog/${post.slug}`}
                className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{post.category}</span>
                  <h4 className="text-sm font-semibold text-gray-900 mt-1 group-hover:text-[#0b3553] transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default BlogPost;
