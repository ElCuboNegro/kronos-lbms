import { useState, useEffect } from 'react'
import { api } from '../api/client'

function PrintLoteBtn({ id }) {
  const [printing, setPrinting] = useState(false)

  const handlePrint = async (e) => {
    e.stopPropagation()
    setPrinting(true)
    try {
      await api.post(`/printer/imprimir-lote/${id}`)
    } catch (err) {
      alert(err.message)
    } finally {
      setPrinting(false)
    }
  }

  return (
    <button 
      className="btn btn--ghost" 
      style={{ padding: '0.2rem 0.5rem', fontSize: '0.9rem' }} 
      onClick={handlePrint} 
      disabled={printing}
      title="Imprimir Etiqueta"
    >
      {printing ? '…' : '🖨'}
    </button>
  )
}

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
    <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 className="page-title" style={{color:'var(--theme-primary)',margin:0,fontSize:'1.3rem'}}>Lotes Preparados</h2>
      </div>

      {loading ? <p style={{color:'var(--theme-text-muted)',textAlign:'center',padding:'2rem'}}>Cargando…</p> : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {lotes.length === 0 ? <p style={{color:'var(--theme-text-muted)',textAlign:'center',padding:'2rem'}}>No hay lotes preparados aún</p> : (
            lotes.map(l => (
              <div key={l.id} className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                    <span style={{color:'var(--theme-primary)',fontWeight:'bold',fontFamily:'monospace',fontSize:'0.9rem'}}>{l.uid}</span>
                    <PrintLoteBtn id={l.id} />
                  </div>
                  <span style={{ borderRadius:20,padding:'0.1rem 0.6rem',fontSize:'0.6rem',color:'#fff',textTransform:'uppercase', background: l.estado === 'disponible' ? 'var(--theme-primary)' : 'var(--theme-text-muted)' }}>{l.estado}</span>
                </div>
                <h3 style={{color:'var(--theme-text)',margin:'4px 0',fontSize:'1.05rem'}}>{l.formulacion.nombre}</h3>
                <div style={{display:'flex',gap:15,color:'var(--theme-secondary)',fontSize:'0.82rem',fontWeight:600,margin:'5px 0'}}>
                  <span>Volumen: {l.volumen_l}L</span>
                  <span>Conc: {l.concentracion_x}x</span>
                </div>
                <div style={{fontSize:'0.75rem',color:'var(--theme-text-muted)',marginTop:8}}>
                  <p>Prep: {new Date(l.fecha_preparacion).toLocaleDateString()}</p>
                  <p style={{ color: new Date(l.fecha_expiracion) < new Date() ? 'var(--error)' : 'var(--theme-primary)' }}>
                    Exp: {new Date(l.fecha_expiracion).toLocaleDateString()}
                  </p>
                </div>
                <button style={{background:'var(--theme-background)',border:'1px solid var(--theme-border)',borderRadius:8,color:'var(--theme-primary)',padding:'0.5rem',fontSize:'0.8rem',cursor:'pointer',marginTop:10,width:'100%'}} onClick={() => alert('Imprimiendo etiqueta de reactivo...')}>
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

