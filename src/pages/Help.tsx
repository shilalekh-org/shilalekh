import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { useTheme } from '../theme'

const FAQS = [
  {
    q: 'What is Shilalekh?',
    a: 'Shilalekh is a global database of stone inscriptions and epigraphic records. Our mission is to preserve and make accessible the world\'s inscribed heritage — from Ashokan rock edicts to medieval temple dedications to colonial-era memorials. Every entry is verified against authoritative sources before going live.',
  },
  {
    q: 'Who can contribute inscriptions?',
    a: 'Anyone with knowledge of inscriptions can submit an entry — researchers, academics, students, heritage professionals, and enthusiasts alike. All submissions are reviewed by our team before appearing in the public database. Creating a free account is required to submit.',
  },
  {
    q: 'How do I submit an inscription?',
    a: 'Sign in or create a free account, then go to the Contribute page. Fill in as much detail as you can — Title, Type, and Country are the only required fields, but the more you add, the more valuable the record. Your submission will be reviewed and you will be notified by email once a decision is made.',
  },
  {
    q: 'How long does review take?',
    a: 'We aim to review all submissions within 7–14 days. You will receive an email when a decision is made — whether approved, rejected with a reason, or if we need more information from you.',
  },
  {
    q: 'Can I suggest a correction to an existing entry?',
    a: 'Yes. On any inscription detail page, logged-in users can click "Suggest a correction". You will need to specify which field needs correcting, provide the corrected value, and include a justification or source. All correction suggestions go to our team for review.',
  },
  {
    q: 'What sources are accepted as evidence?',
    a: 'We accept entries supported by ASI records, state archaeology department publications, peer-reviewed academic papers, and museum accession records. AI-generated content is not accepted. Shilalekh\'s credibility rests entirely on the quality of its sources.',
  },
  {
    q: 'Is Shilalekh free to use?',
    a: 'Yes. Browsing and searching the database is completely free with no account required. Contributing requires a free account so we can contact you about your submissions.',
  },
]

const ARTICLES = [
  {
    title: 'How to write a good submission',
    body: 'The most valuable entries on Shilalekh are those with rich detail. Beyond the required fields, try to include the inscription\'s historical context, the dynasty or ruler it relates to, the language and script, and an English translation if available. Citing your source — even just a book title or ASI report number — significantly increases the chance of approval.',
  },
  {
    title: 'How to find GPS coordinates for a site',
    body: 'Open Google Maps on your phone or desktop. Navigate to the inscription\'s location. On desktop, right-click the exact spot and the coordinates appear at the top of the menu — click them to copy. On mobile, tap and hold to drop a pin, then read the coordinates shown at the bottom of the screen. Paste them into the Latitude and Longitude fields on the submission form.',
  },
  {
    title: 'Understanding inscription types',
    body: 'Rock Edicts are proclamations carved directly into natural rock faces, most famously by Emperor Ashoka. Cave inscriptions appear on the walls of rock-cut shrines and monasteries. Copper Plates are royal grants or charters inscribed on metal rather than stone. Temple inscriptions record dedications, donations, or royal patronage. Commemorative inscriptions mark victories or significant events. If you are unsure, choose "Other" and describe the type in the short description field.',
  },
  {
    title: 'What makes a submission get approved',
    body: 'Approved entries typically have a clear and accurate title, a verifiable source, correct geographical information, and at least a short description explaining what the inscription is and why it matters. Submissions that are vague, unsourced, or appear to be copied from unverified online sources are more likely to be returned for more information. If your submission is rejected, the rejection email will explain why and you are welcome to revise and resubmit.',
  },
]

export default function Help() {
  const navigate = useNavigate()
  const { c } = useTheme()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i)

  const sectionHeadStyle = {
    fontSize: '10px',
    letterSpacing: '.2em',
    color: c.orange,
    fontFamily: 'Arial, sans-serif',
    marginBottom: '8px',
  }

  // Last FAQ rendered separately to support the Privacy Policy link
  const lastFaq = {
    q: 'How is my personal data handled?',
    a: (
      <>
        Your data is stored securely on servers in India. We collect only what is necessary — your name, email, and optional profile details. We do not sell your data to third parties. See our{' '}
        <span
          onClick={() => navigate('/privacy')}
          style={{ color: c.gold, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Privacy Policy
        </span>
        {' '}for full details.
      </>
    ),
  }

  const allFaqs = [...FAQS, lastFaq]

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '100px 32px 80px' }}>

        {/* Header */}
        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.textDim, marginBottom: '8px', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }} onClick={() => navigate('/')}>← BACK TO HOME</p>
        <p style={sectionHeadStyle}>SUPPORT</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: c.gold, marginBottom: '8px', letterSpacing: '.05em' }}>Help Centre</h1>
        <div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '20px 0', opacity: .5 }} />
        <p style={{ fontSize: '14px', color: c.textMuted, lineHeight: 1.8, marginBottom: '48px' }}>
          Answers to common questions, guides for contributors, and ways to get in touch.
        </p>

        {/* FAQ Section */}
        <p style={sectionHeadStyle}>FREQUENTLY ASKED QUESTIONS</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '24px' }}>Common questions</h2>

        <div style={{ marginBottom: '56px' }}>
          {allFaqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: `0.5px solid ${c.borderLight}` }}>
              <div
                onClick={() => toggleFaq(i)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', cursor: 'pointer', gap: '16px' }}
              >
                <p style={{ fontSize: '14px', color: openFaq === i ? c.gold : c.text, lineHeight: 1.5, margin: 0, transition: 'color 0.2s' }}>
                  {faq.q}
                </p>
                <span style={{ color: c.gold, fontSize: '18px', flexShrink: 0, lineHeight: 1, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}>+</span>
              </div>
              {openFaq === i && (
                <div style={{ paddingBottom: '20px' }}>
                  <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.9, margin: 0 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Knowledge Articles */}
        <p style={sectionHeadStyle}>KNOWLEDGE ARTICLES</p>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '24px' }}>Guides for contributors</h2>

        <div style={{ marginBottom: '56px' }}>
          {ARTICLES.map((article, i) => (
            <div key={i} style={{ borderLeft: `1.5px solid ${c.gold}`, paddingLeft: '24px', marginBottom: '36px', opacity: 0.9 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 400, color: c.gold, marginBottom: '10px', letterSpacing: '.02em' }}>{article.title}</h3>
              <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.9, margin: 0 }}>{article.body}</p>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '40px' }}>
          <p style={sectionHeadStyle}>CONTACT</p>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: c.text, marginBottom: '16px' }}>Still need help?</h2>
          <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.9, marginBottom: '28px' }}>
            If you couldn't find what you were looking for, our team is happy to help. We typically respond within 2 business days.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="mailto:hello@shilalekh.org" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: `0.5px solid ${c.gold}`, borderRadius: '4px', padding: '12px 20px', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M2 7l10 7 10-7"/>
              </svg>
              <span style={{ fontSize: '12px', color: c.gold, letterSpacing: '.05em' }}>hello@shilalekh.org</span>
            </a>
            <a href="mailto:help@shilalekh.org" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: `0.5px solid ${c.borderLight}`, borderRadius: '4px', padding: '12px 20px', textDecoration: 'none' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              <span style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.05em' }}>help@shilalekh.org</span>
            </a>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div style={{ borderTop: `0.5px solid ${c.borderLight}`, padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px', color: c.gold, fontFamily: 'Georgia, serif' }}>शिलालेख</span>
          <span style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.15em' }}>SHILALEKH</span>
        </div>
        <p style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.05em', fontFamily: 'Georgia, serif' }}>यावच्चन्द्रदिवाकरौ</p>
        <p style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.08em' }}>© 2026 SHILALEKH.ORG</p>
      </div>
    </div>
  )
}