import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const sections = [
    { label: 'Escanear QR', icon: '⬛', path: '/scan', desc: 'Identificar etiqueta con cámara' },
    { label: 'Especies', icon: '🌿', path: '/especies', desc: 'Especies, líneas, variegaciones e individuos' },
    { label: 'Elementos', icon: '🧪', path: '/elementos', desc: 'Reactivos, equipos e insumos' },
    { label: 'Protocolos', icon: '📋', path: '/protocolos', desc: 'Procedimientos y validaciones' },
    { label: 'Experimentos', icon: '🔬', path: '/experimentos', desc: 'Seguimiento experimental' },
    { label: 'Resultados', icon: '📊', path: '/resultados', desc: 'Resultados de investigación' },
  ]

  return (
    <div style={s.page}>
      <div style={s.greeting}>
        <p style={s.sub}>Bienvenido,</p>
        <h2 style={s.name}>{user?.nombre}</h2>
      </div>
      <div style={s.grid}>
        {sections.map(sec => (
          <button key={sec.path} style={s.tile} onClick={() => navigate(sec.path)}>
            <span style={s.icon}>{sec.icon}</span>
            <span style={s.tileLabel}>{sec.label}</span>
            <span style={s.tileDesc}>{sec.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const s = {
  page: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  greeting: { display: 'flex', flexDirection: 'column', gap: 2 },
  sub: { color: '#4a8c5c', margin: 0, fontSize: '0.85rem' },
  name: { color: '#7dca8f', margin: 0, fontSize: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  tile: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 14, padding: '1.1rem 0.9rem', display: 'flex', flexDirection: 'column', gap: 4, cursor: 'pointer', textAlign: 'left' },
  icon: { fontSize: '1.5rem' },
  tileLabel: { color: '#7dca8f', fontSize: '0.95rem', fontWeight: 600 },
  tileDesc: { color: '#4a8c5c', fontSize: '0.75rem' },
}
