import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Nav from '../components/Nav'
import { useTheme } from '../theme'
import { useBookmarks } from '../lib/useBookmarks'

function BookmarkBtn({ inscriptionId, bookmarked, isLoggedIn, onToggle }: { inscriptionId: number; bookmarked: boolean; isLoggedIn: boolean; onToggle: (e: React.MouseEvent) => void }) {
  return (
    <button onClick={onToggle}
      title={isLoggedIn ? (bookmarked ? 'Remove bookmark' : 'Bookmark') : 'Sign in to bookmark'}
      style={{ background: 'transparent', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0, opacity: bookmarked ? 1 : 0.35, transition: 'opacity 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = bookmarked ? '1' : '0.35')}>
      <svg width="13" height="15" viewBox="0 0 14 18" fill={bookmarked ? '#d4a843' : 'none'} stroke="#d4a843" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 1h12v15l-6-4-6 4V1z"/>
      </svg>
    </button>
  )
}

export default function Inscriptions() {
  const navigate = useNavigate()
  const { c } = useTheme()
  const { bookmarked, toggle, isLoggedIn } = useBookmarks()
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('search') || ''
  })

  useEffect(() => {
    supabase.from('inscriptions')
      .select('id, shila_id, title, type, material_type, state_province, dynasty, year, script, language, status')
      .eq('status', 'approved').order('created_at', { ascending: false })
      .then(({ data, error }) => { if (!error && data) setInscriptions(data); setLoading(false) })
  }, [])

  const filtered = inscriptions.filter(i =>
    i.title?.toLowerCase().includes(search.toLowerCase()) ||
    i.state_province?.toLowerCase().includes(search.toLowerCase()) ||
    i.dynasty?.toLowerCase().includes(search.toLowerCase()) ||
    i.script?.toLowerCase().includes(search.toLowerCase())
  )

  const handleBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (!isLoggedIn) { navigate('/signin'); return }
    toggle(id)
  }

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '100px 32px 60px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px' }}>DATABASE</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: c.gold, marginBottom: '8px', letterSpacing: '.05em' }}>Inscriptions</h1>
        <div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '16px 0', opacity: .5 }} />
        <input type="text" placeholder="Search by title, state, dynasty, script..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '4px', padding: '12px 16px', color: c.text, fontSize: '13px', marginBottom: '32px', outline: 'none', fontFamily: 'Georgia, serif', letterSpacing: '.03em', boxSizing: 'border-box' as const }} />

        {loading && <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em', textAlign: 'center', padding: '60px 0' }}>LOADING INSCRIPTIONS...</p>}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em', marginBottom: '8px' }}>NO INSCRIPTIONS FOUND</p>
            <p style={{ fontSize: '11px', color: c.textFaint }}>The database is being populated. Check back soon.</p>
          </div>
        )}

        {!loading && filtered.map(inscription => (
          <div key={inscription.id}
            onClick={() => navigate(`/inscription/${inscription.shila_id || inscription.id}`)}
            style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '20px 24px', marginBottom: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = c.gold)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '15px', fontWeight: 400, color: c.text, marginBottom: '6px' }}>{inscription.title}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {inscription.state_province && <span style={{ fontSize: '10px', color: c.textDim, letterSpacing: '.05em' }}>{inscription.state_province}</span>}
                {inscription.dynasty && <span style={{ fontSize: '10px', color: c.textDim }}>· {inscription.dynasty}</span>}
                {inscription.script && <span style={{ fontSize: '10px', color: c.textDim }}>· {inscription.script}</span>}
                {inscription.shila_id && <span style={{ fontSize: '9px', color: c.textFaint, fontFamily: '"Courier New", Courier, monospace', letterSpacing: '.05em', marginLeft: '4px' }}>{inscription.shila_id}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                {inscription.year && <p style={{ fontSize: '12px', color: c.gold, marginBottom: '2px' }}>{inscription.year}</p>}
                {(inscription.material_type || inscription.type) && <p style={{ fontSize: '10px', color: c.textDim, letterSpacing: '.05em' }}>{(inscription.material_type || inscription.type).toUpperCase()}</p>}
              </div>
              <BookmarkBtn inscriptionId={inscription.id} bookmarked={bookmarked.has(inscription.id)} isLoggedIn={isLoggedIn} onToggle={e => handleBookmark(e, inscription.id)} />
            </div>
          </div>
        ))}
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