'use client';

import React from 'react';
import { OpticsProvider } from '@/context/OpticsContext';
import { AppShell } from '@/components/layout/AppShell';

export default function ProfilePage() {
  return (
    <OpticsProvider>
      <AppShell initialTab="profile" />
    </OpticsProvider>
  );
}
