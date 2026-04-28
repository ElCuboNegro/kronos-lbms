import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default Leaflet icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  return position === null ? null : (
    <Marker position={position} />
  )
}

export default function MapPicker({ value, onChange }) {
  // value is expected to be { lat: number, lng: number } or null
  const [locating, setLocating] = useState(false)
  const defaultCenter = [19.4326, -99.1332] // CDMX fallback

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalización no soportada por el navegador")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      (err) => {
        console.warn("Error al obtener ubicación:", err)
        alert("No se pudo obtener la ubicación.")
        setLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }

  const center = value ? [value.lat, value.lng] : defaultCenter

  return (
    <div style={s.wrap}>
      <div style={s.topRow}>
        <span style={s.coordsDisplay}>
          {value ? `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}` : 'Sin ubicar'}
        </span>
        <button type="button" style={s.btnLocate} onClick={handleGetLocation} disabled={locating}>
          {locating ? 'Activando GPS...' : '📍 En este lugar'}
        </button>
      </div>
      
      <div style={s.mapContainer}>
        <MapContainer 
          center={center} 
          zoom={value ? 16 : 4} 
          style={{ height: '100%', width: '100%', borderRadius: 8, zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={value} setPosition={onChange} />
        </MapContainer>
      </div>
      <p style={s.hint}>Toca el mapa para ajustar el pin</p>
    </div>
  )
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  coordsDisplay: { color: '#a0c8b0', fontSize: '0.85rem', fontStyle: 'italic' },
  btnLocate: { background: '#2d7a47', border: 'none', borderRadius: 8, color: '#fff', padding: '0.6rem 1rem', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
  mapContainer: { height: 200, width: '100%', borderRadius: 8, border: '2px solid #2d7a47', overflow: 'hidden', marginTop: 4 },
  hint: { color: '#4a5568', fontSize: '0.75rem', margin: 0, textAlign: 'center' },
}