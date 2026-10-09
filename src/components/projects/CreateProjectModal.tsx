'use client';

import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Key, AlignLeft, Palette, Type, Layers, AlertTriangle, Sparkles } from 'lucide-react';
import { useOptics } from '../../context/OpticsContext';
import { FREE_PLAN_LIMITS } from '../../lib/planLimits';
import styles from './CreateProjectModal.module.css';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (p: { name: string; key: string; description: string; color: string; workspaceId?: string }) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const { workspaces, activeWorkspace, projects, can } = useOptics();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#007AFF');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(activeWorkspace?.id || '');

  useEffect(() => {
    if (activeWorkspace?.id) {
      setSelectedWorkspaceId(activeWorkspace.id);
    } else if (workspaces && workspaces.length > 0) {
      setSelectedWorkspaceId(workspaces[0].id);
    }
  }, [activeWorkspace, workspaces, isOpen]);

  if (!isOpen || !can('project.create')) return null;

  const currentProjectCount = projects.length;
  const isLimitReached = currentProjectCount >= FREE_PLAN_LIMITS.maxTotalProjects;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!key || key.length <= 4) {
      const generated = val
        .replace(/[^a-zA-Z]/g, '')
        .substring(0, 3)
        .toUpperCase();
      setKey(generated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) return;
    if (!name.trim() || !key.trim()) return;

    onCreateProject({
      name: name.trim(),
      key: key.toUpperCase().trim(),
      description: description.trim(),
      color,
      workspaceId: selectedWorkspaceId || undefined,
    });

    setName('');
    setKey('');
    setDescription('');
    onClose();
  };

  const colors = ['#007AFF', '#FF9500', '#34C759', '#FF2D55', '#AF52DE', '#5856D6', '#f59e0b', '#10b981'];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderTitle}>
            <span>Create Project</span>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {isLimitReached && (
            <div
              className="p-3.5 rounded-xl border flex flex-col gap-2.5"
              style={{
                backgroundColor: 'rgba(180, 83, 9, 0.06)',
                borderColor: 'rgba(180, 83, 9, 0.2)',
                color: 'var(--text-main)',
              }}
            >
              <div className="flex items-center gap-2 font-bold text-xs" style={{ color: 'var(--accent-amber, #b45309)' }}>
                <span>Free Plan Project Limit Reached ({currentProjectCount}/{FREE_PLAN_LIMITS.maxTotalProjects})</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                The <strong>Free Plan</strong> allows up to <strong>5 Projects</strong> per workspace. Upgrade to Optics Pro to unlock unlimited projects, cross-project views, and extended history.
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
                  <span>Upgrade to Pro</span>
                </button>
              </div>
            </div>
          )}

          {/* Parent Workspace Selector */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Target Parent Workspace *</label>
            <select
              value={selectedWorkspaceId}
              disabled={isLimitReached}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className={styles.select}
              required
            >
              {workspaces && workspaces.length > 0 ? (
                workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name} ({ws.slug})
                  </option>
                ))
              ) : (
                <option value="">Primary Workspace</option>
              )}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Project Name *</label>
            <input
              type="text"
              required
              disabled={isLimitReached}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Connexon Mobile, Optics Platform"
              className={styles.input}
              autoFocus={!isLimitReached}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Project Key (Prefix for Task IDs) *</label>
            <input
              type="text"
              required
              disabled={isLimitReached}
              maxLength={6}
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              placeholder="e.g. CNX, OPT"
              className={styles.input}
              style={{ fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.05em' }}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Description</label>
            <textarea
              rows={2}
              disabled={isLimitReached}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Primary engineering scope, release goals..."
              className={styles.textarea}
              style={{ resize: 'none' }}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Accent Color</label>
            <div className={styles.colorPickerGroup}>
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={isLimitReached}
                  onClick={() => setColor(c)}
                  className={`${styles.colorBtn} ${color === c ? styles.colorBtnActive : ''}`}
                  style={{ backgroundColor: c, opacity: isLimitReached ? 0.5 : 1 }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLimitReached || !name.trim() || !key.trim()}
              className={styles.submitBtn}
              style={{
                opacity: isLimitReached ? 0.6 : 1,
                cursor: isLimitReached ? 'not-allowed' : 'pointer',
              }}
            >
              <span>{isLimitReached ? `Limit Reached (${currentProjectCount}/${FREE_PLAN_LIMITS.maxTotalProjects})` : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
