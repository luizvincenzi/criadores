'use client'

import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

export default function GoogleAnalyticsPageTracker() {
  useGoogleAnalytics();
  return null;
}
