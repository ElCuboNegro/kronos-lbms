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

  if (loading) return <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'1rem'}}><p style={{color:'var(--theme-text-muted)'}}>Cargando…</p></div>
  if (!el) return <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'1rem'}}><p style={{color:'var(--error)'}}>No encontrado</p></div>

  return (
    <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div className="page-header" style={{display:'flex',flexDirection:'column',gap:4}}>
        <span style={{color:'var(--theme-secondary)',fontSize:'0.8rem',fontWeight:600,textTransform:'uppercase'}}>{el.tipo}</span>
        <h2 style={{color:'var(--theme-primary)',margin:0,fontSize:'1.3rem'}}>{el.descripcion}</h2>
        <p style={{color:'var(--theme-secondary)',margin:0,fontFamily:'monospace'}}>ID: {el.element_id}</p>
      </div>

      <div className="card">
        <Row label="Estado" value={el.estado} />
        {el.cantidad != null && <Row label="Cantidad" value={`${el.cantidad} ${el.unidad || ''}`} />}
        {el.notas && <Row label="Notas" value={el.notas} />}
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{color:'var(--theme-primary)',margin:0,fontSize:'1rem'}}>Historial</h3>
          <button style={{background:'var(--theme-primary)',border:'none',borderRadius:20,color:'#fff',padding:'0.35rem 1rem',fontSize:'0.85rem',cursor:'pointer'}} onClick={() => setShowEvento(true)}>+ Evento</button>
        </div>
        {el.eventos.length === 0
          ? <p style={{color:'var(--theme-text-muted)'}}>Sin eventos</p>
          : el.eventos.map(ev => (
              <div key={ev.id} style={{background:'var(--theme-surface)',borderRadius:10,padding:'0.75rem 1rem'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{color:'var(--theme-primary)',fontSize:'0.8rem',fontWeight:600,textTransform:'uppercase'}}>{ev.tipo}</span>
                  <span style={{color:'var(--theme-text-muted)',fontSize:'0.75rem'}}>{new Date(ev.timestamp).toLocaleDateString('es-MX')}</span>
                </div>
                <p style={{color:'var(--theme-text)',fontSize:'0.9rem',margin:0}}>{ev.descripcion}</p>
                <p style={{color:'var(--theme-secondary)',fontSize:'0.75rem',margin:0}}>por {ev.usuario_nombre}</p>
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
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--theme-background)' }}>
      <span style={{ color: 'var(--theme-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
      <span style={{ color: 'var(--theme-text)', fontSize: '0.9rem' }}>{value}</span>
    </div>
  )
}
