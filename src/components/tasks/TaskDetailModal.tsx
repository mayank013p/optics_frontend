'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  CheckSquare,
  Plus,
  Trash2,
  Check,
  AlignLeft,
  Columns,
  Layers,
  Flame,
  Users,
  Zap,
  Calendar,
  MessageSquare,
  Tag,
  ChevronDown,
  Paperclip,
  ExternalLink,
  Globe,
  Edit3,
  Eye,
  Link as LinkIcon,
} from 'lucide-react';
import { Priority, TaskType, User as UserType, Subtask, TaskLabel, TaskAttachment, Issue } from '../../types';
import { useOptics } from '../../context/OpticsContext';
import { RichTextWithLinks } from '../common/RichTextWithLinks';
import styles from './TaskDetailModal.module.css';

const COMMENTS_PER_PAGE = 10;

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTask,
    setSelectedTask,
    handleUpdateTask,
    handleUpdateSubtasks,
    handleDeleteTask,
    handleAddComment: addCommentToBackend,
    addNotification,
    members,
    currentUser,
    can,
  } = useOptics();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [isAddAttachmentOpen, setIsAddAttachmentOpen] = useState(false);
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [type, setType] = useState<TaskType>('FEATURE');
  const [estimate, setEstimate] = useState<number>(3);
  const [dueDate, setDueDate] = useState<string>('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [isAddLabelOpen, setIsAddLabelOpen] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const canManageSubtasks = can('task.subtask') || can('task.update');

  // Pagination
  const [visibleComments, setVisibleComments] = useState(COMMENTS_PER_PAGE);

  // Mention state
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionDropdownOpen, setMentionDropdownOpen] = useState(false);
  const [mentionCursorPos, setMentionCursorPos] = useState(0);
  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedTask) {
      setTitle(selectedTask.title);
      setDescription(selectedTask.description || '');
      setStatus(selectedTask.status);
      setPriority(selectedTask.priority);
      setType(selectedTask.type || 'FEATURE');
      setEstimate(selectedTask.estimate || 3);
      setDueDate(selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : '');
      setSubtasks(selectedTask.subtasks || []);
      setLabels(selectedTask.labels?.map((l) => l.label) || []);
      setAttachments(selectedTask.attachments || []);
      setVisibleComments(COMMENTS_PER_PAGE);
      setIsEditingDescription(!selectedTask.description);
    }
  }, [selectedTask]);

  if (!selectedTask) return null;

  const triggerUpdate = (partial: Partial<Issue>) => {
    const updated: Issue = {
      ...selectedTask,
      title,
      description,
      status,
      priority,
      type,
      estimate,
      dueDate,
      subtasks,
      attachments,
      labels: labels.map((l) => ({ label: l })),
      ...partial,
    };
    handleUpdateTask(updated);
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttachmentUrl.trim()) return;
    let formattedUrl = newAttachmentUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    const newAtt: TaskAttachment = {
      id: `att-${Date.now()}`,
      name: newAttachmentName.trim() || formattedUrl,
      url: formattedUrl,
      size: 'Link',
      uploadedAt: new Date().toISOString(),
    };
    const nextAtts = [...attachments, newAtt];
    setAttachments(nextAtts);
    triggerUpdate({ attachments: nextAtts });
    setNewAttachmentUrl('');
    setNewAttachmentName('');
    setIsAddAttachmentOpen(false);
  };

  const handleDeleteAttachment = (attId: string) => {
    const nextAtts = attachments.filter((a) => a.id !== attId);
    setAttachments(nextAtts);
    triggerUpdate({ attachments: nextAtts });
  };

  const handleTitleBlur = () => {
    if (title.trim() && title !== selectedTask.title) {
      triggerUpdate({ title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== selectedTask.description) {
      triggerUpdate({ description });
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    triggerUpdate({ status: newStatus });
  };

  const handlePriorityChange = (newPriority: Priority) => {
    setPriority(newPriority);
    triggerUpdate({ priority: newPriority });
  };

  const handleTypeChange = (newType: TaskType) => {
    setType(newType);
    triggerUpdate({ type: newType });
  };

  const handleEstimateChange = (val: number) => {
    setEstimate(val);
    triggerUpdate({ estimate: val });
  };

  const handleDueDateChange = (val: string) => {
    setDueDate(val);
    triggerUpdate({ dueDate: val });
  };

  const handleToggleSubtask = (stId: string) => {
    const nextSubtasks = subtasks.map((st) =>
      st.id === stId ? { ...st, completed: !st.completed } : st
    );
    setSubtasks(nextSubtasks);
    handleUpdateSubtasks(selectedTask.id, nextSubtasks);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const nextSubtasks = [
      ...subtasks,
      { id: `st-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false },
    ];
    setSubtasks(nextSubtasks);
    setNewSubtaskTitle('');
    handleUpdateSubtasks(selectedTask.id, nextSubtasks);
  };

  const handleDeleteSubtask = (stId: string) => {
    const nextSubtasks = subtasks.filter((st) => st.id !== stId);
    setSubtasks(nextSubtasks);
    handleUpdateSubtasks(selectedTask.id, nextSubtasks);
  };

  const handleToggleAssignee = (user: UserType) => {
    const currentAssignees = selectedTask.assignees || [];
    const exists = currentAssignees.some((a) => a.user.id === user.id);
    let nextAssignees;
    if (exists) {
      nextAssignees = currentAssignees.filter((a) => a.user.id !== user.id);
    } else {
      nextAssignees = [...currentAssignees, { user }];
      // Send notification when assigned
      addNotification({
        title: `Task Assigned: ${selectedTask.key}`,
        message: `${currentUser?.name || 'Someone'} assigned ${user.name} to ${selectedTask.key}: "${selectedTask.title}"`,
        type: 'assign',
        taskId: selectedTask.id,
        taskKey: selectedTask.key,
      });
    }
    triggerUpdate({ assignees: nextAssignees });
  };

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    const newLabel: TaskLabel = {
      id: `lbl-${Date.now()}`,
      name: newLabelName.trim(),
      color: 'var(--text-main)',
    };
    const nextLabels = [...labels, newLabel];
    setLabels(nextLabels);
    setNewLabelName('');
    setIsAddLabelOpen(false);
    triggerUpdate({ labels: nextLabels.map((l) => ({ label: l })) });
  };

  const handleDeleteLabel = (labelId: string) => {
    const nextLabels = labels.filter((l) => l.id !== labelId);
    setLabels(nextLabels);
    triggerUpdate({ labels: nextLabels.map((l) => ({ label: l })) });
  };

  // ---------- Comment with @mention ----------
  const handleCommentInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewComment(val);

    const cursor = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursor);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1].toLowerCase());
      setMentionCursorPos(cursor);
      setMentionDropdownOpen(true);
    } else {
      setMentionDropdownOpen(false);
    }
  };

  const handleMentionSelect = (user: UserType) => {
    const textBeforeMention = newComment.slice(0, mentionCursorPos).replace(/@\w*$/, '');
    const textAfterCursor = newComment.slice(mentionCursorPos);
    const nextVal = `${textBeforeMention}@${user.name} ${textAfterCursor}`;
    setNewComment(nextVal);
    setMentionDropdownOpen(false);
    commentInputRef.current?.focus();
  };

  const filteredMentionMembers = members.filter((m) =>
    m.user.name.toLowerCase().includes(mentionQuery)
  );

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed || isSubmittingComment) return;
    setIsSubmittingComment(true);
    setNewComment('');
    setMentionDropdownOpen(false);
    try {
      await addCommentToBackend(selectedTask.id, trimmed);

      // 1. Notify mentioned users
      const lower = trimmed.toLowerCase();
      const mentionedMembers = members.filter((m) =>
        lower.includes(`@${m.user.name.toLowerCase()}`)
      );
      mentionedMembers.forEach((m) => {
        addNotification({
          title: `Mentioned in ${selectedTask.key}`,
          message: `${currentUser?.name || 'Someone'} mentioned you in a comment on "${selectedTask.title}": "${trimmed.length > 70 ? trimmed.slice(0, 70) + '...' : trimmed}"`,
          type: 'mention',
          taskId: selectedTask.id,
          taskKey: selectedTask.key,
        });
      });

      // 2. Notify other task assignees of the new comment (if not already mentioned)
      const assigneesToNotify = (selectedTask.assignees || []).filter(
        (a) => a.user.id !== currentUser?.id && !mentionedMembers.some((m) => m.user.id === a.user.id)
      );
      assigneesToNotify.forEach((a) => {
        addNotification({
          title: `New Comment on ${selectedTask.key}`,
          message: `${currentUser?.name || 'Someone'} commented on "${selectedTask.title}": "${trimmed.length > 70 ? trimmed.slice(0, 70) + '...' : trimmed}"`,
          type: 'mention',
          taskId: selectedTask.id,
          taskKey: selectedTask.key,
        });
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;
  const allComments = selectedTask.comments || [];
  const visibleCommentList = allComments.slice(0, visibleComments);
  const hasMoreComments = allComments.length > visibleComments;

  return (
    <div
      className={styles.overlay}
      onClick={() => setSelectedTask(null)}
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.taskKeyBadge}>
              {selectedTask.key}
            </span>
            <span className={styles.headerTitle}>
              Task Details
            </span>
          </div>

          <div className={styles.headerActions}>
            {can('task.delete') && (
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to delete task ${selectedTask.key}?`)) {
                    handleDeleteTask(selectedTask.id);
                    setSelectedTask(null);
                  }
                }}
                className={styles.deleteBtn}
                title="Delete Task"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
            <button
              onClick={() => setSelectedTask(null)}
              className={styles.closeBtn}
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          {/* Main Area */}
          <div className={styles.mainContent}>
            <div>
              <input
                type="text"
                value={title}
                readOnly={!can('task.update')}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className={styles.titleInput}
                placeholder={can('task.update') ? "Task Title..." : "Read-only Task"}
              />
            </div>

            <div className={styles.labelsRow}>
              <span className={styles.labelsHeading}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Tag className="w-3 h-3" />
                  Tags:
                </span>
              </span>
              {labels.map((lbl) => (
                <span key={lbl.id} className={styles.labelPill}>
                  {lbl.name}
                  {can('task.update') && (
                    <button
                      type="button"
                      onClick={() => handleDeleteLabel(lbl.id)}
                      className={styles.removeLabelBtn}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </span>
              ))}

              {can('task.update') && (
                isAddLabelOpen ? (
                  <form onSubmit={handleAddLabel} style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      placeholder="Tag name..."
                      autoFocus
                      className={styles.subtaskInput}
                      style={{ padding: '0.1875rem 0.5rem', width: '6rem', fontSize: '0.6875rem' }}
                    />
                    <button 
                      type="submit" 
                      className="px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all"
                      style={{
                        backgroundColor: 'var(--button-primary-bg)',
                        color: 'var(--button-primary-text)',
                        border: 'none',
                      }}
                    >
                      Add
                    </button>
                    <button type="button" onClick={() => setIsAddLabelOpen(false)} className={styles.closeBtn}>
                      ✕
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddLabelOpen(true)}
                    className={styles.addLabelBtn}
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Tag</span>
                  </button>
                )
              )}
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <AlignLeft className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                  Description & Deliverables
                </span>
                {isEditingDescription && (
                  <span style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    Press Esc or click outside to save
                  </span>
                )}
              </div>

              {isEditingDescription ? (
                <textarea
                  rows={4}
                  value={description}
                  readOnly={!can('task.update')}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => {
                    handleDescriptionBlur();
                    setIsEditingDescription(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape' || ((e.metaKey || e.ctrlKey) && e.key === 'Enter')) {
                      e.currentTarget.blur();
                    }
                  }}
                  placeholder={can('task.update') ? "Add deliverables, acceptance criteria, links (http://...) or technical context..." : "No description provided (read-only)."}
                  className={styles.textarea}
                  autoFocus
                />
              ) : (
                <div
                  onClick={() => {
                    if (can('task.update')) setIsEditingDescription(true);
                  }}
                  className={styles.descriptionViewCanvas}
                  title={can('task.update') ? "Click to edit description" : undefined}
                >
                  {description.trim() ? (
                    <RichTextWithLinks text={description} showPreviews={true} />
                  ) : (
                    <span style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.8125rem' }}>
                      {can('task.update') ? "+ Click to add description, deliverables, or links..." : "No description provided."}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Attachments & External Links Section */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                  <Paperclip className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                  <span>Attachments & Links</span>
                  {attachments.length > 0 && (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                      ({attachments.length})
                    </span>
                  )}
                </div>

                {can('task.update') && (
                  <button
                    type="button"
                    onClick={() => setIsAddAttachmentOpen(!isAddAttachmentOpen)}
                    className={styles.addLabelBtn}
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Attach Link</span>
                  </button>
                )}
              </div>

              {isAddAttachmentOpen && (
                <form
                  onSubmit={handleAddAttachment}
                  className="p-3 rounded-lg border mb-3 flex flex-col gap-2"
                  style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      required
                      value={newAttachmentUrl}
                      onChange={(e) => setNewAttachmentUrl(e.target.value)}
                      placeholder="Paste link: https://figma.com/..., http://localhost:3000/..."
                      className={styles.input}
                      style={{ fontSize: '0.75rem', flex: 1 }}
                      autoFocus
                    />
                    <input
                      type="text"
                      value={newAttachmentName}
                      onChange={(e) => setNewAttachmentName(e.target.value)}
                      placeholder="Label (e.g. Design Specs)"
                      className={styles.input}
                      style={{ fontSize: '0.75rem', width: '11rem' }}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddAttachmentOpen(false)}
                      className={styles.cancelBtn}
                      style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all"
                      style={{
                        backgroundColor: 'var(--button-primary-bg)',
                        color: 'var(--button-primary-text)',
                        border: 'none',
                      }}
                    >
                      Add Attachment
                    </button>
                  </div>
                </form>
              )}

              {attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-2.5 rounded-lg border flex items-center justify-between gap-2 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Globe className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent-amber, #b45309)' }} />
                        <div className="min-w-0 flex-1">
                          <a
                            href={att.url || '#'}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-xs font-bold truncate block hover:underline"
                            style={{ color: 'var(--text-main)' }}
                          >
                            {att.name}
                          </a>
                          <span className="text-[10px] text-zinc-500 truncate block">
                            {att.url}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={att.url || '#'}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={styles.removeLabelBtn}
                          title="Open link in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {can('task.update') && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(att.id)}
                            className={styles.removeLabelBtn}
                            title="Remove attachment"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !isAddAttachmentOpen && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                    No attachments or external links added.
                  </div>
                )
              )}
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionHeaderLeft}>
                  <CheckSquare className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                  <span>Subtasks & Checklist</span>
                </div>
                <span className={styles.sectionHeaderRight}>
                  {completedSubtasksCount} of {subtasks.length} done
                </span>
              </div>

              <div className={styles.subtaskList}>
                {subtasks.map((st) => (
                  <div key={st.id} className={styles.subtaskItem}>
                    <label className={styles.subtaskLabel}>
                      <input
                        type="checkbox"
                        checked={st.completed}
                        disabled={!canManageSubtasks}
                        onChange={() => handleToggleSubtask(st.id)}
                        style={{ cursor: canManageSubtasks ? 'pointer' : 'not-allowed' }}
                      />
                      <span style={{
                        textDecoration: st.completed ? 'line-through' : 'none',
                        color: st.completed ? 'var(--text-dim)' : 'var(--text-main)',
                      }}>
                        {st.title}
                      </span>
                    </label>
                    {canManageSubtasks && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(st.id)}
                        className={styles.removeLabelBtn}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {canManageSubtasks && (
                <form onSubmit={handleAddSubtask} className={styles.subtaskInputRow}>
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="+ Add new subtask..."
                    className={styles.subtaskInput}
                  />
                  <button
                    type="submit"
                    className={styles.subtaskAddBtn}
                  >
                    Add
                  </button>
                </form>
              )}
            </div>

            {/* Activity & Comments */}
            <div className={styles.commentSection}>
              <div className={styles.sectionHeader}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <MessageSquare className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                  Activity & Comments
                  {allComments.length > 0 && (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                      ({allComments.length})
                    </span>
                  )}
                </span>
              </div>

              {/* Comment input with mention */}
              <div style={{ position: 'relative' }}>
                <form onSubmit={handleSubmitComment} className={styles.commentInputRow}>
                  <input
                    ref={commentInputRef}
                    type="text"
                    value={newComment}
                    onChange={handleCommentInput}
                    placeholder={can('comment.create') ? "Leave a comment… type @ to mention someone" : "Commenting is disabled for your role."}
                    className={styles.commentInput}
                    disabled={isSubmittingComment || !can('comment.create')}
                    autoComplete="off"
                  />
                  {can('comment.create') && (
                    <button
                      type="submit"
                      className={styles.commentSendBtn}
                      disabled={isSubmittingComment || !newComment.trim()}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  )}
                </form>

                {/* @mention dropdown */}
                {mentionDropdownOpen && filteredMentionMembers.length > 0 && (
                  <div className={styles.assigneeDropdown} style={{ top: '100%', left: 0, right: 0, zIndex: 100, marginTop: '0.25rem' }}>
                    {filteredMentionMembers.map((m) => (
                      <button
                        key={m.user.id}
                        type="button"
                        className={styles.assigneeOption}
                        onMouseDown={(e) => { e.preventDefault(); handleMentionSelect(m.user); }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className={styles.assigneeAvatar}>{m.user.name.charAt(0)}</div>
                          <span>{m.user.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Comments list */}
              <div className={styles.commentList}>
                {visibleCommentList.length > 0 ? (
                  <>
                    {visibleCommentList.map((c) => (
                      <div key={c.id} className={styles.commentCard}>
                        <div className={styles.commentTop}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <div className={styles.assigneeAvatar} style={{ width: '1.25rem', height: '1.25rem', fontSize: '0.5625rem', flexShrink: 0 }}>
                              {(c.user?.name || 'T').charAt(0)}
                            </div>
                            <span className={styles.commentAuthor}>
                              {c.user?.name || 'Teammate'}
                            </span>
                          </div>
                          <span className={styles.commentTime}>
                            {new Date(c.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={styles.commentText}>
                          <RichTextWithLinks text={c.content} showPreviews={true} />
                        </div>
                      </div>
                    ))}

                    {hasMoreComments && (
                      <button
                        type="button"
                        onClick={() => setVisibleComments((v) => v + COMMENTS_PER_PAGE)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-dim)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          padding: '0.25rem 0',
                          fontFamily: 'inherit',
                        }}
                      >
                        <ChevronDown className="w-3 h-3" />
                        Show {Math.min(COMMENTS_PER_PAGE, allComments.length - visibleComments)} more comments
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-dim)' }}>
                    No comments yet. Be the first to comment!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Columns className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                  Status
                </span>
              </label>
              <select
                value={status}
                disabled={!can('task.update')}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={styles.select}
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Layers className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                  Task Type
                </span>
              </label>
              <select
                value={type}
                disabled={!can('task.update')}
                onChange={(e) => handleTypeChange(e.target.value as TaskType)}
                className={styles.select}
              >
                <option value="FEATURE">Feature</option>
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="IMPROVEMENT">Improvement</option>
                <option value="EPIC">Epic</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Flame className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                  Priority
                </span>
              </label>
              <select
                value={priority}
                disabled={!can('task.update')}
                onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                className={styles.select}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent 🔥</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabel}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-dim)' }} />
                  Assignees
                </span>
                {can('task.update') && (
                  <button
                    type="button"
                    onClick={() => setIsAssigneeDropdownOpen((prev) => !prev)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.6875rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    + Assign
                  </button>
                )}
              </div>

              <div className={styles.assigneesList}>
                {selectedTask.assignees && selectedTask.assignees.length > 0 ? (
                  selectedTask.assignees.map((a, i) => (
                    <div key={i} className={styles.assigneeCard}>
                      <div className={styles.assigneeCardLeft}>
                        <div className={styles.assigneeAvatar}>
                          {a.user.name.charAt(0)}
                        </div>
                        <span className={styles.assigneeName}>
                          {a.user.name}
                        </span>
                      </div>
                      {can('task.update') && (
                        <button
                          type="button"
                          onClick={() => handleToggleAssignee(a.user)}
                          className={styles.removeLabelBtn}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
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
                    const isSelected = selectedTask.assignees?.some((a) => a.user.id === u.id);
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
                onChange={(e) => handleEstimateChange(Number(e.target.value))}
                className={styles.input}
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>

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
                onChange={(e) => handleDueDateChange(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
