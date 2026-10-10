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
  RemoveFormatting,
  Highlighter,
  X,
  ExternalLink
} from 'lucide-react';
import { Document } from '../../types';
import { useOptics } from '../../context/OpticsContext';
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
  isHighlight: boolean;
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

  // Link Modal / Popover state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkModalUrl, setLinkModalUrl] = useState('');
  const [linkModalText, setLinkModalText] = useState('');
  const [isExistingLink, setIsExistingLink] = useState(false);
  const [savedSelectionRange, setSavedSelectionRange] = useState<Range | null>(null);

  // Rename Document Modal state
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameDocTarget, setRenameDocTarget] = useState<Document | null>(null);
  const [renameTitle, setRenameTitle] = useState('');

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
    isHighlight: false,
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

    if (!hasRawMarkdownSyntax && /<(p|h[1-6]|ul|ol|li|blockquote|div|pre|code|table|span|mark|strong|em|u|del|a)[^>]*>/i.test(input)) {
      return input;
    }

    // Normalize line breaks
    let raw = input.replace(/\r\n/g, '\n');

    // Inline formatter
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
      // Auto-detect standalone URLs not already in markdown links
      formatted = formatted.replace(/(^|[\s(])((https?:\/\/|www\.)[^\s<)]+)/gi, (match, prefix, url) => {
        const href = url.startsWith('www.') ? `https://${url}` : url;
        return `${prefix}<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
      });
      return formatted;
    };

    // Handle multiline block structures
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
    md = md.replace(/<mark[^>]*>(.*?)<\/mark>/gi, '==$1==');
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
      let isHighlight = false;

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        let node: Node | null = sel.anchorNode;
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();
            if (tag === 'h1' || el.classList.contains(styles.inlineH1)) {
              isH1 = true;
              break;
            }
            if (tag === 'h2' || el.classList.contains(styles.inlineH2)) {
              isH2 = true;
              break;
            }
            if (tag === 'h3' || el.classList.contains(styles.inlineH3)) {
              isH3 = true;
              break;
            }
            if (tag === 'blockquote') isQuote = true;
            if (tag === 'code' || tag === 'pre') isCode = true;
            if (tag === 'mark') isHighlight = true;
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
        isHighlight,
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
    setRenameDocTarget(doc);
    setRenameTitle(doc.title);
    setRenameModalOpen(true);
  };

  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!renameDocTarget || !renameTitle.trim()) return;
    const trimmed = renameTitle.trim();
    if (trimmed !== renameDocTarget.title) {
      const updated = { ...renameDocTarget, title: trimmed, updatedAt: new Date().toISOString() };
      onSaveDoc(updated);
      if (renameDocTarget.id === selectedDocId) {
        setDocTitle(trimmed);
      }
      showToast(`Renamed to "${trimmed}"`);
    }
    setRenameModalOpen(false);
    setRenameDocTarget(null);
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

  // Helper to find ancestor within editor canvas
  const findAncestor = (node: Node | null, predicate: (el: HTMLElement) => boolean): HTMLElement | null => {
    let curr = node;
    while (curr && curr !== editorRef.current) {
      if (curr.nodeType === Node.ELEMENT_NODE && predicate(curr as HTMLElement)) {
        return curr as HTMLElement;
      }
      curr = curr.parentNode;
    }
    return null;
  };

  // Modern Link Popover Opener (Cmd+K or Toolbar Click)
  const openLinkModal = () => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    let existingUrl = '';
    let selectedText = '';
    let isExisting = false;

    const linkAncestor = sel?.anchorNode ? findAncestor(sel.anchorNode, (el) => el.tagName.toLowerCase() === 'a') : null;
    if (linkAncestor) {
      existingUrl = linkAncestor.getAttribute('href') || '';
      selectedText = linkAncestor.textContent || '';
      isExisting = true;
    } else if (sel && !sel.isCollapsed) {
      selectedText = sel.toString();
      if (/^https?:\/\/[^\s]+$/i.test(selectedText.trim()) || /^www\.[^\s]+$/i.test(selectedText.trim())) {
        existingUrl = selectedText.trim();
      }
    }

    if (sel && sel.rangeCount > 0) {
      setSavedSelectionRange(sel.getRangeAt(0).cloneRange());
    } else {
      setSavedSelectionRange(null);
    }

    setLinkModalUrl(existingUrl);
    setLinkModalText(selectedText);
    setIsExistingLink(isExisting);
    setLinkModalOpen(true);
  };

  const handleApplyLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!linkModalUrl.trim()) return;

    let formattedUrl = linkModalUrl.trim();
    if (formattedUrl.startsWith('www.')) {
      formattedUrl = `https://${formattedUrl}`;
    } else if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://') && !formattedUrl.startsWith('mailto:') && !formattedUrl.startsWith('#')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (editorRef.current) {
      editorRef.current.focus();
    }

    if (savedSelectionRange) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelectionRange);
    }

    const sel = window.getSelection();
    const linkAncestor = sel?.anchorNode ? findAncestor(sel.anchorNode, (el) => el.tagName.toLowerCase() === 'a') : null;

    if (linkAncestor) {
      linkAncestor.setAttribute('href', formattedUrl);
      linkAncestor.setAttribute('target', '_blank');
      linkAncestor.setAttribute('rel', 'noopener noreferrer');
      if (linkModalText.trim() && linkAncestor.textContent !== linkModalText.trim()) {
        linkAncestor.textContent = linkModalText.trim();
      }
    } else if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
      document.execCommand('createLink', false, formattedUrl);
    } else {
      const textToShow = linkModalText.trim() || linkModalUrl.trim();
      const linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${textToShow}</a>&nbsp;`;
      document.execCommand('insertHTML', false, linkHtml);
    }

    setLinkModalOpen(false);
    setSavedSelectionRange(null);
    handleEditorInput();
    showToast('Link saved');
  };

  const handleRemoveLink = () => {
    if (editorRef.current) {
      editorRef.current.focus();
    }

    if (savedSelectionRange) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedSelectionRange);
    }

    const sel = window.getSelection();
    const linkAncestor = sel?.anchorNode ? findAncestor(sel.anchorNode, (el) => el.tagName.toLowerCase() === 'a') : null;

    if (linkAncestor) {
      const parent = linkAncestor.parentNode;
      while (linkAncestor.firstChild) {
        parent?.insertBefore(linkAncestor.firstChild, linkAncestor);
      }
      parent?.removeChild(linkAncestor);
    } else {
      document.execCommand('unlink', false, undefined);
    }

    setLinkModalOpen(false);
    setSavedSelectionRange(null);
    handleEditorInput();
    showToast('Link removed');
  };

  // URL Auto-detection on Paste (Like Notion, Slack, Google Docs)
  const isUrl = (str: string) => {
    const trimmed = str.trim();
    return /^https?:\/\/[^\s]+$/i.test(trimmed) || /^www\.[^\s]+$/i.test(trimmed);
  };

  const handleEditorPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;

    const trimmed = text.trim();
    if (isUrl(trimmed)) {
      e.preventDefault();
      const sel = window.getSelection();
      let formattedUrl = trimmed;
      if (formattedUrl.startsWith('www.')) {
        formattedUrl = `https://${formattedUrl}`;
      }

      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        // Text is selected -> auto-link the selected text with pasted URL!
        document.execCommand('createLink', false, formattedUrl);
        handleEditorInput();
        showToast('Linked selected text to URL');
        return;
      } else {
        // No text selected -> insert clickable link with the URL as text
        const linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${trimmed}</a>&nbsp;`;
        document.execCommand('insertHTML', false, linkHtml);
        handleEditorInput();
        showToast('Inserted clickable link');
        return;
      }
    }

    // Plain text containing raw URLs -> auto linkify
    const hasHtml = Boolean(e.clipboardData.getData('text/html'));
    if (!hasHtml && /(https?:\/\/[^\s]+|www\.[^\s]+)/gi.test(text)) {
      e.preventDefault();
      const linkedHtml = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi, (match) => {
          const href = match.startsWith('www.') ? `https://${match}` : match;
          return `<a href="${href}" target="_blank" rel="noopener noreferrer">${match}</a>`;
        })
        .replace(/\n/g, '<br/>');
      document.execCommand('insertHTML', false, linkedHtml);
      handleEditorInput();
      return;
    }
  };

  // URL Auto-detection on Space / Enter / Keyboard Shortcuts
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 1. Keyboard shortcuts: Cmd+K / Ctrl+K opens Link Popover
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openLinkModal();
      return;
    }
    // Cmd+S saves
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
      return;
    }

    // 2. Auto-link on Space or Enter when typing a URL
    if (e.key === ' ' || e.key === 'Enter') {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed && sel.anchorNode && sel.anchorNode.nodeType === Node.TEXT_NODE) {
        const textNode = sel.anchorNode as Text;
        const offset = sel.anchorOffset;
        const textBefore = textNode.textContent?.slice(0, offset) || '';

        // Check if the word typed right before caret is a URL
        const match = textBefore.match(/(https?:\/\/[^\s]+|www\.[^\s]+)$/i);
        if (match && match.index !== undefined) {
          const urlMatch = match[0];
          const insideAnchor = findAncestor(textNode, (el) => el.tagName.toLowerCase() === 'a');

          if (!insideAnchor) {
            e.preventDefault();
            const startIndex = match.index;
            const beforeUrl = textBefore.slice(0, startIndex);
            const afterUrl = (textNode.textContent || '').slice(offset);

            let href = urlMatch;
            if (href.startsWith('www.')) {
              href = `https://${href}`;
            }

            const parent = textNode.parentNode;
            if (parent) {
              const beforeNode = document.createTextNode(beforeUrl);
              const linkNode = document.createElement('a');
              linkNode.href = href;
              linkNode.target = '_blank';
              linkNode.rel = 'noopener noreferrer';
              linkNode.textContent = urlMatch;

              const spaceOrBrNode = e.key === ' ' ? document.createTextNode('\u00A0') : document.createElement('br');
              const afterNode = document.createTextNode(afterUrl);

              parent.insertBefore(beforeNode, textNode);
              parent.insertBefore(linkNode, textNode);
              parent.insertBefore(spaceOrBrNode, textNode);
              parent.insertBefore(afterNode, textNode);
              parent.removeChild(textNode);

              // Move caret right after the space/br
              const newRange = document.createRange();
              if (e.key === ' ') {
                newRange.setStartAfter(spaceOrBrNode);
                newRange.setEndAfter(spaceOrBrNode);
              } else {
                newRange.setStart(afterNode, 0);
                newRange.setEnd(afterNode, 0);
              }
              sel.removeAllRanges();
              sel.addRange(newRange);

              handleEditorInput();
              return;
            }
          }
        }
      }
    }
  };

  // High-Precision Rich Formatting Executor (Toggle ON / Toggle OFF)
  const executeFormat = (command: string, value: string = '') => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    try {
      document.execCommand('styleWithCSS', false, 'false');
    } catch {}

    const sel = window.getSelection();

    // 1. Headings (H1, H2, H3) & Blockquote & Code Block Toggle
    if (command === 'formatBlock' || command === 'heading') {
      const targetTag = value.toLowerCase().replace(/[<>]/g, '');

      // A. If specific text is highlighted / selected, format ONLY the selected text
      if (sel && !sel.isCollapsed && sel.rangeCount > 0 && ['h1', 'h2', 'h3'].includes(targetTag)) {
        const targetClass = targetTag === 'h1' ? styles.inlineH1 : targetTag === 'h2' ? styles.inlineH2 : styles.inlineH3;
        
        // Find if selection or its anchor/focus is inside an inline heading span
        const existingSpan =
          (sel.anchorNode ? findAncestor(sel.anchorNode, (el) =>
            el.classList.contains(styles.inlineH1) ||
            el.classList.contains(styles.inlineH2) ||
            el.classList.contains(styles.inlineH3)
          ) : null) ||
          (sel.focusNode ? findAncestor(sel.focusNode, (el) =>
            el.classList.contains(styles.inlineH1) ||
            el.classList.contains(styles.inlineH2) ||
            el.classList.contains(styles.inlineH3)
          ) : null);

        if (existingSpan) {
          if (existingSpan.classList.contains(targetClass)) {
            // Toggle OFF: unwrap span, restore clean text node
            const parent = existingSpan.parentNode;
            const text = existingSpan.textContent || '';
            const textNode = document.createTextNode(text);
            parent?.replaceChild(textNode, existingSpan);

            // Re-select inner text range cleanly
            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.setStart(textNode, 0);
            newRange.setEnd(textNode, text.length);
            sel.addRange(newRange);
          } else {
            // Switch heading style (e.g. from H2 to H1)
            existingSpan.className = targetClass;
            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(existingSpan);
            sel.addRange(newRange);
          }
        } else {
          // Toggle ON: wrap ONLY selected text in heading span and select its text contents
          const range = sel.getRangeAt(0);
          const span = document.createElement('span');
          span.className = targetClass;
          try {
            const fragment = range.extractContents();
            span.appendChild(fragment);
            range.insertNode(span);

            // Select only the text inside the span
            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            sel.addRange(newRange);
          } catch (err) {
            console.warn('Selected text heading fallback:', err);
          }
        }
        handleEditorInput();
        return;
      }

      // B. Line-level Block fallback when no text is selected (Cursor collapsed)
      const currentBlock = sel?.anchorNode ? findAncestor(sel.anchorNode, (el) =>
        ['h1', 'h2', 'h3', 'blockquote', 'pre'].includes(el.tagName.toLowerCase())
      ) : null;

      const currentTagName = currentBlock ? currentBlock.tagName.toLowerCase() : '';

      if (currentTagName === targetTag) {
        // Toggle OFF: convert back to standard paragraph
        try {
          document.execCommand('formatBlock', false, '<p>');
        } catch {
          document.execCommand('formatBlock', false, 'p');
        }
      } else {
        // Toggle ON or switch to requested heading
        try {
          document.execCommand('formatBlock', false, `<${targetTag}>`);
        } catch {
          document.execCommand('formatBlock', false, targetTag);
        }
      }
      handleEditorInput();
      return;
    }

    // 2. Inline Code Toggle
    if (command === 'inlineCode') {
      if (!sel || sel.rangeCount === 0) return;
      const codeAncestor = findAncestor(sel.anchorNode, (el) => el.tagName.toLowerCase() === 'code');
      
      if (codeAncestor) {
        // Toggle OFF: unwrap <code>
        const parent = codeAncestor.parentNode;
        while (codeAncestor.firstChild) {
          parent?.insertBefore(codeAncestor.firstChild, codeAncestor);
        }
        parent?.removeChild(codeAncestor);
      } else if (!sel.isCollapsed) {
        // Toggle ON: wrap selected range in <code>
        const range = sel.getRangeAt(0);
        const codeEl = document.createElement('code');
        try {
          const fragment = range.extractContents();
          codeEl.appendChild(fragment);
          range.insertNode(codeEl);
          sel.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(codeEl);
          sel.addRange(newRange);
        } catch {
          document.execCommand('insertHTML', false, `<code>${range.toString()}</code>`);
        }
      }
      handleEditorInput();
      return;
    }

    // 3. Highlight (<mark>) Toggle
    if (command === 'highlight') {
      if (!sel || sel.rangeCount === 0) return;
      const markAncestor = findAncestor(sel.anchorNode, (el) => el.tagName.toLowerCase() === 'mark');

      if (markAncestor) {
        // Toggle OFF: unwrap <mark>
        const parent = markAncestor.parentNode;
        while (markAncestor.firstChild) {
          parent?.insertBefore(markAncestor.firstChild, markAncestor);
        }
        parent?.removeChild(markAncestor);
      } else if (!sel.isCollapsed) {
        // Toggle ON: wrap selected range in <mark>
        const range = sel.getRangeAt(0);
        const markEl = document.createElement('mark');
        try {
          const fragment = range.extractContents();
          markEl.appendChild(fragment);
          range.insertNode(markEl);
          sel.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(markEl);
          sel.addRange(newRange);
        } catch {
          document.execCommand('insertHTML', false, `<mark>${range.toString()}</mark>`);
        }
      }
      handleEditorInput();
      return;
    }

    // 4. Link Insert / Edit (Opens modern popover instead of prompt)
    if (command === 'createLink') {
      openLinkModal();
      return;
    }

    // 5. Clear Formatting (Remove all formats from selected text)
    if (command === 'removeFormat') {
      document.execCommand('removeFormat', false, undefined);
      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        const customEl = findAncestor(sel.anchorNode, (el) => ['code', 'mark', 'span'].includes(el.tagName.toLowerCase()));
        if (customEl) {
          const parent = customEl.parentNode;
          while (customEl.firstChild) {
            parent?.insertBefore(customEl.firstChild, customEl);
          }
          parent?.removeChild(customEl);
        }
      }
      handleEditorInput();
      return;
    }

    // 6. Native Standard Inline Commands (Bold, Italic, Underline, Strikethrough, Lists, etc.)
    // Standard browser execCommand handles toggle on and off natively with 100% precision
    document.execCommand(command, false, value || undefined);
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
            </div>
            {can('doc.create') && (
              <button
                type="button"
                onClick={onOpenCreateDoc}
                className={styles.iconBtn}
                title="New Document"
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
                    onClick={() => {
                      setPreviewMode(false);
                      if (editorRef.current && (!editorRef.current.innerHTML || editorRef.current.innerHTML === '<p><br></p>') && editorHtml) {
                        editorRef.current.innerHTML = editorHtml;
                      }
                    }}
                    className={`${styles.modeBtn} ${!previewMode ? styles.modeBtnActive : ''}`}
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editorRef.current) {
                        const currentHtml = editorRef.current.innerHTML;
                        setEditorHtml(currentHtml);
                        setDocContent(currentHtml);
                      }
                      setPreviewMode(true);
                    }}
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
                  title="Heading 1 (Styles Selected Text)"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('formatBlock', 'h2'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isH2 ? styles.toolbarBtnActive : ''}`}
                  title="Heading 2 (Styles Selected Text)"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('formatBlock', 'h3'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isH3 ? styles.toolbarBtnActive : ''}`}
                  title="Heading 3 (Styles Selected Text)"
                >
                  <Heading3 className="w-3.5 h-3.5" />
                </button>

                <div className={styles.toolbarDivider} />

                {/* Inline Styles */}
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('bold'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isBold ? styles.toolbarBtnActive : ''}`}
                  title="Bold (⌘B) - Selected Text"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('italic'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isItalic ? styles.toolbarBtnActive : ''}`}
                  title="Italic (⌘I) - Selected Text"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('underline'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isUnderline ? styles.toolbarBtnActive : ''}`}
                  title="Underline (⌘U) - Selected Text"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('strikeThrough'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isStrike ? styles.toolbarBtnActive : ''}`}
                  title="Strikethrough - Selected Text"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('highlight'); }}
                  className={`${styles.toolbarBtn} ${activeFormats.isHighlight ? styles.toolbarBtnActive : ''}`}
                  title="Highlight Marker - Selected Text"
                >
                  <Highlighter className="w-3.5 h-3.5" />
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
                  title="Inline Code - Selected Text"
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
                  title="Insert Link - Selected Text"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); executeFormat('removeFormat'); }}
                  className={styles.toolbarBtn}
                  title="Clear Formatting on Selected Text"
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

                {/* Live Rich WYSIWYG Document Editor (Always mounted so text & history are never lost) */}
                <div
                  ref={editorRef}
                  contentEditable={can('doc.create')}
                  onInput={handleEditorInput}
                  onKeyDown={handleEditorKeyDown}
                  onPaste={handleEditorPaste}
                  onKeyUp={updateToolbarActiveState}
                  onMouseUp={updateToolbarActiveState}
                  onBlur={handleSave}
                  className={styles.liveDocEditor}
                  style={{ display: previewMode ? 'none' : 'block' }}
                  data-placeholder="Start typing your document, specs, or meeting notes here..."
                  suppressContentEditableWarning
                />

                {/* Rendered Preview View */}
                {previewMode && (
                  <div 
                    className={styles.previewContainer}
                    onDoubleClick={() => {
                      if (can('doc.create')) {
                        setPreviewMode(false);
                        if (editorRef.current && (!editorRef.current.innerHTML || editorRef.current.innerHTML === '<p><br></p>') && editorHtml) {
                          editorRef.current.innerHTML = editorHtml;
                        }
                      }
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

      {/* Link Popover Modal */}
      {linkModalOpen && (
        <div className={styles.linkModalOverlay} onClick={() => setLinkModalOpen(false)}>
          <div className={styles.linkModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.linkModalHeader}>
              <div className={styles.linkModalTitle}>
                <LinkIcon className="w-4 h-4" />
                <span>{isExistingLink ? 'Edit Link' : 'Insert Link'}</span>
              </div>
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className={styles.iconBtn}
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyLink}>
              <div className={styles.linkModalBody}>
                <div className={styles.linkModalInputGroup}>
                  <label className={styles.linkModalLabel}>Link URL</label>
                  <input
                    type="text"
                    value={linkModalUrl}
                    onChange={(e) => setLinkModalUrl(e.target.value)}
                    placeholder="https://example.com, https://figma.com/..."
                    className={styles.linkModalInput}
                    autoFocus
                  />
                </div>

                <div className={styles.linkModalInputGroup}>
                  <label className={styles.linkModalLabel}>Display Text (Optional)</label>
                  <input
                    type="text"
                    value={linkModalText}
                    onChange={(e) => setLinkModalText(e.target.value)}
                    placeholder="Link description or text to display"
                    className={styles.linkModalInput}
                  />
                </div>
              </div>

              <div className={styles.linkModalFooter}>
                {isExistingLink && (
                  <button
                    type="button"
                    onClick={handleRemoveLink}
                    className={styles.linkModalRemoveBtn}
                  >
                    Remove Link
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className={styles.linkModalCancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!linkModalUrl.trim()}
                  className={styles.linkModalSaveBtn}
                >
                  {isExistingLink ? 'Update Link' : 'Apply Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Document Modal */}
      {renameModalOpen && renameDocTarget && (
        <div className={styles.linkModalOverlay} onClick={() => setRenameModalOpen(false)}>
          <div className={styles.linkModalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.linkModalHeader}>
              <div className={styles.linkModalTitle}>
                <Edit2 className="w-4 h-4" />
                <span>Rename Document</span>
              </div>
              <button
                type="button"
                onClick={() => setRenameModalOpen(false)}
                className={styles.iconBtn}
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRename}>
              <div className={styles.linkModalBody}>
                <div className={styles.linkModalInputGroup}>
                  <label className={styles.linkModalLabel}>Document Title</label>
                  <input
                    type="text"
                    value={renameTitle}
                    onChange={(e) => setRenameTitle(e.target.value)}
                    placeholder="Enter document title..."
                    className={styles.linkModalInput}
                    autoFocus
                  />
                </div>
              </div>

              <div className={styles.linkModalFooter}>
                <button
                  type="button"
                  onClick={() => setRenameModalOpen(false)}
                  className={styles.linkModalCancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!renameTitle.trim()}
                  className={styles.linkModalSaveBtn}
                >
                  Save Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
