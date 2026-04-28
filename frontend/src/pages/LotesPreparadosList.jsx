import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function LotesPreparadosList() {
  const [lotes, setLotes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLotes = async () => {
    setLoading(true)
    try { setLotes(await api.get('/reactivos/lotes')) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchLotes() }, [])

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>Lotes Preparados</h2>
      </div>

      {loading ? <p style={s.muted}>Cargando…</p> : (
        <div style={s.list}>
          {lotes.length === 0 ? <p style={s.muted}>No hay lotes preparados aún</p> : (
            lotes.map(l => (
              <div key={l.id} style={s.card}>
                <div style={s.cardTop}>
                  <span style={s.uid}>{l.uid}</span>
                  <span style={{ ...s.badge, background: l.estado === 'disponible' ? '#2d7a47' : '#4a5568' }}>{l.estado}</span>
                </div>
                <h3 style={s.nombre}>{l.formulacion.nombre}</h3>
                <div style={s.meta}>
                  <span>Volumen: {l.volumen_l}L</span>
                  <span>Conc: {l.concentracion_x}x</span>
                </div>
                <div style={s.dates}>
                  <p>Prep: {new Date(l.fecha_preparacion).toLocaleDateString()}</p>
                  <p style={{ color: new Date(l.fecha_expiracion) < new Date() ? '#f28b82' : '#7dca8f' }}>
                    Exp: {new Date(l.fecha_expiracion).toLocaleDateString()}
                  </p>
                </div>
                <button style={s.btnPrint} onClick={() => alert('Imprimiendo etiqueta de reactivo...')}>
                  🖨 Re-imprimir etiqueta
                </button>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#7dca8f', margin: 0, fontSize: '1.3rem' },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 12, padding: '1rem' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  uid: { color: '#7dca8f', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '0.9rem' },
  badge: { borderRadius: 20, padding: '0.1rem 0.6rem', fontSize: '0.6rem', color: '#fff', textTransform: 'uppercase' },
  nombre: { color: '#e0f0e5', margin: '4px 0', fontSize: '1.05rem' },
  meta: { display: 'flex', gap: 15, color: '#4a8c5c', fontSize: '0.82rem', fontWeight: 600, margin: '5px 0' },
  dates: { fontSize: '0.75rem', color: '#4a5568', marginTop: 8 },
  btnPrint: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, color: '#7dca8f', padding: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', marginTop: 10, width: '100%' },
  muted: { color: '#4a5568', textAlign: 'center', padding: '2rem' },
}
