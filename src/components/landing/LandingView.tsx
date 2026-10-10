'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Kanban, 
  FileText, 
  ShieldCheck, 
  FolderLock, 
  ArrowRight, 
  Check, 
  Zap, 
  Users, 
  Lock, 
  CheckCircle2, 
  ChevronDown, 
  ExternalLink, 
  Layers, 
  Activity, 
  GitBranch, 
  GitPullRequest, 
  CheckSquare, 
  Code2, 
  SlidersHorizontal, 
  Command, 
  Plus, 
  TrendingUp, 
  Sparkles, 
  Target,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import styles from './LandingView.module.css';
import FolderFloat from './FolderFloat';
import WorkspaceSimulation from './WorkspaceSimulation';
import MagicBento from './MagicBento';
import OpticsLogo from '../brand/OpticsLogo';
import Dock, { DockItemData } from '../dock/Dock';

interface LandingViewProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
  isAuthenticated?: boolean;
  onGoToApp?: () => void;
}

export function LandingView({ onOpenAuth, isAuthenticated, onGoToApp }: LandingViewProps) {
  // FAQ Accordion Active Index
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Scroll threshold listener (hides navbar links and reveals top floating dock)
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setIsScrolled(window.scrollY > 90);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section observer to highlight active item in top dock
  useEffect(() => {
    const sections = ['hero', 'simulation', 'features', 'solutions', 'toolchain', 'analytics', 'faq'];
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
          });
        },
        { rootMargin: '-20% 0px -60% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // Top Dock Navigation Items (Configured with Optics product capabilities & routes)
  const dockItems: DockItemData[] = [
    {
      icon: <SlidersHorizontal className="w-4 h-4" strokeWidth={1.8} />,
      label: 'Simulation',
      active: activeSection === 'simulation',
      onClick: () => {
        const el = document.getElementById('simulation');
        if (el) {
          (window as any).lenis?.scrollTo(el, { offset: -80, duration: 1.2 }) ||
            el.scrollIntoView({ behavior: 'smooth' });
        }
      },
    },
    {
      icon: <Layers className="w-4 h-4" strokeWidth={1.8} />,
      label: 'Capabilities',
      active: activeSection === 'features',
      onClick: () => {
        const el = document.getElementById('features');
        if (el) {
          (window as any).lenis?.scrollTo(el, { offset: -80, duration: 1.2 }) ||
            el.scrollIntoView({ behavior: 'smooth' });
        }
      },
    },
    {
      icon: <GitPullRequest className="w-4 h-4" strokeWidth={1.8} />,
      label: 'Comparison',
      active: activeSection === 'solutions',
      onClick: () => {
        const el = document.getElementById('solutions');
        if (el) {
          (window as any).lenis?.scrollTo(el, { offset: -80, duration: 1.2 }) ||
            el.scrollIntoView({ behavior: 'smooth' });
        }
      },
    },
    {
      icon: <Code2 className="w-4 h-4" strokeWidth={1.8} />,
      label: 'Toolchain',
      active: activeSection === 'toolchain',
      onClick: () => {
        const el = document.getElementById('toolchain');
        if (el) {
          (window as any).lenis?.scrollTo(el, { offset: -80, duration: 1.2 }) ||
            el.scrollIntoView({ behavior: 'smooth' });
        }
      },
    },
    {
      icon: <TrendingUp className="w-4 h-4" strokeWidth={1.8} />,
      label: 'Velocity',
      active: activeSection === 'analytics',
      onClick: () => {
        const el = document.getElementById('analytics');
        if (el) {
          (window as any).lenis?.scrollTo(el, { offset: -80, duration: 1.2 }) ||
            el.scrollIntoView({ behavior: 'smooth' });
        }
      },
    },
    { separator: true },
    {
      icon: <ShieldCheck className="w-4 h-4" strokeWidth={1.8} />,
      label: 'Security',
      onClick: () => {
        window.location.href = '/security';
      },
    },
    {
      icon: <HelpCircle className="w-4 h-4" strokeWidth={1.8} />,
      label: 'Support',
      onClick: () => {
        window.location.href = '/support';
      },
    },
    {
      icon: <MessageSquare className="w-4 h-4" strokeWidth={1.8} />,
      label: 'FAQ',
      active: activeSection === 'faq',
      onClick: () => {
        const el = document.getElementById('faq');
        if (el) {
          (window as any).lenis?.scrollTo(el, { offset: -80, duration: 1.2 }) ||
            el.scrollIntoView({ behavior: 'smooth' });
        }
      },
    },
  ];

  // Smooth scroll handler for incoming and current hash links (e.g. /#faq, #simulation)
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          if ((window as any).lenis) {
            (window as any).lenis.scrollTo(element, { offset: -80, duration: 1.2 });
          } else {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };

    const timer = setTimeout(handleHash, 100);
    window.addEventListener('hashchange', handleHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  return (
    <div className={styles.landingWrapper} data-theme="cream">
      {/* 1. Header & Navigation (Fixed top, product-focused navigation) */}
      <nav className={styles.navbar} id="navbar">
        <a href="#hero" className={styles.navBrand}>
          <OpticsLogo size={22} />
          <span className={styles.brandName}>Optics</span>
        </a>

        {/* Product-Specific Navigation Links (Only visible in hero section, smoothly hidden when scrolled) */}
        <ul className={`${styles.navLinks} ${isScrolled ? styles.navLinksHidden : ''}`}>
          <li className={styles.navLinkItem}>
            <a href="#simulation" className={styles.navLink}>Simulation</a>
          </li>
          <li className={styles.navLinkItem}>
            <a href="#features" className={styles.navLink}>Capabilities</a>
          </li>
          <li className={styles.navLinkItem}>
            <a href="#solutions" className={styles.navLink}>Comparison</a>
          </li>
          <li className={styles.navLinkItem}>
            <a href="#toolchain" className={styles.navLink}>Toolchain</a>
          </li>
          <li className={styles.navLinkItem}>
            <a href="#analytics" className={styles.navLink}>Velocity</a>
          </li>

          <li className={styles.navLinkItem}>
            <Link href="/security" className={styles.navLink}>Security</Link>
          </li>
          <li className={styles.navLinkItem}>
            <Link href="/support" className={styles.navLink}>Support</Link>
          </li>
          <li className={styles.navLinkItem}>
            <a href="#faq" className={styles.navLink}>FAQ</a>
          </li>
        </ul>

        <div className={styles.navActions}>
          {isAuthenticated ? (
            <button 
              type="button" 
              onClick={onGoToApp} 
              className={styles.openAppBtn}
              id="nav-goto-app-btn"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button 
                type="button" 
                onClick={() => onOpenAuth('login')} 
                className={styles.loginBtn}
                id="nav-signin-btn"
              >
                Sign in
              </button>
              <button 
                type="button" 
                onClick={() => onOpenAuth('register')} 
                className={styles.getStartedBtn}
                id="nav-getstarted-btn"
              >
                <span>Get started free</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 1.1 Floating Top Dock (Appears when scrolled past hero section) */}
      <div className={`${styles.floatingTopDock} ${isScrolled ? styles.floatingTopDockVisible : ''}`}>
        <Dock
          items={dockItems}
          position="top"
          theme="light"
          baseItemSize={38}
          magnification={52}
          panelHeight={50}
          gap={6}
          roundness={0.6}
          bounce={true}
          showLabels={true}
        />
      </div>

      {/* 2. Hero Section (Divided into 2 columns with FolderFloat on right) */}
      <header className={styles.heroSection} id="hero">
        <div className={styles.heroTwoColGrid}>
          {/* Left Column: Core Value Prop and Clean CTA */}
          <div className={styles.heroLeftCol}>
            <h1 className={styles.heroHeading}>
              Project tracking for teams that <span className={styles.heroEmphasis}>ship</span>.
            </h1>

            <p className={styles.heroParagraph}>
              Sprint planning, project documents, and team collaboration in one beautifully focused workspace.
            </p>

            <div className={styles.heroCtaGroup}>
              <button 
                type="button" 
                onClick={() => onOpenAuth('register')} 
                className={styles.heroCtaPrimary}
                id="hero-primary-cta"
              >
                <span>Start Free With Your Team</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: React Bits FolderFloat Component with icons and curved items */}
          <div className={styles.heroRightCol}>
            <FolderFloat
              items={[
                { label: 'Sprint Boards', value: 'sprint-boards', icon: <Kanban className="w-3.5 h-3.5" /> },
                { label: 'Task Tracking', value: 'task-tracking', icon: <CheckSquare className="w-3.5 h-3.5" /> },
                { label: 'Team Roles', value: 'team-roles', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
                { label: 'Project Docs', value: 'project-docs', icon: <FileText className="w-3.5 h-3.5" /> },
                { label: 'File Storage', value: 'file-storage', icon: <Lock className="w-3.5 h-3.5" /> },
                { label: 'Workspaces', value: 'workspaces', icon: <Layers className="w-3.5 h-3.5" /> }
              ]}
              label="Workspaces"
              sublabel="6 capabilities"
              trigger="hover"
              physics={true}
              defaultOpen={true}
              drift={0.6}
              folderColor="#18181b"
              frontColor="#27272a"
              paperColor="#faf8f5"
              itemColor="#ffffff"
              itemTextColor="#18181b"
              labelColor="#faf8f5"
              width={240}
              height={160}
              radius={16}
              spread={190}
              lift={22}
              tilt={8}
              openDuration={520}
              bounce={0.3}
            />
          </div>
        </div>

        {/* Hero Bottom Bar: Classic 6-Team Use Cases & Ivors Mark */}
        {/* Hero Bottom Bar: Classic 6-Team Use Cases in a single line & Ivors Mark in bottom left */}
        <div className={styles.heroFooterRow}>
          {/* Single line with no descriptions */}
          <div className={styles.heroTeamsClassicRow}>
            <div className={styles.heroTeamClassicItem}>
              <Code2 className={styles.heroTeamClassicIcon} />
              <span className={styles.heroTeamClassicTitle}>Software</span>
            </div>

            <span className={styles.heroTeamClassicSep}>/</span>

            <div className={styles.heroTeamClassicItem}>
              <Layers className={styles.heroTeamClassicIcon} />
              <span className={styles.heroTeamClassicTitle}>Product</span>
            </div>

            <span className={styles.heroTeamClassicSep}>/</span>

            <div className={styles.heroTeamClassicItem}>
              <SlidersHorizontal className={styles.heroTeamClassicIcon} />
              <span className={styles.heroTeamClassicTitle}>Operations</span>
            </div>

            <span className={styles.heroTeamClassicSep}>/</span>

            <div className={styles.heroTeamClassicItem}>
              <Target className={styles.heroTeamClassicIcon} />
              <span className={styles.heroTeamClassicTitle}>Marketing</span>
            </div>

            <span className={styles.heroTeamClassicSep}>/</span>

            <div className={styles.heroTeamClassicItem}>
              <TrendingUp className={styles.heroTeamClassicIcon} />
              <span className={styles.heroTeamClassicTitle}>Sales</span>
            </div>

            <span className={styles.heroTeamClassicSep}>/</span>

            <div className={styles.heroTeamClassicItem}>
              <Users className={styles.heroTeamClassicIcon} />
              <span className={styles.heroTeamClassicTitle}>HRM</span>
            </div>
          </div>

          {/* Bottom row: 'a product by ivors' in bottom left */}
          <div className={styles.heroFooterBottomRow}>
            <div className={styles.ivorsClassicSignature}>
              <div className={styles.ivorsBrandMark}>
                <span className={styles.ivorsPrefix}>a product by</span>
                <span className={styles.ivorsBrandName}>ivors</span>
              </div>
            </div>

            <p className={styles.heroTeamsSubtext}>
              Flexible and customizable for any workflow, department, or project across your company.
            </p>
          </div>
        </div>
      </header>

      {/* 3. Interactive Live Workspace Simulation (Kanban, RBAC, Team Directory, Specs) */}
      <WorkspaceSimulation onOpenAuth={onOpenAuth} />

      {/* 4. Core Principles Strip */}
      <section className={styles.trustBanner}>
        <span className={styles.trustLabel}>
          CORE PRINCIPLES
        </span>
        <div className={styles.metricsGrid}>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>Fast &amp; Responsive</span>
            <span className={styles.metricDesc}>Immediate client updates without full page reloads</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>Focused Clarity</span>
            <span className={styles.metricDesc}>Zero clutter, unnecessary popups, or multi-level menus</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>Workspace Scopes</span>
            <span className={styles.metricDesc}>Isolated roles and permissions per project squad</span>
          </div>
          <div className={styles.metricItem}>
            <span className={styles.metricValue}>Tasks &amp; Notes</span>
            <span className={styles.metricDesc}>Keep sprint tracking and Markdown specs unified</span>
          </div>
        </div>
      </section>

      {/* 3. Features Section (Bento Grid) */}
      <section className={styles.featuresSection} id="features">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionKicker}>
            <span className={styles.kickerIndex}>03</span>
            <span className={styles.kickerDivider}>/</span>
            <span className={styles.kickerLabel}>CORE CAPABILITIES</span>
          </div>
          <h2 className={styles.sectionTitle}>Everything your team needs to ship</h2>
          <p className={styles.sectionSubtitle}>
            Sprint planning, project documentation, and team collaboration in one focused workspace.
          </p>
        </div>

        {/* React Bits MagicBento Component */}
        <MagicBento 
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={12}
          glowColor="180, 150, 110"
        />
      </section>

      {/* 4. Comparison Section ("Why Optics") */}
      <section className={styles.compareSection} id="solutions">
        <div className={styles.sectionHeader} style={{ marginBottom: '3rem' }}>
          <div className={styles.sectionKicker}>
            <span className={styles.kickerIndex}>04</span>
            <span className={styles.kickerDivider}>/</span>
            <span className={styles.kickerLabel}>SYSTEM COMPARISON</span>
          </div>
          <h2 className={styles.sectionTitle}>Why teams switch to Optics</h2>
          <p className={styles.sectionSubtitle}>
            No bloated enterprise menus, no sluggish loading screens. Just clean, focused project management.
          </p>
        </div>

        <div className={styles.compareTableWrapper}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>Capability</th>
                <th className={styles.opticsHeader}>Optics</th>
                <th>Legacy Jira</th>
                <th>Generic Kanban (Trello)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Speed &amp; Feel</strong></td>
                <td><span className={styles.checkPositive}><Check className="w-4 h-4" /> Instant &amp; smooth</span></td>
                <td><span className={styles.crossNegative}>Slow and clunky</span></td>
                <td><span className={styles.crossNegative}>Laggy updates</span></td>
              </tr>
              <tr>
                <td><strong>Project Notes</strong></td>
                <td><span className={styles.checkPositive}><Check className="w-4 h-4" /> Built-in team docs</span></td>
                <td><span className={styles.crossNegative}>Requires separate software</span></td>
                <td><span className={styles.crossNegative}>Basic card attachments</span></td>
              </tr>
              <tr>
                <td><strong>Team Organization</strong></td>
                <td><span className={styles.checkPositive}><Check className="w-4 h-4" /> Clear workspaces &amp; roles</span></td>
                <td><span className={styles.crossNegative}>Overly complex setup</span></td>
                <td><span className={styles.crossNegative}>Basic member / admin only</span></td>
              </tr>
              <tr>
                <td><strong>File Storage</strong></td>
                <td><span className={styles.checkPositive}><Check className="w-4 h-4" /> Private &amp; organized</span></td>
                <td><span className={styles.crossNegative}>Scattered file links</span></td>
                <td><span className={styles.crossNegative}>Third-party embeds</span></td>
              </tr>
              <tr>
                <td><strong>Interface &amp; Focus</strong></td>
                <td><span className={styles.checkPositive}><Check className="w-4 h-4" /> Zero clutter, pure clarity</span></td>
                <td><span className={styles.crossNegative}>Overwhelming menus &amp; popups</span></td>
                <td><span className={styles.crossNegative}>Too simple for growing teams</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Developer Toolchain & Fast Terminal Workflows */}
      <section className={styles.toolchainSection} id="toolchain">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionKicker}>
            <span className={styles.kickerIndex}>05</span>
            <span className={styles.kickerDivider}>/</span>
            <span className={styles.kickerLabel}>DEVELOPER TOOLCHAIN</span>
          </div>
          <h2 className={styles.sectionTitle}>Engineered for terminal &amp; Git speed</h2>
          <p className={styles.sectionSubtitle}>
            Eliminate friction between planning and shipping. Command palette navigation, bi-directional Pull Request sync, and sub-20ms reactive event streaming.
          </p>
        </div>

        <div className={styles.toolchainContainer}>
          {/* Top 2-Col Mockups: ⌘K Palette + Git PR CI Sync */}
          <div className={styles.toolchainTwoColGrid}>
            {/* Mockup A: ⌘K Command Palette */}
            <div className={styles.cmdPaletteCard}>
              <div className={styles.cmdHeader}>
                <div className={styles.cmdDots}>
                  <div className={styles.cmdDot} />
                  <div className={styles.cmdDot} />
                  <div className={styles.cmdDot} />
                </div>
                <span className={styles.cmdTitle}>optics-command-palette --quick-nav</span>
                <span className={styles.cmdEscHint}>ESC</span>
              </div>

              <div className={styles.cmdBody}>
                <div className={styles.cmdInputRow}>
                  <span className={styles.cmdPrompt}>&gt;</span>
                  <span className={styles.cmdInputText}>
                    assign OPT-102 to Elena R.
                    <span className={styles.cmdCursor} />
                  </span>
                </div>

                <span className={styles.cmdSectionLabel}>Navigation</span>
                <div className={styles.cmdList}>
                  <div className={`${styles.cmdItem} ${styles.cmdItemActive}`}>
                    <div className={styles.cmdItemLeft}>
                      <Kanban className="w-3.5 h-3.5 text-stone-700" />
                      <span>Sprint 42 Kanban Board</span>
                    </div>
                    <div className={styles.cmdKeyGroup}>
                      <kbd className={styles.cmdKey}>⌘</kbd>
                      <kbd className={styles.cmdKey}>1</kbd>
                    </div>
                  </div>

                  <div className={styles.cmdItem}>
                    <div className={styles.cmdItemLeft}>
                      <FileText className="w-3.5 h-3.5 text-stone-600" />
                      <span>Architecture Specifications</span>
                    </div>
                    <div className={styles.cmdKeyGroup}>
                      <kbd className={styles.cmdKey}>⌘</kbd>
                      <kbd className={styles.cmdKey}>2</kbd>
                    </div>
                  </div>

                  <div className={styles.cmdItem}>
                    <div className={styles.cmdItemLeft}>
                      <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />
                      <span>RBAC Permission Evaluator</span>
                    </div>
                    <div className={styles.cmdKeyGroup}>
                      <kbd className={styles.cmdKey}>⌘</kbd>
                      <kbd className={styles.cmdKey}>3</kbd>
                    </div>
                  </div>
                </div>

                <span className={styles.cmdSectionLabel}>Actions</span>
                <div className={styles.cmdList}>
                  <div className={styles.cmdItem}>
                    <div className={styles.cmdItemLeft}>
                      <Plus className="w-3.5 h-3.5 text-stone-600" />
                      <span>Create New Task</span>
                    </div>
                    <div className={styles.cmdKeyGroup}>
                      <kbd className={styles.cmdKey}>⌥</kbd>
                      <kbd className={styles.cmdKey}>N</kbd>
                    </div>
                  </div>

                  <div className={styles.cmdItem}>
                    <div className={styles.cmdItemLeft}>
                      <GitPullRequest className="w-3.5 h-3.5 text-stone-600" />
                      <span>Open Linked PR #482</span>
                    </div>
                    <div className={styles.cmdKeyGroup}>
                      <kbd className={styles.cmdKey}>⌥</kbd>
                      <kbd className={styles.cmdKey}>G</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup B: Git PR & CI/CD Pipeline Sync */}
            <div className={styles.prSyncCard}>
              <div className={styles.prCardHeader}>
                <div className={styles.prRepoInfo}>
                  <GitBranch className="w-3.5 h-3.5 text-stone-500" />
                  <span>optics / optics-core</span>
                  <span style={{ color: '#c4beb4' }}>/</span>
                  <span>pull #482</span>
                </div>
                <div className={styles.prStatusMeta}>
                  <span className={styles.prStateLabel}>Status:</span>
                  <span className={styles.prStateValue}>Open (3 approvals)</span>
                </div>
              </div>

              <div className={styles.prCardBody}>
                <div className={styles.prTitleRow}>
                  <h3 className={styles.prTitle}>feat(rbac): multi-tenant policy evaluation &amp; audit logging</h3>
                  <div className={styles.prBranchRow}>
                    <span>Target:</span>
                    <span className={styles.prBranchName}>main</span>
                    <span>←</span>
                    <span className={styles.prBranchName}>feat/opt-102-rbac-evaluator</span>
                  </div>
                </div>

                <div className={styles.prCiChecksList}>
                  <div className={styles.prCheckBadge}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className={styles.prCheckBadgeName}>ci/typecheck</span>
                    <span className={styles.prCheckBadgeDuration}>0.4s</span>
                  </div>
                  <div className={styles.prCheckBadge}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className={styles.prCheckBadgeName}>e2e/sprint-sync</span>
                    <span className={styles.prCheckBadgeDuration}>1.1s</span>
                  </div>
                  <div className={styles.prCheckBadge}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className={styles.prCheckBadgeName}>security/audit</span>
                    <span className={styles.prCheckBadgeDuration}>0.2s</span>
                  </div>
                </div>

                <pre className={styles.prCodeSnippet}>
                  <code>
                    <span className={styles.codeComment}>// middleware/authorizeSprint.ts</span>{'\n'}
                    <span className={styles.codeKeyword}>export async function</span> <span className={styles.codeFunction}>authorizeSprintAction</span>({'\n'}
                    {'  '}<span className={styles.codeParam}>tenantId</span>: string,{'\n'}
                    {'  '}<span className={styles.codeParam}>actorId</span>: string,{'\n'}
                    {'  '}<span className={styles.codeParam}>action</span>: <span className={styles.codeString}>'card:move' | 'spec:publish'</span>{'\n'}
                    ): Promise&lt;boolean&gt; {'{'}{'\n'}
                    {'  '}<span className={styles.codeKeyword}>const</span> policy = <span className={styles.codeKeyword}>await</span> getCachedPolicy(tenantId, actorId);{'\n'}
                    {'  '}<span className={styles.codeKeyword}>return</span> policy.evaluate(action) === <span className={styles.codeKeyword}>true</span>;{'\n'}
                    {'}'}
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Bottom Card: Reactive Event Bus & Realtime Pipeline */}
          <div className={styles.pipelineCard}>
            <div className={styles.pipelineHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap className="w-4 h-4 text-stone-700" />
                <h3 className={styles.pipelineTitle}>Zero-Polling Reactive Engine Architecture</h3>
              </div>
              <span className={styles.pipelineBadge}>LIVE SSE PIPELINE · AES-256</span>
            </div>

            <div className={styles.pipelineFlowGrid}>
              <div className={styles.pipelineStepBox}>
                <div className={styles.pipelineStepHeader}>
                  <span className={styles.pipelineStepNum}>01 / CLIENT</span>
                  <span className={styles.pipelineStepLatency}>0ms</span>
                </div>
                <span className={styles.pipelineStepName}>Optimistic State</span>
                <span className={styles.pipelineStepDetail}>Instant drag re-render without blocking on network</span>
              </div>

              <div className={styles.pipelineArrow}>
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className={styles.pipelineStepBox}>
                <div className={styles.pipelineStepHeader}>
                  <span className={styles.pipelineStepNum}>02 / BUS</span>
                  <span className={styles.pipelineStepLatency}>18ms</span>
                </div>
                <span className={styles.pipelineStepName}>SSE Fanout Bus</span>
                <span className={styles.pipelineStepDetail}>Realtime event streaming broadcast to all squad members</span>
              </div>

              <div className={styles.pipelineArrow}>
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className={styles.pipelineStepBox}>
                <div className={styles.pipelineStepHeader}>
                  <span className={styles.pipelineStepNum}>03 / PERSIST</span>
                  <span className={styles.pipelineStepLatency}>6ms</span>
                </div>
                <span className={styles.pipelineStepName}>PostgreSQL WAL</span>
                <span className={styles.pipelineStepDetail}>ACID transactional durability &amp; row-level tenancy</span>
              </div>

              <div className={styles.pipelineArrow}>
                <ArrowRight className="w-4 h-4" />
              </div>

              <div className={styles.pipelineStepBox}>
                <div className={styles.pipelineStepHeader}>
                  <span className={styles.pipelineStepNum}>04 / AUDIT</span>
                  <span className={styles.pipelineStepLatency}>2ms</span>
                </div>
                <span className={styles.pipelineStepName}>Immutable Ledger</span>
                <span className={styles.pipelineStepDetail}>Cryptographically verifiable compliance log</span>
              </div>
            </div>

            <div className={styles.pipelineMetricsBar}>
              <div className={styles.pipelineMetricItem}>
                <span className={styles.pipelineMetricVal}>18ms</span>
                <span className={styles.pipelineMetricLbl}>Average roundtrip state propagation</span>
              </div>
              <div className={styles.pipelineMetricItem}>
                <span className={styles.pipelineMetricVal}>99.999%</span>
                <span className={styles.pipelineMetricLbl}>Event delivery success without drops</span>
              </div>
              <div className={styles.pipelineMetricItem}>
                <span className={styles.pipelineMetricVal}>4.8 MB</span>
                <span className={styles.pipelineMetricLbl}>Lightweight client memory consumption</span>
              </div>
              <div className={styles.pipelineMetricItem}>
                <span className={styles.pipelineMetricVal}>100%</span>
                <span className={styles.pipelineMetricLbl}>Strict tenant-isolated cryptographic boundary</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Sprint Velocity & Real-time Audit Telemetry Grid */}
      <section className={styles.analyticsSection} id="analytics">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionKicker}>
            <span className={styles.kickerIndex}>06</span>
            <span className={styles.kickerDivider}>/</span>
            <span className={styles.kickerLabel}>REAL-TIME VELOCITY &amp; AUDIT</span>
          </div>
          <h2 className={styles.sectionTitle}>Radical transparency into engineering throughput</h2>
          <p className={styles.sectionSubtitle}>
            No more status meetings to find out where sprint time went. Live cycle time telemetry, automated burndown curves, and an immutable security audit ledger.
          </p>
        </div>

        <div className={styles.analyticsContainer}>
          <div className={styles.analyticsGrid}>
            {/* Card 1: Sprint 42 Velocity Burndown Engine */}
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsCardHeader}>
                <div className={styles.analyticsCardLabelRow}>
                  <span className={styles.analyticsCardTag}>VELOCITY / S-42</span>
                  <span className={styles.analyticsMetaText}>8 tasks remaining</span>
                </div>
                <h3 className={styles.analyticsCardTitle}>Automated Burndown Engine</h3>
                <p className={styles.analyticsCardDesc}>
                  Calculated automatically on every task move and PR merge. Zero manual tracking required.
                </p>
              </div>

              {/* Crisp SVG Burndown Chart */}
              <div className={styles.burndownSvgWrapper}>
                <svg viewBox="0 0 320 120" style={{ width: '100%', height: '100%' }}>
                  {/* Grid Lines */}
                  <line x1="20" y1="20" x2="300" y2="20" stroke="#ede7db" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="20" y1="55" x2="300" y2="55" stroke="#ede7db" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="20" y1="90" x2="300" y2="90" stroke="#ede7db" strokeWidth="1" strokeDasharray="3 3" />
                  {/* Guideline: Ideal Burndown Slope */}
                  <line x1="30" y1="25" x2="290" y2="95" stroke="#a8a29e" strokeWidth="1.5" strokeDasharray="4 4" />
                  {/* Actual Velocity Curve */}
                  <path d="M 30 25 C 70 26, 100 45, 140 50 C 180 55, 210 75, 250 82" fill="none" stroke="#18181b" strokeWidth="2.5" />
                  {/* Data Points */}
                  <circle cx="30" cy="25" r="3.5" fill="#18181b" />
                  <circle cx="100" cy="45" r="3" fill="#18181b" />
                  <circle cx="140" cy="50" r="3" fill="#18181b" />
                  <circle cx="210" cy="75" r="3" fill="#18181b" />
                  <circle cx="250" cy="82" r="4.5" fill="#18181b" stroke="#faf8f5" strokeWidth="1.5" />
                  {/* Chart Day Labels */}
                  <text x="30" y="112" fill="#78716c" fontSize="9" fontFamily="var(--font-mono, monospace)">D1</text>
                  <text x="100" y="112" fill="#78716c" fontSize="9" fontFamily="var(--font-mono, monospace)">D3</text>
                  <text x="175" y="112" fill="#78716c" fontSize="9" fontFamily="var(--font-mono, monospace)">D6</text>
                  <text x="250" y="112" fill="#18181b" fontWeight="bold" fontSize="9" fontFamily="var(--font-mono, monospace)">D8 (Now)</text>
                  <text x="290" y="112" fill="#a8a29e" fontSize="9" fontFamily="var(--font-mono, monospace)">D10</text>
                </svg>
              </div>

              <div className={styles.burndownStatsRow}>
                <div className={styles.burndownStatItem}>
                  <span className={styles.burndownStatNum}>48 / 52</span>
                  <span className={styles.burndownStatLbl}>Story Points Closed</span>
                </div>
                <div className={styles.burndownStatItem}>
                  <span className={styles.burndownStatNum}>14</span>
                  <span className={styles.burndownStatLbl}>Tasks Done</span>
                </div>
                <div className={styles.burndownStatItem}>
                  <span className={styles.burndownStatNum}>2 Days</span>
                  <span className={styles.burndownStatLbl}>Time Remaining</span>
                </div>
              </div>
            </div>

            {/* Card 2: Cycle Time Breakdown & PR Bottleneck Detector */}
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsCardHeader}>
                <div className={styles.analyticsCardLabelRow}>
                  <span className={styles.analyticsCardTag}>CYCLE TIME</span>
                  <span className={styles.analyticsMetaText}>Commit to deploy</span>
                </div>
                <h3 className={styles.analyticsCardTitle}>Cycle Time &amp; Lead Flow</h3>
                <p className={styles.analyticsCardDesc}>
                  Track the exact time from first commit to production deploy across your engineering squads.
                </p>
              </div>

              <div className={styles.cycleTimeHero}>
                <span className={styles.cycleTimeBigNum}>2.4d</span>
                <span className={styles.cycleTimeMetricLabel}>Average sprint resolution</span>
              </div>

              {/* Segmented Bar Breakdown */}
              <div className={styles.cycleSegmentBar}>
                <div className={styles.cycleSegCoding} title="Coding: 0.7d (29%)" />
                <div className={styles.cycleSegReview} title="Review: 0.9d (38%)" />
                <div className={styles.cycleSegBuild} title="Build: 0.3d (13%)" />
                <div className={styles.cycleSegDeploy} title="Deploy: 0.5d (20%)" />
              </div>

              <div className={styles.cycleLegendGrid}>
                <div className={styles.cycleLegendRow}>
                  <div className={styles.cycleLegendColor} style={{ background: '#18181b' }} />
                  <span>Coding: <strong>0.7d</strong></span>
                </div>
                <div className={styles.cycleLegendRow}>
                  <div className={styles.cycleLegendColor} style={{ background: '#57534e' }} />
                  <span>Review: <strong>0.9d</strong></span>
                </div>
                <div className={styles.cycleLegendRow}>
                  <div className={styles.cycleLegendColor} style={{ background: '#a8a29e' }} />
                  <span>Build: <strong>0.3d</strong></span>
                </div>
                <div className={styles.cycleLegendRow}>
                  <div className={styles.cycleLegendColor} style={{ background: '#c4beb4' }} />
                  <span>Deploy: <strong>0.5d</strong></span>
                </div>
              </div>

              <div className={styles.cycleSquadList}>
                <div className={styles.cycleSquadRow}>
                  <span className={styles.cycleSquadName}>Frontend Squad</span>
                  <span className={styles.cycleSquadVal}>1.8d avg</span>
                </div>
                <div className={styles.cycleSquadRow}>
                  <span className={styles.cycleSquadName}>Core Backend</span>
                  <span className={styles.cycleSquadVal}>2.5d avg</span>
                </div>
                <div className={styles.cycleSquadRow}>
                  <span className={styles.cycleSquadName}>Design &amp; UI</span>
                  <span className={styles.cycleSquadVal}>1.4d avg</span>
                </div>
              </div>
            </div>

            {/* Card 3: Immutable Real-Time Audit Ledger */}
            <div className={styles.analyticsCard}>
              <div className={styles.analyticsCardHeader}>
                <div className={styles.analyticsCardLabelRow}>
                  <span className={styles.analyticsCardTag}>AUDIT STREAM</span>
                  <span className={styles.analyticsMetaText}>Live ledger</span>
                </div>
                <h3 className={styles.analyticsCardTitle}>Immutable Audit Ledger</h3>
                <p className={styles.analyticsCardDesc}>
                  Every role switch, branch merge, and file permission change is cryptographically logged.
                </p>
              </div>

              <div className={styles.auditLogList}>
                <div className={styles.auditLogItem}>
                  <div className={styles.auditActorInitials}>ER</div>
                  <div className={styles.auditItemContent}>
                    <div className={styles.auditItemTop}>
                      <span className={styles.auditItemActor}>Elena R.</span>
                      <span className={styles.auditItemTime}>14:24:10</span>
                    </div>
                    <p className={styles.auditItemDesc}>
                      <span className={styles.auditItemBadge}>PR_MERGE</span>
                      Merged PR #482 into main → Closed OPT-102
                    </p>
                  </div>
                </div>

                <div className={styles.auditLogItem}>
                  <div className={styles.auditActorInitials}>MA</div>
                  <div className={styles.auditItemContent}>
                    <div className={styles.auditItemTop}>
                      <span className={styles.auditItemActor}>Mayank A.</span>
                      <span className={styles.auditItemTime}>14:18:02</span>
                    </div>
                    <p className={styles.auditItemDesc}>
                      <span className={styles.auditItemBadge}>RBAC_EVAL</span>
                      Granted Lead privileges for squad Frontend
                    </p>
                  </div>
                </div>

                <div className={styles.auditLogItem}>
                  <div className={styles.auditActorInitials}>MV</div>
                  <div className={styles.auditItemContent}>
                    <div className={styles.auditItemTop}>
                      <span className={styles.auditItemActor}>Marcus V.</span>
                      <span className={styles.auditItemTime}>13:50:45</span>
                    </div>
                    <p className={styles.auditItemDesc}>
                      <span className={styles.auditItemBadge}>DOC_PUBLISH</span>
                      Published optics-v2-architecture.md
                    </p>
                  </div>
                </div>

                <div className={styles.auditLogItem}>
                  <div className={styles.auditActorInitials}>SC</div>
                  <div className={styles.auditItemContent}>
                    <div className={styles.auditItemTop}>
                      <span className={styles.auditItemActor}>Sophia C.</span>
                      <span className={styles.auditItemTime}>13:30:19</span>
                    </div>
                    <p className={styles.auditItemDesc}>
                      <span className={styles.auditItemBadge}>ATTACHMENT</span>
                      Uploaded optics-specs.pdf (4.2 MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Accordion Section */}
      <section className={styles.faqSection} id="faq">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionKicker}>
            <span className={styles.kickerIndex}>07</span>
            <span className={styles.kickerDivider}>/</span>
            <span className={styles.kickerLabel}>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
        </div>

        <div className={styles.faqList}>
          {[
            {
              q: 'How fast does Optics update for the team?',
              a: 'Optics updates immediately in real-time. Whenever someone on your team creates a task, moves a card, or updates a doc, everyone sees it instantly without having to refresh the page.'
            },
            {
              q: 'Can we import our existing tasks and projects?',
              a: 'Yes. You can easily import tasks and projects from CSV or existing tools so your team can get started in minutes without losing momentum.'
            },
            {
              q: 'How do team permissions and roles work?',
              a: 'Optics provides simple, intuitive roles — from workspace owners and leads to team members and view-only guests — making it easy to manage who can edit or view each project.'
            },
            {
              q: 'Can we organize multiple projects and teams?',
              a: 'Yes. You can create separate workspaces for different teams, departments, or client projects, keeping everything neat and organized in one place.'
            }
          ].map((item, idx) => (
            <div key={idx} className={styles.faqItem}>
              <div 
                className={styles.faqQuestionRow}
                onClick={() => toggleFaq(idx)}
              >
                <span className={styles.faqQuestion}>{item.q}</span>
                <ChevronDown 
                  className="w-4 h-4 text-stone-500 transition-transform duration-200"
                  style={{ transform: activeFaq === idx ? 'rotate(180deg)' : 'none' }}
                />
              </div>
              {activeFaq === idx && (
                <div className={styles.faqAnswer}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. Big Bottom Call To Action Banner */}
      <section className={styles.bottomCtaSection}>
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaHeading}>
            Ready to simplify how your team works?
          </h2>
          <p className={styles.ctaParagraph}>
            Start organizing your projects, sprints, and team notes in one clean workspace. Set up in less than 60 seconds.
          </p>
          <div className={styles.ctaBtnsRow}>
            <button 
              type="button" 
              onClick={() => onOpenAuth('register')} 
              className={styles.heroCtaPrimary}
              id="bottom-cta-register"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={() => onOpenAuth('login')} 
              className={styles.heroCtaSecondary}
              id="bottom-cta-login"
            >
              <span>Sign In to Existing Team</span>
            </button>
          </div>
          <span className={styles.ctaSubnote}>
            No credit card required · 100% free for all teams
          </span>
        </div>
      </section>

      {/* 10. Institutional Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrandCol}>
              <div className={styles.navBrand} style={{ pointerEvents: 'none' }}>
                <OpticsLogo size={24} />
                <span className={styles.brandName}>Optics</span>
              </div>
              <p className={styles.footerTagline}>
                The project management workspace designed for speed, clarity, and focus.
              </p>
            </div>

            <div className={styles.footerColumns}>
              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Product</span>
                <ul className={styles.footerColLinks}>
                  <li><a href="#features" className={styles.footerColLink}>Capabilities</a></li>
                  <li><a href="#simulation" className={styles.footerColLink}>Live Simulation</a></li>
                  <li><a href="#toolchain" className={styles.footerColLink}>Developer Toolchain</a></li>
                  <li><a href="#analytics" className={styles.footerColLink}>Sprint Velocity</a></li>

                </ul>
              </div>

              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Resources</span>
                <ul className={styles.footerColLinks}>
                  <li><Link href="/docs" className={styles.footerColLink}>Documentation &amp; Guides</Link></li>
                  <li><a href="#faq" className={styles.footerColLink}>Frequently Asked Questions</a></li>
                  <li><Link href="/support" className={styles.footerColLink}>System Status</Link></li>
                </ul>
              </div>

              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Legal &amp; Security</span>
                <ul className={styles.footerColLinks}>
                  <li><Link href="/privacy" className={styles.footerColLink}>Privacy Policy</Link></li>
                  <li><Link href="/terms" className={styles.footerColLink}>Terms of Service</Link></li>
                  <li><Link href="/security" className={styles.footerColLink}>Security Architecture</Link></li>
                </ul>
              </div>

              <div className={styles.footerCol}>
                <span className={styles.footerColTitle}>Support</span>
                <ul className={styles.footerColLinks}>
                  <li><Link href="/support" className={styles.footerColLink}>Help Center</Link></li>
                  <li><Link href="/contact" className={styles.footerColLink}>Contact Us</Link></li>
                  <li><a href="mailto:support@ivors.studio" className={styles.footerColLink}>support@ivors.studio</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span>© {new Date().getFullYear()} Optics by Ivors. All rights reserved.</span>
            <span>Crafted for teams that value focus and shipping great work.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
