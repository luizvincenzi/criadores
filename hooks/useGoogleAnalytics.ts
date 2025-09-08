'use client'

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { pageview } from '@/lib/gtag';

export function useGoogleAnalytics() {
  const pathname = usePathname();
  const [searchParams, setSearchParams] = useState<string>('');

  useEffect(() => {
    // Só acessar window.location no cliente
    if (typeof window !== 'undefined') {
      setSearchParams(window.location.search);
    }
  }, []);

  useEffect(() => {
    if (pathname) {
      const url = pathname + searchParams;
      pageview(url);
    }
  }, [pathname, searchParams]);
}
