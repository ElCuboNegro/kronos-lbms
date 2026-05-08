import { useState, useRef, useEffect } from 'react'
import { api } from '../api/client'

const ANGULOS = ['arriba', 'frente', 'atras', 'izquierda', 'derecha']
const ANGULO_LABEL = { arriba: 'Arriba', frente: 'Frente', atras: 'Atrás', izquierda: 'Izquierda', derecha: 'Derecha' }

export default function RegistroEvolucionForm({ especimenId, contenedorUid, onSaved, onCancel, initialStep = 1 }) {
  const [step, setStep] = useState(initialStep)
  const [form, setForm] = useState({
    num_hojas: '', num_brotes: '', notas: ''
  })
  const [fotos, setFotos] = useState({})
  const [registroId, setRegistroId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploadingAngulo, setUploadingAngulo] = useState(null)
  const [error, setError] = useState('')
  const fileRefs = useRef({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const int = v => v === '' ? undefined : parseInt(v)

  async function guardarMedidas() {
    setLoading(true)
    setError('')
    try {
      const payload = {
        notas: form.notas || undefined,
        num_hojas: int(form.num_hojas),
        num_brotes: int(form.num_brotes),
        fecha: new Date().toISOString().split('T')[0]
      }

      let res;
      if (contenedorUid) {
        res = await api.post(`/especimenes/contenedores/${contenedorUid}/evolucion`, payload)
        setRegistroId(res[0].id)
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
        ? `/especimenes/evolucion-grupal/${registroId}/fotos/${angulo}`
        : `/especimenes/evolucion/${registroId}/fotos/${angulo}`

      await api.post(endpoint, formData)
    } catch (e) {
      alert(`Error subiendo foto (${angulo}): ` + e.message)
    } finally {
      setUploadingAngulo(null)
    }
  }

  return (
    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--theme-border)', paddingBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{contenedorUid ? `Frasco: ${contenedorUid}` : 'Nueva Evolución'}</h3>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
           <button
             onClick={() => registroId && setStep(1)}
             className={`btn ${step === 1 ? 'btn--primary' : 'btn--ghost'}`}
             style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '12px' }}
           >1. Medidas</button>
           <button
             onClick={() => registroId && setStep(2)}
             className={`btn ${step === 2 ? 'btn--primary' : 'btn--ghost'}`}
             style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '12px' }}
             disabled={!registroId}
           >2. Fotos</button>
        </div>
      </div>

      {error && <p className="badge badge--danger" style={{ textAlign: 'center' }}>{error}</p>}

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div className="input-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Num Hojas (Promedio)</label>
                <input
                  type="number"
                  value={form.num_hojas}
                  onChange={e => set('num_hojas', e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
                />
             </div>
             <div className="input-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Num Brotes</label>
                <input
                  type="number"
                  value={form.num_brotes}
                  onChange={e => set('num_brotes', e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--theme-border)' }}
                />
             </div>
          </div>
          <div className="input-group">
             <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Notas del Grupo</label>
             <textarea
               value={form.notas}
               onChange={e => set('notas', e.target.value)}
               rows={3}
               placeholder="Estado de la biomasa, callos, etc..."
               style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--theme-border)', fontFamily: 'inherit' }}
             />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
             <button className="btn btn--ghost" onClick={onCancel} style={{ flex: 1 }}>Cancelar</button>
             <button className="btn btn--primary" onClick={guardarMedidas} disabled={loading} style={{ flex: 2, padding: '1rem' }}>
               {loading ? 'Creando registros...' : 'Confirmar y Tomar Fotos →'}
             </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
           <div style={{ background: 'var(--theme-background)', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--theme-primary)', fontWeight: 600 }}>📸 Modo Cámara Grupal</p>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--theme-text-muted)' }}>Las fotos capturadas se sincronizarán con los 6 sujetos de este frasco.</p>
           </div>

           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             {ANGULOS.slice(0,4).map(ang => (
               <div key={ang} onClick={() => fileRefs.current[ang].click()} style={{
                 aspectRatio: '1', border: '2px dashed var(--theme-border)', borderRadius: '12px',
                 display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                 cursor: 'pointer', position: 'relative', overflow: 'hidden',
                 background: fotos[ang] ? 'none' : 'var(--theme-surface)'
               }}>
                 {fotos[ang] ? (
                   <img src={fotos[ang].preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                   <>
                     <span style={{ fontSize: '2rem' }}>📷</span>
                     <span style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem' }}>{ANGULO_LABEL[ang]}</span>
                   </>
                 )}
                 {uploadingAngulo === ang && (
                   <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-primary)', fontWeight: 'bold' }}>
                     SUBIENDO...
                   </div>
                 )}
                 <input type="file" ref={el => fileRefs.current[ang] = el} onChange={e => handleFileChange(ang, e.target.files[0])} style={{ display: 'none' }} accept="image/*" capture="environment" />
               </div>
             ))}
           </div>
           <button className="btn btn--secondary" onClick={onSaved} style={{ padding: '1rem', fontWeight: 'bold', borderRadius: '12px' }}>
             ✅ FINALIZAR Y GUARDAR TODO
           </button>
        </div>
      )}
    </div>
  )
}
