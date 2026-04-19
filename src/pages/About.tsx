import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { useTheme } from '../theme'

export default function About() {
  const navigate = useNavigate()
  const { c } = useTheme()

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 32px 80px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.textDim, marginBottom: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>← BACK TO HOME</p>

        <p style={{ fontSize: '11px', letterSpacing: '.3em', color: c.orange, marginBottom: '20px' }}>OUR MISSION</p>
        <h1 style={{ fontSize: '3rem', fontWeight: 300, color: c.gold, marginBottom: '8px', letterSpacing: '.05em', lineHeight: 1.2 }}>Preserving stone.<br />Preserving history.</h1>
        <div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '24px 0', opacity: .5 }} />

        <p style={{ fontSize: '15px', color: c.textMuted, lineHeight: 1.9, marginBottom: '24px' }}>
          Shilalekh — from शिला (stone) and लेख (inscription) — is a global database dedicated to documenting, preserving and making accessible every stone inscription, copper plate, and epigraphic record ever created.
        </p>

        <p style={{ fontSize: '15px', color: c.textMuted, lineHeight: 1.9, marginBottom: '48px' }}>
          India alone is estimated to have over 3,00,000 inscriptions. The Archaeological Survey of India has formally documented approximately 1,00,000. Thousands more are being discovered — and thousands more are being lost to time, weather, and development. Shilalekh exists to change that.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '48px' }}>
          {[
            { title: 'For historians', desc: 'A searchable, filterable database of primary epigraphic sources — accessible anywhere in the world.' },
            { title: 'For contributors', desc: 'A platform for archaeologists, researchers and enthusiasts to document and share inscriptions they discover.' },
            { title: 'For institutions', desc: 'Bulk data access, API licensing, and collaborative tools for universities and museums.' },
            { title: 'For everyone', desc: 'A free map of human history — every inscription visible, every story accessible.' },
          ].map((item, i) => (
            <div key={i} style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '20px' }}>
              <p style={{ fontSize: '12px', color: c.gold, letterSpacing: '.1em', marginBottom: '8px' }}>{item.title.toUpperCase()}</p>
              <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ borderTop: `0.5px solid ${c.borderLight}`, paddingTop: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '.2em', color: c.orange, marginBottom: '16px' }}>THE PROJECT</p>
          <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.8, marginBottom: '16px' }}>Shilalekh was founded with a simple belief — that every inscription, however small, however weathered, however obscure, is a piece of history that deserves to be recorded.</p>
          <p style={{ fontSize: '13px', color: c.textDim, lineHeight: 1.8 }}>We are building the world's most comprehensive, open, and accessible epigraphic database — one inscription at a time.</p>
        </div>

        <div style={{ marginTop: '48px', background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: c.gold, marginBottom: '8px', letterSpacing: '.05em' }}>Want to contribute?</p>
          <p style={{ fontSize: '13px', color: c.textMuted, marginBottom: '20px' }}>Join our community of historians, archaeologists and heritage enthusiasts.</p>
          <button onClick={() => navigate('/')} style={{ background: c.gold, border: 'none', color: '#0a0a0a', padding: '10px 28px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer', fontWeight: 600 }}>GET STARTED</button>
        </div>

      </div>

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