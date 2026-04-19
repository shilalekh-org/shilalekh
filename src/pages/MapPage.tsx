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

export default function MapPage() {
  const navigate = useNavigate()
  const { c } = useTheme()
  const [inscriptions, setInscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('inscriptions')
      .select('*')
      .then(({ data, error }) => {
        console.log('Map data:', data, 'Error:', error)
        if (!error && data) {
          setInscriptions(data.filter((i: any) => i.status === 'approved' && i.latitude && i.longitude))
        }
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: 'Georgia, serif' }}>

      <Nav />

      <div style={{ paddingTop: '60px', height: '100vh', display: 'flex', flexDirection: 'column' }}>

        <div style={{ padding: '16px 32px', borderBottom: `0.5px solid ${c.borderLight}`, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

        <div style={{ flex: 1 }}>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%', background: '#111' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
            />
            {inscriptions.map((inscription) => (
              <Marker
                key={inscription.id}
                position={[inscription.latitude, inscription.longitude]}
                icon={defaultIcon}
              >
                <Popup>
                  <div style={{ fontFamily: 'Georgia, serif', minWidth: '200px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#1a1a1a' }}>{inscription.title}</p>
                    {inscription.state_proviance && <p style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>{inscription.state_proviance}</p>}
                    {inscription.year && <p style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>{inscription.year}</p>}
                    {inscription.type && <p style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>{inscription.type}</p>}
                    <button
                      onClick={() => navigate(`/inscription/${inscription.id}`)}
                      style={{ fontSize: '11px', background: '#d4a843', border: 'none', color: '#0a0a0a', padding: '4px 12px', borderRadius: '3px', cursor: 'pointer', fontWeight: 600 }}
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