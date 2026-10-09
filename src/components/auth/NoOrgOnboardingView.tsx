'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building, 
  Key, 
  ArrowRight, 
  Mail, 
  LogOut 
} from 'lucide-react';
import { useOptics } from '@/context/OpticsContext';
import OpticsLogo from '../brand/OpticsLogo';
import { api } from '@/lib/api';
import styles from './NoOrgOnboardingView.module.css';

interface PendingInvite {
  id: string;
  token: string;
  organizationName: string;
  workspaceName: string;
  roleName: string;
  teamName?: string;
  invitedByName: string;
  expiresAt: string;
}

export const NoOrgOnboardingView: React.FC = () => {
  const { 
    currentUser, 
    handleLogout, 
    handleCreateOrganization, 
    handleJoinOrganizationViaToken,
    currentTheme
  } = useOptics();

  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [tokenInput, setTokenInput] = useState('');
  const [wsNameInput, setWsNameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pending invites detection
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [joiningInviteId, setJoiningInviteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        setLoadingInvites(true);
        const res = await api.auth.getMyInvites();
        if (res?.invitations && res.invitations.length > 0) {
          setPendingInvites(res.invitations);
        }
      } catch (err) {
        console.error('Failed to fetch pending invites:', err);
      } finally {
        setLoadingInvites(false);
      }
    };

    fetchInvites();
  }, []);

  const handleAcceptInvite = async (token: string, inviteId: string) => {
    setError(null);
    setJoiningInviteId(inviteId);

    try {
      await handleJoinOrganizationViaToken(token);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation. The link may have expired.');
    } finally {
      setJoiningInviteId(null);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setError(null);
    setLoading(true);

    try {
      await handleJoinOrganizationViaToken(tokenInput.trim());
    } catch (err: any) {
      setError(err.message || 'Invalid or expired invitation token');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = wsNameInput.trim();
    if (!cleanName) {
      setError('Please provide a workspace or company name');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await handleCreateOrganization(cleanName, cleanName);
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = currentUser?.name?.split(' ')[0] || 'there';

  return (
    <div className={styles.onboardingPage} data-theme={currentTheme || 'warm-cream'}>
      {/* 1. Top Navbar: Logo on Left Corner, User & Sign Out on Right Corner */}
      <header className={styles.topNav}>
        <div className={styles.topLeftBrand}>
          <OpticsLogo size={22} color="var(--text-main)" />
          <div>
            <span className={styles.brandLabel}>OPTICS</span>
            <span className={styles.brandSub}>Workspace Onboarding</span>
          </div>
        </div>

        <div className={styles.topRightNav}>
          <span className={styles.userLabel}>
            Signed in as <strong className={styles.userName}>{currentUser?.name || currentUser?.email}</strong>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className={styles.signOutBtn}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* 2. Main Centered Onboarding Form */}
      <main className={styles.centerContainer}>
        <div className={styles.onboardingCard}>
          {/* Minimal Header */}
          <div className={styles.headerArea}>
            <h1 className={styles.title}>
              Welcome to Optics, {displayName}!
            </h1>
            <p className={styles.subtitle}>
              Set up your workspace to start managing projects, issues, and team sprints.
            </p>
          </div>

          {/* Pending Invitations Card if any */}
          {pendingInvites.length > 0 && (
            <div className={styles.pendingInvitesCard}>
              <div className={styles.pendingInvitesHeader}>
                <Mail className="w-4 h-4 text-stone-700" />
                <span>Pending Team Invitation Found</span>
              </div>
              {pendingInvites.map((inv) => (
                <div key={inv.id} className={styles.inviteItem}>
                  <div>
                    <div className={styles.inviteTitle}>
                      <span>{inv.organizationName}</span>
                      <span className={styles.inviteRoleTag}>{inv.roleName}</span>
                    </div>
                    <div className={styles.inviteSub}>
                      Invited by {inv.invitedByName}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={joiningInviteId === inv.id}
                    onClick={() => handleAcceptInvite(inv.token, inv.id)}
                    className={styles.joinInviteBtn}
                  >
                    <span>{joiningInviteId === inv.id ? 'Joining...' : 'Join Workspace'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className={styles.tabsRow}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('create');
                setError(null);
              }}
              className={`${styles.tabBtn} ${activeTab === 'create' ? styles.tabBtnActive : ''}`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Create First Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('join');
                setError(null);
              }}
              className={`${styles.tabBtn} ${activeTab === 'join' ? styles.tabBtnActive : ''}`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Join with Invite Code</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'create' ? (
            <form onSubmit={handleCreate} className={styles.form} noValidate>
              <div className={`${styles.floatingField} ${error ? styles.fieldHasError : ''}`}>
                <div className={styles.inputWrapper}>
                  <input
                    id="ws-name-input"
                    type="text"
                    required
                    value={wsNameInput}
                    onChange={(e) => {
                      setWsNameInput(e.target.value);
                      setError(null);
                    }}
                    placeholder=" "
                    className={`${styles.lineInput} ${error ? styles.inputError : ''}`}
                    autoFocus
                  />
                  <label
                    htmlFor="ws-name-input"
                    className={`${styles.floatingLabel} ${wsNameInput ? styles.labelFloated : ''}`}
                  >
                    Workspace or Company Name
                  </label>
                  <div className={styles.lineActiveBar} />
                </div>
                {error ? (
                  <span className={styles.inlineFieldError}>{error}</span>
                ) : (
                  <span className={styles.hintText}>
                    You will be the Workspace Owner with full administrative permissions.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
              >
                <span>{loading ? 'Creating Workspace...' : 'Create Workspace & Launch'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoin} className={styles.form} noValidate>
              <div className={`${styles.floatingField} ${error ? styles.fieldHasError : ''}`}>
                <div className={styles.inputWrapper}>
                  <input
                    id="token-input"
                    type="text"
                    required
                    value={tokenInput}
                    onChange={(e) => {
                      setTokenInput(e.target.value);
                      setError(null);
                    }}
                    placeholder=" "
                    className={`${styles.lineInput} ${error ? styles.inputError : ''}`}
                    autoFocus
                  />
                  <label
                    htmlFor="token-input"
                    className={`${styles.floatingLabel} ${tokenInput ? styles.labelFloated : ''}`}
                  >
                    Invitation Code or Secret Token
                  </label>
                  <div className={styles.lineActiveBar} />
                </div>
                {error ? (
                  <span className={styles.inlineFieldError}>{error}</span>
                ) : (
                  <span className={styles.hintText}>
                    Paste the invitation token sent to your email.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.submitBtn}
              >
                <span>{loading ? 'Validating Token...' : 'Join Workspace'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
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

export default NoOrgOnboardingView;
