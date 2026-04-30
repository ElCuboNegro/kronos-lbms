import { useState, useEffect } from 'react'
import { api } from '../api/client'

const PELIGROS = [
  { id: 'inflamable', label: '🔥 Inflamable' },
  { id: 'corrosivo', label: '🧪 Corrosivo' },
  { id: 'toxico', label: '💀 Tóxico' },
  { id: 'irritante', label: '⚠️ Irritante' },
  { id: 'oxidante', label: '💥 Oxidante' },
]

export default function ReactivosList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchItems = async () => {
    setLoading(true)
    try { setItems(await api.get('/reactivos')) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, [])

  return (
    <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 className="page-title" style={{color:'var(--bio-primary)',margin:0,fontSize:'1.3rem'}}>Inventario de Reactivos</h2>
        <button style={{background:'var(--bio-primary)',border:'none',borderRadius:'50%',color:'#fff',width:40,height:40,fontSize:'1.5rem',cursor:'pointer'}} onClick={() => setShowForm(true)}>+</button>
      </div>

      {loading ? <p style={{color:'var(--bio-text-muted)',textAlign:'center',padding:'2rem'}}>Cargando…</p> : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {items.length === 0 ? <p style={{color:'var(--bio-text-muted)',textAlign:'center',padding:'2rem'}}>No hay reactivos registrados</p> : (
            items.map(r => (
              <div key={r.id} className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:4}}>
                  <span style={{color:'var(--bio-text)',fontWeight:600,fontSize:'1.1rem'}}>{r.nombre}</span>
                  <span style={{color:'var(--bio-primary)',fontFamily:'monospace',fontSize:'0.9rem'}}>{r.formula_quimica}</span>
                </div>
                <div style={{display:'flex',gap:15,color:'var(--bio-text-muted)',fontSize:'0.8rem'}}>
                  <span>Marca: {r.marca || '—'}</span>
                  <span>Pureza: {r.pureza_pct ? `${r.pureza_pct}%` : '—'}</span>
                </div>
                {r.peligrosidad?.length > 0 && (
                  <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:8}}>
                    {r.peligrosidad.map(p => (
                      <span key={p} style={{background:'#2a1a1a',color:'var(--error)',fontSize:'0.65rem',padding:'2px 6px',borderRadius:4,border:'1px solid #4a2d2d'}}>{PELIGROS.find(x => x.id === p)?.label || p}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <ReactivoForm 
          onSaved={() => { setShowForm(false); fetchItems() }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

function ReactivoForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({ nombre: '', formula_quimica: '', marca: '', pureza_pct: '', unidad_medida: 'g', peligrosidad: [], notas: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  
  const togglePeligro = (id) => {
    set('peligrosidad', form.peligrosidad.includes(id) 
      ? form.peligrosidad.filter(x => x !== id)
      : [...form.peligrosidad, id]
    )
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, 
        pureza_pct: form.pureza_pct ? parseFloat(form.pureza_pct) : undefined
      }
      await api.post('/reactivos', payload)
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const inputStyle = { background: 'var(--bio-background)', border: '1px solid var(--bio-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--bio-text)', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: 'var(--theme-surface)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', width: '100%', maxWidth: '500px', padding: '1.5rem', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))', animation: 'slideUp 0.3s ease-out', maxHeight: '88dvh', overflowY: 'auto' }}>
        <h3 style={{ color: 'var(--bio-primary)', margin: '0 0 1rem', fontSize: '1rem' }}>Nuevo Reactivo</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Nombre del reactivo *" value={form.nombre} onChange={v => set('nombre', v)} required />
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Fórmula Química" value={form.formula_quimica} onChange={v => set('formula_quimica', v)} />
            <Field label="Marca" value={form.marca} onChange={v => set('marca', v)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Pureza (%)" type="number" step="0.1" value={form.pureza_pct} onChange={v => set('pureza_pct', v)} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{color:'var(--bio-secondary)',fontSize:'0.78rem',fontWeight:600}}>Unidad</label>
              <select style={inputStyle} value={form.unidad_medida} onChange={e => set('unidad_medida', e.target.value)}>
                <option value="g">Gramos (g)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="mg">Miligramos (mg)</option>
              </select>
            </div>
          </div>
          
          <label style={{color:'var(--bio-secondary)',fontSize:'0.78rem',fontWeight:600}}>Peligrosidad</label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:4}}>
            {PELIGROS.map(p => (
              <button key={p.id} type="button" 
                onClick={() => togglePeligro(p.id)}
                style={{ background:'var(--bio-background)',border:'1px solid var(--bio-border)',borderRadius:8,padding:'0.5rem',color:'var(--bio-secondary)',fontSize:'0.8rem',cursor:'pointer',textAlign:'left', ...(form.peligrosidad.includes(p.id) ? { borderColor: 'var(--error)', color: 'var(--error)' } : {}) }}>
                {p.label}
              </button>
            ))}
          </div>

          <Field label="Notas" value={form.notas} onChange={v => set('notas', v)} textarea />
          
          {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, textarea, type="text", step, required }) {
  const inputStyle = { background: 'var(--bio-background)', border: '1px solid var(--bio-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--bio-text)', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <label style={{ color: 'var(--bio-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>{label}</label>
      {textarea
        ? <textarea style={{ ...inputStyle, minHeight: 60 }} value={value} onChange={e => onChange(e.target.value)} />
        : <input type={type} step={step} style={inputStyle} value={value} onChange={e => onChange(e.target.value)} required={required} />
      }
    </div>
  )
}

