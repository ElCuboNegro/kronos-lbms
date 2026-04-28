import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function ExperimentoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exp, setExp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConfig, setShowConfig] = useState(false)

  const fetchExp = async () => {
    setLoading(true)
    try { setExp(await api.get(`/experimentos/${id}`)) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchExp() }, [id])

  if (loading) return <p style={s.muted}>Cargando…</p>
  if (!exp) return <p style={s.error}>Experimento no encontrado</p>

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerTop}>
          <h2 style={s.title}>{exp.nombre}</h2>
          <span style={{...s.badge, background: exp.estado === 'activo' ? '#2d7a47' : '#4a5568'}}>{exp.estado}</span>
        </div>
        <p style={s.meta}>Iniciado: {new Date(exp.fecha_inicio).toLocaleDateString()}</p>
        <button style={s.btnSec} onClick={() => setShowConfig(true)}>⚙️ Valores Estándar del Experimento</button>
      </div>

      <div style={s.section}>
        <h4 style={s.secTitle}>Hipótesis</h4>
        <p style={s.text}>{exp.hipotesis || 'Sin hipótesis definida.'}</p>
      </div>

      {showConfig && (
        <ExpConfigForm 
          exp={exp} 
          onSaved={() => { setShowConfig(false); fetchExp() }} 
          onCancel={() => setShowConfig(false)} 
        />
      )}
      
      <div style={s.section}>
         <h4 style={s.secTitle}>Especímenes en estudio</h4>
         <p style={s.muted}>Próximamente: Lista de individuos vinculados.</p>
      </div>
    </div>
  )
}

function ExpConfigForm({ exp, onSaved, onCancel }) {
  const [especies, setEspecies] = useState([])
  const [lineas, setLineas] = useState([])
  const [variegaciones, setVariegaciones] = useState([])
  
  const [form, setForm] = useState({
    ...exp.config_estandar,
    especie_id: exp.especie_id || '',
    linea_id: exp.linea_id || '',
    variegacion_id: exp.variegacion_id || '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/especies').then(setEspecies)
    if (form.especie_id) {
       api.get(`/especies/${form.especie_id}`).then(e => setLineas(e.lineas || []))
    }
  }, [])

  useEffect(() => {
    if (!form.especie_id) { setLineas([]); return }
    api.get(`/especies/${form.especie_id}`).then(e => setLineas(e.lineas || []))
  }, [form.especie_id])

  useEffect(() => {
    if (!form.linea_id) { setVariegaciones([]); return }
    const l = lineas.find(l => l.id === form.linea_id)
    setVariegaciones(l?.variegaciones || [])
  }, [form.linea_id, lineas])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v === '' ? undefined : v }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { especie_id, linea_id, variegacion_id, ...config } = form
      await api.patch(`/experimentos/${exp.id}`, { 
        especie_id: especie_id || null,
        linea_id: linea_id || null,
        variegacion_id: variegacion_id || null,
        config_estandar: config 
      })
      onSaved()
    } finally { setLoading(false) }
  }

  return (
    <div style={ss.overlay}>
      <div style={ss.sheet}>
        <h3 style={ss.title}>Configuración del Experimento</h3>
        
        <form onSubmit={submit} style={ss.form}>
           <Section title="Alcance / Categorías de Interés">
             <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Sel label="Especie Objetivo" value={form.especie_id} onChange={v => set('especie_id', v)} 
                    options={especies.map(e => ({ value: e.id, label: e.nombre_cientifico }))} />
                {lineas.length > 0 && (
                  <Sel label="Línea Objetivo" value={form.linea_id} onChange={v => set('linea_id', v)}
                      options={lineas.map(l => ({ value: l.id, label: l.nombre }))} />
                )}
                {variegaciones.length > 0 && (
                  <Sel label="Variegación Objetivo" value={form.variegacion_id} onChange={v => set('variegacion_id', v)}
                      options={variegaciones.map(v => ({ value: v.id, label: v.nombre }))} />
                )}
             </div>
           </Section>

           <Section title="Valores Estándar del Experimento">
             <p style={{ color: '#4a8c5c', fontSize: '0.8rem', marginBottom: '10px' }}>
                Estos valores tienen la MÁXIMA prioridad sobre la especie o línea.
             </p>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Temperatura (°C)" type="number" value={form.temperatura_c} onChange={v => set('temperatura_c', v)} />
                <Field label="Humedad Rel. (%)" type="number" value={form.humedad_relativa_pct} onChange={v => set('humedad_relativa_pct', v)} />
                <Field label="PH Objetivo" type="number" value={form.ph_sustrato} onChange={v => set('ph_sustrato', v)} />
                <Field label="Luz (lux)" type="number" value={form.luz_lux} onChange={v => set('luz_lux', v)} />
                <Field label="NPK" value={form.npk} onChange={v => set('npk', v)} />
                <Field label="Nutrición (PPM)" type="number" value={form.ppm} onChange={v => set('ppm', v)} />
              </div>
           </Section>

          <div style={ss.actions}>
            <button type="button" style={ss.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={ss.btnSave} disabled={loading}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 }}>{label}</label>
      <select style={s.input} value={value || ''} onChange={e => onChange(e.target.value)}>
        <option value="">— Ninguno / Todos —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Field({ label, value, onChange, type="text" }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 }}>{label}</label>
      <input type={type} step="0.1" style={s.input} value={value || ''} onChange={e => onChange(e.target.value)} placeholder="—" />
    </div>
  )
}

const s = {
  page: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  header: { display: 'flex', flexDirection: 'column', gap: 8 },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#7dca8f', margin: 0, fontSize: '1.4rem' },
  meta: { color: '#4a5568', fontSize: '0.85rem', margin: 0 },
  badge: { borderRadius: 20, padding: '0.1rem 0.6rem', fontSize: '0.65rem', color: '#fff', textTransform: 'uppercase', fontWeight: 600 },
  btnSec: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 8, color: '#7dca8f', padding: '0.6rem', fontSize: '0.82rem', cursor: 'pointer', marginTop: 8 },
  section: { background: '#1a2e1e', padding: '1rem', borderRadius: 12 },
  secTitle: { color: '#4a8c5c', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' },
  text: { color: '#e0f0e5', fontSize: '0.95rem', margin: 0, lineHeight: 1.4 },
  input: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.6rem', color: '#e0f0e5', fontSize: '0.9rem', outline: 'none' },
  muted: { color: '#4a5568', textAlign: 'center', padding: '2rem' },
  error: { color: '#f28b82', textAlign: 'center', padding: '2rem' },
}

const ss = {
  overlay: { position: 'fixed', inset: 0, background: '#000c', display: 'flex', alignItems: 'flex-end', zIndex: 150 },
  sheet: { background: '#1a2e1e', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxHeight: '80dvh', overflowY: 'auto' },
  title: { color: '#7dca8f', margin: '0 0 1rem', fontSize: '1.1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  actions: { display: 'flex', gap: 10, marginTop: 10 },
  btnCancel: { flex: 1, background: 'none', border: '1px solid #2d5c3a', borderRadius: 8, color: '#7dca8f', padding: '0.75rem', cursor: 'pointer' },
  btnSave: { flex: 1, background: '#2d7a47', border: 'none', borderRadius: 8, color: '#fff', padding: '0.75rem', fontWeight: 600, cursor: 'pointer' },
}
