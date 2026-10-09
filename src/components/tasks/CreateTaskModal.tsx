'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Layers, 
  CheckSquare, 
  Check, 
  Calendar,
  Tag,
  User as UserIcon,
  Type,
  AlignLeft,
  Columns,
  Flame,
  Users,
  Zap
} from 'lucide-react';
import { Priority, TaskType, User as UserType } from '../../types';
import { useOptics } from '../../context/OpticsContext';
import styles from './CreateTaskModal.module.css';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    priority: Priority;
    type: TaskType;
    estimate: number;
    columnId?: string;
    dueDate?: string;
    assigneeIds?: string[];
    labels?: string[];
    subtasks?: string[];
  }) => void;
  defaultColumnId?: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultColumnId,
}) => {
  const { board, members, can } = useOptics();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [type, setType] = useState<TaskType>('FEATURE');
  const [estimate, setEstimate] = useState<number>(3);
  const [columnId, setColumnId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [selectedAssignees, setSelectedAssignees] = useState<UserType[]>([]);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabelInput, setNewLabelInput] = useState('');
  const [isAddLabelOpen, setIsAddLabelOpen] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (defaultColumnId) {
        setColumnId(defaultColumnId);
      } else if (board?.columns && board.columns.length > 0) {
        setColumnId(board.columns[0].id);
      }
    }
  }, [isOpen, defaultColumnId, board]);

  if (!isOpen || !can('task.create')) return null;

  const handleToggleAssignee = (user: UserType) => {
    const exists = selectedAssignees.some((u) => u.id === user.id);
    if (exists) {
      setSelectedAssignees(selectedAssignees.filter((u) => u.id !== user.id));
    } else {
      setSelectedAssignees([...selectedAssignees, user]);
    }
  };

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelInput.trim()) return;
    if (!labels.includes(newLabelInput.trim())) {
      setLabels([...labels, newLabelInput.trim()]);
    }
    setNewLabelInput('');
    setIsAddLabelOpen(false);
  };

  const handleRemoveLabel = (labelName: string) => {
    setLabels(labels.filter((l) => l !== labelName));
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    setSubtasks([...subtasks, newSubtaskInput.trim()]);
    setNewSubtaskInput('');
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      type,
      estimate,
      columnId: columnId || (board?.columns && board.columns.length > 0 ? board.columns[0].id : undefined),
      dueDate: dueDate || undefined,
      assigneeIds: selectedAssignees.map((u) => u.id),
      labels,
      subtasks,
    });

    // Reset state
    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setType('FEATURE');
    setEstimate(3);
    setDueDate('');
    setSelectedAssignees([]);
    setLabels([]);
    setSubtasks([]);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderTitle}>
            <Plus className="w-4 h-4" strokeWidth={2.2} style={{ color: 'var(--accent-amber)' }} />
            <span>Create New Task</span>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.modalBody}>
            {/* Left Column: Title, Description, Tags, Subtasks */}
            <div className={styles.mainColumn}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Type className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Task Title *
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Implement real-time WebSocket sync engine"
                  className={styles.titleInput}
                  autoFocus
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <AlignLeft className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Description & Deliverables
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide technical requirements, acceptance criteria, or context..."
                  className={styles.textarea}
                />
              </div>

              {/* Tags Section */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Tag className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    <span>Tags & Custom Labels</span>
                  </div>
                </div>

                <div className={styles.labelsRow}>
                  {labels.map((lbl) => (
                    <span key={lbl} className={styles.labelPill}>
                      {lbl}
                      <button
                        type="button"
                        onClick={() => handleRemoveLabel(lbl)}
                        className={styles.removeBtn}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}

                  {isAddLabelOpen ? (
                    <div style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={newLabelInput}
                        onChange={(e) => setNewLabelInput(e.target.value)}
                        placeholder="Tag name..."
                        autoFocus
                        className={styles.subtaskInput}
                        style={{ padding: '0.1875rem 0.5rem', width: '6rem', fontSize: '0.6875rem' }}
                      />
                      <button
                        type="button"
                        onClick={handleAddLabel}
                        className={styles.submitBtn}
                        style={{ padding: '0.25rem 0.625rem', fontSize: '0.6875rem' }}
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddLabelOpen(false)}
                        className={styles.removeBtn}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddLabelOpen(true)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-sm, 0.375rem)',
                        backgroundColor: 'transparent',
                        color: 'var(--text-muted)',
                        border: '1px dashed var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Tag</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Subtasks Section */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <CheckSquare className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    <span>Subtasks & Checklist ({subtasks.length})</span>
                  </div>
                </div>

                {subtasks.length > 0 && (
                  <div className={styles.subtaskList}>
                    {subtasks.map((st, index) => (
                      <div key={index} className={styles.subtaskItem}>
                        <span>{st}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubtask(index)}
                          className={styles.removeBtn}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.subtaskInputRow}>
                  <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    placeholder="+ Add a checklist item..."
                    className={styles.subtaskInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSubtask}
                    className={styles.submitBtn}
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Status/Column, Priority, Type, Assignees, Estimate, Due Date */}
            <div className={styles.sideColumn}>
              {/* Column / Status */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Columns className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Target Column
                  </span>
                </label>
                <select
                  value={columnId}
                  onChange={(e) => setColumnId(e.target.value)}
                  className={styles.select}
                >
                  {board?.columns && board.columns.length > 0 ? (
                    board.columns.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.name}
                      </option>
                    ))
                  ) : (
                    <option value="">To Do</option>
                  )}
                </select>
              </div>

              {/* Type */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Layers className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Task Type
                  </span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as TaskType)}
                  className={styles.select}
                >
                  <option value="FEATURE">Feature</option>
                  <option value="TASK">Task</option>
                  <option value="BUG">Bug</option>
                  <option value="IMPROVEMENT">Improvement</option>
                  <option value="EPIC">Epic</option>
                </select>
              </div>

              {/* Priority */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Flame className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Priority
                  </span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className={styles.select}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent 🔥</option>
                </select>
              </div>

              {/* Assignees */}
              <div className={styles.fieldGroup}>
                <div className={styles.fieldLabel}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Assignees
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAssigneeDropdownOpen((prev) => !prev)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.6875rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    + Assign
                  </button>
                </div>

                <div className={styles.assigneesList}>
                  {selectedAssignees.length > 0 ? (
                    selectedAssignees.map((u) => (
                      <div key={u.id} className={styles.assigneeCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className={styles.assigneeAvatar}>
                            {u.name.charAt(0)}
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                            {u.name}
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleToggleAssignee(u)}
                          className={styles.removeBtn}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-dim)' }}>
                      Unassigned
                    </div>
                  )}
                </div>

                {isAssigneeDropdownOpen && (
                  <div className={styles.assigneeDropdown}>
                    {members.map((m) => {
                      const u = m.user;
                      const isSelected = selectedAssignees.some((a) => a.id === u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleToggleAssignee(u)}
                          className={styles.assigneeOption}
                          style={{
                            backgroundColor: isSelected ? 'var(--bg-badge)' : 'transparent',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className={styles.assigneeAvatar}>
                              {u.name.charAt(0)}
                            </div>
                            <span>{u.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Estimate (pts) */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Zap className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Estimate (pts)
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={21}
                  value={estimate}
                  onChange={(e) => setEstimate(Number(e.target.value))}
                  className={styles.input}
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>

              {/* Due Date */}
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                    Due Date
                  </span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn}>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Create Task</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
