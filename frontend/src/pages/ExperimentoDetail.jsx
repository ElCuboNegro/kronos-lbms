import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function ExperimentoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exp, setExp] = useState(null)
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(true)
  const [showConfig, setShowConfig] = useState(false)
  const [showResForm, setShowResForm] = useState(false)

  const fetchExp = async () => {
    setLoading(true)
    try {
      const e = await api.get(`/experimentos/${id}`)
      setExp(e)

      if (id && id.length > 20 && e.codigo) {
         navigate(`/experimentos/${e.codigo}`, { replace: true })
      }

      const res = await api.get(`/experimentos/${e.id}/resultados`)
      setResultados(res)
    }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchExp() }, [id])

  if (loading) return <p style={{color:'var(--theme-text-muted)',textAlign:'center',padding:'2rem'}}>Cargando…</p>
  if (!exp) return <p style={{color:'var(--error)',textAlign:'center',padding:'2rem'}}>Experimento no encontrado</p>

  return (
    <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
      <div className="page-header" style={{display:'flex',flexDirection:'column',gap:8}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h2 className="page-title" style={{color:'var(--theme-primary)',margin:0,fontSize:'1.4rem'}}>{exp.nombre}</h2>
          <span style={{borderRadius:20,padding:'0.1rem 0.6rem',fontSize:'0.65rem',color:'#fff',textTransform:'uppercase',fontWeight:600, background: exp.estado === 'activo' ? 'var(--theme-primary)' : 'var(--theme-text-muted)'}}>{exp.estado}</span>
        </div>
        <p style={{color:'var(--theme-text-muted)',fontSize:'0.85rem',margin:0}}>Iniciado: {new Date(exp.fecha_inicio).toLocaleDateString()}</p>
        <button style={{background:'var(--theme-surface)',border:'1px solid var(--theme-border)',borderRadius:8,color:'var(--theme-primary)',padding:'0.6rem',fontSize:'0.82rem',cursor:'pointer',marginTop:8}} onClick={() => setShowConfig(true)}>⚙️ Valores Estándar del Experimento</button>
      </div>

      <div style={{background:'var(--theme-surface)',padding:'1rem',borderRadius:12}}>
        <h4 style={{color:'var(--theme-secondary)',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:1,margin:'0 0 8px 0'}}>Hipótesis</h4>
        <p style={{color:'var(--theme-text)',fontSize:'0.95rem',margin:0,lineHeight:1.4}}>{exp.hipotesis || 'Sin hipótesis definida.'}</p>
      </div>

      {showConfig && (
        <ExpConfigForm
          exp={exp}
          onSaved={() => { setShowConfig(false); fetchExp() }}
          onCancel={() => setShowConfig(false)}
        />
      )}

      {showResForm && (
        <ResultadoForm
          expId={id}
          onSaved={() => { setShowResForm(false); fetchExp() }}
          onCancel={() => setShowResForm(false)}
        />
      )}

      <div style={{background:'var(--theme-surface)',padding:'1rem',borderRadius:12}}>
         <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
           <h4 style={{color:'var(--theme-secondary)',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:1,margin:0}}>Resultados ({resultados.length})</h4>
           <button style={{background:'var(--theme-primary)',border:'none',borderRadius:20,color:'#fff',padding:'0.2rem 0.75rem',fontSize:'0.75rem',fontWeight:700,cursor:'pointer'}} onClick={() => setShowResForm(true)}>+ Añadir</button>
         </div>
         {resultados.length === 0 ? (
           <p style={{color:'var(--theme-text-muted)',textAlign:'center',padding:'1rem 0',fontSize:'0.9rem'}}>No hay resultados registrados aún.</p>
         ) : (
           <div style={{display:'flex',flexDirection:'column',gap:10}}>
             {resultados.map(r => (
               <div key={r.id} style={{background:'var(--theme-background)',border:'1px solid var(--theme-border)',borderRadius:8,padding:'0.8rem'}}>
                 <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                   <span style={{color:'var(--theme-primary)',fontSize:'0.95rem',fontWeight:600}}>{r.titulo}</span>
                   <span style={{background:'var(--theme-border)',color:'var(--theme-primary)',fontSize:'0.65rem',padding:'2px 6px',borderRadius:4,textTransform:'uppercase',fontWeight:700}}>{r.tipo}</span>
                 </div>
                 <p style={{color:'var(--theme-text)',fontSize:'0.85rem',margin:'0 0 6px 0',lineHeight:1.4}}>{r.descripcion}</p>
                 <span style={{color:'var(--theme-text-muted)',fontSize:'0.7rem'}}>{new Date(r.fecha).toLocaleDateString()}</span>
               </div>
             ))}
           </div>
         )}
      </div>

      <div style={{background:'var(--theme-surface)',padding:'1rem',borderRadius:12}}>
         <h4 style={{color:'var(--theme-secondary)',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:1,margin:'0 0 8px 0'}}>Especímenes en estudio ({exp.especimenes?.length || 0})</h4>
         {(!exp.especimenes || exp.especimenes.length === 0) ? (
           <p style={{color:'var(--theme-text-muted)',textAlign:'center',padding:'1rem 0',fontSize:'0.9rem'}}>No hay especímenes vinculados a este experimento.</p>
         ) : (
           <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:10}}>
             {exp.especimenes.map(esp => (
               <div key={esp.id} className="tile" onClick={() => navigate(`/especimen/${esp.uid || esp.id}`)}>
                 <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <span className="text-primary" style={{fontWeight:700,fontSize:'0.92rem'}}>{esp.uid}</span>
                    <span className="badge badge--outline">{esp.estado}</span>
                 </div>
                 <div style={{display:'flex',gap:12,marginTop:2,fontSize:'0.8rem',flexWrap:'wrap'}}>
                    <span style={{color:'var(--theme-text)',fontStyle:'italic'}}>{esp.especie}</span>
                    {esp.linea_nombre && <span style={{color:'var(--theme-text-muted)'}}>{esp.linea_nombre}</span>}
                    {(() => { const m = esp.notas?.match(/(\d+)\s*semillas?/i); return m ? <span style={{color:'var(--theme-primary)',fontWeight:600}}>🌱 {m[1]} semillas</span> : null })()}
                 </div>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  )
}

function ResultadoForm({ expId, onSaved, onCancel }) {
  const [form, setForm] = useState({ titulo: '', tipo: 'observacion', descripcion: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post(`/experimentos/${expId}/resultados`, form)
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: 'var(--theme-surface)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '500px', padding: '1.5rem', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
        <h3 className="text-primary" style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>Añadir Resultado</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <Field label="Título" value={form.titulo} onChange={v => setForm({...form, titulo: v})} required />
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ color: 'var(--theme-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>Tipo de resultado</label>
            <select style={{background:'var(--theme-background)',border:'1px solid var(--theme-border)',borderRadius:8,padding:'0.6rem',color:'var(--theme-text)',fontSize:'0.9rem',outline:'none'}} value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
              <option value="observacion">Observación General</option>
              <option value="medicion">Medición Física</option>
              <option value="fotografia">Fotografía / Visual</option>
              <option value="hallazgo">Hallazgo Crítico</option>
              <option value="anomalia">Anomalía / Contaminación</option>
              <option value="conclusion">Conclusión Final</option>
            </select>
          </div>
          <Field label="Descripción detallada" value={form.descripcion} onChange={v => setForm({...form, descripcion: v})} textarea required />

          {error && <p className="text-danger" style={{ margin: 0, fontSize: '0.85rem' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Guardando...' : 'Guardar Resultado'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ExpConfigForm({ exp, onSaved, onCancel }) {
  const [especies, setEspecies] = useState([])
  const [lineas, setLineas] = useState([])
  const [variegaciones, setVariegaciones] = useState([])

  // Lista explícita de campos que manejamos en este formulario
  const CONFIG_KEYS = ['temperatura_c', 'humedad_relativa_pct', 'ph_sustrato', 'luz_lux', 'npk', 'ppm']

  // Extraer valores conocidos del config, o dejar undefined
  const initialConfig = {}
  if (exp.config_estandar) {
    for (const key of CONFIG_KEYS) {
      if (exp.config_estandar[key] !== undefined) {
        initialConfig[key] = exp.config_estandar[key]
      }
    }
  }

  const [form, setForm] = useState({
    ...initialConfig,
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
      const { especie_id, linea_id, variegacion_id } = form

      // Construir config estandar preservando lo que ya tenía el objeto original en DB
      // y sobreescribiendo/añadiendo solo los campos manejados por este formulario.
      const newConfig = { ...(exp.config_estandar || {}) }

      for (const key of CONFIG_KEYS) {
        if (form[key] !== undefined && form[key] !== '') {
          // Si el input es de tipo number, lo parseamos si aplica. NPK es string.
          if (['temperatura_c', 'humedad_relativa_pct', 'ph_sustrato', 'luz_lux', 'ppm'].includes(key)) {
             newConfig[key] = parseFloat(form[key])
          } else {
             newConfig[key] = form[key]
          }
        } else {
           delete newConfig[key]
        }
      }

      await api.patch(`/experimentos/${exp.id}`, {
        especie_id: especie_id || null,
        linea_id: linea_id || null,
        variegacion_id: variegacion_id || null,
        config_estandar: Object.keys(newConfig).length > 0 ? newConfig : null
      })
      onSaved()
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: 'var(--theme-surface)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', width: '100%', maxWidth: '500px', padding: '1.5rem', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))', animation: 'slideUp 0.3s ease-out', maxHeight: '88dvh', overflowY: 'auto' }}>
        <h3 style={{ color: 'var(--theme-primary)', margin: '0 0 1rem', fontSize: '1rem' }}>Configuración del Experimento</h3>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
             <p style={{ color: 'var(--theme-secondary)', fontSize: '0.8rem', marginBottom: '10px' }}>
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

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>Guardar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ color: 'var(--theme-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>{label}</label>
      <select style={{background:'var(--theme-background)',border:'1px solid var(--theme-border)',borderRadius:8,padding:'0.6rem',color:'var(--theme-text)',fontSize:'0.9rem',outline:'none'}} value={value || ''} onChange={e => onChange(e.target.value)}>
        <option value="">— Ninguno / Todos —</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'var(--theme-background)', borderRadius: 12, padding: '1rem', marginTop: '0.5rem' }}>
      <h4 style={{ color: 'var(--theme-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 8px 0' }}>{title}</h4>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, type="text", textarea=false, required=false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ color: 'var(--theme-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>{label}</label>
      {textarea ? (
         <textarea style={{background:'var(--theme-background)',border:'1px solid var(--theme-border)',borderRadius:8,padding:'0.6rem',color:'var(--theme-text)',fontSize:'0.9rem',outline:'none', minHeight: 80}} value={value || ''} onChange={e => onChange(e.target.value)} placeholder="—" required={required} />
      ) : (
         <input type={type} step="0.1" style={{background:'var(--theme-background)',border:'1px solid var(--theme-border)',borderRadius:8,padding:'0.6rem',color:'var(--theme-text)',fontSize:'0.9rem',outline:'none'}} value={value || ''} onChange={e => onChange(e.target.value)} placeholder="—" required={required} />
      )}
    </div>
  )
}
