import React from 'react';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import styles from '@/components/legal/LegalPageLayout.module.css';

export const metadata = {
  title: 'Security Architecture & Practices — Optics by Ivors',
  description: 'Technical whitepaper detailing the encryption, tenant isolation, and cryptographic boundaries of Optics.'
};

export default function SecurityPage() {
  const toc = [
    { id: 'crypto-standards', label: '1. Cryptographic Standards' },
    { id: 'tenant-isolation', label: '2. Multi-Tenant Isolation' },
    { id: 'auth-rbac', label: '3. Authentication & RBAC' },
    { id: 'infrastructure', label: '4. Cloud & Network Security' },
    { id: 'data-resilience', label: '5. Resilience & Disaster Recovery' },
    { id: 'vulnerability-reporting', label: '6. Vulnerability Disclosure' }
  ];

  return (
    <LegalPageLayout
      badge="INFRASTRUCTURE &amp; SECURITY"
      kickerIndex="04"
      title="Security Architecture &amp; Safeguards"
      subtitle="A detailed technical overview of how Optics safeguards your codebase references, sprint tasks, and team specifications."
      effectiveDate="October 2026"
      version="v2.3"
      toc={toc}
      activeNav="security"
    >
      <div className={styles.calloutBox}>
        <strong>Zero-Trust Engineering:</strong> At Optics, security is built into our core schemas and query middleware. We treat all client requests as untrusted, enforcing strict tenant scoping and cryptographic validation before any operation touches our database.
      </div>

      {/* 1. Cryptographic Standards */}
      <section className={styles.sectionBlock} id="crypto-standards">
        <h2 className={styles.sectionHeading}>1. Cryptographic Standards</h2>
        <p className={styles.paragraph}>
          We deploy battle-tested cryptographic primitives across all transmission and persistent storage layers:
        </p>

        <div className={styles.matrixTableWrapper}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th>Boundary</th>
                <th>Standard</th>
                <th>Implementation Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Transport Encryption</strong></td>
                <td>TLS 1.3 / HSTS</td>
                <td>Mandatory HTTPS with PFS (Perfect Forward Secrecy) on all endpoints</td>
              </tr>
              <tr>
                <td><strong>Storage at Rest</strong></td>
                <td>AES-256-GCM</td>
                <td>Database block devices and object storage encrypted with rotating KMS keys</td>
              </tr>
              <tr>
                <td><strong>Password Storage</strong></td>
                <td>Salted Bcrypt</td>
                <td>High work factor (cost 12), salted uniquely per account record</td>
              </tr>
              <tr>
                <td><strong>Session Validation</strong></td>
                <td>Stateless JWT</td>
                <td>RS256 cryptographically signed tokens with strict 24-hour expiration</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Tenant Isolation */}
      <section className={styles.sectionBlock} id="tenant-isolation">
        <h2 className={styles.sectionHeading}>2. Multi-Tenant Isolation Guarantees</h2>
        <p className={styles.paragraph}>
          Every database record in Optics contains an immutable <code>workspaceId</code> foreign key. Our Prisma/PostgreSQL query middleware automatically injects workspace tenant filters on every query:
        </p>

        <div className={styles.codeBox}>
          <div className={styles.codeBoxHeader}>
            <span>Prisma Middleware · Automatic Tenant Scoping</span>
            <span>typescript</span>
          </div>
          <pre className={styles.codeBoxBody}>
{`// middleware/tenantIsolation.ts
prisma.$use(async (params, next) => {
  if (['Task', 'Document', 'Member', 'Sprint'].includes(params.model)) {
    // Enforce that all queries include the authenticated workspaceId
    params.args.where = {
      ...params.args.where,
      workspaceId: currentRequestContext.workspaceId
    };
  }
  return next(params);
});`}
          </pre>
        </div>
        <p className={styles.paragraph}>
          This architectural barrier guarantees that even in the event of an edge-case query vulnerability, data cannot leak across tenant boundaries.
        </p>
      </section>

      {/* 3. Auth & RBAC */}
      <section className={styles.sectionBlock} id="auth-rbac">
        <h2 className={styles.sectionHeading}>3. Authentication &amp; Deterministic RBAC</h2>
        <p className={styles.paragraph}>
          Role assignments (Owner, Lead, Member, Guest) are evaluated deterministically at both the API router and database query boundaries.
        </p>
        <ul className={styles.bulletList}>
          <li><strong>Zero Client Trust:</strong> Client-side permission flags are purely cosmetic. Every API mutation independently re-evaluates the user&apos;s active role from database state.</li>
          <li><strong>Session Invalidation:</strong> Changing a user&apos;s role immediately invalidates their active permission tokens, requiring zero delay for security propagation.</li>
        </ul>
      </section>

      {/* 4. Infrastructure & Network */}
      <section className={styles.sectionBlock} id="infrastructure">
        <h2 className={styles.sectionHeading}>4. Cloud &amp; Network Infrastructure</h2>
        <p className={styles.paragraph}>
          Optics services are hosted within isolated Virtual Private Clouds (VPC) with no public database exposure:
        </p>
        <div className={styles.cardsGrid}>
          <div className={styles.cardItem}>
            <span className={styles.cardItemTitle}>Private Subnet Isolation</span>
            <p className={styles.cardItemText}>
              Database clusters, Redis caches, and internal microservices run exclusively within private VPC subnets accessible only via internal load balancers.
            </p>
          </div>
          <div className={styles.cardItem}>
            <span className={styles.cardItemTitle}>Automated CI Vulnerability Audits</span>
            <p className={styles.cardItemText}>
              Every pull request undergoes automated static analysis (SAST), container image scanning, and automated dependency audit scans before deployment.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Resilience */}
      <section className={styles.sectionBlock} id="data-resilience">
        <h2 className={styles.sectionHeading}>5. Resilience &amp; Disaster Recovery</h2>
        <p className={styles.paragraph}>
          We guarantee data durability through automated continuous replication:
        </p>
        <ul className={styles.bulletList}>
          <li><strong>Point-in-Time Recovery (PITR):</strong> Write-Ahead Logs (WAL) are shipped continuously, allowing restoration to any second in the preceding 14 days.</li>
          <li><strong>Multi-AZ Redundancy:</strong> Primary databases feature hot standby replicas in independent availability zones with automated failover in under 30 seconds.</li>
        </ul>
      </section>

      {/* 6. Vulnerability Reporting */}
      <section className={styles.sectionBlock} id="vulnerability-reporting">
        <h2 className={styles.sectionHeading}>6. Vulnerability Disclosure &amp; Safe Harbor</h2>
        <p className={styles.paragraph}>
          We welcome responsible security research. If you discover a vulnerability in Optics, email <strong>security@ivors.studio</strong> with reproduction steps.
        </p>
        <p className={styles.paragraph}>
          We commit to acknowledging all submissions within 24 hours and will not pursue legal action against researchers acting in good faith under our Safe Harbor guidelines.
        </p>
      </section>
    </LegalPageLayout>
  );
}
