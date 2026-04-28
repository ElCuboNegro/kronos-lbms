import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import EventoForm from '../components/EventoForm'
import RegistroEvolucionForm from '../components/RegistroEvolucionForm'
import MapPicker from '../components/MapPicker'

const ESTADO_COLOR = {
  activo: '#2d7a47', en_experimento: '#b07d1e',
  archivado: '#4a5568', contaminado: '#c0392b',
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

  if (loading) return <div style={s.page}><p style={s.muted}>Cargando…</p></div>
  if (!esp) return <div style={s.page}><p style={s.error}>No encontrado</p></div>

  const ultimoRegistro = registros[0] || null

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerTop}>
          <div>
            <span style={{ ...s.badge, background: ESTADO_COLOR[esp.estado] || '#555' }}>{esp.estado}</span>
            <h2 style={s.especie}>{esp.especie}</h2>
            {esp.linea_nombre && (
              <div style={s.jerarquia}>
                <span style={s.jerarquiaItem}>{esp.linea_nombre}</span>
                {esp.variegacion_nombre && <><span style={s.jerarquiaSep}>›</span><span style={s.jerarquiaItem}>{esp.variegacion_nombre}</span></>}
              </div>
            )}
            <p style={s.uid}>UID: {esp.uid}</p>
          </div>
          <div style={s.headerActions}>
            <button style={s.btnIcon} onClick={() => { setEvolutionStep(2); setShowEvolucion(true) }} title="Tomar fotos">📸</button>
            <button style={s.btnIcon} onClick={imprimir} disabled={printing} title="Reimprimir etiqueta">
              {printing ? '…' : '🖨'}
            </button>
            <button style={s.btnIcon} onClick={() => setShowEdit(true)} title="Editar">✏️</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {['info', 'evolucion', 'eventos'].map(t => (
          <button key={t} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }} onClick={() => setTab(t)}>
            {t === 'info' ? 'Info' : t === 'evolucion' ? `Evolución (${registros.length})` : `Eventos (${esp.eventos.length})`}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <div style={s.tabBody}>
          <InfoCard label="Ingreso" value={esp.fecha_ingreso} />
          {esp.origen && <InfoCard label="Origen" value={esp.origen} />}
          {esp.madre_uid && (
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Planta Madre</span>
              <button onClick={() => navigate(`/especimen/${esp.madre_id}`)} style={s.linkBtn}>{esp.madre_uid} ↗</button>
            </div>
          )}
          {esp.padre_uid && (
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Planta Padre</span>
              <button onClick={() => navigate(`/especimen/${esp.padre_id}`)} style={s.linkBtn}>{esp.padre_uid} ↗</button>
            </div>
          )}
          {esp.coordenadas && (
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Ubicación In Situ</span>
              <a href={`https://www.google.com/maps/search/?api=1&query=${esp.coordenadas.lat},${esp.coordenadas.lng}`} target="_blank" rel="noopener noreferrer" style={s.linkVal}>
                {esp.coordenadas.lat.toFixed(5)}, {esp.coordenadas.lng.toFixed(5)} 📍
              </a>
            </div>
          )}
          {esp.notas && <InfoCard label="Notas" value={esp.notas} />}

          {ultimoRegistro && (
            <>
              <p style={s.secTitle}>Último registro · {fmtFecha(ultimoRegistro.fecha)}</p>
              <MedidasGrid r={ultimoRegistro} />
              {tieneCondiciones(ultimoRegistro) && <CondicionesGrid r={ultimoRegistro} />}
              {ultimoRegistro.fotos && Object.keys(ultimoRegistro.fotos).length > 0 && (
                <FotosRow fotos={ultimoRegistro.fotos} />
              )}
            </>
          )}

          <button style={s.btnEvolucion} onClick={() => { setShowEvolucion(true) }}>
            + Nuevo registro de evolución
          </button>
        </div>
      )}

      {/* Tab: Evolución */}
      {tab === 'evolucion' && (
        <div style={s.tabBody}>
          <button style={s.btnEvolucion} onClick={() => setShowEvolucion(true)}>+ Nuevo registro</button>
          {registros.length === 0
            ? <p style={s.muted}>Sin registros aún</p>
            : registros.map(r => <RegistroCard key={r.id} r={r} />)
          }
        </div>
      )}

      {/* Tab: Eventos */}
      {tab === 'eventos' && (
        <div style={s.tabBody}>
          <button style={s.btnEvolucion} onClick={() => setShowEvento(true)}>+ Evento</button>
          {esp.eventos.length === 0
            ? <p style={s.muted}>Sin eventos</p>
            : esp.eventos.map(ev => <EventoCard key={ev.id} ev={ev} />)
          }
        </div>
      )}

      {/* Modales */}
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
    <div style={s.medGrid}>
      {items.map(([label, val, unit]) => (
        <div key={label} style={s.medItem}>
          <span style={s.medLabel}>{label}</span>
          <span style={s.medVal}>{val}{unit && ` ${unit}`}</span>
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
    <>
      <p style={s.secSubTitle}>Condiciones ambientales</p>
      <div style={s.medGrid}>
        {items.map(([label, val, unit]) => (
          <div key={label} style={s.medItem}>
            <span style={s.medLabel}>{label}</span>
            <span style={s.medVal}>{val}{unit && ` ${unit}`}</span>
          </div>
        ))}
      </div>
    </>
  )
}

function FotosRow({ fotos }) {
  const token = localStorage.getItem('token')
  return (
    <div style={s.fotosRow}>
      {Object.entries(fotos).map(([angulo, url]) => (
        <div key={angulo} style={s.fotoWrap}>
          <img
            src={`/api${url}?t=${Date.now()}`}
            style={s.fotoThumb}
            alt={angulo}
            onError={e => { e.target.style.display = 'none' }}
          />
          <span style={s.fotoLabel}>{ANGULO_LABEL[angulo] || angulo}</span>
        </div>
      ))}
    </div>
  )
}

function RegistroCard({ r }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={s.regCard}>
      <button style={s.regHeader} onClick={() => setOpen(o => !o)}>
        <span style={s.regFecha}>{fmtFecha(r.fecha)}</span>
        <span style={s.regUser}>por {r.registrado_por_nombre}</span>
        <span style={{ color: '#4a8c5c' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={s.regBody}>
          {r.protocolo_clonacion_nombre && <p style={s.regProto}>Protocolo: {r.protocolo_clonacion_nombre}</p>}
          <MedidasGrid r={r} />
          {tieneCondiciones(r) && <CondicionesGrid r={r} />}
          {r.fotos && Object.keys(r.fotos).length > 0 && <FotosRow fotos={r.fotos} />}
          {r.notas && <p style={s.regNotas}>{r.notas}</p>}
        </div>
      )}
    </div>
  )
}

function EventoCard({ ev }) {
  const d = new Date(ev.timestamp)
  return (
    <div style={s.eventoCard}>
      <div style={s.eventoTop}>
        <span style={s.eventoTipo}>{ev.tipo}</span>
        <span style={s.eventoFecha}>{d.toLocaleDateString('es-MX')} {d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <p style={s.eventoDesc}>{ev.descripcion}</p>
      <p style={s.eventoUser}>
        registrado por {ev.usuario_nombre}
        {ev.ejecutado_por_nombre && ` · ejecutado por ${ev.ejecutado_por_nombre}`}
      </p>
    </div>
  )
}

function InfoCard({ label, value }) {
  return (
    <div style={s.infoRow}>
      <span style={s.infoLabel}>{label}</span>
      <span style={s.infoVal}>{value}</span>
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
    <div style={so.overlay}>
      <div style={so.sheet}>
        <h3 style={so.title}>Editar individuo</h3>
        <form onSubmit={submit} style={so.form}>
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
          
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <EspecimenSearch label="Madre" value={form.madre_id} onChange={v => set('madre_id', v)} />
            </div>
            <div style={{ flex: 1 }}>
              <EspecimenSearch label="Padre" value={form.padre_id} onChange={v => set('padre_id', v)} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 }}>Ubicación In Situ</label>
            <MapPicker value={form.coordenadas} onChange={v => set('coordenadas', v)} />
          </div>

          <Txt2 label="Origen (descripción)" value={form.origen} onChange={v => set('origen', v)} />
          <Txt2 label="Notas" value={form.notas} onChange={v => set('notas', v)} textarea />
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

function Sel2({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 }}>{label}</label>
      <select style={inputStyle} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
function Txt2({ label, value, onChange, textarea }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 }}>{label}</label>
      {textarea
        ? <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} value={value} onChange={e => onChange(e.target.value)} />
        : <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} />
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
      <label style={{ color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 600 }}>{label}</label>
      <input style={inputStyle} value={query} onChange={e => search(e.target.value)} placeholder="Buscar UID..." />
      {results.length > 0 && (
        <div style={ssr.results}>
          {results.map(r => (
            <div key={r.id} style={ssr.item} onClick={() => select(r)}>
              <span style={{ fontWeight: 'bold' }}>{r.uid}</span>
              <span style={{ fontSize: '0.7rem', color: '#4a8c5c', marginLeft: 6 }}>{r.especie}</span>
            </div>
          ))}
        </div>
      )}
      {selectedUid && query === selectedUid && (
        <button type="button" style={ssr.clear} onClick={() => { onChange(''); setQuery(''); setSelectedUid(''); }}>✕</button>
      )}
    </div>
  )
}

const ssr = {
  results: { position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a2e1e', border: '1px solid #2d5c3a', borderRadius: 8, zIndex: 200, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' },
  item: { padding: '0.6rem 0.8rem', cursor: 'pointer', borderBottom: '1px solid #0f1f13', fontSize: '0.9rem', color: '#e0f0e5' },
  clear: { position: 'absolute', right: 8, top: 26, background: 'none', border: 'none', color: '#f28b82', cursor: 'pointer', fontSize: '1.1rem' },
}

const inputStyle = { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.6rem 0.85rem', color: '#e0f0e5', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' }
const so = {
  overlay: { position: 'fixed', inset: 0, background: '#000c', display: 'flex', alignItems: 'flex-end', zIndex: 150 },
  sheet: { background: '#1a2e1e', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxHeight: '90dvh', overflowY: 'auto' },
  title: { color: '#7dca8f', margin: '0 0 1rem', fontSize: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  actions: { display: 'flex', gap: 8, marginTop: 4 },
  btnCancel: { flex: 1, background: 'none', border: '1px solid #2d5c3a', borderRadius: 8, color: '#7dca8f', padding: '0.75rem', fontSize: '0.9rem', cursor: 'pointer' },
  btnSave: { flex: 2, background: '#2d7a47', border: 'none', borderRadius: 8, color: '#fff', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tieneCondiciones(r) {
  return [r.temperatura_c, r.humedad_relativa_pct, r.humedad_sustrato_pct, r.ph_sustrato, r.luz_lux, r.conductividad_ec].some(v => v != null)
}

function fmtFecha(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const s = {
  page: { display: 'flex', flexDirection: 'column', minHeight: '100%' },
  header: { padding: '1rem 1.25rem 0', background: '#1a2e1e', borderBottom: '1px solid #2d5c3a' },
  headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.75rem' },
  badge: { display: 'inline-block', borderRadius: 20, padding: '0.15rem 0.65rem', fontSize: '0.7rem', color: '#fff', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 },
  especie: { color: '#7dca8f', margin: 0, fontSize: '1.3rem', fontStyle: 'italic' },
  jerarquia: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 },
  jerarquiaItem: { color: '#4a8c5c', fontSize: '0.82rem' },
  jerarquiaSep: { color: '#2d5c3a', fontSize: '0.8rem' },
  uid: { color: '#4a5568', margin: '2px 0 0', fontFamily: 'monospace', fontSize: '0.82rem' },
  headerActions: { display: 'flex', gap: 6 },
  btnIcon: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.4rem 0.6rem', cursor: 'pointer', fontSize: '1rem' },
  tabs: { display: 'flex', borderBottom: '1px solid #2d5c3a', background: '#1a2e1e' },
  tab: { flex: 1, background: 'none', border: 'none', borderBottom: '2px solid transparent', color: '#4a5568', padding: '0.65rem 0.5rem', fontSize: '0.82rem', cursor: 'pointer' },
  tabActive: { color: '#7dca8f', borderBottomColor: '#7dca8f' },
  tabBody: { padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 10 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: '1px solid #1a2e1e' },
  infoLabel: { color: '#4a8c5c', fontSize: '0.82rem', fontWeight: 600 },
  infoVal: { color: '#e0f0e5', fontSize: '0.88rem', maxWidth: '60%', textAlign: 'right' },
  linkVal: { color: '#7dca8f', fontSize: '0.88rem', maxWidth: '60%', textAlign: 'right', textDecoration: 'none' },
  linkBtn: { background: 'none', border: 'none', color: '#7dca8f', fontSize: '0.88rem', cursor: 'pointer', padding: 0, textAlign: 'right' },
  secTitle: { color: '#4a8c5c', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: '8px 0 0' },
  secSubTitle: { color: '#4a5568', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, margin: '6px 0 0' },
  medGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 },
  medItem: { background: '#0f1f13', borderRadius: 8, padding: '0.5rem 0.6rem', display: 'flex', flexDirection: 'column', gap: 2 },
  medLabel: { color: '#4a5568', fontSize: '0.68rem' },
  medVal: { color: '#7dca8f', fontSize: '0.92rem', fontWeight: 600 },
  fotosRow: { display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 },
  fotoWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 },
  fotoThumb: { width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid #2d5c3a' },
  fotoLabel: { color: '#4a5568', fontSize: '0.65rem' },
  btnEvolucion: { background: '#1a2e1e', border: '1px solid #2d7a47', borderRadius: 10, color: '#7dca8f', padding: '0.75rem', fontSize: '0.9rem', cursor: 'pointer', textAlign: 'center' },
  regCard: { background: '#1a2e1e', borderRadius: 10, overflow: 'hidden', border: '1px solid #2d5c3a' },
  regHeader: { width: '100%', background: 'none', border: 'none', padding: '0.65rem 0.9rem', display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' },
  regFecha: { color: '#7dca8f', fontSize: '0.85rem', fontWeight: 600 },
  regUser: { color: '#4a5568', fontSize: '0.78rem', flex: 1, textAlign: 'right' },
  regBody: { padding: '0 0.9rem 0.9rem', display: 'flex', flexDirection: 'column', gap: 8 },
  regProto: { color: '#4a8c5c', fontSize: '0.8rem', margin: 0 },
  regNotas: { color: '#6aaa82', fontSize: '0.85rem', margin: 0, fontStyle: 'italic' },
  eventoCard: { background: '#1a2e1e', borderRadius: 10, padding: '0.75rem 1rem' },
  eventoTop: { display: 'flex', justifyContent: 'space-between' },
  eventoTipo: { color: '#7dca8f', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' },
  eventoFecha: { color: '#4a5568', fontSize: '0.72rem' },
  eventoDesc: { color: '#e0f0e5', fontSize: '0.88rem', margin: '4px 0 2px' },
  eventoUser: { color: '#4a5568', fontSize: '0.72rem', margin: 0 },
  muted: { color: '#4a5568', fontSize: '0.88rem', textAlign: 'center', padding: '1rem 0' },
  error: { color: '#f28b82' },
}
