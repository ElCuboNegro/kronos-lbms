import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import EspecieForm from '../components/EspecieForm'
import MapPicker from '../components/MapPicker'

const ESTADOS = ['activo', 'en_experimento', 'archivado', 'contaminado']

export default function IndividuoMultiCreate() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [especies, setEspecies] = useState([])
  const [lineas, setLineas] = useState([])
  const [variegaciones, setVariegaciones] = useState([])
  const [protocolos, setProtocolos] = useState([])

  const [showEspecieForm, setShowEspecieForm] = useState(false)

  const [form, setForm] = useState({
    especie_id: params.get('especie') || '',
    linea_id: params.get('linea') || '',
    variegacion_id: '',
    madre_id: params.get('madre') || '',
    padre_id: '',
    fecha_ingreso: new Date().toISOString().slice(0, 10),
    origen: '',
    coordenadas: null,
    estado: 'activo',
    items: [
      { id: Date.now(), cantidad: 1, protocolo_id: '', notas: '' }
    ]
  })

  const [fotoLote, setFotoLote] = useState(null) // { file, preview }
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [printAfter, setPrintAfter] = useState(true)
  const [agruparContenedor, setAgruparContenedor] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Cargar datos
  useEffect(() => {
    api.get('/especies').then(setEspecies)
    api.get('/protocolos').then(setProtocolos).catch(() => {})
  }, [])

  // Cargar líneas cuando cambia especie
  useEffect(() => {
    if (!form.especie_id) { setLineas([]); setVariegaciones([]); return }
    api.get(`/especies/${form.especie_id}`).then(e => {
      setLineas(e.lineas || [])
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

  function addItem() {
    set('items', [...form.items, { id: Date.now(), cantidad: 1, protocolo_id: '', notas: '' }])
  }

  function updateItem(id, k, v) {
    set('items', form.items.map(it => it.id === id ? { ...it, [k]: v } : it))
  }

  function removeItem(id) {
    if (form.items.length === 1) return
    set('items', form.items.filter(it => it.id !== id))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.especie_id) { setError('Selecciona una especie'); return }

    // Check amounts
    const validItems = form.items.filter(i => i.cantidad > 0)
    if (validItems.length === 0) { setError('Debe crear al menos 1 individuo'); return }

    setError('')
    setLoading(true)
    try {
      let contenedorUid = undefined
      if (agruparContenedor) {
        const d = new Date()
        contenedorUid = `CONT-${d.getFullYear().toString().slice(2)}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${String(Math.floor(Math.random() * 9000) + 1000)}`
      }

      const payload = {
        especie_id: form.especie_id,
        linea_id: form.linea_id || undefined,
        variegacion_id: form.variegacion_id || undefined,
        madre_id: form.madre_id || undefined,
        padre_id: form.padre_id || undefined,
        contenedor_uid: contenedorUid,
        fecha_ingreso: form.fecha_ingreso,
        origen: form.origen || undefined,
        coordenadas: form.coordenadas || undefined,
        estado: form.estado,
        items: validItems.map(it => ({
          cantidad: parseInt(it.cantidad),
          protocolo_id: it.protocolo_id || undefined,
          notas: it.notas || undefined
        }))
      }

      const creados = await api.post('/especimenes/bulk', payload)

      // Subir foto a todos los creados si existe
      if (fotoLote) {
        const token = localStorage.getItem('token')
        await Promise.all(creados.map(async (ind) => {
          try {
            const reg = await api.post(`/especimenes/${ind.id}/evolucion`, {
              fecha: form.fecha_ingreso,
              notas: 'Fotografía de lote inicial.'
            })
            const fd = new FormData()
            fd.append('file', fotoLote.file)
            return fetch(`/api/especimenes/${ind.id}/evolucion/${reg.id}/fotos/frente`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: fd,
            })
          } catch (e) { console.error("Error subiendo foto lote:", e) }
        }))
      }

      if (printAfter) {
        if (agruparContenedor && contenedorUid) {
          // Si están agrupados, solo imprimir la etiqueta maestra del contenedor
          try { await api.post(`/printer/imprimir-contenedor/${contenedorUid}`) }
          catch (e) { console.error("Impresora offline", e) }
        } else {
          // Si están sueltos, imprimir etiqueta para cada uno individualmente
          Promise.allSettled(creados.map(ind => api.post(`/printer/imprimir/${ind.id}`)))
        }
      }

      alert(agruparContenedor ? `Se creó 1 etiqueta agrupada (Contenedor) para ${creados.length} individuos.` : `Se crearon ${creados.length} etiquetas individuales correctamente.`)
      navigate(`/especies/${form.especie_id}`)
    } catch (err) {
      setError(err.message)
    }
    finally { setLoading(false) }
  }

  const especieSeleccionada = especies.find(e => e.id === form.especie_id)
  const lineaSeleccionada = lineas.find(l => l.id === form.linea_id)

  const totalClones = form.items.reduce((acc, it) => acc + (parseInt(it.cantidad) || 0), 0)

  return (
    <div className="page-container">
      <h2 className="page-title text-primary" style={{ marginBottom: '1.5rem' }}>Clonación Masiva (Lotes)</h2>

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
        <Section title="1. Clasificación Base">
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
                const listItem = { ...nueva, total_lineas: nueva.lineas?.length || 0, total_individuos: 0 }
                setEspecies(prev => {
                  const exists = prev.find(e => e.id === nueva.id)
                  if (exists) return prev
                  return [...prev, listItem].sort((a, b) => a.nombre_cientifico.localeCompare(b.nombre_cientifico))
                })
                setForm(f => ({ ...f, especie_id: nueva.id }))
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
        </Section>

        <Section title="2. Procedencia y Estado">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '1.2rem' }}>
            <div style={{ flex: 1 }}>
              <EspecimenSearch label="Planta Madre (opcional)" value={form.madre_id} onChange={v => set('madre_id', v)} noMargin />
            </div>
            <div style={{ flex: 1 }}>
              <EspecimenSearch label="Planta Padre (opcional)" value={form.padre_id} onChange={v => set('padre_id', v)} noMargin />
            </div>
          </div>
          <Field label="Fecha de clonación / ingreso" type="date" value={form.fecha_ingreso} onChange={v => set('fecha_ingreso', v)} />

          <div className="form-group">
            <label>Fotografía del Lote (opcional)</label>
            <div style={{ width: '120px', height: '120px', position: 'relative', marginTop: '4px' }}>
              <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} id="foto-lote"
                onChange={e => e.target.files[0] && setFotoLote({ file: e.target.files[0], preview: URL.createObjectURL(e.target.files[0]) })} />
              <label htmlFor="foto-lote" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', height: '100%', borderRadius: 'var(--radius-base)',
                border: fotoLote ? 'none' : '2px dashed var(--theme-border)',
                background: fotoLote ? 'transparent' : 'var(--theme-surface)',
                color: 'var(--theme-text-muted)', cursor: 'pointer', overflow: 'hidden', textAlign: 'center'
              }}>
                {fotoLote ? <img src={fotoLote.preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '0.85rem' }}>📷<br/>Lote</span>}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Ubicación In Situ</label>
            <MapPicker value={form.coordenadas} onChange={v => set('coordenadas', v)} />
          </div>
          <Field label="Origen (descripción)" value={form.origen} onChange={v => set('origen', v)} placeholder="Ej: Cultivo in vitro placa A2" />
          <Select label="Estado inicial" value={form.estado} onChange={v => set('estado', v)}
            options={ESTADOS.map(e => ({ value: e, label: e }))} />
        </Section>

        <Section title={`3. Lotes a generar (Total: ${totalClones})`}>
          {form.items.map((it, idx) => (
            <div className="card" key={it.id} style={{ padding: '1rem', border: '1px dashed var(--theme-border)', boxShadow: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="text-primary" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Lote {idx + 1}</span>
                {form.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(it.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '0.2rem 0.5rem' }}>✖</button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Field label="Cantidad *" type="number" value={it.cantidad} onChange={v => updateItem(it.id, 'cantidad', v)} min="1" noMargin />
                </div>
                <div style={{ flex: 2 }}>
                  <Select label="Protocolo (opcional)" value={it.protocolo_id} onChange={v => updateItem(it.id, 'protocolo_id', v)}
                    options={protocolos.map(p => ({ value: p.id, label: p.nombre }))} placeholder="Ninguno" noMargin />
                </div>
              </div>
              <Field label="Notas de este lote" value={it.notas} onChange={v => updateItem(it.id, 'notas', v)} placeholder="Observaciones específicas..." noMargin />
            </div>
          ))}

          <button type="button" onClick={addItem} className="btn btn--ghost" style={{ marginTop: '0.5rem' }}>+ Añadir otro grupo/lote</button>
        </Section>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '1.5rem' }}>
          <input type="checkbox" checked={printAfter} onChange={e => setPrintAfter(e.target.checked)} style={{ width: 'auto', marginTop: 0 }} />
          <span className="text-primary" style={{ fontSize: '0.9rem', textTransform: 'none', letterSpacing: 'normal' }}>Imprimir etiqueta(s) automáticamente</span>
        </label>

        {printAfter && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '1.5rem', background: 'var(--theme-background)', padding: '0.8rem', borderRadius: '8px' }}>
            <input type="checkbox" checked={agruparContenedor} onChange={e => setAgruparContenedor(e.target.checked)} style={{ width: 'auto', marginTop: 0 }} />
            <span className="text-primary" style={{ fontSize: '0.9rem', textTransform: 'none', letterSpacing: 'normal' }}>Agrupar en 1 solo contenedor físico (imprimir 1 sola etiqueta múltiple)</span>
          </label>
        )}

        {error && <p className="text-center text-error" style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}
        <button type="submit" className="btn btn--primary btn--block" disabled={loading || !form.especie_id}>
          {loading ? 'Generando…' : `Crear y Etiquetar ${totalClones} individuos`}
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

function Field({ label, value, onChange, placeholder, type = 'text', textarea, italic, min, noMargin }) {
  return (
    <div className="form-group" style={noMargin ? { marginBottom: 0 } : {}}>
      <label>{label}</label>
      {textarea
        ? <textarea style={{ minHeight: 64, resize: 'vertical', ...(italic ? { fontStyle: 'italic' } : {}) }} value={value}
            onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        : <input type={type} min={min} style={italic ? { fontStyle: 'italic' } : {}} value={value}
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
