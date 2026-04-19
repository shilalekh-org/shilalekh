import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { useTheme } from '../theme'

export default function Home() {
  const navigate = useNavigate()
  const { c } = useTheme()

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>

      {/* Background floating scripts */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', fontFamily: 'Georgia, serif', color: c.gold, opacity: .04, fontSize: '160px', top: '-30px', right: '-20px', transform: 'rotate(-8deg)', whiteSpace: 'nowrap', userSelect: 'none' }}>शिलालेख</div>
        <div style={{ position: 'absolute', fontFamily: 'Georgia, serif', color: c.gold, opacity: .03, fontSize: '200px', bottom: '60px', left: '-50px', transform: 'rotate(6deg)', whiteSpace: 'nowrap', userSelect: 'none' }}>SHILALEKH</div>
        <div style={{ position: 'absolute', fontFamily: 'Georgia, serif', color: c.gold, opacity: .04, fontSize: '72px', top: '35%', left: '-10px', transform: 'rotate(-3deg)', whiteSpace: 'nowrap', userSelect: 'none' }}>শিলালেখ</div>
        <div style={{ position: 'absolute', fontFamily: 'Georgia, serif', color: c.gold, opacity: .04, fontSize: '80px', top: '55%', right: '-15px', transform: 'rotate(5deg)', whiteSpace: 'nowrap', userSelect: 'none' }}>ශිලාලේඛ</div>
        <div style={{ position: 'absolute', fontFamily: 'Georgia, serif', color: c.gold, opacity: .05, fontSize: '52px', bottom: '120px', right: '20px', transform: 'rotate(-4deg)', whiteSpace: 'nowrap', userSelect: 'none' }}>石銘</div>
        <div style={{ position: 'absolute', fontFamily: 'Georgia, serif', color: c.gold, opacity: .04, fontSize: '58px', top: '80px', left: '10px', transform: 'rotate(4deg)', whiteSpace: 'nowrap', userSelect: 'none' }}>شيلاليخ</div>
        <div style={{ position: 'absolute', fontFamily: 'Georgia, serif', color: c.gold, opacity: .04, fontSize: '44px', bottom: '80px', left: '12%', transform: 'rotate(-2deg)', whiteSpace: 'nowrap', userSelect: 'none' }}>ಶಿಲಾಲೇಖ</div>
        <div style={{ position: 'absolute', fontFamily: 'Georgia, serif', color: c.gold, opacity: .04, fontSize: '46px', bottom: '40px', right: '12%', transform: 'rotate(3deg)', whiteSpace: 'nowrap', userSelect: 'none' }}>శిలాలేఖ</div>
      </div>

      <Nav />

      {/* Hero */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 24px 60px' }}>
        <p style={{ fontSize: '13px', letterSpacing: '.25em', color: c.orange, marginBottom: '32px' }}>GLOBAL EPIGRAPHIC DATABASE</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '3.8rem', fontWeight: 300, color: c.gold, letterSpacing: '.05em', marginBottom: '8px', lineHeight: 1 }}>शिलालेख</h1>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '2.2rem', fontWeight: 300, color: c.text, letterSpacing: '.3em', marginBottom: '20px', lineHeight: 1 }}>SHILALEKH</p>
        <div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '0 auto 24px', opacity: .5 }} />
        <p style={{ fontSize: '14px', color: c.textMuted, maxWidth: '480px', lineHeight: 1.8, marginBottom: '48px', letterSpacing: '.03em' }}>Discover, explore and contribute to the world's most comprehensive database of stone inscriptions, copper plates and epigraphic records.</p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/map')} style={{ background: c.gold, border: 'none', color: '#0a0a0a', padding: '12px 32px', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', cursor: 'pointer', fontWeight: 600 }}>EXPLORE THE MAP</button>
          <button onClick={() => navigate('/inscription/naneghat')} style={{ background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textMuted, padding: '12px 32px', borderRadius: '4px', fontSize: '12px', letterSpacing: '.1em', cursor: 'pointer' }}>VIEW SAMPLE INSCRIPTION</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ position: 'relative', zIndex: 1, borderTop: `0.5px solid ${c.borderLight}`, borderBottom: `0.5px solid ${c.borderLight}`, padding: '32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', textAlign: 'center', gap: '20px' }}>
        <div><p style={{ fontSize: '24px', fontWeight: 300, color: c.gold, marginBottom: '4px' }}>3,00,000+</p><p style={{ fontSize: '11px', color: c.textDim, letterSpacing: '.08em' }}>Inscriptions in India</p></div>
        <div><p style={{ fontSize: '24px', fontWeight: 300, color: c.gold, marginBottom: '4px' }}>36</p><p style={{ fontSize: '11px', color: c.textDim, letterSpacing: '.08em' }}>States and Union Territories</p></div>
        <div><p style={{ fontSize: '24px', fontWeight: 300, color: c.gold, marginBottom: '4px' }}>120+</p><p style={{ fontSize: '11px', color: c.textDim, letterSpacing: '.08em' }}>Indian inscriptions in UK</p></div>
        <div><p style={{ fontSize: '24px', fontWeight: 300, color: c.gold, marginBottom: '4px' }}>2,500+</p><p style={{ fontSize: '11px', color: c.textDim, letterSpacing: '.08em' }}>Years of recorded history</p></div>
      </div>

      {/* Map preview */}
      <div style={{ position: 'relative', zIndex: 1, padding: '80px 32px', textAlign: 'center' }}>
        <p style={{ fontSize: '9px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px' }}>EXPLORE</p>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 300, color: c.text, marginBottom: '8px', letterSpacing: '.05em' }}>Inscriptions on the map</h3>
        <p style={{ fontSize: '13px', color: c.textDim, marginBottom: '40px', letterSpacing: '.03em' }}>Every pin is a piece of history. Click to explore.</p>
        <div onClick={() => navigate('/map')} style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto', cursor: 'pointer' }}>
          <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>CLICK TO OPEN INTERACTIVE MAP →</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'relative', zIndex: 1, borderTop: `0.5px solid ${c.borderLight}`, padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
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
