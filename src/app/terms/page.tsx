import React from 'react';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import styles from '@/components/legal/LegalPageLayout.module.css';

export const metadata = {
  title: 'Terms of Service — Optics by Ivors',
  description: 'Understand the standard terms and conditions governing the Optics workspace platform.'
};

export default function TermsPage() {
  const toc = [
    { id: 'acceptance', label: '1. Acceptance of Terms' },
    { id: 'workspace-account', label: '2. Accounts & Workspaces' },
    { id: 'acceptable-use', label: '3. Acceptable Use Policy' },
    { id: 'ip-ownership', label: '4. Intellectual Property' },
    { id: 'billing-refunds', label: '5. Subscriptions & Billing' },
    { id: 'warranty-liability', label: '6. Limitation of Liability' },
    { id: 'governing-law', label: '7. Governing Law & Dispute' }
  ];

  return (
    <LegalPageLayout
      badge="LEGAL &amp; AGREEMENTS"
      kickerIndex="03"
      title="Optics Terms of Service"
      subtitle="The contractual terms governing your use of Optics sprint boards, Markdown wikis, and cloud synchronization services."
      effectiveDate="October 2026"
      version="v2.0"
      toc={toc}
      activeNav="terms"
    >
      <div className={styles.calloutBox}>
        <strong>Summary of Key Terms:</strong> You own 100% of the content and code you upload to Optics. We guarantee enterprise encryption and data confidentiality. You agree not to abuse or attempt to reverse-engineer our services.
      </div>

      {/* 1. Acceptance */}
      <section className={styles.sectionBlock} id="acceptance">
        <h2 className={styles.sectionHeading}>1. Acceptance of Terms</h2>
        <p className={styles.paragraph}>
          By registering for an Optics account, creating a workspace, or using any associated APIs, you agree to be bound by these Terms of Service and our Privacy Policy. If you are entering into this agreement on behalf of a company, you represent that you possess the legal authority to bind that entity.
        </p>
      </section>

      {/* 2. Accounts */}
      <section className={styles.sectionBlock} id="workspace-account">
        <h2 className={styles.sectionHeading}>2. Accounts &amp; Workspace Responsibilities</h2>
        <p className={styles.paragraph}>
          You are responsible for safeguarding your login credentials and ensuring that all members invited to your workspace adhere to these terms.
        </p>
        <ul className={styles.bulletList}>
          <li><strong>Accurate Registration:</strong> You agree to provide a valid, verifiable corporate or personal email address.</li>
          <li><strong>Credential Security:</strong> You are responsible for maintaining strong passwords and notifying Optics immediately of unauthorized access.</li>
          <li><strong>Workspace Ownership:</strong> The primary creator of a workspace is designated the Workspace Owner and retains full administrative authority.</li>
        </ul>
      </section>

      {/* 3. Acceptable Use */}
      <section className={styles.sectionBlock} id="acceptable-use">
        <h2 className={styles.sectionHeading}>3. Acceptable Use Policy</h2>
        <p className={styles.paragraph}>
          You agree not to misuse the Optics platform or assist others in doing so. Prohibited behaviors include:
        </p>
        <ul className={styles.bulletList}>
          <li>Attempting to probe, scan, or breach our security controls or network infrastructure without prior authorization.</li>
          <li>Reverse-engineering, decompiling, or attempting to extract proprietary algorithms from Optics client or server binaries.</li>
          <li>Automating abusive request volumes exceeding published rate limits or degrading service for other tenants.</li>
          <li>Storing or distributing malicious code, malware, or unlawful materials.</li>
        </ul>
      </section>

      {/* 4. IP Ownership */}
      <section className={styles.sectionBlock} id="ip-ownership">
        <h2 className={styles.sectionHeading}>4. Intellectual Property &amp; Content Ownership</h2>
        <p className={styles.paragraph}>
          <strong>Your Content:</strong> You retain complete ownership and all intellectual property rights to the project documentation, sprint tasks, code snippets, and attachments you upload to Optics. We claim zero ownership or commercial license over your team&apos;s data.
        </p>
        <p className={styles.paragraph}>
          <strong>Optics IP:</strong> Optics, its logos, user interface designs, software engines, and brand assets are the exclusive property of Ivors Studio and protected by international copyright laws.
        </p>
      </section>

      {/* 5. Subscriptions */}
      <section className={styles.sectionBlock} id="billing-refunds">
        <h2 className={styles.sectionHeading}>5. Subscriptions, Fees &amp; Cancellations</h2>
        <p className={styles.paragraph}>
          Paid subscription plans are billed in advance on a recurring monthly or annual schedule.
        </p>
        <ul className={styles.bulletList}>
          <li><strong>Starter Tier:</strong> Free for up to 3 team members with unlimited sprint tasks.</li>
          <li><strong>Pro Tier:</strong> Billed per active seat. You may add or remove seats at any time, with prorated adjustments applied to your subsequent billing invoice.</li>
          <li><strong>Cancellation:</strong> You may cancel your subscription at any time via Workspace Settings &rarr; Billing. Your workspace will remain active until the end of the paid billing cycle.</li>
        </ul>
      </section>

      {/* 6. Liability */}
      <section className={styles.sectionBlock} id="warranty-liability">
        <h2 className={styles.sectionHeading}>6. Warranties &amp; Limitation of Liability</h2>
        <p className={styles.paragraph}>
          Optics is provided &quot;as is&quot; and &quot;as available&quot;. While we maintain 99.98% availability targets and multi-region backups, we do not warrant that service will be completely uninterrupted or error-free.
        </p>
        <p className={styles.paragraph}>
          To the maximum extent permitted by law, Optics shall not be liable for any indirect, incidental, special, or consequential damages resulting from lost profits, data loss, or business interruption.
        </p>
      </section>

      {/* 7. Governing Law */}
      <section className={styles.sectionBlock} id="governing-law">
        <h2 className={styles.sectionHeading}>7. Governing Law &amp; Dispute Resolution</h2>
        <p className={styles.paragraph}>
          These Terms of Service are governed by the laws of India and applicable international software treaties. Any dispute arising under these terms shall be resolved through confidential arbitration prior to filing in courts of competent jurisdiction.
        </p>
      </section>
    </LegalPageLayout>
  );
}
