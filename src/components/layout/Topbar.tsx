'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Search, Bell, Layers, ChevronDown, Check, Plus, Settings } from 'lucide-react';
import { useOptics } from '../../context/OpticsContext';
import styles from './Topbar.module.css';

export const Topbar: React.FC = () => {
  const {
    workspaces,
    activeWorkspace,
    setActiveWorkspace,
    activeProject,
    searchQuery,
    setSearchQuery,
    isNotificationOpen,
    setIsNotificationOpen,
    unreadCount,
    setIsCreateWorkspaceOpen,
    setCurrentTab,
    isAdmin,
    can,
  } = useOptics();

  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(e.target as Node)) {
        setIsWsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={styles.header}>
      {/* Left: Project title & breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-main)' }}>
            <span className={styles.keyBadge}>
              {activeProject?.key || 'OPT'}
            </span>
            <span>{activeProject?.name || 'Optics Project'}</span>
          </span>
        </div>
      </div>

      {/* Middle: Clean Search bar with Cmd+K */}
      <div className={styles.searchWrapper}>
        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks, docs, keys..."
          className={styles.searchInput}
        />
        {searchQuery ? (
          <button 
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold cursor-pointer hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            ×
          </button>
        ) : (
          <kbd 
            onClick={() => searchInputRef.current?.focus()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded cursor-pointer hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg-badge)',
              color: 'var(--text-dim)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            ⌘K
          </kbd>
        )}
      </div>

      {/* Right Actions: Notifications & Workspace Chooser */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsNotificationOpen((prev) => !prev);
          }}
          className={`${styles.notificationBtn} ${isNotificationOpen ? styles.notificationBtnActive : ''}`}
          title="Notifications"
          aria-label="Toggle notifications"
        >
          <Bell className="w-4 h-4" strokeWidth={1.75} />
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Workspace Chooser Dropdown in Top Right */}
        <div className="relative" ref={wsDropdownRef}>
          <button
            type="button"
            onClick={() => setIsWsDropdownOpen((prev) => !prev)}
            className={styles.workspaceBtn}
            title="Switch Workspace"
          >
            <Layers className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--text-main)' }} />
            <span className={styles.workspaceBtnText}>
              {activeWorkspace?.name || 'Primary Workspace'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Workspace Dropdown Menu */}
          {isWsDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownHeader}>
                <span>Select Workspace</span>
              </div>

              <div className={styles.dropdownList}>
                {workspaces && workspaces.length > 0 ? (
                  workspaces.map((ws) => {
                    const isWsActive = activeWorkspace?.id === ws.id;
                    return (
                      <button
                        key={ws.id}
                        type="button"
                        onClick={() => {
                          setActiveWorkspace(ws);
                          setIsWsDropdownOpen(false);
                        }}
                        className={`${styles.dropdownItem} ${isWsActive ? styles.dropdownItemActive : ''}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Layers className="w-3.5 h-3.5" style={{ color: isWsActive ? 'var(--text-main)' : 'var(--text-dim)' }} />
                          <span className="truncate">{ws.name}</span>
                        </div>
                        {isWsActive && <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" strokeWidth={2.5} />}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-2 py-1 text-xs italic" style={{ color: 'var(--text-dim)' }}>
                    No workspaces found
                  </div>
                )}
              </div>

              <div className={styles.dropdownDivider} />

              {(isAdmin || can('workspace.create')) && (
                <button
                  type="button"
                  onClick={() => {
                    setIsWsDropdownOpen(false);
                    setIsCreateWorkspaceOpen(true);
                  }}
                  className={styles.dropdownActionBtn}
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>New Workspace</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsWsDropdownOpen(false);
                  setCurrentTab('workspace-settings');
                }}
                className={styles.dropdownActionBtn}
              >
                <Settings className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Manage Workspaces</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
