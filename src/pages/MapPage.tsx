import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Nav from '../components/Nav'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

// ─── Pin colours ──────────────────────────────────────────────────────────────
const PIN_GOLD   = '#d4a843'
const PIN_AMBER  = '#c87533'
const PIN_SILVER = '#a0a0aa'

const createPinIcon = (color: string) => L.divIcon({
  className: '',
  html: `<svg width="22" height="34" viewBox="0 0 22 34" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 0C5.477 0 1 4.477 1 10c0 8 10 24 10 24S21 18 21 10C21 4.477 16.523 0 11 0z"
      fill="${color}" stroke="rgba(0,0,0,0.28)" stroke-width="1.2"/>
    <circle cx="11" cy="10" r="4" fill="rgba(0,0,0,0.18)"/>
  </svg>`,
  iconSize: [22, 34], iconAnchor: [11, 34], popupAnchor: [0, -34],
})

const goldIcon   = createPinIcon(PIN_GOLD)
const amberIcon  = createPinIcon(PIN_AMBER)
const silverIcon = createPinIcon(PIN_SILVER)

const getPinIcon = (ins: any) => {
  if (ins.original_location_known === false) return silverIcon
  return ins.in_situ ? goldIcon : amberIcon
}
const pinPosition = (ins: any): [number, number] => {
  if (ins.original_location_known === false && ins.current_lat && ins.current_lng) return [ins.current_lat, ins.current_lng]
  return [ins.latitude, ins.longitude]
}

// ─── Layer config ─────────────────────────────────────────────────────────────
type LayerType = 'default' | 'street' | 'satellite'
const LAYERS: { id: LayerType; label: string; url: string; attribution: string }[] = [
  { id: 'default',   label: 'Default',   url: '', attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>' },
  { id: 'street',    label: 'Street',    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' },
  { id: 'satellite', label: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '© <a href="https://www.esri.com">Esri</a>' },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function MapPage() {
  const navigate = useNavigate()
  const { c, theme } = useTheme()
  const [allInscriptions, setAllInscriptions] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [activeLayer, setActiveLayer] = useState<LayerType>('default')
  const [panelOpen, setPanelOpen]     = useState(true)

  // Filters
  const [fCountry,  setFCountry]  = useState('')
  const [fScript,   setFScript]   = useState('')
  const [fMaterial, setFMaterial] = useState('')
  const [fInSitu,   setFInSitu]   = useState('')  // '' | 'insitu' | 'moved' | 'current'

  const defaultTileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
  const currentLayer = LAYERS.find(l => l.id === activeLayer)!
  const tileUrl      = activeLayer === 'default' ? defaultTileUrl : currentLayer.url
  const tileKey      = activeLayer === 'default' ? `default-${theme}` : activeLayer

  useEffect(() => {
    supabase.from('inscriptions').select('*')
      .then(({ data, error }) => {
        if (!error && data) {
          setAllInscriptions(data.filter((i: any) => {
            if (i.status !== 'approved') return false
            if (i.original_location_known !== false && i.latitude && i.longitude) return true
            if (i.original_location_known === false && i.current_lat && i.current_lng) return true
            return false
          }))
        }
        setLoading(false)
      })
  }, [])

  // Derived unique filter options
  const countries = [...new Set(allInscriptions.map(i => i.country).filter(Boolean))].sort()
  const scripts   = [...new Set(allInscriptions.map(i => i.script).filter(Boolean))].sort()
  const materials = [...new Set(allInscriptions.map(i => i.material_type).filter(Boolean))].sort()

  // Apply filters
  const inscriptions = allInscriptions.filter(i => {
    if (fCountry  && i.country      !== fCountry)  return false
    if (fScript   && i.script       !== fScript)   return false
    if (fMaterial && i.material_type !== fMaterial) return false
    if (fInSitu === 'insitu'   && !(i.in_situ && i.original_location_known !== false)) return false
    if (fInSitu === 'moved'    && !(!i.in_situ && i.original_location_known !== false)) return false
    if (fInSitu === 'current'  && !(i.original_location_known === false)) return false
    return true
  })

  const activeFilterCount = [fCountry, fScript, fMaterial, fInSitu].filter(Boolean).length
  const clearFilters = () => { setFCountry(''); setFScript(''); setFMaterial(''); setFInSitu('') }

  // ── Styles ─────────────────────────────────────────────────────────────────
  const legendBg     = theme === 'dark' ? 'rgba(10,10,10,0.92)' : 'rgba(245,240,228,0.97)'
  const legendBorder = theme === 'dark' ? 'rgba(232,216,176,0.18)' : 'rgba(61,42,10,0.18)'
  const legendText   = theme === 'dark' ? '#e8d8b0' : '#3d2a0a'
  const legendDim    = theme === 'dark' ? 'rgba(232,216,176,0.45)' : 'rgba(61,42,10,0.45)'
  const panelBg      = theme === 'dark' ? '#0f0f0f' : '#faf8f3'
  const panelBorder  = theme === 'dark' ? '#2a2a2a' : '#e0ddd5'

  const layerBtnStyle = (id: LayerType) => ({
    padding: '5px 12px', fontSize: '11px', fontFamily: 'Georgia, serif',
    letterSpacing: '.04em', cursor: 'pointer', border: 'none',
    background: activeLayer === id ? (theme === 'dark' ? '#e8d8b0' : '#3d2a0a') : (theme === 'dark' ? 'rgba(10,10,10,0.85)' : 'rgba(245,240,228,0.92)'),
    color: activeLayer === id ? (theme === 'dark' ? '#0a0a0a' : '#e8d8b0') : (theme === 'dark' ? '#e8d8b0' : '#3d2a0a'),
    transition: 'all 0.15s',
  })

  const selectStyle = {
    width: '100%', background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: '4px',
    padding: '9px 28px 9px 10px', color: c.text, fontSize: '12px', fontFamily: 'Arial, sans-serif',
    outline: 'none', cursor: 'pointer', appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23888' stroke-width='1.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
  }

  const FilterLabel = ({ children }: { children: React.ReactNode }) => (
    <p style={{ fontSize: '9px', letterSpacing: '.14em', color: legendDim, fontFamily: 'Arial, sans-serif', marginBottom: '6px', textTransform: 'uppercase' as const }}>{children}</p>
  )

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>
      <Nav />
      <div style={{ paddingTop: '60px', height: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header bar */}
        <div style={{ padding: '12px 24px', borderBottom: `0.5px solid ${c.borderLight}`, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '1px', fontFamily: 'Arial, sans-serif' }}>EXPLORE</p>
              <p style={{ fontSize: '13px', color: c.text, fontWeight: 300 }}>
                {loading ? 'Loading…' : <><span style={{ color: c.gold }}>{inscriptions.length}</span> of {allInscriptions.length} locations shown</>}
              </p>
            </div>
            {/* Filter toggle button */}
            <button onClick={() => setPanelOpen(v => !v)} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: panelOpen ? 'rgba(212,168,67,0.1)' : 'transparent',
              border: `0.5px solid ${panelOpen ? c.gold : c.border}`,
              color: panelOpen ? c.gold : c.textDim,
              padding: '6px 14px', borderRadius: '4px', fontSize: '10px', letterSpacing: '.08em',
              cursor: 'pointer', fontFamily: 'Arial, sans-serif', transition: 'all 0.15s',
            }}>
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <line x1="0" y1="1" x2="12" y2="1"/><line x1="2" y1="5" x2="10" y2="5"/><line x1="4" y1="9" x2="8" y2="9"/>
              </svg>
              FILTERS
              {activeFilterCount > 0 && (
                <span style={{ background: c.gold, color: '#0a0a0a', borderRadius: '99px', padding: '1px 6px', fontSize: '9px', fontWeight: 700, marginLeft: '2px' }}>{activeFilterCount}</span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} style={{ background: 'transparent', border: 'none', color: c.textDim, fontSize: '10px', letterSpacing: '.05em', cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                CLEAR FILTERS ×
              </button>
            )}
          </div>
          <p style={{ fontSize: '11px', color: c.textDim }}>Click any pin to explore</p>
        </div>

        {/* Map area with optional filter panel */}
        <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>

          {/* ── Filter panel ── */}
          {panelOpen && (
            <div style={{
              width: '260px', flexShrink: 0, background: panelBg,
              borderRight: `0.5px solid ${panelBorder}`,
              overflowY: 'auto', padding: '20px 18px', zIndex: 10,
            }}>
              <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '20px', fontFamily: 'Arial, sans-serif' }}>FILTER PINS</p>

              {/* Country */}
              <div style={{ marginBottom: '18px' }}>
                <FilterLabel>Country</FilterLabel>
                <select value={fCountry} onChange={e => setFCountry(e.target.value)} style={selectStyle}>
                  <option value="">All countries</option>
                  {countries.map(co => <option key={co} value={co}>{co}</option>)}
                </select>
              </div>

              {/* Script */}
              <div style={{ marginBottom: '18px' }}>
                <FilterLabel>Script</FilterLabel>
                <select value={fScript} onChange={e => setFScript(e.target.value)} style={selectStyle}>
                  <option value="">All scripts</option>
                  {scripts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Material */}
              <div style={{ marginBottom: '18px' }}>
                <FilterLabel>Material</FilterLabel>
                <select value={fMaterial} onChange={e => setFMaterial(e.target.value)} style={selectStyle}>
                  <option value="">All materials</option>
                  {materials.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Location type */}
              <div style={{ marginBottom: '24px' }}>
                <FilterLabel>Location type</FilterLabel>
                {[
                  { value: '',        label: 'All' },
                  { value: 'insitu',  label: 'In situ (untouched)' },
                  { value: 'moved',   label: 'Moved (original known)' },
                  { value: 'current', label: 'Current location only' },
                ].map(opt => (
                  <div key={opt.value} onClick={() => setFInSitu(opt.value)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', cursor: 'pointer', borderRadius: '4px', marginBottom: '2px', background: fInSitu === opt.value ? 'rgba(212,168,67,0.08)' : 'transparent' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${fInSitu === opt.value ? c.gold : c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {fInSitu === opt.value && <div style={{ width: 7, height: 7, borderRadius: '50%', background: c.gold }} />}
                    </div>
                    <span style={{ fontSize: '11px', color: fInSitu === opt.value ? c.gold : c.textDim, fontFamily: 'Arial, sans-serif' }}>{opt.label}</span>
                  </div>
                ))}
              </div>

              {/* Pin legend */}
              <div style={{ borderTop: `0.5px solid ${panelBorder}`, paddingTop: '16px' }}>
                <FilterLabel>Pin legend</FilterLabel>
                {[
                  { color: PIN_GOLD,   label: 'In situ' },
                  { color: PIN_AMBER,  label: 'Moved' },
                  { color: PIN_SILVER, label: 'Current only' },
                ].map(({ color, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', color: legendDim, fontFamily: 'Arial, sans-serif' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Map ── */}
          <div style={{ flex: 1, position: 'relative' }}>
            {/* Layer switcher */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000, display: 'flex', borderRadius: '6px', overflow: 'hidden', border: `0.5px solid ${legendBorder}`, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {LAYERS.map((layer, i) => (
                <button key={layer.id} onClick={() => setActiveLayer(layer.id)}
                  style={{ ...layerBtnStyle(layer.id), borderRight: i < LAYERS.length - 1 ? `0.5px solid ${legendBorder}` : 'none' }}>
                  {layer.label}
                </button>
              ))}
            </div>

            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer key={tileKey} url={tileUrl} attribution={currentLayer.attribution} />
              {inscriptions.map(ins => (
                <Marker key={ins.id} position={pinPosition(ins)} icon={getPinIcon(ins)}>
                  <Popup>
                    <div style={{ fontFamily: 'Georgia, serif', minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: ins.original_location_known === false ? PIN_SILVER : ins.in_situ ? PIN_GOLD : PIN_AMBER }} />
                        <span style={{ fontSize: '9px', color: '#888', letterSpacing: '.08em', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>
                          {ins.original_location_known === false ? 'Current location' : ins.in_situ ? 'In situ' : 'Moved'}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#1a1a1a' }}>{ins.title}</p>
                      {ins.state_province && <p style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>{ins.state_province}</p>}
                      {ins.year          && <p style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>{ins.year}</p>}
                      {ins.script        && <p style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>{ins.script}</p>}
                      <button onClick={() => navigate(`/inscription/${ins.shila_id || ins.id}`)}
                        style={{ fontSize: '11px', background: '#d4a843', border: 'none', color: '#0a0a0a', padding: '4px 12px', borderRadius: '3px', cursor: 'pointer', fontWeight: 600 }}>
                        VIEW DETAILS
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  )
}