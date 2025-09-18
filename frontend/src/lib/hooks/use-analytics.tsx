import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { analytics } from '@/lib/api/analytics';

export function usePageTracking() {
  const router = useRouter();

  useEffect(() => {
    // Track initial page view
    analytics.pageView(router.pathname);

    // Track route changes
    const handleRouteChange = (url: string) => {
      analytics.pageView(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);
}

export function useClickTracking() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.closest('button');
        const label = button?.textContent || button?.getAttribute('aria-label') || 'Unknown Button';
        analytics.click(label, undefined, { x: e.clientX, y: e.clientY });
      }
      
      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.closest('a');
        const href = link?.getAttribute('href');
        const label = link?.textContent || 'Unknown Link';
        if (href) {
          analytics.click(label, href, { x: e.clientX, y: e.clientY });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
}
