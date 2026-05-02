import { useState, useEffect } from 'react'
import { api } from '../api/client'
import LotePreparacionForm from '../components/LotePreparacionForm'
import { ReactivoForm } from './ReactivosList'

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
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Recetario (Formulaciones)</h2>
        <button className="btn btn--primary" style={{ borderRadius: '50%', width: 40, height: 40, padding: 0 }} onClick={() => setShowForm(true)}>+</button>
      </div>

      {loading ? <p className="text-muted text-center" style={{ padding: '2rem' }}>Cargando…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.length === 0 ? <p className="text-muted text-center" style={{ padding: '2rem' }}>No hay formulaciones registradas</p> : (
            items.map(f => (
              <div key={f.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--theme-text)', fontWeight: 600, fontSize: '1.1rem' }}>{f.nombre}</span>
                  {f.codigo_referencia && <span className="font-mono text-primary" style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{f.codigo_referencia}</span>}
                </div>
                <p className="text-muted" style={{ fontSize: '0.88rem', margin: '0.2rem 0' }}>{f.descripcion}</p>
                <div style={{ background: 'var(--theme-background)', borderRadius: 'var(--radius-base)', padding: '0.75rem', marginTop: '0.6rem' }}>
                  <p style={{ color: 'var(--theme-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', margin: '0 0 5px' }}>Composición base ({f.volumen_base_l}L):</p>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--theme-text)', fontSize: '0.85rem' }}>
                    {f.componentes.map(c => {
                      const item = c.reactivo || c.formulacion_ingrediente;
                      const unidad = c.reactivo ? c.reactivo.unidad_medida : (c.formulacion_ingrediente.unidad_medida || 'ml');
                      return (
                        <li key={c.id}>{item.nombre}: {c.cantidad_base} {unidad}</li>
                      );
                    })}
                  </ul>
                </div>
                <button className="btn btn--primary btn--block" style={{ marginTop: '0.8rem' }} onClick={() => setActiveFormulacion(f)}>
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
  const [formulaciones, setFormulaciones] = useState([])
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
  const [showReactivoModalForComp, setShowReactivoModalForComp] = useState(null)
  const [showFormulacionModalForComp, setShowFormulacionModalForComp] = useState(null)

  const fetchLists = async () => {
    const [r, f] = await Promise.all([
      api.get('/reactivos'),
      api.get('/reactivos/formulaciones')
    ])
    setReactivos(r)
    setFormulaciones(f)
  }

  useEffect(() => {
    fetchLists()
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addComponente = () => {
    set('componentes', [...form.componentes, { type: 'reactivo', item_id: '', cantidad_base: '', id: Date.now() }])
  }

  const updateComp = (id, k, v) => {
    set('componentes', form.componentes.map(c => c.id === id ? { ...c, [k]: v } : c))
  }

  const removeComp = (id) => {
    set('componentes', form.componentes.filter(c => c.id !== id))
  }

  const handleNewReactivoSaved = async (newReactivo) => {
    await fetchLists()
    if (showReactivoModalForComp) {
      updateComp(showReactivoModalForComp, 'item_id', newReactivo.id)
    }
    setShowReactivoModalForComp(null)
  }

  const handleNewFormulacionSaved = async () => {
    await fetchLists()
    // No seleccionamos automáticamente porque no tenemos el ID fácilmente aquí sin cambiar el API return o buscarlo
    setShowFormulacionModalForComp(null)
  }

  async function submit(e) {
    e.preventDefault()
    if (form.componentes.length === 0) { setError('Debe añadir al menos un componente'); return }
    setLoading(true)
    try {
      const payload = { ...form,
        volumen_base_l: parseFloat(form.volumen_base_l),
        caducidad_dias: parseInt(form.caducidad_dias),
        componentes: form.componentes.filter(c => c.item_id).map(({ id, type, item_id, cantidad_base }) => {
          const comp = { cantidad_base: parseFloat(cantidad_base) }
          if (type === 'reactivo') comp.reactivo_id = item_id
          if (type === 'formulacion') comp.formulacion_ingrediente_id = item_id
          return comp
        })
      }
      await api.post('/reactivos/formulaciones', payload)
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (showReactivoModalForComp) {
    return (
      <div style={{ zIndex: 1100, position: 'relative' }}>
        <ReactivoForm 
          onSaved={handleNewReactivoSaved} 
          onCancel={() => setShowReactivoModalForComp(null)} 
        />
      </div>
    )
  }

  if (showFormulacionModalForComp) {
    return (
      <div style={{ zIndex: 1100, position: 'relative' }}>
        <FormulacionForm 
          onSaved={handleNewFormulacionSaved} 
          onCancel={() => setShowFormulacionModalForComp(null)} 
        />
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
      <div style={{ background: 'var(--theme-surface)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 500, padding: '1.5rem', maxHeight: '90dvh', overflowY: 'auto' }}>
        <h3 className="page-title text-primary" style={{ margin: '0 0 1rem' }}>Nueva Formulación</h3>
        
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <Field label="Nombre del Medio / Receta *" value={form.nombre} onChange={v => set('nombre', v)} required />
          <div className="grid-2">
            <Field label="Código Ref. (Opcional)" value={form.codigo_referencia} onChange={v => set('codigo_referencia', v)} />
            <Field label="Volumen Base (Litros)" type="number" step="0.1" value={form.volumen_base_l} onChange={v => set('volumen_base_l', v)} required />
          </div>

          <Field label="Procedimiento (Cómo preparar el stock/medio)" value={form.procedimiento} onChange={v => set('procedimiento', v)} textarea />

          <div className="form-group" style={{ margin: '0.5rem 0' }}>
            <label>Componentes (Reactivos o Stocks)</label>
            {form.componentes.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <select style={{ flex: 1.2, padding: '0.5rem', fontSize: '0.8rem' }} value={c.type} onChange={e => { updateComp(c.id, 'type', e.target.value); updateComp(c.id, 'item_id', '') }}>
                  <option value="reactivo">Químico Puro</option>
                  <option value="formulacion">Solución Stock</option>
                </select>

                <div style={{ flex: 2, display: 'flex', gap: '0.2rem' }}>
                  <select style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }} value={c.item_id} onChange={e => updateComp(c.id, 'item_id', e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    {c.type === 'reactivo' && reactivos.map(r => <option key={r.id} value={r.id}>{r.nombre} ({r.unidad_medida})</option>)}
                    {c.type === 'formulacion' && formulaciones.map(f => <option key={f.id} value={f.id}>{f.nombre} (ml)</option>)}
                  </select>
                  {c.type === 'reactivo' && (
                    <button type="button" className="btn btn--secondary" style={{ padding: '0 0.5rem' }} onClick={() => setShowReactivoModalForComp(c.id)} title="Añadir nuevo químico">+</button>
                  )}
                  {c.type === 'formulacion' && (
                    <button type="button" className="btn btn--secondary" style={{ padding: '0 0.5rem' }} onClick={() => setShowFormulacionModalForComp(c.id)} title="Añadir nueva formulación">+</button>
                  )}
                </div>

                <input style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} type="number" step="0.001" placeholder="Cant." value={c.cantidad_base} onChange={e => updateComp(c.id, 'cantidad_base', e.target.value)} />
                <button type="button" onClick={() => removeComp(c.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '1.2rem', cursor: 'pointer', padding: '0 5px' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addComponente} className="btn btn--ghost btn--block" style={{ border: '1px dashed var(--theme-border)' }}>+ Añadir ingrediente</button>
          </div>

          <Field label="Caducidad estimada (días)" type="number" value={form.caducidad_dias} onChange={v => set('caducidad_dias', v)} />
          <Field label="Descripción / Uso" value={form.descripcion} onChange={v => set('descripcion', v)} textarea />
          
          {error && <p className="badge badge--danger" style={{ width: '100%', textAlign: 'center' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn--ghost btn--block" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary btn--block" disabled={loading}>Guardar Receta</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, textarea, type="text", step, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <label>{label}</label>
      {textarea
        ? <textarea style={{ minHeight: 60 }} value={value} onChange={e => onChange(e.target.value)} />
        : <input type={type} step={step} value={value} onChange={e => onChange(e.target.value)} required={required} />
      }
    </div>
  )
}

