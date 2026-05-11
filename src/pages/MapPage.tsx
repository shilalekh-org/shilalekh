import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Nav from '../components/Nav'
import { supabase } from '../supabase'
import { useTheme } from '../theme'

// ─── Pin colours ──────────────────────────────────────────────────────────────

const PIN_GOLD   = '#d4a843'  // original location · in situ
const PIN_AMBER  = '#c87533'  // original location · moved
const PIN_SILVER = '#a0a0aa'  // original unknown · current known

const createPinIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<svg width="22" height="34" viewBox="0 0 22 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 0C5.477 0 1 4.477 1 10c0 8 10 24 10 24S21 18 21 10C21 4.477 16.523 0 11 0z"
        fill="${color}" stroke="rgba(0,0,0,0.28)" stroke-width="1.2"/>
      <circle cx="11" cy="10" r="4" fill="rgba(0,0,0,0.18)"/>
    </svg>`,
    iconSize: [22, 34],
    iconAnchor: [11, 34],
    popupAnchor: [0, -34],
  })

const goldIcon   = createPinIcon(PIN_GOLD)
const amberIcon  = createPinIcon(PIN_AMBER)
const silverIcon = createPinIcon(PIN_SILVER)

const getPinIcon = (inscription: any) => {
  if (inscription.original_location_known !== false) {
    return inscription.in_situ ? goldIcon : amberIcon
  }
  return silverIcon
}

// ─── Layer config ─────────────────────────────────────────────────────────────

type LayerType = 'default' | 'street' | 'satellite'

const LAYERS: { id: LayerType; label: string; url: string; attribution: string }[] = [
  {
    id: 'default',
    label: 'Default',
    url: '',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
  },
  {
    id: 'street',
    label: 'Street',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© <a href="https://www.esri.com">Esri</a>',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function MapPage() {
  const navigate = useNavigate()
  const { c, theme } = useTheme()
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLayer, setActiveLayer] = useState<LayerType>('default')

  const defaultTileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  const currentLayer = LAYERS.find(l => l.id === activeLayer)!
  const tileUrl = activeLayer === 'default' ? defaultTileUrl : currentLayer.url
  const tileKey = activeLayer === 'default' ? `default-${theme}` : activeLayer

  useEffect(() => {
    supabase
      .from('inscriptions')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data) {
          setInscriptions(
            data.filter((i: any) => {
              if (i.status !== 'approved') return false
              // Original location known — use original coords
              if (i.original_location_known !== false && i.latitude && i.longitude) return true
              // Original unknown but current known — use current coords
              if (i.original_location_known === false && i.current_lat && i.current_lng) return true
              return false
            })
          )
        }
        setLoading(false)
      })
  }, [])

  // Resolve the position to render the pin at
  const pinPosition = (inscription: any): [number, number] => {
    if (inscription.original_location_known === false && inscription.current_lat && inscription.current_lng) {
      return [inscription.current_lat, inscription.current_lng]
    }
    return [inscription.latitude, inscription.longitude]
  }

  const layerBtnStyle = (id: LayerType) => ({
    padding: '5px 12px',
    fontSize: '11px',
    fontFamily: 'Georgia, serif',
    letterSpacing: '.04em',
    cursor: 'pointer',
    border: 'none',
    background: activeLayer === id
      ? (theme === 'dark' ? '#e8d8b0' : '#3d2a0a')
      : (theme === 'dark' ? 'rgba(10,10,10,0.85)' : 'rgba(245,240,228,0.92)'),
    color: activeLayer === id
      ? (theme === 'dark' ? '#0a0a0a' : '#e8d8b0')
      : (theme === 'dark' ? '#e8d8b0' : '#3d2a0a'),
    transition: 'all 0.15s',
  })

  // Legend panel colours — adapt to theme
  const legendBg   = theme === 'dark' ? 'rgba(10,10,10,0.88)' : 'rgba(245,240,228,0.94)'
  const legendBorder = theme === 'dark' ? 'rgba(232,216,176,0.18)' : 'rgba(61,42,10,0.18)'
  const legendText  = theme === 'dark' ? '#e8d8b0' : '#3d2a0a'
  const legendDim   = theme === 'dark' ? 'rgba(232,216,176,0.45)' : 'rgba(61,42,10,0.45)'

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>

      <Nav />

      <div style={{ paddingTop: '60px', height: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header bar */}
        <div style={{
          padding: '16px 32px',
          borderBottom: `0.5px solid ${c.borderLight}`,
          background: c.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: c.orange, marginBottom: '2px' }}>EXPLORE</p>
            <p style={{ fontSize: '14px', color: c.text, fontWeight: 300 }}>
              Inscriptions on the map —{' '}
              <span style={{ color: c.gold }}>
                {loading ? 'loading...' : `${inscriptions.length} locations`}
              </span>
            </p>
          </div>
          <p style={{ fontSize: '11px', color: c.textDim }}>Click any pin to explore</p>
        </div>

        {/* Map area */}
        <div style={{ flex: 1, position: 'relative' }}>

          {/* Layer switcher — top right */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 1000,
            display: 'flex',
            borderRadius: '6px',
            overflow: 'hidden',
            border: `0.5px solid ${legendBorder}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {LAYERS.map((layer, i) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                style={{
                  ...layerBtnStyle(layer.id),
                  borderRight: i < LAYERS.length - 1
                    ? `0.5px solid ${legendBorder}`
                    : 'none',
                }}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {/* Pin legend — bottom left */}
          <div style={{
            position: 'absolute',
            bottom: '32px',
            left: '16px',
            zIndex: 1000,
            background: legendBg,
            border: `0.5px solid ${legendBorder}`,
            borderRadius: '6px',
            padding: '10px 14px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            minWidth: '210px',
          }}>
            <p style={{
              fontSize: '9px', letterSpacing: '.14em', color: legendDim,
              fontFamily: 'Arial, sans-serif', marginBottom: '9px',
              textTransform: 'uppercase',
            }}>Map Legend</p>
            {[
              { color: PIN_GOLD,   label: 'In situ',               desc: 'Original location, untouched' },
              { color: PIN_AMBER,  label: 'Moved',                  desc: 'Original location, now relocated' },
              { color: PIN_SILVER, label: 'Current location only',  desc: 'Original location unknown' },
            ].map(({ color, label, desc }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', marginBottom: '7px' }}>
                {/* Mini pin SVG */}
                <svg width="12" height="18" viewBox="0 0 22 34" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <path d="M11 0C5.477 0 1 4.477 1 10c0 8 10 24 10 24S21 18 21 10C21 4.477 16.523 0 11 0z"
                    fill={color} stroke="rgba(0,0,0,0.28)" strokeWidth="1.2"/>
                  <circle cx="11" cy="10" r="4" fill="rgba(0,0,0,0.18)"/>
                </svg>
                <div>
                  <span style={{ fontSize: '11px', color: legendText, fontFamily: 'Georgia, serif', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '10px', color: legendDim, fontFamily: 'Arial, sans-serif', display: 'block', marginTop: '1px' }}>{desc}</span>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', marginTop: '2px' }}>
              <div style={{ width: 12, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', border: `1.5px solid ${legendDim}` }} />
              </div>
              <div>
                <span style={{ fontSize: '11px', color: legendDim, fontFamily: 'Georgia, serif', fontWeight: 600 }}>Not on map</span>
                <span style={{ fontSize: '10px', color: legendDim, fontFamily: 'Arial, sans-serif', display: 'block', marginTop: '1px' }}>Both locations unknown</span>
              </div>
            </div>
          </div>

          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              key={tileKey}
              url={tileUrl}
              attribution={currentLayer.attribution}
            />
            {inscriptions.map((inscription) => (
              <Marker
                key={inscription.id}
                position={pinPosition(inscription)}
                icon={getPinIcon(inscription)}
              >
                <Popup>
                  <div style={{ fontFamily: 'Georgia, serif', minWidth: '200px' }}>
                    {/* Pin type indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <svg width="9" height="14" viewBox="0 0 22 34" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 0C5.477 0 1 4.477 1 10c0 8 10 24 10 24S21 18 21 10C21 4.477 16.523 0 11 0z"
                          fill={
                            inscription.original_location_known === false
                              ? PIN_SILVER
                              : inscription.in_situ ? PIN_GOLD : PIN_AMBER
                          }
                          stroke="rgba(0,0,0,0.28)" strokeWidth="1.2"/>
                        <circle cx="11" cy="10" r="4" fill="rgba(0,0,0,0.18)"/>
                      </svg>
                      <span style={{ fontSize: '9px', color: '#888', letterSpacing: '.08em', fontFamily: 'Arial, sans-serif', textTransform: 'uppercase' }}>
                        {inscription.original_location_known === false
                          ? 'Current location'
                          : inscription.in_situ ? 'In situ' : 'Moved'}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#1a1a1a' }}>
                      {inscription.title}
                    </p>
                    {inscription.state_province && (
                      <p style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                        {inscription.state_province}
                      </p>
                    )}
                    {inscription.year && (
                      <p style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>
                        {inscription.year}
                      </p>
                    )}
                    {inscription.type && (
                      <p style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                        {inscription.type}
                      </p>
                    )}
                    <button
                      onClick={() => navigate(`/inscription/${inscription.id}`)}
                      style={{
                        fontSize: '11px',
                        background: '#d4a843',
                        border: 'none',
                        color: '#0a0a0a',
                        padding: '4px 12px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
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
  )
}