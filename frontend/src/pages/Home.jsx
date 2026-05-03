import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const operations = [
    { label: 'Escanear', icon: '⬛', path: '/scan', desc: 'Identificar etiqueta' },
    { label: 'Especies', icon: '🌿', path: '/especies', desc: 'Genealogía e individuos' },
    { label: 'Contenedores', icon: '🗃️', path: '/contenedores', desc: 'Agrupar especímenes' },
    { label: 'Protocolos', icon: '📋', path: '/protocolos', desc: 'Procedimientos SOP' },
    { label: 'Elementos', icon: '🔧', path: '/elementos', desc: 'Equipos e insumos' },
  ]

  const laboratory = [
    { label: 'Reactivos', icon: '🧪', path: '/reactivos', desc: 'Químicos y sales' },
    { label: 'Recetario', icon: '📖', path: '/formulaciones', desc: 'Recetas de medios' },
    { label: 'Lotes Prep.', icon: '📦', path: '/lotes', desc: 'Historial de medios' },
    { label: 'Sustratos', icon: '🪨', path: '/lab', desc: 'Catálogo de agares' },
    { label: 'Herramientas', icon: '🧮', path: '/calculadoras', desc: 'Diluciones y molaridad' },
  ]

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Bienvenido,</p>
        <h2 className="text-primary" style={{ margin: 0, fontSize: '1.5rem' }}>{user?.nombre}</h2>
      </div>

      <div>
        <h3 style={{ color: 'var(--theme-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 1rem 0' }}>Biología y Operaciones</h3>
        <div className="grid-2">
          {operations.map(sec => (
            <button key={sec.path} className="tile" onClick={() => navigate(sec.path)}>
              <span style={{ fontSize: '1.5rem' }}>{sec.icon}</span>
              <span className="text-primary" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{sec.label}</span>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>{sec.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ color: 'var(--theme-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 1rem 0' }}>Laboratorio Químico</h3>
        <div className="grid-2">
          {laboratory.map(sec => (
            <button key={sec.path} className="tile" onClick={() => navigate(sec.path)}>
              <span style={{ fontSize: '1.5rem' }}>{sec.icon}</span>
              <span className="text-primary" style={{ fontSize: '0.95rem', fontWeight: 600 }}>{sec.label}</span>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>{sec.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
