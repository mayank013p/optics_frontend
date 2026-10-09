'use client';

import React, { useState, useEffect } from 'react';
import { X, Sliders, AlignLeft, Palette, Type, Layers, Trash2, Check } from 'lucide-react';
import { Project } from '../../types';
import { useOptics } from '../../context/OpticsContext';
import styles from './CreateProjectModal.module.css';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const PRESET_COLORS = [
  '#007AFF', // Blue
  '#34C759', // Green
  '#FF9500', // Amber
  '#AF52DE', // Purple
  '#FF2D55', // Rose
  '#5856D6', // Indigo
  '#64748B', // Slate
];

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const { workspaces, handleUpdateProject, activeWorkspace } = useOptics();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#007AFF');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setColor(project.color || '#007AFF');
      setSelectedWorkspaceId(project.workspaceId || activeWorkspace?.id || '');
    }
  }, [project, activeWorkspace, isOpen]);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await handleUpdateProject(project.id, {
        name: name.trim(),
        description: description.trim(),
        color,
        workspaceId: selectedWorkspaceId || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Failed to update project:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderTitle}>
            <div 
              className={styles.modalIconBox} 
              style={{ backgroundColor: `${color}20`, color: color }}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className={styles.modalTitle}>Project Settings</h2>
              <span className={styles.modalSubtitle}>Edit details and workspace assignment</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className={styles.modalCloseBtn}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* Project Name */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <Type className="w-3.5 h-3.5 text-muted" />
              <span>Project Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="e.g. Core Engine"
            />
          </div>

          {/* Project Key (Read-only identifier) */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <span>Project Key (Identifier)</span>
            </label>
            <input
              type="text"
              disabled
              value={project.key}
              className={styles.input}
              style={{ opacity: 0.6, cursor: 'not-allowed', fontFamily: 'var(--font-mono)' }}
            />
          </div>

          {/* Assigned Workspace (Allows Moving Project Between Workspaces) */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <Layers className="w-3.5 h-3.5 text-muted" />
              <span>Assigned Workspace</span>
            </label>
            <select
              value={selectedWorkspaceId}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className={styles.input}
              style={{ cursor: 'pointer' }}
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name} ({ws.slug || 'primary'})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-muted mt-1">
              Select a different workspace to reassign and move this project.
            </span>
          </div>

          {/* Description */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <AlignLeft className="w-3.5 h-3.5 text-muted" />
              <span>Description</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              placeholder="Primary deliverables and technical scope..."
            />
          </div>

          {/* Brand Color */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <Palette className="w-3.5 h-3.5 text-muted" />
              <span>Theme Accent Color</span>
            </label>
            <div className={styles.colorPickerRow}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`${styles.colorChip} ${color === c ? styles.colorChipActive : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className={styles.submitBtn}
            >
              <span>{isSubmitting ? 'Saving...' : 'Save Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
