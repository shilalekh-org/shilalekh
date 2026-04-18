import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function Inscriptions() {
  const navigate = useNavigate()
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('inscriptions')
      .select('id, title, type, state_province, dynasty, year, script, language, status')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setInscriptions(data)
        setLoading(false)
      })
  }, [])

  const filtered = inscriptions.filter(i =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.state_province?.toLowerCase().includes(search.toLowerCase()) ||
    i.dynasty?.toLowerCase().includes(search.toLowerCase()) ||
    i.script?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e4d9', fontFamily: 'Georgia, serif' }}>

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.95)', borderBottom: '0.5px solid #2a2a2a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span style={{ fontSize: '20px', color: '#d4a843', letterSpacing: '.05em' }}>शिलालेख</span>
          <span style={{ fontSize: '11px', color: '#555250', letterSpacing: '.2em' }}>SHILALEKH</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="#" style={{ fontSize: '12px', color: '#888780', letterSpacing: '.1em', textDecoration: 'none' }}>EXPLORE</a>
          <span style={{ fontSize: '12px', color: '#d4a843', letterSpacing: '.1em' }}>INSCRIPTIONS</span>
          <a href="#" style={{ fontSize: '12px', color: '#888780', letterSpacing: '.1em', textDecoration: 'none' }}>CONTRIBUTE</a>
          <span onClick={() => navigate('/about')} style={{ fontSize: '12px', color: '#888780', letterSpacing: '.1em', cursor: 'pointer' }}>ABOUT</span>
          <button onClick={() => navigate('/signin')} style={{ background: 'transparent', border: '0.5px solid #d4a843', color: '#d4a843', padding: '6px 16px', borderRadius: '4px', fontSize: '11px', letterSpacing: '.1em', cursor: 'pointer' }}>SIGN IN</button>
        </div>
      </nav>

      <div style={{ paddingTop: '100px', maxWidth: '1000px', margin: '0 auto', padding: '100px 32px 60px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: '#c4622d', marginBottom: '12px' }}>DATABASE</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: '#d4a843', marginBottom: '8px', letterSpacing: '.05em' }}>Inscriptions</h1>
        <div style={{ width: '40px', height: '0.5px', background: '#d4a843', margin: '16px 0', opacity: .5 }} />

        <input
          type="text"
          placeholder="Search by title, state, dynasty, script..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', background: '#111', border: '0.5px solid #2a2a2a', borderRadius: '4px', padding: '12px 16px', color: '#e8e4d9', fontSize: '13px', marginBottom: '32px', outline: 'none', fontFamily: 'Georgia, serif', letterSpacing: '.03em' }}
        />

        {loading && (
          <p style={{ fontSize: '12px', color: '#555250', letterSpacing: '.1em', textAlign: 'center', padding: '60px 0' }}>LOADING INSCRIPTIONS...</p>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '12px', color: '#555250', letterSpacing: '.1em', marginBottom: '8px' }}>NO INSCRIPTIONS FOUND</p>
            <p style={{ fontSize: '11px', color: '#333' }}>The database is being populated. Check back soon.</p>
          </div>
        )}

        {!loading && filtered.map((inscription) => (
          <div
            key={inscription.id}
            onClick={() => navigate(`/inscription/${inscription.id}`)}
            style={{ background: '#111', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '20px 24px', marginBottom: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div>
              <p style={{ fontSize: '15px', fontWeight: 400, color: '#e8e4d9', marginBottom: '6px' }}>{inscription.title}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {inscription.state_province && <span style={{ fontSize: '10px', color: '#555250', letterSpacing: '.05em' }}>{inscription.state_province}</span>}
                {inscription.dynasty && <span style={{ fontSize: '10px', color: '#555250' }}>· {inscription.dynasty}</span>}
                {inscription.script && <span style={{ fontSize: '10px', color: '#555250' }}>· {inscription.script}</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '20px' }}>
              {inscription.year && <p style={{ fontSize: '12px', color: '#d4a843', marginBottom: '4px' }}>{inscription.year}</p>}
              {inscription.type && <p style={{ fontSize: '10px', color: '#555250', letterSpacing: '.05em' }}>{inscription.type.toUpperCase()}</p>}
            </div>
          </div>
        ))}

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