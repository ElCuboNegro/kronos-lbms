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
    madre_id: params.get('madre') || '',
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

    // Auto-generate semantic UID
    generarUID(form.especie_id)
  }, [form.especie_id])

  // Cargar variegaciones cuando cambia línea
  useEffect(() => {
    if (!form.linea_id) { setVariegaciones([]); set('variegacion_id', ''); return }
    const linea = lineas.find(l => l.id === form.linea_id)
    setVariegaciones(linea?.variegaciones || [])
    set('variegacion_id', '')
  }, [form.linea_id])

  async function generarUID(overrideEspecieId) {
    const targetId = overrideEspecieId || form.especie_id
    if (!targetId) return
    setGenerating(true)
    try {
      const { uid } = await api.get(`/printer/generar-uid?especie_id=${targetId}`)
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
    <div className="page-container">
      <h2 className="page-title text-primary" style={{ marginBottom: '1.5rem' }}>Nuevo individuo</h2>

      {/* Breadcrumb de jerarquía */}
      {(especieSeleccionada || lineaSeleccionada) && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>
          {especieSeleccionada && <span className="text-primary" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>{especieSeleccionada.nombre_cientifico}</span>}
          {lineaSeleccionada && <><span className="text-muted">›</span><span className="text-primary" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>{lineaSeleccionada.nombre}</span></>}
          {form.variegacion_id && (
            <><span className="text-muted">›</span>
            <span className="text-primary" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>{variegaciones.find(v => v.id === form.variegacion_id)?.nombre}</span></>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Jerarquía */}
        <Section title="Clasificación">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '1.2rem' }}>
            <div style={{ flex: 1 }}>
              <Select label="Especie *" value={form.especie_id} onChange={v => set('especie_id', v)}
                options={especies.map(e => ({ value: e.id, label: `${e.nombre_cientifico}${e.nombre_comun ? ` (${e.nombre_comun})` : ''}` }))}
                placeholder="Seleccionar especie…" noMargin />
            </div>
            <button type="button" className="btn btn--primary" style={{ width: '44px', padding: '0', fontSize: '1.4rem', flexShrink: 0 }} onClick={() => setShowEspecieForm(true)} title="Nueva especie">+</button>
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '1.2rem' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>UID *</label>
              <input value={form.uid} onChange={e => set('uid', e.target.value)}
                placeholder="Genera o escribe…" />
            </div>
            <button type="button"
              className={`btn ${form.especie_id ? 'btn--primary' : 'btn--ghost'}`}
              onClick={generarUID}
              disabled={generating || !form.especie_id}
              title={!form.especie_id ? "Selecciona una especie primero" : ""}
            >
              {generating ? '…' : 'Generar'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '1.2rem' }}>
            <div style={{ flex: 1 }}>
              <EspecimenSearch label="Planta Madre (opcional)" value={form.madre_id} onChange={v => set('madre_id', v)} noMargin />
            </div>
            <div style={{ flex: 1 }}>
              <EspecimenSearch label="Planta Padre (opcional)" value={form.padre_id} onChange={v => set('padre_id', v)} noMargin />
            </div>
          </div>

          <Field label="Fecha de ingreso" type="date" value={form.fecha_ingreso} onChange={v => set('fecha_ingreso', v)} />

          <div className="form-group">
            <label>Ubicación In Situ</label>
            <MapPicker value={form.coordenadas} onChange={v => set('coordenadas', v)} />
          </div>

          <Field label="Descripción de origen / procedencia" value={form.origen} onChange={v => set('origen', v)} placeholder="Ej: Finca X, ladera norte..." />
          <Select label="Estado" value={form.estado} onChange={v => set('estado', v)}
            options={ESTADOS.map(e => ({ value: e, label: e }))} />

          <div className="form-group">
            <label>Fotografías iniciales</label>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              {ANGULOS.map(ang => (
                <div key={ang} style={{ flex: 1, aspectRatio: '1', position: 'relative' }}>
                  <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                    id={`foto-${ang}`}
                    onChange={e => {
                      const file = e.target.files[0]
                      if (file) {
                        setFotos(prev => ({ ...prev, [ang]: { file, preview: URL.createObjectURL(file) } }))
                      }
                    }}
                  />
                  <label htmlFor={`foto-${ang}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100%', height: '100%', borderRadius: 'var(--radius-base)',
                    border: fotos[ang] ? 'none' : '2px dashed var(--theme-border)',
                    background: fotos[ang] ? 'transparent' : 'var(--theme-surface)',
                    color: 'var(--theme-text-muted)', cursor: 'pointer', overflow: 'hidden', textAlign: 'center'
                  }}>
                    {fotos[ang]
                      ? <img src={fotos[ang].preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '0.85rem' }}>📷<br/>{ang}</span>
                    }
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Field label="Notas iniciales" value={form.notas} onChange={v => set('notas', v)} textarea />
        </Section>

        {/* Imprimir */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '1.5rem' }}>
          <input type="checkbox" checked={printAfter} onChange={e => setPrintAfter(e.target.checked)} style={{ width: 'auto', marginTop: 0 }} />
          <span className="text-primary" style={{ fontSize: '0.9rem', textTransform: 'none', letterSpacing: 'normal' }}>Imprimir etiqueta al guardar</span>
        </label>

        {error && <p className="text-center text-error" style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
          {loading ? 'Guardando…' : 'Registrar individuo'}
        </button>
      </form>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card form-group">
      <h4 className="text-secondary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem 0', fontSize: '0.85rem' }}>{title}</h4>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', textarea, italic }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {textarea
        ? <textarea style={{ minHeight: 64, resize: 'vertical', ...(italic ? { fontStyle: 'italic' } : {}) }} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input type={type} style={italic ? { fontStyle: 'italic' } : {}} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      }
    </div>
  )
}

function Select({ label, value, onChange, options, placeholder, noMargin }) {
  return (
    <div className="form-group" style={noMargin ? { marginBottom: 0 } : {}}>
      <label>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function EspecimenSearch({ label, value, onChange, noMargin }) {
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
    <div className="form-group" style={{ position: 'relative', ...(noMargin ? { marginBottom: 0 } : {}) }}>
      <label>{label}</label>
      <input value={query} onChange={e => search(e.target.value)} placeholder="Buscar UID..." />
      {results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: 'var(--radius-base)', zIndex: 10, marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {results.map(r => (
            <div key={r.id} style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', borderBottom: '1px solid var(--theme-border)', fontSize: '0.9rem' }} onClick={() => select(r)}>
              <span style={{ fontWeight: 'bold' }}>{r.uid}</span>
              <span className="text-muted" style={{ fontSize: '0.7rem', marginLeft: '6px' }}>{r.especie}</span>
            </div>
          ))}
        </div>
      )}
      {selectedUid && query === selectedUid && (
        <button type="button" style={{ position: 'absolute', right: '8px', top: '32px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => { onChange(''); setQuery(''); setSelectedUid(''); }}>✕</button>
      )}
    </div>
  )
}
