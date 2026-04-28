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
    <div style={s.overlay}>
      <div style={s.sheet}>
        <h3 style={s.sheetTitle}>Nueva especie</h3>
        <form onSubmit={submit} style={s.form}>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <Field label="Código (ej: MONS) *" value={form.codigo} onChange={v => set('codigo', v.toUpperCase())} required />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={s.label}>Categoría *</label>
              <select style={s.input} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
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
          {error && <p style={s.error}>{error}</p>}
          <div style={s.actions}>
            <button type="button" style={s.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={s.btnSave} disabled={loading}>{loading ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, italic, textarea, required }) {
  const inputStyle = { ...s.input, ...(italic ? { fontStyle: 'italic' } : {}) }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={s.label}>{label}</label>
      {textarea
        ? <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={value} onChange={e => onChange(e.target.value)} />
        : <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} required={required} />
      }
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: '#0009', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: '#1a2e1e', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxHeight: '90dvh', overflowY: 'auto' },
  sheetTitle: { color: '#7dca8f', margin: '0 0 1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 },
  input: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.65rem 0.9rem', color: '#e0f0e5', fontSize: '0.95rem', outline: 'none' },
  error: { color: '#f28b82', fontSize: '0.85rem', margin: 0 },
  actions: { display: 'flex', gap: 8, marginTop: 4 },
  btnCancel: { flex: 1, background: 'none', border: '1px solid #2d5c3a', borderRadius: 8, color: '#7dca8f', padding: '0.75rem', fontSize: '0.9rem', cursor: 'pointer' },
  btnSave: { flex: 2, background: '#2d7a47', border: 'none', borderRadius: 8, color: '#fff', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
}
