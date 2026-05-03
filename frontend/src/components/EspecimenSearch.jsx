import { useState, useEffect } from 'react'
import { api } from '../api/client'
import QRScanner from './QRScanner'

export default function EspecimenSearch({ label, value, onChange, noMargin }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedUid, setSelectedUid] = useState('')
  const [isScanning, setIsScanning] = useState(false)

  // Fetch initial UID if ID is provided but we don't have the UID string yet
  useEffect(() => {
    if (value && value !== '') {
      if (selectedUid === '') {
        api.get(`/especimenes/${value}`).then(e => {
          setSelectedUid(e.uid)
          setQuery(e.uid)
        }).catch(err => {
            console.error("Error fetching parent UID:", err)
            // If fetching fails, at least show the ID or nothing
        })
      }
    } else {
      setSelectedUid('')
      setQuery('')
    }
  }, [value])

  const search = async (q) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    try {
      // In a real scenario, this should be a search endpoint
      const data = await api.get('/especimenes')
      const filtered = data.filter(e =>
        e.uid.toLowerCase().includes(q.toLowerCase()) ||
        e.especie.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5)
      setResults(filtered)
    } catch { setResults([]) }
  }

  const select = (e) => {
    onChange(e.id)
    setSelectedUid(e.uid)
    setResults([])
    setQuery(e.uid)
  }

  const handleScanResult = async (qrText) => {
    setIsScanning(false)
    try {
      const result = await api.get(`/scan/${encodeURIComponent(qrText)}`)
      if (result.tipo === 'especimen') {
        select(result.especimen)
      } else {
        alert('El QR escaneado no pertenece a un espécimen válido.')
      }
    } catch (err) {
      alert('Error al escanear: ' + err.message)
    }
  }

  return (
    <div className="form-group" style={{ position: 'relative', ...(noMargin ? { marginBottom: 0 } : {}) }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <label style={{ margin: 0 }}>{label}</label>
        <button
          type="button"
          onClick={() => setIsScanning(true)}
          style={{ background: 'none', border: 'none', color: 'var(--theme-primary)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}
          title="Escanear QR de planta"
        >
          📷
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={e => search(e.target.value)}
          placeholder="Buscar UID o escanear..."
          style={{ paddingRight: selectedUid ? '32px' : '8px' }}
        />

        {selectedUid && query === selectedUid && (
          <button
            type="button"
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '1.1rem' }}
            onClick={() => { onChange(''); setQuery(''); setSelectedUid(''); }}
          >
            ✕
          </button>
        )}
      </div>

      {results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--theme-surface)', border: '1px solid var(--theme-border)', borderRadius: 'var(--radius-base)', zIndex: 10, marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {results.map(r => (
            <div key={r.id} style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', borderBottom: '1px solid var(--theme-border)', fontSize: '0.9rem' }} onClick={() => select(r)}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'bold' }}>{r.uid}</span>
                <span className="text-muted" style={{ fontSize: '0.7rem' }}>{r.especie}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isScanning && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <h3 style={{ color: 'white', marginBottom: '1rem' }}>Escanear QR de {label}</h3>
          <div style={{ width: '100%', maxWidth: '400px', aspectRatio: '1', overflow: 'hidden', borderRadius: '1rem' }}>
            <QRScanner onResult={handleScanResult} onError={(msg) => { alert(msg); setIsScanning(false); }} />
          </div>
          <button className="btn btn--ghost" style={{ marginTop: '2rem', color: 'white' }} onClick={() => setIsScanning(false)}>Cancelar</button>
        </div>
      )}
    </div>
  )
}
