import { useNavigate } from 'react-router-dom'
import { useTheme } from '../theme'
import Nav from '../components/Nav'

export default function Privacy() {
  const navigate = useNavigate()
  const { c } = useTheme()

  const sectionStyle = {
    marginBottom: '36px',
  }

  const h2Style = {
    fontSize: '15px',
    fontWeight: 500,
    color: c.text,
    marginBottom: '12px',
    letterSpacing: '.03em',
  }

  const pStyle = {
    fontSize: '14px',
    color: c.textDim,
    lineHeight: 1.8,
    marginBottom: '12px',
  }

  const liStyle = {
    fontSize: '14px',
    color: c.textDim,
    lineHeight: 1.8,
    marginBottom: '6px',
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ paddingTop: '80px', paddingBottom: '80px', maxWidth: '720px', margin: '0 auto', padding: '100px 32px 80px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>LEGAL</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: c.gold, marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ fontSize: '12px', color: c.textDim, marginBottom: '48px', fontFamily: 'Arial, sans-serif' }}>
          Last updated: May 2026
        </p>

        <div style={sectionStyle}>
          <p style={pStyle}>
            This Privacy Policy explains how Shilalekh ("we", "us", "our"), operated at shilalekh.org,
            collects, uses, and protects your personal data when you use our website. Shilalekh is
            operated from the United Kingdom and complies with the UK General Data Protection
            Regulation (UK GDPR) and the Data Protection Act 2018. Where applicable, we also
            comply with India's Digital Personal Data Protection Act 2023 (DPDPA).
          </p>
          <p style={pStyle}>
            By using Shilalekh, you agree to the collection and use of information as described in
            this policy. If you do not agree, please do not use our services.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>1. Who we are</h2>
          <p style={pStyle}>
            Shilalekh is a global database of stone inscriptions and epigraphic records, accessible
            at shilalekh.org. For data protection purposes, Shilalekh is the data controller.
            You can contact us at{' '}
            <a href="mailto:hello@shilalekh.org" style={{ color: c.gold }}>hello@shilalekh.org</a>.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>2. What data we collect</h2>
          <p style={pStyle}>When you create an account, we collect:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li style={liStyle}>Full name</li>
            <li style={liStyle}>Email address</li>
            <li style={liStyle}>Phone number (optional)</li>
            <li style={liStyle}>Institution or affiliation (optional)</li>
            <li style={liStyle}>Role or interest (optional)</li>
            <li style={liStyle}>Country (optional)</li>
            <li style={liStyle}>Password (stored in encrypted form — we cannot see it)</li>
            <li style={liStyle}>Profile photograph (optional, if uploaded)</li>
          </ul>
          <p style={pStyle}>When you use the site, we may also collect:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li style={liStyle}>Inscription submissions and their content</li>
            <li style={liStyle}>Correction suggestions and associated justifications</li>
            <li style={liStyle}>Communications sent to us via email</li>
            <li style={liStyle}>Technical data such as browser type, device type, and IP address via server logs</li>
          </ul>
          <p style={pStyle}>
            If you sign in with Google, we receive your name, email address, and profile photo
            from Google in accordance with their privacy policy.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>3. How we use your data</h2>
          <p style={pStyle}>We use your personal data to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li style={liStyle}>Create and manage your account</li>
            <li style={liStyle}>Process and review inscription submissions</li>
            <li style={liStyle}>Send account-related emails (confirmation, password reset, security alerts)</li>
            <li style={liStyle}>Send a welcome email when you join</li>
            <li style={liStyle}>Send occasional updates about new inscriptions and features, if you have opted in</li>
            <li style={liStyle}>Respond to your enquiries</li>
            <li style={liStyle}>Maintain the security and integrity of the platform</li>
          </ul>
          <p style={pStyle}>
            We do not sell your personal data to third parties. We do not use your data for
            advertising purposes. Shilalekh does not display advertisements.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>4. Legal basis for processing (UK GDPR)</h2>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li style={liStyle}><strong style={{ color: c.text }}>Contract</strong> — processing necessary to provide you with a Shilalekh account and its services</li>
            <li style={liStyle}><strong style={{ color: c.text }}>Consent</strong> — for optional marketing emails, which you may withdraw at any time</li>
            <li style={liStyle}><strong style={{ color: c.text }}>Legitimate interests</strong> — for security monitoring and preventing fraud or abuse</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>5. Where your data is stored</h2>
          <p style={pStyle}>
            Your data is stored on servers operated by Supabase, located in Mumbai, India.
            Supabase is our database and authentication provider. By using Shilalekh, you
            acknowledge that your data will be transferred to and stored in India.
          </p>
          <p style={pStyle}>
            We have ensured that appropriate safeguards are in place for this international
            transfer in accordance with UK GDPR requirements. Transactional emails are sent
            via Resend, whose infrastructure operates in the EU and US.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>6. Cookies</h2>
          <p style={pStyle}>
            Shilalekh uses only essential cookies necessary for the site to function:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li style={liStyle}><strong style={{ color: c.text }}>Authentication cookies</strong> — keep you signed in to your account (Supabase)</li>
            <li style={liStyle}><strong style={{ color: c.text }}>Theme preference</strong> — remembers your dark or light mode choice (stored locally in your browser)</li>
          </ul>
          <p style={pStyle}>
            We do not use advertising cookies, tracking cookies, or any third-party analytics
            cookies at this time. If this changes, we will update this policy and request
            your consent.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>7. How long we keep your data</h2>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li style={liStyle}>Account data is retained for as long as your account is active</li>
            <li style={liStyle}>If you delete your account, your personal data is deleted within 30 days</li>
            <li style={liStyle}>Inscription submissions attributed to your account may be retained in anonymised form for the integrity of the archive</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>8. Your rights</h2>
          <p style={pStyle}>Under UK GDPR, you have the right to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li style={liStyle}><strong style={{ color: c.text }}>Access</strong> — request a copy of the personal data we hold about you</li>
            <li style={liStyle}><strong style={{ color: c.text }}>Rectification</strong> — ask us to correct inaccurate data</li>
            <li style={liStyle}><strong style={{ color: c.text }}>Erasure</strong> — request deletion of your personal data</li>
            <li style={liStyle}><strong style={{ color: c.text }}>Restriction</strong> — ask us to limit how we use your data</li>
            <li style={liStyle}><strong style={{ color: c.text }}>Portability</strong> — receive your data in a structured, machine-readable format</li>
            <li style={liStyle}><strong style={{ color: c.text }}>Objection</strong> — object to processing based on legitimate interests</li>
            <li style={liStyle}><strong style={{ color: c.text }}>Withdraw consent</strong> — unsubscribe from marketing emails at any time</li>
          </ul>
          <p style={pStyle}>
            To exercise any of these rights, contact us at{' '}
            <a href="mailto:hello@shilalekh.org" style={{ color: c.gold }}>hello@shilalekh.org</a>.
            We will respond within 30 days. You also have the right to lodge a complaint with
            the UK Information Commissioner's Office (ICO) at ico.org.uk.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>9. Data security</h2>
          <p style={pStyle}>
            We take reasonable technical and organisational measures to protect your data,
            including encrypted password storage, row-level security on our database, and
            HTTPS encryption on all connections. No system is completely secure, and we
            cannot guarantee absolute security, but we take our responsibilities seriously.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>10. Children</h2>
          <p style={pStyle}>
            Shilalekh is not directed at children under the age of 13. We do not knowingly
            collect personal data from children. If you believe a child has provided us with
            personal data, please contact us and we will delete it promptly.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>11. Changes to this policy</h2>
          <p style={pStyle}>
            We may update this policy from time to time. When we do, we will update the
            "last updated" date at the top of this page. Significant changes will be
            communicated to registered users by email.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>12. Contact</h2>
          <p style={pStyle}>
            For any privacy-related questions or requests, please contact us at{' '}
            <a href="mailto:hello@shilalekh.org" style={{ color: c.gold }}>hello@shilalekh.org</a>.
          </p>
        </div>

        <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <span
            onClick={() => navigate('/terms')}
            style={{ fontSize: '12px', color: c.gold, cursor: 'pointer', letterSpacing: '.05em' }}
          >
            Terms of Service →
          </span>
          <span
            onClick={() => navigate('/')}
            style={{ fontSize: '12px', color: c.textDim, cursor: 'pointer', letterSpacing: '.05em' }}
          >
            ← Back to Shilalekh
          </span>
        </div>

      </div>
    </div>
  )
}