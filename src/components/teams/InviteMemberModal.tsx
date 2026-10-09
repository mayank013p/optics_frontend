'use client';

import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  User, 
  Mail, 
  Shield, 
  Briefcase, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useOptics } from '../../context/OpticsContext';
import styles from './InviteMemberModal.module.css';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (member: { name: string; email: string; role: string; team: string; workspaceId?: string }) => Promise<any> | void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  onInvite,
}) => {
  const { activeWorkspace, teams, isAdmin, can } = useOptics();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer');
  const [team, setTeam] = useState(teams[0]?.name || 'Core Platform');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{
    inviteUrl?: string;
    emailSent?: boolean;
    message?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || (!isAdmin && !can('user.invite'))) return null;

  const handleClose = () => {
    setName('');
    setEmail('');
    setError(null);
    setInviteResult(null);
    setCopied(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await onInvite({
        name: name.trim(),
        email: email.trim(),
        role,
        team,
        workspaceId: activeWorkspace?.id,
      });

      if (res?.inviteUrl || res?.message) {
        setInviteResult({
          inviteUrl: res.inviteUrl,
          emailSent: res.emailSent,
          message: res.message,
        });
      } else {
        handleClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (inviteResult?.inviteUrl) {
      navigator.clipboard.writeText(inviteResult.inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderTitle}>
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </div>
          <button onClick={handleClose} className={styles.closeBtn} aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        {inviteResult ? (
          <div className={styles.successView}>
            <div className={styles.successIconWrapper}>
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className={styles.successTitle}>
              Invitation Created Successfully!
            </h3>
            <p className={styles.successDescription}>
              {inviteResult.emailSent
                ? `An official invitation email has been sent to ${email}.`
                : `Member added to workspace. You can also share the direct link below:`}
            </p>

            {inviteResult.inviteUrl && (
              <div className={styles.linkSection}>
                <span className={styles.linkLabel}>
                  Direct Invitation Link:
                </span>
                <div className={styles.linkInputWrapper}>
                  <input
                    type="text"
                    readOnly
                    value={inviteResult.inviteUrl}
                    className={styles.linkInput}
                  />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={styles.copyButton}
                    title="Copy direct invitation link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleClose}
              className={styles.doneButton}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.infoBanner}>
              <Layers className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              <span>
                Member will be added to workspace: <strong>{activeWorkspace?.name || 'Primary Workspace'}</strong>
              </span>
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <User className="w-3.5 h-3.5 text-dim" />
                  Full Name *
                </span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Elena Rostova"
                className={styles.input}
                autoFocus
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Mail className="w-3.5 h-3.5 text-dim" />
                  Work Email Address *
                </span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="elena@ivors.in"
                className={styles.input}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div className={styles.grid2}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Shield className="w-3.5 h-3.5 text-dim" />
                    RBAC Role
                  </span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={styles.select}
                >
                  <option value="Workspace Admin">Workspace Admin</option>
                  <option value="Project Lead">Project Lead</option>
                  <option value="Developer">Developer</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Briefcase className="w-3.5 h-3.5 text-dim" />
                    Team Group
                  </span>
                </label>
                <select
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className={styles.select}
                >
                  {teams.length > 0 ? (
                    teams.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))
                  ) : (
                    <>
                      <option value="Core Platform">Core Platform</option>
                      <option value="Product & Design">Product & Design</option>
                      <option value="Mobile & AI">Mobile & AI</option>
                      <option value="QA & Testing">QA & Testing</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className={styles.footer}>
              <button type="button" onClick={handleClose} className={styles.cancelBtn}>
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className={styles.submitBtn}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{loading ? 'Sending Invite...' : 'Send Invitation'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
