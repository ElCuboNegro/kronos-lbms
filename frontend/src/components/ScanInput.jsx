import { useState } from 'react'
import QRScanner from './QRScanner'

export default function ScanInput({ value, onChange, placeholder, style, type = "text", required, className }) {
  const [showScanner, setShowScanner] = useState(false)

  const handleScan = (code) => {
    setShowScanner(false)
    onChange(code)
  }

  return (
    <>
      <div style={{ display: 'flex', width: '100%', position: 'relative', alignItems: 'center' }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={className}
          style={{ ...style, flex: 1, paddingRight: '2.5rem' }}
        />
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          title="Escanear Código"
          style={{
            position: 'absolute',
            right: '4px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--theme-primary)'
          }}>
          📷
        </button>
      </div>

      {showScanner && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#000' }}>
          <QRScanner onResult={handleScan} />
          <button
            type="button"
            className="btn btn--secondary"
            style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10000 }}
            onClick={() => setShowScanner(false)}
          >
            Cancelar Escaneo
          </button>
        </div>
      )}
    </>
  )
}
