'use client';

import React from 'react';
import { AuthView } from './AuthView';

interface RegisterViewProps {
  onSwitchToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onSwitchToLogin }) => {
  return (
    <AuthView
      initialMode="register"
      onBackToLanding={onSwitchToLogin}
    />
  );
};
