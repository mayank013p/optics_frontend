'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import styles from './LegalPageLayout.module.css';
import OpticsLogo from '../brand/OpticsLogo';

export interface TocItem {
  id: string;
  label: string;
}

interface LegalPageLayoutProps {
  badge: string;
  kickerIndex?: string;
  title: string;
  subtitle?: string;
  effectiveDate?: string;
  version?: string;
  toc?: TocItem[];
  activeNav?: 'docs' | 'privacy' | 'terms' | 'security' | 'support' | 'contact';
  children: React.ReactNode;
}

export default function LegalPageLayout({
  badge,
  kickerIndex = '01',
  title,
  subtitle,
  effectiveDate = 'October 2026',
  version,
  toc,
  activeNav,
  children
}: LegalPageLayoutProps) {
  return (
    <div className={styles.legalContainer}>
      {/* 1. Header Navigation */}
      <header className={styles.legalNavbar}>
        <div className={styles.navLeft}>
          <Link href="/" className={styles.brandMark} title="Optics Home">
            <OpticsLogo size={18} />
            <span>Optics</span>
          </Link>
        </div>

        {/* Center Quick Navigation */}
        <nav className={styles.navCenterLinks}>

          <Link 
            href="/docs" 
            className={`${styles.navPageLink} ${activeNav === 'docs' ? styles.navPageLinkActive : ''}`}
          >
            Documentation
          </Link>
          <Link 
            href="/security" 
            className={`${styles.navPageLink} ${activeNav === 'security' ? styles.navPageLinkActive : ''}`}
          >
            Security
          </Link>
          <Link 
            href="/support" 
            className={`${styles.navPageLink} ${activeNav === 'support' ? styles.navPageLinkActive : ''}`}
          >
            Support
          </Link>
          <Link 
            href="/contact" 
            className={`${styles.navPageLink} ${activeNav === 'contact' ? styles.navPageLinkActive : ''}`}
          >
            Contact
          </Link>
        </nav>

        <div className={styles.navRight}>
          <Link href="/login" className={styles.navActionBtn}>
            Open Workspace
          </Link>
        </div>
      </header>

      {/* 2. Main Page Content */}
      <main className={styles.legalMain}>
        <div className={styles.headerBlock}>
          <div className={styles.kicker}>
            <span className={styles.kickerIndex}>{kickerIndex}</span>
            <span className={styles.kickerSlash}>/</span>
            <span className={styles.kickerLabel}>{badge}</span>
          </div>

          <h1 className={styles.title}>{title}</h1>

          {subtitle && (
            <p className={styles.subtitle}>{subtitle}</p>
          )}

          <div className={styles.metaRow}>
            <span>Effective Date: {effectiveDate}</span>
            {version && (
              <>
                <span>·</span>
                <span>Specification Version: {version}</span>
              </>
            )}
          </div>
        </div>

        <div className={toc && toc.length > 0 ? styles.layoutGrid : styles.layoutGridSingle}>
          {toc && toc.length > 0 && (
            <aside className={styles.tocSidebar}>
              <span className={styles.tocTitle}>Table of Contents</span>
              {toc.map(item => (
                <a key={item.id} href={`#${item.id}`} className={styles.tocLink}>
                  {item.label}
                </a>
              ))}
            </aside>
          )}

          <article className={styles.articleBody}>
            {children}
          </article>
        </div>
      </main>

      {/* 3. Clean Institutional Footer */}
      <footer className={styles.legalFooter}>
        <div className={styles.legalFooterLinks}>
          <Link href="/docs" className={styles.legalFooterLink}>Documentation</Link>

          <Link href="/privacy" className={styles.legalFooterLink}>Privacy Policy</Link>
          <Link href="/terms" className={styles.legalFooterLink}>Terms of Service</Link>
          <Link href="/security" className={styles.legalFooterLink}>Security Architecture</Link>
          <Link href="/support" className={styles.legalFooterLink}>Help &amp; Support</Link>
          <Link href="/contact" className={styles.legalFooterLink}>Contact Team</Link>
          <Link href="/#faq" className={styles.legalFooterLink}>FAQ</Link>
        </div>
        <p>© {new Date().getFullYear()} Optics by Ivors. Built for teams that value focus and shipping great work.</p>
      </footer>
    </div>
  );
}
