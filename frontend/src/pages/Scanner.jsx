import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import QRScanner from '../components/QRScanner'

export default function Scanner() {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastScan, setLastScan] = useState('')
  const [scanResult, setScanResult] = useState(null)

  async function handleResult(qrText) {
    setScanning(false)
    setLoading(true)
    setError('')
    setLastScan(qrText)
    try {
      const result = await api.get(`/scan/${encodeURIComponent(qrText)}`)
      if (result.tipo === 'especimen' || result.tipo === 'elemento') {
        setScanResult(result)
      } else {
        setError('QR no reconocido por el sistema')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isUnknownUid = error && error.toLowerCase().includes('no encontrado') && lastScan?.startsWith('UID:')
  const uidClean = isUnknownUid ? lastScan.substring(4) : ''

  const reset = () => {
    setScanResult(null)
    setError('')
    setScanning(true)
    setLastScan('')
  }

  return (
    <div style={s.page}>
      <h2 style={s.title}>Escanear etiqueta</h2>
      
      {scanning && !loading && !error && (
        <QRScanner
          onResult={handleResult}
          onError={(msg) => { setError(msg); setScanning(false) }}
        />
      )}

      {loading && <p style={s.status}>Identificando…</p>}

      {scanResult && (
        <div style={s.resultBox}>
          <div style={s.resultIcon}>{scanResult.tipo === 'especimen' ? '🌿' : '🧪'}</div>
          <h3 style={s.resultTitle}>
            {scanResult.tipo === 'especimen' ? scanResult.especimen.especie : scanResult.elemento.descripcion}
          </h3>
          <p style={s.resultUid}>UID: {scanResult.tipo === 'especimen' ? scanResult.especimen.uid : scanResult.elemento.element_id}</p>
          
          <div style={s.actionGrid}>
            <button style={s.btnPrimary} onClick={() => navigate(scanResult.tipo === 'especimen' ? `/especimen/${scanResult.especimen.id}` : `/elemento/${scanResult.elemento.id}`)}>
              Ver Ficha
            </button>
            {scanResult.tipo === 'especimen' && (
              <button style={s.btnAccent} onClick={() => navigate(`/especimen/${scanResult.especimen.id}?quick=foto`)}>
                📸 Añadir Foto / Evo
              </button>
            )}
          </div>
          
          <button style={s.btnMuted} onClick={reset}>Escanear otro</button>
        </div>
      )}

      {error && (
        <div style={s.errorBox}>
          <p style={s.errorText}>{error}</p>
          
          {isUnknownUid && (
            <button 
              style={s.createBtn} 
              onClick={() => navigate(`/nuevo-individuo?uid=${encodeURIComponent(uidClean)}`)}
            >
              Registrar este espécimen
            </button>
          )}

          <button style={s.retry} onClick={reset}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center', minHeight: '80dvh', justifyContent: 'center' },
  title: { color: '#7dca8f', margin: 0, fontSize: '1.3rem', position: 'absolute', top: '1.5rem', left: '1.5rem' },
  status: { color: '#4a8c5c', fontSize: '1rem' },
  resultBox: { background: '#1a2e1e', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid #2d5c3a', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' },
  resultIcon: { fontSize: '3rem', marginBottom: '1rem' },
  resultTitle: { color: '#e0f0e5', margin: '0 0 0.5rem', textAlign: 'center', fontSize: '1.2rem' },
  resultUid: { color: '#7dca8f', fontFamily: 'monospace', margin: '0 0 1.5rem', fontSize: '0.9rem' },
  actionGrid: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginBottom: '1rem' },
  btnPrimary: { background: '#2d7a47', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  btnAccent: { background: '#7dca8f', color: '#1a2e1e', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' },
  btnMuted: { background: 'none', border: '1px solid #2d5c3a', color: '#4a8c5c', borderRadius: 10, padding: '0.6rem', fontSize: '0.85rem', cursor: 'pointer', width: '100%' },
  errorBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  errorText: { color: '#f28b82', margin: 0, textAlign: 'center' },
  retry: { background: '#2d7a47', color: '#fff', border: 'none', borderRadius: 8, padding: '0.65rem 1.5rem', fontSize: '0.95rem', cursor: 'pointer' },
  createBtn: { background: '#7dca8f', color: '#1a2e1e', border: 'none', borderRadius: 8, padding: '0.65rem 1.5rem', fontSize: '0.95rem', cursor: 'pointer', fontWeight: 'bold' },
}
