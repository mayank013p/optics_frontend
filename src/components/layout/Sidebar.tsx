'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Kanban, 
  FileText, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp,
  Layers, 
  Users,
  Sun,
  Moon,
  Zap,
  Plus,
  LogOut,
  UserCog,
  MoreVertical,
  Sliders,
  Trash2
} from 'lucide-react';
import { Project } from '../../types';
import { api } from '../../lib/api';
import { useOptics } from '../../context/OpticsContext';
import OpticsLogo from '../brand/OpticsLogo';
import { EditProjectModal } from '../projects/EditProjectModal';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    activeWorkspace,
    projects,
    workspaceProjects,
    activeProject,
    setActiveProject,
    currentTheme,
    setCurrentTheme,
    setIsCreateProjectOpen,
    currentUser,
    isAdmin,
    handleLogout,
    refreshData,
    can,
  } = useOptics();

  const [showAllProjects, setShowAllProjects] = useState(false);
  const [openMenuProjectId, setOpenMenuProjectId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenuProjectId(null);
    };
    if (openMenuProjectId) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [openMenuProjectId]);

  const displayedProjects = showAllProjects ? workspaceProjects : workspaceProjects.slice(0, 4);
  const remainingCount = workspaceProjects.length - 4;

  return (
    <aside className={styles.sidebar}>
      {/* Top Section */}
      <div className={styles.topSection}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className="flex items-center gap-2.5">
            <div 
              className={styles.brandLogo}
              onClick={() => setCurrentTab('board')}
              title="Optics Platform"
            >
              <OpticsLogo size={20} />
            </div>
            <div>
              <div className={styles.brandTitle}>Optics</div>
              <div className={styles.brandSubtitle}>by Ivors Engineering</div>
            </div>
          </div>
        </div>

        {/* 1. Projects In Workspace List (Max 4 by default, with + more option) */}
        <div className={styles.projectsSection}>
          <div className={styles.projectsHeader}>
            <span className={styles.projectsLabel}>Projects</span>
            {can('project.create') && (
              <button
                type="button"
                onClick={() => setIsCreateProjectOpen(true)}
                className={styles.newProjectIconBtn}
                title={`Create project in ${activeWorkspace?.name || 'workspace'}`}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            {displayedProjects.length > 0 ? (
              displayedProjects.map((p) => {
                const isProjActive = activeProject?.id === p.id;
                const isMenuOpen = openMenuProjectId === p.id;
                return (
                  <div
                    key={p.id}
                    className={`${styles.projectRowContainer} ${isProjActive ? styles.projectRowActive : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveProject(p);
                      }}
                      className={styles.projectMainBtn}
                      title={`Open ${p.name}`}
                    >
                      <span className={styles.projectKeyBadge}>
                        {p.key}
                      </span>
                      <span className="truncate">{p.name}</span>
                      {isProjActive && <div className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 ml-auto mr-1" />}
                    </button>

                    {/* 3-Dot Options Button */}
                    <div className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuProjectId(isMenuOpen ? null : p.id);
                        }}
                        className={`${styles.projectMoreBtn} ${isMenuOpen ? styles.projectMoreBtnOpen : ''}`}
                        title="Project options"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Context Menu Dropdown */}
                      {isMenuOpen && (
                        <div
                          className={styles.projectContextMenu}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuProjectId(null);
                              setEditingProject(p);
                            }}
                            className={styles.projectContextMenuItem}
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Edit Project Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveProject(p);
                              setCurrentTab('board');
                              setOpenMenuProjectId(null);
                            }}
                            className={styles.projectContextMenuItem}
                          >
                            <Kanban className="w-3.5 h-3.5" />
                            <span>Open Sprint Board</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveProject(p);
                              setCurrentTab('docs');
                              setOpenMenuProjectId(null);
                            }}
                            className={styles.projectContextMenuItem}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Open Wiki Docs</span>
                          </button>

                          {(isAdmin || can('project.delete')) && workspaceProjects.length > 1 && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm(`Delete project "${p.name}"? All tasks and documentation will be permanently removed.`)) {
                                  setOpenMenuProjectId(null);
                                  await api.projects.delete(p.id);
                                  await refreshData();
                                }
                              }}
                              className={`${styles.projectContextMenuItem} ${styles.projectContextMenuDanger}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Project</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-2 py-1.5 text-xs italic" style={{ color: 'var(--text-dim)' }}>
                No projects in this workspace
              </div>
            )}

            {/* If more than 4 projects, show toggle */}
            {workspaceProjects.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllProjects((prev) => !prev)}
                className={styles.moreProjectsBtn}
              >
                {showAllProjects ? (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    <span>Show less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    <span>+ {remainingCount} more projects</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 2. Primary Navigation (Contextual to active project/workspace) */}
        <nav className={styles.navSection}>
          <div className={styles.navLabel}>
            Navigation
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('board')}
            className={`${styles.navItem} ${currentTab === 'board' ? styles.navItemActive : ''}`}
          >
            <Kanban className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
            <span>Sprint Board</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('dashboard')}
            className={`${styles.navItem} ${currentTab === 'dashboard' ? styles.navItemActive : ''}`}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('docs')}
            className={`${styles.navItem} ${currentTab === 'docs' ? styles.navItemActive : ''}`}
          >
            <FileText className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
            <span>Project Wiki</span>
          </button>

          <div className={`${styles.navLabel} mt-2`}>
            Organization & Team
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('workspace-settings')}
            className={`${styles.navItem} ${currentTab === 'workspace-settings' ? styles.navItemActive : ''}`}
          >
            <Layers className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
            <span>Workspaces Hub</span>
          </button>

          {/* Access & RBAC — Admin/Owner or org.manage capability */}
          {(isAdmin || can('org.manage')) && (
            <button
              type="button"
              onClick={() => setCurrentTab('rbac')}
              className={`${styles.navItem} ${currentTab === 'rbac' ? styles.navItemActive : ''}`}
            >
              <ShieldCheck className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
              <span>Access & RBAC</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setCurrentTab('teams')}
            className={`${styles.navItem} ${currentTab === 'teams' ? styles.navItemActive : ''}`}
          >
            <Users className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
            <span>Teams & Members</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('profile')}
            className={`${styles.navItem} ${currentTab === 'profile' ? styles.navItemActive : ''}`}
          >
            <UserCog className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
            <span>Profile & Settings</span>
          </button>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        {/* Theme Switcher */}
        <div className="flex flex-col gap-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider px-0.5" style={{ color: 'var(--text-dim)' }}>
            Theme
          </div>
          <div className={styles.themeGroup}>
            <button
              type="button"
              onClick={() => setCurrentTheme('dark')}
              className={`${styles.themeBtn} ${currentTheme === 'dark' ? styles.themeBtnActive : ''}`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Dark</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentTheme('warm-cream')}
              className={`${styles.themeBtn} ${currentTheme === 'warm-cream' ? styles.themeBtnActive : ''}`}
              title="Ivors Cream Mode"
            >
              <Sun className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Cream</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentTheme('amber')}
              className={`${styles.themeBtn} ${currentTheme === 'amber' || currentTheme === 'amber-crt' ? styles.themeBtnActive : ''}`}
              title="Amber Mode"
            >
              <Zap className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Amber</span>
            </button>
          </div>
        </div>

        {/* User profile Card -> Navigates to Profile */}
        <div 
          onClick={() => setCurrentTab('profile')}
          className={`${styles.userSectionCard} ${currentTab === 'profile' ? styles.userSectionCardActive : ''}`}
          title="Open Profile & Settings"
        >
          <div className={styles.userAvatar}>
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {currentUser?.name || 'Mayank Aitan'}
            </div>
            <div className={styles.userEmail}>
              {currentUser?.email || 'mayank@ivors.in'}
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className={styles.logoutBtn}
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <EditProjectModal
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
        project={editingProject}
      />
    </aside>
  );
};
