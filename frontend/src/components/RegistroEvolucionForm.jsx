import { useState, useRef, useEffect } from 'react'
import { api } from '../api/client'

const ANGULOS = ['arriba', 'frente', 'atras', 'izquierda', 'derecha']
const ANGULO_LABEL = { arriba: 'Arriba', frente: 'Frente', atras: 'Atrás', izquierda: 'Izquierda', derecha: 'Derecha' }
const PATRONES = ['none', 'sector', 'half_moon', 'moteado', 'marble', 'full']
const COLORES = ['none', 'blanco', 'crema', 'amarillo', 'mint']
const SUSTRATOS_BASE = ['vitro', 'sphagnum', 'akadama', 'perlita', 'mezcla', 'tierra', 'otro']
const CONTENEDORES = ['frasco_vitro', 'maceta', 'bolsa', 'bandeja', 'otro']

export default function RegistroEvolucionForm({ especimenId, protocolos = [], onSaved, onCancel, initialStep = 0 }) {
  const [step, setStep] = useState(initialStep)
  const [sustratos, setSustratos] = useState([])
  const [form, setForm] = useState({
    protocolo_clonacion_id: '',
    altura_cm: '', ancho_hoja_max_cm: '', largo_hoja_max_cm: '',
    num_hojas: '', num_brotes: '', num_hijuelos: '', num_nodos: '',
    diametro_tallo_mm: '',
    porcentaje_variegacion: '', patron_variegacion: 'none', color_variegacion: 'none',
    sustrato: '', sustrato_id: '', tipo_contenedor: '', diametro_contenedor_cm: '',
    temperatura_c: '', humedad_relativa_pct: '', humedad_sustrato_pct: '',
    ph_sustrato: '', luz_lux: '', conductividad_ec: '',
    npk: '', ppm: '',
    notas: ''
  })
  const [fotos, setFotos] = useState({}) // angulo → {file, preview}
  const [registroId, setRegistroId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadingAngulo, setUploadingAngulo] = useState(null)
  const [error, setError] = useState('')
  const fileRefs = useRef({})

  useEffect(() => {
    api.get('/sustratos').then(setSustratos).catch(() => {})
    
    // Si empezamos en paso de fotos, crear el registro base inmediatamente
    if (initialStep === 2 && !registroId) {
      guardarMedidas()
    }
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const num = v => v === '' ? undefined : parseFloat(v)
  const int = v => v === '' ? undefined : parseInt(v)

  async function guardarMedidas() {
    setLoading(true)
    setError('')
    try {
      const payload = {
        protocolo_clonacion_id: form.protocolo_clonacion_id || undefined,
        sustrato_id: form.sustrato_id || undefined,
        sustrato: form.sustrato || undefined,
        notas: form.notas || undefined,
        altura_cm: num(form.altura_cm),
        ancho_hoja_max_cm: num(form.ancho_hoja_max_cm),
        largo_hoja_max_cm: num(form.largo_hoja_max_cm),
        num_hojas: int(form.num_hojas),
        num_brotes: int(form.num_brotes),
        num_hijuelos: int(form.num_hijuelos),
        num_nodos: int(form.num_nodos),
        diametro_tallo_mm: num(form.diametro_tallo_mm),
        porcentaje_variegacion: num(form.porcentaje_variegacion),
        patron_variegacion: form.patron_variegacion,
        color_variegacion: form.color_variegacion,
        tipo_contenedor: form.tipo_contenedor || undefined,
        diametro_contenedor_cm: num(form.diametro_contenedor_cm),
        temperatura_c: num(form.temperatura_c),
        humedad_relativa_pct: num(form.humedad_relativa_pct),
        humedad_sustrato_pct: num(form.humedad_sustrato_pct),
        ph_sustrato: num(form.ph_sustrato),
        luz_lux: num(form.luz_lux),
        conductividad_ec: num(form.conductividad_ec),
        npk: form.npk || undefined,
        ppm: num(form.ppm),
      }
      const reg = await api.post(`/especimenes/${especimenId}/evolucion`, payload)
      setRegistroId(reg.id)
      setStep(2)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function capturarFoto(angulo, file) {
    if (!registroId) { setError("Guarda primero los datos."); return }
    const preview = URL.createObjectURL(file)
    setFotos(f => ({ ...f, [angulo]: { file, preview } }))
    setUploadingAngulo(angulo)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/especimenes/${especimenId}/evolucion/${registroId}/fotos/${angulo}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Error al subir fotografía");
      }
    } catch (err) {
      setError(`Fallo en foto ${ANGULO_LABEL[angulo]}: ${err.message}`)
    } finally { setUploadingAngulo(null) }
  }

  function triggerCamera(angulo) {
    if (!fileRefs.current[angulo]) return
    fileRefs.current[angulo].click()
  }

  return (
    <div style={s.overlay}>
      <div style={s.sheet}>
        <div style={s.header}>
          <h3 style={s.title}>Nuevo registro de evolución</h3>
          <button style={s.btnClose} onClick={onCancel}>✕</button>
        </div>

        {step === 0 && (
          <div style={s.body}>
            <Section title="Morfología y Variegación">
              <Row2>
                <Num label="Altura (cm)" value={form.altura_cm} onChange={v => set('altura_cm', v)} />
                <Num label="Ø Tallo (mm)" value={form.diametro_tallo_mm} onChange={v => set('diametro_tallo_mm', v)} />
              </Row2>
              <Row2>
                <Num label="Ancho hoja (cm)" value={form.ancho_hoja_max_cm} onChange={v => set('ancho_hoja_max_cm', v)} />
                <Num label="Largo hoja (cm)" value={form.largo_hoja_max_cm} onChange={v => set('largo_hoja_max_cm', v)} />
              </Row2>
              <Row3>
                <Num label="Hojas" value={form.num_hojas} onChange={v => set('num_hojas', v)} />
                <Num label="Brotes" value={form.num_brotes} onChange={v => set('num_brotes', v)} />
                <Num label="Nodos" value={form.num_nodos} onChange={v => set('num_nodos', v)} />
              </Row3>
              <Row3>
                <Num label="% Varieg." value={form.porcentaje_variegacion} onChange={v => set('porcentaje_variegacion', v)} />
                <Sel label="Patrón" value={form.patron_variegacion} onChange={v => set('patron_variegacion', v)} options={PATRONES} />
                <Sel label="Color" value={form.color_variegacion} onChange={v => set('color_variegacion', v)} options={COLORES} />
              </Row3>
            </Section>

            <Section title="Contenedor y Protocolo">
              <div style={s.field}>
                <label style={s.label}>Formulación de Sustrato</label>
                <select style={s.input} value={form.sustrato_id} onChange={e => set('sustrato_id', e.target.value)}>
                  <option value="">— Seleccionar formulación —</option>
                  {sustratos.map(su => <option key={su.id} value={su.id}>{su.codigo_formulacion} - {su.nombre}</option>)}
                </select>
              </div>
              <Row2>
                <Sel label="Tipo Sustrato" value={form.sustrato} onChange={v => set('sustrato', v)} options={SUSTRATOS_BASE} />
                <Sel label="Contenedor" value={form.tipo_contenedor} onChange={v => set('tipo_contenedor', v)} options={CONTENEDORES} />
              </Row2>
              <div style={s.field}>
                <label style={s.label}>Protocolo aplicado</label>
                <select style={s.input} value={form.protocolo_clonacion_id} onChange={e => set('protocolo_clonacion_id', e.target.value)}>
                  <option value="">Ninguno / Observación</option>
                  {protocolos.map(p => <option key={p.id} value={p.id}>{p.nombre} (v{p.version})</option>)}
                </select>
              </div>
            </Section>

            <div style={s.navRow}>
              <button type="button" style={s.btnNext} onClick={() => setStep(1)}>Siguiente: Ambiente →</button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div style={s.body}>
            <Section title="Condiciones Ambientales">
              <Row2>
                <Num label="Temp (°C)" value={form.temperatura_c} onChange={v => set('temperatura_c', v)} />
                <Num label="Humedad Rel. (%)" value={form.humedad_relativa_pct} onChange={v => set('humedad_relativa_pct', v)} />
              </Row2>
              <Row2>
                <Num label="PH Sustrato" value={form.ph_sustrato} onChange={v => set('ph_sustrato', v)} />
                <Num label="Hum. Sustrato (%)" value={form.humedad_sustrato_pct} onChange={v => set('humedad_sustrato_pct', v)} />
              </Row2>
              <Row2>
                <Num label="Luz (lux)" value={form.luz_lux} onChange={v => set('luz_lux', v)} />
                <Num label="Conductividad EC" value={form.conductividad_ec} onChange={v => set('conductividad_ec', v)} />
              </Row2>
              <Row2>
                <Txt label="NPK" value={form.npk} onChange={v => set('npk', v)} placeholder="20-20-20" />
                <Num label="Nutrición (PPM)" value={form.ppm} onChange={v => set('ppm', v)} />
              </Row2>
              <div style={s.field}>
                <label style={s.label}>Notas y observaciones</label>
                <textarea style={{...s.input, minHeight: 80}} value={form.notas} onChange={e => set('notas', e.target.value)} />
              </div>
            </Section>

            {error && <p style={s.errorMsg}>{error}</p>}

            <div style={s.navRow}>
              <button type="button" style={s.btnCancel} onClick={() => setStep(0)}>← Atrás</button>
              <button type="button" style={s.btnNext} onClick={guardarMedidas} disabled={loading}>
                {loading ? 'Guardando…' : 'Guardar y fotografiar →'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={s.body}>
            <Section title="Fotografías">
              <div style={s.fotoGrid}>
                {ANGULOS.map(ang => (
                  <div key={ang} style={s.fotoCard} onClick={() => !uploadingAngulo && triggerCamera(ang)}>
                    <input type="file" accept="image/*" capture="environment" style={{display:'none'}}
                      ref={el => fileRefs.current[ang] = el}
                      onChange={e => e.target.files[0] && capturarFoto(ang, e.target.files[0])}
                    />
                    {fotos[ang] ? (
                      <img src={fotos[ang].preview} style={s.fotoImg} />
                    ) : (
                      <div style={s.fotoPlaceholder}>
                        {uploadingAngulo === ang ? '⌛' : <><span style={s.angIcon}>📷</span><span style={s.angLabel}>{ANGULO_LABEL[ang]}</span></>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
            <div style={s.navRow}>
              <button type="button" style={s.btnSaveFinal} onClick={onSaved}>Finalizar Registro</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <h4 style={s.sectionTitle}>{title}</h4>
      {children}
    </div>
  )
}

function Row2({ children }) { return <div style={s.row2}>{children}</div> }
function Row3({ children }) { return <div style={s.row3}>{children}</div> }

function Num({ label, value, onChange }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <input type="number" step="0.1" style={s.input} value={value} onChange={e => onChange(e.target.value)} placeholder="—" />
    </div>
  )
}

function Txt({ label, value, onChange, placeholder }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <input type="text" style={s.input} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || "—"} />
    </div>
  )
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={s.field}>
      <label style={s.label}>{label}</label>
      <select style={s.input} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: '#000c', display: 'flex', alignItems: 'flex-end', zIndex: 100 },
  sheet: { background: '#1a2e1e', borderRadius: '16px 16px 0 0', padding: '1.5rem', width: '100%', maxHeight: '90dvh', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  title: { color: '#7dca8f', margin: 0, fontSize: '1.1rem' },
  btnClose: { background: 'none', border: 'none', color: '#4a8c5c', fontSize: '1.2rem', cursor: 'pointer' },
  body: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  section: { display: 'flex', flexDirection: 'column', gap: 10 },
  sectionTitle: { color: '#4a8c5c', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, margin: 0 },
  field: { display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
  label: { color: '#4a8c5c', fontSize: '0.75rem', fontWeight: 600 },
  input: { background: '#0f1f13', border: '1px solid #2d5c3a', borderRadius: 8, padding: '0.65rem 0.8rem', color: '#e0f0e5', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  row2: { display: 'flex', gap: 10 },
  row3: { display: 'flex', gap: 8 },
  navRow: { display: 'flex', gap: 10, marginTop: 10 },
  btnCancel: { flex: 1, background: 'none', border: '1px solid #2d5c3a', borderRadius: 10, color: '#7dca8f', padding: '0.8rem', fontSize: '0.95rem', cursor: 'pointer' },
  btnNext: { flex: 2, background: '#2d7a47', border: 'none', borderRadius: 10, color: '#fff', padding: '0.8rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' },
  btnSaveFinal: { width: '100%', background: '#2d7a47', border: 'none', borderRadius: 10, color: '#fff', padding: '1rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' },
  errorMsg: { color: '#f28b82', fontSize: '0.85rem', margin: 0 },
  fotoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  fotoCard: { aspectRatio: '1', background: '#0f1f13', borderRadius: 12, border: '1px dashed #2d5c3a', overflow: 'hidden', cursor: 'pointer' },
  fotoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  fotoPlaceholder: { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 },
  angIcon: { fontSize: '1.5rem' },
  angLabel: { color: '#7dca8f', fontSize: '0.75rem' },
}
