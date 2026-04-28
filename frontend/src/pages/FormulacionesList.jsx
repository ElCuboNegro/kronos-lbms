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
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>Recetario (Formulaciones)</h2>
        <button style={s.btnAdd} onClick={() => setShowForm(true)}>+</button>
      </div>

      {loading ? <p style={s.muted}>Cargando…</p> : (
        <div style={s.list}>
          {items.length === 0 ? <p style={s.muted}>No hay formulaciones registradas</p> : (
            items.map(f => (
              <div key={f.id} style={s.card}>
                <div style={s.cardTop}>
                  <span style={s.nombre}>{f.nombre}</span>
                  {f.codigo_referencia && <span style={s.codigo}>{f.codigo_referencia}</span>}
                </div>
                <p style={s.desc}>{f.descripcion}</p>
                <div style={s.componentes}>
                  <p style={s.compTitle}>Composición base ({f.volumen_base_l}L):</p>
                  <ul style={s.compList}>
                    {f.componentes.map(c => (
                      <li key={c.id}>{c.reactivo.nombre}: {c.cantidad_base}{c.reactivo.unidad_medida}</li>
                    ))}
                  </ul>
                </div>
                <button style={s.btnPrepare} onClick={() => setActiveFormulacion(f)}>
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

  return (
    <div style={ss.overlay}>
      <div style={ss.sheet}>
        <h3 style={ss.title}>Nueva Formulación (Receta)</h3>
        <form onSubmit={submit} style={ss.form}>
          <Field label="Nombre de la mezcla *" value={form.nombre} onChange={v => set('nombre', v)} required />
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Código Ref." value={form.codigo_referencia} onChange={v => set('codigo_referencia', v.toUpperCase())} />
            <Field label="Volumen Base (L)" type="number" step="0.1" value={form.volumen_base_l} onChange={v => set('volumen_base_l', v)} />
          </div>

          <p style={ss.secTitle}>Componentes / Reactivos</p>
          <div style={ss.compBox}>
            {form.componentes.map(c => (
              <div key={c.id} style={ss.compRow}>
                <select style={{ ...ss.input, flex: 2 }} value={c.reactivo_id} onChange={e => updateComp(c.id, 'reactivo_id', e.target.value)}>
                  <option value="">— Reactivo —</option>
                  {reactivos.map(r => <option key={r.id} value={r.id}>{r.nombre} ({r.unidad_medida})</option>)}
                </select>
                <input style={{ ...ss.input, flex: 1 }} type="number" step="0.001" placeholder="Cant." value={c.cantidad_base} onChange={e => updateComp(c.id, 'cantidad_base', e.target.value)} />
                <button type="button" onClick={() => removeComp(c.id)} style={ss.btnRem}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addComponente} style={ss.btnAddComp}>+ Añadir ingrediente</button>
          </div>

          <Field label="Caducidad estimada (días)" type="number" value={form.caducidad_dias} onChange={v => set('caducidad_dias', v)} />
          <Field label="Descripción / Uso" value={form.descripcion} onChange={v => set('descripcion', v)} textarea />
          
          {error && <p style={ss.error}>{error}</p>}
          <div style={ss.actions}>
            <button type="button" style={ss.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={ss.btnSave} disabled={loading}>Guardar Receta</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, textarea, type="text", step, required }) {
  const inputStyle = { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.65rem 0.9rem', color: '#e0f0e5', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <label style={{ color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 }}>{label}</label>
      {textarea
        ? <textarea style={{ ...inputStyle, minHeight: 60 }} value={value} onChange={e => onChange(e.target.value)} />
        : <input type={type} step={step} style={inputStyle} value={value} onChange={e => onChange(e.target.value)} required={required} />
      }
    </div>
  )
}

const s = {
  page: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#7dca8f', margin: 0, fontSize: '1.3rem' },
  btnAdd: { background: '#2d7a47', border: 'none', borderRadius: '50%', color: '#fff', width: 40, height: 40, fontSize: '1.5rem', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: 15 },
  card: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 12, padding: '1rem' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  nombre: { color: '#e0f0e5', fontWeight: 600, fontSize: '1.1rem' },
  codigo: { color: '#7dca8f', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '0.85rem' },
  desc: { color: '#6aaa82', fontSize: '0.88rem', margin: '4px 0' },
  componentes: { background: '#0f1f13', borderRadius: 8, padding: '0.75rem', marginTop: 10 },
  compTitle: { color: '#4a8c5c', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 5px' },
  compList: { margin: 0, paddingLeft: 15, color: '#a0c8b0', fontSize: '0.85rem' },
  btnPrepare: { background: '#2d7a47', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1rem', fontSize: '0.85rem', cursor: 'pointer', marginTop: 12, width: '100%' },
  muted: { color: '#4a5568', textAlign: 'center', padding: '2rem' },
}

const ss = {
  overlay: { position: 'fixed', inset: 0, background: '#000c', display: 'flex', alignItems: 'flex-end', zIndex: 200 },
  sheet: { background: '#1a2e1e', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxHeight: '90dvh', overflowY: 'auto' },
  title: { color: '#7dca8f', margin: '0 0 1rem', fontSize: '1.1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  secTitle: { color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', margin: '10px 0 0' },
  compBox: { display: 'flex', flexDirection: 'column', gap: 8, background: '#0f1f13', padding: '0.75rem', borderRadius: 10 },
  compRow: { display: 'flex', gap: 6, alignItems: 'center' },
  input: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 6, padding: '0.5rem', color: '#e0f0e5', fontSize: '0.9rem', outline: 'none' },
  btnRem: { background: 'none', border: 'none', color: '#f28b82', cursor: 'pointer', padding: '0 5px' },
  btnAddComp: { background: 'none', border: '1px dashed #2d5c3a', color: '#7dca8f', padding: '0.5rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' },
  error: { color: '#f28b82', fontSize: '0.85rem', margin: 0 },
  actions: { display: 'flex', gap: 10, marginTop: 10 },
  btnCancel: { flex: 1, background: 'none', border: '1px solid #2d5c3a', borderRadius: 8, color: '#7dca8f', padding: '0.75rem', cursor: 'pointer' },
  btnSave: { flex: 2, background: '#2d7a47', border: 'none', borderRadius: 8, color: '#fff', padding: '0.75rem', fontWeight: 600, cursor: 'pointer' },
}
