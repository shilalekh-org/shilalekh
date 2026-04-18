import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Nav from '../components/Nav'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [0, -32],
})

const sampleInscriptions = [
  { id: 1, title: 'Naneghat Cave Inscription', lat: 19.1833, lng: 73.6833, type: 'Cave inscription', period: '~100 BCE', state: 'Maharashtra' },
  { id: 2, title: 'Halmidi Inscription', lat: 13.6167, lng: 75.9833, type: 'Stone inscription', period: '450 CE', state: 'Karnataka' },
  { id: 3, title: 'Iron Pillar of Delhi', lat: 28.5244, lng: 77.1855, type: 'Pillar inscription', period: '4th century CE', state: 'Delhi' },
  { id: 4, title: 'Maski Rock Edict', lat: 15.9833, lng: 76.6500, type: 'Rock edict', period: '3rd century BCE', state: 'Karnataka' },
  { id: 5, title: 'Aihole Inscription', lat: 16.0167, lng: 75.8833, type: 'Temple inscription', period: '634 CE', state: 'Karnataka' },
  { id: 6, title: 'Nashik Caves Inscription', lat: 19.9975, lng: 73.8278, type: 'Cave inscription', period: '1st–3rd century CE', state: 'Maharashtra' },
  { id: 7, title: 'Ghosundi Inscription', lat: 24.5833, lng: 74.7167, type: 'Stone inscription', period: '1st century BCE', state: 'Rajasthan' },
  { id: 8, title: 'Talagunda Inscription', lat: 14.2167, lng: 75.4833, type: 'Pillar inscription', period: '5th century CE', state: 'Karnataka' },
]

export default function MapPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e8e4d9', fontFamily: 'Georgia, serif' }}>

      <Nav />

      <div style={{ paddingTop: '60px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 32px', borderBottom: '0.5px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '10px', letterSpacing: '.2em', color: '#c4622d', marginBottom: '2px' }}>EXPLORE</p>
            <p style={{ fontSize: '14px', color: '#e8e4d9', fontWeight: 300 }}>Inscriptions on the map — <span style={{ color: '#d4a843' }}>{sampleInscriptions.length} locations</span></p>
          </div>
          <p style={{ fontSize: '11px', color: '#555250' }}>Click any pin to explore</p>
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
            {sampleInscriptions.map((inscription) => (
              <Marker
                key={inscription.id}
                position={[inscription.lat, inscription.lng]}
                icon={defaultIcon}
              >
                <Popup>
                  <div style={{ fontFamily: 'Georgia, serif', minWidth: '180px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px', color: '#1a1a1a' }}>{inscription.title}</p>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>{inscription.state} · {inscription.period}</p>
                    <p style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>{inscription.type}</p>
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