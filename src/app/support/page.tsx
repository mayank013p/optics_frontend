import React from 'react';
import Link from 'next/link';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import styles from '@/components/legal/LegalPageLayout.module.css';

export const metadata = {
  title: 'Support & Help Center — Optics by Ivors',
  description: 'Find answers, troubleshoot workspace issues, and contact Optics engineering support.'
};

export default function SupportPage() {
  const toc = [
    { id: 'channels', label: '1. Support Channels & SLAs' },
    { id: 'workspace-setup', label: '2. Workspace & Invites' },
    { id: 'sprints-sync', label: '3. Sprints & Realtime Sync' },
    { id: 'billing-seats', label: '4. Billing & Seat Upgrades' },
    { id: 'troubleshooting-faq', label: '5. Troubleshooting FAQ' },
    { id: 'system-status', label: '6. Operational Status' }
  ];

  return (
    <LegalPageLayout
      badge="HELP &amp; SUPPORT"
      kickerIndex="05"
      title="Support &amp; Help Center"
      subtitle="Comprehensive guides, troubleshooting steps, and direct engineering support channels for your Optics team."
      effectiveDate="October 2026"
      version="v2.1"
      toc={toc}
      activeNav="support"
    >
      <div className={styles.calloutBox}>
        <strong>Need direct assistance?</strong> Our engineering team monitors inbound requests around the clock. Email <strong>support@ivors.studio</strong> for technical troubleshooting, billing inquiries, or workspace recovery.
      </div>

      {/* 1. Support Channels */}
      <section className={styles.sectionBlock} id="channels">
        <h2 className={styles.sectionHeading}>1. Support Channels &amp; Response SLAs</h2>
        <p className={styles.paragraph}>
          We offer direct engineering support based on your workspace tier:
        </p>

        <div className={styles.matrixTableWrapper}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th>Tier</th>
                <th>Channel</th>
                <th>Target Response Time</th>
                <th>Coverage Hours</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Starter (Free)</strong></td>
                <td>Email (support@ivors.studio) &amp; Community</td>
                <td>Within 24 business hours</td>
                <td>Mon – Fri (9am – 6pm IST/UTC)</td>
              </tr>
              <tr>
                <td><strong>Pro</strong></td>
                <td>Priority Email &amp; In-App Ticket</td>
                <td>Under 4 hours</td>
                <td>24/5 Business Days</td>
              </tr>
              <tr>
                <td><strong>Enterprise</strong></td>
                <td>Dedicated Shared Slack Channel &amp; Phone</td>
                <td>Under 1 hour (Critical P0 incidents)</td>
                <td>24/7/365 Continuous Coverage</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Workspace Setup */}
      <section className={styles.sectionBlock} id="workspace-setup">
        <h2 className={styles.sectionHeading}>2. Workspace Setup &amp; Teammate Invites</h2>
        <div className={styles.cardsGrid}>
          <div className={styles.cardItem}>
            <span className={styles.cardItemTitle}>Inviting Team Members</span>
            <p className={styles.cardItemText}>
              Navigate to <strong>Workspace Settings &rarr; Squad Directory</strong> and click <em>&quot;Invite Member&quot;</em>. Enter their corporate email address and assign an initial RBAC role (Lead, Member, or Guest). An invitation token will be dispatched instantly.
            </p>
          </div>
          <div className={styles.cardItem}>
            <span className={styles.cardItemTitle}>Role Modifications</span>
            <p className={styles.cardItemText}>
              Workspace Owners can elevate or restrict permissions at any time from the Squad Directory. Changes propagate across active sessions immediately without requiring logout.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Sprints & Sync */}
      <section className={styles.sectionBlock} id="sprints-sync">
        <h2 className={styles.sectionHeading}>3. Sprints &amp; Real-Time Synchronization</h2>
        <p className={styles.paragraph}>
          Optics uses persistent Server-Sent Events (SSE) to sync sprint cards across all team devices. If you experience unexpected disconnects:
        </p>
        <ul className={styles.bulletList}>
          <li>Verify your corporate firewall permits outbound TLS connections on standard HTTPS port 443 with streaming enabled.</li>
          <li>Check that aggressive browser ad-blockers or proxy extensions are not terminating long-lived event connections.</li>
          <li>In the event of network disruption, Optics queues task updates locally in browser storage and syncs automatically upon reconnect.</li>
        </ul>
      </section>

      {/* 4. Billing & Seats */}
      <section className={styles.sectionBlock} id="billing-seats">
        <h2 className={styles.sectionHeading}>4. Billing, Invoices &amp; Seat Adjustments</h2>
        <p className={styles.paragraph}>
          Manage subscriptions directly under <strong>Workspace Settings &rarr; Billing</strong>:
        </p>
        <ul className={styles.bulletList}>
          <li><strong>Seat Scaling:</strong> Adding team members will automatically adjust your next invoice with prorated charges.</li>
          <li><strong>VAT &amp; Tax Invoices:</strong> All past payment receipts and downloadable PDF tax invoices are archived in your billing portal.</li>
          <li><strong>Changing Billing Cadence:</strong> Toggle between annual billing (20% discount) and monthly billing at any time.</li>
        </ul>
      </section>

      {/* 5. Troubleshooting FAQ */}
      <section className={styles.sectionBlock} id="troubleshooting-faq">
        <h2 className={styles.sectionHeading}>5. Troubleshooting Frequently Asked Questions</h2>
        
        <h3 className={styles.subHeading}>Q: How do I recover an accidentally closed task?</h3>
        <p className={styles.paragraph}>
          Completed and closed tasks are preserved in the Done column and search archive. Simply filter by status or search for the task key (e.g. <code>OPT-102</code>) and drag it back to In Progress.
        </p>

        <h3 className={styles.subHeading}>Q: Can I export all workspace documents for backup?</h3>
        <p className={styles.paragraph}>
          Yes. Workspace Owners can initiate a full data export in <strong>Workspace Settings</strong>. The system will compile all tasks, Markdown specs, and activity logs into a clean, unencrypted ZIP containing standard JSON and <code>.md</code> files.
        </p>

        <h3 className={styles.subHeading}>Q: Can I connect Optics to GitHub?</h3>
        <p className={styles.paragraph}>
          Yes. Optics supports bi-directional Git branch references. When you mention an issue key like <code>OPT-102</code> in your pull request title or commit message, the task card links automatically to the open PR.
        </p>
      </section>

      {/* 6. System Status */}
      <section className={styles.sectionBlock} id="system-status">
        <h2 className={styles.sectionHeading}>6. Operational Status &amp; Uptime</h2>
        <p className={styles.paragraph}>
          All primary Optics systems (WebSocket/SSE event brokers, PostgreSQL database clusters, and media storage endpoints) are operational with a historical 99.98% availability record.
        </p>
        <p className={styles.paragraph}>
          For real-time incident reports or scheduled maintenance notices, visit our status feed or contact <strong>support@ivors.studio</strong>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
