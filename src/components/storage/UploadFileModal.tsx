'use client';

import React, { useState } from 'react';
import { X, UploadCloud, File, FileText, Paperclip } from 'lucide-react';
import styles from './UploadFileModal.module.css';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadFile: (file: { name: string; size: string; type: string; taskKey?: string; issueKey: string }) => void;
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
  onUploadFile,
}) => {
  const [fileName, setFileName] = useState('');
  const [taskKey, setTaskKey] = useState('OPT-1');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    setIsUploading(true);
    setTimeout(() => {
      onUploadFile({
        name: fileName,
        size: '2.4 MB',
        type: 'Attachment Asset',
        taskKey: taskKey.toUpperCase().trim(),
        issueKey: taskKey.toUpperCase().trim(),
      });
      setIsUploading(false);
      setFileName('');
      onClose();
    }, 600);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderTitle}>
            <UploadCloud className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
            <span>Upload Cloud Attachment</span>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <FileText className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                Linked Task Key
              </span>
            </label>
            <input
              type="text"
              required
              value={taskKey}
              onChange={(e) => setTaskKey(e.target.value.toUpperCase())}
              placeholder="e.g. OPT-2"
              className={styles.input}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <Paperclip className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                Choose File / Dropzone
              </span>
            </label>
            <label className={styles.dropzone}>
              <File className="w-6 h-6" style={{ color: 'var(--accent-amber)' }} />
              <span className={styles.dropzoneText}>
                {fileName || 'Click to browse files (PDF, PNG, ZIP, Video)'}
              </span>
              <span className={styles.dropzoneSub}>
                Offloaded automatically to Cloudflare R2 / S3 Storage
              </span>
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !fileName}
              className={styles.submitBtn}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading to R2...' : 'Upload Attachment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
