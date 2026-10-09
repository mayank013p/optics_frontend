'use client';

import React, { useState } from 'react';
import { X, FileText, Plus, BookOpen, Layers, Type, Layout, AlertCircle, Sparkles } from 'lucide-react';
import { useOptics } from '../../context/OpticsContext';
import { checkDocLimit, FREE_PLAN_LIMITS } from '../../lib/planLimits';
import styles from './CreateDocModal.module.css';

interface CreateDocModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateDoc: (title: string, templateType: string) => void;
}

export const CreateDocModal: React.FC<CreateDocModalProps> = ({
  isOpen,
  onClose,
  onCreateDoc,
}) => {
  const { can, documents } = useOptics();
  const [title, setTitle] = useState('');
  const [template, setTemplate] = useState('specs');

  const docLimit = checkDocLimit(documents.length);

  if (!isOpen || !can('doc.create')) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !docLimit.allowed) return;
    onCreateDoc(title.trim(), template);
    setTitle('');
    onClose();
  };

  const templates = [
    { id: 'specs', label: 'Technical Spec / PRD', icon: Layers },
    { id: 'notes', label: 'Sprint & Meeting Notes', icon: BookOpen },
    { id: 'blank', label: 'Empty Document', icon: FileText },
  ];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderTitle}>
            <span>Create Wiki Document</span>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!docLimit.allowed && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.625rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#dc2626',
              fontSize: '0.75rem',
              lineHeight: 1.45,
            }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.125rem' }}>Free Plan Limit Reached</div>
                <div>{docLimit.message}</div>
              </div>
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Document Title *</label>
            <input
              type="text"
              required
              disabled={!docLimit.allowed}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Architecture RFC & API Schemas"
              className={styles.input}
              autoFocus
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Starter Template & Structure</label>
            <div className={styles.templateList}>
              {templates.map((t) => {
                const Icon = t.icon;
                const isSelected = template === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    disabled={!docLimit.allowed}
                    onClick={() => setTemplate(t.id)}
                    className={`${styles.templateOption} ${isSelected ? styles.templateOptionSelected : ''}`}
                  >
                    <Icon className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!docLimit.allowed} 
              className={styles.submitBtn}
              style={{
                opacity: !docLimit.allowed ? 0.5 : 1,
                cursor: !docLimit.allowed ? 'not-allowed' : 'pointer'
              }}
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span>Create Document</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
