import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

const TIPOS = [
  { val: 'sustrato', label: 'Sustrato / Mezcla' },
  { val: 'agar', label: 'Agar / Medio in vitro' },
  { val: 'hidroponia', label: 'Solución Hidropónica' },
  { val: 'otro', label: 'Otro' }
]

export default function MediosList() {
  const [showForm, setShowForm] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)

  return (
    <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div>
           <h2 className="page-title" style={{color:'var(--theme-primary)',margin:0,fontSize:'1.4rem'}}>Catálogo de Sustratos</h2>
           <p style={{color:'var(--theme-secondary)',fontSize:'0.85rem',margin:0}}>Agares, medios y mezclas registrados.</p>
        </div>
        <button className="btn btn--primary" style={{ borderRadius: '50%', width: 40, height: 40, padding: 0 }} onClick={() => setShowForm(true)}>+</button>
      </div>

      <MediosSubList refreshCounter={refreshCount} />

      {showForm && (
        <SustratoForm
          onSaved={() => { setShowForm(false); setRefreshCount(c => c + 1) }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}



function MediosSubList({ refreshCounter }) {
  const [medios, setMedios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/sustratos').then(setMedios).finally(() => setLoading(false))
  }, [refreshCounter])

  if (loading) return <p className="text-muted text-center" style={{ padding: '1rem' }}>Cargando sustratos...</p>
  if (medios.length === 0) return <p className="text-muted text-center" style={{ padding: '1rem' }}>No hay medios ni sustratos registrados.</p>

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      {medios.map(m => (
        <div key={m.id} className="card" style={{ padding: '0.8rem 1rem' }}>
          <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:4}}>
            <span className="font-mono text-primary" style={{fontWeight:'bold',fontSize:'0.85rem'}}>{m.codigo_formulacion}</span>
            <span className="badge badge--outline" style={{fontSize:'0.6rem'}}>{TIPOS.find(t => t.val === m.tipo)?.label || m.tipo}</span>
            {m.lote && <span className="badge badge--success" style={{fontSize:'0.6rem'}}>Lote: {m.lote.uid}</span>}
            <div style={{ marginLeft: 'auto' }}>
              <PrintSustratoBtn id={m.id} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="text-primary" style={{fontSize:'0.95rem', fontWeight: 600}}>{m.nombre}</span>
            {m.formulacion && <span className="text-muted" style={{fontSize:'0.75rem'}}>Base: {m.formulacion.nombre}</span>}
          </div>

          {(m.componentes && m.componentes.length > 0) && (
            <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--theme-text)' }}>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--theme-text)', fontSize: '0.82rem' }}>
                {m.componentes.map((c, idx) => (
                  <li key={idx}>{(c.reactivo || c.formulacion_ingrediente)?.nombre}: {c.cantidad_base}</li>
                ))}
              </ul>
            </div>
          )}

          {(m.ph_teorico || m.conductividad_teorica) && (
            <div style={{display:'flex',gap:12,marginTop:6,fontSize:'0.75rem',color:'var(--theme-secondary)'}}>
              {m.ph_teorico && <span>pH Teórico: {m.ph_teorico}</span>}
              {m.conductividad_teorica && <span>EC Teórica: {m.conductividad_teorica}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function PrintSustratoBtn({ id }) {
  const [printing, setPrinting] = useState(false)

  const handlePrint = async (e) => {
    e.stopPropagation()
    setPrinting(true)
    try {
      await api.post(`/printer/imprimir-sustrato/${id}`)
    } catch (err) {
      alert(err.message)
    } finally {
      setPrinting(false)
    }
  }

  return (
    <button
      className="btn btn--ghost"
      style={{ padding: '0.1rem 0.4rem', fontSize: '0.8rem' }}
      onClick={handlePrint}
      disabled={printing}
      title="Imprimir Etiqueta"
    >
      {printing ? '…' : '🖨'}
    </button>
  )
}

function SustratoForm({ onSaved, onCancel }) {
  const [formulaciones, setFormulaciones] = useState([])
  const [lotes, setLotes] = useState([])
  const [reactivos, setReactivos] = useState([])

  const [form, setForm] = useState({
    codigo_formulacion: '',
    tipo: 'sustrato',
    nombre: '',
    descripcion: '',
    ph_teorico: '',
    conductividad_teorica: '',
    formulacion_id: '',
    lote_id: '',
    componentes: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/reactivos/formulaciones').then(setFormulaciones)
    api.get('/reactivos/lotes').then(setLotes)
    api.get('/reactivos').then(setReactivos)
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

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        ph_teorico: form.ph_teorico ? parseFloat(form.ph_teorico) : null,
        conductividad_teorica: form.conductividad_teorica ? parseFloat(form.conductividad_teorica) : null,
        formulacion_id: form.formulacion_id || null,
        lote_id: form.lote_id || null,
        componentes: form.componentes.filter(c => c.item_id).map(c => {
          const comp = { cantidad_base: parseFloat(c.cantidad_base) }
          if (c.type === 'reactivo') comp.reactivo_id = c.item_id
          else comp.formulacion_ingrediente_id = c.item_id
          return comp
        })
      }
      await api.post('/sustratos', payload)
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: 'var(--theme-surface)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '500px', padding: '1.5rem', maxHeight: '90dvh', overflowY: 'auto' }}>
        <h3 className="text-primary" style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>Registrar Sustrato / Medio</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

          <div className="grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Código *</label>
              <input value={form.codigo_formulacion} onChange={e => set('codigo_formulacion', e.target.value)} placeholder="Ej: AGAR-MS-01" required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Tipo</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)}>
                {TIPOS.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Nombre Descriptivo *</label>
            <input value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Agar MS + Vitaminas" required />
          </div>

          <div className="grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Receta Base (Opcional)</label>
              <select value={form.formulacion_id} onChange={e => set('formulacion_id', e.target.value)}>
                <option value="">— Ninguna —</option>
                {formulaciones.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Lote Producción (Opcional)</label>
              <select value={form.lote_id} onChange={e => set('lote_id', e.target.value)}>
                <option value="">— Ninguno —</option>
                {lotes.map(l => <option key={l.id} value={l.id}>{l.uid} ({l.formulacion.nombre})</option>)}
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--theme-border)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--theme-secondary)' }}>Componentes Adicionales / Mezcla</label>
            {form.componentes.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', alignItems: 'center' }}>
                <select style={{ flex: 1.2, padding: '0.4rem', fontSize: '0.75rem' }} value={c.type} onChange={e => { updateComp(c.id, 'type', e.target.value); updateComp(c.id, 'item_id', '') }}>
                  <option value="reactivo">Químico</option>
                  <option value="formulacion">Stock</option>
                </select>
                <select style={{ flex: 2, padding: '0.4rem', fontSize: '0.75rem' }} value={c.item_id} onChange={e => updateComp(c.id, 'item_id', e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  {c.type === 'reactivo' && reactivos.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                  {c.type === 'formulacion' && formulaciones.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                </select>
                <input style={{ width: 60, padding: '0.4rem', fontSize: '0.75rem' }} type="number" placeholder="Cant" value={c.cantidad_base} onChange={e => updateComp(c.id, 'cantidad_base', e.target.value)} />
                <button type="button" onClick={() => removeComp(c.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={addComponente} className="btn btn--ghost btn--block" style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.3rem' }}>+ Añadir Ingrediente</button>
          </div>

          <div className="grid-2" style={{ marginTop: '0.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>pH Teórico</label>
              <input type="number" step="0.1" value={form.ph_teorico} onChange={e => set('ph_teorico', e.target.value)} placeholder="5.8" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>EC Teórica</label>
              <input type="number" step="0.1" value={form.conductividad_teorica} onChange={e => set('conductividad_teorica', e.target.value)} placeholder="1.2" />
            </div>
          </div>

          {error && <p className="text-danger" style={{ fontSize: '0.85rem', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary" style={{ flex: 2 }} disabled={loading}>{loading ? 'Guardando…' : 'Registrar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
