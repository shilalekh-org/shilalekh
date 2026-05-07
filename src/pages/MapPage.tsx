import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Nav from '../components/Nav'
import { supabase } from '../supabase'
import { useTheme } from '../theme'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [0, -32],
})

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
          setInscriptions(data.filter((i: any) => i.status === 'approved' && i.latitude && i.longitude))
        }
        setLoading(false)
      })
  }, [])

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

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>

      <Nav />

      <div style={{ paddingTop: '60px', height: '100vh', display: 'flex', flexDirection: 'column' }}>

        <div style={{
          padding: '16px 32px',
          borderBottom: `0.5px solid ${c.borderLight}`,
          background: c.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
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

        <div style={{ flex: 1, position: 'relative' }}>

          {/* Layer switcher */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 1000,
            display: 'flex',
            borderRadius: '6px',
            overflow: 'hidden',
            border: theme === 'dark' ? '0.5px solid rgba(232,216,176,0.25)' : '0.5px solid rgba(61,42,10,0.2)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {LAYERS.map((layer, i) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                style={{
                  ...layerBtnStyle(layer.id),
                  borderRight: i < LAYERS.length - 1
                    ? (theme === 'dark' ? '0.5px solid rgba(232,216,176,0.15)' : '0.5px solid rgba(61,42,10,0.15)')
                    : 'none',
                }}
              >
                {layer.label}
              </button>
            ))}
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
                position={[inscription.latitude, inscription.longitude]}
                icon={defaultIcon}
              >
                <Popup>
                  <div style={{ fontFamily: 'Georgia, serif', minWidth: '200px' }}>
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