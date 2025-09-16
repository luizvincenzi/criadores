'use client';

import { useEffect } from 'react';
import { trackBlogView } from '@/lib/blogTracking';

interface BlogViewTrackerProps {
  postSlug: string;
  postTitle: string;
  postId?: string;
}

export default function BlogViewTracker({ postSlug, postTitle, postId }: BlogViewTrackerProps) {
  useEffect(() => {
    // Rastrear visualização do post no banco de dados
    const trackView = async () => {
      try {
        await trackBlogView(postSlug, postTitle, postId);
      } catch (error) {
        console.error('Erro ao rastrear visualização:', error);
      }
    };

    // Delay para garantir que a página carregou completamente
    const timer = setTimeout(trackView, 1000);

    return () => clearTimeout(timer);
  }, [postSlug, postTitle, postId]);

  return null; // Este componente não renderiza nada
}
