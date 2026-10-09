export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskPriority = Priority;

export type TaskType = 'TASK' | 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'EPIC';
export type IssueType = TaskType;

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  jobTitle?: string;
  role?: 'owner' | 'admin' | 'member' | 'viewer';
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}
export type IssueLabel = TaskLabel;

export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}
export type IssueComment = TaskComment;

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  size: string;
  url?: string;
  uploadedAt: string;
}
export type IssueAttachment = TaskAttachment;

export interface Task {
  id: string;
  key: string;
  title: string;
  description?: string;
  status: string;
  priority: Priority;
  type: TaskType;
  estimate?: number;
  dueDate?: string;
  position: number;
  columnId: string;
  boardId: string;
  projectId: string;
  assignees?: { user: User }[];
  labels?: { label: TaskLabel }[];
  comments?: TaskComment[];
  subtasks?: Subtask[];
  attachments?: TaskAttachment[];
  _count?: {
    comments: number;
    attachments: number;
  };
}
export type Issue = Task;

export interface BoardColumn {
  id: string;
  name: string;
  position: number;
  color?: string;
  wipLimit?: number;
  tasks: Task[];
  issues: Task[]; // backward compatibility
}

export interface Board {
  id: string;
  name: string;
  projectId: string;
  columns: BoardColumn[];
}

export interface Document {
  id: string;
  title: string;
  content?: string;
  icon?: string;
  projectId?: string;
  updatedAt: string;
  author?: User;
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  type: string;
  taskKey: string;
  issueKey: string; // backward compatibility
  storage: string;
  uploadedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  organizationId: string;
  projects?: Project[];
  members?: { user: User; role: { name: string } }[];
  _count?: {
    projects: number;
    members: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  organizationId?: string;
  workspaceId?: string;
  _count?: {
    members?: number;
  };
}

export interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  color?: string;
  icon?: string;
  workspaceId?: string;
  workspace?: {
    id: string;
    name: string;
    slug: string;
  };
  boards?: Board[];
  documents?: Document[];
  tasks?: Task[];
  issues?: Task[];
  members?: { user: User; role: string; team: string }[];
  _count?: {
    tasks?: number;
    issues?: number;
    documents?: number;
    members?: number;
  };
}

export interface ActivityLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: any;
  createdAt: string;
  user: User;
  project?: { name: string; key: string };
}
