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
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Bienvenido,</p>
        <h2 className="text-primary" style={{ margin: 0, fontSize: '1.5rem' }}>{user?.nombre}</h2>
      </div>
      <div className="grid-2">
        {sections.map(sec => (
          <button 
            key={sec.path} 
            className="tile"
            onClick={() => navigate(sec.path)}
          >
            <span style={{ fontSize: '1.5rem' }}>{sec.icon}</span>
            <span className="text-primary" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{sec.label}</span>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{sec.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

