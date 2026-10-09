import React from 'react';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import styles from '@/components/legal/LegalPageLayout.module.css';

export const metadata = {
  title: 'Platform Documentation & Developer Reference — Optics',
  description: 'Comprehensive guides for Optics sprint planning, Notion-style wikis, RBAC governance, and real-time SSE streaming APIs.'
};

export default function DocsPage() {
  const toc = [
    { id: 'quickstart', label: '1. Quickstart Guide' },
    { id: 'workspaces-squads', label: '2. Workspaces & Squads' },
    { id: 'sprints-kanban', label: '3. Sprint & Task Lifecycle' },
    { id: 'markdown-specs', label: '4. Project Notes & Specs' },
    { id: 'rbac-matrix', label: '5. RBAC Permission Matrix' },
    { id: 'realtime-api', label: '6. Real-Time SSE & REST API' },
    { id: 'data-ownership', label: '7. Data Export & Backup' }
  ];

  return (
    <LegalPageLayout
      badge="DEVELOPER &amp; PRODUCT GUIDES"
      kickerIndex="01"
      title="Optics Platform Documentation"
      subtitle="Complete guides for engineering teams configuring sprint boards, managing role-based access, and integrating with Optics real-time APIs."
      effectiveDate="October 2026"
      version="v2.4.0"
      toc={toc}
      activeNav="docs"
    >
      <div className={styles.calloutBox}>
        <strong>Platform Overview:</strong> Optics is an opinionated, fast workspace for modern software teams. It unifies sprint backlog tracking, Notion-style specifications, team squad directories, and encrypted file storage without bloated enterprise overhead.
      </div>

      {/* 1. Quickstart */}
      <section className={styles.sectionBlock} id="quickstart">
        <h2 className={styles.sectionHeading}>1. Quickstart Guide</h2>
        <p className={styles.paragraph}>
          Get your squad configured and tracking active sprints in less than two minutes:
        </p>
        <ul className={styles.bulletList}>
          <li><strong>Create Your Workspace:</strong> Open the top navigation switcher, select <em>&quot;Create Workspace&quot;</em>, and enter your company or engineering domain.</li>
          <li><strong>Configure Sprints:</strong> Choose between standard 2-week timeboxed sprints, 1-week rapid cycles, or an ongoing Kanban continuous delivery flow.</li>
          <li><strong>Invite Your Squad:</strong> Invite engineers, product leads, and stakeholders with email tokens. Assign appropriate RBAC roles directly upon onboarding.</li>
          <li><strong>Link Markdown Specs:</strong> Draft technical requirements, RFCs, and API blueprints directly alongside your sprint tasks with bi-directional references.</li>
        </ul>
      </section>

      {/* 2. Workspaces & Squads */}
      <section className={styles.sectionBlock} id="workspaces-squads">
        <h2 className={styles.sectionHeading}>2. Workspaces &amp; Squad Hierarchies</h2>
        <p className={styles.paragraph}>
          Workspaces serve as the root tenant boundary in Optics. All tasks, documentation, role definitions, and file attachments are strictly isolated within their assigned workspace.
        </p>
        <div className={styles.cardsGrid}>
          <div className={styles.cardItem}>
            <span className={styles.cardItemTitle}>Cross-Squad Isolation</span>
            <p className={styles.cardItemText}>
              Different teams (e.g. Core Frontend, Platform API, Security &amp; Infra) can maintain dedicated boards while sharing global project wikis within the company tenant.
            </p>
          </div>
          <div className={styles.cardItem}>
            <span className={styles.cardItemTitle}>Granular Workspace Settings</span>
            <p className={styles.cardItemText}>
              Workspace owners can configure custom task priorities (P0 Blocker, P1 High, P2 Normal), custom column stages, and auto-archive cadences for completed items.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Sprints & Tasks */}
      <section className={styles.sectionBlock} id="sprints-kanban">
        <h2 className={styles.sectionHeading}>3. Sprint &amp; Task Lifecycle</h2>
        <p className={styles.paragraph}>
          Optics enforces a deterministic task progression pipeline. Every card contains a unique identifier (e.g., <code>OPT-102</code>), priority level, assignee, and activity ledger.
        </p>
        <ul className={styles.bulletList}>
          <li><strong>Backlog:</strong> Unestimated or scheduled items queued for upcoming sprints.</li>
          <li><strong>In Progress:</strong> Active development in progress. Assignee presence is visible in real-time.</li>
          <li><strong>In Review:</strong> Code reviews, pull requests, and QA verification. Backlinked PR status updates automatically.</li>
          <li><strong>Done:</strong> Merged, verified, and shipped. Tasks automatically record completion timestamps in the immutable audit ledger.</li>
        </ul>
      </section>

      {/* 4. Markdown Specs */}
      <section className={styles.sectionBlock} id="markdown-specs">
        <h2 className={styles.sectionHeading}>4. Project Notes &amp; Specifications</h2>
        <p className={styles.paragraph}>
          The Optics document editor supports full GitHub Flavored Markdown (GFM), syntax-highlighted code fences, nested checklists, callout alerts, and table structures.
        </p>
        <p className={styles.paragraph}>
          Documents can be tagged and linked directly to sprint cards. When referencing an issue key (e.g. <code>OPT-102</code>), Optics renders an interactive card chip showing live task state.
        </p>
      </section>

      {/* 5. RBAC Matrix Table */}
      <section className={styles.sectionBlock} id="rbac-matrix">
        <h2 className={styles.sectionHeading}>5. Role-Based Access Control (RBAC) Matrix</h2>
        <p className={styles.paragraph}>
          Permissions are evaluated deterministically on every HTTP request and WebSocket event. Here is the operational capability breakdown:
        </p>

        <div className={styles.matrixTableWrapper}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th>Operation / Capability</th>
                <th>Owner</th>
                <th>Lead</th>
                <th>Member</th>
                <th>Guest</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Move Sprint Cards &amp; Change Status</strong></td>
                <td>✓ Allowed</td>
                <td>✓ Allowed</td>
                <td>✓ Allowed</td>
                <td>Read-Only</td>
              </tr>
              <tr>
                <td><strong>Create / Edit Project Markdown Specs</strong></td>
                <td>✓ Allowed</td>
                <td>✓ Allowed</td>
                <td>✓ Allowed</td>
                <td>Read-Only</td>
              </tr>
              <tr>
                <td><strong>Delete Tasks or Project Wikis</strong></td>
                <td>✓ Allowed</td>
                <td>✓ Allowed</td>
                <td>Admin Review</td>
                <td>Denied</td>
              </tr>
              <tr>
                <td><strong>Invite Members &amp; Assign Roles</strong></td>
                <td>✓ Allowed</td>
                <td>✓ Squad Only</td>
                <td>Denied</td>
                <td>Denied</td>
              </tr>
              <tr>
                <td><strong>Manage Billing &amp; Export Data</strong></td>
                <td>✓ Allowed</td>
                <td>Denied</td>
                <td>Denied</td>
                <td>Denied</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Real-Time API */}
      <section className={styles.sectionBlock} id="realtime-api">
        <h2 className={styles.sectionHeading}>6. Real-Time SSE &amp; REST API</h2>
        <p className={styles.paragraph}>
          Optics exposes a lightweight REST API along with a Server-Sent Events (SSE) stream for instant event subscription.
        </p>

        <h3 className={styles.subHeading}>Authenticating API Requests</h3>
        <p className={styles.paragraph}>
          Pass your Bearer token in the <code>Authorization</code> header:
        </p>

        <div className={styles.codeBox}>
          <div className={styles.codeBoxHeader}>
            <span>cURL · Fetch Active Sprint Tasks</span>
            <span>bash</span>
          </div>
          <pre className={styles.codeBoxBody}>
{`curl -X GET "https://api.ivors.studio/v1/workspaces/ws_42/tasks?status=in_progress" \\
  -H "Authorization: Bearer opt_live_998124a91b" \\
  -H "Content-Type: application/json"`}
          </pre>
        </div>

        <h3 className={styles.subHeading}>Subscribing to Real-Time Workspace Events</h3>
        <p className={styles.paragraph}>
          Establish an SSE connection to stream updates whenever a team member updates a card or publishes a specification:
        </p>

        <div className={styles.codeBox}>
          <div className={styles.codeBoxHeader}>
            <span>cURL · Subscribe to Live Event Stream</span>
            <span>bash</span>
          </div>
          <pre className={styles.codeBoxBody}>
{`curl -N -H "Authorization: Bearer opt_live_998124a91b" \\
  -H "Accept: text/event-stream" \\
  "https://api.ivors.studio/v1/workspaces/ws_42/stream"`}
          </pre>
        </div>
      </section>

      {/* 7. Data Ownership */}
      <section className={styles.sectionBlock} id="data-ownership">
        <h2 className={styles.sectionHeading}>7. Data Ownership &amp; Backup Exports</h2>
        <p className={styles.paragraph}>
          You own 100% of your workspace data. Workspace owners can generate a complete data archive at any time from Workspace Settings.
        </p>
        <p className={styles.paragraph}>
          Exports contain clean JSON dumps of all task histories, audit logs, and raw Markdown <code>.md</code> files with original frontmatter.
        </p>
      </section>
    </LegalPageLayout>
  );
}
