import { useState } from 'react'
import { api } from '../api/client'

const TIPOS = ['siembra', 'transferencia', 'contaminacion', 'observacion', 'cosecha', 'entrada', 'salida', 'otro']

export default function EventoForm({ especimenId, elementoId, onSaved, onCancel }) {
  const [tipo, setTipo] = useState('observacion')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/eventos', {
        tipo,
        descripcion,
        especimen_id: especimenId || undefined,
        elemento_id: elementoId || undefined,
      })
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{position:'fixed',inset:0,background:'#0009',display:'flex',alignItems:'flex-end',zIndex:100}}>
      <div style={{background:'var(--bio-surface)',borderRadius:'16px 16px 0 0',padding:'1.5rem',width:'100%',maxHeight:'80dvh',overflowY:'auto'}}>
        <h3 className="page-title" style={{color:'var(--bio-primary)',margin:'0 0 1rem'}}>Registrar evento</h3>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:10}}>
          <label style={{color:'var(--bio-secondary)',fontSize:'0.8rem',fontWeight:600}}>Tipo</label>
          <select style={{background:'var(--bio-background)',border:'1px solid var(--bio-border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--bio-text)',fontSize:'1rem'}} value={tipo} onChange={e => setTipo(e.target.value)}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <label style={{color:'var(--bio-secondary)',fontSize:'0.8rem',fontWeight:600}}>Descripción</label>
          <textarea
            style={{ background:'var(--bio-background)',border:'1px solid var(--bio-border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--bio-text)',fontSize:'1rem', minHeight: 80, resize: 'vertical' }}
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            placeholder="Observaciones, condiciones, notas…"
            required
          />

          {error && <p style={{color:'var(--error)',fontSize:'0.85rem',margin:0}}>{error}</p>}

          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button type="button" style={{flex:1,background:'var(--bio-surface)',border:'1px solid var(--bio-border)',borderRadius:8,color:'var(--bio-primary)',padding:'0.75rem',fontSize:'0.95rem',cursor:'pointer'}} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={{flex:2,background:'var(--bio-primary)',border:'none',borderRadius:8,color:'#fff',padding:'0.75rem',fontSize:'0.95rem',fontWeight:600,cursor:'pointer'}} disabled={loading}>
              {loading ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

