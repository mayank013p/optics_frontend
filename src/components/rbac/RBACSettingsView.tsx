'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Plus, RotateCcw, Download, Trash2, Lock, Save, Loader2 } from 'lucide-react';
import styles from './RBACSettingsView.module.css';

interface Role {
  id: string;
  name: string;
  level: string;
  isSystem?: boolean;
}

interface Permission {
  code: string;
  name: string;
  cat: string;
}

const PERMISSION_ALIASES: Record<string, string[]> = {
  'task.create': ['issue.create', 'issues.create'],
  'issue.create': ['task.create'],
  'task.update': ['issue.update', 'issues.update'],
  'issue.update': ['task.update'],
  'task.subtask': ['subtask.toggle', 'subtask.update', 'task.subtask_check', 'task.checklist', 'task.subtasks'],
  'subtask.toggle': ['task.subtask'],
  'subtask.update': ['task.subtask'],
  'task.subtask_check': ['task.subtask'],
  'task.checklist': ['task.subtask'],
  'task.comment': ['comment.create'],
  'comment.create': ['task.comment', 'comments.create', 'comment.post', 'issue.comment'],
  'task.delete': ['issue.delete', 'issues.delete'],
  'issue.delete': ['task.delete'],
  'task.move': ['issue.move', 'issues.move'],
  'issue.move': ['task.move'],
  'doc.create': ['document.create', 'docs.create'],
  'document.create': ['doc.create'],
  'doc.delete': ['document.delete', 'docs.delete'],
  'document.delete': ['doc.delete'],
  'user.invite': ['org.invite', 'members.invite'],
  'org.invite': ['user.invite'],
  'user.assign_role': ['user.manage', 'org.manage'],
  'user.delete': ['user.manage', 'org.manage'],
  'workspace.manage': ['workspace.update'],
};

const DEFAULT_PERMISSIONS: Permission[] = [
  { code: 'org.manage', name: 'Manage Organization Settings & Security', cat: 'Organization' },
  { code: 'user.invite', name: 'Invite Team Members', cat: 'Organization' },
  { code: 'user.assign_role', name: 'Manage Member Roles & Access', cat: 'Organization' },
  { code: 'user.delete', name: 'Remove Members from Workspace', cat: 'Organization' },
  { code: 'workspace.create', name: 'Create Workspaces', cat: 'Workspace' },
  { code: 'workspace.manage', name: 'Manage Workspace Settings', cat: 'Workspace' },
  { code: 'project.create', name: 'Create Projects', cat: 'Project' },
  { code: 'project.update', name: 'Update Project Details', cat: 'Project' },
  { code: 'project.delete', name: 'Delete Projects', cat: 'Project' },
  { code: 'board.configure', name: 'Configure Kanban Columns & WIP Limits', cat: 'Board' },
  { code: 'task.create', name: 'Create & Assign Tasks', cat: 'Task' },
  { code: 'task.update', name: 'Edit & Update Tasks (Title, Status, Details)', cat: 'Task' },
  { code: 'task.subtask', name: 'Check & Manage Subtasks / Checklist Items', cat: 'Task' },
  { code: 'task.move', name: 'Move & Transition Tasks', cat: 'Task' },
  { code: 'task.delete', name: 'Delete Tasks', cat: 'Task' },
  { code: 'comment.create', name: 'Post Comments & Activity Mentions', cat: 'Task' },
  { code: 'doc.create', name: 'Create & Edit Project Wiki Docs', cat: 'Document' },
  { code: 'doc.delete', name: 'Delete Project Wiki Docs', cat: 'Document' },
  { code: 'attachment.upload', name: 'Upload Cloud Attachments', cat: 'Storage' },
  { code: 'attachment.delete', name: 'Delete Cloud Attachments', cat: 'Storage' },
];

const DEFAULT_MATRIX: Record<string, string[]> = {
  owner: ['*'],
  'organization owner': ['*'],
  'role-owner': ['*'],
  admin: [
    'org.manage',
    'user.invite',
    'user.assign_role',
    'user.delete',
    'workspace.create',
    'workspace.manage',
    'project.create',
    'project.update',
    'project.delete',
    'board.configure',
    'task.create',
    'task.update',
    'task.subtask',
    'task.move',
    'task.delete',
    'comment.create',
    'doc.create',
    'doc.delete',
    'attachment.upload',
    'attachment.delete',
  ],
  'workspace admin': [
    'org.manage',
    'user.invite',
    'user.assign_role',
    'user.delete',
    'workspace.create',
    'workspace.manage',
    'project.create',
    'project.update',
    'project.delete',
    'board.configure',
    'task.create',
    'task.update',
    'task.subtask',
    'task.move',
    'task.delete',
    'comment.create',
    'doc.create',
    'doc.delete',
    'attachment.upload',
    'attachment.delete',
  ],
  lead: [
    'user.invite',
    'project.create',
    'project.update',
    'board.configure',
    'task.create',
    'task.update',
    'task.subtask',
    'task.move',
    'task.delete',
    'comment.create',
    'doc.create',
    'doc.delete',
    'attachment.upload',
  ],
  'project lead': [
    'user.invite',
    'project.create',
    'project.update',
    'board.configure',
    'task.create',
    'task.update',
    'task.subtask',
    'task.move',
    'task.delete',
    'comment.create',
    'doc.create',
    'doc.delete',
    'attachment.upload',
  ],
  dev: [
    'task.create',
    'task.update',
    'task.subtask',
    'task.move',
    'comment.create',
    'doc.create',
    'attachment.upload',
  ],
  developer: [
    'task.create',
    'task.update',
    'task.subtask',
    'task.move',
    'comment.create',
    'doc.create',
    'attachment.upload',
  ],
  'role-dev': [
    'task.create',
    'task.update',
    'task.subtask',
    'task.move',
    'comment.create',
    'doc.create',
    'attachment.upload',
  ],
  'product designer': [
    'task.create',
    'task.update',
    'task.subtask',
    'task.move',
    'comment.create',
    'doc.create',
    'attachment.upload',
  ],
  viewer: [],
};

const DEFAULT_ROLES: Role[] = [
  { id: 'owner', name: 'Organization Owner', level: 'Organization', isSystem: true },
  { id: 'admin', name: 'Workspace Admin', level: 'Workspace', isSystem: true },
  { id: 'lead', name: 'Project Lead', level: 'Project', isSystem: true },
  { id: 'dev', name: 'Developer', level: 'Project', isSystem: true },
  { id: 'viewer', name: 'Viewer', level: 'Project', isSystem: true },
];

export const isProtectedSystemRole = (r: Role): boolean => {
  if (r.isSystem) return true;
  const sysIds = ['owner', 'admin', 'lead', 'dev', 'viewer', 'role-owner', 'role-dev'];
  if (sysIds.includes(r.id)) return true;
  const sysNames = [
    'Organization Owner',
    'Workspace Admin',
    'Project Lead',
    'Developer',
    'Product Designer',
    'Viewer'
  ];
  return sysNames.some((name) => name.toLowerCase() === r.name.toLowerCase());
};

import { useOptics } from '../../context/OpticsContext';
import { api } from '../../lib/api';
import { getCache, setCache } from '../../lib/cache';
import { RBACSkeleton } from '../common/Skeleton';

export const RBACSettingsView: React.FC = () => {
  const { 
    rbacMatrix,
    handleCreateRole: apiCreateRole, 
    handleDeleteRole: apiDeleteRole, 
    handleSaveRbacMatrix,
    isAdmin, 
    currentUser,
    authLoading
  } = useOptics();

  const [roles, setRoles] = useState<Role[]>(() => getCache<Role[]>('rbac_roles', DEFAULT_ROLES));
  const [permissions, setPermissions] = useState<Permission[]>(() => getCache<Permission[]>('rbac_perms', DEFAULT_PERMISSIONS));
  const [matrix, setMatrix] = useState<Record<string, string[]>>(() => {
    const cached = getCache<Record<string, string[]> | null>('rbac_matrix', null);
    if (cached && Object.keys(cached).length > 0) return cached;
    return rbacMatrix && Object.keys(rbacMatrix).length > 0 ? rbacMatrix : DEFAULT_MATRIX;
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modifiedRoles, setModifiedRoles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleLevel, setNewRoleLevel] = useState('Project');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize when rbacMatrix loads initially if user hasn't made unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges && rbacMatrix && Object.keys(rbacMatrix).length > 0) {
      setMatrix((prev) => ({ ...prev, ...rbacMatrix }));
    }
  }, [rbacMatrix, hasUnsavedChanges]);

  // Fetch real database matrix roles & permissions on mount
  useEffect(() => {
    let mounted = true;
    const fetchMatrix = async () => {
      try {
        const cached = getCache<Role[] | null>('rbac_roles', null);
        if (!cached) setIsLoading(true);

        const res = await api.rbac.getMatrix();
        if (mounted && res?.roles && res?.permissions) {
          const mappedRoles: Role[] = res.roles.map((r: any) => ({
            id: r.id,
            name: r.name,
            isSystem: Boolean(r.isSystem),
            level: r.name.toLowerCase().includes('org') || r.name.toLowerCase().includes('owner') 
              ? 'Organization' 
              : r.name.toLowerCase().includes('workspace') 
              ? 'Workspace' 
              : 'Project',
          }));

          // Merge backend permissions with standard platform permissions ensuring full list is shown
          const apiPermMap = new Map<string, Permission>();
          res.permissions.forEach((p: any) => {
            const stdCode = p.code.startsWith('issue.')
              ? p.code.replace('issue.', 'task.')
              : p.code.startsWith('document.')
              ? p.code.replace('document.', 'doc.')
              : p.code;

            const categoryName = p.category
              ? p.category.charAt(0).toUpperCase() + p.category.slice(1)
              : 'General';

            apiPermMap.set(stdCode, {
              code: stdCode,
              name: p.name.replace(/Issues?/gi, 'Tasks').replace(/Documents?/gi, 'Docs'),
              cat: categoryName === 'Issue' ? 'Task' : categoryName === 'Document' ? 'Document' : categoryName,
            });
          });

          DEFAULT_PERMISSIONS.forEach((def) => {
            if (!apiPermMap.has(def.code)) {
              apiPermMap.set(def.code, def);
            }
          });

          const mappedPerms: Permission[] = Array.from(apiPermMap.values());

          setRoles(mappedRoles);
          setPermissions(mappedPerms);
          setCache('rbac_roles', mappedRoles);
          setCache('rbac_perms', mappedPerms);
        }
      } catch (err) {
        console.warn('Could not load real RBAC matrix from backend:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchMatrix();
    return () => { mounted = false; };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTogglePermission = (roleId: string, permCode: string) => {
    if (isSaving) {
      showToast('Please wait while permissions are being saved to workspace...');
      return;
    }

    const role = roles.find((r) => r.id === roleId);
    const isOwner = role?.name === 'Organization Owner' || roleId === 'owner' || roleId === 'role-owner';
    if (isOwner) {
      showToast('Organization Owner has immutable superuser permissions.');
      return;
    }

    const currentPerms =
      matrix[roleId] ||
      (role?.name ? matrix[role.name.toLowerCase()] : []) ||
      (role?.name ? matrix[role.name] : []) ||
      (role?.name ? DEFAULT_MATRIX[role.name.toLowerCase()] : []) ||
      [];

    const stdCode = permCode.startsWith('issue.')
      ? permCode.replace('issue.', 'task.')
      : permCode.startsWith('document.')
      ? permCode.replace('document.', 'doc.')
      : permCode;

    const toRemove = [
      stdCode,
      permCode,
      ...(PERMISSION_ALIASES[stdCode] || []),
      ...(PERMISSION_ALIASES[permCode] || []),
    ];

    const hasPerm =
      currentPerms.includes(stdCode) ||
      currentPerms.includes(permCode) ||
      currentPerms.includes('*') ||
      (PERMISSION_ALIASES[stdCode]?.some((a) => currentPerms.includes(a)));

    const nextPerms = hasPerm
      ? currentPerms.filter((p) => !toRemove.includes(p))
      : Array.from(new Set([...currentPerms.filter((p) => !toRemove.includes(p)), stdCode]));

    // 0ms instant local UI state update
    const updatedMatrix: Record<string, string[]> = {
      ...matrix,
      [roleId]: nextPerms,
    };
    if (role?.name) {
      updatedMatrix[role.name.toLowerCase()] = nextPerms;
      updatedMatrix[role.name] = nextPerms;
    }
    setMatrix(updatedMatrix);
    setCache('rbac_matrix', updatedMatrix); // Persisted across reloads instantly!
    setHasUnsavedChanges(true);
    setModifiedRoles((prev) => new Set(prev).add(role?.name || roleId));

    showToast(`${hasPerm ? 'Disabled' : 'Enabled'} ${stdCode} (Unsaved)`);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await handleSaveRbacMatrix(matrix);
      setHasUnsavedChanges(false);
      setModifiedRoles(new Set());
      showToast('✓ Permissions saved and applied to workspace!');
    } catch (err: any) {
      console.error('Failed to save permissions:', err);
      showToast(err.message || 'Failed to save permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setMatrix(rbacMatrix);
    setCache('rbac_matrix', rbacMatrix);
    setHasUnsavedChanges(false);
    setModifiedRoles(new Set());
    showToast('Discarded unsaved changes');
  };

  const handleCreateRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const roleId = `role-${Date.now()}`;
    const newRole: Role = {
      id: roleId,
      name: newRoleName.trim(),
      level: newRoleLevel,
    };

    const initialPerms = ['task.create', 'task.move', 'doc.create'];
    setRoles((prev) => [...prev, newRole]);

    try {
      await apiCreateRole({
        name: newRoleName.trim(),
        description: `Custom ${newRoleLevel} level role`,
        permissionCodes: initialPerms,
      });
      const res = await api.rbac.getMatrix();
      if (res?.roles) {
        const mappedRoles: Role[] = res.roles.map((r: any) => ({
          id: r.id,
          name: r.name,
          level: r.name.toLowerCase().includes('org') || r.name.toLowerCase().includes('owner') 
            ? 'Organization' 
            : r.name.toLowerCase().includes('workspace') 
            ? 'Workspace' 
            : 'Project',
        }));
        setRoles(mappedRoles);
        setCache('rbac_roles', mappedRoles);
      }
    } catch (err) {
      console.error('Failed to sync role to DB:', err);
    }

    setNewRoleName('');
    setIsAddRoleOpen(false);
    showToast(`Created custom role: ${newRole.name}`);
  };

  const handleDeleteRole = async (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role || isProtectedSystemRole(role)) {
      showToast('Cannot delete default system role');
      return;
    }
    setRoles((prev) => prev.filter((r) => r.id !== roleId));

    try {
      await apiDeleteRole(roleId);
      showToast(`Deleted custom role: ${role.name}`);
    } catch (err: any) {
      console.error('Failed to delete role on DB:', err);
      showToast(err.message || 'Failed to delete role');
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset RBAC permission matrix to default Ivors policy?')) {
      setRoles(DEFAULT_ROLES);
      showToast('Reset RBAC matrix to default policy.');
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ roles, matrix: rbacMatrix }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'optics_rbac_policy.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported RBAC policy JSON');
  };

  // 1. Skeleton Loading: show skeleton during auth/access loading or initial RBAC matrix fetch
  if (authLoading || (isLoading && !getCache('rbac_roles', null))) {
    return <RBACSkeleton />;
  }

  // 2. Access Guard: only owner / admin can see RBAC settings
  if (!isAdmin) {
    return (
      <div
        className={styles.container}
        style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
      >
        <Lock className="w-10 h-10 mb-4" style={{ color: 'var(--text-dim)' }} />
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
          Access Restricted
        </h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', maxWidth: '22rem', lineHeight: 1.5 }}>
          The RBAC & Permissions panel is only accessible to <strong>Organization Owners</strong> and <strong>Workspace Admins</strong>.
          Your current role does not have access.
        </p>
      </div>
    );
  }

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
            <Shield className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            <h1 className={styles.title}>
              Dynamic Role-Based Access Control (RBAC)
            </h1>
          </div>
          <p className={styles.subtitle}>
            Click any cell to toggle capabilities and grant or revoke permissions in real-time.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleResetDefaults}
            className={styles.actionBtn}
            title="Reset to default system policy"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleExportJSON}
            className={styles.actionBtn}
            title="Export RBAC matrix as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => setIsAddRoleOpen(true)}
            className={styles.actionBtn}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Role</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving || !hasUnsavedChanges}
            className={`${styles.saveBtn} ${hasUnsavedChanges ? styles.saveBtnPending : ''}`}
            title="Save all permission changes to workspace"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
                {hasUnsavedChanges && (
                  <span className={styles.badgeUnsaved}>
                    {modifiedRoles.size}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>

      {/* RBAC Table Matrix */}
      <div className={`${styles.tableContainer} ${isSaving ? styles.tableContainerSaving : ''}`}>
        {isSaving && (
          <div className={styles.savingOverlay}>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving & applying permissions to workspace...</span>
          </div>
        )}
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Permission / Capability</th>
              <th className={styles.th}>Scope</th>
              {roles.map((r) => {
                const isSystem = isProtectedSystemRole(r);
                return (
                  <th key={r.id} className={`${styles.th} text-center`}>
                    <div className={styles.roleThWrapper}>
                      <span className="font-bold">{r.name}</span>
                      {isSystem ? (
                        <span title="Built-in System Role (Protected)" className="text-zinc-500 opacity-60 flex items-center p-0.5">
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={isSaving}
                          onClick={() => handleDeleteRole(r.id)}
                          className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title={`Delete ${r.name} Role`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <span className={styles.roleLevel}>{r.level}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {permissions.map((p) => (
              <tr key={p.code} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.permName}>{p.name}</div>
                  <div className={styles.permCode}>{p.code}</div>
                </td>
                <td className={styles.td}>
                  <span className={styles.scopeBadge}>
                    {p.cat}
                  </span>
                </td>
                {roles.map((r) => {
                  const rolePerms =
                    matrix[r.id] ||
                    matrix[r.name.toLowerCase()] ||
                    matrix[r.name] ||
                    DEFAULT_MATRIX[r.name.toLowerCase()] ||
                    [];
                  const isOwner = r.id === 'owner' || r.id === 'role-owner' || r.name === 'Organization Owner';
                  const hasPerm =
                    rolePerms.includes('*') ||
                    rolePerms.includes(p.code) ||
                    (PERMISSION_ALIASES[p.code]?.some((a) => rolePerms.includes(a)));
                  return (
                    <td key={r.id} className={`${styles.td} text-center`}>
                      <button
                        type="button"
                        disabled={isOwner || isSaving}
                        onClick={() => handleTogglePermission(r.id, p.code)}
                        className={`${styles.permToggleBtn} ${isOwner || isSaving ? 'cursor-not-allowed opacity-90' : ''}`}
                        style={{
                          backgroundColor: (hasPerm || isOwner) ? 'var(--bg-pill)' : 'var(--bg-badge)',
                          color: (hasPerm || isOwner) ? 'var(--text-pill)' : 'var(--text-dim)',
                        }}
                        title={
                          isOwner 
                            ? 'Organization Owner has all capabilities by default' 
                            : isSaving 
                            ? 'Please wait while permissions are saving...' 
                            : 'Click to toggle capability'
                        }
                      >
                        {(hasPerm || isOwner) ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5 opacity-30" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Role Modal */}
      {isAddRoleOpen && (
        <div className={styles.modalOverlay} onClick={() => !isSaving && setIsAddRoleOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" strokeWidth={2.2} style={{ color: 'var(--accent-amber)' }} />
                <span className="font-bold text-sm">Add Custom RBAC Role</span>
              </div>
              <button 
                disabled={isSaving} 
                onClick={() => setIsAddRoleOpen(false)} 
                className="text-slate-400 hover:text-slate-600 disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Shield className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Role Name *
                  </span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isSaving}
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. QA Lead / Release Manager"
                  className={styles.input}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Lock className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Permission Scope Level
                  </span>
                </label>
                <select
                  disabled={isSaving}
                  value={newRoleLevel}
                  onChange={(e) => setNewRoleLevel(e.target.value)}
                  className={styles.select}
                >
                  <option value="Project">Project Level</option>
                  <option value="Workspace">Workspace Level</option>
                  <option value="Organization">Organization Level</option>
                </select>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsAddRoleOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !newRoleName.trim()}
                  className={styles.primaryBtn}
                >
                  {isSaving ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Save Bar */}
      {hasUnsavedChanges && (
        <div className={styles.floatingBar}>
          <div className={styles.floatingBarInfo}>
            <div className={styles.floatingDot} />
            <span className={styles.floatingText}>
              You have unsaved permission changes ({modifiedRoles.size} roles modified)
            </span>
          </div>
          <div className={styles.floatingActions}>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleDiscardChanges}
              className={styles.discardBtn}
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className={`${styles.saveBtn} ${styles.saveBtnPending}`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
