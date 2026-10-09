'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Activity, 
  Layers, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  FileText
} from 'lucide-react';
import { Project, ActivityLog } from '../../types';
import { useOptics } from '../../context/OpticsContext';
import { DashboardSkeleton, EmptyState } from '../common/Skeleton';
import { api } from '../../lib/api';
import styles from './DashboardView.module.css';

interface DashboardViewProps {
  projects: Project[];
  activities: ActivityLog[];
  onSelectProject: (p: Project) => void;
  onOpenCreateTask?: () => void;
  onOpenCreateIssue?: () => void;
  onNavigateToBoard?: (filter?: string) => void;
}

interface LiveMetrics {
  totalTasks: number;
  inProgress: number;
  done: number;
  urgent: number;
  assigned?: number;
}

interface ProjectStatItem {
  id: string;
  name: string;
  key: string;
  color?: string;
  description?: string;
  totalIssues: number;
  completedIssues: number;
  progressPercent: number;
}

const formatRelativeTime = (isoString?: string): string => {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 45) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 172800) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoString;
  }
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  activities,
  onSelectProject,
  onOpenCreateTask,
  onOpenCreateIssue,
  onNavigateToBoard,
}) => {
  const { 
    loading, 
    workspaceLoading, 
    boardLoading, 
    setIsCreateProjectOpen, 
    board, 
    activeWorkspace, 
    activeProject, 
    setActiveProject, 
    setCurrentTab 
  } = useOptics();

  const handleOpenCreate = onOpenCreateTask || onOpenCreateIssue;

  // Fallback instant computation from currently loaded board strictly for activeProject
  const activeBoardTasks = React.useMemo(() => {
    if (!board?.columns || !activeProject) return [];
    if (board.projectId && board.projectId !== activeProject.id) {
      return [];
    }
    return board.columns.flatMap((c) => c.tasks || c.issues || []);
  }, [board, activeProject]);

  const doneColumnIds = React.useMemo(() => {
    if (!board?.columns) return new Set<string>();
    return new Set(
      board.columns
        .filter((c) => {
          const n = c.name.toLowerCase();
          return n.includes('done') || n.includes('complete') || n.includes('closed') || n.includes('shipped') || n.includes('released');
        })
        .map((c) => c.id)
    );
  }, [board]);

  const inProgressColumnIds = React.useMemo(() => {
    if (!board?.columns) return new Set<string>();
    return new Set(
      board.columns
        .filter((c) => {
          const n = c.name.toLowerCase();
          return n.includes('progress') || n.includes('doing') || n.includes('wip') || n.includes('dev') || n.includes('review') || n.includes('testing') || n.includes('qa');
        })
        .map((c) => c.id)
    );
  }, [board]);

  const doneCount = activeBoardTasks.filter((t) => {
    if (t.columnId && doneColumnIds.has(t.columnId)) return true;
    const s = (t.status || '').toLowerCase();
    return s === 'done' || s === 'completed' || s === 'closed';
  }).length;

  const inProgressCount = activeBoardTasks.filter((t) => {
    if (t.columnId && inProgressColumnIds.has(t.columnId)) return true;
    const s = (t.status || '').toLowerCase();
    return s.includes('progress') || s === 'in_progress' || s === 'doing' || s === 'review';
  }).length;

  const urgentCount = activeBoardTasks.filter(
    (t) => t.priority === 'URGENT' || t.priority === 'HIGH'
  ).length;

  const totalTasks = activeBoardTasks.length;
  const progressPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  // Project-scoped Activity Stream (last 15 items)
  const projectActivities = React.useMemo(() => {
    if (!activeProject) return activities.slice(0, 15);
    const pKey = activeProject.key.toLowerCase();
    const pId = activeProject.id;
    const filtered = activities.filter((a) => {
      const taskKey = (a.metadata?.taskKey || a.metadata?.issueKey || '').toLowerCase();
      const matchKey = taskKey.startsWith(pKey + '-') || taskKey.includes(pKey);
      const matchId = a.metadata?.projectId === pId || (a as any).projectId === pId;
      return matchKey || matchId;
    });
    return (filtered.length > 0 ? filtered : activities).slice(0, 15);
  }, [activities, activeProject]);

  if (workspaceLoading || boardLoading || (loading && projects.length === 0)) {
    return <DashboardSkeleton />;
  }

  if (!activeProject && projects.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState
          icon={<Layers className="w-6 h-6" strokeWidth={1.75} />}
          title="No Active Projects"
          description="Create your first project in this workspace to track sprints, Kanban pipelines, and team velocity."
          actionText="Create New Project"
          onAction={() => setIsCreateProjectOpen(true)}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 1. Active Project Focused Header Banner */}
      <div className={styles.welcomeBanner}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={styles.bannerLabel}>
              {activeWorkspace?.name || 'Workspace'}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: 'var(--bg-badge)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
              {activeProject?.key || 'OPT'}
            </span>
          </div>
          <h1 className={styles.bannerTitle}>
            {activeProject?.name || 'Project Overview'}
          </h1>
          <p className={styles.bannerSubtitle}>
            {activeProject?.description || 'Active sprint trajectory, milestone completion, and velocity telemetry for this project.'}
          </p>
        </div>

        <div className={styles.bannerRight}>
          <button
            type="button"
            onClick={() => setCurrentTab('board')}
            className={styles.bannerSecondaryBtn}
            title="Open Sprint Kanban Board"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sprint Board</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('docs')}
            className={styles.bannerSecondaryBtn}
            title="Open Project Wiki Docs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Wiki Docs</span>
          </button>

          {handleOpenCreate && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className={styles.newTaskBtn}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Quick Project Switcher (if workspace has multiple projects) */}
      {projects.length > 1 && (
        <div className={styles.switcherBar}>
          <span className={styles.switcherLabel}>
            Switch Project:
          </span>
          {projects.map((p) => {
            const isSelected = activeProject?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProject(p)}
                className={`${styles.projectChip} ${isSelected ? styles.projectChipActive : ''}`}
              >
                <span className={`${styles.projectChipKey} ${isSelected ? styles.projectChipKeyActive : ''}`}>
                  {p.key}
                </span>
                <span>{p.name}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Project-Specific Telemetry Metrics */}
      <div>
        <div className={styles.sectionHeading}>
          <TrendingUp className="w-4 h-4" />
          <span>{activeProject?.key || 'Project'} Sprint Telemetry</span>
        </div>

        <div className={styles.metricsGrid}>
          <div 
            onClick={() => onNavigateToBoard && onNavigateToBoard('ALL')}
            className={styles.metricCard}
          >
            <div className={styles.metricCardHeader}>
              <span className={styles.metricCardLabel}>Total Tasks</span>
              <Layers className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className={styles.metricCardNumber}>{totalTasks}</div>
            <div className={styles.metricCardFooter}>
              <span>{activeProject?.name || 'Active Project'}</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateToBoard && onNavigateToBoard('IN_PROGRESS')}
            className={styles.metricCard}
          >
            <div className={styles.metricCardHeader}>
              <span className={styles.metricCardLabel}>In Progress</span>
              <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className={styles.metricCardNumber}>{inProgressCount}</div>
            <div className={styles.metricCardFooter}>
              <span>Active engineering flow</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateToBoard && onNavigateToBoard('DONE')}
            className={styles.metricCard}
          >
            <div className={styles.metricCardHeader}>
              <span className={styles.metricCardLabel}>Completed</span>
              <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className={styles.metricCardNumber}>{doneCount}</div>
            <div className={styles.metricCardFooter}>
              <span>{progressPct}% milestone progress</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </div>
          </div>

          <div 
            onClick={() => onNavigateToBoard && onNavigateToBoard('URGENT')}
            className={styles.metricCard}
          >
            <div className={styles.metricCardHeader}>
              <span className={styles.metricCardLabel}>High / Urgent Priority</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className={styles.metricCardNumber} style={{ color: urgentCount > 0 ? '#d97706' : 'inherit' }}>
              {urgentCount}
            </div>
            <div className={styles.metricCardFooter}>
              <span>Priority attention</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Column Pipeline Breakdown & Live Activity Stream */}
      <div className={styles.twoColumnGrid}>
        {/* Project Pipeline Breakdown */}
        <div className={styles.projectsCol}>
          <div className="text-xs font-bold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>Pipeline Breakdown</span>
            <span className="text-[11px] font-normal">{progressPct}% Delivered</span>
          </div>

          <div className={styles.projectCard} style={{ cursor: 'default' }}>
            <div className={styles.projectHeader}>
              <div className={styles.projectLeft}>
                <span className={styles.projectKey}>
                  {activeProject?.key || 'OPT'}
                </span>
                <div>
                  <h4 className={styles.projectName}>
                    {activeProject?.name || 'Project Execution'}
                  </h4>
                  <p className={styles.projectDesc}>
                    {doneCount} of {totalTasks} tasks completed across all columns
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={styles.projectPct}>{progressPct}%</span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className={styles.progressBarBg}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Column-by-Column Breakdown */}
            {board?.columns && board.columns.length > 0 && (
              <div className={styles.columnGrid}>
                {board.columns.map((col) => {
                  const count = (col.tasks || col.issues || []).length;
                  const colNameLower = col.name.toLowerCase();
                  const dotColor = colNameLower.includes('done') || colNameLower.includes('complete')
                    ? '#10b981'
                    : colNameLower.includes('progress') || colNameLower.includes('dev') || colNameLower.includes('wip')
                    ? '#f59e0b'
                    : colNameLower.includes('review') || colNameLower.includes('test')
                    ? '#8b5cf6'
                    : colNameLower.includes('todo')
                    ? '#3b82f6'
                    : '#94a3b8';

                  return (
                    <div 
                      key={col.id}
                      onClick={() => setCurrentTab('board')}
                      className={styles.columnCard}
                      title={`Open ${col.name} column in Sprint Board`}
                    >
                      <div className={styles.columnCardLeft}>
                        <span className={styles.columnDot} style={{ backgroundColor: dotColor }} />
                        <span className={styles.columnName}>{col.name}</span>
                      </div>
                      <span className={styles.columnCount}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Project Activity Stream */}
        <div className={styles.activityCol}>
          <div className="text-xs font-bold uppercase tracking-wider flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <span>{activeProject?.key || 'Project'} Activity Stream</span>
            </div>
            <span className="text-[10px] font-mono opacity-70">Last {Math.min(projectActivities.length, 15)}</span>
          </div>

          <div className={styles.activityBox}>
            {projectActivities.length === 0 ? (
              <div className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                No recent activity recorded for this project.
              </div>
            ) : (
              projectActivities.slice(0, 15).map((a) => (
                <div key={a.id} className={styles.activityItem}>
                  <div className={styles.activityAvatar}>
                    {a.user?.name ? a.user.name.charAt(0) : 'U'}
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityText}>
                      <span className="font-bold">{a.user?.name || 'User'}</span>{' '}
                      {a.action === 'MOVED_COLUMN' ? (
                        <>
                          moved <span className="font-mono font-bold">{a.metadata?.taskKey || a.metadata?.issueKey}</span> to {a.metadata?.toColumn}
                        </>
                      ) : a.action === 'UPDATED_PRIORITY' ? (
                        <>
                          set <span className="font-mono font-bold">{a.metadata?.taskKey || a.metadata?.issueKey}</span> to {a.metadata?.priority} priority
                        </>
                      ) : a.action === 'UPDATED_DOC' ? (
                        <>
                          updated doc <span className="font-semibold">{a.metadata?.docTitle}</span>
                        </>
                      ) : a.action === 'CREATED_TASK' ? (
                        <>
                          created task <span className="font-mono font-bold">{a.metadata?.taskKey || a.metadata?.issueKey}</span>
                        </>
                      ) : (
                        <>completed <span className="font-mono font-bold">{a.metadata?.taskKey || a.metadata?.issueKey}</span></>
                      )}
                    </p>
                    <span className={styles.activityTime}>{formatRelativeTime(a.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
