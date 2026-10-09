'use client';

import React, { useState } from 'react';
import LegalPageLayout from '@/components/legal/LegalPageLayout';
import styles from '@/components/legal/LegalPageLayout.module.css';
import { Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'support',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setFormSubmitted(true);
  };

  const toc = [
    { id: 'inquiry-form', label: '1. Send a Direct Message' },
    { id: 'departments', label: '2. Department Directory' },
    { id: 'enterprise-sales', label: '3. Enterprise Inquiries' },
    { id: 'headquarters', label: '4. Studio Locations' }
  ];

  return (
    <LegalPageLayout
      badge="DIRECT COMMUNICATION"
      kickerIndex="06"
      title="Contact the Optics Team"
      subtitle="Direct channels for engineering support, enterprise agreements, security disclosures, and general product questions."
      effectiveDate="October 2026"
      version="v2.1"
      toc={toc}
      activeNav="contact"
    >
      <div className={styles.calloutBox}>
        <strong>Rapid Response Commitment:</strong> We review all inbound communications within 4 business hours. Critical production incidents and security vulnerability reports are triaged immediately 24/7.
      </div>

      {/* 1. Interactive Form */}
      <section className={styles.sectionBlock} id="inquiry-form">
        <h2 className={styles.sectionHeading}>1. Send a Direct Message</h2>
        <p className={styles.paragraph}>
          Fill out the form below and the appropriate engineering or product lead will follow up directly:
        </p>

        {formSubmitted ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e7e2d8',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <CheckCircle2 className="w-8 h-8 text-stone-900" />
            <h3 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.25rem', color: '#18181b' }}>
              Message Dispatched Successfully
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#57534e', maxWidth: '28rem' }}>
              Thank you, <strong>{formData.name}</strong>. A confirmation has been routed to <strong>{formData.email}</strong>. Our team will review your message shortly.
            </p>
            <button
              type="button"
              onClick={() => {
                setFormSubmitted(false);
                setFormData({ name: '', email: '', department: 'support', message: '' });
              }}
              style={{
                marginTop: '1rem',
                background: '#18181b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1.25rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: '#ffffff',
            border: '1px solid #e7e2d8',
            borderRadius: '12px',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#57534e', fontFamily: 'var(--font-mono, monospace)' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mayank A."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    background: '#faf8f5',
                    border: '1px solid #e7e2d8',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.875rem',
                    color: '#18181b',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#57534e', fontFamily: 'var(--font-mono, monospace)' }}>
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    background: '#faf8f5',
                    border: '1px solid #e7e2d8',
                    borderRadius: '8px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.875rem',
                    color: '#18181b',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#57534e', fontFamily: 'var(--font-mono, monospace)' }}>
                Department / Inquiry Type
              </label>
              <select
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
                style={{
                  background: '#faf8f5',
                  border: '1px solid #e7e2d8',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.875rem',
                  color: '#18181b',
                  outline: 'none'
                }}
              >
                <option value="support">Technical Support &amp; Workspace Help</option>
                <option value="sales">Enterprise Inquiries &amp; Custom Contracts</option>
                <option value="security">Security &amp; Vulnerability Disclosure</option>
                <option value="billing">Billing &amp; Invoice Inquiries</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#57534e', fontFamily: 'var(--font-mono, monospace)' }}>
                Message *
              </label>
              <textarea
                required
                rows={4}
                placeholder="How can our engineering team assist you?"
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                style={{
                  background: '#faf8f5',
                  border: '1px solid #e7e2d8',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  fontSize: '0.875rem',
                  color: '#18181b',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#18181b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.65rem 1.35rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <span>Transmit Message</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </section>

      {/* 2. Department Directory */}
      <section className={styles.sectionBlock} id="departments">
        <h2 className={styles.sectionHeading}>2. Department Directory</h2>
        <div className={styles.cardsGrid}>
          <div className={styles.cardItem}>
            <span className={styles.cardItemTitle}>General Technical Support</span>
            <p className={styles.cardItemText}>
              For setup guidance, workspace troubleshooting, or bug reports:
            </p>
            <p className={styles.cardItemText}>
              <a href="mailto:support@ivors.studio" style={{ color: '#18181b', fontWeight: 600, textDecoration: 'underline' }}>
                support@ivors.studio
              </a>
              <br />
              <span style={{ fontSize: '0.75rem', color: '#78716c' }}>Target SLA: Under 4 business hours</span>
            </p>
          </div>

          <div className={styles.cardItem}>
            <span className={styles.cardItemTitle}>Enterprise Sales &amp; Licensing</span>
            <p className={styles.cardItemText}>
              For volume seat discounts, custom master service agreements (MSA), and SSO onboarding:
            </p>
            <p className={styles.cardItemText}>
              <a href="mailto:sales@ivors.studio" style={{ color: '#18181b', fontWeight: 600, textDecoration: 'underline' }}>
                sales@ivors.studio
              </a>
              <br />
              <span style={{ fontSize: '0.75rem', color: '#78716c' }}>Dedicated enterprise account manager</span>
            </p>
          </div>

          <div className={styles.cardItem}>
            <span className={styles.cardItemTitle}>Security &amp; Bug Bounty</span>
            <p className={styles.cardItemText}>
              For PGP-encrypted vulnerability reports and responsible disclosure:
            </p>
            <p className={styles.cardItemText}>
              <a href="mailto:security@ivors.studio" style={{ color: '#18181b', fontWeight: 600, textDecoration: 'underline' }}>
                security@ivors.studio
              </a>
              <br />
              <span style={{ fontSize: '0.75rem', color: '#78716c' }}>Monitored 24/7 with 1-hour triage target</span>
            </p>
          </div>

          <div className={styles.cardItem}>
            <span className={styles.cardItemTitle}>Legal &amp; Privacy Officer</span>
            <p className={styles.cardItemText}>
              For data protection questions, GDPR export inquiries, or formal agreements:
            </p>
            <p className={styles.cardItemText}>
              <a href="mailto:legal@ivors.studio" style={{ color: '#18181b', fontWeight: 600, textDecoration: 'underline' }}>
                legal@ivors.studio
              </a>
              <br />
              <span style={{ fontSize: '0.75rem', color: '#78716c' }}>Formal response within 2 business days</span>
            </p>
          </div>
        </div>
      </section>

      {/* 3. Enterprise Sales */}
      <section className={styles.sectionBlock} id="enterprise-sales">
        <h2 className={styles.sectionHeading}>3. Enterprise Inquiries &amp; Custom Contracts</h2>
        <p className={styles.paragraph}>
          We collaborate closely with high-growth engineering organizations requiring custom security terms, procurement workflows, or dedicated VPC deployments. Enterprise agreements include:
        </p>
        <ul className={styles.bulletList}>
          <li>Single Sign-On (SAML 2.0 / Okta / Azure AD) integration.</li>
          <li>Custom invoicing with net-30 / net-60 payment terms.</li>
          <li>Financially backed 99.99% service level agreements (SLA).</li>
          <li>Dedicated Slack Connect channel with Optics founding engineers.</li>
        </ul>
      </section>

      {/* 4. Headquarters */}
      <section className={styles.sectionBlock} id="headquarters">
        <h2 className={styles.sectionHeading}>4. Studio Locations &amp; Global Operations</h2>
        <p className={styles.paragraph}>
          Optics is engineered by Ivors Studio. We operate as a distributed product team with primary hubs in:
        </p>
        <div className={styles.cardsGrid}>
          <div className={styles.cardItem}>
            <span className={styles.cardItemTitle}>Engineering Studio</span>
            <p className={styles.cardItemText}>
              Bengaluru, Karnataka, India<br />
              Core frontend architecture, reactive SSE synchronization, and database performance engineering.
            </p>
          </div>
          <div className={styles.cardItem}>
            <span className={styles.cardItemTitle}>Global Operations</span>
            <p className={styles.cardItemText}>
              San Francisco, California, United States<br />
              Cloud infrastructure, security audits, and enterprise customer relationships.
            </p>
          </div>
        </div>
      </section>
    </LegalPageLayout>
  );
}
