'use client';

import React, { useState } from 'react';
import { X, Layers, Type, AlignLeft, Building, AlertTriangle, Sparkles } from 'lucide-react';
import { useOptics } from '../../context/OpticsContext';
import { FREE_PLAN_LIMITS } from '../../lib/planLimits';
import styles from './CreateWorkspaceModal.module.css';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWorkspace: (data: { name: string; description?: string }) => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onCreateWorkspace,
}) => {
  const { can, isAdmin, workspaces, setCurrentTab } = useOptics();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen || (!isAdmin && !can('workspace.create'))) return null;

  const isLimitReached = workspaces.length >= FREE_PLAN_LIMITS.maxWorkspaces;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) return;
    if (!name.trim()) return;

    onCreateWorkspace({
      name: name.trim(),
      description: description.trim() || undefined,
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderTitle}>
            <span>Create Workspace</span>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {isLimitReached ? (
            <div
              className="p-3.5 rounded-xl border flex flex-col gap-2.5"
              style={{
                backgroundColor: 'rgba(180, 83, 9, 0.06)',
                borderColor: 'rgba(180, 83, 9, 0.2)',
                color: 'var(--text-main)',
              }}
            >
              <div className="flex items-center gap-2 font-bold text-xs" style={{ color: 'var(--accent-amber, #b45309)' }}>
                <span>Free Plan Workspace Limit Reached (1/1)</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                The <strong>Free Plan</strong> is limited to <strong>1 Workspace</strong> with unlimited team members and up to 5 projects. Upgrade to Optics Pro to unlock unlimited workspaces, cross-workspace reporting, and advanced multi-tenancy.
              </p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    window.location.href = '/pricing';
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                  style={{
                    backgroundColor: 'var(--accent-amber, #b45309)',
                    color: '#ffffff',
                    border: 'none',
                  }}
                >
                  <Sparkles className="w-3 h-3 inline" />
                  <span>View Pro Plans</span>
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.infoBanner}>
              <span>
                A <strong>Workspace</strong> is the top-level parent container for your projects, sprint boards, teams, and documentation.
              </span>
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Workspace Name *</label>
            <input
              type="text"
              required
              disabled={isLimitReached}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Core Products, Growth & Mobile, Client Services"
              className={styles.input}
              autoFocus={!isLimitReached}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Workspace Purpose / Description</label>
            <textarea
              rows={2}
              disabled={isLimitReached}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope of projects, engineering objectives, or departments contained..."
              className={styles.textarea}
              style={{ resize: 'none' }}
            />
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLimitReached || !name.trim()}
              className={styles.submitBtn}
              style={{
                opacity: isLimitReached ? 0.6 : 1,
                cursor: isLimitReached ? 'not-allowed' : 'pointer',
              }}
            >
              <span>{isLimitReached ? 'Limit Reached (1/1)' : 'Create Workspace'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
