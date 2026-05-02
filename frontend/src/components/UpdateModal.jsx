import { useState, useEffect } from 'react'
import { api } from '../api/client'
import pkg from '../../package.json'

export default function UpdateModal() {
  const [release, setRelease] = useState(null)
  const [show, setShow] = useState(false)
  const currentVersion = pkg.version

  useEffect(() => {
    // Solo chequear en entornos que no sean localhost si se prefiere,
    // pero para pruebas lo dejamos siempre activo.
    async function checkVersion() {
      try {
        const info = await api.get('/app/release-info')
        if (isNewer(info.version, currentVersion)) {
          setRelease(info)
          setShow(true)
        }
      } catch (err) {
        console.error('Error checking for updates:', err)
      }
    }
    checkVersion()
  }, [])

  // Función simple para comparar versiones semánticas (X.Y.Z)
  function isNewer(remote, local) {
    const r = remote.split('.').map(Number)
    const l = local.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      if (r[i] > l[i]) return true
      if (r[i] < l[i]) return false
    }
    return false
  }

  if (!show || !release) return null

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚀</div>
        <h2 style={{ margin: '0 0 0.5rem', color: 'var(--theme-primary)' }}>Nueva versión disponible</h2>
        <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--theme-text-muted)' }}>
          Hay una actualización lista ({release.version}). Tu versión actual es la {currentVersion}.
        </p>

        {release.notes && (
          <div style={s.notes}>
            <strong>Novedades:</strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>{release.notes}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', marginTop: '1.5rem' }}>
          <a
            href={release.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--primary"
            style={{ textAlign: 'center', textDecoration: 'none' }}
          >
            Actualizar ahora (APK)
          </a>
          {!release.required && (
            <button
              className="btn btn--ghost"
              onClick={() => setShow(false)}
            >
              Más tarde
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1.5rem'
  },
  modal: {
    background: 'var(--theme-surface)',
    borderRadius: '24px',
    padding: '2rem',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    border: '1px solid var(--theme-border)'
  },
  notes: {
    background: 'var(--theme-background)',
    padding: '0.75rem 1rem',
    borderRadius: '12px',
    textAlign: 'left',
    width: '100%',
    color: 'var(--theme-text)'
  }
}
