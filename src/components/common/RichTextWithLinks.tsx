'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Globe, Image as ImageIcon, Link as LinkIcon, FileText } from 'lucide-react';
import styles from './RichTextWithLinks.module.css';

interface RichTextWithLinksProps {
  text: string;
  className?: string;
  showPreviews?: boolean;
}

const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

function isImageUrl(url: string): boolean {
  return (
    url.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)(\?.*)?$/i) !== null ||
    url.startsWith('data:image/') ||
    url.includes('images.unsplash.com') ||
    url.includes('cloudinary.com')
  );
}

function getDomain(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname.replace(/^www\./, '') + (parsed.port ? `:${parsed.port}` : '');
  } catch {
    return 'link';
  }
}

function getPathSnippet(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    const path = parsed.pathname + parsed.search;
    return path.length > 1 ? path : parsed.hostname;
  } catch {
    return urlStr;
  }
}

export const RichTextWithLinks: React.FC<RichTextWithLinksProps> = ({
  text,
  className = '',
  showPreviews = true,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  if (!text) return null;

  const handleCopy = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // 1. Extract all unique URLs for preview cards
  const foundUrls: string[] = [];
  let match: RegExpExecArray | null;

  // Extract from markdown links
  const mdRegex = new RegExp(MARKDOWN_LINK_REGEX);
  while ((match = mdRegex.exec(text)) !== null) {
    if (!foundUrls.includes(match[2])) foundUrls.push(match[2]);
  }

  // Extract from standard URLs
  const rawRegex = new RegExp(URL_REGEX);
  while ((match = rawRegex.exec(text)) !== null) {
    if (!foundUrls.includes(match[1])) foundUrls.push(match[1]);
  }

  // 2. Format inline text with interactive clickable link elements
  const renderFormattedText = () => {
    // Process markdown links first, then raw URLs
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;

    // Split text by lines to preserve paragraph formatting
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      if (!line.trim()) {
        return <div key={lineIdx} className={styles.emptyLine} />;
      }

      // Regex matching either markdown link or raw URL
      const combinedRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
      const lineParts: React.ReactNode[] = [];
      let matchLine: RegExpExecArray | null;
      let lastMatchEnd = 0;

      while ((matchLine = combinedRegex.exec(line)) !== null) {
        const matchStart = matchLine.index;
        const matchEnd = combinedRegex.lastIndex;

        // Push text before link
        if (matchStart > lastMatchEnd) {
          lineParts.push(line.substring(lastMatchEnd, matchStart));
        }

        if (matchLine[1]) {
          // Markdown link: [title](url)
          const linkTitle = matchLine[2];
          const linkUrl = matchLine[3];
          lineParts.push(
            <a
              key={`md-${matchStart}`}
              href={linkUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={styles.inlineLink}
              onClick={(e) => e.stopPropagation()}
            >
              <LinkIcon className="w-3 h-3 inline mr-1 opacity-70" />
              <span>{linkTitle}</span>
              <ExternalLink className="w-2.5 h-2.5 inline ml-1 opacity-60" />
            </a>
          );
        } else if (matchLine[4]) {
          // Raw URL
          const rawUrl = matchLine[4];
          const domain = getDomain(rawUrl);
          lineParts.push(
            <a
              key={`raw-${matchStart}`}
              href={rawUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={styles.inlineLink}
              onClick={(e) => e.stopPropagation()}
            >
              <Globe className="w-3 h-3 inline mr-1 opacity-70" />
              <span>{rawUrl}</span>
              <ExternalLink className="w-2.5 h-2.5 inline ml-1 opacity-60" />
            </a>
          );
        }

        lastMatchEnd = matchEnd;
      }

      if (lastMatchEnd < line.length) {
        lineParts.push(line.substring(lastMatchEnd));
      }

      return (
        <p key={lineIdx} className={styles.paragraph}>
          {lineParts}
        </p>
      );
    });
  };

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Inline Text with styled links */}
      <div className={styles.textContent}>{renderFormattedText()}</div>

      {/* Rich Link & Attachment Previews (if any URLs detected) */}
      {showPreviews && foundUrls.length > 0 && (
        <div className={styles.previewsContainer}>
          <div className={styles.previewsHeader}>
            <LinkIcon className="w-3 h-3" style={{ color: 'var(--accent-amber, #b45309)' }} />
            <span>Links & Previews ({foundUrls.length})</span>
          </div>

          <div className={styles.previewsGrid}>
            {foundUrls.map((url, idx) => {
              const domain = getDomain(url);
              const pathSnippet = getPathSnippet(url);
              const isImg = isImageUrl(url);

              if (isImg) {
                return (
                  <div key={idx} className={styles.imageCard}>
                    <div 
                      className={styles.imageWrapper}
                      onClick={() => setExpandedImage(url)}
                    >
                      <img src={url} alt="Attachment preview" className={styles.imageThumb} />
                      <div className={styles.imageOverlay}>
                        <span>Click to expand</span>
                      </div>
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.domainTag}>
                        <ImageIcon className="w-3 h-3 inline mr-1" />
                        Image asset
                      </span>
                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          onClick={(e) => handleCopy(url, e)}
                          className={styles.actionIconBtn}
                          title="Copy image URL"
                        >
                          {copiedUrl === url ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={styles.actionIconBtn}
                          title="Open original image in new tab"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className={styles.linkCard}>
                  <div className={styles.linkCardMain}>
                    <div className={styles.domainBadge}>
                      <Globe className="w-3.5 h-3.5" />
                      <span>{domain}</span>
                    </div>

                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className={styles.linkCardUrl}
                      title={url}
                    >
                      {pathSnippet}
                    </a>
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.linkFullPreview}>{url}</span>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        onClick={(e) => handleCopy(url, e)}
                        className={styles.actionIconBtn}
                        title="Copy link"
                      >
                        {copiedUrl === url ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={styles.actionIconBtn}
                        title="Open link in new tab"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div className={styles.lightboxOverlay} onClick={() => setExpandedImage(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img src={expandedImage} alt="Expanded preview" className={styles.lightboxImg} />
            <button 
              type="button" 
              onClick={() => setExpandedImage(null)} 
              className={styles.lightboxCloseBtn}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
