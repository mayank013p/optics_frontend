'use client';

import React, { useState } from 'react';
import { 
  Kanban, 
  ShieldCheck, 
  Users, 
  FileText, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Sparkles,
  Clock
} from 'lucide-react';
import styles from './WorkspaceSimulation.module.css';

interface WorkspaceSimulationProps {
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

type SimulationTab = 'kanban' | 'rbac' | 'teams' | 'specs';

interface TaskItem {
  id: string;
  key: string;
  title: string;
  column: 'backlog' | 'in_progress' | 'in_review' | 'done';
  priority: 'P0' | 'P1' | 'P2';
  assignee: { name: string; initials: string };
  tag: string;
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    key: 'OPT-102',
    title: 'Multi-tenant RBAC permission evaluator',
    column: 'in_progress',
    priority: 'P0',
    assignee: { name: 'Mayank A.', initials: 'MA' },
    tag: 'Core'
  },
  {
    id: 't-2',
    key: 'OPT-105',
    title: 'Notion-style real-time markdown blocks',
    column: 'in_progress',
    priority: 'P1',
    assignee: { name: 'Elena R.', initials: 'ER' },
    tag: 'Editor'
  },
  {
    id: 't-3',
    key: 'OPT-108',
    title: 'Fast SSE event bus for sprint sync',
    column: 'backlog',
    priority: 'P1',
    assignee: { name: 'Marcus V.', initials: 'MV' },
    tag: 'Realtime'
  },
  {
    id: 't-4',
    key: 'OPT-111',
    title: 'PostgreSQL composite index optimization',
    column: 'backlog',
    priority: 'P2',
    assignee: { name: 'David K.', initials: 'DK' },
    tag: 'Database'
  },
  {
    id: 't-5',
    key: 'OPT-099',
    title: 'Granular member invite modal & email tokens',
    column: 'in_review',
    priority: 'P1',
    assignee: { name: 'Sophia C.', initials: 'SC' },
    tag: 'Auth'
  },
  {
    id: 't-6',
    key: 'OPT-094',
    title: 'Zero-latency folder hierarchy engine',
    column: 'done',
    priority: 'P0',
    assignee: { name: 'Mayank A.', initials: 'MA' },
    tag: 'Storage'
  },
  {
    id: 't-7',
    key: 'OPT-091',
    title: 'Team role switcher with security audit log',
    column: 'done',
    priority: 'P1',
    assignee: { name: 'Elena R.', initials: 'ER' },
    tag: 'Security'
  }
];

type RoleType = 'owner' | 'lead' | 'member' | 'guest';

interface RolePermission {
  action: string;
  category: string;
  allowedRoles: RoleType[];
}

const PERMISSIONS: RolePermission[] = [
  { action: 'Create & reorder sprints', category: 'Sprint Management', allowedRoles: ['owner', 'lead'] },
  { action: 'Move task cards across columns', category: 'Sprint Management', allowedRoles: ['owner', 'lead', 'member'] },
  { action: 'Invite team members to workspace', category: 'Team & RBAC', allowedRoles: ['owner', 'lead'] },
  { action: 'Assign / revoke custom roles', category: 'Team & RBAC', allowedRoles: ['owner'] },
  { action: 'Edit project documentation & wikis', category: 'Documents', allowedRoles: ['owner', 'lead', 'member'] },
  { action: 'View documents & leave comments', category: 'Documents', allowedRoles: ['owner', 'lead', 'member', 'guest'] },
  { action: 'Manage API tokens & webhooks', category: 'Security & Billing', allowedRoles: ['owner'] },
  { action: 'Export project audit logs', category: 'Security & Billing', allowedRoles: ['owner', 'lead'] }
];

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Lead' | 'Engineer' | 'Designer' | 'Guest';
  team: string;
  status: string;
  avatar: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'm-1',
    name: 'Mayank Aitan',
    email: 'mayank@ivors.studio',
    role: 'Owner',
    team: 'Core Platform',
    status: 'Active · Shipping Sprint 42',
    avatar: 'MA'
  },
  {
    id: 'm-2',
    name: 'Elena Rostova',
    email: 'elena@ivors.studio',
    role: 'Lead',
    team: 'Frontend Systems',
    status: 'Reviewing PR #214',
    avatar: 'ER'
  },
  {
    id: 'm-3',
    name: 'Marcus Vance',
    email: 'marcus@ivors.studio',
    role: 'Lead',
    team: 'Product & Planning',
    status: 'Planning Q4 Milestones',
    avatar: 'MV'
  },
  {
    id: 'm-4',
    name: 'Sophia Chen',
    email: 'sophia@ivors.studio',
    role: 'Designer',
    team: 'Design & UX',
    status: 'Updating Design Tokens',
    avatar: 'SC'
  },
  {
    id: 'm-5',
    name: 'David Kim',
    email: 'david.k@ivors.studio',
    role: 'Engineer',
    team: 'Infrastructure',
    status: 'Benchmarking PostgreSQL DB',
    avatar: 'DK'
  }
];

export default function WorkspaceSimulation({ onOpenAuth }: WorkspaceSimulationProps) {
  const [activeTab, setActiveTab] = useState<SimulationTab>('kanban');
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [activeRole, setActiveRole] = useState<RoleType>('lead');
  const [memberSearch, setMemberSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');

  // Kanban interaction: move task to next stage
  const moveTask = (taskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const order: TaskItem['column'][] = ['backlog', 'in_progress', 'in_review', 'done'];
      const currentIndex = order.indexOf(t.column);
      const nextCol = order[(currentIndex + 1) % order.length];
      return { ...t, column: nextCol };
    }));
  };

  // Add quick task simulation
  const addQuickTask = () => {
    const nextNum = tasks.length + 101;
    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      key: `OPT-${nextNum}`,
      title: 'Automated workflow hook validation',
      column: 'backlog',
      priority: 'P1',
      assignee: { name: 'Mayank A.', initials: 'MA' },
      tag: 'Workflow'
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const filteredMembers = TEAM_MEMBERS.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                          m.email.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesTeam = teamFilter === 'all' || m.team.toLowerCase().includes(teamFilter.toLowerCase());
    return matchesSearch && matchesTeam;
  });

  return (
    <section className={styles.simSection} id="simulation">
      <div className={styles.simContainer}>
        {/* Section Heading & Subtitle */}
        <div className={styles.simHeader}>
          <div className={styles.simKicker}>
            <span className={styles.kickerIndex}>02</span>
            <span className={styles.kickerDivider}>/</span>
            <span className={styles.kickerLabel}>LIVE WORKSPACE SIMULATION</span>
          </div>
          <h2 className={styles.simTitle}>
            Experience how modern teams ship with Optics
          </h2>
          <p className={styles.simSubtitle}>
            Interact directly with the live workspace simulation below. Advance sprint cards, evaluate RBAC role permissions, and explore team squad structures.
          </p>

          {/* Interactive Top Tab Switcher */}
          <div className={styles.simTabGroup}>
            <button
              type="button"
              onClick={() => setActiveTab('kanban')}
              className={`${styles.simTabBtn} ${activeTab === 'kanban' ? styles.simTabActive : ''}`}
            >
              <Kanban className="w-4 h-4" />
              <span>Sprint Kanban</span>
              <span className={styles.tabCounter}>{tasks.filter(t => t.column !== 'done').length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rbac')}
              className={`${styles.simTabBtn} ${activeTab === 'rbac' ? styles.simTabActive : ''}`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Role Permissions (RBAC)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('teams')}
              className={`${styles.simTabBtn} ${activeTab === 'teams' ? styles.simTabActive : ''}`}
            >
              <Users className="w-4 h-4" />
              <span>Team Directory</span>
              <span className={styles.tabCounter}>{TEAM_MEMBERS.length}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`${styles.simTabBtn} ${activeTab === 'specs' ? styles.simTabActive : ''}`}
            >
              <FileText className="w-4 h-4" />
              <span>Project Specs</span>
            </button>
          </div>
        </div>

        {/* The Window Simulation Shell */}
        <div className={styles.windowFrame}>
          {/* Window Title Bar */}
          <div className={styles.windowBar}>
            <div className={styles.windowDots}>
              <span className={styles.dotClose} />
              <span className={styles.dotMin} />
              <span className={styles.dotMax} />
            </div>

            <div className={styles.windowBreadcrumbs}>
              <span className={styles.crumbWorkspace}>Ivors Studio</span>
              <span className={styles.crumbSep}>/</span>
              <span className={styles.crumbProject}>Optics Engine</span>
              <span className={styles.crumbSep}>/</span>
              <span className={styles.crumbActive}>
                {activeTab === 'kanban' && 'Sprint 42 Board'}
                {activeTab === 'rbac' && 'Workspace RBAC Matrix'}
                {activeTab === 'teams' && 'Squad Directory'}
                {activeTab === 'specs' && 'System Architecture Spec'}
              </span>
            </div>

            <div className={styles.windowLiveBadge}>
              <span className={styles.livePulse} />
              <span>Realtime Sync</span>
            </div>
          </div>

          {/* Window Body: Dynamically render selected simulation tab */}
          <div className={styles.windowContent}>
            
            {/* 1. KANBAN BOARD SIMULATION */}
            {activeTab === 'kanban' && (
              <div className={styles.kanbanContainer}>
                {/* Board Action Bar */}
                <div className={styles.boardTopBar}>
                  <div className={styles.boardSprintInfo}>
                    <span className={styles.sprintLabel}>ACTIVE SPRINT 42</span>
                    <span className={styles.sprintDate}>Ends Friday · 84% Completed</span>
                  </div>
                  <div className={styles.boardActions}>
                    <button 
                      type="button" 
                      onClick={addQuickTask}
                      className={styles.addTaskBtn}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Card</span>
                    </button>
                  </div>
                </div>

                {/* Columns Grid */}
                <div className={styles.kanbanColumns}>
                  {/* Column 1: Backlog */}
                  <div className={styles.kanbanCol}>
                    <div className={styles.colHeader}>
                      <span className={styles.colTitle}>Backlog</span>
                      <span className={styles.colBadge}>
                        {tasks.filter(t => t.column === 'backlog').length}
                      </span>
                    </div>
                    <div className={styles.cardsList}>
                      {tasks.filter(t => t.column === 'backlog').map(task => (
                        <div 
                          key={task.id} 
                          className={styles.kanbanCard}
                          onClick={() => moveTask(task.id)}
                          title="Click to advance stage"
                        >
                          <div className={styles.cardHeader}>
                            <span className={styles.taskKey}>{task.key}</span>
                            <span className={`${styles.priorityBadge} ${styles['priority_' + task.priority]}`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className={styles.taskTitle}>{task.title}</p>
                          <div className={styles.cardFooter}>
                            <span className={styles.tagChip}>{task.tag}</span>
                            <div className={styles.assigneeAvatar}>{task.assignee.initials}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: In Progress */}
                  <div className={styles.kanbanCol}>
                    <div className={styles.colHeader}>
                      <span className={styles.colTitle}>In Progress</span>
                      <span className={styles.colBadge}>
                        {tasks.filter(t => t.column === 'in_progress').length}
                      </span>
                    </div>
                    <div className={styles.cardsList}>
                      {tasks.filter(t => t.column === 'in_progress').map(task => (
                        <div 
                          key={task.id} 
                          className={styles.kanbanCard}
                          onClick={() => moveTask(task.id)}
                          title="Click to advance stage"
                        >
                          <div className={styles.cardHeader}>
                            <span className={styles.taskKey}>{task.key}</span>
                            <span className={`${styles.priorityBadge} ${styles['priority_' + task.priority]}`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className={styles.taskTitle}>{task.title}</p>
                          <div className={styles.cardFooter}>
                            <span className={styles.tagChip}>{task.tag}</span>
                            <div className={styles.assigneeAvatar}>{task.assignee.initials}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: In Review */}
                  <div className={styles.kanbanCol}>
                    <div className={styles.colHeader}>
                      <span className={styles.colTitle}>In Review</span>
                      <span className={styles.colBadge}>
                        {tasks.filter(t => t.column === 'in_review').length}
                      </span>
                    </div>
                    <div className={styles.cardsList}>
                      {tasks.filter(t => t.column === 'in_review').map(task => (
                        <div 
                          key={task.id} 
                          className={styles.kanbanCard}
                          onClick={() => moveTask(task.id)}
                          title="Click to advance stage"
                        >
                          <div className={styles.cardHeader}>
                            <span className={styles.taskKey}>{task.key}</span>
                            <span className={`${styles.priorityBadge} ${styles['priority_' + task.priority]}`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className={styles.taskTitle}>{task.title}</p>
                          <div className={styles.cardFooter}>
                            <span className={styles.tagChip}>{task.tag}</span>
                            <div className={styles.assigneeAvatar}>{task.assignee.initials}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 4: Done */}
                  <div className={styles.kanbanCol}>
                    <div className={styles.colHeader}>
                      <span className={styles.colTitle}>Done</span>
                      <span className={styles.colBadge}>
                        {tasks.filter(t => t.column === 'done').length}
                      </span>
                    </div>
                    <div className={styles.cardsList}>
                      {tasks.filter(t => t.column === 'done').map(task => (
                        <div 
                          key={task.id} 
                          className={`${styles.kanbanCard} ${styles.cardDone}`}
                          onClick={() => moveTask(task.id)}
                          title="Click to advance stage"
                        >
                          <div className={styles.cardHeader}>
                            <span className={styles.taskKey}>{task.key}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-stone-500" />
                          </div>
                          <p className={styles.taskTitle}>{task.title}</p>
                          <div className={styles.cardFooter}>
                            <span className={styles.tagChip}>{task.tag}</span>
                            <div className={styles.assigneeAvatar}>{task.assignee.initials}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.simFooterTip}>
                  <span>✦ Click any task card to simulate advancing it through the sprint lifecycle.</span>
                </div>
              </div>
            )}

            {/* 2. RBAC ROLE PERMISSIONS SIMULATION */}
            {activeTab === 'rbac' && (
              <div className={styles.rbacContainer}>
                <div className={styles.rbacHeaderRow}>
                  <div>
                    <h3 className={styles.rbacSubheading}>Role-Based Access Control Matrix</h3>
                    <p className={styles.rbacHelpText}>
                      Select a role below to simulate real-time permission evaluation across workspaces:
                    </p>
                  </div>

                  {/* Role Selector Pill */}
                  <div className={styles.rolePicker}>
                    {(['owner', 'lead', 'member', 'guest'] as RoleType[]).map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          setActiveRole(role);
                        }}
                        className={`${styles.rolePickerBtn} ${activeRole === role ? styles.rolePickerBtnActive : ''}`}
                      >
                        {role === 'owner' && 'Workspace Owner'}
                        {role === 'lead' && 'Engineering Lead'}
                        {role === 'member' && 'Squad Member'}
                        {role === 'guest' && 'Guest / Viewer'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Permissions Grid */}
                <div className={styles.rbacGrid}>
                  <div className={styles.rbacGridHeader}>
                    <span>Capability / Action</span>
                    <span>Category</span>
                    <span>Evaluation for {activeRole.toUpperCase()}</span>
                  </div>

                  {PERMISSIONS.map((perm, idx) => {
                    const isAllowed = perm.allowedRoles.includes(activeRole);
                    return (
                      <div key={idx} className={styles.rbacGridRow}>
                        <span className={styles.permAction}>{perm.action}</span>
                        <span className={styles.permCategory}>{perm.category}</span>
                        <div className={styles.permStatus}>
                          {isAllowed ? (
                            <span className={styles.badgeAllowed}>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Allowed</span>
                            </span>
                          ) : (
                            <span className={styles.badgeDenied}>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Restricted</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.simFooterTip}>
                  <span>✦ RBAC rules are enforced deterministically at database and API layers with cryptographic session tokens.</span>
                </div>
              </div>
            )}

            {/* 3. TEAM DIRECTORY SIMULATION */}
            {activeTab === 'teams' && (
              <div className={styles.teamsContainer}>
                {/* Team Controls */}
                <div className={styles.teamControlsRow}>
                  <div className={styles.searchBox}>
                    <Search className="w-3.5 h-3.5 text-stone-500" />
                    <input 
                      type="text" 
                      placeholder="Filter members by name or email..."
                      value={memberSearch}
                      onChange={e => setMemberSearch(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>

                  <div className={styles.teamPills}>
                    {['all', 'Core Platform', 'Frontend', 'Product'].map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTeamFilter(t)}
                        className={`${styles.teamPill} ${teamFilter === t ? styles.teamPillActive : ''}`}
                      >
                        {t === 'all' ? 'All Squads' : t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Member Table */}
                <div className={styles.membersTable}>
                  <div className={styles.membersTableHeader}>
                    <span>Member</span>
                    <span>Squad / Department</span>
                    <span>Role Access</span>
                    <span>Current Focus</span>
                  </div>

                  {filteredMembers.map(member => (
                    <div key={member.id} className={styles.memberRow}>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberAvatar}>{member.avatar}</div>
                        <div>
                          <div className={styles.memberName}>{member.name}</div>
                          <div className={styles.memberEmail}>{member.email}</div>
                        </div>
                      </div>

                      <span className={styles.memberSquad}>{member.team}</span>

                      <div>
                        <span className={`${styles.roleBadge} ${styles['role_' + member.role.toLowerCase()]}`}>
                          {member.role}
                        </span>
                      </div>

                      <div className={styles.memberStatus}>
                        <span className={styles.statusDot} />
                        <span>{member.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.simFooterTip}>
                  <span>✦ Seamless multi-seat management with instant one-click role upgrades and project isolation.</span>
                </div>
              </div>
            )}

            {/* 4. PROJECT SPECS & WIKI SIMULATION */}
            {activeTab === 'specs' && (
              <div className={styles.specsContainer}>
                <div className={styles.specsSidebar}>
                  <span className={styles.specsSidebarTitle}>DOCUMENTS &amp; SPECS</span>
                  <div className={styles.specTreeItemActive}>
                    <FileText className="w-3.5 h-3.5" />
                    <span>01-architecture-overview.md</span>
                  </div>
                  <div className={styles.specTreeItem}>
                    <FileText className="w-3.5 h-3.5" />
                    <span>02-sprint-42-deliverables.md</span>
                  </div>
                  <div className={styles.specTreeItem}>
                    <FileText className="w-3.5 h-3.5" />
                    <span>03-rbac-matrix-policy.md</span>
                  </div>
                  <div className={styles.specTreeItem}>
                    <FileText className="w-3.5 h-3.5" />
                    <span>04-database-schema.sql</span>
                  </div>
                </div>

                <div className={styles.specsEditor}>
                  <div className={styles.docHeader}>
                    <h4 className={styles.docTitle}>Architecture Overview: Optics Core</h4>
                    <span className={styles.docLastEdited}>Updated 14 mins ago by Mayank Aitan</span>
                  </div>

                  <div className={styles.docBody}>
                    <p className={styles.docParagraph}>
                      Optics is architected as an ultra-low latency project workspace. All sprint updates, documents, and role policies sync bidirectionally without manual page refreshes.
                    </p>

                    <div className={styles.docCodeBlock}>
                      <code>
                        // Real-time Event Subscription<br />
                        const eventBus = new OpticsRealtime(&apos;wss://api.ivors.studio/v1/sync&apos;);<br />
                        eventBus.subscribe(&apos;workspace.sprint.update&apos;, (delta) =&gt; &#123;<br />
                        &nbsp;&nbsp;applyOptimisticKanbanPatch(delta);<br />
                        &#125;);
                      </code>
                    </div>

                    <div className={styles.docChecklist}>
                      <div className={styles.checkItem}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-stone-900" />
                        <span>Sub-50ms optimistic state updates on Kanban drag events</span>
                      </div>
                      <div className={styles.checkItem}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-stone-900" />
                        <span>Cryptographically verified RBAC middleware on all routes</span>
                      </div>
                      <div className={styles.checkItem}>
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        <span>Automated GitHub PR link back-syncing</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Window Bottom Banner / CTA */}
          <div className={styles.windowBottomBar}>
            <div className={styles.bottomBarLeft}>
              <span className={styles.bottomBarIcon}>✦</span>
              <span>All workflows run on the exact same engine inside your live workspace</span>
            </div>

            {onOpenAuth && (
              <button 
                type="button" 
                onClick={() => onOpenAuth('register')}
                className={styles.bottomBarCta}
              >
                <span>Launch Your Workspace Free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
