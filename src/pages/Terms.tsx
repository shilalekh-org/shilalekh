import { useNavigate } from 'react-router-dom'
import { useTheme } from '../theme'
import Nav from '../components/Nav'

export default function Terms() {
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
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '100px 32px 80px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '8px', fontFamily: 'Arial, sans-serif' }}>LEGAL</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: c.gold, marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ fontSize: '12px', color: c.textDim, marginBottom: '48px', fontFamily: 'Arial, sans-serif' }}>
          Last updated: May 2026
        </p>

        <div style={sectionStyle}>
          <p style={pStyle}>
            These Terms of Service govern your use of Shilalekh, the global epigraphic
            database accessible at shilalekh.org ("the Service"). By creating an account
            or using the Service, you agree to these terms. If you do not agree, please
            do not use the Service.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>1. About Shilalekh</h2>
          <p style={pStyle}>
            Shilalekh is a publicly accessible archive of verified stone inscriptions and
            epigraphic records. Our mission is to create a credible, comprehensive, and
            freely accessible repository of epigraphic data for scholars, researchers,
            students, and the general public.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>2. Accounts</h2>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li style={liStyle}>You must provide accurate information when creating an account</li>
            <li style={liStyle}>You are responsible for maintaining the security of your account credentials</li>
            <li style={liStyle}>You must notify us immediately at <a href="mailto:hello@shilalekh.org" style={{ color: c.gold }}>hello@shilalekh.org</a> if you suspect unauthorised access</li>
            <li style={liStyle}>One person may not maintain multiple accounts</li>
            <li style={liStyle}>Accounts are personal and may not be transferred</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>3. Contributing inscription data</h2>
          <p style={pStyle}>
            Shilalekh accepts inscription submissions from registered users. By submitting
            an entry, you confirm that:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li style={liStyle}>The information is accurate to the best of your knowledge</li>
            <li style={liStyle}>The data is sourced from verifiable records such as ASI publications, state archaeology department records, peer-reviewed research, or direct field observation</li>
            <li style={liStyle}>You have the right to submit any photographs or documents included</li>
            <li style={liStyle}>You are not submitting AI-generated, fabricated, or unverified data</li>
          </ul>
          <p style={pStyle}>
            All submissions are reviewed by our editorial team before publication. We
            reserve the right to reject, edit, or remove any submission that does not
            meet our standards, without obligation to provide detailed reasons.
          </p>
          <p style={pStyle}>
            By submitting content, you grant Shilalekh a perpetual, royalty-free licence
            to publish, display, and archive that content as part of the database. You
            retain any intellectual property rights you hold in your original work.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>4. Acceptable use</h2>
          <p style={pStyle}>You agree not to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li style={liStyle}>Submit false, misleading, or fabricated inscription data</li>
            <li style={liStyle}>Use the Service for any unlawful purpose</li>
            <li style={liStyle}>Attempt to gain unauthorised access to any part of the Service</li>
            <li style={liStyle}>Scrape, copy, or reproduce the database in bulk without written permission</li>
            <li style={liStyle}>Impersonate any person or organisation</li>
            <li style={liStyle}>Upload malicious files or code</li>
            <li style={liStyle}>Harass, abuse, or threaten other users or our team</li>
          </ul>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>5. Intellectual property</h2>
          <p style={pStyle}>
            The Shilalekh name, logo, design, and software are the property of Shilalekh.
            The epigraphic data in our database is made available for research and educational
            use. You may reference, cite, and use individual entries for non-commercial
            research purposes with appropriate attribution to Shilalekh.
          </p>
          <p style={pStyle}>
            Bulk reproduction, resale, or commercial use of the database requires written
            permission. Contact us at{' '}
            <a href="mailto:hello@shilalekh.org" style={{ color: c.gold }}>hello@shilalekh.org</a>.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>6. Data accuracy</h2>
          <p style={pStyle}>
            While we take considerable care to verify all entries, Shilalekh does not
            warrant that the information in the database is complete, accurate, or
            up to date. Epigraphic research is an evolving field and interpretations
            may change. We encourage users to consult primary sources for academic
            or professional purposes.
          </p>
          <p style={pStyle}>
            If you identify an error in any entry, please use the suggest-edit feature
            or contact us at{' '}
            <a href="mailto:hello@shilalekh.org" style={{ color: c.gold }}>hello@shilalekh.org</a>.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>7. Availability</h2>
          <p style={pStyle}>
            We aim to keep Shilalekh available at all times but do not guarantee
            uninterrupted access. We may carry out maintenance, updates, or experience
            technical issues that cause temporary unavailability. We will communicate
            planned downtime where possible.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>8. Termination</h2>
          <p style={pStyle}>
            We reserve the right to suspend or terminate any account that violates
            these terms, submits fraudulent data, or engages in behaviour harmful
            to the Service or its users. You may delete your own account at any
            time from your profile settings.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>9. Limitation of liability</h2>
          <p style={pStyle}>
            To the fullest extent permitted by law, Shilalekh shall not be liable
            for any indirect, incidental, or consequential damages arising from
            your use of the Service or reliance on information within the database.
            Our total liability shall not exceed the amount you have paid us in
            the twelve months preceding the claim (which for free users is zero).
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>10. Governing law</h2>
          <p style={pStyle}>
            These terms are governed by the laws of England and Wales. Any disputes
            shall be subject to the exclusive jurisdiction of the courts of England
            and Wales.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>11. Changes to these terms</h2>
          <p style={pStyle}>
            We may update these terms from time to time. Continued use of the Service
            after changes are posted constitutes acceptance of the updated terms.
            We will notify registered users of significant changes by email.
          </p>
        </div>

        <div style={sectionStyle}>
          <h2 style={h2Style}>12. Contact</h2>
          <p style={pStyle}>
            For any questions about these terms, contact us at{' '}
            <a href="mailto:hello@shilalekh.org" style={{ color: c.gold }}>hello@shilalekh.org</a>.
          </p>
        </div>

        <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <span
            onClick={() => navigate('/privacy')}
            style={{ fontSize: '12px', color: c.gold, cursor: 'pointer', letterSpacing: '.05em' }}
          >
            Privacy Policy →
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