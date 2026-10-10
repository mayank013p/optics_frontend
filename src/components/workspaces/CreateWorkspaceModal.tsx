'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useOptics } from '../../context/OpticsContext';
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
  const { can, isAdmin } = useOptics();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen || (!isAdmin && !can('workspace.create'))) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          <div className={styles.infoBanner}>
            <span>
              A <strong>Workspace</strong> is the top-level parent container for your projects, sprint boards, teams, and documentation.
            </span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Workspace Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Core Products, Growth & Mobile, Client Services"
              className={styles.input}
              autoFocus
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Workspace Purpose / Description</label>
            <textarea
              rows={2}
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
              disabled={!name.trim()}
              className={styles.submitBtn}
            >
              <span>Create Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
