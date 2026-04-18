import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e4d9', fontFamily: 'Georgia, serif' }}>

      <Nav />

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 60px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '.3em', color: '#c4622d', marginBottom: '20px' }}>GLOBAL EPIGRAPHIC DATABASE</p>
        <h1 style={{ fontSize: '5rem', fontWeight: 300, color: '#d4a843', letterSpacing: '.05em', marginBottom: '8px', lineHeight: 1 }}>शिलालेख</h1>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 300, letterSpacing: '.4em', color: '#e8e4d9', marginBottom: '24px' }}>SHILALEKH</h2>
        <div style={{ width: '40px', height: '0.5px', background: '#d4a843', margin: '0 auto 24px', opacity: .5 }} />
        <p style={{ fontSize: '14px', color: '#888780', maxWidth: '480px', lineHeight: 1.8, marginBottom: '48px', letterSpacing: '.03em' }}>Discover, explore and contribute to the world's most comprehensive database of stone inscriptions, copper plates and epigraphic records.</p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/map')} style={{ background: '#d4a843', border: 'none', color: '#0a0a0a', padding: '12px 32px', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', cursor: 'pointer', fontWeight: 600 }}>EXPLORE THE MAP</button>
          <button onClick={() => navigate('/inscription/naneghat')} style={{ background: 'transparent', border: '0.5px solid #555250', color: '#888780', padding: '12px 32px', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', cursor: 'pointer' }}>VIEW SAMPLE INSCRIPTION</button>
        </div>
      </div>

      <div style={{ borderTop: '0.5px solid #1e1e1e', borderBottom: '0.5px solid #1e1e1e', padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center', gap: '20px' }}>
        <div><p style={{ fontSize: '24px', fontWeight: 300, color: '#d4a843', marginBottom: '4px' }}>3,00,000+</p><p style={{ fontSize: '11px', color: '#555250', letterSpacing: '.08em' }}>Inscriptions in India</p></div>
        <div><p style={{ fontSize: '24px', fontWeight: 300, color: '#d4a843', marginBottom: '4px' }}>36</p><p style={{ fontSize: '11px', color: '#555250', letterSpacing: '.08em' }}>States and Union Territories</p></div>
        <div><p style={{ fontSize: '24px', fontWeight: 300, color: '#d4a843', marginBottom: '4px' }}>120+</p><p style={{ fontSize: '11px', color: '#555250', letterSpacing: '.08em' }}>Indian inscriptions in UK</p></div>
        <div><p style={{ fontSize: '24px', fontWeight: 300, color: '#d4a843', marginBottom: '4px' }}>2,500+</p><p style={{ fontSize: '11px', color: '#555250', letterSpacing: '.08em' }}>Years of recorded history</p></div>
      </div>

      <div style={{ padding: '80px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: '9px', letterSpacing: '.2em', color: '#c4622d', marginBottom: '12px' }}>EXPLORE</p>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 300, color: '#e8e4d9', marginBottom: '8px', letterSpacing: '.05em' }}>Inscriptions on the map</h3>
        <p style={{ fontSize: '13px', color: '#555250', marginBottom: '40px', letterSpacing: '.03em' }}>Every pin is a piece of history. Click to explore.</p>
        <div onClick={() => navigate('/map')} style={{ background: '#111', border: '0.5px solid #2a2a2a', borderRadius: '8px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto', cursor: 'pointer' }}>
          <p style={{ fontSize: '12px', color: '#555250', letterSpacing: '.1em' }}>CLICK TO OPEN INTERACTIVE MAP →</p>
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