import { ENV } from './config';

export const API_BASE_URL = ENV.API_URL;

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('optics_jwt_token');
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('optics_jwt_token', token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('optics_jwt_token');
    localStorage.removeItem('optics_user_info');
  }
}

export function getStoredUser(): any | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('optics_user_info');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('optics_user_info', JSON.stringify(user));
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

const inFlightGetRequests = new Map<string, Promise<any>>();

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const token = getAuthToken();
  const cacheKey = `${method}:${token || 'anon'}:${endpoint}`;

  if (method === 'GET') {
    const existing = inFlightGetRequests.get(cacheKey);
    if (existing) {
      return existing as Promise<T>;
    }
  }

  const exec = async () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && !endpoint.startsWith('/auth/')) {
          clearAuthToken();
        }
        throw new ApiError(data.error || data.message || `Request failed with status ${response.status}`, response.status);
      }

      return data as T;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(err.message || 'Network error', 0);
    } finally {
      if (method === 'GET') {
        inFlightGetRequests.delete(cacheKey);
      }
    }
  };

  if (method === 'GET') {
    const p = exec();
    inFlightGetRequests.set(cacheKey, p);
    return p;
  }

  return exec();
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ token: string; user: any; organizations: any[] }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (payload: { name: string; email: string; password: string; code: string; orgName?: string; inviteToken?: string }) =>
      request<{ token: string; user: any; organization?: any; workspace?: any; hasOrganization?: boolean; joinedViaInvite?: boolean; message?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    verifyInvite: (token: string) =>
      request<{ valid: boolean; invitation: any }>(`/auth/invite/${token}`),
    acceptInvite: (data: { token: string; name?: string; password?: string }) =>
      request<{ token: string; user: any; organization: any; workspace: any; role: string; message: string }>('/auth/invite/accept', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    createOrg: (data: { name: string; workspaceName?: string }) =>
      request<{ organization: any; workspace: any; message: string }>('/auth/create-org', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMyInvites: () =>
      request<{ invitations: Array<{ id: string; token: string; organizationName: string; workspaceName: string; roleName: string; teamName?: string; invitedByName: string; expiresAt: string }> }>('/auth/my-invites'),
    joinInvite: (token: string) =>
      request<{ organization: any; workspace: any; role: string; message: string }>('/auth/join-invite', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }),
    leaveOrg: (orgId: string) =>
      request<{ success: boolean; message: string }>(`/org/${orgId}/leave`, {
        method: 'POST',
      }),
    deleteOrg: (orgId: string) =>
      request<{ success: boolean; message: string }>(`/org/${orgId}`, {
        method: 'DELETE',
      }),
    me: () => request<{ user: any }>('/auth/me'),
    updateProfile: (data: { name?: string; jobTitle?: string; avatarUrl?: string }) =>
      request<{ user: any; message: string }>('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    updatePassword: (data: { currentPassword?: string; newPassword: string }) =>
      request<{ success: boolean; message: string }>('/auth/password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    sendOtp: (email: string, purpose: 'PASSWORD_RESET' | 'LOGIN' | 'REGISTER') =>
      request<{ success: boolean; message: string; expiresInMinutes: number }>('/auth/otp/send', {
        method: 'POST',
        body: JSON.stringify({ email, purpose }),
      }),
    verifyOtp: (email: string, code: string, purpose: 'PASSWORD_RESET' | 'LOGIN' | 'REGISTER') =>
      request<{ valid: boolean; message: string }>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ email, code, purpose }),
      }),
    resetPasswordViaOtp: (data: { email: string; code: string; newPassword: string }) =>
      request<{ success: boolean; message: string }>('/auth/otp/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    loginViaOtp: (data: { email: string; code: string }) =>
      request<{ token: string; user: any; organizations: any[]; message: string }>('/auth/otp/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Workspaces
  workspaces: {
    list: (orgId?: string) =>
      request<{ workspaces: any[] }>(`/workspaces${orgId ? `?orgId=${orgId}` : ''}`),
    get: (workspaceId: string) => request<{ workspace: any }>(`/workspaces/${workspaceId}`),
    create: (data: { name: string; organizationId?: string; description?: string }) =>
      request<{ workspace: any }>('/workspaces', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (workspaceId: string, data: { name?: string }) =>
      request<{ workspace: any }>(`/workspaces/${workspaceId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (workspaceId: string) =>
      request<{ success: boolean }>(`/workspaces/${workspaceId}`, {
        method: 'DELETE',
      }),
  },

  // Projects
  projects: {
    list: (params?: { workspaceId?: string; organizationId?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ projects: any[] }>(`/projects${q ? `?${q}` : ''}`);
    },
    get: (idOrKey: string) => request<{ project: any }>(`/projects/${idOrKey}`),
    create: (data: { name: string; key: string; description?: string; color?: string; icon?: string; workspaceId?: string }) =>
      request<{ project: any }>('/projects', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (projectId: string, data: { name?: string; description?: string; color?: string; status?: string }) =>
      request<{ project: any }>(`/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (projectId: string) =>
      request<{ success: boolean }>(`/projects/${projectId}`, {
        method: 'DELETE',
      }),
  },

  // Boards
  boards: {
    get: (boardId: string) => request<{ board: any }>(`/boards/${boardId}`),
    getByProject: (projectId: string) => request<{ board: any }>(`/boards/project/${projectId}`),
    addColumn: (boardId: string, data: { name: string; color?: string; wipLimit?: number }) =>
      request<{ column: any }>(`/boards/${boardId}/columns`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteColumn: (boardId: string, columnId: string) =>
      request<{ success: boolean }>(`/boards/${boardId}/columns/${columnId}`, {
        method: 'DELETE',
      }),
  },

  // Tasks
  tasks: {
    list: (params?: { projectId?: string; boardId?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ tasks: any[]; issues: any[] }>(`/tasks${q ? `?${q}` : ''}`);
    },
    create: (data: any) =>
      request<{ task: any; issue: any }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    move: (taskId: string, data: { destinationColumnId?: string; newPosition?: number }) =>
      request<{ task: any; issue: any }>(`/tasks/${taskId}/move`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    update: (taskId: string, data: any) =>
      request<{ task: any; issue: any }>(`/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (taskId: string) =>
      request<{ success: boolean }>(`/tasks/${taskId}`, {
        method: 'DELETE',
      }),
    addComment: (taskId: string, content: string) =>
      request<{ comment: any }>(`/tasks/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
  },

  // Documents
  docs: {
    list: (projectId?: string) => {
      const endpoint = projectId ? `/docs/project/${projectId}` : '/docs';
      return request<{ documents: any[] }>(endpoint);
    },
    create: (data: { title: string; content?: string; icon?: string; projectId?: string }) =>
      request<{ document: any }>('/docs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (docId: string, data: { title?: string; content?: string; icon?: string }) =>
      request<{ document: any }>(`/docs/${docId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (docId: string) =>
      request<{ success: boolean }>(`/docs/${docId}`, {
        method: 'DELETE',
      }),
  },

  // Teams & Members
  teams: {
    members: () => request<{ members: any[] }>('/teams/members'),
    list: () => request<{ teams: any[] }>('/teams'),
    invite: (data: { name: string; email: string; role?: string; team?: string; workspaceId?: string }) =>
      request<{ member: any; invitation?: any; inviteUrl?: string; emailSent?: boolean; message?: string }>('/teams/invite', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    listInvitations: () => request<{ invitations: any[] }>('/teams/invitations'),
    revokeInvitation: (id: string) =>
      request<{ success: boolean; message: string }>(`/teams/invitations/${id}`, {
        method: 'DELETE',
      }),
    resendInvitation: (id: string) =>
      request<{ success: boolean; message: string; inviteUrl: string; invitation: any }>(`/teams/invitations/${id}/resend`, {
        method: 'POST',
      }),
    updateMember: (userId: string, data: { role?: string; team?: string; workspaceId?: string }) =>
      request<{ success: boolean }>(`/teams/members/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    updateRole: (userId: string, role: string) =>
      request<{ success: boolean }>(`/teams/members/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    remove: (userId: string) =>
      request<{ success: boolean }>(`/teams/members/${userId}`, {
        method: 'DELETE',
      }),
  },

  // RBAC Roles & Permissions
  rbac: {
    getMatrix: () => request<{ roles: any[]; permissions: any[] }>('/organizations/roles/matrix'),
    syncMatrix: (matrix: Record<string, string[]>) =>
      request<{ success: boolean; message?: string; matrix: any }>('/organizations/roles/matrix', {
        method: 'PUT',
        body: JSON.stringify({ matrix }),
      }),
    updatePermissions: (roleId: string, data: { permissionCode?: string; enabled?: boolean; permissionCodes?: string[]; code?: string }) =>
      request<{ success: boolean; permissionCodes?: string[]; role?: any }>(`/organizations/roles/${roleId}/permissions`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    createRole: (data: { name: string; description?: string; permissionCodes?: string[] }) =>
      request<{ role: any }>('/organizations/roles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteRole: (roleId: string) =>
      request<{ success: boolean }>(`/organizations/roles/${roleId}`, {
        method: 'DELETE',
      }),
  },

  // Activity Stream
  activity: {
    list: (params?: { orgId?: string; projectId?: string; limit?: number }) => {
      const q = new URLSearchParams(params as any).toString();
      return request<{ activities: any[] }>(`/activity${q ? `?${q}` : ''}`);
    },
  },

  // Dashboard Stats
  stats: {
    getDashboard: (params?: { orgId?: string; workspaceId?: string }) => {
      const q = params ? new URLSearchParams(Object.entries(params).filter(([_, v]) => Boolean(v)) as any).toString() : '';
      return request<{ metrics: any; projectStats: any[] }>(`/stats/dashboard${q ? `?${q}` : ''}`);
    },
  },
};
