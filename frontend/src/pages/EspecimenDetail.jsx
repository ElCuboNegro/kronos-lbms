import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import EventoForm from '../components/EventoForm'
import RegistroEvolucionForm from '../components/RegistroEvolucionForm'
import MapPicker from '../components/MapPicker'

const ESTADO_BADGE = {
  activo: 'badge--success', en_experimento: 'badge--warning',
  archivado: 'badge--outline', contaminado: 'badge--danger',
}
const ANGULO_LABEL = { arriba: '↑', frente: '●', atras: '○', izquierda: '←', derecha: '→' }

export default function EspecimenDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [esp, setEsp] = useState(location.state?.data || null)
  const [registros, setRegistros] = useState([])
  const [protocolos, setProtocolos] = useState([])
  const [tab, setTab] = useState('info') // info | evolucion | eventos
  const [showEvento, setShowEvento] = useState(false)
  const [showEvolucion, setShowEvolucion] = useState(false)
  const [evolutionStep, setEvolutionStep] = useState(0)
  const [showEdit, setShowEdit] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [loading, setLoading] = useState(!esp)

  async function fetchEsp() {
    setLoading(true)
    try { setEsp(await api.get(`/especimenes/${id}`)) }
    finally { setLoading(false) }
  }

  async function fetchRegistros() {
    try { setRegistros(await api.get(`/especimenes/${id}/evolucion`)) }
    catch { }
  }

  useEffect(() => {
    if (!esp) fetchEsp()
    fetchRegistros()
    api.get('/protocolos').then(setProtocolos).catch(() => {})

    if (params.get('quick') === 'foto') {
      setEvolutionStep(2)
      setShowEvolucion(true)
    }
  }, [id, params])

  async function imprimir() {
    setPrinting(true)
    try { await api.post(`/printer/imprimir/${id}`) }
    catch (e) { alert(e.message) }
    finally { setPrinting(false) }
  }

  if (loading) return <div className="page-container text-center"><p className="text-muted" style={{padding:'2rem 0'}}>Cargando…</p></div>
  if (!esp) return <div className="page-container text-center"><p className="text-danger" style={{padding:'2rem 0'}}>No encontrado</p></div>

  const ultimoRegistro = registros[0] || null

  return (
    <div className="page-container" style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', background: 'var(--bio-surface)', borderBottom: '1px solid var(--bio-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className={`badge ${ESTADO_BADGE[esp.estado] || 'badge--outline'}`} style={{ marginBottom: '0.5rem' }}>{esp.estado.replace('_', ' ')}</span>
            <h2 className="page-title text-primary" style={{ fontStyle: 'italic', marginBottom: '0.2rem' }}>{esp.especie}</h2>
            {esp.linea_nombre && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.9rem' }}>{esp.linea_nombre}</span>
                {esp.variegacion_nombre && <><span className="text-muted">›</span><span className="text-secondary" style={{ fontSize: '0.9rem' }}>{esp.variegacion_nombre}</span></>}
              </div>
            )}
            <p className="text-muted font-mono" style={{ margin: '0.5rem 0 0', fontSize: '0.85rem' }}>UID: {esp.uid}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn--ghost" style={{ padding: '0.5rem' }} onClick={() => { setEvolutionStep(2); setShowEvolucion(true) }} title="Tomar fotos">📸</button>
            <button className="btn btn--ghost" style={{ padding: '0.5rem' }} onClick={imprimir} disabled={printing} title="Reimprimir etiqueta">
              {printing ? '…' : '🖨'}
            </button>
            <button className="btn btn--ghost" style={{ padding: '0.5rem' }} onClick={() => setShowEdit(true)} title="Editar">✏️</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--bio-border)', background: 'var(--bio-surface)' }}>
        {['info', 'evolucion', 'eventos'].map(t => (
          <button key={t} 
            style={{ 
              flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '1rem 0.5rem', fontSize: '0.9rem',
              color: tab === t ? 'var(--bio-primary)' : 'var(--bio-text-muted)',
              borderBottom: tab === t ? '2px solid var(--bio-primary)' : '2px solid transparent',
              fontWeight: tab === t ? 600 : 400
            }} 
            onClick={() => setTab(t)}>
            {t === 'info' ? 'Info' : t === 'evolucion' ? `Evolución (${registros.length})` : `Eventos (${esp.eventos.length})`}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '0.5rem 1rem', margin: 0 }}>
            <InfoRow label="Ingreso" value={fmtFecha(esp.fecha_ingreso)} />
            {esp.origen && <InfoRow label="Origen" value={esp.origen} />}
            {esp.madre_uid && (
              <InfoRow label="Planta Madre" value={
                <button onClick={() => navigate(`/especimen/${esp.madre_id}`)} style={{ background: 'none', border: 'none', color: 'var(--bio-primary)', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>{esp.madre_uid} ↗</button>
              } />
            )}
            {esp.padre_uid && (
              <InfoRow label="Planta Padre" value={
                <button onClick={() => navigate(`/especimen/${esp.padre_id}`)} style={{ background: 'none', border: 'none', color: 'var(--bio-primary)', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}>{esp.padre_uid} ↗</button>
              } />
            )}
            {esp.coordenadas && (
              <InfoRow label="Ubicación In Situ" value={
                <a href={`https://www.google.com/maps/search/?api=1&query=${esp.coordenadas.lat},${esp.coordenadas.lng}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bio-primary)', fontSize: '0.9rem', textDecoration: 'none' }}>
                  {esp.coordenadas.lat.toFixed(5)}, {esp.coordenadas.lng.toFixed(5)} 📍
                </a>
              } />
            )}
            {esp.notas && <InfoRow label="Notas" value={esp.notas} isLast />}
          </div>

          {ultimoRegistro && (
            <div className="card" style={{ margin: 0 }}>
              <p className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 1rem' }}>Último registro · {fmtFecha(ultimoRegistro.fecha)}</p>
              <MedidasGrid r={ultimoRegistro} />
              {tieneCondiciones(ultimoRegistro) && <CondicionesGrid r={ultimoRegistro} />}
              {ultimoRegistro.fotos && Object.keys(ultimoRegistro.fotos).length > 0 && (
                <div style={{ marginTop: '1rem' }}><FotosRow fotos={ultimoRegistro.fotos} /></div>
              )}
            </div>
          )}

          <button className="btn btn--ghost btn--block" onClick={() => setShowEvolucion(true)}>+ Nuevo registro de evolución</button>
        </div>
      )}

      {/* Tab: Evolución */}
      {tab === 'evolucion' && (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className="btn btn--ghost btn--block" onClick={() => setShowEvolucion(true)}>+ Nuevo registro</button>
          {registros.length === 0
            ? <p className="text-muted text-center" style={{ padding: '2rem 0' }}>Sin registros aún</p>
            : registros.map(r => <RegistroCard key={r.id} r={r} />)
          }
        </div>
      )}

      {/* Tab: Eventos */}
      {tab === 'eventos' && (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className="btn btn--ghost btn--block" onClick={() => setShowEvento(true)}>+ Registrar Evento</button>
          {esp.eventos.length === 0
            ? <p className="text-muted text-center" style={{ padding: '2rem 0' }}>Sin eventos</p>
            : esp.eventos.map(ev => <EventoCard key={ev.id} ev={ev} />)
          }
        </div>
      )}

      {/* Modals */}
      {showEvolucion && (
        <RegistroEvolucionForm
          especimenId={id}
          protocolos={protocolos}
          initialStep={evolutionStep}
          onSaved={() => { setShowEvolucion(false); setEvolutionStep(0); fetchRegistros(); setTab('evolucion') }}
          onCancel={() => { setShowEvolucion(false); setEvolutionStep(0) }}
        />
      )}
      {showEvento && (
        <EventoForm especimenId={esp.id}
          onSaved={() => { setShowEvento(false); fetchEsp() }}
          onCancel={() => setShowEvento(false)} />
      )}
      {showEdit && (
        <EditEspecimenSheet esp={esp}
          onSaved={() => { setShowEdit(false); fetchEsp() }}
          onCancel={() => setShowEdit(false)} />
      )}
    </div>
  )
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function MedidasGrid({ r }) {
  const items = [
    ['Altura', r.altura_cm, 'cm'],
    ['Nodos', r.num_nodos, ''],
    ['Hoja max', r.ancho_hoja_max_cm ? `${r.ancho_hoja_max_cm}×${r.largo_hoja_max_cm || '?'}` : null, 'cm'],
    ['N° hojas', r.num_hojas, ''],
    ['Brotes', r.num_brotes, ''],
    ['Hijuelos', r.num_hijuelos, ''],
    ['Tallo Ø', r.diametro_tallo_mm, 'mm'],
    ['Variegación', r.porcentaje_variegacion, '%'],
    ['Patrón', r.patron_variegacion, ''],
    ['Color var.', r.color_variegacion, ''],
    ['Sustrato', r.sustrato, ''],
    ['Contenedor', r.tipo_contenedor, ''],
  ].filter(([, v]) => v != null && v !== '')

  if (!items.length) return null
  return (
    <div className="grid-2" style={{ gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
      {items.map(([label, val, unit]) => (
        <div key={label} style={{ background: 'var(--bio-background)', borderRadius: '8px', padding: '0.6rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span className="text-muted" style={{ fontSize: '0.7rem' }}>{label}</span>
          <span className="text-primary" style={{ fontSize: '1rem', fontWeight: 600 }}>{val}{unit && <span style={{ fontSize: '0.8rem', marginLeft: '0.1rem' }}>{unit}</span>}</span>
        </div>
      ))}
    </div>
  )
}

function CondicionesGrid({ r }) {
  const items = [
    ['Temp.', r.temperatura_c, '°C'],
    ['HR', r.humedad_relativa_pct, '%'],
    ['H.sustrato', r.humedad_sustrato_pct, '%'],
    ['pH', r.ph_sustrato, ''],
    ['Luz', r.luz_lux, 'lux'],
    ['EC', r.conductividad_ec, ''],
  ].filter(([, v]) => v != null)

  if (!items.length) return null
  return (
    <div style={{ marginTop: '1rem' }}>
      <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 0.5rem' }}>Condiciones ambientales</p>
      <div className="grid-2" style={{ gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
        {items.map(([label, val, unit]) => (
           <div key={label} style={{ background: 'var(--bio-background)', borderRadius: '8px', padding: '0.6rem 0.8rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
             <span className="text-muted" style={{ fontSize: '0.7rem' }}>{label}</span>
             <span className="text-primary" style={{ fontSize: '1rem', fontWeight: 600 }}>{val}{unit && <span style={{ fontSize: '0.8rem', marginLeft: '0.1rem' }}>{unit}</span>}</span>
           </div>
        ))}
      </div>
    </div>
  )
}

function FotosRow({ fotos }) {
  return (
    <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
      {Object.entries(fotos).map(([angulo, url]) => (
        <div key={angulo} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
          <img
            src={`/api${url}?t=${Date.now()}`}
            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--bio-border)' }}
            alt={angulo}
            onError={e => { e.target.style.display = 'none' }}
          />
          <span className="badge badge--outline" style={{ fontSize: '0.6rem' }}>{ANGULO_LABEL[angulo] || angulo}</span>
        </div>
      ))}
    </div>
  )
}

function RegistroCard({ r }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button style={{ width: '100%', background: 'none', border: 'none', padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <span className="text-primary" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{fmtFecha(r.fecha)}</span>
        <span className="text-muted" style={{ fontSize: '0.8rem', flex: 1, textAlign: 'right' }}>por {r.registrado_por_nombre}</span>
        <span className="text-secondary">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {r.protocolo_clonacion_nombre && <p className="text-secondary" style={{ fontSize: '0.85rem', margin: 0 }}>Protocolo: {r.protocolo_clonacion_nombre}</p>}
          <MedidasGrid r={r} />
          {tieneCondiciones(r) && <CondicionesGrid r={r} />}
          {r.fotos && Object.keys(r.fotos).length > 0 && <FotosRow fotos={r.fotos} />}
          {r.notas && <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0, fontStyle: 'italic', borderLeft: '2px solid var(--bio-border)', paddingLeft: '0.5rem' }}>"{r.notas}"</p>}
        </div>
      )}
    </div>
  )
}

function EventoCard({ ev }) {
  const d = new Date(ev.timestamp)
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span className="badge badge--success">{ev.tipo}</span>
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>{d.toLocaleDateString('es-MX')} {d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <p className="text-primary" style={{ fontSize: '1rem', margin: '0 0 0.5rem' }}>{ev.descripcion}</p>
      <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>
        registrado por {ev.usuario_nombre}
        {ev.ejecutado_por_nombre && ` · ejecutado por ${ev.ejecutado_por_nombre}`}
      </p>
    </div>
  )
}

function InfoRow({ label, value, isLast }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: isLast ? 'none' : '1px solid var(--bio-background)' }}>
      <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{label}</span>
      <span className="text-primary" style={{ fontSize: '0.9rem', maxWidth: '60%', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function EditEspecimenSheet({ esp, onSaved, onCancel }) {
  const [especies, setEspecies] = useState([])
  const [lineas, setLineas] = useState([])
  const [variegaciones, setVariegaciones] = useState([])
  const [form, setForm] = useState({
    especie_id: esp.especie_id || '',
    linea_id: esp.linea_id || '',
    variegacion_id: esp.variegacion_id || '',
    madre_id: esp.madre_id || '',
    padre_id: esp.padre_id || '',
    origen: esp.origen || '',
    coordenadas: esp.coordenadas || null,
    estado: esp.estado || 'activo',
    notas: esp.notas || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    api.get('/especies').then(setEspecies)
    if (esp.especie_id) {
      api.get(`/especies/${esp.especie_id}`).then(e => {
        setLineas(e.lineas || [])
        if (esp.linea_id) {
          const l = (e.lineas || []).find(l => l.id === esp.linea_id)
          setVariegaciones(l?.variegaciones || [])
        }
      })
    }
  }, [])

  useEffect(() => {
    if (!form.especie_id) { setLineas([]); setVariegaciones([]); return }
    api.get(`/especies/${form.especie_id}`).then(e => setLineas(e.lineas || []))
    set('linea_id', ''); set('variegacion_id', '')
  }, [form.especie_id])

  useEffect(() => {
    if (!form.linea_id) { setVariegaciones([]); return }
    const l = lineas.find(l => l.id === form.linea_id)
    setVariegaciones(l?.variegaciones || [])
    set('variegacion_id', '')
  }, [form.linea_id])

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch(`/especimenes/${esp.id}`, {
        especie_id: form.especie_id || undefined,
        linea_id: form.linea_id || undefined,
        variegacion_id: form.variegacion_id || undefined,
        madre_id: form.madre_id || undefined,
        padre_id: form.padre_id || undefined,
        origen: form.origen || undefined,
        coordenadas: form.coordenadas || null,
        estado: form.estado,
        notas: form.notas || undefined,
      })
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'flex-end', zIndex: 200 }}>
      <div style={{ background: 'var(--bio-surface)', borderRadius: '24px 24px 0 0', padding: '2rem 1.5rem', width: '100%', maxHeight: '90dvh', overflowY: 'auto' }}>
        <h3 className="text-primary" style={{ margin: '0 0 1.5rem', fontSize: '1.2rem' }}>Editar individuo</h3>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <Sel2 label="Especie" value={form.especie_id} onChange={v => set('especie_id', v)}
            options={[{ value: '', label: '— Sin cambiar —' }, ...especies.map(e => ({ value: e.id, label: e.nombre_cientifico }))]} />
          {lineas.length > 0 && (
            <Sel2 label="Línea" value={form.linea_id} onChange={v => set('linea_id', v)}
              options={[{ value: '', label: '— Sin línea —' }, ...lineas.map(l => ({ value: l.id, label: l.nombre }))]} />
          )}
          {variegaciones.length > 0 && (
            <Sel2 label="Variegación" value={form.variegacion_id} onChange={v => set('variegacion_id', v)}
              options={[{ value: '', label: '— Sin variegación —' }, ...variegaciones.map(v => ({ value: v.id, label: v.nombre }))]} />
          )}
          <Sel2 label="Estado" value={form.estado} onChange={v => set('estado', v)}
            options={['activo', 'en_experimento', 'archivado', 'contaminado'].map(e => ({ value: e, label: e }))} />
          
          <div className="grid-2">
            <EspecimenSearch label="Madre" value={form.madre_id} onChange={v => set('madre_id', v)} />
            <EspecimenSearch label="Padre" value={form.padre_id} onChange={v => set('padre_id', v)} />
          </div>

          <div className="form-group">
            <label>Ubicación In Situ</label>
            <MapPicker value={form.coordenadas} onChange={v => set('coordenadas', v)} />
          </div>

          <Txt2 label="Origen (descripción)" value={form.origen} onChange={v => set('origen', v)} />
          <Txt2 label="Notas" value={form.notas} onChange={v => set('notas', v)} textarea />
          
          {error && <p className="text-danger" style={{ fontSize: '0.85rem' }}>{error}</p>}
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn--ghost" style={{ flex: 1 }} onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn--primary" style={{ flex: 2 }} disabled={loading}>{loading ? '…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Sel2({ label, value, onChange, options }) {
  return (
    <div className="form-group" style={{ marginBottom: '1rem' }}>
      <label>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
function Txt2({ label, value, onChange, textarea }) {
  return (
    <div className="form-group" style={{ marginBottom: '1rem' }}>
      <label>{label}</label>
      {textarea
        ? <textarea style={{ minHeight: 80, resize: 'vertical' }} value={value} onChange={e => onChange(e.target.value)} />
        : <input value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  )
}

function EspecimenSearch({ label, value, onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedUid, setSelectedUid] = useState('')

  useEffect(() => {
    if (value === '') { setSelectedUid(''); setQuery(''); }
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
    <div className="form-group" style={{ position: 'relative', marginBottom: '1rem' }}>
      <label>{label}</label>
      <input value={query} onChange={e => search(e.target.value)} placeholder="Buscar UID..." />
      {results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bio-surface)', border: '1px solid var(--bio-border)', borderRadius: 8, zIndex: 200, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          {results.map(r => (
            <div key={r.id} style={{ padding: '0.8rem', cursor: 'pointer', borderBottom: '1px solid var(--bio-background)' }} onClick={() => select(r)}>
              <span className="text-primary" style={{ fontWeight: 'bold' }}>{r.uid}</span>
              <span className="text-muted" style={{ fontSize: '0.8rem', marginLeft: 8 }}>{r.especie}</span>
            </div>
          ))}
        </div>
      )}
      {selectedUid && query === selectedUid && (
        <button type="button" style={{ position: 'absolute', right: 10, top: 32, background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1.2rem' }} onClick={() => { onChange(''); setQuery(''); setSelectedUid(''); }}>✕</button>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tieneCondiciones(r) {
  return [r.temperatura_c, r.humedad_relativa_pct, r.humedad_sustrato_pct, r.ph_sustrato, r.luz_lux, r.conductividad_ec].some(v => v != null)
}

function fmtFecha(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}