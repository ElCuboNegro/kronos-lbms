import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function EspecieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [especie, setEspecie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLineaForm, setShowLineaForm] = useState(false)
  const [showConfigForm, setShowConfigForm] = useState(false)
  const [activeLinea, setActiveLinea] = useState(null)
  const [activeLineaConfig, setActiveLineaConfig] = useState(null)
  const [activeVarConfig, setActiveVarConfig] = useState(null)
  const [activeTab, setActiveTab] = useState('ficha')

  async function fetchEspecie() {
    setLoading(true)
    try { setEspecie(await api.get(`/especies/${id}`)) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchEspecie() }, [id])

  if (loading) return <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}><p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>Cargando…</p></div>
  if (!especie) return <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}><p style={{color:'var(--error)'}}>No encontrada</p></div>

  return (
    <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
      {/* Cabecera */}
      <div className="page-header" style={{display:'flex',flexDirection:'column',gap:4}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <h2 style={{color:'var(--bio-primary)',margin:0,fontSize:'1.4rem',fontStyle:'italic'}}>{especie.nombre_cientifico}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
               <span className="badge badge--outline">{especie.categoria}</span>
               {especie.nombre_comun && <p style={{color:'var(--bio-text)',margin:0,fontSize:'1rem'}}>{especie.nombre_comun}</p>}
            </div>
          </div>
          <span className="badge badge--outline font-mono">{especie.codigo}</span>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>
          {especie.familia && <Tag label={especie.familia} />}
          {especie.genero && <Tag label={especie.genero} color="var(--bio-border)" />}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:0,borderBottom:'1px solid var(--bio-border)',marginBottom:4}}>
        {['ficha', 'lineas', 'experimentos', 'protocolos', 'sustratos'].map(tab => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              style={{ 
                background:'none',
                border:'none',
                borderBottom: isActive ? '2px solid var(--bio-primary)' : '2px solid transparent',
                padding:'0.5rem 0.85rem',
                color: isActive ? 'var(--bio-primary)' : 'var(--bio-text-muted)',
                fontSize:'0.82rem',
                cursor:'pointer',
                marginBottom:-1,
                fontWeight: isActive ? 600 : 400
              }}
              onClick={() => setActiveTab(tab)}
            >
              {{ ficha: 'Ficha', lineas: `Líneas (${especie.lineas.length})`, experimentos: 'Experimentos', protocolos: 'Protocolos', sustratos: 'Sustratos' }[tab]}
            </button>
          )
        })}
      </div>

      {/* Ficha */}
      {activeTab === 'ficha' && (
        <FichaPanel especie={especie} especieId={id} onSaved={fetchEspecie} />
      )}

      {/* Líneas */}
      {activeTab === 'lineas' && (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 style={{color:'var(--bio-primary)',margin:0,fontSize:'1rem'}}>Líneas genéticas</h3>
            <button className="btn btn--primary" onClick={() => setShowLineaForm(true)}>+ Línea</button>
          </div>
          {especie.lineas.length === 0
            ? <p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>Sin líneas registradas</p>
            : especie.lineas.map(linea => (
                <LineaCard
                  key={linea.id}
                  linea={linea}
                  onAddVar={() => setActiveLinea(linea)}
                  onEditConfig={() => setActiveLineaConfig(linea)}
                  onEditVarConfig={(v) => setActiveVarConfig(v)}
                  onVerIndividuos={() => navigate(`/especimenes?linea=${linea.id}`)}
                />
              ))
          }
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button className="btn btn--ghost" onClick={() => navigate(`/especimenes?especie=${id}`)}>
              Ver todos los individuos ({especie.total_individuos})
            </button>
            <button className="btn btn--primary" onClick={() => navigate(`/nuevo-individuo?especie=${id}`)}>
              + Individuo
            </button>
            <button className="btn btn--secondary" onClick={() => navigate(`/nuevo-lote?especie=${id}`)}>
              + Lotes
            </button>
          </div>
        </div>
      )}

      {/* Experimentos */}
      {activeTab === 'experimentos' && (
        <ExperimentosPanel especieId={id} navigate={navigate} />
      )}

      {/* Protocolos */}
      {activeTab === 'protocolos' && (
        <ProtocolosPanel especieId={id} navigate={navigate} />
      )}

      {/* Sustratos */}
      {activeTab === 'sustratos' && (
        <SustratosPanel navigate={navigate} />
      )}

      {showLineaForm && (
        <LineaForm
          especieId={id}
          onSaved={() => { setShowLineaForm(false); fetchEspecie() }}
          onCancel={() => setShowLineaForm(false)}
        />
      )}
      {activeLinea && (
        <VariegacionForm
          lineaId={activeLinea.id}
          lineaNombre={activeLinea.nombre}
          onSaved={() => { setActiveLinea(null); fetchEspecie() }}
          onCancel={() => setActiveLinea(null)}
        />
      )}

      {activeLineaConfig && (
        <LineaConfigForm 
          linea={activeLineaConfig}
          onSaved={() => { setActiveLineaConfig(null); fetchEspecie() }}
          onCancel={() => setActiveLineaConfig(null)}
        />
      )}

      {activeVarConfig && (
        <VariegacionConfigForm 
          variegacion={activeVarConfig}
          onSaved={() => { setActiveVarConfig(null); fetchEspecie() }}
          onCancel={() => setActiveVarConfig(null)}
        />
      )}
    </div>
  )
}

// ── Ficha Panel ────────────────────────────────────────────────────────────────

function FichaPanel({ especie, especieId, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [showConfigForm, setShowConfigForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fetchingWiki, setFetchingWiki] = useState(false)
  const [wikiError, setWikiError] = useState('')
  const [form, setForm] = useState({
    nombre_cientifico: especie.nombre_cientifico || '',
    categoria: especie.categoria || 'especie',
    nombre_comun: especie.nombre_comun || '',
    familia: especie.familia || '',
    genero: especie.genero || '',
    descripcion: especie.descripcion || '',
    requerimientos: especie.requerimientos || {},
    ficha: especie.ficha || {},
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setFicha = (k, v) => setForm(f => ({ ...f, ficha: { ...f.ficha, [k]: v } }))
  const setReq = (k, v) => setForm(f => ({ ...f, requerimientos: { ...f.requerimientos, [k]: v } }))

  async function fetchWiki() {
    setFetchingWiki(true)
    setWikiError('')
    try {
      const data = await api.get(`/especies/${especieId}/wiki`)
      if (data.extracto) set('descripcion', data.extracto)
      setFicha('wiki_url', data.wiki_url || '')
      setFicha('wiki_lang', data.wiki_lang || 'es')
      setFicha('wiki_titulo', data.titulo || '')
      if (!editing) setEditing(true)
    } catch (e) {
      setWikiError(e.message || 'No encontrado en Wikipedia')
    } finally {
      setFetchingWiki(false)
    }
  }

  async function save() {
    setSaving(true)
    try {
      const ficha = { ...form.ficha, wiki_fetched_at: form.ficha.wiki_url ? new Date().toISOString() : undefined }
      await api.patch(`/especies/${especieId}`, {
        nombre_cientifico: form.nombre_cientifico,
        categoria: form.categoria,
        nombre_comun: form.nombre_comun || null,
        familia: form.familia || null,
        genero: form.genero || null,
        descripcion: form.descripcion || null,
        requerimientos: Object.keys(form.requerimientos).length ? form.requerimientos : null,
        ficha: Object.keys(ficha).length ? ficha : null,
      })
      await onSaved()
      setEditing(false)
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  function cancel() {
    setForm({
      nombre_cientifico: especie.nombre_cientifico || '',
      categoria: especie.categoria || 'especie',
      nombre_comun: especie.nombre_comun || '',
      familia: especie.familia || '',
      genero: especie.genero || '',
      descripcion: especie.descripcion || '',
      requerimientos: especie.requerimientos || {},
      ficha: especie.ficha || {},
    })
    setEditing(false)
    setWikiError('')
  }

  const ficha = form.ficha
  const req = form.requerimientos

  return (
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {/* Acciones ficha */}
      <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
        <button className="btn btn--ghost"
          onClick={fetchWiki}
          disabled={fetchingWiki}
          title="Buscar descripción en Wikipedia usando el nombre científico"
        >
          {fetchingWiki ? 'Buscando…' : 'Wikipedia →'}
        </button>
        {ficha.wiki_url && (
          <a href={ficha.wiki_url} target="_blank" rel="noreferrer" style={{color:'var(--bio-secondary)',fontSize:'0.8rem',textDecoration:'underline'}}>
            Ver en Wikipedia
          </a>
        )}
        {!editing
          ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn--ghost" onClick={() => setEditing(true)}>Editar</button>
              <button className="btn btn--ghost" onClick={() => setShowConfigForm(true)}>Valores Estándar</button>
            </div>
          )
          : <>
              <button className="btn btn--primary" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              <button className="btn btn--ghost" onClick={cancel}>Cancelar</button>
            </>
        }
      </div>
      {wikiError && <p style={{color:'var(--error)',fontSize:'0.82rem',margin:0}}>{wikiError}</p>}

      {showConfigForm && (
        <ConfigEstandarForm 
          especie={especie}
          onSaved={() => { setShowConfigForm(false); onSaved() }}
          onCancel={() => setShowConfigForm(false)}
        />
      )}

      {/* Descripción */}
      <FichaSection title="Taxonomía y Descripción">
        {editing
          ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                   <Txt label="Nombre Científico" value={form.nombre_cientifico} onChange={v => set('nombre_cientifico', v)} italic={form.categoria === 'especie'} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label style={{color:'var(--bio-secondary)',fontSize:'0.82rem',fontWeight:600,minWidth:110}}>Categoría</label>
                  <select  value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                    <option value="especie">Especie</option>
                    <option value="subespecie">Subespecie</option>
                    <option value="cultivar">Cultivar</option>
                    <option value="hibrido">Híbrido</option>
                  </select>
                </div>

              </div>
              <Txt label="Nombre Común" value={form.nombre_comun} onChange={v => set('nombre_comun', v)} />
              <div style={{ display: 'flex', gap: 10 }}>
                <Txt label="Familia" value={form.familia} onChange={v => set('familia', v)} />
                <Txt label="Género" value={form.genero} onChange={v => set('genero', v)} />
              </div>
              <textarea  value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={5} placeholder="Descripción general de la especie…" />
            </div>
          )
          : form.descripcion
            ? <p style={{color:'var(--bio-text)',fontSize:'0.88rem',margin:0,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{form.descripcion}</p>
            : <p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>Sin descripción. Usa el botón Wikipedia para obtener una.</p>
        }
      </FichaSection>

      {/* Condiciones óptimas */}
      <FichaSection title="Condiciones óptimas de desarrollo">
        {editing ? (
          <div className="grid-2">
            <CondField label="Temperatura (°C)" value={req.temperatura || ''} onChange={v => setReq('temperatura', v)} />
            <CondField label="Humedad relativa (%)" value={req.humedad || ''} onChange={v => setReq('humedad', v)} />
            <CondField label="Luz (lux / descripción)" value={req.luz || ''} onChange={v => setReq('luz', v)} />
            <CondField label="Sustrato" value={req.sustrato || ''} onChange={v => setReq('sustrato', v)} />
            <CondField label="pH" value={req.ph || ''} onChange={v => setReq('ph', v)} />
            <CondField label="Riego" value={req.riego || ''} onChange={v => setReq('riego', v)} />
            <div style={{ gridColumn: '1 / -1' }}>
              <CondField label="Notas adicionales" value={req.notas || ''} onChange={v => setReq('notas', v)} />
            </div>
          </div>
        ) : (
          Object.keys(req).length
            ? <CondTable data={req} />
            : <p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>Sin condiciones registradas.</p>
        )}
      </FichaSection>

      {/* Ciclo de vida */}
      <FichaSection title="Ciclo de vida">
        {editing
          ? <textarea  value={ficha.ciclo_vida || ''} onChange={e => setFicha('ciclo_vida', e.target.value)} rows={4} placeholder="Describe el ciclo de vida: germinación, crecimiento vegetativo, floración, fructificación…" />
          : ficha.ciclo_vida
            ? <p style={{color:'var(--bio-text)',fontSize:'0.88rem',margin:0,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{ficha.ciclo_vida}</p>
            : <p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>Sin información de ciclo de vida.</p>
        }
      </FichaSection>

      {/* Maduración */}
      <FichaSection title="Maduración">
        {editing
          ? <textarea  value={ficha.maduracion || ''} onChange={e => setFicha('maduracion', e.target.value)} rows={3} placeholder="Tiempo y condiciones de maduración, indicadores de madurez…" />
          : ficha.maduracion
            ? <p style={{color:'var(--bio-text)',fontSize:'0.88rem',margin:0,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{ficha.maduracion}</p>
            : <p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>Sin información de maduración.</p>
        }
      </FichaSection>

      {/* Notas de cultivo */}
      <FichaSection title="Notas de cultivo">
        {editing
          ? <textarea  value={ficha.notas_cultivo || ''} onChange={e => setFicha('notas_cultivo', e.target.value)} rows={3} placeholder="Tips, observaciones propias, recomendaciones de manejo…" />
          : ficha.notas_cultivo
            ? <p style={{color:'var(--bio-text)',fontSize:'0.88rem',margin:0,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{ficha.notas_cultivo}</p>
            : <p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>Sin notas de cultivo.</p>
        }
      </FichaSection>
    </div>
  )
}

function FichaSection({ title, children }) {
  return (
    <div className="card">
      <h4 style={{color:'var(--bio-secondary)',margin:'0 0 0.5rem',fontSize:'0.78rem',fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>{title}</h4>
      {children}
    </div>
  )
}

function CondField({ label, value, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="—" />
    </div>
  )
}

function CondTable({ data }) {
  const LABELS = {
    temperatura: 'Temperatura', humedad: 'Humedad', luz: 'Luz',
    sustrato: 'Sustrato', ph: 'pH', riego: 'Riego', notas: 'Notas',
  }
  const entries = Object.entries(data).filter(([, v]) => v)
  if (!entries.length) return null
  return (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {entries.map(([k, v]) => (
        <div key={k} style={{display:'flex',gap:8}}>
          <span style={{color:'var(--bio-secondary)',fontSize:'0.82rem',fontWeight:600,minWidth:110}}>{LABELS[k] || k}</span>
          <span style={{color:'var(--bio-text)',fontSize:'0.82rem'}}>{v}</span>
        </div>
      ))}
    </div>
  )
}

// ── Experimentos Panel ─────────────────────────────────────────────────────────

function ExperimentosPanel({ especieId, navigate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/especies/${especieId}/experimentos`)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [especieId])

  if (loading) return <p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>Cargando…</p>

  const ESTADO_COLOR = { activo: 'var(--bio-primary)', planificado: 'var(--bio-secondary)', pausado: '#c6a230', completado: 'var(--bio-border)', cancelado: '#553333' }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <h3 style={{color:'var(--bio-primary)',margin:0,fontSize:'1rem'}}>Experimentos con esta especie</h3>
      {!data || data.length === 0
        ? <p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>No hay experimentos registrados con especímenes de esta especie.</p>
        : data.map(exp => (
            <div key={exp.id} className="tile" onClick={() => navigate(`/experimentos/${exp.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{color:'var(--bio-primary)',fontWeight:600,fontSize:'0.92rem'}}>{exp.nombre}</span>
                <span className={`badge ${exp.estado === "activo" ? "badge--success" : exp.estado === "pausado" ? "badge--warning" : exp.estado === "cancelado" ? "badge--danger" : "badge--outline"}`}>
                  {exp.estado}
                </span>
              </div>
              <div style={{display:'flex',gap:12,marginTop:4,color:'var(--bio-text-muted)',fontSize:'0.78rem',flexWrap:'wrap'}}>
                {exp.director_nombre && <span>Dir: {exp.director_nombre}</span>}
                <span>{exp.num_especimenes} especímenes de esta especie</span>
                <span>{exp.fecha_inicio}</span>
              </div>
            </div>
          ))
      }
    </div>
  )
}

// ── Protocolos Panel ───────────────────────────────────────────────────────────

function ProtocolosPanel({ especieId, navigate }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/especies/${especieId}/protocolos`)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [especieId])

  if (loading) return <p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>Cargando…</p>

  const TIPO_LABEL = {
    extraccion_meristema: 'Extracción meristema', propagacion_in_vitro: 'Propagación in vitro',
    desinfeccion: 'Desinfección', subcultivo: 'Subcultivo', enraizamiento: 'Enraizamiento',
    aclimatacion: 'Aclimatación', otro: 'Otro',
  }
  const VALIDACION_COLOR = { validado: 'var(--bio-primary)', borrador: 'var(--bio-text-muted)', obsoleto: '#553333' }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <h3 style={{color:'var(--bio-primary)',margin:0,fontSize:'1rem'}}>Protocolos aplicados a esta especie</h3>
      {!data || data.length === 0
        ? <p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>No hay protocolos vinculados a experimentos o registros de evolución de esta especie.</p>
        : data.map(p => (
            <div key={p.id} className="tile" onClick={() => navigate(`/protocolos/${p.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{color:'var(--bio-primary)',fontWeight:600,fontSize:'0.92rem'}}>{p.nombre}</span>
                <span className={`badge ${p.estado_validacion === "validado" ? "badge--success" : p.estado_validacion === "obsoleto" ? "badge--danger" : "badge--outline"}`}>
                  {p.estado_validacion}
                </span>
              </div>
              <div style={{display:'flex',gap:12,marginTop:4,color:'var(--bio-text-muted)',fontSize:'0.78rem',flexWrap:'wrap'}}>
                <span>{TIPO_LABEL[p.tipo] || p.tipo}</span>
                <span>v{p.version}</span>
              </div>
            </div>
          ))
      }
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ConfigEstandarForm({ especie, onSaved, onCancel }) {
  const [form, setForm] = useState(especie.config_estandar || {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v === '' ? undefined : v }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch(`/especies/${especie.id}`, { config_estandar: form })
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{position:"fixed",inset:0,background:"#0009",display:"flex",alignItems:"flex-end",zIndex:100}}>
      <div style={{background:"var(--bio-surface)",borderRadius:"16px 16px 0 0",padding:"1.5rem",width:"100%",maxHeight:"88dvh",overflowY:"auto"}}>
        <h3 style={{color:"var(--bio-primary)",margin:"0 0 1rem",fontSize:"1rem"}}>Valores Estándar ({especie.codigo})</h3>
        <p style={{ color: 'var(--bio-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Estos valores se auto-completarán en nuevos registros de evolución si se dejan vacíos.
        </p>
        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:10}}>
          <div className="grid-2">
            <ConfigNum label="Temperatura (°C)" value={form.temperatura_c} onChange={v => set('temperatura_c', v)} />
            <ConfigNum label="Humedad Rel. (%)" value={form.humedad_relativa_pct} onChange={v => set('humedad_relativa_pct', v)} />
            <ConfigNum label="PH Sustrato" value={form.ph_sustrato} onChange={v => set('ph_sustrato', v)} />
            <ConfigNum label="Luz (lux)" value={form.luz_lux} onChange={v => set('luz_lux', v)} />
            <ConfigField label="NPK" value={form.npk} onChange={v => set('npk', v)} placeholder="20-20-20" />
            <ConfigNum label="Nutrición (PPM)" value={form.ppm} onChange={v => set('ppm', v)} />
          </div>
          <ConfigField label="Sustrato por defecto" value={form.sustrato} onChange={v => set('sustrato', v)} />
          <ConfigField label="Contenedor por defecto" value={form.tipo_contenedor} onChange={v => set('tipo_contenedor', v)} />
          
          {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem' }}>{error}</p>}
          
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? '…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LineaConfigForm({ linea, onSaved, onCancel }) {
  const [form, setForm] = useState(linea.config_estandar || {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v === '' ? undefined : v }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch(`/especies/lineas/${linea.id}`, { config_estandar: form })
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{position:"fixed",inset:0,background:"#0009",display:"flex",alignItems:"flex-end",zIndex:100}}>
      <div style={{background:"var(--bio-surface)",borderRadius:"16px 16px 0 0",padding:"1.5rem",width:"100%",maxHeight:"88dvh",overflowY:"auto"}}>
        <h3 style={{color:"var(--bio-primary)",margin:"0 0 1rem",fontSize:"1rem"}}>Valores Estándar Línea: {linea.nombre}</h3>
        <p style={{ color: 'var(--bio-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Estos valores tienen prioridad sobre los de la especie.
        </p>
        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:10}}>
          <div className="grid-2">
            <ConfigNum label="Temperatura (°C)" value={form.temperatura_c} onChange={v => set('temperatura_c', v)} />
            <ConfigNum label="Humedad Rel. (%)" value={form.humedad_relativa_pct} onChange={v => set('humedad_relativa_pct', v)} />
            <ConfigNum label="PH Sustrato" value={form.ph_sustrato} onChange={v => set('ph_sustrato', v)} />
            <ConfigNum label="Luz (lux)" value={form.luz_lux} onChange={v => set('luz_lux', v)} />
            <ConfigField label="NPK" value={form.npk} onChange={v => set('npk', v)} placeholder="20-20-20" />
            <ConfigNum label="Nutrición (PPM)" value={form.ppm} onChange={v => set('ppm', v)} />
          </div>
          <ConfigField label="Sustrato por defecto" value={form.sustrato} onChange={v => set('sustrato', v)} />
          <ConfigField label="Contenedor por defecto" value={form.tipo_contenedor} onChange={v => set('tipo_contenedor', v)} />
          
          {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem' }}>{error}</p>}
          
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? '…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function VariegacionConfigForm({ variegacion, onSaved, onCancel }) {
  const [form, setForm] = useState(variegacion.config_estandar || {})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v === '' ? undefined : v }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch(`/especies/variegaciones/${variegacion.id}`, { config_estandar: form })
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{position:"fixed",inset:0,background:"#0009",display:"flex",alignItems:"flex-end",zIndex:100}}>
      <div style={{background:"var(--bio-surface)",borderRadius:"16px 16px 0 0",padding:"1.5rem",width:"100%",maxHeight:"88dvh",overflowY:"auto"}}>
        <h3 style={{color:"var(--bio-primary)",margin:"0 0 1rem",fontSize:"1rem"}}>Valores Estándar Variegación: {variegacion.nombre}</h3>
        <p style={{ color: 'var(--bio-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Estos valores tienen prioridad sobre la línea y la especie.
        </p>
        <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:10}}>
          <div className="grid-2">
            <ConfigNum label="Temperatura (°C)" value={form.temperatura_c} onChange={v => set('temperatura_c', v)} />
            <ConfigNum label="Humedad Rel. (%)" value={form.humedad_relativa_pct} onChange={v => set('humedad_relativa_pct', v)} />
            <ConfigNum label="PH Sustrato" value={form.ph_sustrato} onChange={v => set('ph_sustrato', v)} />
            <ConfigNum label="Luz (lux)" value={form.luz_lux} onChange={v => set('luz_lux', v)} />
            <ConfigField label="NPK" value={form.npk} onChange={v => set('npk', v)} placeholder="20-20-20" />
            <ConfigNum label="Nutrición (PPM)" value={form.ppm} onChange={v => set('ppm', v)} />
          </div>
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? '…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfigField({ label, value, onChange, placeholder }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder || '—'} />
    </div>
  )
}

function Txt({ label, value, onChange, italic }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input 
        value={value || ''} 
        onChange={e => onChange(e.target.value)} 
        style={italic ? { fontStyle: 'italic' } : {}}
      />
    </div>
  )
}

function ConfigNum({ label, value, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input type="number" step="0.1" value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder="—" />
    </div>
  )
}

function SustratosPanel({ navigate }) {
  const [sustratos, setSustratos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/sustratos').then(setSustratos).finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>Cargando…</p>

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3 style={{color:'var(--bio-primary)',margin:0,fontSize:'1rem'}}>Formulaciones de Sustrato</h3>
        <button className="btn btn--secondary" onClick={() => navigate('/medios')}>Gestionar 🧪</button>
      </div>
      {sustratos.length === 0 ? <p style={{color:'var(--bio-text-muted)',fontSize:'0.9rem',margin:0}}>Sin sustratos registrados</p> : (
        sustratos.map(su => (
          <div key={su.id} className="tile">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{color:'var(--bio-primary)',fontWeight:600,fontSize:'0.92rem'}}>{su.nombre}</span>
              <span className="badge badge--outline font-mono">{su.codigo_formulacion}</span>
            </div>
            {su.descripcion && <p style={{ color: 'var(--bio-text-muted)', fontSize: '0.8rem', margin: '4px 0' }}>{su.descripcion}</p>}
            <div style={{display:'flex',gap:12,marginTop:4,color:'var(--bio-text-muted)',fontSize:'0.78rem',flexWrap:'wrap'}}>
              {su.ph_teorico && <span>pH: {su.ph_teorico}</span>}
              {su.conductividad_teorica && <span>EC: {su.conductividad_teorica}</span>}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function Tag({ label, color = 'var(--bio-border)' }) {
  return <span style={{ borderRadius:20,padding:'0.2rem 0.65rem',fontSize:'0.75rem',color:'var(--bio-primary)',fontStyle:'italic', background: color }}>{label}</span>
}

function LineaCard({ linea, onAddVar, onVerIndividuos, onEditConfig, onEditVarConfig }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(true)

  const METODO_LABEL = {
    semilla: 'Semilla', clonacion: 'Linaje Clonal',
    mutacion_in_vitro: 'Mutación in vitro', desconocido: '',
  }

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <button style={{width:'100%',background:'none',border:'none',padding:'0.75rem 1rem',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',textAlign:'left'}} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{color:'var(--bio-primary)',fontWeight:600,fontSize:'0.95rem'}}>{linea.nombre}</span>
            {linea.metodo_propagacion !== 'desconocido' && (
              <span className="badge badge--outline">{METODO_LABEL[linea.metodo_propagacion]}</span>
            )}
          </div>
          <span style={{color:'var(--bio-text-muted)',fontSize:'0.8rem'}}>{linea.variegaciones.length} var. · {linea.total_individuos} ind.</span>
        </div>
        <span style={{ color: 'var(--bio-secondary)', fontSize: '0.85rem' }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={{padding:'0 1rem 0.75rem',display:'flex',flexDirection:'column',gap:8}}>
          {linea.descripcion && <p style={{color:'var(--bio-text-muted)',fontSize:'0.85rem',margin:0}}>{linea.descripcion}</p>}
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {linea.variegaciones.map(v => <VarChip key={v.id} v={v} onEditConfig={onEditVarConfig} />)}
            <button style={{background:'none',border:'1px dashed var(--bio-border)',borderRadius:20,color:'var(--bio-secondary)',padding:'0.3rem 0.75rem',fontSize:'0.82rem',cursor:'pointer'}} onClick={onAddVar}>+ variegación</button>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{background:'none',border:'none',color:'var(--bio-secondary)',fontSize:'0.8rem',cursor:'pointer',textAlign:'left',padding:0}} onClick={onVerIndividuos}>Ver individuos →</button>
              <button style={{background:'none',border:'none',color:'var(--bio-secondary)',fontSize:'0.8rem',cursor:'pointer',textAlign:'left',padding:0}} onClick={onEditConfig}>⚙️ Config</button>
            </div>
            <button className="btn btn--ghost"
              onClick={() => navigate(`/nuevo-individuo?especie=${linea.especie_id}&linea=${linea.id}`)}>
              + Nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function VarChip({ v, onEditConfig }) {
  return (
    <div style={{background:'var(--bio-background)',border:'1px solid var(--bio-border)',borderRadius:20,padding:'0.3rem 0.75rem',display:'flex',gap:6,alignItems:'center'}}>
      <span style={{color:'var(--bio-text)',fontSize:'0.82rem'}}>{v.nombre}</span>
      <span style={{color:'var(--bio-text-muted)',fontSize:'0.72rem'}}>({v.total_individuos})</span>
      <button onClick={() => onEditConfig(v)} style={{background:'none',border:'none',color:'var(--bio-secondary)',cursor:'pointer',fontSize:'0.85rem',padding:0,marginLeft:4}} title="Configurar cuidados de esta variegación">⚙️</button>
    </div>
  )
}


function LineaForm({ especieId, onSaved, onCancel }) {
  const [form, setForm] = useState({ nombre: '', metodo_propagacion: 'desconocido', descripcion: '', notas: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/especies/${especieId}/lineas`, Object.fromEntries(Object.entries(form).filter(([, v]) => v)))
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <SheetForm title="Nueva línea genética" onCancel={onCancel} onSubmit={submit} loading={loading} error={error}>
      <Field label="Nombre de la línea *" value={form.nombre} onChange={v => set('nombre', v)} required />
      <div className="form-group">
        <label style={{color:'var(--bio-secondary)',fontSize:'0.78rem',fontWeight:600}}>Origen / Método de Propagación</label>
        <select  value={form.metodo_propagacion} onChange={e => set('metodo_propagacion', e.target.value)}>
          <option value="desconocido">Desconocido</option>
          <option value="semilla">Semilla (Selección/Consanguinidad)</option>
          <option value="clonacion">Clonación / Propagación Vegetativa</option>
          <option value="mutacion_in_vitro">Mutación in vitro estabilizada</option>
        </select>
      </div>
      <Field label="Descripción" value={form.descripcion} onChange={v => set('descripcion', v)} textarea />
      <Field label="Notas" value={form.notas} onChange={v => set('notas', v)} textarea />
    </SheetForm>
  )
}

function VariegacionForm({ lineaId, lineaNombre, onSaved, onCancel }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', notas: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/especies/lineas/${lineaId}/variegaciones`, Object.fromEntries(Object.entries(form).filter(([, v]) => v)))
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <SheetForm title={`Nueva variegación — ${lineaNombre}`} onCancel={onCancel} onSubmit={submit} loading={loading} error={error}>
      <Field label="Nombre de la variegación *" value={form.nombre} onChange={v => set('nombre', v)} required />
      <Field label="Descripción" value={form.descripcion} onChange={v => set('descripcion', v)} textarea />
      <Field label="Notas" value={form.notas} onChange={v => set('notas', v)} textarea />
    </SheetForm>
  )
}

function SheetForm({ title, onCancel, onSubmit, loading, error, children }) {
  return (
    <div style={{position:'fixed',inset:0,background:'#0009',display:'flex',alignItems:'flex-end',zIndex:100}}>
      <div style={{background:'var(--bio-surface)',borderRadius:'16px 16px 0 0',padding:'1.5rem',width:'100%',maxHeight:'88dvh',overflowY:'auto'}}>
        <h3 style={{color:'var(--bio-primary)',margin:'0 0 1rem',fontSize:'1rem'}}>{title}</h3>
        <form onSubmit={onSubmit} style={{display:'flex',flexDirection:'column',gap:10}}>
          {children}
          {error && <p style={{color:'var(--error)',fontSize:'0.85rem',margin:0}}>{error}</p>}
          <div style={{display:'flex',gap:8,marginTop:4}}>
            <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, textarea, required }) {
  return (
    <div className="form-group">
      <label style={{color:'var(--bio-secondary)',fontSize:'0.78rem',fontWeight:600}}>{label}</label>
      {textarea
        ? <textarea  value={value} onChange={e => onChange(e.target.value)} />
        : <input  value={value} onChange={e => onChange(e.target.value)} required={required} />
      }
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

