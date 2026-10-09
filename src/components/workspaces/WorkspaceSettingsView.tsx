'use client';

import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Type, 
  Key, 
  AlignLeft, 
  Save, 
  Plus, 
  Trash2, 
  ShieldAlert, 
  Check, 
  Copy,
  AlertTriangle,
  FolderKanban,
  Users
} from 'lucide-react';
import { useOptics } from '../../context/OpticsContext';
import { WorkspacesSkeleton } from '../common/Skeleton';
import styles from './WorkspaceSettingsView.module.css';

export const WorkspaceSettingsView: React.FC = () => {
  const { 
    workspaces, 
    activeWorkspace, 
    setActiveWorkspace,
    projects,
    handleUpdateWorkspace,
    handleDeleteWorkspace,
    setIsCreateWorkspaceOpen,
    isAdmin,
    loading,
    authLoading
  } = useOptics();

  const [name, setName] = useState(activeWorkspace?.name || 'Primary Workspace');
  const [description, setDescription] = useState(
    'Core software engineering initiatives, sprint cycles, and release deliverables.'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !activeWorkspace || !name.trim()) return;

    await handleUpdateWorkspace(activeWorkspace.id, name.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleCopySlug = () => {
    const slug = activeWorkspace?.slug || 'primary';
    navigator.clipboard.writeText(slug);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  // Projects count for a workspace
  const getProjectsCount = (wsId: string, wsSlug: string) => {
    return projects.filter(
      (p) => p.workspaceId === wsId || (!p.workspaceId && wsSlug === 'primary')
    ).length;
  };

  const activeProjectsCount = activeWorkspace
    ? getProjectsCount(activeWorkspace.id, activeWorkspace.slug)
    : 0;

  if (authLoading || (loading && workspaces.length === 0)) {
    return <WorkspacesSkeleton />;
  }

  return (
    <div className={styles.container}>
      {/* 1. Page Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.workspaceIcon}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>Workspace Settings</h1>
              <span className={styles.countBadge}>
                {workspaces.length} {workspaces.length === 1 ? 'Workspace' : 'Workspaces'}
              </span>
              {!isAdmin && (
                <span className={styles.roleTag}>
                  Read-Only
                </span>
              )}
            </div>
            <p className={styles.subtitle}>
              Manage workspace configuration, identifiers, and multi-tenant spaces.
            </p>
          </div>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsCreateWorkspaceOpen(true)}
            className={styles.createBtn}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Workspace</span>
          </button>
        )}
      </div>

      {/* 2. Active Workspace Profile & Configuration */}
      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <div className={styles.profileMeta}>
            <div className={styles.profileAvatar}>
              {(activeWorkspace?.name || 'W').charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={styles.settingsTitle}>
                  {activeWorkspace?.name || 'Primary Workspace'}
                </h2>
                <span className={styles.activePill}>
                  <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                  Active Space
                </span>
              </div>
              <p className={styles.settingsSubtitle}>
                Slug: <code className={styles.codeSnippet}>{activeWorkspace?.slug || 'primary'}</code>
              </p>
            </div>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <div className={styles.metricIconWrap}>
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <div className={styles.metricValue}>{activeProjectsCount}</div>
              <div className={styles.metricLabel}>Attached Projects</div>
            </div>
          </div>

          <div className={styles.metricItem}>
            <div className={styles.metricIconWrap}>
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className={styles.metricValue}>
                {activeWorkspace?._count?.members ?? 'All'}
              </div>
              <div className={styles.metricLabel}>Assigned Members</div>
            </div>
          </div>

          <div className={styles.metricItem}>
            <div className={styles.metricIconWrap}>
              <Key className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs font-semibold truncate">
                  /{activeWorkspace?.slug || 'primary'}
                </span>
                <button
                  type="button"
                  onClick={handleCopySlug}
                  className={styles.copyBtn}
                  title="Copy workspace slug"
                >
                  {copiedSlug ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className={styles.metricLabel}>URL Namespace</div>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className={styles.readOnlyNotice}>
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-muted" />
            <span>Workspace settings can only be modified by Organization Owners & Admins.</span>
          </div>
        )}

        <form onSubmit={handleSave} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <Type className="w-3.5 h-3.5 text-dim" />
                Workspace Display Name
              </span>
            </label>
            <input
              type="text"
              required
              disabled={!isAdmin}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${styles.input} ${!isAdmin ? styles.inputDisabled : ''}`}
              placeholder="e.g. Core Engineering & Infrastructure"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <Key className="w-3.5 h-3.5 text-dim" />
                Workspace Identifier (Slug)
              </span>
            </label>
            <input
              type="text"
              disabled
              value={activeWorkspace?.slug || 'primary'}
              className={`${styles.input} ${styles.inputDisabled}`}
            />
            <span className={styles.helperText}>
              Slugs identify your workspace in workspace switcher queries and cannot be modified after creation.
            </span>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <AlignLeft className="w-3.5 h-3.5 text-dim" />
                Workspace Scope & Description
              </span>
            </label>
            <textarea
              rows={3}
              disabled={!isAdmin}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${styles.textarea} ${!isAdmin ? styles.inputDisabled : ''}`}
              placeholder="Provide context on the engineering teams, sprint cadences, and milestones handled in this space..."
            />
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between pt-2">
              {saveSuccess ? (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Workspace settings updated successfully
                </span>
              ) : <span />}

              <button type="submit" className={styles.saveBtn}>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {/* 3. Workspaces Directory (Clean Multi-Workspace Switcher) */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderTitle}>
            <Layers className="w-4 h-4 text-muted" />
            <span>Organization Workspaces</span>
          </div>
          <span className="text-xs text-muted">
            Switch between workspaces or manage tenant spaces
          </span>
        </div>

        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Workspace</th>
              <th className={styles.th}>Slug</th>
              <th className={styles.th}>Projects</th>
              <th className={styles.th}>Status</th>
              <th className={`${styles.th} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {workspaces.map((ws) => {
              const isWsActive = activeWorkspace?.id === ws.id;
              const projCount = getProjectsCount(ws.id, ws.slug);

              return (
                <tr 
                  key={ws.id} 
                  className={`${styles.tr} ${isWsActive ? styles.trActive : ''}`}
                >
                  {/* Workspace Name */}
                  <td className={styles.td}>
                    <div className={styles.wsCell}>
                      <div className={styles.wsCellIcon}>
                        {(ws.name || 'W').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.wsName}>{ws.name}</div>
                      </div>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className={styles.td}>
                    <span className={styles.wsSlug}>{ws.slug || 'primary'}</span>
                  </td>

                  {/* Project Count */}
                  <td className={styles.td}>
                    <span className={styles.countTag}>
                      {projCount} {projCount === 1 ? 'project' : 'projects'}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className={styles.td}>
                    {isWsActive ? (
                      <span className={styles.activePillSmall}>
                        <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                        Active
                      </span>
                    ) : (
                      <span className={styles.inactivePillSmall}>
                        Standby
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className={`${styles.td} text-right`}>
                    <div className={styles.actionsCell}>
                      {!isWsActive && (
                        <button
                          type="button"
                          onClick={() => setActiveWorkspace(ws)}
                          className={styles.switchBtn}
                          title={`Switch to ${ws.name}`}
                        >
                          Switch
                        </button>
                      )}

                      {isAdmin && workspaces.length > 1 && !isWsActive && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete workspace "${ws.name}"?`)) {
                              handleDeleteWorkspace(ws.id);
                            }
                          }}
                          className={styles.deleteBtn}
                          title="Delete Workspace"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Danger Zone (Admin Only) */}
      {isAdmin && (
        <div className={styles.dangerCard}>
          <div className={styles.dangerHeader}>
            <div className="flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-4 h-4" />
              <h3 className={styles.dangerTitle}>Danger Zone</h3>
            </div>
          </div>
          <div className={styles.dangerBody}>
            <div>
              <div className="font-semibold text-xs text-main">
                Delete Active Workspace
              </div>
              <div className="text-xs text-muted mt-0.5">
                Permanently delete "{activeWorkspace?.name || 'this workspace'}" and its configurations.
                {workspaces.length <= 1 && ' (Cannot delete the only remaining workspace).'}
              </div>
            </div>

            <button
              type="button"
              disabled={workspaces.length <= 1}
              onClick={() => {
                if (!activeWorkspace) return;
                if (confirm(`Are you sure you want to delete "${activeWorkspace.name}"? This cannot be undone.`)) {
                  handleDeleteWorkspace(activeWorkspace.id);
                }
              }}
              className={styles.dangerBtn}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
