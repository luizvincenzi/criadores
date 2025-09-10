'use client';

import React, { useState } from 'react';
import { Share2, Twitter, Linkedin, MessageCircle, Copy, Heart, Eye } from 'lucide-react';
import { trackSocialShare } from '@/lib/gtag';

interface SocialShareProps {
  title: string;
  excerpt: string;
  url?: string;
  viewCount?: number;
  showViewCount?: boolean;
  variant?: 'compact' | 'full';
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ 
  title, 
  excerpt, 
  url,
  viewCount = 0,
  showViewCount = viewCount > 0,
  variant = 'full',
  className = '' 
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${title} - ${excerpt}`;

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`,
  };

  const handleShare = async (platform: keyof typeof shareUrls | 'copy') => {
    // Track social share
    trackSocialShare(platform, 'blog_post', title);

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(currentUrl);
        setIsSharing(true);
        setTimeout(() => setIsSharing(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar link:', err);
      }
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-colors ${
            hasLiked 
              ? 'bg-red-100 text-red-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{likes}</span>
        </button>
        
        {showViewCount && (
          <div className="flex items-center space-x-1 text-gray-500">
            <Eye className="w-4 h-4" />
            <span className="text-sm">{viewCount.toLocaleString()}</span>
          </div>
        )}
        
        <button
          onClick={() => handleShare('copy')}
          className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          title="Compartilhar"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Compartilhamento Reorganizado */}
      <div className="p-4 bg-gray-50 rounded-xl">
        {/* Título Compartilhar */}
        <div className="mb-4">
          <span className="text-sm text-gray-500 font-medium">Compartilhar:</span>
        </div>

        {/* Botões de Compartilhamento */}
        <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
          title="Compartilhar no Twitter"
        >
          <Twitter className="w-4 h-4" />
          <span className="text-sm font-medium">Twitter</span>
        </button>
        
        <button
          onClick={() => handleShare('linkedin')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full transition-colors"
          title="Compartilhar no LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
          <span className="text-sm font-medium">LinkedIn</span>
        </button>
        
        <button
          onClick={() => handleShare('whatsapp')}
          className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm font-medium">WhatsApp</span>
        </button>
        
        <button
          onClick={() => handleShare('copy')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
            isSharing 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title="Copiar link"
        >
          <Copy className="w-4 h-4" />
          <span className="text-sm font-medium">
            {isSharing ? 'Copiado!' : 'Copiar'}
          </span>
        </button>
        </div>

        {/* Estatísticas */}
        <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
          {likes > 0 && (
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-colors text-sm ${
                hasLiked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500 border border-gray-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{likes}</span>
              <span>curtidas</span>
            </button>
          )}

          {showViewCount && (
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{viewCount.toLocaleString()}</span>
              <span>visualizações</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialShare;
