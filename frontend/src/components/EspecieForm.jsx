import { useState } from 'react'
import { api } from '../api/client'

export default function EspecieForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({ 
    codigo: '', 
    nombre_cientifico: '', 
    categoria: 'especie',
    nombre_comun: '', 
    familia: '', 
    genero: '', 
    descripcion: '' 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    if (!form.codigo) { setError('El código de especie es obligatorio'); return }
    setError('')
    setLoading(true)
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v))
      const res = await api.post('/especies', payload)
      onSaved(res)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{position:'fixed',inset:0,background:'#0009',display:'flex',alignItems:'flex-end',zIndex:100}}>
      <div style={{background:'var(--bio-surface)',borderRadius:'16px 16px 0 0',padding:'1.5rem',width:'100%',maxHeight:'90dvh',overflowY:'auto'}}>
        <h3 style={{color:'var(--bio-primary)',margin:'0 0 1rem'}}>Nueva especie</h3>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Field label="Código (ej: MONS) *" value={form.codigo} onChange={v => set('codigo', v.toUpperCase())} required />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{color:'var(--bio-secondary)',fontSize:'0.78rem',fontWeight:600}}>Categoría *</label>
              <select style={{background:'var(--bio-background)',border:'1px solid var(--bio-border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--bio-text)',fontSize:'0.95rem',outline:'none'}} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                <option value="especie">Especie</option>
                <option value="subespecie">Subespecie</option>
                <option value="cultivar">Cultivar</option>
                <option value="hibrido">Híbrido</option>
              </select>
            </div>
          </div>
          <Field label="Nombre científico *" value={form.nombre_cientifico} onChange={v => set('nombre_cientifico', v)} italic required />
          <Field label="Nombre común" value={form.nombre_comun} onChange={v => set('nombre_comun', v)} />
          <Field label="Familia" value={form.familia} onChange={v => set('familia', v)} />
          <Field label="Género" value={form.genero} onChange={v => set('genero', v)} />
          <Field label="Descripción" value={form.descripcion} onChange={v => set('descripcion', v)} textarea />
          {error && <p style={{color:'var(--error)',fontSize:'0.85rem',margin:0}}>{error}</p>}
          <div style={{display:'flex',gap:8,marginTop:4}}>
            <button type="button" style={{flex:1,background:'none',border:'1px solid var(--bio-border)',borderRadius:8,color:'var(--bio-primary)',padding:'0.75rem',fontSize:'0.9rem',cursor:'pointer'}} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={{flex:2,background:'var(--bio-primary)',border:'none',borderRadius:8,color:'#fff',padding:'0.75rem',fontSize:'0.9rem',fontWeight:600,cursor:'pointer'}} disabled={loading}>{loading ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, italic, textarea, required }) {
  const inputStyle = { background:'var(--bio-background)',border:'1px solid var(--bio-border)',borderRadius:8,padding:'0.65rem 0.9rem',color:'var(--bio-text)',fontSize:'0.95rem',outline:'none', ...(italic ? { fontStyle: 'italic' } : {}) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{color:'var(--bio-secondary)',fontSize:'0.78rem',fontWeight:600}}>{label}</label>
      {textarea
        ? <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={value} onChange={e => onChange(e.target.value)} />
        : <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} required={required} />
      }
    </div>
  )
}

