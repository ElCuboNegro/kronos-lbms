import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function ProtocolosList() {
  const navigate = useNavigate()
  const [protocolos, setProtocolos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function fetchProtocolos() {
    try {
      const data = await api.get('/protocolos')
      setProtocolos(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProtocolos()
  }, [])

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const res = await fetch('/api/protocolos/extract', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || 'Error en la extracción AI')

      navigate('/protocolos/nuevo', { state: { draft: json } })

    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="page-header" style={{ marginBottom: 0 }}>
        <h2 className="page-title text-primary" style={{ margin: 0 }}>Protocolos</h2>
        <button className="btn btn--primary" onClick={() => navigate('/protocolos/nuevo')}>+ Nuevo Manualmente</button>
      </div>

      <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>
        Procedimientos, metodologías y validaciones estandarizadas del laboratorio.
      </p>

      {/* AI Importer Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(125, 202, 143, 0.05)', border: '1px solid var(--theme-secondary)' }}>
        <h3 className="text-primary" style={{ margin: 0, fontSize: '1rem' }}>🤖 Importación AI</h3>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>
          Sube una foto o un PDF de un protocolo impreso. Nuestra IA extraerá los materiales y pasos, y abrirá el editor para que puedas validarlos y usar formato Wikilinks.
        </p>

        {error && <p className="text-danger" style={{ fontSize: '0.85rem', margin: 0 }}>{error}</p>}

        <div>
          <input
            type="file"
            id="protocolo-upload"
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <label
            htmlFor="protocolo-upload"
            className="btn btn--secondary"
            style={{ display: 'inline-block', width: '100%', textAlign: 'center', cursor: 'pointer' }}
          >
            {uploading ? 'Extrayendo datos...' : 'Subir Documento / Imagen'}
          </label>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-muted" style={{ padding: '2rem 0' }}>Cargando protocolos...</p>
      ) : protocolos.length === 0 ? (
        <p className="text-center text-muted" style={{ padding: '2rem 0' }}>No hay protocolos registrados.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {protocolos.map(p => (
            <div key={p.id} className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>{p.tipo.replace(/_/g, ' ')}</span>
                <span className={`badge ${p.estado_validacion === 'validado' ? 'badge--success' : 'badge--warning'}`}>
                  {p.estado_validacion}
                </span>
              </div>
              <h4 className="text-primary" style={{ margin: '0 0 0.2rem', fontSize: '1.1rem' }}>{p.nombre}</h4>
              <p className="text-muted" style={{ margin: '0 0 1rem', fontSize: '0.8rem' }}>Versión: {p.version}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn--primary" style={{ flex: 1 }} onClick={() => navigate(`/protocolos/${p.id}/ejecutar`)}>
                  ▶ Ejecutar
                </button>
                <button className="btn btn--ghost" onClick={() => navigate(`/protocolos/${p.id}`)}>
                  Ver / Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
