'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OpticsProvider, useOptics } from '@/context/OpticsContext';
import { AuthView } from '@/components/auth/AuthView';

function SignupPageContent() {
  const router = useRouter();
  const { isAuthenticated, authLoading, workspaces, allWorkspaces, loading } = useOptics();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const hasNoWs = !loading && (workspaces.length === 0 && allWorkspaces.length === 0);
      if (hasNoWs) {
        router.replace('/onboarding');
      } else {
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

  return (
    <AuthView
      initialMode="register"
      onBackToLanding={() => router.push('/')}
    />
  );
}

export default function SignupPage() {
  return (
    <OpticsProvider>
      <SignupPageContent />
    </OpticsProvider>
  );
}
