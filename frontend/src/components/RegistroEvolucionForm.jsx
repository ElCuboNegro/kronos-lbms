import { useState, useRef, useEffect } from 'react'
import { api } from '../api/client'

const ANGULOS = ['arriba', 'frente', 'atras', 'izquierda', 'derecha']
const ANGULO_LABEL = { arriba: 'Arriba', frente: 'Frente', atras: 'Atrás', izquierda: 'Izquierda', derecha: 'Derecha' }
const PATRONES = ['none', 'sector', 'half_moon', 'moteado', 'marble', 'full']
const COLORES = ['none', 'blanco', 'crema', 'amarillo', 'mint']
const SUSTRATOS_BASE = ['vitro', 'sphagnum', 'akadama', 'perlita', 'mezcla', 'tierra', 'otro']
const CONTENEDORES = ['frasco_vitro', 'maceta', 'bolsa', 'bandeja', 'otro']

export default function RegistroEvolucionForm({ especimenId, contenedorUid, protocolos = [], onSaved, onCancel, initialStep = 0 }) {
  const [sustratos, setSustratos] = useState([])
  const [step, setStep] = useState(initialStep)
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
        patron_variegacion: form.patron_variegacion !== 'none' ? form.patron_variegacion : undefined,
        color_variegacion: form.color_variegacion !== 'none' ? form.color_variegacion : undefined,
        sustrato: form.sustrato || undefined,
        tipo_contenedor: form.tipo_contenedor || undefined,
        diametro_contenedor_cm: num(form.diametro_contenedor_cm),
        temperatura_c: num(form.temperatura_c),
        humedad_relativa_pct: num(form.humedad_relativa_pct),
        humedad_sustrato_pct: num(form.humedad_sustrato_pct),
        ph_sustrato: num(form.ph_sustrato),
        luz_lux: num(form.luz_lux),
        conductividad_ec: num(form.conductividad_ec),
        npk: form.npk || undefined,
        ppm: num(form.ppm)
      }

      let res;
      if (contenedorUid) {
        res = await api.post(`/especimenes/contenedores/${contenedorUid}/evolucion`, payload)
        setRegistroId(res[0].id) // Usamos el ID del primero para subir las fotos y sincronizar
      } else {
        res = await api.post(`/especimenes/${especimenId}/evolucion`, payload)
        setRegistroId(res.id)
      }
      setStep(2)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileChange(angulo, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setFotos(prev => ({ ...prev, [angulo]: { file, preview: reader.result } }))
      subirFoto(angulo, file)
    }
    reader.readAsDataURL(file)
  }

  async function subirFoto(angulo, file) {
    setUploadingAngulo(angulo)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const endpoint = contenedorUid
        ? `/especimenes/evolucion/${registroId}/fotos/${angulo}/bulk-contenedor`
        : `/especimenes/evolucion/${registroId}/fotos/${angulo}`

      await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    } catch (e) {
      alert(`Error subiendo foto (${angulo}): ` + e.message)
    } finally {
      setUploadingAngulo(null)
    }
  }

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{contenedorUid ? `Registro Grupal: ${contenedorUid}` : 'Nuevo Registro de Evolución'}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <span className={`badge ${step === 1 ? 'badge--primary' : 'badge--outline'}`}>1. Medidas</span>
           <span className={`badge ${step === 2 ? 'badge--primary' : 'badge--outline'}`}>2. Fotos</span>
        </div>
      </div>

      {step === 1 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
             <div className="input-group">
                <label>Num Hojas</label>
                <input type="number" value={form.num_hojas} onChange={e => set('num_hojas', e.target.value)} />
             </div>
             <div className="input-group">
                <label>Num Brotes</label>
                <input type="number" value={form.num_brotes} onChange={e => set('num_brotes', e.target.value)} />
             </div>
          </div>
          <div className="input-group">
             <label>Notas del grupo</label>
             <textarea value={form.notas} onChange={e => set('notas', e.target.value)} rows={3} placeholder="Describa el estado general..." />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
             <button className="btn btn--ghost" onClick={onCancel} style={{ flex: 1 }}>Cancelar</button>
             <button className="btn btn--primary" onClick={guardarMedidas} disabled={loading} style={{ flex: 2 }}>
               {loading ? 'Guardando...' : 'Siguiente: Tomar Fotos'}
             </button>
          </div>
        </>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <p className="text-muted" style={{ fontSize: '0.9rem' }}>La foto se aplicará a TODOS los sujetos del contenedor.</p>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
             {ANGULOS.map(ang => (
               <div key={ang} onClick={() => fileRefs.current[ang].click()} style={{
                 aspectRatio: '1', border: '2px dashed var(--theme-border)', borderRadius: '8px',
                 display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                 cursor: 'pointer', position: 'relative', overflow: 'hidden',
                 background: fotos[ang] ? 'none' : 'var(--theme-surface)'
               }}>
                 {fotos[ang] ? (
                   <img src={fotos[ang].preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <>
                     <span style={{ fontSize: '1.5rem' }}>📷</span>
                     <span style={{ fontSize: '0.7rem' }}>{ANGULO_LABEL[ang]}</span>
                   </>
                 )}
                 {uploadingAngulo === ang && (
                   <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                     ⏳
                   </div>
                 )}
                 <input type="file" ref={el => fileRefs.current[ang] = el} onChange={e => handleFileChange(ang, e.target.files[0])} style={{ display: 'none' }} accept="image/*" />
               </div>
             ))}
           </div>
           <button className="btn btn--secondary" onClick={onSaved} style={{ marginTop: '1rem' }}>Finalizar Registro</button>
        </div>
      )}
    </div>
  )
}
