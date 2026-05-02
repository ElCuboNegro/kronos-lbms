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
      
      <div style={{background:'var(--theme-surface)',padding:'1rem',borderRadius:12}}>
         <h4 style={{color:'var(--theme-secondary)',fontSize:'0.75rem',fontWeight:700,textTransform:'uppercase',letterSpacing:1,margin:'0 0 8px 0'}}>Especímenes en estudio</h4>
         <p style={{color:'var(--theme-text-muted)',textAlign:'center',padding:'2rem'}}>Próximamente: Lista de individuos vinculados.</p>
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

function Field({ label, value, onChange, type="text" }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ color: 'var(--theme-secondary)', fontSize: '0.78rem', fontWeight: 600 }}>{label}</label>
      <input type={type} step="0.1" style={{background:'var(--theme-background)',border:'1px solid var(--theme-border)',borderRadius:8,padding:'0.6rem',color:'var(--theme-text)',fontSize:'0.9rem',outline:'none'}} value={value || ''} onChange={e => onChange(e.target.value)} placeholder="—" />
    </div>
  )
}

