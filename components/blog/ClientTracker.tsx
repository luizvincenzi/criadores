'use client';

import { useEffect } from 'react';
import { trackBlogView } from '@/lib/gtag';

interface ClientTrackerProps {
  postTitle: string;
  postSlug: string;
}

export default function ClientTracker({ postTitle, postSlug }: ClientTrackerProps) {
  useEffect(() => {
    // Rastrear visualização do post
    trackBlogView(postTitle, postSlug);
  }, [postTitle, postSlug]);

  return null; // Este componente não renderiza nada
}
