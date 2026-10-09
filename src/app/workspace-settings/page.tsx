'use client';

import React from 'react';
import { OpticsProvider } from '@/context/OpticsContext';
import { AppShell } from '@/components/layout/AppShell';

export default function WorkspaceSettingsPage() {
  return (
    <OpticsProvider>
      <AppShell initialTab="workspace-settings" />
    </OpticsProvider>
  );
}
