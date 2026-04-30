import { useState, useEffect } from 'react'
import { api } from '../api/client'
import LotePreparacionForm from '../components/LotePreparacionForm'

export default function FormulacionesList() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [activeFormulacion, setActiveFormulacion] = useState(null)

  const fetchItems = async () => {
    setLoading(true)
    try { setItems(await api.get('/reactivos/formulaciones')) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchItems() }, [])

  return (
    <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 className="page-title" style={{color:'var(--bio-primary)',margin:0,fontSize:'1.3rem'}}>Recetario (Formulaciones)</h2>
        <button style={{background:'var(--bio-primary)',border:'none',borderRadius:'50%',color:'#fff',width:40,height:40,fontSize:'1.5rem',cursor:'pointer'}} onClick={() => setShowForm(true)}>+</button>
      </div>

      {loading ? <p style={{color:'var(--bio-text-muted)',textAlign:'center',padding:'2rem'}}>Cargando…</p> : (
        <div style={{display:'flex',flexDirection:'column',gap:15}}>
          {items.length === 0 ? <p style={{color:'var(--bio-text-muted)',textAlign:'center',padding:'2rem'}}>No hay formulaciones registradas</p> : (
            items.map(f => (
              <div key={f.id} className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline',marginBottom:8}}>
                  <span style={{color:'var(--bio-text)',fontWeight:600,fontSize:'1.1rem'}}>{f.nombre}</span>
                  {f.codigo_referencia && <span style={{color:'var(--bio-primary)',fontWeight:'bold',fontFamily:'monospace',fontSize:'0.85rem'}}>{f.codigo_referencia}</span>}
                </div>
                <p style={{color:'var(--bio-text-muted)',fontSize:'0.88rem',margin:'4px 0'}}>{f.descripcion}</p>
                <div style={{background:'var(--bio-background)',borderRadius:8,padding:'0.75rem',marginTop:10}}>
                  <p style={{color:'var(--bio-secondary)',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',margin:'0 0 5px'}}>Composición base ({f.volumen_base_l}L):</p>
                  <ul style={{margin:0,paddingLeft:15,color:'var(--bio-text)',fontSize:'0.85rem'}}>
                    {f.componentes.map(c => (
                      <li key={c.id}>{c.reactivo.nombre}: {c.cantidad_base}{c.reactivo.unidad_medida}</li>
                    ))}
                  </ul>
                </div>
                <button style={{background:'var(--bio-primary)',color:'#fff',border:'none',borderRadius:8,padding:'0.6rem 1rem',fontSize:'0.85rem',cursor:'pointer',marginTop:12,width:'100%'}} onClick={() => setActiveFormulacion(f)}>
                  🧪 Preparar este medio
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <FormulacionForm 
          onSaved={() => { setShowForm(false); fetchItems() }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {activeFormulacion && (
        <LotePreparacionForm 
          formulacion={activeFormulacion}
          onSaved={() => setActiveFormulacion(null)}
          onCancel={() => setActiveFormulacion(null)}
        />
      )}
    </div>
  )
}

function FormulacionForm({ onSaved, onCancel }) {
  const [reactivos, setReactivos] = useState([])
  const [form, setForm] = useState({ 
    nombre: '', 
    codigo_referencia: '', 
    descripcion: '', 
    procedimiento: '', 
    volumen_base_l: 1.0, 
    caducidad_dias: 30,
    componentes: [] 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/reactivos').then(setReactivos)
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addComponente = () => {
    set('componentes', [...form.componentes, { reactivo_id: '', cantidad_base: '', id: Date.now() }])
  }

  const updateComp = (id, k, v) => {
    set('componentes', form.componentes.map(c => c.id === id ? { ...c, [k]: v } : c))
  }

  const removeComp = (id) => {
    set('componentes', form.componentes.filter(c => c.id !== id))
  }

  async function submit(e) {
    e.preventDefault()
    if (form.componentes.length === 0) { setError('Debe añadir al menos un componente'); return }
    setLoading(true)
    try {
      const payload = { ...form,
        volumen_base_l: parseFloat(form.volumen_base_l),
        caducidad_dias: parseInt(form.caducidad_dias),
        componentes: form.componentes.map(({ id, ...rest }) => ({
          ...rest,
          cantidad_base: parseFloat(rest.cantidad_base)
        }))
      }
      await api.post('/reactivos/formulaciones', payload)
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const inputStyle = { background: 'var(--bio-background)', border: '1px solid var(--bio-border)', borderRadius: 8, padding: '0.65rem 0.9rem', color: 'var(--bio-text)', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: 'var(--theme-surface)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', width: '100%', maxWidth: '500px', padding: '1.5rem', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))', animation: 'slideUp 0.3s ease-out', maxHeight: '88dvh', overflowY: 'auto' }}>
        <h3 style={{ color: 'var(--bio-primary)', margin: '0 0 1rem', fontSize: '1rem' }}>Nueva Formulación (Receta)</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Field label="Nombre de la mezcla *" value={form.nombre} onChange={v => set('nombre', v)} required />
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Código Ref." value={form.codigo_referencia} onChange={v => set('codigo_referencia', v.toUpperCase())} />
            <Field label="Volumen Base (L)" type="number" step="0.1" value={form.volumen_base_l} onChange={v => set('volumen_base_l', v)} />
          </div>

          <p style={{ color: 'var(--bio-secondary)', fontSize: '0.85rem', fontWeight: 600, margin: '10px 0 0' }}>Componentes / Reactivos</p>
          <div style={{ background: 'var(--bio-background)', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {form.componentes.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <select style={{ ...inputStyle, flex: 2 }} value={c.reactivo_id} onChange={e => updateComp(c.id, 'reactivo_id', e.target.value)}>
                  <option value="">— Reactivo —</option>
                  {reactivos.map(r => <option key={r.id} value={r.id}>{r.nombre} ({r.unidad_medida})</option>)}
                </select>
                <input style={{ ...inputStyle, flex: 1 }} type="number" step="0.001" placeholder="Cant." value={c.cantidad_base} onChange={e => updateComp(c.id, 'cantidad_base', e.target.value)} />
                <button type="button" onClick={() => removeComp(c.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '1.2rem', cursor: 'pointer', padding: '0 5px' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addComponente} style={{ background: 'none', border: '1px dashed var(--bio-border)', borderRadius: 8, color: 'var(--bio-secondary)', padding: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', marginTop: 4 }}>+ Añadir ingrediente</button>
          </div>

          <Field label="Caducidad estimada (días)" type="number" value={form.caducidad_dias} onChange={v => set('caducidad_dias', v)} />
          <Field label="Descripción / Uso" value={form.descripcion} onChange={v => set('descripcion', v)} textarea />
          
          {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>Guardar Receta</button>
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

