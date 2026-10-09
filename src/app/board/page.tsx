'use client';

import React from 'react';
import { OpticsProvider } from '@/context/OpticsContext';
import { AppShell } from '@/components/layout/AppShell';

export default function BoardPage() {
  return (
    <OpticsProvider>
      <AppShell initialTab="board" />
    </OpticsProvider>
  );
}
