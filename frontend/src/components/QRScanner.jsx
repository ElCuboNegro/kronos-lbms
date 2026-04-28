import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QRScanner({ onResult, onError }) {
  const scannerRef = useRef(null)
  const divId = 'qr-reader'
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const scanner = new Html5Qrcode(divId)
    scannerRef.current = scanner

    let isStopping = false
    let isMounted = true

    const stopScanner = async () => {
      if (isStopping) return
      isStopping = true
      try {
        if (scanner.getState() === 2 || scanner.getState() === 3) { // SCANNING or PAUSED
          await scanner.stop()
        }
      } catch (err) {
        if (err && typeof err === 'string' && !err.includes('not running')) {
          console.warn('Error stopping scanner:', err)
        } else if (err instanceof Error && !err.message.includes('not running')) {
          console.warn('Error stopping scanner:', err)
        }
      }
    }

    scanner.start(
      { facingMode: 'environment' },
      { fps: 15, qrbox: { width: 250, height: 250 } },
      (text) => {
        if (isMounted) {
          try {
             if (scanner.getState() === 2) {
               scanner.pause()
             }
          } catch(e) { /* ignore */ }
          
          setFlash(true)

          // Audio feedback (beep)
          try {
            const AudioContext = window.AudioContext || window.webkitAudioContext
            if (AudioContext) {
              const ctx = new AudioContext()
              const osc = ctx.createOscillator()
              const gain = ctx.createGain()
              osc.connect(gain)
              gain.connect(ctx.destination)
              osc.type = 'sine'
              osc.frequency.value = 880 // A5 note
              gain.gain.value = 0.1
              osc.start()
              osc.stop(ctx.currentTime + 0.1)
            }
          } catch(e) { /* ignore audio errors */ }
          
          // Delay onResult slightly so user sees the flash
          setTimeout(() => {
            if (isMounted) onResult(text)
          }, 350)
        }
      },
      () => {}
    ).then(() => {
      if (!isMounted) stopScanner()
    }).catch((err) => {
      if (isMounted) {
        onError?.(err?.message || 'No se pudo acceder a la cámara')
      }
    })

    return () => {
      isMounted = false
      stopScanner()
    }
  }, [])

  return (
    <div style={s.wrap}>
      <div style={s.container}>
        <div id={divId} style={{ ...s.reader, borderColor: flash ? '#4ade80' : '#2d7a47' }} />
        {flash && <div style={s.flashOverlay}></div>}
      </div>
      <p style={s.hint}>{flash ? '¡Código detectado!' : 'Apunta al código QR de la etiqueta'}</p>
    </div>
  )
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  container: { position: 'relative', width: '100%', maxWidth: 320 },
  reader: { width: '100%', borderRadius: 12, overflow: 'hidden', border: '3px solid #2d7a47', transition: 'border-color 0.2s' },
  flashOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(74, 222, 128, 0.4)', borderRadius: 12, zIndex: 10, pointerEvents: 'none' },
  hint: { color: '#4a8c5c', fontSize: '0.95rem', margin: 0, fontWeight: 600, minHeight: '1.2rem' },
}
