'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOptics } from '@/context/OpticsContext';

// Layout Components
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { NotificationPopover } from '@/components/layout/NotificationPopover';

// Domain Views
import { DashboardView } from '@/components/dashboard/DashboardView';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { DocsWikiView } from '@/components/docs/DocsWikiView';
import { WorkspaceSettingsView } from '@/components/workspaces/WorkspaceSettingsView';
import { RBACSettingsView } from '@/components/rbac/RBACSettingsView';
import { TeamsView } from '@/components/teams/TeamsView';
import { ProfileView } from '@/components/profile/ProfileView';

// Modals
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { CreateWorkspaceModal } from '@/components/workspaces/CreateWorkspaceModal';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import { CreateDocModal } from '@/components/docs/CreateDocModal';
import { InviteMemberModal } from '@/components/teams/InviteMemberModal';

interface AppShellProps {
  initialTab?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ initialTab }) => {
  const router = useRouter();
  const {
    currentTheme,
    currentTab,
    setCurrentTab,
    isAuthenticated,
    authLoading,
    loading,
    workspaces,
    allWorkspaces,
    workspaceProjects,
    activities,
    setActiveProject,
    setIsNotificationOpen,
    documents,
    handleSaveDoc,
    setIsCreateDocOpen,
    handleDeleteDoc,
    members,
    workspaceMembers,
    setIsInviteMemberOpen,
    handleUpdateMemberRole,
    handleUpdateMemberTeam,
    handleRemoveMember,
    setIsCreateTaskOpen,
    isCreateTaskOpen,
    handleCreateTask,
    targetColumnForCreate,
    isCreateWorkspaceOpen,
    setIsCreateWorkspaceOpen,
    handleCreateWorkspace,
    isCreateProjectOpen,
    setIsCreateProjectOpen,
    handleCreateProject,
    isCreateDocOpen,
    handleCreateDoc,
    isInviteMemberOpen,
    handleInviteMember,
  } = useOptics();

  // Sync initial tab on mount if specified
  useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab]);

  // Auth & Workspace checks
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!authLoading && isAuthenticated && !loading) {
      const hasNoWs = workspaces.length === 0 && allWorkspaces.length === 0;
      if (hasNoWs) {
        router.replace('/onboarding');
      }
    }
  }, [authLoading, isAuthenticated, loading, workspaces, allWorkspaces, router]);

  // Loading indicator
  if (authLoading || (loading && !workspaces.length)) {
    return (
      <div 
        className="flex h-screen w-full items-center justify-center font-sans"
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
            Loading Workspace...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const activeTab = currentTab;

  return (
    <div 
      data-theme={currentTheme}
      className="flex h-screen w-full overflow-hidden font-sans transition-colors duration-200"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-main)',
      }}
      onClick={() => setIsNotificationOpen(false)}
    >
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative min-w-0">
        <Topbar />
        <NotificationPopover />

        <main className={`flex-1 min-h-0 min-w-0 ${activeTab === 'board' || activeTab === 'docs' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
          {activeTab === 'dashboard' && (
            <DashboardView
              projects={workspaceProjects}
              activities={activities}
              onSelectProject={(p) => {
                setActiveProject(p);
              }}
              onOpenCreateTask={() => setIsCreateTaskOpen(true)}
              onNavigateToBoard={() => setCurrentTab('board')}
            />
          )}

          {activeTab === 'board' && <KanbanBoard />}

          {activeTab === 'docs' && (
            <DocsWikiView
              documents={documents}
              onSaveDoc={handleSaveDoc}
              onOpenCreateDoc={() => setIsCreateDocOpen(true)}
              onDeleteDoc={handleDeleteDoc}
            />
          )}

          {activeTab === 'workspace-settings' && <WorkspaceSettingsView />}

          {activeTab === 'rbac' && <RBACSettingsView />}

          {activeTab === 'teams' && (
            <TeamsView 
              members={workspaceMembers} 
              onInviteMember={() => setIsInviteMemberOpen(true)} 
              onUpdateMemberRole={handleUpdateMemberRole}
              onUpdateMemberTeam={handleUpdateMemberTeam}
              onRemoveMember={handleRemoveMember}
            />
          )}

          {activeTab === 'profile' && <ProfileView />}
        </main>
      </div>

      {/* 3. Modals */}
      <TaskDetailModal />

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={handleCreateTask}
        defaultColumnId={targetColumnForCreate}
      />

      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
        onCreateWorkspace={handleCreateWorkspace}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <CreateDocModal
        isOpen={isCreateDocOpen}
        onClose={() => setIsCreateDocOpen(false)}
        onCreateDoc={handleCreateDoc}
      />

      <InviteMemberModal
        isOpen={isInviteMemberOpen}
        onClose={() => setIsInviteMemberOpen(false)}
        onInvite={handleInviteMember}
      />
    </div>
  );
};

export default AppShell;
