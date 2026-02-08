'use client';

import React from 'react';
import { Clock, Eye, Calendar, Tag } from 'lucide-react';
import { BlogPost } from '@/lib/supabase';
import { formatDate } from '@/lib/dateUtils';

interface PostSidebarProps {
  relatedPosts: BlogPost[];
  latestPosts: BlogPost[];
  currentPost: BlogPost;
  className?: string;
}

const PostSidebar: React.FC<PostSidebarProps> = ({ 
  relatedPosts, 
  latestPosts, 
  currentPost,
  className = '' 
}) => {


  // Função para obter nome da categoria
  const getCategoryName = (audience: string) => {
    const names: Record<string, string> = {
      'EMPRESAS': 'Para Empresas',
      'CRIADORES': 'Para Criadores',
      'AMBOS': 'Geral'
    };
    return names[audience] || 'Geral';
  };

  // Função para obter cor da categoria
  const getCategoryColor = (audience: string) => {
    const colors: Record<string, string> = {
      'EMPRESAS': 'bg-blue-100 text-blue-800',
      'CRIADORES': 'bg-purple-100 text-purple-800',
      'AMBOS': 'bg-green-100 text-green-800'
    };
    return colors[audience] || 'bg-gray-100 text-gray-800';
  };

  return (
    <aside className={`space-y-8 ${className}`}>
      {/* Informações do Post Atual */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Sobre este post</h3>
        
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Publicado em {formatDate(currentPost.published_at || '', 'short')}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>{currentPost.read_time_minutes} min de leitura</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Eye className="w-4 h-4 mr-2" />
            <span>{currentPost.view_count.toLocaleString()} visualizações</span>
          </div>
        </div>
        
        {/* Tags */}
        {currentPost.tags && currentPost.tags.length > 0 && (
          <div className="mt-4 pt-4">
            <div className="flex items-center mb-2">
              <Tag className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentPost.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Posts Relacionados */}
      {relatedPosts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Posts Relacionados</h3>
          
          <div className="space-y-4">
            {relatedPosts.map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <img 
                      src={post.featured_image_url || '/blog/default-image.jpg'} 
                      alt={post.featured_image_alt || post.title}
                      className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-1 ${getCategoryColor(post.audience_target)}`}>
                      {getCategoryName(post.audience_target)}
                    </span>
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h4>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span>{formatDate(post.published_at || '', 'compact')}</span>
                      <span className="mx-1">•</span>
                      <span>{post.read_time_minutes} min</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Últimos Posts */}
      {latestPosts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Últimos Posts</h3>
          
          <div className="space-y-4">
            {latestPosts.slice(0, 4).map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <img 
                      src={post.featured_image_url || '/blog/default-image.jpg'} 
                      alt={post.featured_image_alt || post.title}
                      className="w-12 h-12 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                      {post.title}
                    </h4>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span>{formatDate(post.published_at || '', 'compact')}</span>
                      <span className="mx-1">•</span>
                      <span>{post.read_time_minutes} min</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
          
          <div className="mt-4 pt-4">
            <a 
              href="/blog"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Ver todos os posts →
            </a>
          </div>
        </div>
      )}

      {/* CTA Fixo */}
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-6 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Quer implementar essas estratégias?
        </h3>
        <p className="text-gray-800 text-sm mb-4">
          Nossa equipe oferece consultoria gratuita para empresas e criadores.
        </p>
        <a
          href="/chatcriadores-social-media"
          className="inline-block bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
        >
          Falar com Especialista
        </a>
      </div>
    </aside>
  );
};

export default PostSidebar;
