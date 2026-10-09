'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OpticsProvider, useOptics } from '@/context/OpticsContext';
import { NoOrgOnboardingView } from '@/components/auth/NoOrgOnboardingView';

function OnboardingPageContent() {
  const router = useRouter();
  const { isAuthenticated, authLoading, workspaces, allWorkspaces, loading } = useOptics();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    } else if (!authLoading && isAuthenticated && !loading) {
      if (workspaces.length > 0 || allWorkspaces.length > 0) {
        router.replace('/board');
      }
    }
  }, [authLoading, isAuthenticated, loading, workspaces, allWorkspaces, router]);

  if (authLoading) {
    return (
      <div 
        className="flex h-screen w-full items-center justify-center font-sans"
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
        </div>
      </div>
    );
  }

  return <NoOrgOnboardingView />;
}

export default function OnboardingPage() {
  return (
    <OpticsProvider>
      <OnboardingPageContent />
    </OpticsProvider>
  );
}
