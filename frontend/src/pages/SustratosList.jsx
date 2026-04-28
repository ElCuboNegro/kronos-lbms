import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function SustratosList() {
  const [sustratos, setSustratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchSustratos = async () => {
    setLoading(true)
    try { setSustratos(await api.get('/sustratos')) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSustratos() }, [])

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h2 style={s.title}>Formulaciones de Sustratos</h2>
        <button style={s.btnAdd} onClick={() => setShowForm(true)}>+</button>
      </div>

      {loading ? <p style={s.muted}>Cargando…</p> : (
        <div style={s.list}>
          {sustratos.length === 0 ? <p style={s.muted}>No hay sustratos registrados</p> : (
            sustratos.map(su => (
              <div key={su.id} style={s.card}>
                <div style={s.cardTop}>
                  <span style={s.codigo}>{su.codigo_formulacion}</span>
                  <span style={s.nombre}>{su.nombre}</span>
                </div>
                {su.descripcion && <p style={s.desc}>{su.descripcion}</p>}
                <div style={s.meta}>
                  {su.ph_teorico && <span>pH: {su.ph_teorico}</span>}
                  {su.conductividad_teorica && <span>EC: {su.conductividad_teorica}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <SustratoForm 
          onSaved={() => { setShowForm(false); fetchSustratos() }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

function SustratoForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({ codigo_formulacion: '', nombre: '', descripcion: '', ph_teorico: '', conductividad_teorica: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, 
        ph_teorico: form.ph_teorico ? parseFloat(form.ph_teorico) : undefined,
        conductividad_teorica: form.conductividad_teorica ? parseFloat(form.conductividad_teorica) : undefined
      }
      await api.post('/sustratos', payload)
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={ss.overlay}>
      <div style={ss.sheet}>
        <h3 style={ss.title}>Nueva Formulación</h3>
        <form onSubmit={submit} style={ss.form}>
          <Field label="Código (ej: S-AROID-01) *" value={form.codigo_formulacion} onChange={v => set('codigo_formulacion', v.toUpperCase())} required />
          <Field label="Nombre descriptivo *" value={form.nombre} onChange={v => set('nombre', v)} required />
          <Field label="Descripción / Componentes" value={form.descripcion} onChange={v => set('descripcion', v)} textarea />
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="pH Teórico" type="number" step="0.1" value={form.ph_teorico} onChange={v => set('ph_teorico', v)} />
            <Field label="EC Teórica" type="number" step="0.1" value={form.conductividad_teorica} onChange={v => set('conductividad_teorica', v)} />
          </div>
          {error && <p style={ss.error}>{error}</p>}
          <div style={ss.actions}>
            <button type="button" style={ss.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={ss.btnSave} disabled={loading}>{loading ? '…' : 'Guardar'}</button>
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
  cardTop: { display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 4 },
  codigo: { color: '#7dca8f', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '0.9rem', background: '#0f1f13', padding: '2px 6px', borderRadius: 4 },
  nombre: { color: '#e0f0e5', fontWeight: 600, fontSize: '1rem' },
  desc: { color: '#6aaa82', fontSize: '0.85rem', margin: '4px 0' },
  meta: { display: 'flex', gap: 15, marginTop: 8, color: '#4a8c5c', fontSize: '0.8rem', fontWeight: 600 },
  muted: { color: '#4a5568', textAlign: 'center', padding: '2rem' },
}

const ss = {
  overlay: { position: 'fixed', inset: 0, background: '#000c', display: 'flex', alignItems: 'flex-end', zIndex: 200 },
  sheet: { background: '#1a2e1e', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxHeight: '90dvh', overflowY: 'auto' },
  title: { color: '#7dca8f', margin: '0 0 1rem', fontSize: '1.1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  error: { color: '#f28b82', fontSize: '0.85rem', margin: 0 },
  actions: { display: 'flex', gap: 10, marginTop: 10 },
  btnCancel: { flex: 1, background: 'none', border: '1px solid #2d5c3a', borderRadius: 8, color: '#7dca8f', padding: '0.75rem', cursor: 'pointer' },
  btnSave: { flex: 2, background: '#2d7a47', border: 'none', borderRadius: 8, color: '#fff', padding: '0.75rem', fontWeight: 600, cursor: 'pointer' },
}
