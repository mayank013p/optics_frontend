'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OpticsProvider, useOptics } from '@/context/OpticsContext';
import { LandingView } from '@/components/landing/LandingView';

function LandingPageContent() {
  const router = useRouter();
  const { isAuthenticated } = useOptics();

  return (
    <LandingView
      isAuthenticated={isAuthenticated}
      onOpenAuth={(mode = 'login') => {
        router.push(mode === 'login' ? '/login' : '/signup');
      }}
      onGoToApp={() => {
        router.push('/board');
      }}
    />
  );
}

export default function LandingPage() {
  return (
    <OpticsProvider>
      <LandingPageContent />
    </OpticsProvider>
  );
}
