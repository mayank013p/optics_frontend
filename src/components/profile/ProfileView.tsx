'use client';

import React, { useState } from 'react';
import { 
  User, 
  Palette, 
  ShieldCheck, 
  Key, 
  Check, 
  Laptop, 
  Save, 
  Briefcase, 
  Mail, 
  Building2,
  Sliders,
  Bell,
  Sun,
  Moon,
  Zap,
  CheckCircle2,
  Lock,
  FileText
} from 'lucide-react';
import { useOptics } from '../../context/OpticsContext';
import { ProfileSkeleton } from '../common/Skeleton';
import styles from './ProfileView.module.css';

export const ProfileView: React.FC = () => {
  const { 
    currentUser, 
    currentTheme, 
    setCurrentTheme, 
    activeProject,
    handleLogout,
    handleUpdateProfile,
    handleUpdatePassword,
    authLoading
  } = useOptics();

  if (authLoading && !currentUser) {
    return <ProfileSkeleton />;
  }

  // Profile Form States
  const [name, setName] = useState(currentUser?.name || 'Mayank Aitan');
  const [jobTitle, setJobTitle] = useState(currentUser?.jobTitle || 'Founder & Lead Architect');
  const [bio, setBio] = useState('Building next-generation agile engineering tools and distributed systems.');
  
  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Preference States
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleUpdateProfile({ name, jobTitle });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      await handleUpdatePassword({ currentPassword: currentPassword || undefined, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    }
  };

  const initialLetter = (name || 'U').charAt(0).toUpperCase();

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Account & Personalization</h1>
        <p className={styles.pageSubtitle}>
          Manage your personal profile, visual themes, workspace preferences, and security credentials.
        </p>
      </div>

      <div className={styles.sectionsWrapper}>
        {/* 1. Profile Information Section */}
        <section className={styles.cardSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <div className={styles.sectionIconPill}>
                <User className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Personal Details</h2>
                <p className={styles.sectionSubtitle}>Your public identity across Optics workspaces.</p>
              </div>
            </div>
            {saveSuccess && (
              <div className={styles.saveSuccessPill}>
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile updated</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
            <div className={styles.avatarRow}>
              <div className={styles.largeAvatar}>
                {initialLetter}
              </div>
              <div className={styles.avatarMeta}>
                <h3 className={styles.avatarName}>{name}</h3>
                <div className={styles.avatarRoleBadge}>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                  <span>Organization Owner • Full Root Access</span>
                </div>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <User className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Full Name
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  placeholder="Your full name"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Job Title / Engineering Role
                  </span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className={styles.input}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Mail className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Corporate Work Email
                  </span>
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || 'mayank@ivors.in'}
                  className={`${styles.input} ${styles.inputReadOnly}`}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Building2 className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Active Organization
                  </span>
                </label>
                <input
                  type="text"
                  disabled
                  value="Ivors HQ (ivors.in)"
                  className={`${styles.input} ${styles.inputReadOnly}`}
                />
              </div>

              <div className={`${styles.field} ${styles.formFieldFull}`}>
                <label className={styles.label}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <FileText className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Bio / Technical Focus
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={styles.input}
                  placeholder="Brief note on your current engineering focus..."
                />
              </div>
            </div>

            <div className={styles.saveRow}>
              <button type="submit" className={styles.saveBtn}>
                <Save className="w-3.5 h-3.5" strokeWidth={2.2} />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </section>

        {/* 2. Theme & Visual Personalization */}
        <section className={styles.cardSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <div className={styles.sectionIconPill}>
                <Palette className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Theme & Appearance</h2>
                <p className={styles.sectionSubtitle}>Select your primary color mode and visual density.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className={styles.label}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <Palette className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                Color Palette Mode
              </span>
            </label>
            <div className={styles.themeGrid}>
              {/* Dark Theme */}
              <div 
                onClick={() => setCurrentTheme('dark')}
                className={`${styles.themeCard} ${currentTheme === 'dark' ? styles.themeCardActive : ''}`}
              >
                <div className={`${styles.themePreviewBox} ${styles.themePreviewDark}`}>
                  <div className={styles.themePreviewMiniHeader}>
                    <div className={styles.themePreviewMiniDots}>
                      <span className={styles.miniDot} />
                      <span className={styles.miniDot} />
                    </div>
                    <Moon className="w-3.5 h-3.5 opacity-80" />
                  </div>
                  <div className={styles.themePreviewMiniCard}>
                    Sprint Board
                  </div>
                </div>
                <div className={styles.themeCardTitleRow}>
                  <span className={styles.themeCardTitle}>Pro Dark</span>
                  {currentTheme === 'dark' && <Check className="w-4 h-4 text-amber-500" strokeWidth={2.5} />}
                </div>
                <p className={styles.themeCardDesc}>
                  Deep zinc black with subtle borders and high-contrast typography.
                </p>
              </div>

              {/* Cream Theme */}
              <div 
                onClick={() => setCurrentTheme('warm-cream')}
                className={`${styles.themeCard} ${currentTheme === 'warm-cream' ? styles.themeCardActive : ''}`}
              >
                <div className={`${styles.themePreviewBox} ${styles.themePreviewCream}`}>
                  <div className={styles.themePreviewMiniHeader}>
                    <div className={styles.themePreviewMiniDots}>
                      <span className={styles.miniDot} />
                      <span className={styles.miniDot} />
                    </div>
                    <Sun className="w-3.5 h-3.5 opacity-80" />
                  </div>
                  <div className={styles.themePreviewMiniCard} style={{ backgroundColor: '#f0eee8', color: '#111' }}>
                    Sprint Board
                  </div>
                </div>
                <div className={styles.themeCardTitleRow}>
                  <span className={styles.themeCardTitle}>Studio Cream</span>
                  {currentTheme === 'warm-cream' && <Check className="w-4 h-4 text-amber-500" strokeWidth={2.5} />}
                </div>
                <p className={styles.themeCardDesc}>
                  Warm minimalist light mode designed for soft daylight focus.
                </p>
              </div>

              {/* Amber Theme */}
              <div 
                onClick={() => setCurrentTheme('amber')}
                className={`${styles.themeCard} ${currentTheme === 'amber' || currentTheme === 'amber-crt' ? styles.themeCardActive : ''}`}
              >
                <div className={`${styles.themePreviewBox} ${styles.themePreviewAmber}`}>
                  <div className={styles.themePreviewMiniHeader}>
                    <div className={styles.themePreviewMiniDots}>
                      <span className={styles.miniDot} />
                      <span className={styles.miniDot} />
                    </div>
                    <Zap className="w-3.5 h-3.5 opacity-80" />
                  </div>
                  <div className={styles.themePreviewMiniCard} style={{ backgroundColor: '#1c1917', color: '#f59e0b' }}>
                    Sprint Board
                  </div>
                </div>
                <div className={styles.themeCardTitleRow}>
                  <span className={styles.themeCardTitle}>Amber Charcoal</span>
                  {(currentTheme === 'amber' || currentTheme === 'amber-crt') && <Check className="w-4 h-4 text-amber-500" strokeWidth={2.5} />}
                </div>
                <p className={styles.themeCardDesc}>
                  Warm charcoal base with electric amber highlights.
                </p>
              </div>
            </div>

            {/* Density & Preferences */}
            <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <span className="text-xs font-bold block" style={{ color: 'var(--text-main)' }}>Display Density</span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Adjust row heights and card paddings.</span>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setDensity('comfortable')}
                  className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                  style={{
                    backgroundColor: density === 'comfortable' ? 'var(--bg-card)' : 'transparent',
                    color: 'var(--text-main)',
                    boxShadow: density === 'comfortable' ? 'var(--shadow-card)' : 'none',
                  }}
                >
                  Comfortable
                </button>
                <button
                  type="button"
                  onClick={() => setDensity('compact')}
                  className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                  style={{
                    backgroundColor: density === 'compact' ? 'var(--bg-card)' : 'transparent',
                    color: 'var(--text-main)',
                    boxShadow: density === 'compact' ? 'var(--shadow-card)' : 'none',
                  }}
                >
                  Compact
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Security & Active Sessions */}
        <section className={styles.cardSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <div className={styles.sectionIconPill}>
                <Key className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Security & Credentials</h2>
                <p className={styles.sectionSubtitle}>Manage password authentication and active device sessions.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
            {passwordSuccess && (
              <div className="p-3 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Password updated successfully!</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                {passwordError}
              </div>
            )}

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Lock className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Current Password
                  </span>
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Key className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    New Password
                  </span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={styles.input}
                />
              </div>

              <div className={`${styles.field} ${styles.formFieldFull}`}>
                <label className={styles.label}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Confirm New Password
                  </span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={styles.input}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={!newPassword || !confirmPassword} 
                className={styles.saveBtn}
              >
                <span>Update Password</span>
              </button>
            </div>
          </form>

          {/* Active Sessions */}
          <div className="pt-4 border-t flex flex-col gap-3" style={{ borderColor: 'var(--border-subtle)' }}>
            <label className={styles.label}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <Laptop className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                Active Device Sessions
              </span>
            </label>
            <div className={styles.sessionList}>
              <div className={styles.sessionItem}>
                <div className={styles.sessionLeft}>
                  <Laptop className="w-4 h-4" strokeWidth={1.75} style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <div className={styles.sessionTitle}>macOS Chrome • Current Web Session</div>
                    <div className={styles.sessionMeta}>Connected to Render PostgreSQL Database • Active now</div>
                  </div>
                </div>
                <span className={styles.activeSessionBadge}>
                  Active Now
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
