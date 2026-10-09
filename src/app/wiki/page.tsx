'use client';

import React from 'react';
import { OpticsProvider } from '@/context/OpticsContext';
import { AppShell } from '@/components/layout/AppShell';

export default function WikiPage() {
  return (
    <OpticsProvider>
      <AppShell initialTab="docs" />
    </OpticsProvider>
  );
}
