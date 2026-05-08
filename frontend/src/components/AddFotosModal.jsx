import { useState, useRef } from 'react'
import AuthImg from './AuthImg'

const ANGULOS = ['arriba', 'frente', 'atras', 'izquierda', 'derecha']
const ANGULO_LABEL = { arriba: 'Arriba', frente: 'Frente', atras: 'Atrás', izquierda: 'Izquierda', derecha: 'Derecha' }

export default function AddFotosModal({ especimenId, registro, onSaved, onCancel }) {
  const [fotos, setFotos] = useState(registro.fotos || {})
  const [uploading, setUploading] = useState(null)
  const [error, setError] = useState('')
  const fileRefs = useRef({})

  async function capturarFoto(angulo, file) {
    const preview = URL.createObjectURL(file)
    setFotos(f => ({ ...f, [angulo]: preview }))
    setUploading(angulo)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/especimenes/${especimenId}/evolucion/${registro.id}/fotos/${angulo}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Error al subir fotografía");
      }
      const newUrl = await res.json()
      setFotos(f => ({...f, [angulo]: newUrl.url}))
    } catch (err) {
      setError(`Fallo en foto ${ANGULO_LABEL[angulo]}: ${err.message}`)
      setFotos(f => {
        const copy = {...f};
        delete copy[angulo];
        return copy;
      })
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 500 }}>
        <h3 className="text-primary" style={{ marginTop: 0 }}>Fotografías del Registro</h3>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>Añade o actualiza fotos para este registro.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, margin: '1.5rem 0' }}>
          {ANGULOS.map(ang => (
            <div key={ang} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '2px dashed var(--theme-border)', position: 'relative' }}>
              <input
                type="file" accept="image/jpeg, image/png, image/webp"
                style={{ display: 'none' }}
                ref={el => fileRefs.current[ang] = el}
                onChange={e => e.target.files[0] && capturarFoto(ang, e.target.files[0])}
              />
              <div
                style={{ width: '100%', height: '100%', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--theme-surface)' }}
                onClick={() => fileRefs.current[ang].click()}
              >
                {fotos[ang] ? (
                  fotos[ang].startsWith('blob:')
                    ? <img src={fotos[ang]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <AuthImg url={`${fotos[ang]}?t=${Date.now()}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} fallback={<span style={{fontSize:'1.5rem'}}>📷</span>} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    {uploading === ang ? '⌛' : <><span style={{ fontSize: '1.5rem' }}>📷</span><span style={{ color: 'var(--theme-primary)', fontSize: '0.75rem' }}>{ANGULO_LABEL[ang]}</span></>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn--primary" onClick={onSaved}>Terminar</button>
        </div>
      </div>
    </div>
  )
}
