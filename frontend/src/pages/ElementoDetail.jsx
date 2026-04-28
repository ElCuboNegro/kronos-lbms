import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { api } from '../api/client'
import EventoForm from '../components/EventoForm'

export default function ElementoDetail() {
  const { id } = useParams()
  const location = useLocation()
  const [el, setEl] = useState(location.state?.data || null)
  const [showEvento, setShowEvento] = useState(false)
  const [loading, setLoading] = useState(!el)

  async function fetchEl() {
    setLoading(true)
    try { setEl(await api.get(`/elementos/${id}`)) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (!el) fetchEl() }, [id])

  if (loading) return <div style={s.page}><p style={s.muted}>Cargando…</p></div>
  if (!el) return <div style={s.page}><p style={s.error}>No encontrado</p></div>

  return (
    <div style={s.page}>
      <div style={s.header}>
        <span style={s.tipo}>{el.tipo}</span>
        <h2 style={s.desc}>{el.descripcion}</h2>
        <p style={s.uid}>ID: {el.element_id}</p>
      </div>

      <div style={s.card}>
        <Row label="Estado" value={el.estado} />
        {el.cantidad != null && <Row label="Cantidad" value={`${el.cantidad} ${el.unidad || ''}`} />}
        {el.notas && <Row label="Notas" value={el.notas} />}
      </div>

      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h3 style={s.sectionTitle}>Historial</h3>
          <button style={s.btnAdd} onClick={() => setShowEvento(true)}>+ Evento</button>
        </div>
        {el.eventos.length === 0
          ? <p style={s.muted}>Sin eventos</p>
          : el.eventos.map(ev => (
              <div key={ev.id} style={s.eventoCard}>
                <div style={s.eventoTop}>
                  <span style={s.eventoTipo}>{ev.tipo}</span>
                  <span style={s.eventoFecha}>{new Date(ev.timestamp).toLocaleDateString('es-MX')}</span>
                </div>
                <p style={s.eventoDesc}>{ev.descripcion}</p>
                <p style={s.eventoUser}>por {ev.usuario_nombre}</p>
              </div>
            ))
        }
      </div>

      {showEvento && (
        <EventoForm
          elementoId={el.id}
          onSaved={() => { setShowEvento(false); fetchEl() }}
          onCancel={() => setShowEvento(false)}
        />
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #0f1f13' }}>
      <span style={{ color: '#4a8c5c', fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
      <span style={{ color: '#e0f0e5', fontSize: '0.9rem' }}>{value}</span>
    </div>
  )
}

const s = {
  page: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header: { display: 'flex', flexDirection: 'column', gap: 4 },
  tipo: { color: '#4a8c5c', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' },
  desc: { color: '#7dca8f', margin: 0, fontSize: '1.3rem' },
  uid: { color: '#4a8c5c', margin: 0, fontFamily: 'monospace' },
  card: { background: '#1a2e1e', borderRadius: 12, padding: '0.75rem 1rem' },
  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#7dca8f', margin: 0, fontSize: '1rem' },
  btnAdd: { background: '#2d7a47', border: 'none', borderRadius: 20, color: '#fff', padding: '0.35rem 1rem', fontSize: '0.85rem', cursor: 'pointer' },
  eventoCard: { background: '#1a2e1e', borderRadius: 10, padding: '0.75rem 1rem' },
  eventoTop: { display: 'flex', justifyContent: 'space-between' },
  eventoTipo: { color: '#7dca8f', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' },
  eventoFecha: { color: '#4a5568', fontSize: '0.75rem' },
  eventoDesc: { color: '#e0f0e5', fontSize: '0.9rem', margin: 0 },
  eventoUser: { color: '#4a8c5c', fontSize: '0.75rem', margin: 0 },
  muted: { color: '#4a5568' },
  error: { color: '#f28b82' },
}
