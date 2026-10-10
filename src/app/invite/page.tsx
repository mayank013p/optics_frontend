'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Building, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Users, 
  Eye, 
  EyeOff
} from 'lucide-react';
import { api } from '@/lib/api';
import { OpticsProvider, useOptics } from '@/context/OpticsContext';
import OpticsLogo from '@/components/brand/OpticsLogo';
import styles from './InvitePage.module.css';

interface InvitationDetails {
  token: string;
  email: string;
  organizationName: string;
  organizationSlug: string;
  roleName: string;
  teamName?: string;
  workspaceName?: string;
  invitedByName: string;
  expiresAt: string;
}

function InviteAcceptForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const { currentUser, handleAcceptInvite } = useOptics();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided in the link.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.auth.verifyInvite(token);
        if (res.valid && res.invitation) {
          setInvitation(res.invitation);
          if (currentUser?.name) {
            setName(currentUser.name);
          } else if (res.invitation.email) {
            const prefix = res.invitation.email.split('@')[0];
            setName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
          }
        } else {
          setError('Invitation could not be verified.');
        }
      } catch (err: any) {
        setError(err.message || 'Invitation is invalid, expired, or already accepted.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!currentUser && (!password || password.length < 6)) {
      setError('Please choose a password with at least 6 characters.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await handleAcceptInvite({
        token,
        name: name.trim(),
        password: password || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.invitePage}>
      <div className={styles.container}>
        {/* Brand Header */}
        <div className={styles.brandHeader} onClick={() => router.push('/')}>
          <OpticsLogo size={24} showWordmark={true} />
        </div>

        {/* 1. Loading State */}
        {loading && (
          <div className={styles.loadingCard}>
            <div className={styles.loadingSpinner} />
            <div className={styles.loadingTitle}>Verifying invitation...</div>
            <div className={styles.loadingDesc}>Checking security credentials</div>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && !invitation && (
          <div className={styles.statusCard}>
            <div className={`${styles.statusIconWrapper} ${styles.statusIconError}`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className={styles.title}>Invitation Unavailable</h2>
            <p className={styles.subtitle} style={{ marginBottom: '1.25rem' }}>
              {error}
            </p>
            <button
              type="button"
              onClick={() => router.push('/')}
              className={styles.submitBtn}
            >
              <span>Go to Optics Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. Success State */}
        {success && (
          <div className={styles.statusCard}>
            <div className={`${styles.statusIconWrapper} ${styles.statusIconSuccess}`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className={styles.title}>Welcome to {invitation?.organizationName}</h2>
            <p className={styles.subtitle} style={{ marginBottom: '1.25rem' }}>
              Your account is ready with the <strong>{invitation?.roleName}</strong> role. Entering your workspace...
            </p>
            <div className={styles.loadingSpinner} style={{ marginBottom: 0 }} />
          </div>
        )}

        {/* 4. Active Invitation Form */}
        {!loading && invitation && !success && (
          <div className={styles.card}>
            {/* Header info */}
            <div className={styles.cardHeader}>
              <h1 className={styles.title}>
                Join {invitation.organizationName}
              </h1>
              <p className={styles.subtitle}>
                Invited by <strong style={{ color: 'var(--text-main, #1c1917)' }}>{invitation.invitedByName}</strong>
              </p>
            </div>

            {/* Invitation Metadata */}
            <div className={styles.metadataBox}>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>
                  <Building className="w-3.5 h-3.5" style={{ color: 'var(--text-dim, #78716c)' }} />
                  Organization
                </span>
                <span className={styles.metaValue}>{invitation.organizationName}</span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--text-dim, #78716c)' }} />
                  Assigned RBAC Role
                </span>
                <span className={styles.metaValue}>{invitation.roleName}</span>
              </div>
              {invitation.teamName && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>
                    <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-dim, #78716c)' }} />
                    Team
                  </span>
                  <span className={styles.metaValue}>{invitation.teamName}</span>
                </div>
              )}
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>
                  <Layers className="w-3.5 h-3.5" style={{ color: 'var(--text-dim, #78716c)' }} />
                  Workspace
                </span>
                <span className={styles.metaValue}>{invitation.workspaceName || 'Primary Workspace'}</span>
              </div>
            </div>

            {/* Error banner if form submission failed */}
            {error && (
              <div className={styles.errorBanner}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Acceptance Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Your Full Name *
                </label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  Invited Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} />
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={invitation.email}
                    className={`${styles.input} ${styles.inputDisabled}`}
                  />
                </div>
              </div>

              {!currentUser && (
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>
                    Set Account Password *
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className={`${styles.input} ${styles.inputWithToggle}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles.eyeToggle}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {currentUser && (
                <div className={styles.infoNotice}>
                  You are currently logged in as <strong>{currentUser.email}</strong>. Accepting will link this organization to your existing account.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={styles.submitBtn}
              >
                <span>{submitting ? 'Setting up workspace...' : `Accept & Join ${invitation.organizationName}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className={styles.footerLink}>
              Already have an account with a different email?
              <button
                type="button"
                onClick={() => router.push('/')}
                className={styles.footerLinkBtn}
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <OpticsProvider>
      <Suspense fallback={
        <div className={styles.invitePage}>
          <div className={styles.loadingCard}>
            <div className={styles.loadingSpinner} />
            <div className={styles.loadingTitle}>Loading...</div>
          </div>
        </div>
      }>
        <InviteAcceptForm />
      </Suspense>
    </OpticsProvider>
  );
}
