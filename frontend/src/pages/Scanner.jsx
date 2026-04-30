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
    <div className="page-container" style={{display:'flex',flexDirection:'column',gap:'1.25rem',alignItems:'center',minHeight:'80dvh',justifyContent:'center'}}>
      <h2 className="page-title" style={{color:'var(--bio-primary)',margin:0,fontSize:'1.3rem',position:'absolute',top:'1.5rem',left:'1.5rem'}}>Escanear etiqueta</h2>
      
      {scanning && !loading && !error && (
        <QRScanner
          onResult={handleResult}
          onError={(msg) => { setError(msg); setScanning(false) }}
        />
      )}

      {loading && <p style={{color:'var(--bio-secondary)',fontSize:'1rem'}}>Identificando…</p>}

      {scanResult && (
        <div className="card" style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{scanResult.tipo === 'especimen' ? '🌿' : '🧪'}</div>
          <h3 style={{ color: 'var(--theme-text)', margin: '0 0 0.5rem', textAlign: 'center', fontSize: '1.2rem' }}>
            {scanResult.tipo === 'especimen' ? scanResult.especimen.especie : scanResult.elemento.descripcion}
          </h3>
          <p className="font-mono" style={{ color: 'var(--theme-primary)', margin: '0 0 1.5rem', fontSize: '0.9rem' }}>UID: {scanResult.tipo === 'especimen' ? scanResult.especimen.uid : scanResult.elemento.element_id}</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginBottom: '1rem' }}>
            <button className="btn btn--primary btn--block" onClick={() => navigate(scanResult.tipo === 'especimen' ? `/especimen/${scanResult.especimen.id}` : `/elemento/${scanResult.elemento.id}`)}>
              Ver Ficha
            </button>
            {scanResult.tipo === 'especimen' && (
              <button className="btn btn--accent btn--block" onClick={() => navigate(`/especimen/${scanResult.especimen.id}?quick=foto`)}>
                📸 Añadir Foto / Evo
              </button>
            )}
          </div>
          
          <button className="btn btn--ghost btn--block" onClick={reset}>Escanear otro</button>
        </div>
      )}

      {error && (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
          <p style={{color:'var(--error)',margin:0,textAlign:'center'}}>{error}</p>
          
          {isUnknownUid && (
            <button 
              className="btn btn--secondary btn--block"
              onClick={() => navigate(`/nuevo-individuo?uid=${encodeURIComponent(uidClean)}`)}
            >
              Registrar este espécimen
            </button>
          )}

          <button className="btn btn--primary btn--block" onClick={reset}>
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}

