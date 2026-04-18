import { useNavigate } from 'react-router-dom'

export default function Inscription() {
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
          <span onClick={() => navigate('/about')} style={{ fontSize: '12px', color: '#888780', letterSpacing: '.1em', cursor: 'pointer' }}>ABOUT</span>
          <button style={{ background: 'transparent', border: '0.5px solid #d4a843', color: '#d4a843', padding: '6px 16px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer' }}>SIGN IN</button>
        </div>
      </nav>

      <div style={{ paddingTop: '80px', maxWidth: '900px', margin: '0 auto', padding: '100px 32px 60px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: '#555250', marginBottom: '8px', cursor: 'pointer' }} onClick={() => navigate('/')}>← BACK TO HOME</p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', padding: '3px 10px', border: '0.5px solid #3a2e10', color: '#d4a843', borderRadius: '99px', letterSpacing: '.05em' }}>CAVE INSCRIPTION</span>
          <span style={{ fontSize: '10px', padding: '3px 10px', border: '0.5px solid #2a2a2a', color: '#555250', borderRadius: '99px', letterSpacing: '.05em' }}>MAHARASHTRA</span>
          <span style={{ fontSize: '10px', padding: '3px 10px', border: '0.5px solid #2a2a2a', color: '#555250', borderRadius: '99px', letterSpacing: '.05em' }}>~100 BCE</span>
          <span style={{ fontSize: '10px', padding: '3px 10px', border: '0.5px solid #2a2a2a', color: '#555250', borderRadius: '99px', letterSpacing: '.05em' }}>BRAHMI SCRIPT</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: '#d4a843', marginBottom: '8px', letterSpacing: '.05em' }}>Naneghat Cave Inscription</h1>
        <p style={{ fontSize: '13px', color: '#555250', marginBottom: '32px', letterSpacing: '.05em' }}>Naneghat, Junnar taluk, Pune district, Maharashtra · 19.1833° N, 73.6833° E</p>

        <div style={{ width: '40px', height: '0.5px', background: '#d4a843', marginBottom: '32px', opacity: .5 }} />

        <div style={{ background: '#111', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: '#c4622d', marginBottom: '12px' }}>SHORT DESCRIPTION</p>
          <p style={{ fontSize: '15px', color: '#e8e4d9', lineHeight: 1.8 }}>One of the oldest Sanskrit inscriptions in India, found on the wall of a cave rest stop in the Western Ghats. Commissioned by Queen Naganika of the Satavahana dynasty. Contains the world's oldest known numeral symbols for digits 2, 4, 6, 7 and 9 — the direct ancestors of the numerals used globally today.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Type', value: 'Cave inscription' },
            { label: 'Script', value: 'Brahmi' },
            { label: 'Language', value: 'Prakrit (Middle Indo-Aryan)' },
            { label: 'Period', value: '~100–70 BCE' },
            { label: 'Dynasty', value: 'Satavahana' },
            { label: 'Ruler', value: 'Satakarni I (Queen Naganika)' },
            { label: 'Purpose', value: 'Memorial / Royal proclamation' },
            { label: 'Condition', value: 'Fair — partially damaged' },
            { label: 'Current location', value: 'In situ — Naneghat cave, Western Ghats' },
            { label: 'Accession no.', value: 'ASI — Epigraphia Indica ref.' },
          ].map((f, i) => (
            <div key={i} style={{ background: '#111', border: '0.5px solid #1e1e1e', borderRadius: '6px', padding: '12px 14px' }}>
              <p style={{ fontSize: '9px', letterSpacing: '.15em', color: '#555250', marginBottom: '4px' }}>{f.label.toUpperCase()}</p>
              <p style={{ fontSize: '13px', color: '#e8e4d9', fontWeight: 300 }}>{f.value}</p>
            </div>
          ))}
        </div>

        <div style={{ background: '#111', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: '#c4622d', marginBottom: '12px' }}>IMPORTANCE</p>
          <p style={{ fontSize: '13px', color: '#888780', lineHeight: 1.8 }}>Contains the world's oldest known numeral symbols for digits 2, 4, 6, 7 and 9. Earliest epigraphic evidence of a Hindu queen exercising independent political authority. One of the earliest inscriptional references to Vasudeva (Krishna) and Sankarshana (Balarama).</p>
        </div>

        <div style={{ background: '#1a1500', border: '0.5px solid #3a3000', borderRadius: '8px', padding: '20px 24px', marginBottom: '32px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: '#d4a843', marginBottom: '8px' }}>SCHOLAR ACCESS REQUIRED</p>
          <p style={{ fontSize: '13px', color: '#888780', marginBottom: '16px' }}>Full translation, transcription text, researcher notes and complete photo gallery are available to Scholar and Institution subscribers.</p>
          <button style={{ background: '#d4a843', border: 'none', color: '#0a0a0a', padding: '10px 24px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer', fontWeight: 600 }}>UPGRADE TO SCHOLAR — ₹299/mo</button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Naganika', 'Satakarni I', 'Satavahana', 'Vasudeva', 'Krishna', 'Brahmi numerals', 'Ashvamedha', 'Junnar', 'Western Ghats', 'Ancient numerals'].map((tag, i) => (
            <span key={i} style={{ fontSize: '11px', background: '#1a1a1a', color: '#555250', padding: '3px 10px', borderRadius: '99px', border: '0.5px solid #2a2a2a' }}>{tag}</span>
          ))}
        </div>

      </div>

      <div style={{ borderTop: '0.5px solid #1e1e1e', padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px', color: '#d4a843' }}>शिलालेख</span>
          <span style={{ fontSize: '10px', color: '#333', letterSpacing: '.15em' }}>SHILALEKH</span>
        </div>
        <p style={{ fontSize: '10px', color: '#333', letterSpacing: '.08em' }}>© 2026 SHILALEKH.ORG</p>
      </div>

    </div>
  )
}