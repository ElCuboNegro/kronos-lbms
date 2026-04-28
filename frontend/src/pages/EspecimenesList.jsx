import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'

const ESTADO_COLOR = {
  activo: '#2d7a47', en_experimento: '#b07d1e',
  archivado: '#4a5568', contaminado: '#c0392b',
}

export default function EspecimenesList() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [especieInfo, setEspecieInfo] = useState(null)
  const [lineaInfo, setLineaInfo] = useState(null)

  const especieId = params.get('especie')
  const lineaId = params.get('linea')

  useEffect(() => {
    fetchItems()
    if (especieId) api.get(`/especies/${especieId}`).then(setEspecieInfo).catch(() => {})
    // Note: We don't have a direct /lineas/:id but EspecieDetail shows them.
  }, [especieId, lineaId])

  async function fetchItems() {
    setLoading(true)
    try {
      const data = await api.get('/especimenes')
      // Filtro básico en frontend por ahora
      let filtered = data
      if (especieId) filtered = filtered.filter(i => i.especie_id === especieId)
      if (lineaId) filtered = filtered.filter(i => i.linea_id === lineaId)
      setItems(filtered)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>Individuos</h2>
        {especieInfo && <p style={s.subtitle}>Especie: <span style={{fontStyle:'italic'}}>{especieInfo.nombre_cientifico}</span></p>}
        <p style={s.count}>{items.length} especímenes encontrados</p>
      </div>

      {loading ? (
        <p style={s.muted}>Cargando…</p>
      ) : (
        <div style={s.list}>
          {items.length === 0 ? (
            <p style={s.muted}>No hay individuos que coincidan con el filtro</p>
          ) : (
            items.map(i => (
              <div key={i.id} style={s.card} onClick={() => navigate(`/especimen/${i.id}`)}>
                <div style={s.cardTop}>
                  <span style={s.uid}>{i.uid}</span>
                  <span style={{ ...s.badge, background: ESTADO_COLOR[i.estado] || '#555' }}>{i.estado}</span>
                </div>
                <p style={s.cardEspecie}>{i.especie}</p>
                {i.linea_nombre && <p style={s.cardLinea}>Línea: {i.linea_nombre}</p>}
                <p style={s.cardFecha}>Ingreso: {new Date(i.fecha_ingreso).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const s = {
  page: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header: { marginBottom: '0.5rem' },
  title: { color: '#7dca8f', margin: 0, fontSize: '1.4rem' },
  subtitle: { color: '#a0c8b0', margin: '4px 0', fontSize: '0.9rem' },
  count: { color: '#4a8c5c', fontSize: '0.8rem', margin: 0 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 12, padding: '0.9rem', cursor: 'pointer' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  uid: { color: '#7dca8f', fontWeight: 'bold', fontFamily: 'monospace' },
  badge: { borderRadius: 20, padding: '0.1rem 0.6rem', fontSize: '0.65rem', color: '#fff', textTransform: 'uppercase', fontWeight: 600 },
  cardEspecie: { color: '#e0f0e5', margin: 0, fontSize: '0.95rem', fontWeight: 500 },
  cardLinea: { color: '#4a8c5c', margin: '2px 0', fontSize: '0.82rem' },
  cardFecha: { color: '#4a5568', margin: '4px 0 0', fontSize: '0.75rem' },
  muted: { color: '#4a5568', textAlign: 'center', padding: '2rem' },
}
