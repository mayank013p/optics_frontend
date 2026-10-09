'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OpticsProvider, useOptics } from '@/context/OpticsContext';

// Views
import { LandingView } from '@/components/landing/LandingView';
import { NoOrgOnboardingView } from '@/components/auth/NoOrgOnboardingView';
import { AppShell } from '@/components/layout/AppShell';

function RootView() {
  const router = useRouter();
  const { isAuthenticated, authLoading, workspaces, allWorkspaces, loading } = useOptics();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get('auth');
      if (authParam === 'login') {
        router.replace('/login');
      } else if (authParam === 'register') {
        router.replace('/signup');
      }
    }
  }, [router]);

  if (!mounted || (authLoading && !isAuthenticated)) {
    return (
      <div 
        className="flex h-screen w-full items-center justify-center font-sans"
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
            Connecting to Optics...
          </span>
        </div>
      </div>
    );
  }

  // Unauthenticated visitors see the Landing Page
  if (!isAuthenticated) {
    return (
      <LandingView
        isAuthenticated={false}
        onOpenAuth={(mode = 'login') => {
          router.push(mode === 'login' ? '/login' : '/signup');
        }}
        onGoToApp={() => {
          router.push('/board');
        }}
      />
    );
  }

  // Authenticated user with no active workspace/organization yet
  const hasNoWorkspaces = !loading && (workspaces.length === 0 && allWorkspaces.length === 0);
  if (hasNoWorkspaces) {
    return <NoOrgOnboardingView />;
  }

  // Authenticated user with workspace
  return <AppShell />;
}

export default function OpticsApp() {
  return (
    <OpticsProvider>
      <RootView />
    </OpticsProvider>
  );
}
