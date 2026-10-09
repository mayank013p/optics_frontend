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
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Minus,
  Edit2,
  Share2,
  Clock,
  Layers,
  FileCode,
  Link as LinkIcon,
  RemoveFormatting
} from 'lucide-react';
import { Document } from '../../types';
import { useOptics } from '../../context/OpticsContext';
import { FREE_PLAN_LIMITS } from '../../lib/planLimits';
import { DocsSkeleton } from '../common/Skeleton';
import styles from './DocsWikiView.module.css';

interface DocsWikiViewProps {
  documents: Document[];
  onSaveDoc: (doc: Document) => void;
  onOpenCreateDoc: () => void;
  onDeleteDoc?: (docId: string) => void;
}

interface ActiveFormatState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrike: boolean;
  isH1: boolean;
  isH2: boolean;
  isH3: boolean;
  isQuote: boolean;
  isCode: boolean;
  isUl: boolean;
  isOl: boolean;
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

  // Active toolbar formats state
  const [activeFormats, setActiveFormats] = useState<ActiveFormatState>({
    isBold: false,
    isItalic: false,
    isUnderline: false,
    isStrike: false,
    isH1: false,
    isH2: false,
    isH3: false,
    isQuote: false,
    isCode: false,
    isUl: false,
    isOl: false,
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const currentLoadedDocIdRef = useRef<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Robust Markdown & Text to Rich Semantic HTML Converter
  const markdownToHtml = useCallback((input: string): string => {
    if (!input || !input.trim()) return '<p><br></p>';

    // If input is purely structured HTML without raw markdown syntax, return sanitized
    const hasRawMarkdownSyntax =
      /(^|\n)(#{1,6}\s|>|\d+\.\s|[-*]\s|```|---)/m.test(input) ||
      /(\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|~~[^~]+~~|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/.test(input);

    if (!hasRawMarkdownSyntax && /<(p|h[1-6]|ul|ol|li|blockquote|div|pre|code|table)[^>]*>/i.test(input)) {
      return input;
    }

    // Step 1: Normalize line breaks
    let raw = input.replace(/\r\n/g, '\n');

    // Step 2: Inline formatter
    const inlineFormat = (text: string): string => {
      let formatted = text;
      // Bold + Italic (***text*** or ___text___)
      formatted = formatted.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
      // Bold (**text** or __text__)
      formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');
      // Italic (*text* or _text_)
      formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');
      // Strikethrough (~~text~~)
      formatted = formatted.replace(/~~([^~]+)~~/g, '<del>$1</del>');
      // Inline code (`code`)
      formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
      // Links [text](url)
      formatted = formatted.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
      return formatted;
    };

    // Step 3: Handle multiline block structures
    const lines = raw.split('\n');
    const htmlLines: string[] = [];
    let inList: 'ul' | 'ol' | null = null;
    let inCode = false;
    let codeBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks (```)
      if (line.trim().startsWith('```')) {
        if (inCode) {
          htmlLines.push(`<pre><code>${codeBuffer.join('\n')}</code></pre>`);
          inCode = false;
          codeBuffer = [];
        } else {
          if (inList) { htmlLines.push(`</${inList}>`); inList = null; }
          inCode = true;
          codeBuffer = [];
        }
        continue;
      }

      if (inCode) {
        codeBuffer.push(line.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
        continue;
      }

      // Headings
      if (/^#\s+(.*)$/.test(line)) {
        if (inList) { htmlLines.push(`</${inList}>`); inList = null; }
        const text = line.replace(/^#\s+/, '');
        htmlLines.push(`<h1>${inlineFormat(text)}</h1>`);
        continue;
      }
      if (/^##\s+(.*)$/.test(line)) {
        if (inList) { htmlLines.push(`</${inList}>`); inList = null; }
        const text = line.replace(/^##\s+/, '');
        htmlLines.push(`<h2>${inlineFormat(text)}</h2>`);
        continue;
      }
      if (/^###\s+(.*)$/.test(line)) {
        if (inList) { htmlLines.push(`</${inList}>`); inList = null; }
        const text = line.replace(/^###\s+/, '');
        htmlLines.push(`<h3>${inlineFormat(text)}</h3>`);
        continue;
      }

      // Blockquote (> text)
      if (/^>\s*(.*)$/.test(line)) {
        if (inList) { htmlLines.push(`</${inList}>`); inList = null; }
        const text = line.replace(/^>\s*/, '');
        htmlLines.push(`<blockquote>${inlineFormat(text) || '<br>'}</blockquote>`);
        continue;
      }

      // Horizontal Divider (--- or ***)
      if (/^(---|\*\*\*|___)\s*$/.test(line.trim())) {
        if (inList) { htmlLines.push(`</${inList}>`); inList = null; }
        htmlLines.push('<hr />');
        continue;
      }

      // Numbered Ordered List (1. text)
      const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
      if (olMatch) {
        if (inList !== 'ol') {
          if (inList) htmlLines.push(`</${inList}>`);
          htmlLines.push('<ol>');
          inList = 'ol';
        }
        htmlLines.push(`<li>${inlineFormat(olMatch[2])}</li>`);
        continue;
      }

      // Bullet Unordered List (- text or * text)
      const ulMatch = line.match(/^[-*]\s+(.*)$/);
      if (ulMatch) {
        if (inList !== 'ul') {
          if (inList) htmlLines.push(`</${inList}>`);
          htmlLines.push('<ul>');
          inList = 'ul';
        }
        htmlLines.push(`<li>${inlineFormat(ulMatch[1])}</li>`);
        continue;
      }

      // Close open list if non-list line encountered
      if (inList) {
        htmlLines.push(`</${inList}>`);
        inList = null;
      }

      // Empty blank line
      if (!line.trim()) {
        htmlLines.push('<p><br></p>');
      } else {
        // Check if line already has HTML tags or is plain paragraph text
        if (/<(p|h[1-6]|blockquote|pre|div)[^>]*>/i.test(line)) {
          htmlLines.push(inlineFormat(line));
        } else {
          htmlLines.push(`<p>${inlineFormat(line)}</p>`);
        }
      }
    }

    if (inList) htmlLines.push(`</${inList}>`);
    if (inCode) htmlLines.push(`<pre><code>${codeBuffer.join('\n')}</code></pre>`);

    return htmlLines.join('');
  }, []);

  // HTML to clean Markdown Converter
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
    md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
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

  // Update active format state based on current cursor selection
  const updateToolbarActiveState = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isUnderline = document.queryCommandState('underline');
      const isStrike = document.queryCommandState('strikeThrough');
      const isUl = document.queryCommandState('insertUnorderedList');
      const isOl = document.queryCommandState('insertOrderedList');

      let isH1 = false;
      let isH2 = false;
      let isH3 = false;
      let isQuote = false;
      let isCode = false;

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        let node: Node | null = sel.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();
            if (tag === 'h1') isH1 = true;
            if (tag === 'h2') isH2 = true;
            if (tag === 'h3') isH3 = true;
            if (tag === 'blockquote') isQuote = true;
            if (tag === 'code' || tag === 'pre') isCode = true;
          }
          node = node.parentNode;
        }
      }

      setActiveFormats({
        isBold,
        isItalic,
        isUnderline,
        isStrike,
        isH1,
        isH2,
        isH3,
        isQuote,
        isCode,
        isUl,
        isOl,
      });
    } catch {
      // Ignore queryCommand errors if element not focused
    }
  }, []);

  // Listen to selection changes to sync toolbar states in real time
  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateToolbarActiveState();
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateToolbarActiveState]);

  // Close 3-dot dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuDocId(null);
    if (openMenuDocId) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [openMenuDocId]);

  // Synchronize document when selectedDocId or projectDocs updates
  useEffect(() => {
    if (projectDocs.length > 0) {
      const match = projectDocs.find((d) => d.id === selectedDocId) || projectDocs[0];
      if (match.id !== currentLoadedDocIdRef.current) {
        currentLoadedDocIdRef.current = match.id;
        setSelectedDocId(match.id);
        setDocTitle(match.title);
        const parsedHtml = markdownToHtml(match.content || '');
        setDocContent(match.content || '');
        setEditorHtml(parsedHtml);
        if (editorRef.current) {
          editorRef.current.innerHTML = parsedHtml;
        }
      }
    } else {
      currentLoadedDocIdRef.current = null;
      setSelectedDocId('');
      setDocTitle('');
      setDocContent('');
      setEditorHtml('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [projectDocs, selectedDocId, markdownToHtml]);

  const selectedDoc = useMemo(() => {
    return projectDocs.find((d) => d.id === selectedDocId) || (projectDocs.length > 0 ? projectDocs[0] : null);
  }, [projectDocs, selectedDocId]);

  const handleSelectDoc = (doc: Document) => {
    currentLoadedDocIdRef.current = doc.id;
    setSelectedDocId(doc.id);
    setDocTitle(doc.title);
    const parsedHtml = markdownToHtml(doc.content || '');
    setDocContent(doc.content || '');
    setEditorHtml(parsedHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = parsedHtml;
    }
  };

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    const html = editorRef.current.innerHTML;
    setEditorHtml(html);
    setDocContent(html);
    updateToolbarActiveState();
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

  // Safe Document Deletion
  const handleDeleteCurrentDoc = () => {
    if (!selectedDoc || !onDeleteDoc) return;
    if (confirm(`Delete document "${selectedDoc.title}"?`)) {
      const docToDeleteId = selectedDoc.id;
      const remainingDocs = projectDocs.filter((d) => d.id !== docToDeleteId);

      if (remainingDocs.length > 0) {
        currentLoadedDocIdRef.current = remainingDocs[0].id;
        setSelectedDocId(remainingDocs[0].id);
        setDocTitle(remainingDocs[0].title);
        setDocContent(remainingDocs[0].content || '');
      } else {
        currentLoadedDocIdRef.current = null;
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
          currentLoadedDocIdRef.current = remainingDocs[0].id;
          setSelectedDocId(remainingDocs[0].id);
          setDocTitle(remainingDocs[0].title);
          setDocContent(remainingDocs[0].content || '');
        } else {
          currentLoadedDocIdRef.current = null;
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
    const url = typeof window !== 'undefined' ? `${window.location.origin}/wiki` : '/wiki';
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

  // High-Precision Rich Formatting Executor with Selection Preservation
  const executeFormat = (command: string, value: string = '') => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    if (command === 'formatBlock') {
      // Toggle block formatting (if already that heading/block, toggle back to normal paragraph)
      const currentBlock = document.queryCommandValue('formatBlock')?.toLowerCase();
      const targetTag = value.toLowerCase().replace(/[<>]/g, '');

      if (currentBlock === targetTag) {
        try {
          document.execCommand('formatBlock', false, '<p>');
        } catch {
          document.execCommand('formatBlock', false, 'p');
        }
      } else {
        try {
          document.execCommand('formatBlock', false, `<${targetTag}>`);
        } catch {
          document.execCommand('formatBlock', false, targetTag);
        }
      }
    } else if (command === 'inlineCode') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        const range = sel.getRangeAt(0);
        const selectedText = range.toString();
        
        // Check if inside a code element
        let parentEl: HTMLElement | null = range.commonAncestorContainer as HTMLElement;
        if (parentEl.nodeType === Node.TEXT_NODE) parentEl = parentEl.parentElement;
        
        if (parentEl && parentEl.tagName.toLowerCase() === 'code') {
          // Unwrap code
          const textNode = document.createTextNode(selectedText);
          parentEl.parentNode?.replaceChild(textNode, parentEl);
        } else {
          // Wrap in code
          const codeEl = document.createElement('code');
          codeEl.textContent = selectedText;
          range.deleteContents();
          range.insertNode(codeEl);
        }
      }
    } else if (command === 'createLink') {
      const url = prompt('Enter link URL (e.g. https://example.com):');
      if (url && url.trim()) {
        document.execCommand('createLink', false, url.trim());
      }
    } else {
      document.execCommand(command, false, value);
    }

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
    const textOnly = (editorHtml || docContent || '').replace(/<[^>]*>/g, ' ').trim();
    return textOnly ? textOnly.split(/\s+/).filter(Boolean).length : 0;
  }, [editorHtml, docContent]);

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
          <p>Collaborative documentation scoped to <strong>{activeProject?.name || 'this project'}</strong> with live rich formatting.</p>
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

                {/* Copy Markdown */}
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  className={styles.actionBtn}
                  title="Copy Markdown to Clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Delete Doc */}
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
                {/* Headings */}
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('formatBlock', 'h1'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isH1 ? styles.toolbarBtnActive : ''}`}
                  title="Heading 1"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('formatBlock', 'h2'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isH2 ? styles.toolbarBtnActive : ''}`}
                  title="Heading 2"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('formatBlock', 'h3'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isH3 ? styles.toolbarBtnActive : ''}`}
                  title="Heading 3"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                </button>

                <div className={styles.toolbarDivider} />

                {/* Inline Styles */}
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('bold'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isBold ? styles.toolbarBtnActive : ''}`}
                  title="Bold (⌘B)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('italic'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isItalic ? styles.toolbarBtnActive : ''}`}
                  title="Italic (⌘I)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('underline'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isUnderline ? styles.toolbarBtnActive : ''}`}
                  title="Underline (⌘U)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('strikeThrough'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isStrike ? styles.toolbarBtnActive : ''}`}
                  title="Strikethrough"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>

                <div className={styles.toolbarDivider} />

                {/* Quotes & Code */}
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('formatBlock', 'blockquote'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isQuote ? styles.toolbarBtnActive : ''}`}
                  title="Blockquote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('inlineCode'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isCode ? styles.toolbarBtnActive : ''}`}
                  title="Inline Code"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('formatBlock', 'pre'); }}
                  className={styles.toolbarBtn}
                  title="Code Block"
                >
                  <FileCode className="w-3.5 h-3.5" />
                </button>

                <div className={styles.toolbarDivider} />

                {/* Lists & Dividers */}
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('insertUnorderedList'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isUl ? styles.toolbarBtnActive : ''}`}
                  title="Bullet List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('insertOrderedList'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isOl ? styles.toolbarBtnActive : ''}`}
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('insertHorizontalRule'); }}
                  className={styles.toolbarBtn}
                  title="Divider Line"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <div className={styles.toolbarDivider} />

                {/* Hyperlink & Reset */}
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('createLink'); }}
                  className={styles.toolbarBtn}
                  title="Insert Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('removeFormat'); }}
                  className={styles.toolbarBtn}
                  title="Clear Formatting"
                >
                  <RemoveFormatting className="w-3.5 h-3.5" />
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
                    onKeyUp={updateToolbarActiveState}
                    onMouseUp={updateToolbarActiveState}
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
