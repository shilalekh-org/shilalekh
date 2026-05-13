import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import Nav from '../components/Nav'
import { useTheme } from '../theme'
import { useBookmarks } from '../lib/useBookmarks'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// ─── Pin icons ────────────────────────────────────────────────────────────────
const createPin = (color: string) => L.divIcon({
  html: `<svg width="20" height="28" viewBox="0 0 20 28" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0C4.477 0 0 4.477 0 10c0 7 10 18 10 18s10-11 10-18C20 4.477 15.523 0 10 0z" fill="${color}"/>
    <circle cx="10" cy="10" r="4" fill="white" fill-opacity="0.85"/>
  </svg>`,
  className: '', iconSize: [20, 28], iconAnchor: [10, 28], popupAnchor: [0, -30],
})
const GOLD_PIN   = createPin('#d4a843')
const AMBER_PIN  = createPin('#c87533')
const SILVER_PIN = createPin('#a8a8b0')

const getPinIcon = (ins: any) => ins.in_situ === true ? GOLD_PIN : ins.original_location_known !== false ? AMBER_PIN : SILVER_PIN
const getPinPos  = (ins: any): [number, number] | null => {
  if (ins.original_location_known !== false && ins.latitude && ins.longitude) return [ins.latitude, ins.longitude]
  if (ins.original_location_known === false && ins.current_lat && ins.current_lng) return [ins.current_lat, ins.current_lng]
  return null
}

// ─── Bookmark button ──────────────────────────────────────────────────────────
function BookmarkBtn({ id: _id, bookmarked, isLoggedIn, onToggle }: { id: number; bookmarked: boolean; isLoggedIn: boolean; onToggle: (e: React.MouseEvent) => void }) {
  return (
    <button onClick={onToggle} title={isLoggedIn ? (bookmarked ? 'Remove bookmark' : 'Bookmark') : 'Sign in to bookmark'}
      style={{ background: 'transparent', border: 'none', padding: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0, opacity: bookmarked ? 1 : 0.35, transition: 'opacity 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = bookmarked ? '1' : '0.35')}>
      <svg width="13" height="15" viewBox="0 0 14 18" fill={bookmarked ? '#d4a843' : 'none'} stroke="#d4a843" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 1h12v15l-6-4-6 4V1z"/>
      </svg>
    </button>
  )
}

type View = 'list' | 'tile' | 'map'

export default function Inscriptions() {
  const navigate = useNavigate()
  const { c, theme } = useTheme()
  const { bookmarked, toggle, isLoggedIn } = useBookmarks()
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('list')
  const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get('search') || '')

  // Filters
  const [fScript,   setFScript]   = useState('')
  const [fMaterial, setFMaterial] = useState('')
  const [fCountry,  setFCountry]  = useState('')
  const [fDynasty,  setFDynasty]  = useState('')

  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  useEffect(() => {
    supabase.from('inscriptions')
      .select('id, shila_id, title, type, material_type, material_category, state_province, country, dynasty, year, script, language, photo_urls, latitude, longitude, in_situ, original_location_known, current_lat, current_lng')
      .eq('status', 'approved').order('created_at', { ascending: false })
      .then(({ data, error }) => { if (!error && data) setInscriptions(data); setLoading(false) })
  }, [])

  // Derived unique filter options
  const scripts   = [...new Set(inscriptions.map(i => i.script).filter(Boolean))].sort()
  const materials = [...new Set(inscriptions.map(i => i.material_type).filter(Boolean))].sort()
  const countries = [...new Set(inscriptions.map(i => i.country).filter(Boolean))].sort()
  const dynasties = [...new Set(inscriptions.map(i => i.dynasty).filter(Boolean))].sort()

  const hasFilters = !!(fScript || fMaterial || fCountry || fDynasty || search)

  const filtered = inscriptions.filter(i => {
    if (search && !(
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.state_province?.toLowerCase().includes(search.toLowerCase()) ||
      i.dynasty?.toLowerCase().includes(search.toLowerCase()) ||
      i.script?.toLowerCase().includes(search.toLowerCase()) ||
      i.country?.toLowerCase().includes(search.toLowerCase())
    )) return false
    if (fScript   && i.script       !== fScript)   return false
    if (fMaterial && i.material_type !== fMaterial) return false
    if (fCountry  && i.country      !== fCountry)  return false
    if (fDynasty  && i.dynasty      !== fDynasty)  return false
    return true
  })

  const mappable = filtered.filter(i => getPinPos(i) !== null)

  const clearFilters = () => { setSearch(''); setFScript(''); setFMaterial(''); setFCountry(''); setFDynasty('') }

  const handleBookmark = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); if (!isLoggedIn) { navigate('/signin'); return }; toggle(id)
  }

  const goTo = (ins: any) => navigate(`/inscription/${ins.shila_id || ins.id}`)

  // ── Styles ─────────────────────────────────────────────────────────────────
  const selectStyle = {
    background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '4px',
    padding: '8px 28px 8px 10px', color: c.text, fontSize: '11px', fontFamily: 'Arial, sans-serif',
    outline: 'none', cursor: 'pointer', letterSpacing: '.03em',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
  }

  const viewBtnStyle = (v: View) => ({
    padding: '8px 14px', fontSize: '10px', letterSpacing: '.08em', cursor: 'pointer',
    border: `0.5px solid ${view === v ? c.gold : c.border}`,
    color: view === v ? c.gold : c.textDim, background: 'transparent',
    fontFamily: 'Arial, sans-serif', transition: 'all 0.15s',
    borderRadius: v === 'list' ? '4px 0 0 4px' : v === 'map' ? '0 4px 4px 0' : '0',
    borderLeft: v === 'tile' ? 'none' : undefined,
    borderRight: v === 'tile' ? 'none' : undefined,
  })

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '100px 32px 60px' }}>

        <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '12px' }}>DATABASE</p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 300, color: c.gold, marginBottom: '8px', letterSpacing: '.05em' }}>Inscriptions</h1>
        <div style={{ width: '40px', height: '0.5px', background: c.gold, margin: '16px 0 24px', opacity: .5 }} />

        {/* ── Search + Filters + View toggle ── */}
        <div style={{ marginBottom: '24px' }}>
          {/* Row 1: Search */}
          <input type="text" placeholder="Search by title, state, dynasty, script, country..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '4px', padding: '11px 16px', color: c.text, fontSize: '13px', outline: 'none', fontFamily: 'Georgia, serif', letterSpacing: '.03em', boxSizing: 'border-box', marginBottom: '10px' }} />

          {/* Row 2: Filter dropdowns + Clear + View toggle */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={fScript} onChange={e => setFScript(e.target.value)} style={selectStyle}>
              <option value="">All scripts</option>
              {scripts.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={fMaterial} onChange={e => setFMaterial(e.target.value)} style={selectStyle}>
              <option value="">All materials</option>
              {materials.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={fCountry} onChange={e => setFCountry(e.target.value)} style={selectStyle}>
              <option value="">All countries</option>
              {countries.map(c_ => <option key={c_} value={c_}>{c_}</option>)}
            </select>
            <select value={fDynasty} onChange={e => setFDynasty(e.target.value)} style={selectStyle}>
              <option value="">All dynasties</option>
              {dynasties.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} style={{ background: 'transparent', border: `0.5px solid ${c.border}`, color: c.textDim, padding: '8px 14px', borderRadius: '4px', fontSize: '10px', letterSpacing: '.08em', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                CLEAR ×
              </button>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* View toggle */}
            <div style={{ display: 'flex' }}>
              <button onClick={() => setView('list')} style={viewBtnStyle('list')}>LIST</button>
              <button onClick={() => setView('tile')} style={viewBtnStyle('tile')}>TILE</button>
              <button onClick={() => setView('map')}  style={viewBtnStyle('map')}>MAP</button>
            </div>
          </div>

          {/* Results count */}
          <p style={{ fontSize: '10px', color: c.textFaint, marginTop: '10px', fontFamily: 'Arial, sans-serif', letterSpacing: '.05em' }}>
            {loading ? 'Loading…' : `${filtered.length} inscription${filtered.length !== 1 ? 's' : ''}${hasFilters ? ' matching filters' : ''}`}
            {view === 'map' && !loading && ` · ${mappable.length} on map`}
          </p>
        </div>

        {/* ── LOADING ── */}
        {loading && <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em', textAlign: 'center', padding: '60px 0' }}>LOADING INSCRIPTIONS...</p>}

        {/* ── EMPTY ── */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em', marginBottom: '8px' }}>NO INSCRIPTIONS FOUND</p>
            {hasFilters && <button onClick={clearFilters} style={{ fontSize: '11px', color: c.gold, background: 'transparent', border: `0.5px solid ${c.gold}`, padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' }}>CLEAR FILTERS</button>}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {!loading && view === 'list' && filtered.map(ins => (
          <div key={ins.id} onClick={() => goTo(ins)}
            style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', padding: '20px 24px', marginBottom: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = c.gold)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '15px', fontWeight: 400, color: c.text, marginBottom: '6px' }}>{ins.title}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {ins.state_province && <span style={{ fontSize: '10px', color: c.textDim }}>{ins.state_province}</span>}
                {ins.dynasty && <span style={{ fontSize: '10px', color: c.textDim }}>· {ins.dynasty}</span>}
                {ins.script  && <span style={{ fontSize: '10px', color: c.textDim }}>· {ins.script}</span>}
                {ins.shila_id && <span style={{ fontSize: '9px', color: c.textFaint, fontFamily: '"Courier New", monospace', marginLeft: '4px' }}>{ins.shila_id}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                {ins.year && <p style={{ fontSize: '12px', color: c.gold, marginBottom: '2px' }}>{ins.year}</p>}
                {(ins.material_type || ins.type) && <p style={{ fontSize: '10px', color: c.textDim, letterSpacing: '.05em' }}>{(ins.material_type || ins.type).toUpperCase()}</p>}
              </div>
              <BookmarkBtn id={ins.id} bookmarked={bookmarked.has(ins.id)} isLoggedIn={isLoggedIn} onToggle={e => handleBookmark(e, ins.id)} />
            </div>
          </div>
        ))}

        {/* ── TILE VIEW ── */}
        {!loading && view === 'tile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filtered.map(ins => (
              <div key={ins.id} onClick={() => goTo(ins)}
                style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = c.gold)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}>
                {ins.photo_urls?.[0] ? (
                  <div style={{ height: '150px', overflow: 'hidden', borderBottom: `0.5px solid ${c.borderLight}` }}>
                    <img src={ins.photo_urls[0]} alt={ins.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                ) : (
                  <div style={{ height: '150px', background: c.bg, borderBottom: `0.5px solid ${c.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p style={{ fontSize: '9px', color: c.textFaint, letterSpacing: '.12em', fontFamily: 'Arial, sans-serif' }}>NO IMAGE</p>
                  </div>
                )}
                <div style={{ padding: '14px 16px' }}>
                  {(ins.material_type || ins.type) && <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.orange, marginBottom: '5px', fontFamily: 'Arial, sans-serif' }}>{(ins.material_type || ins.type).toUpperCase()}</p>}
                  <p style={{ fontSize: '13px', color: c.text, lineHeight: 1.5, marginBottom: '10px' }}>{ins.title}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `0.5px solid ${c.borderLight}` }}>
                    <p style={{ fontSize: '10px', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>{ins.state_province || ins.country || '—'}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {ins.year && <p style={{ fontSize: '12px', color: c.gold }}>{ins.year}</p>}
                      <BookmarkBtn id={ins.id} bookmarked={bookmarked.has(ins.id)} isLoggedIn={isLoggedIn} onToggle={e => handleBookmark(e, ins.id)} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── MAP VIEW ── */}
        {!loading && view === 'map' && (
          <div style={{ border: `0.5px solid ${c.border}`, borderRadius: '8px', overflow: 'hidden', height: '560px' }}>
            {mappable.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bgCard }}>
                <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em' }}>NO MAPPABLE RESULTS FOR CURRENT FILTERS</p>
              </div>
            ) : (
              <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                <TileLayer key={`map-${theme}`} url={tileUrl}
                  attribution='© <a href="https://carto.com/attributions">CARTO</a>' />
                {mappable.map(ins => {
                  const pos = getPinPos(ins)!
                  return (
                    <Marker key={ins.id} position={pos} icon={getPinIcon(ins)}>
                      <Popup>
                        <div style={{ fontFamily: 'Georgia, serif', minWidth: '180px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#1a1a1a' }}>{ins.title}</p>
                          {ins.state_province && <p style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>{ins.state_province}</p>}
                          {ins.year && <p style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>{ins.year}</p>}
                          <button onClick={() => goTo(ins)} style={{ fontSize: '11px', background: '#d4a843', border: 'none', color: '#0a0a0a', padding: '4px 12px', borderRadius: '3px', cursor: 'pointer', fontWeight: 600 }}>VIEW DETAILS</button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            )}
          </div>
        )}

      </div>

      <div style={{ borderTop: `0.5px solid ${c.borderLight}`, padding: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px', color: c.gold, fontFamily: 'Georgia, serif' }}>शिलालेख</span>
          <span style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.15em' }}>SHILALEKH</span>
        </div>
        <p style={{ fontSize: '10px', color: c.textFaint, fontFamily: 'Georgia, serif' }}>यावच्चन्द्रदिवाकरौ</p>
        <p style={{ fontSize: '10px', color: c.textFaint, letterSpacing: '.08em' }}>© 2026 SHILALEKH.ORG</p>
      </div>
    </div>
  )
}