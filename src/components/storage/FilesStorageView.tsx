'use client';

import React, { useState, useMemo } from 'react';
import { 
  FolderLock, 
  UploadCloud, 
  File, 
  HardDrive, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Trash2, 
  Download, 
  Link as LinkIcon, 
  Search,
  Check
} from 'lucide-react';
import { FileItem } from '../../types';
import { useOptics } from '../../context/OpticsContext';
import { StorageSkeleton, EmptyState } from '../common/Skeleton';
import styles from './FilesStorageView.module.css';

interface FilesStorageViewProps {
  files: FileItem[];
  onOpenUpload: () => void;
  onDeleteFile?: (fileId: string) => void;
}

export const FilesStorageView: React.FC<FilesStorageViewProps> = ({
  files,
  onOpenUpload,
  onDeleteFile,
}) => {
  const { loading } = useOptics();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (loading && files.length === 0) {
    return <StorageSkeleton />;
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleCopyLink = (file: FileItem) => {
    navigator.clipboard.writeText(`https://r2.optics.ivors.in/attachments/${file.name}`);
    setCopiedId(file.id);
    showToast(`Copied secure signed URL for ${file.name}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (file: FileItem) => {
    showToast(`Downloading asset: ${file.name}`);
  };

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    const q = searchQuery.toLowerCase();
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.taskKey || f.issueKey || '').toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q)
    );
  }, [files, searchQuery]);

  return (
    <div className={styles.container}>
      {/* Toast Feedback */}
      {toastMessage && (
        <div className={styles.toast}>
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <div className={styles.headerTitleRow}>
            <FolderLock className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            <h1 className={styles.title}>Cloud File Attachments</h1>
          </div>
          <p className={styles.subtitle}>
            High-speed cloud asset storage for project files, images, videos, and specifications.
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files or tasks..."
              className={styles.searchInput}
            />
          </div>

          <button 
            type="button"
            onClick={onOpenUpload}
            className={styles.uploadBtn}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Storage Architecture Overview Banner */}
      <div className={styles.bannerGrid}>
        <div className={styles.bannerCard}>
          <Database className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
          <div>
            <div className={styles.bannerCardTitle}>Database Records</div>
            <div className={styles.bannerCardSub}>Metadata & relations</div>
          </div>
        </div>

        <div className={styles.bannerCard}>
          <HardDrive className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
          <div>
            <div className={styles.bannerCardTitle}>Object Storage</div>
            <div className={styles.bannerCardSub}>Encrypted binary assets</div>
          </div>
        </div>

        <div className={styles.bannerCard}>
          <ShieldCheck className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />
          <div>
            <div className={styles.bannerCardTitle}>Secure Signed URLs</div>
            <div className={styles.bannerCardSub}>Token authorization</div>
          </div>
        </div>
      </div>

      {/* Files Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>File Name</th>
              <th className={styles.th}>Linked Task</th>
              <th className={styles.th}>Size</th>
              <th className={styles.th}>Storage Provider</th>
              <th className={`${styles.th} text-center`}>Actions</th>
              <th className={`${styles.th} text-right`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8">
                  <EmptyState
                    icon={<UploadCloud className="w-6 h-6" strokeWidth={1.75} />}
                    title="No Files Uploaded"
                    description="Upload project binaries, architecture diagrams, design mockups, and issue logs."
                    actionText="Upload First File"
                    onAction={onOpenUpload}
                  />
                </td>
              </tr>
            ) : filteredFiles.length > 0 ? (
              filteredFiles.map((f) => (
                <tr key={f.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.fileNameCell}>
                      <File className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      <span className="font-semibold">{f.name}</span>
                    </div>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.keyBadge}>
                      {f.taskKey || f.issueKey}
                    </span>
                  </td>
                  <td className={styles.td} style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{f.size}</td>
                  <td className={styles.td} style={{ color: 'var(--text-muted)' }}>{f.storage}</td>
                  <td className={`${styles.td} text-center`}>
                    <div className={styles.actionBtnGroup}>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(f)}
                        className={styles.iconActionBtn}
                        title="Copy Signed Asset Link"
                      >
                        {copiedId === f.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(f)}
                        className={styles.iconActionBtn}
                        title="Download Asset"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteFile && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete file "${f.name}"?`)) {
                              onDeleteFile(f.id);
                              showToast(`Deleted ${f.name}`);
                            }
                          }}
                          className={styles.deleteActionBtn}
                          title="Delete File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className={`${styles.td} text-right`}>
                    <span className={styles.statusSynced}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Synced
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs italic" style={{ color: 'var(--text-muted)' }}>
                  No files matching &quot;{searchQuery}&quot;
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
