import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import EspecieForm from '../components/EspecieForm'
import MapPicker from '../components/MapPicker'

const ESTADOS = ['activo', 'en_experimento', 'archivado', 'contaminado']

export default function IndividuoCreate() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [especies, setEspecies] = useState([])
  const [lineas, setLineas] = useState([])
  const [variegaciones, setVariegaciones] = useState([])
  const [showEspecieForm, setShowEspecieForm] = useState(false)

  const [form, setForm] = useState({
    especie_id: params.get('especie') || '',
    linea_id: params.get('linea') || '',
    variegacion_id: '',
    especie: '',
    uid: params.get('uid') || '',
    madre_id: '',
    padre_id: '',
    fecha_ingreso: new Date().toISOString().slice(0, 10),
    origen: '',
    coordenadas: null,
    estado: 'activo',
    notas: '',
  })

  const [fotos, setFotos] = useState({}) // angulo -> { file, preview }
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [printAfter, setPrintAfter] = useState(true)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Cargar especies
  const fetchEspecies = async () => {
    const data = await api.get('/especies')
    setEspecies(data)
  }

  useEffect(() => {
    fetchEspecies()
  }, [])

  // Cargar líneas cuando cambia especie
  useEffect(() => {
    if (!form.especie_id) { setLineas([]); setVariegaciones([]); return }
    api.get(`/especies/${form.especie_id}`).then(e => {
      setLineas(e.lineas || [])
      const nombre = e.nombre_cientifico || ''
      set('especie', nombre)
    })
    set('linea_id', '')
    set('variegacion_id', '')
  }, [form.especie_id])

  // Cargar variegaciones cuando cambia línea
  useEffect(() => {
    if (!form.linea_id) { setVariegaciones([]); set('variegacion_id', ''); return }
    const linea = lineas.find(l => l.id === form.linea_id)
    setVariegaciones(linea?.variegaciones || [])
    set('variegacion_id', '')
  }, [form.linea_id])

  async function generarUID() {
    if (!form.especie_id) return
    setGenerating(true)
    try {
      const { uid } = await api.get(`/printer/generar-uid?especie_id=${form.especie_id}`)
      set('uid', uid)
    } finally { setGenerating(false) }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.uid) { setError('Genera o escribe un UID'); return }
    if (!form.especie) { setError('Selecciona una especie'); return }
    setError('')
    setLoading(true)
    try {
      const payload = {
        uid: form.uid,
        especie: form.especie,
        especie_id: form.especie_id || undefined,
        linea_id: form.linea_id || undefined,
        variegacion_id: form.variegacion_id || undefined,
        madre_id: form.madre_id || undefined,
        padre_id: form.padre_id || undefined,
        fecha_ingreso: form.fecha_ingreso,
        origen: form.origen || undefined,
        coordenadas: form.coordenadas || undefined,
        estado: form.estado,
        notas: form.notas || undefined,
      }
      const ind = await api.post('/especimenes', payload)

      // Si hay fotos, crear registro de evolución inicial y subirlas
      const angulosPresentes = Object.keys(fotos)
      if (angulosPresentes.length > 0) {
        try {
          const reg = await api.post(`/especimenes/${ind.id}/evolucion`, {
            fecha: form.fecha_ingreso,
            notas: 'Registro inicial con fotografías.'
          })
          
          const token = localStorage.getItem('token')
          await Promise.all(angulosPresentes.map(async (ang) => {
            const fd = new FormData()
            fd.append('file', fotos[ang].file)
            return fetch(`/api/especimenes/${ind.id}/evolucion/${reg.id}/fotos/${ang}`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: fd,
            })
          }))
        } catch (e) {
          console.error("Error subiendo fotos iniciales:", e)
        }
      }

      if (printAfter) {
        try { await api.post(`/printer/imprimir/${ind.id}`) }
        catch { /* impresora offline no bloquea */ }
      }

      navigate(`/especimen/${ind.id}`)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const especieSeleccionada = especies.find(e => e.id === form.especie_id)
  const lineaSeleccionada = lineas.find(l => l.id === form.linea_id)

  const ANGULOS = ['frente', 'arriba', 'derecha']

  return (
    <div style={s.page}>
      <h2 style={s.title}>Nuevo individuo</h2>

      {/* Breadcrumb de jerarquía */}
      {(especieSeleccionada || lineaSeleccionada) && (
        <div style={s.breadcrumb}>
          {especieSeleccionada && <span style={s.bCrumb}>{especieSeleccionada.nombre_cientifico}</span>}
          {lineaSeleccionada && <><span style={s.bSep}>›</span><span style={s.bCrumb}>{lineaSeleccionada.nombre}</span></>}
          {form.variegacion_id && (
            <><span style={s.bSep}>›</span>
            <span style={s.bCrumb}>{variegaciones.find(v => v.id === form.variegacion_id)?.nombre}</span></>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={s.form}>
        {/* Jerarquía */}
        <Section title="Clasificación">
          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <Select label="Especie *" value={form.especie_id} onChange={v => set('especie_id', v)}
                options={especies.map(e => ({ value: e.id, label: `${e.nombre_cientifico}${e.nombre_comun ? ` (${e.nombre_comun})` : ''}` }))}
                placeholder="Seleccionar especie…" noMargin />
            </div>
            <button type="button" style={s.btnAddInline} onClick={() => setShowEspecieForm(true)} title="Nueva especie">+</button>
          </div>

          {showEspecieForm && (
            <EspecieForm 
              onSaved={(nueva) => {
                setShowEspecieForm(false)
                // Update local list immediately to avoid waiting for fetch
                const listItem = {
                  ...nueva,
                  total_lineas: nueva.lineas?.length || 0,
                  total_individuos: 0
                }
                setEspecies(prev => {
                  const exists = prev.find(e => e.id === nueva.id)
                  if (exists) return prev
                  return [...prev, listItem].sort((a, b) => 
                    a.nombre_cientifico.localeCompare(b.nombre_cientifico)
                  )
                })
                // Set form values immediately
                setForm(f => ({ 
                  ...f, 
                  especie_id: nueva.id, 
                  especie: nueva.nombre_cientifico 
                }))
              }}
              onCancel={() => setShowEspecieForm(false)}
            />
          )}

          {lineas.length > 0 && (
            <Select label="Línea genética" value={form.linea_id} onChange={v => set('linea_id', v)}
              options={lineas.map(l => ({ value: l.id, label: l.nombre }))}
              placeholder="Sin línea específica" />
          )}
          {variegaciones.length > 0 && (
            <Select label="Variegación" value={form.variegacion_id} onChange={v => set('variegacion_id', v)}
              options={variegaciones.map(v => ({ value: v.id, label: v.nombre }))}
              placeholder="Sin variegación específica" />
          )}
          {!form.especie_id && (
            <Field label="Especie (texto libre)" value={form.especie} onChange={v => set('especie', v)}
              placeholder="Ej: Monstera deliciosa" italic />
          )}
        </Section>

        {/* UID e Ingreso */}
        <Section title="Identificación y Procedencia">
          <div style={s.uidRow}>
            <div style={{ flex: 1 }}>
              <label style={s.label}>UID *</label>
              <input style={s.input} value={form.uid} onChange={e => set('uid', e.target.value)}
                placeholder="Genera o escribe…" />
            </div>
            <button type="button" 
              style={form.especie_id ? s.btnGenerar : s.btnGenerarDisabled} 
              onClick={generarUID} 
              disabled={generating || !form.especie_id}
              title={!form.especie_id ? "Selecciona una especie primero" : ""}
            >
              {generating ? '…' : 'Generar'}
            </button>
          </div>

          <div style={s.row}>
            <div style={{ flex: 1 }}>
              <EspecimenSearch label="Planta Madre (opcional)" value={form.madre_id} onChange={v => set('madre_id', v)} />
            </div>
            <div style={{ flex: 1 }}>
              <EspecimenSearch label="Planta Padre (opcional)" value={form.padre_id} onChange={v => set('padre_id', v)} />
            </div>
          </div>

          <Field label="Fecha de ingreso" type="date" value={form.fecha_ingreso} onChange={v => set('fecha_ingreso', v)} />
          
          <div style={s.field}>
            <label style={s.label}>Ubicación In Situ</label>
            <MapPicker value={form.coordenadas} onChange={v => set('coordenadas', v)} />
          </div>

          <Field label="Descripción de origen / procedencia" value={form.origen} onChange={v => set('origen', v)} placeholder="Ej: Finca X, ladera norte..." />
          <Select label="Estado" value={form.estado} onChange={v => set('estado', v)}
            options={ESTADOS.map(e => ({ value: e, label: e }))} />
          
          <div style={s.field}>
            <label style={s.label}>Fotografías iniciales</label>
            <div style={s.fotoGrid}>
              {ANGULOS.map(ang => (
                <div key={ang} style={s.fotoCard}>
                  <input type="file" accept="image/*" capture="environment" style={{display:'none'}}
                    id={`foto-${ang}`}
                    onChange={e => {
                      const file = e.target.files[0]
                      if (file) {
                        setFotos(prev => ({ ...prev, [ang]: { file, preview: URL.createObjectURL(file) } }))
                      }
                    }}
                  />
                  <label htmlFor={`foto-${ang}`} style={fotos[ang] ? s.fotoLabelActive : s.fotoLabelEmpty}>
                    {fotos[ang] 
                      ? <img src={fotos[ang].preview} style={s.fotoPreview} />
                      : <span>📷<br/>{ang}</span>
                    }
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Field label="Notas iniciales" value={form.notas} onChange={v => set('notas', v)} textarea />
        </Section>

        {/* Imprimir */}
        <label style={s.checkRow}>
          <input type="checkbox" checked={printAfter} onChange={e => setPrintAfter(e.target.checked)} />
          <span style={s.checkLabel}>Imprimir etiqueta al guardar</span>
        </label>

        {error && <p style={s.error}>{error}</p>}
        <button type="submit" style={s.btnSave} disabled={loading}>
          {loading ? 'Guardando…' : 'Registrar individuo'}
        </button>
      </form>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <p style={s.sectionTitle}>{title}</p>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', textarea, italic }) {
  const inputStyle = { ...s.input, ...(italic ? { fontStyle: 'italic' } : {}) }
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      {textarea
        ? <textarea style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input style={inputStyle} type={type} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}

function Select({ label, value, onChange, options, placeholder, noMargin }) {
  return (
    <div style={{ ...s.field, ...(noMargin ? { margin: 0 } : {}) }}>
      <label style={s.label}>{label}</label>
      <select style={s.input} value={value} onChange={e => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function EspecimenSearch({ label, value, onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedUid, setSelectedUid] = useState('')

  useEffect(() => {
    if (value === '') {
      setSelectedUid('')
      setQuery('')
    }
  }, [value])

  const search = async (q) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    try {
      const data = await api.get('/especimenes')
      const filtered = data.filter(e => e.uid.toLowerCase().includes(q.toLowerCase())).slice(0, 5)
      setResults(filtered)
    } catch { setResults([]) }
  }

  const select = (e) => {
    onChange(e.id)
    setSelectedUid(e.uid)
    setResults([])
    setQuery(e.uid)
  }

  return (
    <div style={{ ...s.field, position: 'relative' }}>
      <label style={s.label}>{label}</label>
      <input style={s.input} value={query} onChange={e => search(e.target.value)} placeholder="Buscar UID..." />
      {results.length > 0 && (
        <div style={s.searchResults}>
          {results.map(r => (
            <div key={r.id} style={s.searchItem} onClick={() => select(r)}>
              <span style={{ fontWeight: 'bold' }}>{r.uid}</span>
              <span style={{ fontSize: '0.7rem', color: '#4a8c5c', marginLeft: 6 }}>{r.especie}</span>
            </div>
          ))}
        </div>
      )}
      {selectedUid && query === selectedUid && (
        <button type="button" style={s.btnClearSearch} onClick={() => { onChange(''); setQuery(''); setSelectedUid(''); }}>✕</button>
      )}
    </div>
  )
}

const s = {
  page: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  title: { color: '#7dca8f', margin: 0, fontSize: '1.2rem' },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', background: '#1a2e1e', borderRadius: 8, padding: '0.5rem 0.75rem' },
  bCrumb: { color: '#7dca8f', fontSize: '0.82rem', fontStyle: 'italic' },
  bSep: { color: '#2d5c3a', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  section: { background: '#1a2e1e', borderRadius: 12, padding: '0.9rem 1rem', display: 'flex', flexDirection: 'column', gap: 10 },
  sectionTitle: { color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: 0 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 },
  input: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.65rem 0.9rem', color: '#e0f0e5', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  uidRow: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  row: { display: 'flex', gap: 8, alignItems: 'flex-end' },
  btnGenerar: { background: '#2d5c3a', border: 'none', borderRadius: 8, color: '#7dca8f', padding: '0.65rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  btnGenerarDisabled: { background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 8, color: '#4a5568', padding: '0.65rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'not-allowed', whiteSpace: 'nowrap', flexShrink: 0 },
  btnAddInline: { background: '#2d7a47', border: 'none', borderRadius: 8, color: '#fff', width: 42, height: 42, fontSize: '1.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkRow: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  checkLabel: { color: '#7dca8f', fontSize: '0.9rem' },
  error: { color: '#f28b82', fontSize: '0.85rem', margin: 0 },
  btnSave: { background: '#2d7a47', border: 'none', borderRadius: 10, color: '#fff', padding: '0.9rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' },
  fotoGrid: { display: 'flex', gap: 10, marginTop: 4 },
  fotoCard: { flex: 1, aspectRatio: '1', position: 'relative' },
  fotoLabelEmpty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f1f13', border: '1px dashed #2d5c3a', borderRadius: 8, height: '100%', cursor: 'pointer', color: '#4a8c5c', fontSize: '0.7rem', textAlign: 'center' },
  fotoLabelActive: { display: 'block', height: '100%', cursor: 'pointer', borderRadius: 8, overflow: 'hidden', border: '1px solid #7dca8f' },
  fotoPreview: { width: '100%', height: '100%', objectFit: 'cover' },
  searchResults: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 8, zIndex: 10, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' },
  searchItem: { padding: '0.6rem 0.8rem', cursor: 'pointer', borderBottom: '1px solid #0f1f13', fontSize: '0.9rem' },
  btnClearSearch: { position: 'absolute', right: 8, top: 28, background: 'none', border: 'none', color: '#f28b82', cursor: 'pointer', fontSize: '1.1rem' },
}
