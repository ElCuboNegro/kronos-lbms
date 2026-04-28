import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import EspecieForm from '../components/EspecieForm'

export default function EspeciesList() {
  const navigate = useNavigate()
  const [especies, setEspecies] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => { fetchEspecies() }, [])

  async function fetchEspecies() {
    setLoading(true)
    try { setEspecies(await api.get('/especies')) }
    finally { setLoading(false) }
  }

  const filtradas = especies.filter(e =>
    e.nombre_cientifico.toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.nombre_comun || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.familia || '').toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <input
          style={s.search}
          placeholder="Buscar especie…"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <button style={s.btnSustratos} onClick={() => navigate('/medios')} title="Medios">🧪</button>
        <button style={s.btnAdd} onClick={() => setShowForm(true)}>+</button>
      </div>

      {loading
        ? <p style={s.muted}>Cargando…</p>
        : filtradas.length === 0
          ? <p style={s.muted}>{busqueda ? 'Sin resultados' : 'No hay especies registradas'}</p>
          : filtradas.map(e => (
              <EspecieCard key={e.id} e={e} onClick={() => navigate(`/especies/${e.id}`)} />
            ))
      }

      {showForm && (
        <EspecieForm 
          onSaved={(nueva) => { 
            setShowForm(false); 
            fetchEspecies();
            if (nueva) navigate(`/especies/${nueva.id}`);
          }} 
          onCancel={() => setShowForm(false)} 
        />
      )}
    </div>
  )
}

function EspecieCard({ e, onClick }) {
  return (
    <button style={s.card} onClick={onClick}>
      <div style={s.cardTop}>
        <span style={s.cientifico}>{e.nombre_cientifico}</span>
        <span style={s.familia}>{e.familia || 'Sin familia'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={s.categoriaBadge}>{e.categoria}</span>
        {e.nombre_comun && <p style={{...s.comun, margin: 0}}>{e.nombre_comun}</p>}
      </div>

      <div style={s.stats}>
        <Stat label="Líneas" val={e.total_lineas} />
        <Stat label="Individuos" val={e.total_individuos} />
      </div>
    </button>
  )
}

function Stat({ label, val }) {
  return (
    <span style={s.stat}>
      <span style={s.statVal}>{val}</span>
      <span style={s.statLabel}> {label}</span>
    </span>
  )
}

const s = {
  page: { padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 },
  topBar: { display: 'flex', gap: 8 },
  search: { flex: 1, background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 10, padding: '0.6rem 0.9rem', color: '#e0f0e5', fontSize: '0.95rem', outline: 'none' },
  btnSustratos: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 10, color: '#7dca8f', fontSize: '1.1rem', width: 44, cursor: 'pointer' },
  btnAdd: { background: '#2d7a47', border: 'none', borderRadius: 10, color: '#fff', fontSize: '1.4rem', width: 44, cursor: 'pointer' },
  card: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 12, padding: '0.9rem 1rem', textAlign: 'left', cursor: 'pointer', width: '100%' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 },
  cientifico: { color: '#7dca8f', fontSize: '1rem', fontWeight: 600, fontStyle: 'italic' },
  familia: { color: '#4a5568', fontSize: '0.75rem', flexShrink: 0 },
  comun: { color: '#a0c8b0', fontSize: '0.85rem', margin: '2px 0 6px' },
  categoriaBadge: { background: '#1a472a', color: '#7dca8f', fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, textTransform: 'uppercase', fontWeight: 'bold', border: '1px solid #2d5c3a' },
  stats: { display: 'flex', gap: 16 },
  stat: { color: '#4a8c5c', fontSize: '0.8rem' },
  statVal: { color: '#7dca8f', fontWeight: 700 },
  statLabel: {},
  muted: { color: '#4a5568', textAlign: 'center', padding: '2rem 0' },
}
