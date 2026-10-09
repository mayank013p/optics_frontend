'use client';

import React from 'react';
import { AuthView } from './AuthView';

interface LoginViewProps {
  onSwitchToRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSwitchToRegister }) => {
  return (
    <AuthView
      initialMode="login"
      onBackToLanding={onSwitchToRegister}
    />
  );
};

export default LoginView;
