'use client';

import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '16px',
  borderRadius,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: borderRadius !== undefined ? (typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius) : undefined,
        ...style,
      }}
    />
  );
};

export const BoardSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonContainer}>
      {/* Board Header Skeleton */}
      <div className={styles.boardSkeletonHeader}>
        <div className="flex items-center gap-3">
          <Skeleton width={36} height={36} borderRadius="10px" />
          <div className="flex flex-col gap-1.5">
            <Skeleton width={180} height={18} borderRadius="6px" />
            <Skeleton width={120} height={12} borderRadius="4px" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton width={80} height={30} borderRadius="8px" />
          <Skeleton width={80} height={30} borderRadius="8px" />
          <Skeleton width={100} height={30} borderRadius="8px" />
        </div>
      </div>

      {/* Columns Skeleton */}
      <div className={styles.boardSkeletonColumns}>
        {[1, 2, 3, 4].map((colIndex) => (
          <div key={colIndex} className={styles.boardSkeletonCol}>
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/40">
              <div className="flex items-center gap-2">
                <Skeleton width={14} height={14} borderRadius="9999px" />
                <Skeleton width={90} height={14} borderRadius="4px" />
                <Skeleton width={20} height={16} borderRadius="4px" />
              </div>
              <Skeleton width={20} height={20} borderRadius="6px" />
            </div>

            {/* Column Task Cards */}
            {[1, 2, 3].map((cardIndex) => (
              <div key={cardIndex} className={styles.boardSkeletonCard}>
                <div className="flex items-center justify-between">
                  <Skeleton width={50} height={14} borderRadius="4px" />
                  <Skeleton width={60} height={14} borderRadius="9999px" />
                </div>
                <Skeleton width="90%" height={16} borderRadius="4px" />
                <Skeleton width="60%" height={12} borderRadius="4px" />
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/30">
                  <Skeleton width={40} height={14} borderRadius="4px" />
                  <Skeleton width={20} height={20} borderRadius="9999px" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonContainer}>
      {/* Workspace Banner Skeleton */}
      <div className={styles.dashboardSkeletonBanner}>
        <div className="flex flex-col gap-2">
          <Skeleton width={120} height={12} borderRadius="4px" />
          <Skeleton width={260} height={24} borderRadius="6px" />
          <Skeleton width={380} height={14} borderRadius="4px" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton width={110} height={40} borderRadius="10px" />
          <Skeleton width={120} height={40} borderRadius="10px" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.dashboardSkeletonGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.dashboardSkeletonCard}>
            <div className="flex items-center justify-between">
              <Skeleton width={80} height={12} borderRadius="4px" />
              <Skeleton width={28} height={28} borderRadius="8px" />
            </div>
            <Skeleton width={60} height={28} borderRadius="6px" />
            <Skeleton width={100} height={10} borderRadius="4px" />
          </div>
        ))}
      </div>

      {/* Split: Active Projects & Activity Feed */}
      <div className={styles.dashboardSkeletonSplit}>
        <div className={styles.tableSkeletonCard}>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
            <Skeleton width={140} height={18} borderRadius="6px" />
            <Skeleton width={60} height={14} borderRadius="4px" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/30">
              <div className="flex items-center gap-3">
                <Skeleton width={36} height={36} borderRadius="10px" />
                <div className="flex flex-col gap-1">
                  <Skeleton width={120} height={14} borderRadius="4px" />
                  <Skeleton width={80} height={10} borderRadius="4px" />
                </div>
              </div>
              <Skeleton width={70} height={20} borderRadius="9999px" />
            </div>
          ))}
        </div>

        <div className={styles.tableSkeletonCard}>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
            <Skeleton width={120} height={18} borderRadius="6px" />
            <Skeleton width={40} height={14} borderRadius="4px" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-zinc-800/20">
              <Skeleton width={24} height={24} borderRadius="9999px" />
              <div className="flex flex-col gap-1 flex-1">
                <Skeleton width="85%" height={12} borderRadius="4px" />
                <Skeleton width="40%" height={10} borderRadius="4px" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DocsSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.docsSkeletonLayout}>
        {/* Left Docs List Sidebar */}
        <div className={styles.docsSkeletonSidebar}>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
            <Skeleton width={90} height={16} borderRadius="6px" />
            <Skeleton width={28} height={28} borderRadius="6px" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg">
              <Skeleton width={16} height={16} borderRadius="4px" />
              <Skeleton width="75%" height={14} borderRadius="4px" />
            </div>
          ))}
        </div>

        {/* Document Content Canvas */}
        <div className={styles.docsSkeletonEditor}>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800/40">
            <div className="flex flex-col gap-2 flex-1">
              <Skeleton width="50%" height={28} borderRadius="6px" />
              <Skeleton width="25%" height={12} borderRadius="4px" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton width={70} height={32} borderRadius="8px" />
              <Skeleton width={32} height={32} borderRadius="8px" />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Skeleton width="90%" height={16} borderRadius="4px" />
            <Skeleton width="95%" height={16} borderRadius="4px" />
            <Skeleton width="80%" height={16} borderRadius="4px" />
            <div className="h-4" />
            <Skeleton width="40%" height={20} borderRadius="6px" />
            <Skeleton width="85%" height={14} borderRadius="4px" />
            <Skeleton width="88%" height={14} borderRadius="4px" />
            <Skeleton width="70%" height={14} borderRadius="4px" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const StorageSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonContainer}>
      {/* Top Quota Box */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div className="flex flex-col gap-2 flex-1 max-w-md">
          <div className="flex items-center justify-between">
            <Skeleton width={120} height={14} borderRadius="4px" />
            <Skeleton width={80} height={12} borderRadius="4px" />
          </div>
          <Skeleton width="100%" height={8} borderRadius="9999px" />
        </div>
        <Skeleton width={120} height={36} borderRadius="10px" />
      </div>

      {/* Files Table Skeleton */}
      <div className={styles.tableSkeletonCard}>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
          <Skeleton width={160} height={18} borderRadius="6px" />
          <Skeleton width={180} height={32} borderRadius="8px" />
        </div>

        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.tableSkeletonRow}>
            <div className="flex items-center gap-3">
              <Skeleton width={32} height={32} borderRadius="8px" />
              <div className="flex flex-col gap-1">
                <Skeleton width={160} height={14} borderRadius="4px" />
                <Skeleton width={80} height={10} borderRadius="4px" />
              </div>
            </div>
            <Skeleton width={60} height={14} borderRadius="4px" />
            <Skeleton width={80} height={14} borderRadius="4px" />
            <Skeleton width={60} height={20} borderRadius="9999px" />
            <Skeleton width={28} height={28} borderRadius="6px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const TeamsSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonContainer}>
      {/* Teams Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div className="flex flex-col gap-1">
          <Skeleton width={180} height={20} borderRadius="6px" />
          <Skeleton width={240} height={12} borderRadius="4px" />
        </div>
        <Skeleton width={130} height={36} borderRadius="10px" />
      </div>

      {/* Members Table */}
      <div className={styles.tableSkeletonCard}>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
          <Skeleton width={140} height={18} borderRadius="6px" />
          <Skeleton width={200} height={32} borderRadius="8px" />
        </div>

        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.tableSkeletonRow}>
            <div className="flex items-center gap-3">
              <Skeleton width={36} height={36} borderRadius="9999px" />
              <div className="flex flex-col gap-1">
                <Skeleton width={130} height={14} borderRadius="4px" />
                <Skeleton width={180} height={12} borderRadius="4px" />
              </div>
            </div>
            <Skeleton width={80} height={22} borderRadius="9999px" />
            <Skeleton width={100} height={14} borderRadius="4px" />
            <Skeleton width={80} height={28} borderRadius="8px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonContainer} style={{ maxWidth: '960px', margin: '0 auto', overflowY: 'auto' }}>
      {/* Profile Header Card */}
      <div className="flex items-center gap-5 p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <Skeleton width={64} height={64} borderRadius="9999px" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton width={200} height={22} borderRadius="6px" />
          <Skeleton width={160} height={14} borderRadius="4px" />
          <div className="flex items-center gap-2 mt-1">
            <Skeleton width={110} height={20} borderRadius="9999px" />
            <Skeleton width={130} height={20} borderRadius="9999px" />
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col gap-5">
        <Skeleton width={160} height={18} borderRadius="6px" />
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Skeleton width={80} height={12} borderRadius="4px" />
            <Skeleton width="100%" height={38} borderRadius="8px" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton width={80} height={12} borderRadius="4px" />
            <Skeleton width="100%" height={38} borderRadius="8px" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton width={60} height={12} borderRadius="4px" />
          <Skeleton width="100%" height={80} borderRadius="8px" />
        </div>
      </div>

      {/* Theme Card */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col gap-4">
        <Skeleton width={180} height={18} borderRadius="6px" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton width="100%" height={90} borderRadius="12px" />
          <Skeleton width="100%" height={90} borderRadius="12px" />
          <Skeleton width="100%" height={90} borderRadius="12px" />
        </div>
      </div>
    </div>
  );
};

export const WorkspacesSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <Skeleton width={40} height={40} borderRadius="10px" />
          <div className="flex flex-col gap-1.5">
            <Skeleton width={180} height={20} borderRadius="6px" />
            <Skeleton width={260} height={12} borderRadius="4px" />
          </div>
        </div>
        <Skeleton width={130} height={36} borderRadius="9999px" />
      </div>

      <div className={styles.tableSkeletonCard}>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
          <Skeleton width={160} height={18} borderRadius="6px" />
          <Skeleton width={220} height={14} borderRadius="4px" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.tableSkeletonRow}>
            <div className="flex items-center gap-3">
              <Skeleton width={32} height={32} borderRadius="8px" />
              <div className="flex flex-col gap-1">
                <Skeleton width={140} height={14} borderRadius="4px" />
                <Skeleton width={80} height={10} borderRadius="4px" />
              </div>
            </div>
            <Skeleton width={70} height={16} borderRadius="4px" />
            <Skeleton width={120} height={20} borderRadius="9999px" />
            <Skeleton width={70} height={22} borderRadius="9999px" />
            <Skeleton width={60} height={24} borderRadius="6px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const RBACSkeleton: React.FC = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
        <div className="flex flex-col gap-1.5">
          <Skeleton width={260} height={20} borderRadius="6px" />
          <Skeleton width={320} height={12} borderRadius="4px" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton width={110} height={34} borderRadius="9999px" />
          <Skeleton width={110} height={34} borderRadius="9999px" />
          <Skeleton width={130} height={34} borderRadius="9999px" />
        </div>
      </div>

      <div className={styles.tableSkeletonCard}>
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/40">
          <Skeleton width={180} height={18} borderRadius="6px" />
          <div className="flex gap-4">
            <Skeleton width={70} height={14} borderRadius="4px" />
            <Skeleton width={70} height={14} borderRadius="4px" />
            <Skeleton width={70} height={14} borderRadius="4px" />
          </div>
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={styles.tableSkeletonRow}>
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton width="60%" height={14} borderRadius="4px" />
              <Skeleton width="30%" height={10} borderRadius="4px" />
            </div>
            <Skeleton width={60} height={20} borderRadius="9999px" />
            <Skeleton width={28} height={28} borderRadius="9999px" />
            <Skeleton width={28} height={28} borderRadius="9999px" />
            <Skeleton width={28} height={28} borderRadius="9999px" />
            <Skeleton width={28} height={28} borderRadius="9999px" />
          </div>
        ))}
      </div>
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-[var(--text-main)] mb-1">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-5">
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-[var(--accent-primary)] text-[var(--text-on-accent)] hover:opacity-90 shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
