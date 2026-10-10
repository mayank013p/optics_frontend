'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useOptics } from '../../context/OpticsContext';
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
  const { workspaces, activeWorkspace, can } = useOptics();

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
          {/* Parent Workspace Selector */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Target Parent Workspace *</label>
            <select
              value={selectedWorkspaceId}
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
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Connexon Mobile, Optics Platform"
              className={styles.input}
              autoFocus
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Project Key (Prefix for Task IDs) *</label>
            <input
              type="text"
              required
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
                  onClick={() => setColor(c)}
                  className={`${styles.colorBtn} ${color === c ? styles.colorBtnActive : ''}`}
                  style={{ backgroundColor: c }}
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
              disabled={!name.trim() || !key.trim()}
              className={styles.submitBtn}
            >
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
