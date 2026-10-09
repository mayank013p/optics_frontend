'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Plus, 
  Save, 
  BookOpen, 
  Link2, 
  Check, 
  Trash2, 
  Copy, 
  Eye, 
  Edit3, 
  Search,
  MoreVertical,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Minus,
  ExternalLink,
  Edit2,
  Share2,
  Clock,
  Layers,
  FileCode
} from 'lucide-react';
import { Document } from '../../types';
import { useOptics } from '../../context/OpticsContext';
import { FREE_PLAN_LIMITS, checkDocLimit } from '../../lib/planLimits';
import { DocsSkeleton } from '../common/Skeleton';
import styles from './DocsWikiView.module.css';

interface DocsWikiViewProps {
  documents: Document[];
  onSaveDoc: (doc: Document) => void;
  onOpenCreateDoc: () => void;
  onDeleteDoc?: (docId: string) => void;
}

export const DocsWikiView: React.FC<DocsWikiViewProps> = ({
  documents,
  onSaveDoc,
  onOpenCreateDoc,
  onDeleteDoc,
}) => {
  const { loading, docsLoading, can, handleCreateDoc, activeProject } = useOptics();
  
  // Calculate docs specifically scoped to the active project
  const projectDocs = useMemo(() => {
    if (!documents) return [];
    if (!activeProject) return documents;
    return documents.filter((d) => !d.projectId || d.projectId === activeProject.id);
  }, [documents, activeProject]);

  const [selectedDocId, setSelectedDocId] = useState<string>(projectDocs[0]?.id || '');
  const [docTitle, setDocTitle] = useState<string>(projectDocs[0]?.title || '');
  const [docContent, setDocContent] = useState<string>(projectDocs[0]?.content || '');
  const [editorHtml, setEditorHtml] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState(false); // Live rich WYSIWYG editor mode by default
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [openMenuDocId, setOpenMenuDocId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Markdown to Rich HTML Parser
  const markdownToHtml = useCallback((md: string): string => {
    if (!md) return '<p><br></p>';
    if (/<(h[1-6]|p|ul|ol|li|blockquote|strong|em|div|table|pre|code)[^>]*>/i.test(md)) {
      return md;
    }

    const lines = md.split('\n');
    const out: string[] = [];
    let inList: 'ul' | 'ol' | null = null;
    let inCode = false;
    let codeBuffer: string[] = [];

    const inlineFormat = (text: string): string => {
      return text
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>')
        .replace(/~~([^~]+)~~/g, '<del>$1</del>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (inCode) {
          out.push(`<pre><code>${codeBuffer.join('\n')}</code></pre>`);
          inCode = false;
          codeBuffer = [];
        } else {
          if (inList) { out.push(`</${inList}>`); inList = null; }
          inCode = true;
          codeBuffer = [];
        }
        continue;
      }

      if (inCode) {
        codeBuffer.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
        continue;
      }

      if (line.startsWith('# ')) {
        if (inList) { out.push(`</${inList}>`); inList = null; }
        out.push(`<h1>${inlineFormat(line.slice(2))}</h1>`);
        continue;
      }
      if (line.startsWith('## ')) {
        if (inList) { out.push(`</${inList}>`); inList = null; }
        out.push(`<h2>${inlineFormat(line.slice(3))}</h2>`);
        continue;
      }
      if (line.startsWith('### ')) {
        if (inList) { out.push(`</${inList}>`); inList = null; }
        out.push(`<h3>${inlineFormat(line.slice(4))}</h3>`);
        continue;
      }
      if (line.startsWith('> ')) {
        if (inList) { out.push(`</${inList}>`); inList = null; }
        out.push(`<blockquote>${inlineFormat(line.slice(2))}</blockquote>`);
        continue;
      }
      if (line.trim() === '---') {
        if (inList) { out.push(`</${inList}>`); inList = null; }
        out.push('<hr />');
        continue;
      }

      const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (olMatch) {
        if (inList !== 'ol') {
          if (inList) out.push(`</${inList}>`);
          out.push('<ol>');
          inList = 'ol';
        }
        out.push(`<li>${inlineFormat(olMatch[2])}</li>`);
        continue;
      }

      const ulMatch = line.match(/^[-*]\s+(.*)$/);
      if (ulMatch) {
        if (inList !== 'ul') {
          if (inList) out.push(`</${inList}>`);
          out.push('<ul>');
          inList = 'ul';
        }
        out.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
        continue;
      }

      if (inList) {
        out.push(`</${inList}>`);
        inList = null;
      }

      if (!line.trim()) {
        out.push('<p><br></p>');
      } else {
        out.push(`<p>${inlineFormat(line)}</p>`);
      }
    }

    if (inList) out.push(`</${inList}>`);
    if (inCode) out.push(`<pre><code>${codeBuffer.join('\n')}</code></pre>`);

    return out.join('');
  }, []);

  // HTML to clean text converter
  const htmlToMarkdown = useCallback((html: string): string => {
    if (!html) return '';
    let md = html;
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n');
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<ul[^>]*>/gi, '').replace(/<\/ul>/gi, '\n');
    md = md.replace(/<ol[^>]*>/gi, '').replace(/<\/ol>/gi, '\n');
    md = md.replace(/<hr\s*\/?>/gi, '\n---\n\n');
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    md = md.replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    md = md.replace(/<[^>]+>/g, '');
    md = md.replace(/&nbsp;/g, ' ');
    md = md.replace(/&lt;/g, '<');
    md = md.replace(/&gt;/g, '>');
    md = md.replace(/&amp;/g, '&');
    return md.trim();
  }, []);

  // Close 3-dot dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuDocId(null);
    if (openMenuDocId) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [openMenuDocId]);

  // Keep state synced when projectDocs or activeProject updates
  useEffect(() => {
    if (projectDocs.length > 0) {
      const match = projectDocs.find((d) => d.id === selectedDocId);
      if (match) {
        setDocTitle(match.title);
        const html = markdownToHtml(match.content || '');
        setDocContent(match.content || '');
        setEditorHtml(html);
        if (editorRef.current && document.activeElement !== editorRef.current) {
          editorRef.current.innerHTML = html;
        }
      } else {
        setSelectedDocId(projectDocs[0].id);
        setDocTitle(projectDocs[0].title);
        const html = markdownToHtml(projectDocs[0].content || '');
        setDocContent(projectDocs[0].content || '');
        setEditorHtml(html);
        if (editorRef.current && document.activeElement !== editorRef.current) {
          editorRef.current.innerHTML = html;
        }
      }
    } else {
      setSelectedDocId('');
      setDocTitle('');
      setDocContent('');
      setEditorHtml('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [projectDocs, selectedDocId, activeProject?.id, markdownToHtml]);

  const selectedDoc = useMemo(() => {
    return projectDocs.find((d) => d.id === selectedDocId) || (projectDocs.length > 0 ? projectDocs[0] : null);
  }, [projectDocs, selectedDocId]);

  const handleSelectDoc = (doc: Document) => {
    setSelectedDocId(doc.id);
    setDocTitle(doc.title);
    const html = markdownToHtml(doc.content || '');
    setDocContent(doc.content || '');
    setEditorHtml(html);
    if (editorRef.current) {
      editorRef.current.innerHTML = html;
    }
  };

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setEditorHtml(html);
    setDocContent(html);
  };

  const handleSave = useCallback(() => {
    if (!selectedDoc) return;
    const contentToSave = editorRef.current ? editorRef.current.innerHTML : editorHtml;
    onSaveDoc({
      ...selectedDoc,
      title: docTitle.trim() || 'Untitled Document',
      content: contentToSave,
      updatedAt: new Date().toISOString(),
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    showToast('Saved document changes');
  }, [selectedDoc, docTitle, editorHtml, onSaveDoc]);

  // Keyboard shortcut: Cmd+S / Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);


  // Safe Document Deletion (Works even for the very last document)
  const handleDeleteCurrentDoc = () => {
    if (!selectedDoc || !onDeleteDoc) return;
    if (confirm(`Delete document "${selectedDoc.title}"?`)) {
      const docToDeleteId = selectedDoc.id;
      const remainingDocs = projectDocs.filter((d) => d.id !== docToDeleteId);

      if (remainingDocs.length > 0) {
        setSelectedDocId(remainingDocs[0].id);
        setDocTitle(remainingDocs[0].title);
        setDocContent(remainingDocs[0].content || '');
      } else {
        setSelectedDocId('');
        setDocTitle('');
        setDocContent('');
      }

      onDeleteDoc(docToDeleteId);
      showToast(`Deleted "${selectedDoc.title}"`);
    }
  };

  const handleDeleteDocItem = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuDocId(null);
    if (!onDeleteDoc) return;

    if (confirm(`Delete document "${doc.title}"?`)) {
      const remainingDocs = projectDocs.filter((d) => d.id !== doc.id);
      if (selectedDocId === doc.id) {
        if (remainingDocs.length > 0) {
          setSelectedDocId(remainingDocs[0].id);
          setDocTitle(remainingDocs[0].title);
          setDocContent(remainingDocs[0].content || '');
        } else {
          setSelectedDocId('');
          setDocTitle('');
          setDocContent('');
        }
      }
      onDeleteDoc(doc.id);
      showToast(`Deleted "${doc.title}"`);
    }
  };

  // 3-Dot: Rename Document
  const handleRenameDoc = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuDocId(null);
    const newName = prompt('Enter new document title:', doc.title);
    if (newName && newName.trim() && newName.trim() !== doc.title) {
      const updated = { ...doc, title: newName.trim(), updatedAt: new Date().toISOString() };
      onSaveDoc(updated);
      if (doc.id === selectedDocId) {
        setDocTitle(newName.trim());
      }
      showToast(`Renamed to "${newName.trim()}"`);
    }
  };

  // 3-Dot: Duplicate Document
  const handleDuplicateDoc = async (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuDocId(null);
    const copyTitle = `${doc.title} (Copy)`;
    try {
      await handleCreateDoc(copyTitle, 'blank');
      showToast(`Created duplicate: "${copyTitle}"`);
    } catch (err) {
      console.error('Failed to duplicate doc:', err);
    }
  };

  // 3-Dot: Copy Link
  const handleCopyLink = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuDocId(null);
    const url = typeof window !== 'undefined' ? `${window.location.origin}/docs` : '/docs';
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    showToast('Copied document link to clipboard');
  };

  const handleCopyMarkdown = () => {
    const raw = editorRef.current ? editorRef.current.innerHTML : editorHtml;
    const cleanMd = htmlToMarkdown(raw || docContent);
    if (!cleanMd) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(cleanMd).catch(() => {});
      }
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied markdown to clipboard');
  };

  // Live Rich Formatting Command Executor
  const executeFormat = (command: string, value: string = '') => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(command, false, value);
    handleEditorInput();
  };

  const filteredDocs = useMemo(() => {
    const seen = new Set<string>();
    const unique = projectDocs.filter((d) => {
      if (!d || !d.id || seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
    if (!docSearchQuery.trim()) return unique;
    const q = docSearchQuery.toLowerCase();
    return unique.filter((d) => d.title.toLowerCase().includes(q));
  }, [projectDocs, docSearchQuery]);

  const wordCount = useMemo(() => {
    return docContent.trim() ? docContent.trim().split(/\s+/).length : 0;
  }, [docContent]);

  const readingTime = useMemo(() => {
    const mins = Math.max(1, Math.ceil(wordCount / 200));
    return `${mins} min read`;
  }, [wordCount]);

  if (docsLoading || (loading && projectDocs.length === 0)) {
    return <DocsSkeleton />;
  }

  return (
    <div className={styles.container}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-main)',
          padding: '0.625rem 1.125rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.15s ease-out'
        }}>
          <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.5} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Wiki Navigation Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarHeaderTitle}>
              <BookOpen className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <span className={styles.sidebarHeadingText}>
                {activeProject?.name ? `${activeProject.key} Wiki` : 'Project Wiki'}
              </span>
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                padding: '0.125rem 0.375rem',
                borderRadius: '9999px',
                backgroundColor: projectDocs.length >= FREE_PLAN_LIMITS.maxDocsPerWorkspace ? 'rgba(239, 68, 68, 0.12)' : 'var(--bg-badge)',
                color: projectDocs.length >= FREE_PLAN_LIMITS.maxDocsPerWorkspace ? '#dc2626' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}>
                {projectDocs.length}/{FREE_PLAN_LIMITS.maxDocsPerWorkspace}
              </span>
            </div>
            {can('doc.create') && (
              <button
                type="button"
                onClick={onOpenCreateDoc}
                className={styles.iconBtn}
                title={projectDocs.length >= FREE_PLAN_LIMITS.maxDocsPerWorkspace ? "Free plan doc limit reached (10/10)" : "New Document"}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Doc Search */}
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              value={docSearchQuery}
              onChange={(e) => setDocSearchQuery(e.target.value)}
              placeholder="Search docs in project..."
              className={styles.searchInput}
            />
          </div>

          {/* Documents List */}
          <div className={styles.docList}>
            {filteredDocs.length === 0 ? (
              <div className={styles.sidebarEmptyBox}>
                {docSearchQuery.trim() ? 'No matching documents' : 'No documents in this project'}
              </div>
            ) : (
              filteredDocs.map((doc, idx) => {
                const isActive = doc.id === selectedDocId;
                const isMenuOpen = openMenuDocId === doc.id;

                return (
                  <div
                    key={`${doc.id || 'doc'}-${idx}`}
                    className={`${styles.docRowContainer} ${isActive ? styles.docRowActive : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectDoc(doc)}
                      className={styles.docMainBtn}
                      title={doc.title}
                    >
                      <FileText 
                        className="w-3.5 h-3.5 flex-shrink-0" 
                        style={{ color: isActive ? 'var(--accent-magenta)' : 'var(--text-muted)' }} 
                      />
                      <span className={styles.docItemTitle}>{doc.title}</span>
                    </button>

                    {/* 3-Dot Action Menu Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuDocId(isMenuOpen ? null : doc.id);
                        }}
                        className={`${styles.docMoreBtn} ${isMenuOpen ? styles.docMoreBtnOpen : ''}`}
                        title="Document options"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* 3-Dot Contextual Dropdown */}
                      {isMenuOpen && (
                        <div
                          className={styles.docContextMenu}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleRenameDoc(doc, e)}
                            className={styles.docContextMenuItem}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-muted" />
                            <span>Rename</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDuplicateDoc(doc, e)}
                            className={styles.docContextMenuItem}
                          >
                            <Copy className="w-3.5 h-3.5 text-muted" />
                            <span>Duplicate</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(doc, e)}
                            className={styles.docContextMenuItem}
                          >
                            <Share2 className="w-3.5 h-3.5 text-muted" />
                            <span>Copy Link</span>
                          </button>

                          {can('doc.delete') && onDeleteDoc && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteDocItem(doc, e)}
                              className={`${styles.docContextMenuItem} ${styles.docContextMenuDanger}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Wiki Note */}
        <div className={styles.wikiNote}>
          <div className={styles.wikiNoteHeader}>
            <Link2 className="w-3.5 h-3.5 text-muted" />
            <span>Project Knowledge Base</span>
          </div>
          <p>Collaborative Markdown documents scoped to <strong>{activeProject?.name || 'this project'}</strong> with instant cloud sync.</p>
        </div>
      </div>

      {/* 2. Wiki Editor Canvas */}
      <div className={styles.editorCanvas}>
        {selectedDoc ? (
          <>
            {/* Document Header Controls */}
            <div className={styles.editorHeader}>
              <div className={styles.headerLeftMeta}>
                <div className={styles.statusIndicator}>
                  <div className={styles.pulseDot} />
                  <span>Cloud Synced</span>
                </div>
              </div>

              <div className={styles.headerActions}>
                {/* Stats */}
                <span className={styles.wordCountBadge}>
                  {wordCount} words · {readingTime}
                </span>

                {/* Edit / Preview Mode Switcher */}
                <div className={styles.modeSwitcher}>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(false)}
                    className={`${styles.modeBtn} ${!previewMode ? styles.modeBtnActive : ''}`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className={`${styles.modeBtn} ${previewMode ? styles.modeBtnActive : ''}`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                </div>

                {/* Copy Raw Markdown */}
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className={styles.actionBtn}
                  title="Copy Markdown to Clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Delete Doc: Works for ANY document, even the last doc */}
                {onDeleteDoc && can('doc.delete') && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentDoc}
                    className={styles.deleteBtn}
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Save Document */}
                {can('doc.create') && (
                  <button
                    type="button"
                    onClick={handleSave}
                    className={styles.saveBtn}
                    title="Save Document (⌘S)"
                  >
                    {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSaved ? 'Saved!' : 'Save'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* 3. Rich WYSIWYG Formatting Ribbon */}
            {!previewMode && can('doc.create') && (
              <div className={styles.formattingToolbar}>
                <button
                  type="button"
                  onClick={() => executeFormat('formatBlock', '<h1>')}
                  className={styles.toolbarBtn}
                  title="Heading 1"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeFormat('formatBlock', '<h2>')}
                  className={styles.toolbarBtn}
                  title="Heading 2"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeFormat('formatBlock', '<h3>')}
                  className={styles.toolbarBtn}
                  title="Heading 3"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                </button>

                <div className={styles.toolbarDivider} />

                <button
                  type="button"
                  onClick={() => executeFormat('bold')}
                  className={styles.toolbarBtn}
                  title="Bold (⌘B)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeFormat('italic')}
                  className={styles.toolbarBtn}
                  title="Italic (⌘I)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeFormat('strikeThrough')}
                  className={styles.toolbarBtn}
                  title="Strikethrough"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>

                <div className={styles.toolbarDivider} />

                <button
                  type="button"
                  onClick={() => executeFormat('formatBlock', '<blockquote>')}
                  className={styles.toolbarBtn}
                  title="Blockquote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeFormat('formatBlock', '<pre>')}
                  className={styles.toolbarBtn}
                  title="Code Block"
                >
                  <FileCode className="w-3.5 h-3.5" />
                </button>

                <div className={styles.toolbarDivider} />

                <button
                  type="button"
                  onClick={() => executeFormat('insertUnorderedList')}
                  className={styles.toolbarBtn}
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeFormat('insertOrderedList')}
                  className={styles.toolbarBtn}
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => executeFormat('insertHorizontalRule')}
                  className={styles.toolbarBtn}
                  title="Divider Rule"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 4. Prose Editor Writing Canvas */}
            <div className={styles.editorScrollArea}>
              <div className={styles.editorCenterCanvas}>
                {/* Large Title Input */}
                <input
                  type="text"
                  value={docTitle}
                  readOnly={!can('doc.create')}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Untitled Document"
                  className={styles.docTitleInput}
                />

                {/* Sub Metadata Ribbon */}
                <div className={styles.docSubMeta}>
                  <div className={styles.authorMeta}>
                    <div className={styles.authorAvatar}>
                      {selectedDoc.author?.name ? selectedDoc.author.name.charAt(0).toUpperCase() : 'O'}
                    </div>
                    <span>{selectedDoc.author?.name || 'Optics Contributor'}</span>
                  </div>

                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-muted" />
                    <span>Updated {new Date(selectedDoc.updatedAt || Date.now()).toLocaleDateString()}</span>
                  </span>

                  <span>·</span>
                  <span>{wordCount} words</span>
                  <span>·</span>
                  <span>{readingTime}</span>
                </div>

                {/* Live Rich WYSIWYG Document Editor or Rendered View */}
                {!previewMode ? (
                  <div
                    ref={editorRef}
                    contentEditable={can('doc.create')}
                    onInput={handleEditorInput}
                    onBlur={handleSave}
                    className={styles.liveDocEditor}
                    data-placeholder="Start typing your document, specs, or meeting notes here..."
                    suppressContentEditableWarning
                  />
                ) : (
                  <div 
                    className={styles.previewContainer}
                    onDoubleClick={() => {
                      if (can('doc.create')) setPreviewMode(false);
                    }}
                    dangerouslySetInnerHTML={{ __html: editorHtml || markdownToHtml(docContent) }}
                    title={can('doc.create') ? "Double-click to edit document" : undefined}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty Canvas when no document is present */
          <div className={styles.canvasEmptyState}>
            <div className={styles.emptyStateCard}>
              <div className={styles.emptyIconBox}>
                <BookOpen className="w-7 h-7" strokeWidth={1.75} />
              </div>
              <h2 className={styles.emptyTitle}>
                {activeProject ? `No Documents in ${activeProject.name}` : 'No Documentation Selected'}
              </h2>
              <p className={styles.emptyDesc}>
                Create product specs, system architecture guidelines, API contracts, or sprint meeting notes for your engineering team.
              </p>

              {can('doc.create') && (
                <>
                  <button
                    type="button"
                    onClick={onOpenCreateDoc}
                    className={styles.createFirstBtn}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Document</span>
                  </button>

                  <div className={styles.emptyTemplateRow}>
                    <button
                      type="button"
                      onClick={() => handleCreateDoc('Product Architecture Spec', 'specs')}
                      className={styles.templatePill}
                    >
                      <Layers className="w-3 h-3 text-muted" />
                      <span>Architecture Spec</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateDoc('Sprint Engineering Notes', 'notes')}
                      className={styles.templatePill}
                    >
                      <BookOpen className="w-3 h-3 text-muted" />
                      <span>Sprint Notes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCreateDoc('New Wiki Document', 'blank')}
                      className={styles.templatePill}
                    >
                      <FileText className="w-3 h-3 text-muted" />
                      <span>Blank Page</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
