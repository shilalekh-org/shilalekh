import { useNavigate } from 'react-router-dom'

export default function About() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e4d9', fontFamily: 'Georgia, serif' }}>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.95)', borderBottom: '0.5px solid #2a2a2a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span style={{ fontSize: '20px', color: '#d4a843', letterSpacing: '.05em' }}>शिलालेख</span>
          <span style={{ fontSize: '11px', color: '#555250', letterSpacing: '.2em' }}>SHILALEKH</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="#" style={{ fontSize: '12px', color: '#888780', letterSpacing: '.1em', textDecoration: 'none' }}>EXPLORE</a>
          <a href="#" style={{ fontSize: '12px', color: '#888780', letterSpacing: '.1em', textDecoration: 'none' }}>INSCRIPTIONS</a>
          <a href="#" style={{ fontSize: '12px', color: '#888780', letterSpacing: '.1em', textDecoration: 'none' }}>CONTRIBUTE</a>
          <span style={{ fontSize: '12px', color: '#d4a843', letterSpacing: '.1em' }}>ABOUT</span>
          <button style={{ background: 'transparent', border: '0.5px solid #d4a843', color: '#d4a843', padding: '6px 16px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer' }}>SIGN IN</button>
        </div>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 32px 80px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: '#555250', marginBottom: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>← BACK TO HOME</p>

        <p style={{ fontSize: '11px', letterSpacing: '.3em', color: '#c4622d', marginBottom: '20px' }}>OUR MISSION</p>
        <h1 style={{ fontSize: '3rem', fontWeight: 300, color: '#d4a843', marginBottom: '8px', letterSpacing: '.05em', lineHeight: 1.2 }}>Preserving stone.<br />Preserving history.</h1>
        <div style={{ width: '40px', height: '0.5px', background: '#d4a843', margin: '24px 0', opacity: .5 }} />

        <p style={{ fontSize: '15px', color: '#888780', lineHeight: 1.9, marginBottom: '24px' }}>
          Shilalekh — from शिला (stone) and लेख (inscription) — is a global database dedicated to documenting, preserving and making accessible every stone inscription, copper plate, and epigraphic record ever created.
        </p>

        <p style={{ fontSize: '15px', color: '#888780', lineHeight: 1.9, marginBottom: '48px' }}>
          India alone is estimated to have over 3,00,000 inscriptions. The Archaeological Survey of India has formally documented approximately 1,00,000. Thousands more are being discovered — and thousands more are being lost to time, weather, and development. Shilalekh exists to change that.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '48px' }}>
          {[
            { title: 'For historians', desc: 'A searchable, filterable database of primary epigraphic sources — accessible anywhere in the world.' },
            { title: 'For contributors', desc: 'A platform for archaeologists, researchers and enthusiasts to document and share inscriptions they discover.' },
            { title: 'For institutions', desc: 'Bulk data access, API licensing, and collaborative tools for universities and museums.' },
            { title: 'For everyone', desc: 'A free map of human history — every inscription visible, every story accessible.' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#111', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '20px' }}>
              <p style={{ fontSize: '12px', color: '#d4a843', letterSpacing: '.1em', marginBottom: '8px' }}>{item.title.toUpperCase()}</p>
              <p style={{ fontSize: '13px', color: '#555250', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '0.5px solid #1e1e1e', paddingTop: '40px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '.2em', color: '#c4622d', marginBottom: '16px' }}>THE PROJECT</p>
          <p style={{ fontSize: '13px', color: '#555250', lineHeight: 1.8, marginBottom: '16px' }}>Shilalekh was founded with a simple belief — that every inscription, however small, however weathered, however obscure, is a piece of history that deserves to be recorded. A single word carved in stone two thousand years ago is still history.</p>
          <p style={{ fontSize: '13px', color: '#555250', lineHeight: 1.8 }}>We are building the world's most comprehensive, open, and accessible epigraphic database — one inscription at a time.</p>
        </div>

        <div style={{ marginTop: '48px', background: '#1a1500', border: '0.5px solid #3a3000', borderRadius: '8px', padding: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#d4a843', marginBottom: '8px', letterSpacing: '.05em' }}>Want to contribute?</p>
          <p style={{ fontSize: '13px', color: '#888780', marginBottom: '20px' }}>Join our community of historians, archaeologists and heritage enthusiasts.</p>
          <button onClick={() => navigate('/')} style={{ background: '#d4a843', border: 'none', color: '#0a0a0a', padding: '10px 28px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer', fontWeight: 600 }}>GET STARTED</button>
        </div>

      </div>

      <div style={{ borderTop: '0.5px solid #1e1e1e', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px', color: '#d4a843' }}>शिलालेख</span>
          <span style={{ fontSize: '10px', color: '#333', letterSpacing: '.15em' }}>SHILALEKH</span>
        </div>
        <p style={{ fontSize: '10px', color: '#333', letterSpacing: '.08em' }}>शिला · STONE &nbsp;|&nbsp; लेख · INSCRIPTION</p>
        <p style={{ fontSize: '10px', color: '#333', letterSpacing: '.08em' }}>© 2026 SHILALEKH.ORG</p>
      </div>

    </div>
  )
}