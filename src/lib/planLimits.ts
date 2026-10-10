export const FREE_PLAN_LIMITS = {
  maxWorkspaces: Infinity,
  maxProjectsPerWorkspace: Infinity,
  maxTotalProjects: Infinity,
  maxRoles: Infinity,
  maxDocsPerWorkspace: Infinity,
  maxTeamMembers: Infinity,
};

export function checkWorkspaceLimit(_currentCount?: number): { allowed: boolean; message?: string } {
  return { allowed: true };
}

export function checkProjectLimit(_currentCount?: number): { allowed: boolean; message?: string } {
  return { allowed: true };
}

export function checkRoleLimit(_currentCount?: number): { allowed: boolean; message?: string } {
  return { allowed: true };
}

export function checkDocLimit(_currentCount?: number): { allowed: boolean; message?: string } {
  return { allowed: true };
}
