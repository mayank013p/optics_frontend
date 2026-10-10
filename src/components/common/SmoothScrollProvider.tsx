'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Only enable Lenis on public marketing and legal pages to avoid hijacking internal app shell scrolling
    const isMarketingPage = 
      pathname === '/' || 
      pathname === '/landing' || 
      pathname === '/pricing' || 
      pathname === '/privacy' || 
      pathname === '/terms' || 
      pathname === '/security' || 
      pathname === '/support' || 
      pathname === '/contact';

    if (!isMarketingPage) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        delete (window as any).lenis;
      }
      return;
    }

    // Initialize Lenis with refined momentum and prevent nested scroll interference
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
      prevent: (node) => {
        return (
          node.hasAttribute('data-lenis-prevent') ||
          node.closest('[data-lenis-prevent]') !== null ||
          node.closest('main') !== null ||
          node.closest('.overflow-y-auto') !== null ||
          node.closest('.overflow-x-auto') !== null
        );
      },
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis;

    // RAF loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Global anchor click listener for buttery smooth scrolling to #targets
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href) return;

      // Check if it's a hash link on current page or root
      if (href.startsWith('#') || (href.startsWith('/#') && pathname === '/')) {
        const hash = href.includes('#') ? '#' + href.split('#')[1] : '';
        if (hash && hash !== '#') {
          const el = document.querySelector(hash);
          if (el) {
            e.preventDefault();
            lenis.scrollTo(el as HTMLElement, {
              offset: -80,
              duration: 1.2,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
            window.history.pushState(null, '', hash);
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, { passive: false });

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as any).lenis;
    };
  }, [pathname]);

  // Handle hash on initial mount or route change
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash && lenisRef.current) {
      const hash = window.location.hash;
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => {
          lenisRef.current?.scrollTo(el as HTMLElement, {
            offset: -80,
            duration: 1.2,
          });
        }, 150);
      }
    }
  }, [pathname]);

  return <>{children}</>;
};
