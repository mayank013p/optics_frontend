'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Board, 
  Workspace,
  Project, 
  Task,
  Issue, 
  Document, 
  ActivityLog, 
  User, 
  BoardColumn, 
  Priority, 
  TaskType,
  IssueType,
  Team,
  Subtask
} from '../types';
import { api, getAuthToken, setAuthToken, clearAuthToken, getStoredUser, setStoredUser, ApiError } from '../lib/api';
import { getCache, setCache, clearAllOpticsCache } from '../lib/cache';
import { ENV } from '../lib/config';
import { io as socketIO, Socket } from 'socket.io-client';

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

export interface MemberItem {
  user: User;
  role: string;
  team: string;
  workspaceId?: string;
  workspaceIds?: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  createdAt: string;
  read: boolean;
  type: 'mention' | 'status' | 'assign' | 'system' | 'invite' | 'task' | 'doc';
  taskId?: string;
  taskKey?: string;
  docId?: string;
}

interface OpticsContextType {
  // Auth
  currentUser: User | null;
  currentUserRole: 'owner' | 'admin' | 'member' | 'viewer';
  isAdmin: boolean;
  can: (permissionCode: string) => boolean;
  rbacMatrix: Record<string, string[]>;
  isAuthenticated: boolean;
  authLoading: boolean;
  handleLogin: (email: string, pass: string) => Promise<void>;
  handleRegister: (name: string, email: string, pass: string, code: string, orgName?: string, inviteToken?: string) => Promise<any>;
  handleAcceptInvite: (data: { token: string; name?: string; password?: string }) => Promise<any>;
  handleCreateOrganization: (name: string, workspaceName?: string) => Promise<any>;
  handleJoinOrganizationViaToken: (token: string) => Promise<any>;
  handleLeaveOrganization: (orgId: string) => Promise<any>;
  handleDeleteOrganization: (orgId: string) => Promise<any>;
  handleLogout: () => void;
  handleLoginViaOtp: (email: string, code: string) => Promise<any>;
  handleSendOtp: (email: string, purpose: 'PASSWORD_RESET' | 'LOGIN' | 'REGISTER') => Promise<any>;
  handleResetPasswordViaOtp: (email: string, code: string, newPassword: string) => Promise<any>;
  handleUpdateProfile: (data: { name?: string; jobTitle?: string; avatarUrl?: string }) => Promise<void>;
  handleUpdatePassword: (data: { currentPassword?: string; newPassword: string }) => Promise<void>;

  // Navigation & Theme
  currentTheme: string;
  setCurrentTheme: (t: string) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;

  // Workspaces & Projects
  workspaces: Workspace[];
  allWorkspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (w: Workspace) => Promise<void>;
  projects: Project[];
  workspaceProjects: Project[];
  activeProject: Project | null;
  setActiveProject: (p: Project) => Promise<void>;
  board: Board | null;
  filteredBoard: Board | null;
  documents: Document[];
  activities: ActivityLog[];
  members: MemberItem[];
  workspaceMembers: MemberItem[];
  teams: Team[];
  notifications: NotificationItem[];
  unreadCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  loading: boolean;
  boardLoading: boolean;
  docsLoading: boolean;
  workspaceLoading: boolean;
  isBackgroundSyncing: boolean;
  refreshData: () => Promise<void>;

  // UI Modals
  isNotificationOpen: boolean;
  setIsNotificationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTask: Issue | null;
  setSelectedTask: (task: Issue | null) => void;
  isCreateTaskOpen: boolean;
  setIsCreateTaskOpen: (open: boolean) => void;
  targetColumnForCreate?: string;
  setTargetColumnForCreate: (colId?: string) => void;
  isCreateWorkspaceOpen: boolean;
  setIsCreateWorkspaceOpen: (open: boolean) => void;
  isCreateProjectOpen: boolean;
  setIsCreateProjectOpen: (open: boolean) => void;
  isCreateDocOpen: boolean;
  setIsCreateDocOpen: (open: boolean) => void;
  isInviteMemberOpen: boolean;
  setIsInviteMemberOpen: (open: boolean) => void;
  
  // Instant Optimistic Actions
  handleCreateWorkspace: (data: { name: string; description?: string }) => Promise<void>;
  handleUpdateWorkspace: (workspaceId: string, name: string) => Promise<void>;
  handleDeleteWorkspace: (workspaceId: string) => Promise<void>;
  handleMoveTask: (taskId: string, targetColumnId: string) => Promise<void>;
  handleUpdateTask: (updated: Issue) => Promise<void>;
  handleUpdateSubtasks: (taskId: string, subtasks: Subtask[]) => Promise<void>;
  handleDeleteTask: (taskId: string) => Promise<void>;
  handleCreateTask: (data: {
    title: string;
    description: string;
    priority: Priority;
    type: IssueType;
    estimate: number;
    columnId?: string;
    dueDate?: string;
    assigneeIds?: string[];
    labels?: string[];
    subtasks?: string[];
  }) => Promise<void>;
  handleAddColumn: (name: string, color: string) => Promise<void>;
  handleDeleteColumn: (columnId: string) => Promise<void>;
  handleCreateProject: (data: { name: string; key: string; description: string; color: string; workspaceId?: string }) => Promise<void>;
  handleUpdateProject: (projectId: string, data: { name?: string; description?: string; color?: string; workspaceId?: string }) => Promise<void>;
  handleCreateDoc: (title: string, template: string) => Promise<void>;
  handleSaveDoc: (doc: Document) => Promise<void>;
  handleDeleteDoc: (docId: string) => Promise<void>;
  handleInviteMember: (data: { name: string; email: string; role: string; team: string; workspaceId?: string }) => Promise<any>;
  handleUpdateMemberRole: (userId: string, newRole: string) => Promise<void>;
  handleUpdateMemberTeam: (userId: string, newTeam: string) => Promise<void>;
  handleUpdateMember: (userId: string, data: { role?: string; team?: string; workspaceId?: string }) => Promise<void>;
  handleRemoveMember: (userId: string) => Promise<void>;
  handleCreateRole: (data: { name: string; description?: string; permissionCodes?: string[] }) => Promise<void>;
  handleDeleteRole: (roleId: string) => Promise<void>;
  handleToggleRolePermission: (roleId: string, permissionCode: string, enabled: boolean) => Promise<void>;
  setRbacMatrix: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  handleSaveRbacMatrix: (matrix: Record<string, string[]>) => Promise<void>;
  handleMarkAllNotificationsRead: () => void;
  handleMarkNotificationRead: (id: string) => void;
  handleClearNotification: (id: string) => void;
  handleClearAllNotifications: () => void;
  addNotification: (item: {
    title: string;
    message: string;
    type?: NotificationItem['type'];
    taskId?: string;
    taskKey?: string;
    docId?: string;
    createdAt?: string;
  }) => void;
  handleNotificationClick: (n: NotificationItem) => void;
  handleAddComment: (taskId: string, content: string) => Promise<void>;
}

export const TAB_ALIASES: Record<string, string> = {
  wiki: 'docs',
  settings: 'workspace-settings',
};

export const VALID_TABS = [
  'board',
  'dashboard',
  'docs',
  'wiki',
  'workspace-settings',
  'settings',
  'rbac',
  'teams',
  'profile',
];

const normalizeTab = (raw: string): string => {
  const clean = raw.toLowerCase().trim();
  return TAB_ALIASES[clean] || clean;
};

export const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

export function isWithin15Days(dateStrOrTs?: string | number | Date): boolean {
  if (!dateStrOrTs) return true;
  const ts = new Date(dateStrOrTs).getTime();
  if (isNaN(ts)) return true;
  const diff = Date.now() - ts;
  return diff >= -60000 && diff <= FIFTEEN_DAYS_MS;
}

export function formatNotificationTime(dateStrOrTs?: string | number | Date): string {
  if (!dateStrOrTs) return 'Just now';
  const ts = new Date(dateStrOrTs).getTime();
  if (isNaN(ts)) return 'Just now';
  const diffMs = Date.now() - ts;
  if (diffMs < 60000) return 'Just now';
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const OpticsContext = createContext<OpticsContextType | undefined>(undefined);

export const OpticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false);

  const [currentTheme, setCurrentThemeState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('optics_theme') || localStorage.getItem('theme');
      if (saved) return saved;
    }
    return getCache<string>('theme', 'warm-cream');
  });

  const setCurrentTheme = useCallback((theme: string) => {
    setCurrentThemeState(theme);
    setCache('theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('optics_theme', theme);
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, []);

  // Persistent & URL-synced Tab State
  const [currentTab, setCurrentTabState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (VALID_TABS.includes(path)) {
        return normalizeTab(path);
      }
      const searchTab = new URLSearchParams(window.location.search).get('tab')?.toLowerCase();
      if (searchTab && VALID_TABS.includes(searchTab)) {
        return normalizeTab(searchTab);
      }
    }
    return getCache<string>('optics_current_tab', 'board');
  });

  const setCurrentTab = useCallback((rawTab: string) => {
    const tab = normalizeTab(rawTab);
    setCurrentTabState(tab);
    setCache('optics_current_tab', tab);
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      const targetUrl = tab === 'docs' ? '/wiki' : `/${tab}`;
      const normalizedCurrent = normalizeTab(currentPath);
      // Only push history state if navigating between app tabs or explicitly opening app
      if (normalizedCurrent !== tab && (VALID_TABS.includes(currentPath) || currentPath === '')) {
        window.history.pushState({ tab }, '', targetUrl);
      }
    }
  }, []);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      let targetTab = e.state?.tab;
      if (!targetTab && typeof window !== 'undefined') {
        const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
        if (VALID_TABS.includes(path)) {
          targetTab = normalizeTab(path);
        }
      }
      if (targetTab && VALID_TABS.includes(targetTab)) {
        const normalized = normalizeTab(targetTab);
        setCurrentTabState(normalized);
        setCache('optics_current_tab', normalized);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync initial tab from browser route ONLY if currently on a valid app tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (VALID_TABS.includes(path)) {
        const normalized = normalizeTab(path);
        setCurrentTabState(normalized);
        setCache('optics_current_tab', normalized);
      }
    }
  }, []);
  
  // Initialize state directly from SWR Cache for instant 0ms render
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => getCache<Workspace[]>('workspaces', []));
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(() => getCache<Workspace | null>('active_workspace', null));
  const [projects, setProjects] = useState<Project[]>(() => getCache<Project[]>('projects', []));
  const [activeProject, setActiveProjectState] = useState<Project | null>(() => getCache<Project | null>('active_project', null));
  const activeProjectRef = useRef<Project | null>(activeProject);
  useEffect(() => {
    activeProjectRef.current = activeProject;
  }, [activeProject]);

  const currentTabRef = useRef<string>(currentTab);
  useEffect(() => {
    currentTabRef.current = currentTab;
  }, [currentTab]);

  const [boardLoading, setBoardLoading] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);

  const [board, setBoard] = useState<Board | null>(() => {
    const cachedActive = getCache<Project | null>('active_project', null);
    if (cachedActive?.id) {
      return getCache<Board | null>(`board_${cachedActive.id}`, null);
    }
    return null;
  });
  const [documents, setDocuments] = useState<Document[]>(() => {
    const cachedActive = getCache<Project | null>('active_project', null);
    if (cachedActive?.id) {
      return getCache<Document[]>(`docs_${cachedActive.id}`, []);
    }
    return [];
  });
  const [activities, setActivities] = useState<ActivityLog[]>(() => getCache<ActivityLog[]>('activities', []));
  const [members, setMembers] = useState<MemberItem[]>(() => getCache<MemberItem[]>('members', []));
  const [teams, setTeams] = useState<Team[]>(() => getCache<Team[]>('teams', []));
  const [rbacMatrix, setRbacMatrix] = useState<Record<string, string[]>>(() => getCache<Record<string, string[]>>('rbac_matrix', DEFAULT_MATRIX));
  const [rbacRoles, setRbacRoles] = useState<any[]>(() => getCache<any[]>('rbac_roles', []));
  const [searchQuery, setSearchQuery] = useState<string>('');

  const roleMutationQueueRef = useRef<Map<string, Promise<any>>>(new Map());
  const localMutationTimestampsRef = useRef<Map<string, number>>(new Map());

  const [customNotifications, setCustomNotifications] = useState<NotificationItem[]>(() => {
    const cached = getCache<NotificationItem[]>('custom_notifications', []);
    return (cached || []).filter((n) => isWithin15Days(n.createdAt));
  });
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() =>
    getCache<string[]>('read_notification_ids', [])
  );
  const [clearedNotificationIds, setClearedNotificationIds] = useState<string[]>(() =>
    getCache<string[]>('cleared_notification_ids', [])
  );

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Issue | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const [isInviteMemberOpen, setIsInviteMemberOpen] = useState(false);
  const [targetColumnForCreate, setTargetColumnForCreate] = useState<string | undefined>();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Switch project handler with strict isolation & instant skeleton if not cached
  const handleSelectProject = useCallback(async (p: Project) => {
    setActiveProjectState(p);
    setCache('active_project', p);

    // 1. Instant Cache Check for Board:
    const cachedBoard = getCache<Board | null>(`board_${p.id}`, null);
    if (cachedBoard && cachedBoard.projectId === p.id) {
      setBoard(cachedBoard);
      setBoardLoading(false);
    } else {
      // NEVER show previous project's tasks or columns
      setBoard(null);
      setBoardLoading(true);
    }

    // 2. Instant Cache Check for Docs:
    const cachedDocs = getCache<Document[] | null>(`docs_${p.id}`, null);
    if (cachedDocs && cachedDocs.every((d) => !d.projectId || d.projectId === p.id)) {
      setDocuments(cachedDocs);
      setDocsLoading(false);
    } else {
      // NEVER show previous project's docs
      setDocuments([]);
      setDocsLoading(true);
    }

    // 3. Concurrently fetch fresh board & docs
    try {
      const [boardRes, docsRes] = await Promise.all([
        api.boards.getByProject(p.id).catch((err) => {
          console.warn('Could not load board for project:', err);
          return null;
        }),
        api.docs.list(p.id).catch((err) => {
          console.warn('Could not load docs for project:', err);
          return null;
        }),
      ]);

      if (activeProjectRef.current?.id === p.id) {
        if (boardRes && boardRes.board) {
          setBoard(boardRes.board);
          setCache(`board_${p.id}`, boardRes.board);
        }
        if (docsRes && docsRes.documents) {
          setDocuments(docsRes.documents);
          setCache(`docs_${p.id}`, docsRes.documents);
        }
      }
    } finally {
      if (activeProjectRef.current?.id === p.id) {
        setBoardLoading(false);
        setDocsLoading(false);
      }
    }
  }, []);

  // Switch workspace handler with instant project resolution and data refresh
  const setActiveWorkspace = useCallback(async (ws: Workspace) => {
    setActiveWorkspaceState(ws);
    setCache('active_workspace', ws);
    setWorkspaceLoading(true);

    try {
      const wsProjs = projects.filter(
        (p) =>
          p.workspaceId === ws.id ||
          (!p.workspaceId && ws.slug === 'primary') ||
          ws.projects?.some((wp) => wp.id === p.id)
      );

      const targetProj = wsProjs.length > 0 ? wsProjs[0] : (ws.projects && ws.projects.length > 0 ? ws.projects[0] : null);

      if (targetProj) {
        await handleSelectProject(targetProj);
      } else {
        setActiveProjectState(null);
        setBoard(null);
        setDocuments([]);
        setCache('active_project', null);
      }
    } finally {
      setWorkspaceLoading(false);
    }
  }, [projects, handleSelectProject]);

  const inFlightTabFetchRef = useRef<Map<string, Promise<any>>>(new Map());
  const inFlightRefreshRef = useRef<Promise<void> | null>(null);

  // 1. Production-Grade Tab-Targeted Data Fetching (Stale-While-Revalidate with Skeleton Loading)
  const fetchTabData = useCallback(async (tabName: string, targetProj?: Project | null, forceSkeleton = false) => {
    const proj = targetProj || activeProjectRef.current;
    const tabKey = `${tabName}_${proj?.id || 'global'}`;

    if (inFlightTabFetchRef.current.has(tabKey)) {
      return inFlightTabFetchRef.current.get(tabKey);
    }

    const fetchPromise = (async () => {
      try {
        if (tabName === 'board') {
          if (proj?.id) {
            const cachedBoard = getCache<Board | null>(`board_${proj.id}`, null);
            if (forceSkeleton || !cachedBoard) {
              setBoardLoading(true);
            }
            const res = await api.boards.getByProject(proj.id).catch(() => null);
            if (res?.board && activeProjectRef.current?.id === proj.id) {
              setBoard(res.board);
              setCache(`board_${proj.id}`, res.board);
            }
            setBoardLoading(false);
          }
        } else if (tabName === 'docs' || tabName === 'wiki') {
          if (proj?.id) {
            const cachedDocs = getCache<Document[] | null>(`docs_${proj.id}`, null);
            if (forceSkeleton || !cachedDocs || cachedDocs.length === 0) {
              setDocsLoading(true);
            }
            const res = await api.docs.list(proj.id).catch(() => null);
            if (res?.documents && activeProjectRef.current?.id === proj.id) {
              setDocuments(res.documents);
              setCache(`docs_${proj.id}`, res.documents);
            }
            setDocsLoading(false);
          }
        } else if (tabName === 'dashboard') {
          const [actRes, projRes] = await Promise.all([
            api.activity.list().catch(() => null),
            api.projects.list().catch(() => null),
          ]);
          if (actRes?.activities) {
            setActivities(actRes.activities);
            setCache('activities', actRes.activities);
          }
          if (projRes?.projects?.length) {
            setProjects(projRes.projects);
            setCache('projects', projRes.projects);
          }
        } else if (tabName === 'teams') {
          const [teamRes, teamsRes] = await Promise.all([
            api.teams.members().catch(() => null),
            api.teams.list().catch(() => null),
          ]);
          if (teamRes?.members) {
            setMembers(teamRes.members);
            setCache('members', teamRes.members);
          }
          if (teamsRes?.teams) {
            setTeams(teamsRes.teams);
            setCache('teams', teamsRes.teams);
          }
        } else if (tabName === 'workspace-settings' || tabName === 'rbac' || tabName === 'settings') {
          const [rbacRes, wsRes] = await Promise.all([
            api.rbac.getMatrix().catch(() => null),
            api.workspaces.list().catch(() => null),
          ]);
          if (wsRes?.workspaces && wsRes.workspaces.length > 0) {
            setWorkspaces(wsRes.workspaces);
            setCache('workspaces', wsRes.workspaces);
          }
          if (rbacRes?.roles && rbacRes.roles.length > 0) {
            const mappedMatrix: Record<string, string[]> = { ...DEFAULT_MATRIX };
            rbacRes.roles.forEach((r: any) => {
              const rawCodes: string[] = r.permissions?.map((p: any) => p.permission?.code || p.permissionId) || [];
              const normalizedCodes = Array.from(
                new Set(
                  rawCodes.map((c) =>
                    c.startsWith('issue.')
                      ? c.replace('issue.', 'task.')
                      : c.startsWith('document.')
                      ? c.replace('document.', 'doc.')
                      : c
                  )
                )
              );
              mappedMatrix[r.id] = normalizedCodes;
              mappedMatrix[r.name.toLowerCase()] = normalizedCodes;
              mappedMatrix[r.name] = normalizedCodes;
            });
            setRbacMatrix(mappedMatrix);
            setRbacRoles(rbacRes.roles);
            setCache('rbac_matrix', mappedMatrix);
            setCache('rbac_roles', rbacRes.roles);
          }
        }
      } catch (err) {
        console.error(`Error fetching tab data for ${tabName}:`, err);
      } finally {
        inFlightTabFetchRef.current.delete(tabKey);
      }
    })();

    inFlightTabFetchRef.current.set(tabKey, fetchPromise);
    return fetchPromise;
  }, []);

  // 2. Initial & Global Bootstrap: loads workspaces & projects, then prioritizes landing tab
  const refreshData = useCallback(async () => {
    if (inFlightRefreshRef.current) {
      return inFlightRefreshRef.current;
    }

    const refreshPromise = (async () => {
      const hasExistingData = projects.length > 0;
      if (!hasExistingData) {
        setLoading(true);
      }
      setIsBackgroundSyncing(true);

      try {
        // Fetch core structure (workspaces & projects)
        const [wsRes, projRes, actRes] = await Promise.all([
          api.workspaces.list().catch(() => ({ workspaces: [] })),
          api.projects.list().catch(() => ({ projects: [] })),
          api.activity.list().catch(() => ({ activities: [] })),
        ]);

        let resolvedWs: Workspace | null = activeWorkspace;
        if (wsRes?.workspaces?.length > 0) {
          setWorkspaces(wsRes.workspaces);
          setCache('workspaces', wsRes.workspaces);

          resolvedWs = activeWorkspace
            ? wsRes.workspaces.find((w: Workspace) => w.id === activeWorkspace.id) || wsRes.workspaces[0]
            : wsRes.workspaces[0];
          
          setActiveWorkspaceState(resolvedWs);
          setCache('active_workspace', resolvedWs);
        }

        let resolvedProj: Project | null = activeProject;
        if (projRes?.projects?.length > 0) {
          setProjects(projRes.projects);
          setCache('projects', projRes.projects);

          resolvedProj = activeProject
            ? projRes.projects.find((p: Project) => p.id === activeProject.id) || projRes.projects[0]
            : projRes.projects[0];
          
          if (resolvedProj) {
            setActiveProjectState(resolvedProj);
            setCache('active_project', resolvedProj);
          }
        }

        if (actRes?.activities) {
          setActivities(actRes.activities);
          setCache('activities', actRes.activities);
        }

        // Fetch data strictly for the active landing tab
        const currentActiveTab = currentTabRef.current || 'board';
        await fetchTabData(currentActiveTab, resolvedProj);
      } catch (err) {
        console.error('Error in workspace bootstrap:', err);
      } finally {
        setLoading(false);
        setIsBackgroundSyncing(false);
      }
    })();

    inFlightRefreshRef.current = refreshPromise;
    try {
      await refreshPromise;
    } finally {
      inFlightRefreshRef.current = null;
    }
  }, [activeProject, activeWorkspace, fetchTabData, projects.length]);

  // 3. Tab Switch Effect: Automatically and lazily revalidate current tab's data
  useEffect(() => {
    if (!currentUser) return;
    fetchTabData(currentTab, activeProject);
  }, [currentTab, activeProject?.id, currentUser, fetchTabData]);

  // 4. Production-Level Periodic Polling (every 25 seconds for active tab & activity stream)
  useEffect(() => {
    if (!currentUser) return;

    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return; // Don't poll when tab is inactive/hidden
      }
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        return;
      }

      // Revalidate currently visible tab
      fetchTabData(currentTabRef.current, activeProjectRef.current);

      // Revalidate activity stream in background for live notification updates
      api.activity.list().then((res) => {
        if (res?.activities) {
          setActivities(res.activities);
          setCache('activities', res.activities);
        }
      }).catch(() => {});
    }, 25000);

    return () => clearInterval(intervalId);
  }, [currentUser, fetchTabData]);

  // Check auth on initial mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        if (mounted) {
          setCurrentUser(null);
          setAuthLoading(false);
        }
        return;
      }

      try {
        const res = await api.auth.me();
        if (mounted && res?.user) {
          setCurrentUser(res.user);
          setStoredUser(res.user);
          await refreshData();
        }
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 401) {
          clearAuthToken();
          clearAllOpticsCache();
          if (mounted) setCurrentUser(null);
        } else {
          const cached = getStoredUser();
          if (mounted && cached) {
            setCurrentUser(cached);
          }
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Auth: Login
  const handleLogin = async (email: string, pass: string) => {
    const res = await api.auth.login({ email, password: pass });
    if (res?.token && res?.user) {
      setAuthToken(res.token);
      setStoredUser(res.user);
      setCurrentUser(res.user);
      await refreshData();
    }
  };

  // Auth: Register (requires OTP verification code)
  const handleRegister = async (name: string, email: string, pass: string, code: string, orgName?: string, inviteToken?: string) => {
    const res = await api.auth.register({ name, email, password: pass, code, orgName, inviteToken });
    if (res?.token && res?.user) {
      setAuthToken(res.token);
      setStoredUser(res.user);
      setCurrentUser(res.user);
      await refreshData();
    }
    return res;
  };

  // Auth: Accept Invitation
  const handleAcceptInvite = async (data: { token: string; name?: string; password?: string }) => {
    const res = await api.auth.acceptInvite(data);
    if (res?.token && res?.user) {
      setAuthToken(res.token);
      setStoredUser(res.user);
      setCurrentUser(res.user);
      await refreshData();
      setCurrentTab('dashboard');
    }
    return res;
  };

  // Auth: Create Organization (for users without one)
  const handleCreateOrganization = async (name: string, workspaceName?: string) => {
    const res = await api.auth.createOrg({ name, workspaceName });
    if (res?.organization) {
      await refreshData();
      setCurrentTab('dashboard');
    }
    return res;
  };

  // Auth: Join Organization via Token (for logged-in users)
  const handleJoinOrganizationViaToken = async (token: string) => {
    const res = await api.auth.joinInvite(token);
    if (res?.organization) {
      await refreshData();
      setCurrentTab('dashboard');
    }
    return res;
  };

  // Auth: Leave Organization
  const handleLeaveOrganization = async (orgId: string) => {
    const res = await api.auth.leaveOrg(orgId);
    await refreshData();
    return res;
  };

  // Auth: Delete Organization (Owners)
  const handleDeleteOrganization = async (orgId: string) => {
    const res = await api.auth.deleteOrg(orgId);
    await refreshData();
    return res;
  };

  // Auth: Login via Email OTP
  const handleLoginViaOtp = async (email: string, code: string) => {
    const res = await api.auth.loginViaOtp({ email, code });
    if (res?.token && res?.user) {
      setAuthToken(res.token);
      setStoredUser(res.user);
      setCurrentUser(res.user);
      await refreshData();
      setCurrentTab('dashboard');
    }
    return res;
  };

  // Auth: Send OTP
  const handleSendOtp = async (email: string, purpose: 'PASSWORD_RESET' | 'LOGIN' | 'REGISTER') => {
    return await api.auth.sendOtp(email, purpose);
  };

  // Auth: Reset Password via OTP
  const handleResetPasswordViaOtp = async (email: string, code: string, newPass: string) => {
    return await api.auth.resetPasswordViaOtp({ email, code, newPassword: newPass });
  };

  // Auth: Logout
  const handleLogout = () => {
    clearAuthToken();
    clearAllOpticsCache();
    setCurrentUser(null);
    setWorkspaces([]);
    setActiveWorkspaceState(null);
    setProjects([]);
    setActiveProjectState(null);
    setBoard(null);
    setDocuments([]);
    setMembers([]);
    setActivities([]);
  };

  // Filtered Kanban Board based on Search Query
  const filteredBoard = useMemo(() => {
    if (!board) return null;
    // Strictly isolate board to active project - prevent stale data leak across project switches
    if (activeProject && board.projectId && board.projectId !== activeProject.id) {
      return null;
    }
    if (!searchQuery.trim()) {
      return {
        ...board,
        columns: board.columns.map((col) => {
          const colTasks = col.tasks || col.issues || [];
          return {
            ...col,
            tasks: colTasks,
            issues: colTasks,
          };
        }),
      };
    }
    const query = searchQuery.toLowerCase();
    return {
      ...board,
      columns: board.columns.map((col) => {
        const colTasks = col.tasks || col.issues || [];
        const filtered = colTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            t.key.toLowerCase().includes(query) ||
            (t.description && t.description.toLowerCase().includes(query))
        );
        return {
          ...col,
          tasks: filtered,
          issues: filtered,
        };
      }),
    };
  }, [board, searchQuery]);

  // ==========================================
  // INSTANT REFLECTION OPTIMISTIC ACTIONS
  // ==========================================

  // 1. Move Task across columns (0ms Instant UI + Cache Update)
  const handleMoveTask = async (taskId: string, targetColumnId: string) => {
    if (!can('task.move')) {
      console.warn('Action blocked: task.move capability is disabled for your role.');
      return;
    }
    if (!board || !activeProject) return;

    let foundIssue: Issue | null = null;
    for (const col of board.columns) {
      const it = (col.tasks || col.issues || []).find((i) => i.id === taskId);
      if (it) {
        foundIssue = it;
        break;
      }
    }

    if (!foundIssue) return;

    const targetCol = board.columns.find((c) => c.id === targetColumnId);
    const targetStatus = targetCol?.name.toUpperCase().replace(/\s+/g, '_') || foundIssue.status;

    // 0ms Optimistic UI update
    const updatedBoard: Board = {
      ...board,
      columns: board.columns.map((col) => {
        const colItems = (col.tasks || col.issues || []).filter((i) => i.id !== taskId);
        if (col.id === targetColumnId) {
          const movedItem: Issue = { 
            ...foundIssue!, 
            columnId: targetColumnId,
            status: targetStatus,
          };
          return {
            ...col,
            issues: [...colItems, movedItem],
            tasks: [...colItems, movedItem],
          };
        }
        return { 
          ...col, 
          issues: colItems,
          tasks: colItems,
        };
      }),
    };

    setBoard(updatedBoard);
    setCache(`board_${activeProject.id}`, updatedBoard);

    try {
      await api.tasks.move(taskId, { destinationColumnId: targetColumnId });
    } catch (err) {
      console.error('Failed to move task on server:', err);
    }
  };

  // 2. Update Task Details (0ms Instant UI + Cache Update)
  const handleUpdateTask = async (updated: Issue) => {
    if (!can('task.update')) {
      console.warn('Action blocked: task.update capability is disabled for your role.');
      return;
    }
    if (!activeProject) return;

    if (board) {
      const updatedBoard: Board = {
        ...board,
        columns: board.columns.map((col) => {
          const colItems = (col.tasks || col.issues || []).map((i) => (i.id === updated.id ? updated : i));
          return {
            ...col,
            issues: colItems,
            tasks: colItems,
          };
        }),
      };
      setBoard(updatedBoard);
      setCache(`board_${activeProject.id}`, updatedBoard);
    }

    setSelectedTask(updated);

    try {
      await api.tasks.update(updated.id, {
        title: updated.title,
        description: updated.description,
        priority: updated.priority,
        type: updated.type,
        status: updated.status,
        estimate: updated.estimate,
        dueDate: updated.dueDate,
        columnId: updated.columnId,
      });
    } catch (err) {
      console.error('Failed to update task on server:', err);
    }
  };

  // 2b. Update Subtasks / Checklist (Can be updated with task.subtask capability)
  const handleUpdateSubtasks = async (taskId: string, nextSubtasks: Subtask[]) => {
    if (!can('task.subtask') && !can('task.update')) {
      console.warn('Action blocked: task.subtask capability is disabled for your role.');
      return;
    }
    if (!activeProject) return;

    if (board) {
      const updatedBoard: Board = {
        ...board,
        columns: board.columns.map((col) => {
          const colItems = (col.tasks || col.issues || []).map((i) =>
            i.id === taskId ? { ...i, subtasks: nextSubtasks } : i
          );
          return {
            ...col,
            issues: colItems,
            tasks: colItems,
          };
        }),
      };
      setBoard(updatedBoard);
      setCache(`board_${activeProject.id}`, updatedBoard);
    }

    setSelectedTask((prev) => {
      if (!prev || prev.id !== taskId) return prev;
      return { ...prev, subtasks: nextSubtasks };
    });
  };

  const handleAddComment = async (taskId: string, content: string) => {
    if (!can('comment.create')) {
      console.warn('Action blocked: comment.create capability is disabled for your role.');
      return;
    }
    if (!currentUser) return;
    const optimisticComment = {
      id: `comm-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      user: currentUser,
    };
    // Optimistic update to selectedTask
    setSelectedTask((prev) => {
      if (!prev || prev.id !== taskId) return prev;
      const nextComments = [optimisticComment, ...(prev.comments || [])];
      return { ...prev, comments: nextComments, _count: { ...(prev._count || {}), comments: nextComments.length, attachments: prev._count?.attachments || 0 } };
    });
    try {
      const res = await api.tasks.addComment(taskId, content);
      if (res?.comment) {
        setSelectedTask((prev) => {
          if (!prev || prev.id !== taskId) return prev;
          const replaced = (prev.comments || []).map((c) => c.id === optimisticComment.id ? { ...res.comment } : c);
          return { ...prev, comments: replaced };
        });
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // 3. Delete Task (0ms Instant UI + Cache Update)
  const handleDeleteTask = async (taskId: string) => {
    if (!can('task.delete')) {
      console.warn('Action blocked: task.delete capability is disabled for your role.');
      return;
    }
    if (!activeProject) return;

    if (board) {
      const updatedBoard: Board = {
        ...board,
        columns: board.columns.map((col) => {
          const colItems = (col.tasks || col.issues || []).filter((i) => i.id !== taskId);
          return {
            ...col,
            issues: colItems,
            tasks: colItems,
          };
        }),
      };
      setBoard(updatedBoard);
      setCache(`board_${activeProject.id}`, updatedBoard);
    }

    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }

    try {
      await api.tasks.delete(taskId);
    } catch (err) {
      console.error('Failed to delete task on server:', err);
    }
  };

  // 4. Create Task (0ms Instant Optimistic Insert + Background Reconciliation)
  const handleCreateTask = async (data: {
    title: string;
    description: string;
    priority: Priority;
    type: IssueType;
    estimate: number;
    columnId?: string;
    dueDate?: string;
    assigneeIds?: string[];
    labels?: string[];
    subtasks?: string[];
  }) => {
    if (!can('task.create')) {
      console.warn('Action blocked: task.create capability is disabled for your role.');
      return;
    }
    if (!activeProject || !board || board.columns.length === 0) return;

    const targetColId = data.columnId || board.columns[0].id;
    const targetCol = board.columns.find((c) => c.id === targetColId) || board.columns[0];
    const totalExistingTasks = board.columns.reduce((sum, col) => sum + (col.tasks || col.issues || []).length, 0);

    const tempId = `task-temp-${Date.now()}`;
    const mappedAssignees = (data.assigneeIds || [])
      .map((uid) => members.find((m) => m.user.id === uid)?.user)
      .filter((u): u is User => Boolean(u))
      .map((u) => ({ user: u }));

    const mappedLabels = (data.labels || []).map((l, i) => ({
      label: { id: `lbl-temp-${i}-${Date.now()}`, name: l, color: 'var(--text-main)' }
    }));

    const mappedSubtasks = (data.subtasks || []).map((s, i) => ({
      id: `st-temp-${i}-${Date.now()}`,
      title: s,
      completed: false,
    }));

    const optimisticTask: Issue = {
      id: tempId,
      key: `${activeProject.key}-${totalExistingTasks + 1}`,
      title: data.title,
      description: data.description,
      priority: data.priority,
      type: data.type,
      status: targetCol.name.toUpperCase().replace(/\s+/g, '_'),
      estimate: data.estimate,
      dueDate: data.dueDate,
      position: 0,
      boardId: board.id,
      projectId: activeProject.id,
      columnId: targetColId,
      assignees: mappedAssignees,
      labels: mappedLabels,
      subtasks: mappedSubtasks,
      attachments: [],
      comments: [],
    };

    // 0ms Optimistic UI update
    const updatedBoard: Board = {
      ...board,
      columns: board.columns.map((col) => {
        if (col.id === targetColId) {
          const colItems = [optimisticTask, ...(col.tasks || col.issues || [])];
          return {
            ...col,
            issues: colItems,
            tasks: colItems,
          };
        }
        return col;
      }),
    };

    setBoard(updatedBoard);
    setCache(`board_${activeProject.id}`, updatedBoard);

    // Optimistic Activity
    const optimisticActivity: ActivityLog = {
      id: `act-${Date.now()}`,
      action: 'CREATED_TASK',
      entityType: 'TASK',
      entityId: tempId,
      metadata: { title: data.title, key: optimisticTask.key },
      createdAt: new Date().toISOString(),
      user: currentUser || { id: 'u1', name: 'Optics Lead', email: 'lead@ivors.in' },
    };
    const nextActivities = [optimisticActivity, ...activities];
    setActivities(nextActivities);
    setCache('activities', nextActivities);

    try {
      const res = await api.tasks.create({
        projectId: activeProject.id,
        title: data.title,
        description: data.description,
        priority: data.priority,
        type: data.type,
        estimate: data.estimate,
        columnId: targetColId,
      });

      if (res?.issue) {
        const realTask: Issue = res.issue;
        setBoard((curr) => {
          if (!curr) return null;
          const reconciled: Board = {
            ...curr,
            columns: curr.columns.map((col) => ({
              ...col,
              issues: (col.tasks || col.issues || []).map((i) => (i.id === tempId ? realTask : i)),
              tasks: (col.tasks || col.issues || []).map((i) => (i.id === tempId ? realTask : i)),
            })),
          };
          setCache(`board_${activeProject.id}`, reconciled);
          return reconciled;
        });
      }
    } catch (err) {
      console.error('Failed to create task on server:', err);
    }
  };

  // 5. Add Board Column (0ms Instant UI + Cache Update)
  const handleAddColumn = async (name: string, color: string) => {
    if (!board || !activeProject) return;

    const tempColId = `col-temp-${Date.now()}`;
    const optimisticCol: BoardColumn = {
      id: tempColId,
      name,
      position: board.columns.length + 1,
      color: color || '#38bdf8',
      issues: [],
      tasks: [],
    };

    const updatedBoard: Board = {
      ...board,
      columns: [...board.columns, optimisticCol],
    };

    setBoard(updatedBoard);
    setCache(`board_${activeProject.id}`, updatedBoard);

    try {
      const res = await api.boards.addColumn(board.id, { name, color });
      if (res?.column) {
        setBoard((curr) => {
          if (!curr) return null;
          const reconciled: Board = {
            ...curr,
            columns: curr.columns.map((c) => (c.id === tempColId ? { ...res.column, issues: [], tasks: [] } : c)),
          };
          setCache(`board_${activeProject.id}`, reconciled);
          return reconciled;
        });
      }
    } catch (err) {
      console.error('Failed to add column on server:', err);
    }
  };

  // 6. Delete Board Column (0ms Instant UI + Cache Update)
  const handleDeleteColumn = async (columnId: string) => {
    if (!board || !activeProject) return;

    const updatedBoard: Board = {
      ...board,
      columns: board.columns.filter((c) => c.id !== columnId),
    };

    setBoard(updatedBoard);
    setCache(`board_${activeProject.id}`, updatedBoard);

    try {
      await api.boards.deleteColumn(board.id, columnId);
    } catch (err) {
      console.error('Failed to delete column on server:', err);
    }
  };

  // 7. Create Project (0ms Instant UI + Cache Update)
  const handleCreateProject = async (data: { name: string; key: string; description: string; color: string; workspaceId?: string }) => {
    const tempProjId = `proj-temp-${Date.now()}`;
    const defaultBoardId = `board-temp-${Date.now()}`;
    
    const defaultBoard: Board = {
      id: defaultBoardId,
      name: `${data.name} Board`,
      projectId: tempProjId,
      columns: [
        { id: `col-1-${tempProjId}`, name: 'To Do', position: 1, color: '#a1a1aa', issues: [], tasks: [] },
        { id: `col-2-${tempProjId}`, name: 'In Progress', position: 2, color: '#38bdf8', issues: [], tasks: [] },
        { id: `col-3-${tempProjId}`, name: 'Done', position: 3, color: '#10b981', issues: [], tasks: [] },
      ],
    };

    const optimisticProj: Project = {
      id: tempProjId,
      name: data.name,
      key: data.key.toUpperCase(),
      description: data.description,
      color: data.color || '#38bdf8',
      boards: [defaultBoard],
    };

    const nextProjects = [optimisticProj, ...projects];
    setProjects(nextProjects);
    setActiveProjectState(optimisticProj);
    setBoard(defaultBoard);
    setCache('projects', nextProjects);
    setCache('active_project', optimisticProj);
    setCache(`board_${tempProjId}`, defaultBoard);
    setCurrentTab('board');

    try {
      const res = await api.projects.create({
        ...data,
        workspaceId: data.workspaceId || activeWorkspace?.id,
      });
      if (res?.project) {
        const realProj: Project = res.project;
        setProjects((curr) => {
          const reconciled = curr.map((p) => (p.id === tempProjId ? realProj : p));
          setCache('projects', reconciled);
          return reconciled;
        });
        setActiveProjectState(realProj);
        setCache('active_project', realProj);
        if (realProj.boards && realProj.boards.length > 0) {
          setBoard(realProj.boards[0]);
          setCache(`board_${realProj.id}`, realProj.boards[0]);
        }
      }
    } catch (err) {
      console.error('Failed to create project on server:', err);
    }
  };

  const handleUpdateProject = async (projectId: string, data: { name?: string; description?: string; color?: string; workspaceId?: string }) => {
    const nextProjects = projects.map((p) => (p.id === projectId ? { ...p, ...data } : p));
    setProjects(nextProjects);
    setCache('projects', nextProjects);
    if (activeProject?.id === projectId) {
      const updatedActive = { ...activeProject, ...data };
      setActiveProjectState(updatedActive);
      setCache('active_project', updatedActive);
    }

    try {
      await api.projects.update(projectId, data);
      await refreshData();
    } catch (err) {
      console.error('Failed to update project on server:', err);
    }
  };

  // Workspace Handlers
  const handleCreateWorkspace = async (data: { name: string; description?: string }) => {
    const tempWsId = `ws-temp-${Date.now()}`;
    const optimisticWs: Workspace = {
      id: tempWsId,
      name: data.name,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      organizationId: 'default-org',
      projects: [],
      _count: { projects: 0, members: 1 },
    };

    const nextWorkspaces = [...workspaces, optimisticWs];
    setWorkspaces(nextWorkspaces);
    setCache('workspaces', nextWorkspaces);
    setActiveWorkspace(optimisticWs);

    try {
      const res = await api.workspaces.create(data);
      if (res?.workspace) {
        setWorkspaces((curr) => {
          const reconciled = curr.map((w) => (w.id === tempWsId ? res.workspace : w));
          setCache('workspaces', reconciled);
          return reconciled;
        });
        setActiveWorkspace(res.workspace);
      }
    } catch (err) {
      console.error('Failed to create workspace on server:', err);
    }
  };

  const handleUpdateWorkspace = async (workspaceId: string, name: string) => {
    const nextWorkspaces = workspaces.map((w) => (w.id === workspaceId ? { ...w, name } : w));
    setWorkspaces(nextWorkspaces);
    setCache('workspaces', nextWorkspaces);
    if (activeWorkspace?.id === workspaceId) {
      setActiveWorkspace({ ...activeWorkspace, name });
    }

    try {
      await api.workspaces.update(workspaceId, { name });
    } catch (err) {
      console.error('Failed to update workspace on server:', err);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    const nextWorkspaces = workspaces.filter((w) => w.id !== workspaceId);
    setWorkspaces(nextWorkspaces);
    setCache('workspaces', nextWorkspaces);
    if (activeWorkspace?.id === workspaceId && nextWorkspaces.length > 0) {
      setActiveWorkspace(nextWorkspaces[0]);
    }

    try {
      await api.workspaces.delete(workspaceId);
    } catch (err) {
      console.error('Failed to delete workspace on server:', err);
    }
  };

  // 8. Create Doc (0ms Instant UI + Cache Update)
  const handleCreateDoc = async (title: string, template: string) => {
    let content = `# ${title}\n\nStart writing documentation...`;
    if (template === 'specs') {
      content = `# ${title}\n\n## 1. Problem Statement\nDescribe the user requirement or business motivation.\n\n## 2. Technical Architecture\n- Components affected\n- Database schema updates\n- API endpoint definitions\n\n## 3. Acceptance Criteria\n- [ ] Unit & integration tests pass\n- [ ] Performance within SLA`;
    } else if (template === 'notes') {
      content = `# ${title}\n\n**Date:** ${new Date().toLocaleDateString()}\n**Attendees:** ${currentUser?.name || 'Optics Team'}\n\n## Discussion Points\n1. Sprint progress and blocker resolution\n2. Next release milestone goals\n\n## Action Items\n- [ ] Review pending PRs\n- [ ] Finalize RBAC permissions`;
    }

    if (!can('doc.create')) {
      console.warn('Action blocked: doc.create capability is disabled for your role.');
      return;
    }

    const targetProjId = activeProject?.id;
    const tempDocId = `doc-temp-${Date.now()}`;
    const optimisticDoc: Document = {
      id: tempDocId,
      title,
      content,
      updatedAt: new Date().toISOString(),
      author: currentUser || undefined,
    };

    const nextDocs = [optimisticDoc, ...documents];
    setDocuments(nextDocs);
    if (targetProjId) {
      setCache(`docs_${targetProjId}`, nextDocs);
    }
    setCache('documents', nextDocs);

    try {
      const res = await api.docs.create({
        title,
        content,
        projectId: targetProjId,
      });

      if (res?.document) {
        setDocuments((curr) => {
          const reconciled = curr.map((d) => (d.id === tempDocId ? res.document : d));
          if (targetProjId) setCache(`docs_${targetProjId}`, reconciled);
          setCache('documents', reconciled);
          return reconciled;
        });
      }
    } catch (err) {
      console.error('Failed to create document on server:', err);
    }
  };

  // 9. Save Doc (0ms Instant UI + Cache Update)
  const handleSaveDoc = async (doc: Document) => {
    if (!can('doc.create')) {
      console.warn('Action blocked: doc.create capability is disabled for your role.');
      return;
    }
    const targetProjId = activeProject?.id;
    const nextDocs = documents.map((d) => (d.id === doc.id ? doc : d));
    setDocuments(nextDocs);
    if (targetProjId) {
      setCache(`docs_${targetProjId}`, nextDocs);
    }
    setCache('documents', nextDocs);

    try {
      await api.docs.update(doc.id, {
        title: doc.title,
        content: doc.content,
      });
    } catch (err) {
      console.error('Failed to save document on server:', err);
    }
  };

  // 10. Delete Doc (0ms Instant UI + Cache Update)
  const handleDeleteDoc = async (docId: string) => {
    if (!can('doc.delete')) {
      console.warn('Action blocked: doc.delete capability is disabled for your role.');
      return;
    }
    const targetProjId = activeProject?.id;
    const nextDocs = documents.filter((d) => d.id !== docId);
    setDocuments(nextDocs);
    if (targetProjId) {
      setCache(`docs_${targetProjId}`, nextDocs);
    }
    setCache('documents', nextDocs);

    try {
      await api.docs.delete(docId);
    } catch (err) {
      console.error('Failed to delete document on server:', err);
    }
  };

  // 11. Invite Member (0ms Instant UI + Cache Update)
  const handleInviteMember = async (data: { name: string; email: string; role: string; team: string; workspaceId?: string }) => {
    const tempUserId = `u-temp-${Date.now()}`;
    const targetWsId = data.workspaceId || activeWorkspace?.id;
    const optimisticMember: MemberItem = {
      user: {
        id: tempUserId,
        name: data.name,
        email: data.email,
      },
      role: data.role,
      team: data.team,
      workspaceId: targetWsId,
    };

    const nextMembers = [...members, optimisticMember];
    setMembers(nextMembers);
    setCache('members', nextMembers);

    try {
      const res = await api.teams.invite(data);
      if (res?.member) {
        setMembers((curr) => {
          const reconciled = curr.map((m) => (m.user.id === tempUserId ? { ...res.member, workspaceId: targetWsId } : m));
          setCache('members', reconciled);
          return reconciled;
        });
      }
      return res;
    } catch (err) {
      console.error('Failed to invite member on server:', err);
      throw err;
    }
  };

  // 12. Update Member Role & Team (0ms Instant UI + Cache Update)
  const handleUpdateMember = async (userId: string, data: { role?: string; team?: string; workspaceId?: string }) => {
    const nextMembers = members.map((m) => {
      if (m.user.id === userId) {
        return {
          ...m,
          role: data.role !== undefined ? data.role : m.role,
          team: data.team !== undefined ? data.team : m.team,
          workspaceId: data.workspaceId !== undefined ? data.workspaceId : m.workspaceId,
        };
      }
      return m;
    });
    setMembers(nextMembers);
    setCache('members', nextMembers);

    try {
      await api.teams.updateMember(userId, data);
    } catch (err) {
      console.error('Failed to update member on server:', err);
    }
  };

  const handleUpdateMemberRole = async (userId: string, newRole: string) => {
    await handleUpdateMember(userId, { role: newRole });
  };

  const handleUpdateMemberTeam = async (userId: string, newTeam: string) => {
    await handleUpdateMember(userId, { team: newTeam });
  };

  // 13. Remove Member (0ms Instant UI + Cache Update)
  const handleRemoveMember = async (userId: string) => {
    const nextMembers = members.filter((m) => m.user.id !== userId);
    setMembers(nextMembers);
    setCache('members', nextMembers);

    try {
      await api.teams.remove(userId);
    } catch (err) {
      console.error('Failed to remove member on server:', err);
    }
  };

  // 14. Profile Handlers
  const handleUpdateProfile = async (data: { name?: string; jobTitle?: string; avatarUrl?: string }) => {
    if (currentUser) {
      const updated = { ...currentUser, ...data };
      setCurrentUser(updated);
      setStoredUser(updated);
    }
    await api.auth.updateProfile(data);
  };

  const handleUpdatePassword = async (data: { currentPassword?: string; newPassword: string }) => {
    await api.auth.updatePassword(data);
  };

  // 15. RBAC Handlers
  const handleCreateRole = async (data: { name: string; description?: string; permissionCodes?: string[] }) => {
    await api.rbac.createRole(data);
  };

  const handleDeleteRole = async (roleId: string) => {
    await api.rbac.deleteRole(roleId);
  };

  const handleToggleRolePermission = async (roleId: string, permissionCode: string, enabled: boolean) => {
    const matchedRole = rbacRoles.find(
      (r: any) => r.id === roleId || r.name?.toLowerCase() === roleId.toLowerCase()
    );
    const targetRoleId = matchedRole?.id || roleId;
    const roleName = matchedRole?.name;

    // Standardize permission code
    const stdCode = permissionCode.startsWith('issue.')
      ? permissionCode.replace('issue.', 'task.')
      : permissionCode.startsWith('document.')
      ? permissionCode.replace('document.', 'doc.')
      : permissionCode;

    const toRemove = [
      stdCode,
      permissionCode,
      ...(PERMISSION_ALIASES[stdCode] || []),
      ...(PERMISSION_ALIASES[permissionCode] || []),
    ];

    // Mark local mutation timestamp to suppress echo broadcast jitter
    localMutationTimestampsRef.current.set(targetRoleId, Date.now());
    localMutationTimestampsRef.current.set(roleId, Date.now());
    if (roleName) {
      localMutationTimestampsRef.current.set(roleName.toLowerCase(), Date.now());
      localMutationTimestampsRef.current.set(roleName, Date.now());
    }

    // 0ms instantaneous optimistic UI update in context
    setRbacMatrix((prev) => {
      const currentPerms =
        prev[targetRoleId] ||
        (roleName ? prev[roleName.toLowerCase()] : []) ||
        prev[roleId] ||
        [];
      const nextPerms = enabled
        ? Array.from(new Set([...currentPerms.filter((p) => !toRemove.includes(p)), stdCode]))
        : currentPerms.filter((p) => !toRemove.includes(p));

      const updated: Record<string, string[]> = {
        ...prev,
        [targetRoleId]: nextPerms,
        [roleId]: nextPerms,
      };
      if (roleName) {
        updated[roleName.toLowerCase()] = nextPerms;
        updated[roleName] = nextPerms;
      }
      setCache('rbac_matrix', updated);
      return updated;
    });

    // Enqueue mutation sequentially per targetRoleId to prevent race conditions on rapid clicks
    const previousQueue = roleMutationQueueRef.current.get(targetRoleId) || Promise.resolve();
    const currentTask = previousQueue
      .then(async () => {
        try {
          const res = await api.rbac.updatePermissions(targetRoleId, {
            permissionCode: stdCode,
            enabled,
          });
          if (res?.permissionCodes && Array.isArray(res.permissionCodes)) {
            const lastMutation = localMutationTimestampsRef.current.get(targetRoleId) || 0;
            // Only reconcile with server response if no newer clicks happened within 600ms
            if (Date.now() - lastMutation > 600) {
              setRbacMatrix((prev) => {
                const updated: Record<string, string[]> = {
                  ...prev,
                  [targetRoleId]: res.permissionCodes!,
                  [roleId]: res.permissionCodes!,
                };
                if (roleName) {
                  updated[roleName.toLowerCase()] = res.permissionCodes!;
                  updated[roleName] = res.permissionCodes!;
                }
                setCache('rbac_matrix', updated);
                return updated;
              });
            }
          }
        } catch (err) {
          console.error('Failed to toggle role permission on server:', err);
        }
      })
      .catch((err) => {
        console.error('Queue execution error on role mutation:', err);
      });

    roleMutationQueueRef.current.set(targetRoleId, currentTask);
    await currentTask;
  };

  const handleSaveRbacMatrix = async (newMatrix: Record<string, string[]>) => {
    // 1. Immediately update context state & localStorage cache
    setRbacMatrix(newMatrix);
    setCache('rbac_matrix', newMatrix);

    // 2. Single atomic batch API call to sync entire matrix in one database transaction
    await api.rbac.syncMatrix(newMatrix);
  };

  // Dynamic 15-Day Notifications Synthesis & State Management
  const notifications = useMemo<NotificationItem[]>(() => {
    // 1. Transform platform activity logs within 15 days into interactive notifications
    const activityNotifications: NotificationItem[] = (activities || [])
      .filter((act) => isWithin15Days(act.createdAt))
      .map((act) => {
        const actionUpper = (act.action || '').toUpperCase();
        const userName = act.user?.name || act.user?.email || 'A teammate';
        let title = 'Workspace Activity';
        let message = `${userName} performed an action`;
        let type: NotificationItem['type'] = 'system';
        const isTaskEntity = act.entityType?.toLowerCase() === 'task' || act.entityType?.toLowerCase() === 'issue';
        const isDocEntity = act.entityType?.toLowerCase() === 'document' || act.entityType?.toLowerCase() === 'doc';
        
        let taskId = isTaskEntity ? act.entityId : undefined;
        let taskKey = act.metadata?.key || act.metadata?.taskKey;
        let docId = isDocEntity ? act.entityId : undefined;

        if (actionUpper.includes('CREATE') && isTaskEntity) {
          title = 'Task Created';
          message = `${userName} created task ${taskKey ? `[${taskKey}] ` : ''}"${act.metadata?.title || 'New Task'}"`;
          type = 'task';
        } else if (actionUpper.includes('MOVE') || actionUpper.includes('STATUS')) {
          title = 'Task Status Updated';
          message = `${userName} moved ${taskKey || 'task'} to ${act.metadata?.status || 'new status'}`;
          type = 'status';
        } else if (actionUpper.includes('ASSIGN')) {
          title = 'Task Assigned';
          message = `${userName} assigned ${taskKey || 'task'}`;
          type = 'assign';
        } else if (actionUpper.includes('COMMENT')) {
          title = 'New Comment';
          message = `${userName} commented on ${taskKey || 'task'}: "${act.metadata?.preview || act.metadata?.content || 'New update'}"`;
          type = 'mention';
        } else if (isDocEntity) {
          title = 'Document Updated';
          message = `${userName} updated document "${act.metadata?.title || 'Wiki Doc'}"`;
          type = 'doc';
        } else if (actionUpper.includes('INVITE') || actionUpper.includes('MEMBER')) {
          title = 'Team Member Invited';
          message = `${userName} invited ${act.metadata?.email || 'a new team member'}`;
          type = 'invite';
        }

        return {
          id: `act-notif-${act.id}`,
          title,
          message,
          time: formatNotificationTime(act.createdAt),
          createdAt: act.createdAt || new Date().toISOString(),
          read: readNotificationIds.includes(`act-notif-${act.id}`),
          type,
          taskId,
          taskKey,
          docId,
        };
      });

    // 2. Custom local notifications (also filtered by max 15 days)
    const validCustom = customNotifications
      .filter((n) => isWithin15Days(n.createdAt))
      .map((n) => ({
        ...n,
        time: formatNotificationTime(n.createdAt),
        read: readNotificationIds.includes(n.id) || n.read,
      }));

    // Fallback welcome message if workspace has zero activities yet
    const fallbackList: NotificationItem[] = [
      {
        id: 'n-welcome',
        title: 'Optics Cloud Live',
        message: 'Connected to workspace PostgreSQL. Instant updates enabled.',
        time: 'Just now',
        createdAt: new Date().toISOString(),
        read: readNotificationIds.includes('n-welcome'),
        type: 'status',
      },
    ];

    const merged = [...validCustom, ...activityNotifications];
    const pool = merged.length > 0 ? merged : fallbackList;

    // Filter out cleared items & deduplicate by ID
    const clearedSet = new Set(clearedNotificationIds);
    const seenIds = new Set<string>();
    const result: NotificationItem[] = [];

    for (const item of pool) {
      if (clearedSet.has(item.id)) continue;
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      result.push(item);
    }

    // Sort descending by creation timestamp
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activities, customNotifications, readNotificationIds, clearedNotificationIds]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const addNotification = useCallback((item: {
    title: string;
    message: string;
    type?: NotificationItem['type'];
    taskId?: string;
    taskKey?: string;
    docId?: string;
    createdAt?: string;
  }) => {
    const createdAt = item.createdAt || new Date().toISOString();
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: item.title,
      message: item.message,
      time: formatNotificationTime(createdAt),
      createdAt,
      read: false,
      type: item.type || 'system',
      taskId: item.taskId,
      taskKey: item.taskKey,
      docId: item.docId,
    };

    setCustomNotifications((prev) => {
      const next = [newNotif, ...prev.filter((n) => isWithin15Days(n.createdAt))].slice(0, 50);
      setCache('custom_notifications', next);
      return next;
    });
  }, []);

  const handleMarkAllNotificationsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setReadNotificationIds((prev) => {
      const updated = Array.from(new Set([...prev, ...allIds]));
      setCache('read_notification_ids', updated);
      return updated;
    });
    setCustomNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      setCache('custom_notifications', next);
      return next;
    });
  }, [notifications]);

  const handleMarkNotificationRead = useCallback((id: string) => {
    setReadNotificationIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      setCache('read_notification_ids', updated);
      return updated;
    });
    setCustomNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      setCache('custom_notifications', next);
      return next;
    });
  }, []);

  const handleClearNotification = useCallback((id: string) => {
    setClearedNotificationIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      setCache('cleared_notification_ids', updated);
      return updated;
    });
    setCustomNotifications((prev) => {
      const next = prev.filter((n) => n.id !== id);
      setCache('custom_notifications', next);
      return next;
    });
  }, []);

  const handleClearAllNotifications = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setClearedNotificationIds((prev) => {
      const updated = Array.from(new Set([...prev, ...allIds]));
      setCache('cleared_notification_ids', updated);
      return updated;
    });
    setCustomNotifications([]);
    setCache('custom_notifications', []);
  }, [notifications]);

  const handleNotificationClick = useCallback((n: NotificationItem) => {
    handleMarkNotificationRead(n.id);
    if (n.taskId || n.taskKey) {
      if (board) {
        for (const col of board.columns) {
          const found = (col.tasks || col.issues || []).find(
            (t) => (n.taskId && t.id === n.taskId) || (n.taskKey && t.key === n.taskKey)
          );
          if (found) {
            setSelectedTask(found);
            setIsNotificationOpen(false);
            setCurrentTabState('board');
            return;
          }
        }
      }
      setIsNotificationOpen(false);
      setCurrentTabState('board');
    } else if (n.docId) {
      setIsNotificationOpen(false);
      setCurrentTabState('docs');
    } else if (n.type === 'invite') {
      setIsNotificationOpen(false);
      setCurrentTabState('workspace-settings');
    }
  }, [board, handleMarkNotificationRead]);

  // Determine effective role & admin status safely without privilege leakage
  const userMember = members.find(
    (m) =>
      m.user?.id === currentUser?.id ||
      (currentUser?.email && m.user?.email?.toLowerCase() === currentUser.email.toLowerCase())
  );
  const rawRole = (userMember?.role || currentUser?.role || '').toLowerCase();
  const isOrgOwner = rawRole === 'owner' || rawRole === 'organization owner' || rawRole === 'role-owner';
  const isAdmin = isOrgOwner || rawRole.includes('admin') || (Boolean(currentUser) && members.length === 0);

  const currentUserRole: 'owner' | 'admin' | 'member' | 'viewer' = isOrgOwner
    ? 'owner'
    : rawRole.includes('admin')
    ? 'admin'
    : rawRole.includes('viewer')
    ? 'viewer'
    : (userMember || members.length === 0)
    ? 'member'
    : 'viewer';

  // Live Capability Evaluator: Evaluates permissions dynamically against rbacMatrix with alias support
  const can = useCallback(
    (permCode: string): boolean => {
      if (!currentUser) return false;
      // ONLY Organization Owner is an immutable superuser wildcard bypass
      if (isOrgOwner) return true;

      const effectiveRole = userMember?.role || currentUser.role || 'Member';
      const roleLower = effectiveRole.toLowerCase();

      // Look up role in rbacRoles or fallback
      const matchedRole = rbacRoles.find(
        (r) => r.name?.toLowerCase() === roleLower || r.id === effectiveRole
      );

      const perms =
        (matchedRole && rbacMatrix[matchedRole.id]) ||
        (matchedRole && rbacMatrix[matchedRole.name.toLowerCase()]) ||
        rbacMatrix[effectiveRole] ||
        rbacMatrix[roleLower] ||
        DEFAULT_MATRIX[roleLower] ||
        [];

      if (perms.includes('*')) return true;
      if (perms.includes(permCode)) return true;

      const aliases = PERMISSION_ALIASES[permCode] || [];
      return aliases.some((alias) => perms.includes(alias));
    },
    [currentUser, isOrgOwner, userMember?.role, rbacRoles, rbacMatrix]
  );

  // Real-time WebSocket connection to sync RBAC permissions & roles live across clients
  useEffect(() => {
    const socketUrl = ENV.SOCKET_URL;
    const socket: Socket = socketIO(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.on('permissions_matrix_sync', (data: any) => {
      const roleId = data.roleId;
      const roleName = data.roleName;

      // If client just performed a local mutation on this role within 1200ms, ignore echo to prevent flicker
      const lastLocalMutation =
        (roleId ? localMutationTimestampsRef.current.get(roleId) : 0) ||
        (roleName ? localMutationTimestampsRef.current.get(roleName.toLowerCase()) : 0) ||
        (roleName ? localMutationTimestampsRef.current.get(roleName) : 0) ||
        0;

      if (Date.now() - lastLocalMutation < 1200) {
        return;
      }

      setRbacMatrix((prev) => {
        const current =
          prev[roleId] ||
          (roleName ? prev[roleName.toLowerCase()] : []) ||
          (roleName ? prev[roleName] : []) ||
          [];

        let updatedCodes: string[];
        if (Array.isArray(data.permissionCodes)) {
          updatedCodes = data.permissionCodes;
        } else if (data.enabled) {
          updatedCodes = Array.from(new Set([...current, data.permissionCode]));
        } else {
          const toRemove = [data.permissionCode, ...(PERMISSION_ALIASES[data.permissionCode] || [])];
          updatedCodes = current.filter((p: string) => !toRemove.includes(p));
        }

        const normalizedCodes = Array.from(
          new Set(
            updatedCodes.map((c) =>
              c.startsWith('issue.')
                ? c.replace('issue.', 'task.')
                : c.startsWith('document.')
                ? c.replace('document.', 'doc.')
                : c
            )
          )
        );

        const nextMatrix: Record<string, string[]> = { ...prev, [roleId]: normalizedCodes };
        if (roleName) {
          nextMatrix[roleName.toLowerCase()] = normalizedCodes;
          nextMatrix[roleName] = normalizedCodes;
        }
        setCache('rbac_matrix', nextMatrix);
        return nextMatrix;
      });
    });

    socket.on('member_role_sync', (data: any) => {
      console.log('⚡ [Live RBAC] Received member role update:', data);
      setMembers((prev) => {
        const nextMembers = prev.map((m) =>
          m.user.id === data.userId ? { ...m, role: data.role, team: data.team || m.team } : m
        );
        setCache('members', nextMembers);
        return nextMembers;
      });
    });

    // Real-time collaborative documents synchronization
    socket.on('doc_created_sync', (data: any) => {
      console.log('⚡ [Live Docs] Received new document created:', data);
      if (data?.doc) {
        const incomingDoc: Document = data.doc;
        const targetProjId = data.projectId || incomingDoc.projectId;
        
        if (targetProjId) {
          const cached = getCache<Document[]>(`docs_${targetProjId}`, []);
          if (!cached.some((d) => d.id === incomingDoc.id)) {
            setCache(`docs_${targetProjId}`, [incomingDoc, ...cached]);
          }
        }

        setDocuments((prev) => {
          if (prev.some((d) => d.id === incomingDoc.id)) return prev;
          if (activeProjectRef.current && targetProjId && targetProjId !== activeProjectRef.current.id) return prev;
          return [incomingDoc, ...prev];
        });
      }
    });

    socket.on('doc_updated_sync', (data: any) => {
      console.log('⚡ [Live Docs] Received document update:', data);
      if (data?.doc) {
        const updatedDoc: Document = data.doc;
        const targetProjId = data.projectId || updatedDoc.projectId;

        if (targetProjId) {
          const cached = getCache<Document[]>(`docs_${targetProjId}`, []);
          setCache(
            `docs_${targetProjId}`,
            cached.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
          );
        }

        setDocuments((prev) =>
          prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d))
        );
      }
    });

    socket.on('doc_deleted_sync', (data: any) => {
      console.log('⚡ [Live Docs] Received document deletion:', data);
      if (data?.docId) {
        const targetDocId = data.docId;
        const targetProjId = data.projectId;

        if (targetProjId) {
          const cached = getCache<Document[]>(`docs_${targetProjId}`, []);
          setCache(
            `docs_${targetProjId}`,
            cached.filter((d) => d.id !== targetDocId)
          );
        }

        setDocuments((prev) => prev.filter((d) => d.id !== targetDocId));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Strict Workspace Scoping 1: Visible Workspaces (Admins see all; normal members see only assigned workspaces)
  const visibleWorkspaces = useMemo(() => {
    if (isAdmin) return workspaces;
    if (!currentUser) return workspaces;

    const userWorkspaces = workspaces.filter((ws) => {
      // Explicit member in ws.members
      const isExplicitMember = ws.members?.some(
        (m) =>
          m.user.id === currentUser.id ||
          (currentUser.email && m.user.email?.toLowerCase() === currentUser.email.toLowerCase())
      );
      if (isExplicitMember) return true;

      // Project membership within this workspace
      const hasProjectInWs = projects.some(
        (p) =>
          (p.workspaceId === ws.id || (!p.workspaceId && ws.slug === 'primary')) &&
          p.members?.some(
            (pm) =>
              pm.user.id === currentUser.id ||
              (currentUser.email && pm.user.email?.toLowerCase() === currentUser.email.toLowerCase())
          )
      );
      if (hasProjectInWs) return true;

      // Primary workspace fallback for default access
      return ws.slug === 'primary' || ws.id === 'default-ws';
    });

    return userWorkspaces.length > 0 ? userWorkspaces : workspaces.slice(0, 1);
  }, [workspaces, isAdmin, currentUser, projects]);

  // Keep active workspace within visible workspaces
  useEffect(() => {
    if (visibleWorkspaces.length > 0 && activeWorkspace) {
      const hasAccess = visibleWorkspaces.some((w) => w.id === activeWorkspace.id);
      if (!hasAccess) {
        setActiveWorkspaceState(visibleWorkspaces[0]);
        setCache('active_workspace', visibleWorkspaces[0]);
      }
    }
  }, [visibleWorkspaces, activeWorkspace]);

  // Strict Workspace Scoping 2: Workspace Members (Scoped to activeWorkspace)
  const workspaceMembers = useMemo(() => {
    if (!activeWorkspace) return members;

    return members.filter((m) => {
      // Org owners & admins are visible across all workspaces
      const isOwnerOrAdmin =
        m.role === 'Organization Owner' ||
        m.role === 'Workspace Admin' ||
        m.role.toLowerCase().includes('owner') ||
        m.role.toLowerCase().includes('admin');
      if (isOwnerOrAdmin) return true;

      // Explicit workspace assignment
      if (m.workspaceId && m.workspaceId === activeWorkspace.id) return true;
      if (m.workspaceIds && m.workspaceIds.includes(activeWorkspace.id)) return true;

      // Explicit workspace.members list
      if (
        activeWorkspace.members?.some(
          (wm) =>
            wm.user.id === m.user.id ||
            (m.user.email && wm.user.email?.toLowerCase() === m.user.email.toLowerCase())
        )
      ) {
        return true;
      }

      // Project membership within this workspace
      const inWsProject = projects.some(
        (p) =>
          (p.workspaceId === activeWorkspace.id || (!p.workspaceId && activeWorkspace.slug === 'primary')) &&
          p.members?.some(
            (pm) =>
              pm.user.id === m.user.id ||
              (m.user.email && pm.user.email?.toLowerCase() === m.user.email.toLowerCase())
          )
      );
      if (inWsProject) return true;

      // If active workspace is primary and member has no explicit other workspace
      if (activeWorkspace.slug === 'primary' && !m.workspaceId) {
        return true;
      }

      return false;
    });
  }, [members, activeWorkspace, projects]);

  // Strict Workspace Scoping 3: Workspace Projects (Scoped to activeWorkspace)
  const workspaceProjects = useMemo(() => {
    if (!activeWorkspace) return projects;
    return projects.filter(
      (p) =>
        p.workspaceId === activeWorkspace.id ||
        (!p.workspaceId && activeWorkspace.slug === 'primary') ||
        activeWorkspace.projects?.some((wp) => wp.id === p.id)
    );
  }, [projects, activeWorkspace]);

  return (
    <OpticsContext.Provider
      value={{
        currentUser,
        currentUserRole,
        isAdmin,
        can,
        rbacMatrix,
        isAuthenticated: !!currentUser,
        authLoading,
        handleLogin,
        handleRegister,
        handleAcceptInvite,
        handleCreateOrganization,
        handleJoinOrganizationViaToken,
        handleLeaveOrganization,
        handleDeleteOrganization,
        handleLoginViaOtp,
        handleSendOtp,
        handleResetPasswordViaOtp,
        handleLogout,
        handleUpdateProfile,
        handleUpdatePassword,
        currentTheme,
        setCurrentTheme,
        currentTab,
        setCurrentTab,
        workspaces: visibleWorkspaces,
        allWorkspaces: workspaces,
        activeWorkspace,
        setActiveWorkspace,
        projects,
        workspaceProjects,
        activeProject,
        setActiveProject: handleSelectProject,
        board,
        filteredBoard,
        documents,
        activities,
        members,
        workspaceMembers,
        teams,
        notifications,
        unreadCount,
        searchQuery,
        setSearchQuery,
        loading,
        boardLoading,
        docsLoading,
        workspaceLoading,
        isBackgroundSyncing,
        refreshData,
        isNotificationOpen,
        setIsNotificationOpen,
        selectedTask,
        setSelectedTask,
        isCreateTaskOpen,
        setIsCreateTaskOpen,
        targetColumnForCreate,
        setTargetColumnForCreate,
        isCreateWorkspaceOpen,
        setIsCreateWorkspaceOpen,
        isCreateProjectOpen,
        setIsCreateProjectOpen,
        isCreateDocOpen,
        setIsCreateDocOpen,
        isInviteMemberOpen,
        setIsInviteMemberOpen,
        handleCreateWorkspace,
        handleUpdateWorkspace,
        handleDeleteWorkspace,
        handleMoveTask,
        handleUpdateTask,
        handleUpdateSubtasks,
        handleDeleteTask,
        handleCreateTask,
        handleAddColumn,
        handleDeleteColumn,
        handleCreateProject,
        handleUpdateProject,
        handleCreateDoc,
        handleSaveDoc,
        handleDeleteDoc,
        handleInviteMember,
        handleUpdateMemberRole,
        handleUpdateMemberTeam,
        handleUpdateMember,
        handleRemoveMember,
        handleCreateRole,
        handleDeleteRole,
        handleToggleRolePermission,
        setRbacMatrix,
        handleSaveRbacMatrix,
        handleMarkAllNotificationsRead,
        handleMarkNotificationRead,
        handleClearNotification,
        handleClearAllNotifications,
        addNotification,
        handleNotificationClick,
        handleAddComment,
      }}
    >
      {children}
    </OpticsContext.Provider>
  );
};

export const useOptics = () => {
  const context = useContext(OpticsContext);
  if (!context) {
    throw new Error('useOptics must be used within an OpticsProvider');
  }
  return context;
};
