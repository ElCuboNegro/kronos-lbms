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

  if (loading) return <div style={s.page}><p style={s.muted}>Cargando…</p></div>
  if (!especie) return <div style={s.page}><p style={s.error}>No encontrada</p></div>

  return (
    <div style={s.page}>
      {/* Cabecera */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <div>
            <h2 style={s.cientifico}>{especie.nombre_cientifico}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
               <span style={s.categoriaBadge}>{especie.categoria}</span>
               {especie.nombre_comun && <p style={{...s.comun, margin: 0}}>{especie.nombre_comun}</p>}
            </div>
          </div>
          <span style={s.codigoBadge}>{especie.codigo}</span>
        </div>
        <div style={s.tags}>
          {especie.familia && <Tag label={especie.familia} />}
          {especie.genero && <Tag label={especie.genero} color="#2d5c3a" />}
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabBar}>
        {['ficha', 'lineas', 'experimentos', 'protocolos', 'sustratos'].map(tab => (
          <button
            key={tab}
            style={{ ...s.tab, ...(activeTab === tab ? s.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {{ ficha: 'Ficha', lineas: `Líneas (${especie.lineas.length})`, experimentos: 'Experimentos', protocolos: 'Protocolos', sustratos: 'Sustratos' }[tab]}
          </button>
        ))}
      </div>

      {/* Ficha */}
      {activeTab === 'ficha' && (
        <FichaPanel especie={especie} especieId={id} onSaved={fetchEspecie} />
      )}

      {/* Líneas */}
      {activeTab === 'lineas' && (
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <h3 style={s.sectionTitle}>Líneas genéticas</h3>
            <button style={s.btnAdd} onClick={() => setShowLineaForm(true)}>+ Línea</button>
          </div>
          {especie.lineas.length === 0
            ? <p style={s.muted}>Sin líneas registradas</p>
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
          <div style={s.bottomActions}>
            <button style={s.btnVerIndividuos} onClick={() => navigate(`/especimenes?especie=${id}`)}>
              Ver todos los individuos ({especie.total_individuos})
            </button>
            <button style={s.btnNuevoIndividuo} onClick={() => navigate(`/nuevo-individuo?especie=${id}`)}>
              + Individuo
            </button>
            <button style={s.btnMulti} onClick={() => navigate(`/nuevo-lote?especie=${id}`)}>
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
    <div style={s.fichaWrapper}>
      {/* Acciones ficha */}
      <div style={s.fichaActions}>
        <button
          style={s.btnWiki}
          onClick={fetchWiki}
          disabled={fetchingWiki}
          title="Buscar descripción en Wikipedia usando el nombre científico"
        >
          {fetchingWiki ? 'Buscando…' : 'Wikipedia →'}
        </button>
        {ficha.wiki_url && (
          <a href={ficha.wiki_url} target="_blank" rel="noreferrer" style={s.wikiLink}>
            Ver en Wikipedia
          </a>
        )}
        {!editing
          ? (
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={s.btnEdit} onClick={() => setEditing(true)}>Editar</button>
              <button style={s.btnEdit} onClick={() => setShowConfigForm(true)}>Valores Estándar</button>
            </div>
          )
          : <>
              <button style={s.btnSaveInline} onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              <button style={s.btnCancelInline} onClick={cancel}>Cancelar</button>
            </>
        }
      </div>
      {wikiError && <p style={s.wikiError}>{wikiError}</p>}

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
                  <label style={s.condKey}>Categoría</label>
                  <select style={s.condInput} value={form.categoria} onChange={e => set('categoria', e.target.value)}>
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
              <textarea style={s.textarea} value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={5} placeholder="Descripción general de la especie…" />
            </div>
          )
          : form.descripcion
            ? <p style={s.fichaText}>{form.descripcion}</p>
            : <p style={s.muted}>Sin descripción. Usa el botón Wikipedia para obtener una.</p>
        }
      </FichaSection>

      {/* Condiciones óptimas */}
      <FichaSection title="Condiciones óptimas de desarrollo">
        {editing ? (
          <div style={s.condGrid}>
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
            : <p style={s.muted}>Sin condiciones registradas.</p>
        )}
      </FichaSection>

      {/* Ciclo de vida */}
      <FichaSection title="Ciclo de vida">
        {editing
          ? <textarea style={s.textarea} value={ficha.ciclo_vida || ''} onChange={e => setFicha('ciclo_vida', e.target.value)} rows={4} placeholder="Describe el ciclo de vida: germinación, crecimiento vegetativo, floración, fructificación…" />
          : ficha.ciclo_vida
            ? <p style={s.fichaText}>{ficha.ciclo_vida}</p>
            : <p style={s.muted}>Sin información de ciclo de vida.</p>
        }
      </FichaSection>

      {/* Maduración */}
      <FichaSection title="Maduración">
        {editing
          ? <textarea style={s.textarea} value={ficha.maduracion || ''} onChange={e => setFicha('maduracion', e.target.value)} rows={3} placeholder="Tiempo y condiciones de maduración, indicadores de madurez…" />
          : ficha.maduracion
            ? <p style={s.fichaText}>{ficha.maduracion}</p>
            : <p style={s.muted}>Sin información de maduración.</p>
        }
      </FichaSection>

      {/* Notas de cultivo */}
      <FichaSection title="Notas de cultivo">
        {editing
          ? <textarea style={s.textarea} value={ficha.notas_cultivo || ''} onChange={e => setFicha('notas_cultivo', e.target.value)} rows={3} placeholder="Tips, observaciones propias, recomendaciones de manejo…" />
          : ficha.notas_cultivo
            ? <p style={s.fichaText}>{ficha.notas_cultivo}</p>
            : <p style={s.muted}>Sin notas de cultivo.</p>
        }
      </FichaSection>
    </div>
  )
}

function FichaSection({ title, children }) {
  return (
    <div style={s.fichaSection}>
      <h4 style={s.fichaSectionTitle}>{title}</h4>
      {children}
    </div>
  )
}

function CondField({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <label style={s.condLabel}>{label}</label>
      <input style={s.condInput} value={value} onChange={e => onChange(e.target.value)} placeholder="—" />
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
    <div style={s.condTable}>
      {entries.map(([k, v]) => (
        <div key={k} style={s.condRow}>
          <span style={s.condKey}>{LABELS[k] || k}</span>
          <span style={s.condVal}>{v}</span>
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

  if (loading) return <p style={s.muted}>Cargando…</p>

  const ESTADO_COLOR = { activo: '#2d7a47', planificado: '#4a8c5c', pausado: '#c6a230', completado: '#1a472a', cancelado: '#553333' }

  return (
    <div style={s.section}>
      <h3 style={s.sectionTitle}>Experimentos con esta especie</h3>
      {!data || data.length === 0
        ? <p style={s.muted}>No hay experimentos registrados con especímenes de esta especie.</p>
        : data.map(exp => (
            <div key={exp.id} style={s.relCard} onClick={() => navigate(`/experimentos/${exp.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={s.relNombre}>{exp.nombre}</span>
                <span style={{ ...s.estadoBadge, background: ESTADO_COLOR[exp.estado] || '#2d5c3a' }}>
                  {exp.estado}
                </span>
              </div>
              <div style={s.relMeta}>
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

  if (loading) return <p style={s.muted}>Cargando…</p>

  const TIPO_LABEL = {
    extraccion_meristema: 'Extracción meristema', propagacion_in_vitro: 'Propagación in vitro',
    desinfeccion: 'Desinfección', subcultivo: 'Subcultivo', enraizamiento: 'Enraizamiento',
    aclimatacion: 'Aclimatación', otro: 'Otro',
  }
  const VALIDACION_COLOR = { validado: '#2d7a47', borrador: '#4a5568', obsoleto: '#553333' }

  return (
    <div style={s.section}>
      <h3 style={s.sectionTitle}>Protocolos aplicados a esta especie</h3>
      {!data || data.length === 0
        ? <p style={s.muted}>No hay protocolos vinculados a experimentos o registros de evolución de esta especie.</p>
        : data.map(p => (
            <div key={p.id} style={s.relCard} onClick={() => navigate(`/protocolos/${p.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={s.relNombre}>{p.nombre}</span>
                <span style={{ ...s.estadoBadge, background: VALIDACION_COLOR[p.estado_validacion] || '#2d5c3a' }}>
                  {p.estado_validacion}
                </span>
              </div>
              <div style={s.relMeta}>
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
    <div style={so.overlay}>
      <div style={so.sheet}>
        <h3 style={so.title}>Valores Estándar ({especie.codigo})</h3>
        <p style={{ color: '#4a8c5c', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Estos valores se auto-completarán en nuevos registros de evolución si se dejan vacíos.
        </p>
        <form onSubmit={submit} style={so.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <ConfigNum label="Temperatura (°C)" value={form.temperatura_c} onChange={v => set('temperatura_c', v)} />
            <ConfigNum label="Humedad Rel. (%)" value={form.humedad_relativa_pct} onChange={v => set('humedad_relativa_pct', v)} />
            <ConfigNum label="PH Sustrato" value={form.ph_sustrato} onChange={v => set('ph_sustrato', v)} />
            <ConfigNum label="Luz (lux)" value={form.luz_lux} onChange={v => set('luz_lux', v)} />
            <ConfigField label="NPK" value={form.npk} onChange={v => set('npk', v)} placeholder="20-20-20" />
            <ConfigNum label="Nutrición (PPM)" value={form.ppm} onChange={v => set('ppm', v)} />
          </div>
          <ConfigField label="Sustrato por defecto" value={form.sustrato} onChange={v => set('sustrato', v)} />
          <ConfigField label="Contenedor por defecto" value={form.tipo_contenedor} onChange={v => set('tipo_contenedor', v)} />
          
          {error && <p style={{ color: '#f28b82', fontSize: '0.85rem' }}>{error}</p>}
          
          <div style={so.actions}>
            <button type="button" style={so.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={so.btnSave} disabled={loading}>{loading ? '…' : 'Guardar'}</button>
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
    <div style={so.overlay}>
      <div style={so.sheet}>
        <h3 style={so.title}>Valores Estándar Línea: {linea.nombre}</h3>
        <p style={{ color: '#4a8c5c', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Estos valores tienen prioridad sobre los de la especie.
        </p>
        <form onSubmit={submit} style={so.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <ConfigNum label="Temperatura (°C)" value={form.temperatura_c} onChange={v => set('temperatura_c', v)} />
            <ConfigNum label="Humedad Rel. (%)" value={form.humedad_relativa_pct} onChange={v => set('humedad_relativa_pct', v)} />
            <ConfigNum label="PH Sustrato" value={form.ph_sustrato} onChange={v => set('ph_sustrato', v)} />
            <ConfigNum label="Luz (lux)" value={form.luz_lux} onChange={v => set('luz_lux', v)} />
            <ConfigField label="NPK" value={form.npk} onChange={v => set('npk', v)} placeholder="20-20-20" />
            <ConfigNum label="Nutrición (PPM)" value={form.ppm} onChange={v => set('ppm', v)} />
          </div>
          <ConfigField label="Sustrato por defecto" value={form.sustrato} onChange={v => set('sustrato', v)} />
          <ConfigField label="Contenedor por defecto" value={form.tipo_contenedor} onChange={v => set('tipo_contenedor', v)} />
          
          {error && <p style={{ color: '#f28b82', fontSize: '0.85rem' }}>{error}</p>}
          
          <div style={so.actions}>
            <button type="button" style={so.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={so.btnSave} disabled={loading}>{loading ? '…' : 'Guardar'}</button>
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
    <div style={so.overlay}>
      <div style={so.sheet}>
        <h3 style={so.title}>Valores Estándar Variegación: {variegacion.nombre}</h3>
        <p style={{ color: '#4a8c5c', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Estos valores tienen prioridad sobre la línea y la especie.
        </p>
        <form onSubmit={submit} style={so.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <ConfigNum label="Temperatura (°C)" value={form.temperatura_c} onChange={v => set('temperatura_c', v)} />
            <ConfigNum label="Humedad Rel. (%)" value={form.humedad_relativa_pct} onChange={v => set('humedad_relativa_pct', v)} />
            <ConfigNum label="PH Sustrato" value={form.ph_sustrato} onChange={v => set('ph_sustrato', v)} />
            <ConfigNum label="Luz (lux)" value={form.luz_lux} onChange={v => set('luz_lux', v)} />
            <ConfigField label="NPK" value={form.npk} onChange={v => set('npk', v)} placeholder="20-20-20" />
            <ConfigNum label="Nutrición (PPM)" value={form.ppm} onChange={v => set('ppm', v)} />
          </div>
          <div style={so.actions}>
            <button type="button" style={so.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={so.btnSave} disabled={loading}>{loading ? '…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfigField({ label, value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 }}>{label}</label>
      <input style={s.condInput} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder || '—'} />
    </div>
  )
}

function ConfigNum({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 }}>{label}</label>
      <input type="number" step="0.1" style={s.condInput} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder="—" />
    </div>
  )
}

function SustratosPanel({ navigate }) {
  const [sustratos, setSustratos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/sustratos').then(setSustratos).finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={s.muted}>Cargando…</p>

  return (
    <div style={s.section}>
      <div style={s.sectionHeader}>
        <h3 style={s.sectionTitle}>Formulaciones de Sustrato</h3>
        <button style={s.btnSec} onClick={() => navigate('/sustratos')}>Gestionar 🧪</button>
      </div>
      {sustratos.length === 0 ? <p style={s.muted}>Sin sustratos registrados</p> : (
        sustratos.map(su => (
          <div key={su.id} style={s.relCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={s.relNombre}>{su.nombre}</span>
              <span style={s.codigoBadge}>{su.codigo_formulacion}</span>
            </div>
            {su.descripcion && <p style={{ color: '#6aaa82', fontSize: '0.8rem', margin: '4px 0' }}>{su.descripcion}</p>}
            <div style={s.relMeta}>
              {su.ph_teorico && <span>pH: {su.ph_teorico}</span>}
              {su.conductividad_teorica && <span>EC: {su.conductividad_teorica}</span>}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function Tag({ label, color = '#1a472a' }) {
  return <span style={{ ...s.tag, background: color }}>{label}</span>
}

function LineaCard({ linea, onAddVar, onVerIndividuos, onEditConfig, onEditVarConfig }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(true)

  const METODO_LABEL = {
    semilla: 'Semilla', clonacion: 'Linaje Clonal',
    mutacion_in_vitro: 'Mutación in vitro', desconocido: '',
  }

  return (
    <div style={s.lineaCard}>
      <button style={s.lineaHeader} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={s.lineaNombre}>{linea.nombre}</span>
            {linea.metodo_propagacion !== 'desconocido' && (
              <span style={s.metodoBadge}>{METODO_LABEL[linea.metodo_propagacion]}</span>
            )}
          </div>
          <span style={s.lineaStats}>{linea.variegaciones.length} var. · {linea.total_individuos} ind.</span>
        </div>
        <span style={{ color: '#4a8c5c', fontSize: '0.85rem' }}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div style={s.lineaBody}>
          {linea.descripcion && <p style={s.lineaDesc}>{linea.descripcion}</p>}
          <div style={s.varGrid}>
            {linea.variegaciones.map(v => <VarChip key={v.id} v={v} onEditConfig={onEditVarConfig} />)}
            <button style={s.varAdd} onClick={onAddVar}>+ variegación</button>
          </div>
          <div style={s.lineaActions}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={s.btnVerLinea} onClick={onVerIndividuos}>Ver individuos →</button>
              <button style={s.btnVerLinea} onClick={onEditConfig}>⚙️ Config</button>
            </div>
            <button style={s.btnNuevoLineaIndividuo}
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
    <div style={s.varChip}>
      <span style={s.varNombre}>{v.nombre}</span>
      <span style={s.varInds}>({v.total_individuos})</span>
      <button onClick={() => onEditConfig(v)} style={s.btnVarConfig} title="Configurar cuidados de esta variegación">⚙️</button>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={s.label}>Origen / Método de Propagación</label>
        <select style={s.input} value={form.metodo_propagacion} onChange={e => set('metodo_propagacion', e.target.value)}>
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
    <div style={s.overlay}>
      <div style={s.sheet}>
        <h3 style={s.sheetTitle}>{title}</h3>
        <form onSubmit={onSubmit} style={s.form}>
          {children}
          {error && <p style={s.errorMsg}>{error}</p>}
          <div style={s.actions}>
            <button type="button" style={s.btnCancel} onClick={onCancel}>Cancelar</button>
            <button type="submit" style={s.btnSave} disabled={loading}>{loading ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, textarea, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={s.label}>{label}</label>
      {textarea
        ? <textarea style={{ ...s.input, minHeight: 60, resize: 'vertical' }} value={value} onChange={e => onChange(e.target.value)} />
        : <input style={s.input} value={value} onChange={e => onChange(e.target.value)} required={required} />
      }
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = {
  page: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  header: { display: 'flex', flexDirection: 'column', gap: 4 },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cientifico: { color: '#7dca8f', margin: 0, fontSize: '1.4rem', fontStyle: 'italic' },
  comun: { color: '#a0c8b0', margin: 0, fontSize: '1rem' },
  codigoBadge: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 6, color: '#4a8c5c', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1, whiteSpace: 'nowrap' },
  categoriaBadge: { background: '#1a472a', color: '#7dca8f', fontSize: '0.65rem', padding: '1px 5px', borderRadius: 4, textTransform: 'uppercase', fontWeight: 'bold', border: '1px solid #2d5c3a', marginLeft: 0 },
  tags: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  tag: { borderRadius: 20, padding: '0.2rem 0.65rem', fontSize: '0.75rem', color: '#7dca8f', fontStyle: 'italic' },

  // Tabs
  tabBar: { display: 'flex', gap: 0, borderBottom: '1px solid #2d5c3a', marginBottom: 4 },
  tab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '0.5rem 0.85rem', color: '#4a5568', fontSize: '0.82rem', cursor: 'pointer', marginBottom: -1 },
  tabActive: { color: '#7dca8f', borderBottomColor: '#7dca8f', fontWeight: 600 },

  // Ficha
  fichaWrapper: { display: 'flex', flexDirection: 'column', gap: 12 },
  fichaActions: { display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  btnWiki: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 8, color: '#a0c8b0', padding: '0.4rem 0.85rem', fontSize: '0.82rem', cursor: 'pointer' },
  wikiLink: { color: '#4a8c5c', fontSize: '0.8rem', textDecoration: 'underline' },
  wikiError: { color: '#f28b82', fontSize: '0.82rem', margin: 0 },
  btnEdit: { marginLeft: 'auto', background: 'none', border: '1px solid #2d5c3a', borderRadius: 8, color: '#7dca8f', padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' },
  btnSaveInline: { marginLeft: 'auto', background: '#2d7a47', border: 'none', borderRadius: 8, color: '#fff', padding: '0.35rem 0.85rem', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 },
  btnCancelInline: { background: 'none', border: '1px solid #2d5c3a', borderRadius: 8, color: '#7dca8f', padding: '0.35rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' },
  fichaSection: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 10, padding: '0.85rem' },
  fichaSectionTitle: { color: '#4a8c5c', margin: '0 0 0.5rem', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
  fichaText: { color: '#c0ddc8', fontSize: '0.88rem', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' },
  textarea: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.65rem', color: '#e0f0e5', fontSize: '0.9rem', resize: 'vertical', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' },
  condGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  condLabel: { color: '#4a8c5c', fontSize: '0.72rem', fontWeight: 600 },
  condInput: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 6, padding: '0.5rem 0.75rem', color: '#e0f0e5', fontSize: '0.85rem', width: '100%', boxSizing: 'border-box' },
  condTable: { display: 'flex', flexDirection: 'column', gap: 4 },
  condRow: { display: 'flex', gap: 8 },
  condKey: { color: '#4a8c5c', fontSize: '0.82rem', fontWeight: 600, minWidth: 110 },
  condVal: { color: '#c0ddc8', fontSize: '0.82rem' },

  // Cards relacionadas
  relCard: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 10, padding: '0.75rem', cursor: 'pointer', marginBottom: 6 },
  relNombre: { color: '#7dca8f', fontWeight: 600, fontSize: '0.92rem' },
  relMeta: { display: 'flex', gap: 12, marginTop: 4, color: '#4a5568', fontSize: '0.78rem', flexWrap: 'wrap' },
  estadoBadge: { borderRadius: 4, padding: '0.1rem 0.45rem', fontSize: '0.68rem', color: '#fff', fontWeight: 700, textTransform: 'uppercase' },

  // Secciones
  section: { display: 'flex', flexDirection: 'column', gap: 8 },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#7dca8f', margin: 0, fontSize: '1rem' },
  btnAdd: { background: '#2d7a47', border: 'none', borderRadius: 20, color: '#fff', padding: '0.3rem 0.9rem', fontSize: '0.85rem', cursor: 'pointer' },
  lineaCard: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 12, overflow: 'hidden' },
  lineaHeader: { width: '100%', background: 'none', border: 'none', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' },
  lineaNombre: { color: '#7dca8f', fontWeight: 600, fontSize: '0.95rem' },
  metodoBadge: { background: '#2d5c3a', color: '#7dca8f', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 'bold' },
  lineaStats: { color: '#4a5568', fontSize: '0.8rem' },
  lineaBody: { padding: '0 1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 8 },
  lineaDesc: { color: '#6aaa82', fontSize: '0.85rem', margin: 0 },
  varGrid: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  varChip: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 20, padding: '0.3rem 0.75rem', display: 'flex', gap: 6, alignItems: 'center' },
  btnVarConfig: { background: 'none', border: 'none', color: '#4a8c5c', cursor: 'pointer', fontSize: '0.85rem', padding: 0, marginLeft: 4 },
  varNombre: { color: '#a0c8b0', fontSize: '0.82rem' },
  varInds: { color: '#4a5568', fontSize: '0.72rem' },
  varAdd: { background: 'none', border: '1px dashed #2d5c3a', borderRadius: 20, color: '#4a8c5c', padding: '0.3rem 0.75rem', fontSize: '0.82rem', cursor: 'pointer' },
  btnVerLinea: { background: 'none', border: 'none', color: '#4a8c5c', fontSize: '0.8rem', cursor: 'pointer', textAlign: 'left', padding: 0 },
  lineaActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  btnNuevoLineaIndividuo: { background: 'none', border: '1px solid #2d7a47', borderRadius: 8, color: '#7dca8f', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer' },
  bottomActions: { display: 'flex', gap: 8, marginTop: 8 },
  btnVerIndividuos: { flex: 2, background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 10, color: '#7dca8f', padding: '0.7rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center' },
  btnNuevoIndividuo: { flex: 1, background: '#2d7a47', border: 'none', borderRadius: 10, color: '#fff', padding: '0.7rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold' },
  btnMulti: { flex: 1, background: '#4a8c5c', border: 'none', borderRadius: 10, color: '#fff', padding: '0.7rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold' },

  muted: { color: '#4a5568', fontSize: '0.9rem', margin: 0 },
  error: { color: '#f28b82' },
  overlay: { position: 'fixed', inset: 0, background: '#0009', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: '#1a2e1e', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxHeight: '88dvh', overflowY: 'auto' },
  sheetTitle: { color: '#7dca8f', margin: '0 0 1rem', fontSize: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 },
  input: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.65rem 0.9rem', color: '#e0f0e5', fontSize: '0.95rem', outline: 'none' },
  errorMsg: { color: '#f28b82', fontSize: '0.85rem', margin: 0 },
  actions: { display: 'flex', gap: 8, marginTop: 4 },
  btnCancel: { flex: 1, background: 'none', border: '1px solid #2d5c3a', borderRadius: 8, color: '#7dca8f', padding: '0.75rem', fontSize: '0.9rem', cursor: 'pointer' },
  btnSave: { flex: 2, background: '#2d7a47', border: 'none', borderRadius: 8, color: '#fff', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
}
