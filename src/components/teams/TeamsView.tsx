'use client';

import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Shield, CheckCircle2, Search, Mail, Trash2, LogOut } from 'lucide-react';
import { User } from '../../types';
import { useOptics } from '../../context/OpticsContext';
import { TeamsSkeleton, EmptyState } from '../common/Skeleton';
import styles from './TeamsView.module.css';

interface MemberItem {
  user: User;
  role: string;
  team: string;
}

interface TeamsViewProps {
  members: MemberItem[];
  onInviteMember: () => void;
  onUpdateMemberRole?: (userId: string, newRole: string) => void;
  onUpdateMemberTeam?: (userId: string, newTeam: string) => void;
  onRemoveMember?: (userId: string) => void;
}

export const TeamsView: React.FC<TeamsViewProps> = ({
  members,
  onInviteMember,
  onUpdateMemberRole,
  onUpdateMemberTeam,
  onRemoveMember,
}) => {
  const { loading, isAdmin, currentUser, activeWorkspace, members: allOrgMembers, teams, can, handleLeaveOrganization } = useOptics();
  const [scope, setScope] = useState<'workspace' | 'all'>('workspace');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleResendInvite = (member: MemberItem) => {
    showToast(`Resent invitation email to ${member.user.email}`);
  };

  const activeMembersList = useMemo(() => {
    if (isAdmin && scope === 'all') {
      return allOrgMembers;
    }
    return members;
  }, [isAdmin, scope, allOrgMembers, members]);

  // Dynamic real teams from database and member records
  const dynamicTeams = useMemo(() => {
    const fromDb = teams.map((t) => t.name);
    const fromMembers = activeMembersList.map((m) => m.team).filter(Boolean);
    const combined = Array.from(new Set([...fromDb, ...fromMembers]));
    return combined.length > 0 ? combined : ['Core Platform', 'Product & Design', 'Mobile & AI', 'QA & Testing'];
  }, [teams, activeMembersList]);

  const teamsList = useMemo(() => ['ALL', ...dynamicTeams], [dynamicTeams]);

  const filteredMembers = useMemo(() => {
    return activeMembersList.filter((m) => {
      const matchesSearch =
        !searchQuery.trim() ||
        m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.team.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = selectedTeam === 'ALL' || m.team === selectedTeam;
      return matchesSearch && matchesTeam;
    });
  }, [activeMembersList, searchQuery, selectedTeam]);

  // Hook rules: render skeleton strictly after all hooks have been declared
  if (loading && members.length === 0) {
    return <TeamsSkeleton />;
  }

  // Calculate live team breakdowns
  const topTeam = dynamicTeams[0] || 'Core Platform';
  const secondTeam = dynamicTeams[1] || 'Product & Design';
  const topTeamCount = activeMembersList.filter((m) => m.team === topTeam).length;
  const secondTeamCount = activeMembersList.filter((m) => m.team === secondTeam).length;

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
            <Users className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
            <h1 className={styles.title}>Teams & Members</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-badge)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
              {activeWorkspace?.name || 'Primary Workspace'}
            </span>
            {!isAdmin && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                Read-only
              </span>
            )}
          </div>
          <p className={styles.subtitle}>
            {isAdmin && scope === 'all'
              ? 'All members across the entire organization directory.'
              : `Teammates, roles, and access in ${activeWorkspace?.name || 'this workspace'}.`}
          </p>
        </div>

        <div className={styles.headerActions}>
          {/* Admin Workspace / All Org Scope Filter */}
          {isAdmin && (
            <div className={styles.scopeToggle}>
              <button
                type="button"
                onClick={() => setScope('workspace')}
                className={`${styles.scopeBtn} ${scope === 'workspace' ? styles.scopeBtnActive : ''}`}
                title="Members in this workspace only"
              >
                Workspace ({members.length})
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`${styles.scopeBtn} ${scope === 'all' ? styles.scopeBtnActive : ''}`}
                title="All members in organization"
              >
                All Org ({allOrgMembers.length})
              </button>
            </div>
          )}

          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members, roles, teams..."
              className={styles.searchInput}
            />
          </div>

          {(isAdmin || can('user.invite')) && (
            <button 
              type="button"
              onClick={onInviteMember}
              className={styles.inviteBtn}
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Teammate</span>
            </button>
          )}
        </div>
      </div>

      {/* Team Summary Cards (Live dynamic data) */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div>
            <div className={styles.summaryTitle}>{topTeam}</div>
            <div className={styles.summaryValue}>
              {topTeamCount} {topTeamCount === 1 ? 'Member' : 'Members'}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-badge)', color: 'var(--text-muted)' }}>
            Active Group
          </span>
        </div>

        <div className={styles.summaryCard}>
          <div>
            <div className={styles.summaryTitle}>{secondTeam}</div>
            <div className={styles.summaryValue}>
              {secondTeamCount} {secondTeamCount === 1 ? 'Member' : 'Members'}
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-badge)', color: 'var(--text-muted)' }}>
            Team
          </span>
        </div>

        <div className={styles.summaryCard}>
          <div>
            <div className={styles.summaryTitle}>Total Directory</div>
            <div className={styles.summaryValue}>{activeMembersList.length} Active Members</div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-badge)', color: 'var(--text-muted)' }}>
            {scope === 'all' ? 'Organization' : 'Workspace'}
          </span>
        </div>
      </div>

      {/* Team Filter Pills */}
      <div className={styles.filterPills}>
        {teamsList.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setSelectedTeam(t)}
            className={`${styles.filterPill} ${selectedTeam === t ? styles.filterPillActive : ''}`}
          >
            {t === 'ALL' ? 'All Teams' : t}
          </button>
        ))}
      </div>

      {/* Members Directory Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.th}>Member Name</th>
              <th className={styles.th}>Email</th>
              <th className={styles.th}>Role & Access</th>
              <th className={styles.th}>Assigned Team</th>
              <th className={`${styles.th} text-center`}>Actions</th>
              <th className={`${styles.th} text-right`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {activeMembersList.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8">
                  <EmptyState
                    icon={<Users className="w-6 h-6" strokeWidth={1.75} />}
                    title={`No Team Members in ${activeWorkspace?.name || 'Workspace'}`}
                    description="Invite collaborators and team members to join this workspace."
                    actionText={isAdmin ? "Invite Team Member" : undefined}
                    onAction={isAdmin ? onInviteMember : undefined}
                  />
                </td>
              </tr>
            ) : filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-xs italic" style={{ color: 'var(--text-muted)' }}>
                  No members matching &quot;{searchQuery}&quot;
                </td>
              </tr>
            ) : (
              filteredMembers.map((m) => {
                const isOwner = m.role === 'Organization Owner' || m.role.toLowerCase().includes('owner');
                const isSelf = m.user.id === currentUser?.id || (currentUser?.email && m.user.email?.toLowerCase() === currentUser.email.toLowerCase());

                return (
                  <tr key={m.user.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.memberCell}>
                        <div className={styles.avatar}>
                          {m.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className={styles.memberName}>{m.user.name}</div>
                          <div className={styles.memberJob}>{m.user.jobTitle || 'Team Member'}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.td} style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{m.user.email}</td>
                    
                    {/* Role & Access column: Editable by Admins or user.assign_role capability */}
                    <td className={styles.td}>
                      {(isAdmin || can('user.assign_role')) && onUpdateMemberRole && !isOwner ? (
                        <select
                          value={m.role}
                          onChange={(e) => {
                            onUpdateMemberRole(m.user.id, e.target.value);
                            showToast(`Updated ${m.user.name}'s role to ${e.target.value}`);
                          }}
                          className={styles.roleSelect}
                          title="Change Member Role"
                        >
                          <option value="Workspace Admin">Workspace Admin</option>
                          <option value="Project Lead">Project Lead</option>
                          <option value="Developer">Developer</option>
                          <option value="Product Designer">Product Designer</option>
                          <option value="Viewer">Viewer</option>
                          {!['Workspace Admin', 'Project Lead', 'Developer', 'Product Designer', 'Viewer'].includes(m.role) && (
                            <option value={m.role}>{m.role}</option>
                          )}
                        </select>
                      ) : (
                        <span className={styles.roleBadge}>
                          <Shield className="w-3 h-3" style={{ color: isOwner ? 'var(--accent-amber)' : 'var(--text-muted)' }} />
                          {m.role}
                        </span>
                      )}
                    </td>

                    {/* Assigned Team column: Editable by Admins */}
                    <td className={styles.td}>
                      {isAdmin && onUpdateMemberTeam ? (
                        <select
                          value={m.team}
                          onChange={(e) => {
                            onUpdateMemberTeam(m.user.id, e.target.value);
                            showToast(`Assigned ${m.user.name} to ${e.target.value}`);
                          }}
                          className={styles.teamSelect}
                          title="Change Assigned Team"
                        >
                          {dynamicTeams.map((tName) => (
                            <option key={tName} value={tName}>{tName}</option>
                          ))}
                          {!dynamicTeams.includes(m.team) && (
                            <option value={m.team}>{m.team}</option>
                          )}
                        </select>
                      ) : (
                        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.team}</span>
                      )}
                    </td>

                    {/* Actions column: Only Admins can resend/remove, or currentUser can Leave */}
                    <td className={`${styles.td} text-center`}>
                      {isSelf && !isOwner ? (
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              confirm(
                                `Are you sure you want to leave ${activeWorkspace?.name || 'this workspace'}? An admin can re-invite you anytime.`
                              )
                            ) {
                              try {
                                await handleLeaveOrganization(
                                  activeWorkspace?.organizationId || activeWorkspace?.id || 'default-org'
                                );
                              } catch (err: any) {
                                alert(err.message || 'Failed to leave workspace');
                              }
                            }
                          }}
                          className={styles.leaveBtn}
                          title="Leave Workspace"
                        >
                          <LogOut className="w-3 h-3" />
                          <span>Leave</span>
                        </button>
                      ) : isAdmin ? (
                        <div className={styles.actionBtnGroup}>
                          <button
                            type="button"
                            onClick={() => handleResendInvite(m)}
                            className={styles.iconBtn}
                            title="Resend Invite Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          {onRemoveMember && !isOwner && !isSelf && (isAdmin || can('user.delete') || can('user.manage')) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove ${m.user.name} from this organization?`)) {
                                  onRemoveMember(m.user.id);
                                  showToast(`Removed ${m.user.name}`);
                                }
                              }}
                              className={styles.deleteBtn}
                              title="Remove Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>

                    <td className={`${styles.td} text-right`}>
                      <span className={styles.statusActive}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
