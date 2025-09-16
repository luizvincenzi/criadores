'use client';

import React, { useState, useEffect } from 'react';
import { Twitter, Linkedin, MessageCircle, Copy, Heart } from 'lucide-react';
import {
  trackBlogShare,
  trackBlogLike,
  trackBlogCopyLink,
  hasUserLikedPost
} from '@/lib/blogTracking';

interface FixedSocialShareProps {
  title: string;
  excerpt: string;
  url?: string;
  className?: string;
  postSlug?: string;
  postId?: string;
}

const FixedSocialShare: React.FC<FixedSocialShareProps> = ({
  title,
  excerpt,
  url,
  className = '',
  postSlug = '',
  postId = ''
}) => {
  // Componente removido para não interferir no mobile
  // Os botões de compartilhamento estão disponíveis no componente SocialShare
  return null;

  // Verificar se usuário já curtiu o post
  useEffect(() => {
    const checkUserLike = async () => {
      if (postSlug) {
        const userLiked = await hasUserLikedPost(postSlug);
        setHasLiked(userLiked);
      }
    };

    checkUserLike();
  }, [postSlug]);

  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${title} - ${excerpt}`;

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`,
  };

  const handleShare = async (platform: keyof typeof shareUrls | 'copy') => {
    // Track no banco de dados
    if (postSlug) {
      if (platform === 'copy') {
        await trackBlogCopyLink(postSlug, title, postId);
      } else {
        await trackBlogShare(postSlug, title, platform as any, postId);
      }
    }

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

  const handleLike = async () => {
    if (!hasLiked && postSlug) {
      // Atualizar estado local imediatamente
      setLikes(prev => prev + 1);
      setHasLiked(true);

      // Registrar no banco de dados
      await trackBlogLike(postSlug, title, postId);
    }
  };

  return (
    <>
      {/* Desktop Version */}
      <div className={`fixed right-6 top-1/2 transform -translate-y-1/2 z-50 hidden lg:block ${className}`}>
        <div className="bg-white rounded-2xl shadow-lg p-3 space-y-3">
        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
            hasLiked 
              ? 'bg-red-100 text-red-600' 
              : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
          title="Curtir"
        >
          <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
        </button>
        
        {likes > 0 && (
          <div className="text-center">
            <span className="text-xs font-medium text-gray-600">{likes}</span>
          </div>
        )}

        {/* Divider */}
        <div className="w-full h-px bg-gray-200"></div>

        {/* Twitter */}
        <button
          onClick={() => handleShare('twitter')}
          className="w-12 h-12 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-full flex items-center justify-center transition-all duration-200"
          title="Compartilhar no Twitter"
        >
          <Twitter className="w-5 h-5" />
        </button>

        {/* LinkedIn */}
        <button
          onClick={() => handleShare('linkedin')}
          className="w-12 h-12 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 rounded-full flex items-center justify-center transition-all duration-200"
          title="Compartilhar no LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </button>

        {/* WhatsApp */}
        <button
          onClick={() => handleShare('whatsapp')}
          className="w-12 h-12 bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 rounded-full flex items-center justify-center transition-all duration-200"
          title="Compartilhar no WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </button>



        {/* Copy Link */}
        <button
          onClick={() => handleShare('copy')}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
            isSharing
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
          }`}
          title="Copiar link"
        >
          {isSharing ? (
            <div className="w-5 h-5 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
        </div>
      </div>

      {/* Mobile Version - Bottom Fixed */}
      <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
        <div className="bg-white rounded-2xl shadow-lg p-3">
          <div className="flex items-center justify-center space-x-4">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                hasLiked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
              title="Curtir"
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
            </button>

            {/* Share Buttons */}
            <button
              onClick={() => handleShare('twitter')}
              className="w-10 h-10 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-full flex items-center justify-center transition-all duration-200"
              title="Compartilhar no Twitter"
            >
              <Twitter className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleShare('linkedin')}
              className="w-10 h-10 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-full flex items-center justify-center transition-all duration-200"
              title="Compartilhar no LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              className="w-10 h-10 bg-gray-100 hover:bg-green-100 text-gray-600 hover:text-green-600 rounded-full flex items-center justify-center transition-all duration-200"
              title="Compartilhar no WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleShare('copy')}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isSharing
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="Copiar link"
            >
              {isSharing ? (
                <div className="w-4 h-4 flex items-center justify-center">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {likes > 0 && (
            <div className="text-center mt-2">
              <span className="text-xs font-medium text-gray-600">{likes} curtidas</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FixedSocialShare;
