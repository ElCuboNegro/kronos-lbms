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
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>Inventario de Reactivos</h2>
        <button style={s.btnAdd} onClick={() => setShowForm(true)}>+</button>
      </div>

      {loading ? <p style={s.muted}>Cargando…</p> : (
        <div style={s.list}>
          {items.length === 0 ? <p style={s.muted}>No hay reactivos registrados</p> : (
            items.map(r => (
              <div key={r.id} style={s.card}>
                <div style={s.cardTop}>
                  <span style={s.nombre}>{r.nombre}</span>
                  <span style={s.formula}>{r.formula_quimica}</span>
                </div>
                <div style={s.meta}>
                  <span>Marca: {r.marca || '—'}</span>
                  <span>Pureza: {r.pureza_pct ? `${r.pureza_pct}%` : '—'}</span>
                </div>
                {r.peligrosidad?.length > 0 && (
                  <div style={s.peligros}>
                    {r.peligrosidad.map(p => (
                      <span key={p} style={s.pBadge}>{PELIGROS.find(x => x.id === p)?.label || p}</span>
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

  return (
    <div style={ss.overlay}>
      <div style={ss.sheet}>
        <h3 style={ss.title}>Nuevo Reactivo</h3>
        <form onSubmit={submit} style={ss.form}>
          <Field label="Nombre del reactivo *" value={form.nombre} onChange={v => set('nombre', v)} required />
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Fórmula Química" value={form.formula_quimica} onChange={v => set('formula_quimica', v)} />
            <Field label="Marca" value={form.marca} onChange={v => set('marca', v)} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="Pureza (%)" type="number" step="0.1" value={form.pureza_pct} onChange={v => set('pureza_pct', v)} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={s.label}>Unidad</label>
              <select style={ss.inputStyle} value={form.unidad_medida} onChange={e => set('unidad_medida', e.target.value)}>
                <option value="g">Gramos (g)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="mg">Miligramos (mg)</option>
              </select>
            </div>
          </div>
          
          <label style={s.label}>Peligrosidad</label>
          <div style={s.pGrid}>
            {PELIGROS.map(p => (
              <button key={p.id} type="button" 
                onClick={() => togglePeligro(p.id)}
                style={{ ...s.pBtn, ...(form.peligrosidad.includes(p.id) ? s.pBtnActive : {}) }}>
                {p.label}
              </button>
            ))}
          </div>

          <Field label="Notas" value={form.notas} onChange={v => set('notas', v)} textarea />
          
          {error && <p style={ss.error}>{error}</p>}
          <div style={ss.actions}>
            <button type="button" style={ss.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={ss.btnSave} disabled={loading}>Guardar</button>
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
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 12, padding: '1rem' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  nombre: { color: '#e0f0e5', fontWeight: 600, fontSize: '1.1rem' },
  formula: { color: '#7dca8f', fontFamily: 'monospace', fontSize: '0.9rem' },
  meta: { display: 'flex', gap: 15, color: '#4a5568', fontSize: '0.8rem' },
  peligros: { display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  pBadge: { background: '#2a1a1a', color: '#f28b82', fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4, border: '1px solid #4a2d2d' },
  pGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 },
  pBtn: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.5rem', color: '#4a8c5c', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left' },
  pBtnActive: { background: '#2d5c3a', color: '#fff', borderColor: '#7dca8f' },
  label: { color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 },
  muted: { color: '#4a5568', textAlign: 'center', padding: '2rem' },
}

const ss = {
  overlay: { position: 'fixed', inset: 0, background: '#000c', display: 'flex', alignItems: 'flex-end', zIndex: 200 },
  sheet: { background: '#1a2e1e', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxHeight: '90dvh', overflowY: 'auto' },
  title: { color: '#7dca8f', margin: '0 0 1rem', fontSize: '1.1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  inputStyle: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.65rem 0.9rem', color: '#e0f0e5', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  error: { color: '#f28b82', fontSize: '0.85rem', margin: 0 },
  actions: { display: 'flex', gap: 10, marginTop: 10 },
  btnCancel: { flex: 1, background: 'none', border: '1px solid #2d5c3a', borderRadius: 8, color: '#7dca8f', padding: '0.75rem', cursor: 'pointer' },
  btnSave: { flex: 1, background: '#2d7a47', border: 'none', borderRadius: 8, color: '#fff', padding: '0.75rem', fontWeight: 600, cursor: 'pointer' },
}
