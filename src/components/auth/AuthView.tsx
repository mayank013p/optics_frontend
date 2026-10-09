'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  RotateCcw,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useOptics } from '../../context/OpticsContext';
import OpticsLogo from '../brand/OpticsLogo';
import styles from './AuthView.module.css';

interface AuthViewProps {
  initialMode?: 'login' | 'register' | 'otp-login' | 'forgot-password';
  onBackToLanding?: () => void;
}

type AuthMode = 'login' | 'register' | 'otp-login' | 'forgot-password';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
  otp?: string;
  general?: string;
}

function formatAuthError(err: any): { field?: keyof FieldErrors; message: string } {
  if (!err) return { message: 'An unexpected error occurred. Please try again.' };

  let raw = '';
  if (typeof err === 'string') {
    raw = err;
  } else if (err.error && typeof err.error === 'string') {
    raw = err.error;
  } else if (err.message && typeof err.message === 'string') {
    raw = err.message;
  } else {
    raw = String(err);
  }

  const lower = raw.toLowerCase();

  // Network / server connection
  if (lower.includes('failed to fetch') || lower.includes('network') || lower.includes('econnrefused')) {
    return { field: 'general', message: 'Unable to reach Optics servers. Please check your internet connection.' };
  }

  // OTP specific
  if (lower.includes('otp') || lower.includes('verification code') || lower.includes('invalid code') || lower.includes('expired code')) {
    return { field: 'otp', message: raw || 'Invalid or expired 6-digit verification code.' };
  }

  // Combined credential failures (e.g., "Invalid email or password", "Invalid credentials")
  if (
    lower.includes('invalid email or password') ||
    lower.includes('incorrect email or password') ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid login credentials') ||
    lower.includes('bad credentials')
  ) {
    return { field: 'general', message: 'Invalid email or password. Please check your credentials and try again.' };
  }

  // Password specific
  if (lower.includes('incorrect password') || lower.includes('wrong password') || lower.includes('invalid password')) {
    return { field: 'password', message: 'Incorrect password. Please verify and try again.' };
  }
  if (lower.includes('password') && (lower.includes('short') || lower.includes('at least 6') || lower.includes('minimum 6'))) {
    return { field: 'password', message: 'Password must be at least 6 characters long.' };
  }

  // Email specific (account existence or conflict)
  if (lower.includes('no account found') || lower.includes('user not found') || lower.includes('account not found') || lower.includes('user does not exist')) {
    return { field: 'email', message: 'No account exists for this work email. Please check for typos or register.' };
  }
  if (lower.includes('already exists') || lower.includes('already registered') || lower.includes('already in use')) {
    return { field: 'email', message: 'An account with this email already exists. Please sign in instead.' };
  }

  // Email format specific (only when explicitly about format)
  if (lower.includes('invalid email address') || lower.includes('valid email address') || lower.includes('malformed email') || lower.includes('invalid email format')) {
    return { field: 'email', message: 'Please enter a valid work email address.' };
  }

  return { field: 'general', message: raw || 'Authentication request failed. Please check your input.' };
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode = 'login', onBackToLanding }) => {
  const { 
    handleLogin, 
    handleRegister, 
    handleLoginViaOtp, 
    handleSendOtp, 
    handleResetPasswordViaOtp 
  } = useOptics();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Verification code state (inline lined field)
  const [otpCode, setOtpCode] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Validation
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Resend cooldown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus verification input when entering verification step
  useEffect(() => {
    if (otpSent) {
      setTimeout(() => {
        document.getElementById('auth-otp')?.focus();
      }, 80);
    }
  }, [otpSent]);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors(prev => {
      if (!prev[field] && !prev.general) return prev;
      const updated = { ...prev };
      delete updated[field];
      delete updated.general;
      return updated;
    });
  };

  const handleGoHome = () => {
    if (onBackToLanding) {
      onBackToLanding();
    } else {
      window.location.href = '/';
    }
  };

  // Request / Resend OTP
  const handleSendCode = async (purpose: 'LOGIN' | 'PASSWORD_RESET' | 'REGISTER') => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFieldErrors({ email: 'Work email is required to dispatch verification code.' });
      return;
    }
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setFieldErrors({ email: 'Please enter a valid work email address.' });
      return;
    }

    setLoading(true);
    setFieldErrors({});

    try {
      await handleSendOtp(trimmedEmail, purpose);
      setOtpSent(true);
      setCountdown(30);
      setOtpCode('');
    } catch (err: any) {
      const parsed = formatAuthError(err);
      if (parsed.field) {
        setFieldErrors({ [parsed.field]: parsed.message });
      } else {
        setFieldErrors({ general: parsed.message });
      }
    } finally {
      setLoading(false);
    }
  };

  // Primary Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const cleanOtp = otpCode.trim();

    const errors: FieldErrors = {};

    if (mode === 'register' && !otpSent && !trimmedName) {
      errors.name = 'Full name is required.';
    }

    if (!trimmedEmail) {
      errors.email = 'Work email address is required.';
    } else if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      errors.email = 'Please provide a valid work email address.';
    }

    if ((mode === 'login' || (mode === 'register' && !otpSent)) && !password) {
      errors.password = 'Password is required.';
    } else if ((mode === 'login' || (mode === 'register' && !otpSent)) && password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (otpSent && (mode === 'otp-login' || mode === 'forgot-password' || mode === 'register')) {
      if (cleanOtp.length < 6) {
        errors.otp = 'Please enter the 6-digit verification code.';
      }
    }

    if (mode === 'forgot-password' && otpSent) {
      if (!newPassword || newPassword.length < 6) {
        errors.newPassword = 'New password must be at least 6 characters.';
      }
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    // Step 1: Trigger code send if not sent yet
    if (mode === 'register' && !otpSent) {
      await handleSendCode('REGISTER');
      return;
    }

    if (mode === 'otp-login' && !otpSent) {
      await handleSendCode('LOGIN');
      return;
    }

    if (mode === 'forgot-password' && !otpSent) {
      await handleSendCode('PASSWORD_RESET');
      return;
    }

    // Step 2 / Direct Submissions
    setLoading(true);
    try {
      if (mode === 'login') {
        await handleLogin(trimmedEmail, password);
      } else if (mode === 'register' && otpSent) {
        await handleRegister(trimmedName, trimmedEmail, password, cleanOtp);
      } else if (mode === 'otp-login' && otpSent) {
        await handleLoginViaOtp(trimmedEmail, cleanOtp);
      } else if (mode === 'forgot-password' && otpSent) {
        await handleResetPasswordViaOtp(trimmedEmail, cleanOtp, newPassword);
        setMode('login');
        setOtpSent(false);
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setOtpCode('');
      }
    } catch (err: any) {
      const parsed = formatAuthError(err);
      if (parsed.field) {
        setFieldErrors({ [parsed.field]: parsed.message });
      } else {
        setFieldErrors({ general: parsed.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage} data-theme="warm-cream">
      {/* 1. Top Navbar: Logo on Left, Switcher Link on Right */}
      <header className={styles.topNav}>
        <div 
          className={styles.topLeftBrand} 
          onClick={handleGoHome} 
          role="button" 
          tabIndex={0} 
          title="Return to Optics Home"
        >
          <OpticsLogo size={22} showWordmark sublabel="by Ivors Systems" />
        </div>

        <div className={styles.topRightNav}>
          {mode === 'register' ? (
            <span className={styles.navText}>
              Already have an account?
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setFieldErrors({});
                  setOtpSent(false);
                  setOtpCode('');
                }}
                className={styles.navLink}
              >
                Sign in
              </button>
            </span>
          ) : (
            <span className={styles.navText}>
              New to Optics?
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setFieldErrors({});
                  setOtpSent(false);
                  setOtpCode('');
                }}
                className={styles.navLink}
              >
                Create an account
              </button>
            </span>
          )}
        </div>
      </header>

      {/* 2. Centered Frameless Form (No Background Container) */}
      <main className={styles.centerContainer}>
        <div className={styles.framelessFormArea}>
          {/* Form Header */}
          <div className={styles.headerArea}>
            <h1 className={styles.title}>
              {mode === 'login' 
                ? 'Sign in to Optics' 
                : mode === 'otp-login'
                  ? 'Sign in with Email'
                  : mode === 'forgot-password'
                    ? 'Reset password'
                    : otpSent
                      ? 'Verify your email'
                      : 'Create your account'}
            </h1>
            <p className={styles.subtitle}>
              {otpSent ? (
                <span className={styles.otpSubtitleNotice}>
                  Code sent to <strong className={styles.otpEmailHighlight}>{email}</strong>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpCode('');
                      clearFieldError('otp');
                    }}
                    className={styles.changeEmailLink}
                  >
                    Edit email
                  </button>
                </span>
              ) : mode === 'login' ? (
                'Enter your work email and password to continue.'
              ) : mode === 'otp-login' ? (
                'We’ll email you a one-time verification code.'
              ) : mode === 'forgot-password' ? (
                'Enter your work email to receive a password reset verification code.'
              ) : (
                'Join your team workspaces and manage high-velocity sprints.'
              )}
            </p>
          </div>

          {/* Frameless Form */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* Full Name (Register Step 1) */}
            {mode === 'register' && !otpSent && (
              <div className={`${styles.floatingField} ${fieldErrors.name ? styles.fieldHasError : ''}`}>
                <div className={styles.inputWrapper}>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => { 
                      setName(e.target.value); 
                      clearFieldError('name'); 
                    }}
                    placeholder=" "
                    className={`${styles.lineInput} ${fieldErrors.name ? styles.inputError : ''}`}
                    autoFocus
                    autoComplete="name"
                  />
                  <label 
                    htmlFor="auth-name" 
                    className={`${styles.floatingLabel} ${name ? styles.labelFloated : ''}`}
                  >
                    Full Name
                  </label>
                  <div className={styles.lineActiveBar} />
                </div>
                {fieldErrors.name && (
                  <span className={styles.inlineFieldError}>{fieldErrors.name}</span>
                )}
              </div>
            )}

            {/* Work Email Address */}
            {!otpSent && (
              <div className={`${styles.floatingField} ${fieldErrors.email ? styles.fieldHasError : ''}`}>
                <div className={styles.inputWrapper}>
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => { 
                      setEmail(e.target.value); 
                      clearFieldError('email'); 
                    }}
                    placeholder=" "
                    className={`${styles.lineInput} ${fieldErrors.email ? styles.inputError : ''}`}
                    autoFocus={mode === 'login'}
                    autoComplete="email"
                  />
                  <label 
                    htmlFor="auth-email" 
                    className={`${styles.floatingLabel} ${email ? styles.labelFloated : ''}`}
                  >
                    Work Email
                  </label>
                  <div className={styles.lineActiveBar} />
                </div>
                {fieldErrors.email && (
                  <span className={styles.inlineFieldError}>{fieldErrors.email}</span>
                )}
              </div>
            )}

            {/* Password Field */}
            {((mode === 'login') || (mode === 'register' && !otpSent)) && (
              <div className={`${styles.floatingField} ${fieldErrors.password ? styles.fieldHasError : ''}`}>
                <div className={styles.inputWrapper}>
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { 
                      setPassword(e.target.value); 
                      clearFieldError('password'); 
                    }}
                    placeholder=" "
                    className={`${styles.lineInput} ${styles.lineInputWithAction} ${fieldErrors.password ? styles.inputError : ''}`}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <label 
                    htmlFor="auth-password" 
                    className={`${styles.floatingLabel} ${password ? styles.labelFloated : ''}`}
                  >
                    Password
                  </label>
                  <div className={styles.lineActiveBar} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={styles.eyeBtn}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <span className={styles.inlineFieldError}>{fieldErrors.password}</span>
                )}
                
                {/* Forgot Password Link */}
                {mode === 'login' && (
                  <div className={styles.forgotPasswordRow}>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setFieldErrors({});
                        setOtpSent(false);
                      }}
                      className={styles.forgotLink}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Inline 6-Digit Verification Code Field */}
            {otpSent && (mode === 'otp-login' || mode === 'forgot-password' || mode === 'register') && (
              <div className={`${styles.floatingField} ${fieldErrors.otp ? styles.fieldHasError : ''}`}>
                <div className={styles.inputWrapper}>
                  <input
                    id="auth-otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(val);
                      clearFieldError('otp');
                    }}
                    placeholder=" "
                    className={`${styles.lineInput} ${styles.lineInputOtp} ${fieldErrors.otp ? styles.inputError : ''}`}
                    autoFocus
                    autoComplete="one-time-code"
                  />
                  <label 
                    htmlFor="auth-otp" 
                    className={`${styles.floatingLabel} ${otpCode ? styles.labelFloated : ''}`}
                  >
                    6-Digit Verification Code
                  </label>
                  <div className={styles.lineActiveBar} />
                  <div className={styles.inlineResendWrapper}>
                    <button
                      type="button"
                      disabled={countdown > 0 || loading}
                      onClick={() => handleSendCode(
                        mode === 'register' ? 'REGISTER' : mode === 'otp-login' ? 'LOGIN' : 'PASSWORD_RESET'
                      )}
                      className={styles.inlineResendBtn}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                    </button>
                  </div>
                </div>
                {fieldErrors.otp && (
                  <span className={styles.inlineFieldError}>{fieldErrors.otp}</span>
                )}
              </div>
            )}

            {/* New Password Fields (Forgot Password Step 2) */}
            {otpSent && mode === 'forgot-password' && (
              <>
                <div className={`${styles.floatingField} ${fieldErrors.newPassword ? styles.fieldHasError : ''}`}>
                  <div className={styles.inputWrapper}>
                    <input
                      id="auth-new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => { 
                        setNewPassword(e.target.value); 
                        clearFieldError('newPassword'); 
                      }}
                      placeholder=" "
                      className={`${styles.lineInput} ${styles.lineInputWithAction} ${fieldErrors.newPassword ? styles.inputError : ''}`}
                      autoComplete="new-password"
                    />
                    <label 
                      htmlFor="auth-new-password" 
                      className={`${styles.floatingLabel} ${newPassword ? styles.labelFloated : ''}`}
                    >
                      New Password
                    </label>
                    <div className={styles.lineActiveBar} />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={styles.eyeBtn}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.newPassword && (
                    <span className={styles.inlineFieldError}>{fieldErrors.newPassword}</span>
                  )}
                </div>

                <div className={`${styles.floatingField} ${fieldErrors.confirmPassword ? styles.fieldHasError : ''}`}>
                  <div className={styles.inputWrapper}>
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => { 
                        setConfirmPassword(e.target.value); 
                        clearFieldError('confirmPassword'); 
                      }}
                      placeholder=" "
                      className={`${styles.lineInput} ${styles.lineInputWithAction} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
                      autoComplete="new-password"
                    />
                    <label 
                      htmlFor="auth-confirm-password" 
                      className={`${styles.floatingLabel} ${confirmPassword ? styles.labelFloated : ''}`}
                    >
                      Confirm New Password
                    </label>
                    <div className={styles.lineActiveBar} />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={styles.eyeBtn}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <span className={styles.inlineFieldError}>{fieldErrors.confirmPassword}</span>
                  )}
                </div>
              </>
            )}

            {/* Inline General Error (No red card, subtle inline text) */}
            {fieldErrors.general && (
              <div className={styles.inlineGeneralError}>
                {fieldErrors.general}
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={styles.submitBtn}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login'
                      ? 'Sign In to Workspace'
                      : mode === 'otp-login'
                        ? otpSent ? 'Verify & Sign In' : 'Send 6-Digit Code'
                        : mode === 'forgot-password'
                          ? otpSent ? 'Reset & Update Password' : 'Send Reset Code'
                          : otpSent ? 'Verify & Create Account' : 'Continue to Verification'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

            {/* Alternative Links Below Button */}
            {mode === 'login' && (
              <div className={styles.altAuthRow}>
                <span>Prefer passwordless sign in?</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('otp-login');
                    setFieldErrors({});
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                  className={styles.textLink}
                >
                  Sign in with Email OTP
                </button>
              </div>
            )}

            {mode === 'otp-login' && (
              <div className={styles.backLinkRow}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFieldErrors({});
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                  className={styles.backLink}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to password sign-in</span>
                </button>
              </div>
            )}

            {mode === 'forgot-password' && (
              <div className={styles.backLinkRow}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFieldErrors({});
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                  className={styles.backLink}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to sign-in</span>
                </button>
              </div>
            )}
          </form>


          {/* Footer Note */}
          <footer className={styles.formFooter}>
            {mode === 'login' ? (
              <span>Invited to a team? Sign in with your assigned corporate email address.</span>
            ) : mode === 'otp-login' ? (
              <span>Security codes are sent via AWS SES and expire after 10 minutes.</span>
            ) : mode === 'forgot-password' ? (
              <span>You will receive an email confirmation once your password has been reset.</span>
            ) : (
              <span>By creating an account, you agree to Optics Terms and Privacy Policy.</span>
            )}
          </footer>
        </div>
      </main>

      {/* 3. Minimal Single-Line Bottom Footer */}
      <footer className={styles.minimalFooter}>
        <div className={styles.footerBrand}>
          <span>Optics by Ivors</span>
          <span className={styles.footerSep}>·</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <nav className={styles.footerNav} aria-label="Compliance and Legal">
          <Link href="/terms" className={styles.footerLink}>Terms</Link>
          <span className={styles.footerSep}>·</span>
          <Link href="/privacy" className={styles.footerLink}>Privacy</Link>
          <span className={styles.footerSep}>·</span>
          <Link href="/security" className={styles.footerLink}>Security &amp; Compliance</Link>
          <span className={styles.footerSep}>·</span>
          <Link href="/support" className={styles.footerLink}>Support</Link>
        </nav>
      </footer>
    </div>
  );
};

export default AuthView;
