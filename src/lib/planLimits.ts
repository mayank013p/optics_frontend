export const FREE_PLAN_LIMITS = {
  maxWorkspaces: 1,
  maxProjectsPerWorkspace: 5,
  maxTotalProjects: 5,
  maxRoles: 12,
  maxDocsPerWorkspace: 10,
  maxTeamMembers: Infinity, // Unlimited team members on free tier
};

export function checkWorkspaceLimit(currentCount: number): { allowed: boolean; message?: string } {
  if (currentCount >= FREE_PLAN_LIMITS.maxWorkspaces) {
    return {
      allowed: false,
      message: `Free plan is limited to ${FREE_PLAN_LIMITS.maxWorkspaces} workspace (${currentCount}/${FREE_PLAN_LIMITS.maxWorkspaces} used). Upgrade to Pro for unlimited workspaces.`,
    };
  }
  return { allowed: true };
}

export function checkProjectLimit(currentCount: number): { allowed: boolean; message?: string } {
  if (currentCount >= FREE_PLAN_LIMITS.maxProjectsPerWorkspace) {
    return {
      allowed: false,
      message: `Free plan is limited to ${FREE_PLAN_LIMITS.maxProjectsPerWorkspace} projects per workspace (${currentCount}/${FREE_PLAN_LIMITS.maxProjectsPerWorkspace} used). Upgrade to Pro for unlimited projects.`,
    };
  }
  return { allowed: true };
}

export function checkRoleLimit(currentCount: number): { allowed: boolean; message?: string } {
  if (currentCount >= FREE_PLAN_LIMITS.maxRoles) {
    return {
      allowed: false,
      message: `Free plan is limited to ${FREE_PLAN_LIMITS.maxRoles} roles (${currentCount}/${FREE_PLAN_LIMITS.maxRoles} used). Upgrade to Pro for unlimited custom roles.`,
    };
  }
  return { allowed: true };
}

export function checkDocLimit(currentCount: number): { allowed: boolean; message?: string } {
  if (currentCount >= FREE_PLAN_LIMITS.maxDocsPerWorkspace) {
    return {
      allowed: false,
      message: `Free plan is limited to ${FREE_PLAN_LIMITS.maxDocsPerWorkspace} docs per space (${currentCount}/${FREE_PLAN_LIMITS.maxDocsPerWorkspace} used). Upgrade to Pro for unlimited wiki docs.`,
    };
  }
  return { allowed: true };
}

