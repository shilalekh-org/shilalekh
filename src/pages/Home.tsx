import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import { useTheme } from '../theme'
import { supabase } from '../supabase'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [0, -32],
})

const PILLS = ['All', 'Rock Edict', 'Temple', 'Cave', 'Copper Plate', 'Bilingual', 'Victory']

export default function Home() {
  const navigate = useNavigate()
  const { c, theme } = useTheme()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [mapInscriptions, setMapInscriptions] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, countries: 0, scripts: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('inscriptions')
        .select('id, title, type, state_province, country, year, script')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      if (data) setInscriptions(data)

      const { data: mapData } = await supabase
        .from('inscriptions')
        .select('id, title, type, state_province, country, year, latitude, longitude')
        .eq('status', 'approved')

      if (mapData) {
        setMapInscriptions(mapData.filter((i: any) => i.latitude && i.longitude))
      }

      const { count: total } = await supabase
        .from('inscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

      const { data: countriesData } = await supabase
        .from('inscriptions')
        .select('country')
        .eq('status', 'approved')

      const { data: scriptsData } = await supabase
        .from('inscriptions')
        .select('script')
        .eq('status', 'approved')

      const uniqueCountries = new Set(
        countriesData?.map((i: any) => i.country).filter(Boolean)
      ).size
      const uniqueScripts = new Set(
        scriptsData?.map((i: any) => i.script).filter(Boolean)
      ).size

      setStats({ total: total || 0, countries: uniqueCountries, scripts: uniqueScripts })
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSearch = () => {
    if (search.trim()) {
      navigate(`/inscriptions?search=${encodeURIComponent(search.trim())}`)
    } else {
      navigate('/inscriptions')
    }
  }

  const filtered = activeFilter === 'All'
    ? inscriptions
    : inscriptions.filter(i =>
        i.type?.toLowerCase().includes(activeFilter.toLowerCase())
      )

  const displayed = filtered.slice(0, 6)

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

      {/* ── HERO ── */}
      <div style={{ position: 'relative', zIndex: 1, paddingTop: '100px', paddingBottom: '48px', textAlign: 'center', borderBottom: `0.5px solid ${c.borderLight}` }}>
        <p style={{ fontSize: '10px', letterSpacing: '.25em', color: c.orange, marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>GLOBAL EPIGRAPHIC DATABASE</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '3.5rem', fontWeight: 300, color: c.gold, letterSpacing: '.05em', marginBottom: '4px', lineHeight: 1 }}>शिलालेख</h1>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.4rem', fontWeight: 300, color: c.textMuted, letterSpacing: '.3em', marginBottom: '36px', lineHeight: 1 }}>SHILALEKH</p>

        {/* Search bar */}
        <div style={{ display: 'flex', maxWidth: '620px', margin: '0 auto 20px', border: `0.5px solid ${c.gold}`, borderRadius: '4px', overflow: 'hidden' }}>
          <input
            type="text"
            placeholder="Search by inscription, location, dynasty, script..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, background: c.bgCard, border: 'none', padding: '14px 20px', color: c.text, fontSize: '14px', fontFamily: 'Georgia, serif', outline: 'none' }}
          />
          <button
            onClick={handleSearch}
            style={{ background: c.gold, border: 'none', padding: '14px 28px', color: '#0a0a0a', fontSize: '11px', letterSpacing: '.15em', cursor: 'pointer', fontFamily: 'Arial, sans-serif', fontWeight: 600, flexShrink: 0 }}
          >SEARCH</button>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 24px' }}>
          {PILLS.map(pill => (
            <button
              key={pill}
              onClick={() => setActiveFilter(pill)}
              style={{ padding: '5px 16px', border: `0.5px solid ${activeFilter === pill ? c.gold : c.border}`, borderRadius: '99px', fontSize: '11px', color: activeFilter === pill ? c.gold : c.textDim, cursor: 'pointer', background: 'transparent', fontFamily: 'Arial, sans-serif', letterSpacing: '.05em' }}
            >{pill}</button>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ position: 'relative', zIndex: 1, background: c.bgCard, borderBottom: `0.5px solid ${c.borderLight}`, padding: '20px 32px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { num: loading ? '...' : stats.total.toString(), label: 'INSCRIPTIONS IN DATABASE' },
          { num: loading ? '...' : stats.countries.toString(), label: 'COUNTRIES' },
          { num: loading ? '...' : stats.scripts.toString(), label: 'SCRIPTS' },
          { num: '2,500+', label: 'YEARS OF HISTORY' },
        ].map((s, i, arr) => (
          <div key={i} style={{ textAlign: 'center', padding: '0 36px', borderRight: i < arr.length - 1 ? `0.5px solid ${c.borderLight}` : 'none' }}>
            <p style={{ fontSize: '22px', fontWeight: 300, color: c.gold, fontFamily: 'Georgia, serif', marginBottom: '4px' }}>{s.num}</p>
            <p style={{ fontSize: '9px', color: c.textDim, letterSpacing: '.12em', fontFamily: 'Arial, sans-serif' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── INSCRIPTION CARDS ── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '48px 32px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, fontFamily: 'Arial, sans-serif' }}>
            {activeFilter === 'All' ? 'RECENTLY ADDED' : activeFilter.toUpperCase()}
          </p>
          <span
            onClick={() => navigate('/inscriptions')}
            style={{ fontSize: '10px', color: c.gold, letterSpacing: '.1em', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
          >VIEW ALL INSCRIPTIONS →</span>
        </div>

        {loading ? (
          <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em', textAlign: 'center', padding: '60px 0' }}>LOADING INSCRIPTIONS...</p>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '12px', color: c.textDim, letterSpacing: '.1em', marginBottom: '8px' }}>NO INSCRIPTIONS OF THIS TYPE YET</p>
            <p style={{ fontSize: '11px', color: c.textFaint }}>More being added soon.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {displayed.map(inscription => (
              <div
                key={inscription.id}
                onClick={() => navigate(`/inscription/${inscription.id}`)}
                style={{ background: c.bgCard, border: `0.5px solid ${c.border}`, borderRadius: '8px', cursor: 'pointer', overflow: 'hidden', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = c.gold)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = c.border)}
              >
                {/* Photo area */}
                <div style={{ height: '140px', background: c.bg, borderBottom: `0.5px solid ${c.borderLight}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.2 }}>
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1"/>
                    <path d="M3 16l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
                  </svg>
                  <p style={{ fontSize: '9px', color: c.textFaint, letterSpacing: '.12em', fontFamily: 'Arial, sans-serif' }}>NO IMAGE AVAILABLE</p>
                </div>

                {/* Card body */}
                <div style={{ padding: '16px 18px' }}>
                  {inscription.type && (
                    <p style={{ fontSize: '9px', letterSpacing: '.15em', color: c.orange, marginBottom: '6px', fontFamily: 'Arial, sans-serif' }}>{inscription.type.toUpperCase()}</p>
                  )}
                  <p style={{ fontSize: '14px', color: c.text, lineHeight: 1.5, marginBottom: '12px' }}>{inscription.title}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: `0.5px solid ${c.borderLight}` }}>
                    <p style={{ fontSize: '10px', color: c.textDim, fontFamily: 'Arial, sans-serif' }}>
                      {inscription.state_province || inscription.country || '—'}
                    </p>
                    {inscription.year && (
                      <p style={{ fontSize: '12px', color: c.gold, fontFamily: 'Georgia, serif' }}>{inscription.year}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MAP SECTION ── */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 32px 72px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, fontFamily: 'Arial, sans-serif' }}>
            EXPLORE ON THE MAP — {mapInscriptions.length} LOCATIONS
          </p>
          <span
            onClick={() => navigate('/map')}
            style={{ fontSize: '10px', color: c.gold, letterSpacing: '.1em', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}
          >OPEN FULL MAP →</span>
        </div>

        <div style={{ border: `0.5px solid ${c.border}`, borderRadius: '8px', overflow: 'hidden', height: '320px' }}>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={3}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%', background: theme === 'dark' ? '#111' : '#f5f0e4' }}
          >
            <TileLayer
              url={theme === 'dark'
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              }
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
            />
            {mapInscriptions.map(ins => (
              <Marker
                key={ins.id}
                position={[ins.latitude, ins.longitude]}
                icon={defaultIcon}
              >
                <Popup>
                  <div style={{ fontFamily: 'Georgia, serif', minWidth: '180px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#1a1a1a' }}>{ins.title}</p>
                    {ins.state_province && <p style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>{ins.state_province}</p>}
                    {ins.country && <p style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>{ins.country}</p>}
                    {ins.year && <p style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>{ins.year}</p>}
                    <button
                      onClick={() => navigate(`/inscription/${ins.id}`)}
                      style={{ fontSize: '11px', background: '#d4a843', border: 'none', color: '#0a0a0a', padding: '4px 12px', borderRadius: '3px', cursor: 'pointer', fontWeight: 600 }}
                    >VIEW DETAILS</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* ── FOOTER ── */}
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