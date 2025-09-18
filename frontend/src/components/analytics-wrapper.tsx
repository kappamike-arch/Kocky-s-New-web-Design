'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/api/analytics';

export function AnalyticsWrapper() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view with error handling
    if (typeof window !== 'undefined') {
      analytics.pageView(pathname).catch(error => {
        console.warn('Analytics tracking failed:', error);
      });
    }
  }, [pathname]);

  useEffect(() => {
    // Track clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.closest('button');
        const label = button?.textContent || button?.getAttribute('aria-label') || 'Unknown Button';
        analytics.click(label, undefined, { x: e.clientX, y: e.clientY }).catch(error => {
          console.warn('Click tracking failed:', error);
        });
      }
      
      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.closest('a');
        const href = link?.getAttribute('href');
        const label = link?.textContent || 'Unknown Link';
        if (href && href.startsWith('http')) {
          analytics.click(label, href, { x: e.clientX, y: e.clientY }).catch(error => {
            console.warn('Click tracking failed:', error);
          });
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
