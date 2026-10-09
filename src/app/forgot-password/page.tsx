'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OpticsProvider } from '@/context/OpticsContext';
import { AuthView } from '@/components/auth/AuthView';

function ForgotPasswordContent() {
  const router = useRouter();

  return (
    <AuthView
      initialMode="forgot-password"
      onBackToLanding={() => router.push('/')}
    />
  );
}

export default function ForgotPasswordPage() {
  return (
    <OpticsProvider>
      <ForgotPasswordContent />
    </OpticsProvider>
  );
}
