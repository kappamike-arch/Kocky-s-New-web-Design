'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { analytics } from '@/lib/api/analytics';

export function AnalyticsWrapper() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Ensure we only run on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only track if we're on client side
    if (!isClient || typeof window === 'undefined') return;
    
    // Track page view with error handling
    analytics.pageView(pathname).catch(error => {
      console.warn('Analytics tracking failed:', error);
    });
  }, [pathname, isClient]);

  useEffect(() => {
    // Only track clicks if we're on client side
    if (!isClient || typeof document === 'undefined') return;
    
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
  }, [isClient]);

  // Return null to avoid hydration issues
  return null;
}
