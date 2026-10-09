'use client';

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Paperclip, 
  AlertTriangle,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Kanban,
  Trash2,
  X,
  Inbox,
  CircleDashed,
  Circle,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  Filter,
  Columns,
  UserCheck,
} from 'lucide-react';
import { Priority, Issue } from '../../types';
import { useOptics } from '../../context/OpticsContext';
import { BoardSkeleton, EmptyState } from '../common/Skeleton';
import styles from './KanbanBoard.module.css';

export const KanbanBoard: React.FC = () => {
  const {
    filteredBoard,
    handleMoveTask,
    setSelectedTask,
    setTargetColumnForCreate,
    setIsCreateTaskOpen,
    handleAddColumn,
    handleDeleteColumn,
    loading,
    boardLoading,
    activeProject,
    setIsCreateProjectOpen,
    can,
    currentUser,
    members,
  } = useOptics();

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  // Linear-style Priority Indicators
  const renderPriority = (priority: Priority) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className={`${styles.priorityBadge} ${styles.priorityUrgent}`}>
            <AlertTriangle className="w-3 h-3" strokeWidth={2.2} />
            <span>Urgent</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className={`${styles.priorityBadge} ${styles.priorityHigh}`}>
            <SignalHigh className="w-3 h-3" strokeWidth={2.2} />
            <span>High</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className={`${styles.priorityBadge} ${styles.priorityMed}`}>
            <SignalMedium className="w-3 h-3" strokeWidth={2} />
            <span>Med</span>
          </span>
        );
      case 'LOW':
        return (
          <span className={`${styles.priorityBadge} ${styles.priorityLow}`}>
            <SignalLow className="w-3 h-3" strokeWidth={2} />
            <span>Low</span>
          </span>
        );
    }
  };

  // Status Glyphs instead of rainbow dots
  const renderStatusGlyph = (columnName: string) => {
    const lower = columnName.toLowerCase();
    if (lower.includes('backlog')) {
      return <CircleDashed className={`${styles.statusGlyph} text-zinc-500`} strokeWidth={2} />;
    }
    if (lower.includes('todo') || lower.includes('to do')) {
      return <Circle className={`${styles.statusGlyph} text-zinc-400`} strokeWidth={2} />;
    }
    if (lower.includes('progress') || lower.includes('in dev') || lower.includes('wip')) {
      return <Clock className={`${styles.statusGlyph} text-amber-500`} strokeWidth={2} />;
    }
    if (lower.includes('review') || lower.includes('qa') || lower.includes('verify')) {
      return <Circle className={`${styles.statusGlyph} text-sky-400`} strokeWidth={2.5} />;
    }
    if (lower.includes('done') || lower.includes('completed')) {
      return <CheckCircle2 className={`${styles.statusGlyph} text-emerald-500`} strokeWidth={2} />;
    }
    return <Circle className={`${styles.statusGlyph} text-zinc-400`} strokeWidth={2} />;
  };

  const filteredColumns = useMemo(() => {
    if (!filteredBoard) return [];
    return filteredBoard.columns.map((col) => {
      const colTasks = col.tasks || col.issues || [];
      const filteredTasks = colTasks.filter((t) => {
        const matchesPriority = selectedPriority === 'ALL' || t.priority === selectedPriority;
        const matchesType = selectedType === 'ALL' || t.type === selectedType;

        let matchesAssignee = true;
        if (selectedAssignee === 'ME') {
          matchesAssignee = Boolean(currentUser && t.assignees?.some((a) => a.user.id === currentUser.id));
        } else if (selectedAssignee === 'UNASSIGNED') {
          matchesAssignee = !t.assignees || t.assignees.length === 0;
        } else if (selectedAssignee !== 'ALL') {
          matchesAssignee = Boolean(t.assignees?.some((a) => a.user.id === selectedAssignee));
        }

        return matchesPriority && matchesType && matchesAssignee;
      });
      return {
        ...col,
        tasks: filteredTasks,
        issues: filteredTasks,
      };
    });
  }, [filteredBoard, selectedPriority, selectedType, selectedAssignee, currentUser]);

  const totalPoints = useMemo(() => {
    if (!filteredBoard) return 0;
    return filteredBoard.columns.reduce(
      (acc, col) => acc + (col.tasks || col.issues || []).reduce((sub, i) => sub + (i.estimate || 0), 0),
      0
    );
  }, [filteredBoard]);

  const totalTasksCount = useMemo(() => {
    if (!filteredBoard) return 0;
    return filteredBoard.columns.reduce((acc, col) => acc + (col.tasks || col.issues || []).length, 0);
  }, [filteredBoard]);

  const handleCreateColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim()) return;
    handleAddColumn(newColumnName.trim(), '#71717a');
    setNewColumnName('');
    setIsAddColumnOpen(false);
  };

  if (boardLoading || (loading && !filteredBoard)) {
    return <BoardSkeleton />;
  }

  if (!filteredBoard || !activeProject) {
    return (
      <div className={styles.boardContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          icon={<Kanban className="w-6 h-6" strokeWidth={1.75} />}
          title={activeProject ? "No Active Sprint Board" : "No Project Selected"}
          description={activeProject ? "Initialize a pipeline or create tasks to get started." : "Select an active project or create a new project workspace to initialize your task pipeline."}
          actionText="Create New Project"
          onAction={() => setIsCreateProjectOpen(true)}
        />
      </div>
    );
  }

  return (
    <div className={styles.boardContainer}>
      {/* 1. Linear-style View Controls Toolbar */}
      <div className={styles.boardHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.boardIconBox}>
            <Kanban className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className={styles.boardTitle}>{filteredBoard.name}</h1>
            <p className={styles.boardSubtitle}>Sprint & Task Pipeline</p>
          </div>
        </div>

        {/* Clean Segmented Filters */}
        <div className={styles.headerControls}>
          {/* Assignee Filter Segment */}
          <div className={styles.segmentedFilter}>
            <button
              type="button"
              onClick={() => setSelectedAssignee('ALL')}
              className={`${styles.filterBtn} ${selectedAssignee === 'ALL' ? styles.filterBtnActive : ''}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedAssignee('ME')}
              className={`${styles.filterBtn} ${selectedAssignee === 'ME' ? styles.filterBtnActive : ''}`}
              title={currentUser ? `Only show tasks assigned to ${currentUser.name}` : 'Assigned to Me'}
            >
              <UserCheck className="w-3 h-3" />
              <span>Assigned to Me</span>
            </button>
            {members && members.length > 0 && (
              <select
                value={['ALL', 'ME'].includes(selectedAssignee) ? '' : selectedAssignee}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedAssignee(e.target.value);
                  }
                }}
                className={`${styles.assigneeSelect} ${!['ALL', 'ME'].includes(selectedAssignee) ? styles.assigneeSelectActive : ''}`}
                title="Filter by specific team member or unassigned"
              >
                <option value="">
                  {!['ALL', 'ME'].includes(selectedAssignee)
                    ? `👤 ${members.find((m) => m.user.id === selectedAssignee)?.user.name || (selectedAssignee === 'UNASSIGNED' ? 'Unassigned' : 'Member')}`
                    : 'Team Member ▾'}
                </option>
                <option value="UNASSIGNED">Unassigned Tasks</option>
                {members.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name} ({m.role || 'Member'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className={styles.segmentedFilter}>
            {['ALL', 'URGENT', 'HIGH', 'MEDIUM'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPriority(p)}
                className={`${styles.filterBtn} ${selectedPriority === p ? styles.filterBtnActive : ''}`}
              >
                {p === 'ALL' ? 'All Priorities' : p.charAt(0) + p.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className={styles.segmentedFilter}>
            {['ALL', 'FEATURE', 'BUG', 'TASK'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`${styles.filterBtn} ${selectedType === t ? styles.filterBtnActive : ''}`}
              >
                {t === 'ALL' ? 'All Types' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <span className={styles.statsText}>
            {totalTasksCount} tasks · {totalPoints} pts
          </span>

          {can('board.configure') && (
            <button
              type="button"
              onClick={() => setIsAddColumnOpen(true)}
              className={styles.actionBtn}
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Add Column</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Columns Grid */}
      <div className={styles.columnsContainer}>
        {filteredColumns.map((column) => (
          <div
            key={column.id}
            onDragOver={(e) => {
              if (!can('task.move')) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (!can('task.move')) return;
              const taskId = e.dataTransfer.getData('text/plain') || draggingTaskId;
              if (taskId) {
                handleMoveTask(taskId, column.id);
                setDraggingTaskId(null);
              }
            }}
            className={styles.kanbanColumn}
          >
            {/* Column Header */}
            <div className={styles.columnHeader}>
              <div className={styles.columnTitleGroup}>
                {renderStatusGlyph(column.name)}
                <span className={styles.columnTitle}>
                  {column.name}
                </span>
                <span className={styles.columnCount}>
                  {(column.tasks || column.issues || []).length}
                </span>
              </div>

              <div className="flex items-center gap-0.5">
                {(() => {
                  const isDefaultColumn = 
                    ['col-backlog', 'col-todo', 'col-in-progress', 'col-done'].includes(column.id) ||
                    ['backlog', 'todo', 'to do', 'in progress', 'review', 'done'].includes(column.name.trim().toLowerCase());
                  const totalCols = filteredBoard?.columns?.length ?? 0;
                  const taskCount = (column.tasks || column.issues || []).length;

                  if (can('board.configure') && !isDefaultColumn && totalCols > 1 && taskCount === 0) {
                    return (
                      <button
                        onClick={() => handleDeleteColumn(column.id)}
                        className={styles.columnActionBtn}
                        title={`Delete ${column.name} Column`}
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" strokeWidth={2} />
                      </button>
                    );
                  }
                  return null;
                })()}
                {can('task.create') && (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetColumnForCreate(column.id);
                      setIsCreateTaskOpen(true);
                    }}
                    className={styles.columnActionBtn}
                    title="New Task"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>

            {/* Column Tasks List */}
            <div className={styles.tasksList}>
              {(column.tasks || column.issues || []).length === 0 ? (
                <div className={styles.emptyColumnBox}>
                  <span>No tasks</span>
                </div>
              ) : (
                (column.tasks || column.issues || []).map((task) => (
                  <div
                    key={task.id}
                    draggable={can('task.move')}
                    onDragStart={(e) => {
                      if (!can('task.move')) return;
                      e.dataTransfer.setData('text/plain', task.id);
                      setDraggingTaskId(task.id);
                    }}
                    onDragEnd={() => setDraggingTaskId(null)}
                    onClick={() => setSelectedTask(task)}
                    className={`${styles.taskCard} ${draggingTaskId === task.id ? 'opacity-40 border-dashed' : ''} ${!can('task.move') ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}`}
                  >
                    <div className={styles.taskCardTop}>
                      <span className={styles.taskKey}>
                        {task.key}
                      </span>
                      {renderPriority(task.priority)}
                    </div>

                    <h3 className={styles.taskTitle}>
                      {task.title}
                    </h3>

                    {task.labels && task.labels.length > 0 && (
                      <div className={styles.labelsRow}>
                        {task.labels.map((l) => (
                          <span key={l.label.id} className={styles.labelTag}>
                            {l.label.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={styles.taskFooter}>
                      <div className={styles.taskMetaLeft}>
                        {task.estimate && (
                          <span className={styles.metaItem}>
                            {task.estimate} pts
                          </span>
                        )}

                        {(task.comments?.length || task._count?.comments || 0) > 0 && (
                          <span className={styles.metaItem}>
                            <MessageSquare className="w-3 h-3" strokeWidth={1.75} />
                            {task.comments?.length || task._count?.comments}
                          </span>
                        )}

                        {((task.attachments?.length || task._count?.attachments) ?? 0) > 0 && (
                          <span className={styles.metaItem}>
                            <Paperclip className="w-3 h-3" strokeWidth={1.75} />
                            {task.attachments?.length || task._count?.attachments}
                          </span>
                        )}
                      </div>

                      <div className="flex -space-x-1">
                        {task.assignees && task.assignees.length > 0 ? (
                          task.assignees.map((a, idx) => (
                            <div
                              key={idx}
                              title={a.user.name}
                              className={styles.taskAssigneeAvatar}
                            >
                              {a.user.name.charAt(0)}
                            </div>
                          ))
                        ) : (
                          <div className={styles.taskAssigneeAvatar} style={{ opacity: 0.5 }}>
                            -
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {can('task.create') && (
                <button
                  type="button"
                  onClick={() => {
                    setTargetColumnForCreate(column.id);
                    setIsCreateTaskOpen(true);
                  }}
                  className={styles.quickAddTaskBtn}
                >
                  <Plus className="w-3 h-3" strokeWidth={2} />
                  <span>Add task</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Column Modal */}
      {isAddColumnOpen && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setIsAddColumnOpen(false)}
        >
          <div 
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>New Column</span>
              <button 
                onClick={() => setIsAddColumnOpen(false)} 
                className={styles.closeBtn}
                aria-label="Close modal"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleCreateColumnSubmit} className={styles.modalForm}>
              <div>
                <label className={styles.fieldLabel}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Columns className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Column Name *
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="e.g. In Review / QA"
                  className={styles.input}
                  autoFocus
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setIsAddColumnOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                >
                  Create Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
