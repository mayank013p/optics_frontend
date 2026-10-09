import React from 'react';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import styles from '@/components/legal/LegalPageLayout.module.css';

export const metadata = {
  title: 'Privacy Policy — Optics by Ivors',
  description: 'Understand how Optics protects your private engineering projects, sprint logs, and team data.'
};

export default function PrivacyPage() {
  const toc = [
    { id: 'core-principles', label: '1. Privacy Commitments' },
    { id: 'data-collected', label: '2. Information Collected' },
    { id: 'data-usage', label: '3. Permitted Data Uses' },
    { id: 'storage-encryption', label: '4. Storage & Encryption' },
    { id: 'retention-deletion', label: '5. Retention & Purging' },
    { id: 'gdpr-ccpa', label: '6. International Rights (GDPR)' },
    { id: 'contact-dpo', label: '7. Data Protection Office' }
  ];

  return (
    <LegalPageLayout
      badge="LEGAL &amp; PRIVACY"
      kickerIndex="02"
      title="Optics Privacy Policy"
      subtitle="Our transparent policy on data collection, tenant encryption, and customer confidentiality. We never sell your data or train models on private documents."
      effectiveDate="October 2026"
      version="v2.1"
      toc={toc}
      activeNav="privacy"
    >
      <div className={styles.calloutBox}>
        <strong>Zero Data Exploitation:</strong> Optics exists to build software tools, not sell advertising or user profiles. Your tasks, specs, comments, and member rosters remain private to your workspace tenant and are never shared with third parties or used for AI training.
      </div>

      {/* 1. Core Principles */}
      <section className={styles.sectionBlock} id="core-principles">
        <h2 className={styles.sectionHeading}>1. Core Privacy Commitments</h2>
        <p className={styles.paragraph}>
          We operate Optics according to three strict architectural guidelines:
        </p>
        <ul className={styles.bulletList}>
          <li><strong>Zero Customer Data Monetization:</strong> We do not sell, rent, or trade your personal or organizational information to data brokers or advertisers.</li>
          <li><strong>No Public AI Training:</strong> Your project wikis, sprint backlogs, code snippets, and internal discussions are never fed into foundation models.</li>
          <li><strong>Tenant Isolation:</strong> Data stored in Optics is partitioned cryptographically and logically by workspace ID at both the database and cache layers.</li>
        </ul>
      </section>

      {/* 2. Information Collected */}
      <section className={styles.sectionBlock} id="data-collected">
        <h2 className={styles.sectionHeading}>2. Information We Collect</h2>
        <p className={styles.paragraph}>
          We collect only information required to operate a reliable, real-time collaboration platform:
        </p>

        <div className={styles.matrixTableWrapper}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th>Data Category</th>
                <th>Examples</th>
                <th>Operational Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Identity &amp; Auth</strong></td>
                <td>Name, email address, password hash (bcrypt), avatar image</td>
                <td>Authentication, session issuance, and team notifications</td>
              </tr>
              <tr>
                <td><strong>Workspace Content</strong></td>
                <td>Sprint tasks, labels, priorities, Markdown wikis, attached files</td>
                <td>Core product functionality and squad collaboration</td>
              </tr>
              <tr>
                <td><strong>Operational Logs</strong></td>
                <td>IP address, browser user-agent, API request timestamps</td>
                <td>Security audit logging, DDoS prevention, and rate-limiting</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Permitted Uses */}
      <section className={styles.sectionBlock} id="data-usage">
        <h2 className={styles.sectionHeading}>3. Permitted Data Uses</h2>
        <p className={styles.paragraph}>
          Your data is processed strictly for the following purposes:
        </p>
        <ul className={styles.bulletList}>
          <li>Enforcing role-based access control (RBAC) and validating team membership tokens.</li>
          <li>Delivering real-time Server-Sent Events (SSE) updates to connected devices.</li>
          <li>Processing subscription payments and generating accurate VAT billing receipts.</li>
          <li>Diagnosing application crashes and maintaining 99.98% platform reliability.</li>
        </ul>
      </section>

      {/* 4. Storage & Encryption */}
      <section className={styles.sectionBlock} id="storage-encryption">
        <h2 className={styles.sectionHeading}>4. Storage, Encryption &amp; Boundary</h2>
        <p className={styles.paragraph}>
          All communications between your browser and Optics are secured using TLS 1.3 with forward secrecy. At rest, database records and file attachments are encrypted with AES-256 keys managed in secure hardware security modules (HSMs).
        </p>
        <p className={styles.paragraph}>
          Backups are encrypted, signed, and replicated across geographically separated availability zones to safeguard against hardware failure.
        </p>
      </section>

      {/* 5. Retention & Deletion */}
      <section className={styles.sectionBlock} id="retention-deletion">
        <h2 className={styles.sectionHeading}>5. Data Retention &amp; Permanent Deletion</h2>
        <p className={styles.paragraph}>
          When a workspace owner deletes a card, specification, or entire workspace:
        </p>
        <ul className={styles.bulletList}>
          <li><strong>Soft Deletion:</strong> The item is immediately marked inactive and becomes inaccessible to all team members.</li>
          <li><strong>Hard Purge:</strong> Within 30 days, the record is permanently deleted from all active database clusters and rotating backup sets.</li>
          <li><strong>Account Closure:</strong> If you terminate your account, all associated credentials and personal records are permanently erased upon request.</li>
        </ul>
      </section>

      {/* 6. GDPR & CCPA */}
      <section className={styles.sectionBlock} id="gdpr-ccpa">
        <h2 className={styles.sectionHeading}>6. International Rights (GDPR &amp; CCPA)</h2>
        <p className={styles.paragraph}>
          Regardless of your jurisdiction, Optics affords all users standard privacy rights:
        </p>
        <ul className={styles.bulletList}>
          <li><strong>Right of Access &amp; Portability:</strong> You may request an export of all your workspace tasks and documents in structured JSON/Markdown.</li>
          <li><strong>Right to Rectification:</strong> You may correct inaccurate profile data at any time in Account Settings.</li>
          <li><strong>Right to Erasure:</strong> You may request complete account deletion by contacting legal@ivors.studio.</li>
        </ul>
      </section>

      {/* 7. Contact DPO */}
      <section className={styles.sectionBlock} id="contact-dpo">
        <h2 className={styles.sectionHeading}>7. Data Protection Office</h2>
        <p className={styles.paragraph}>
          If you have questions about this policy or wish to exercise your statutory privacy rights, contact our Data Protection Team at <strong>legal@ivors.studio</strong>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
