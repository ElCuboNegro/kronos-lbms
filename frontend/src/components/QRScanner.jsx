import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

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
      {
        fps: 15,
        qrbox: { width: 300, height: 150 }, // Wider box for 1D barcodes
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
        ]
      },
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
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12}}>
      <div style={{position:'relative',width:'100%',maxWidth:320}}>
        <div id={divId} style={{ width:'100%',borderRadius:12,overflow:'hidden',border:'3px solid var(--theme-primary)',transition:'border-color 0.2s', borderColor: flash ? '#4ade80' : 'var(--theme-primary)' }} />
        {flash && <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(74, 222, 128, 0.4)',borderRadius:12,zIndex:10,pointerEvents:'none'}}></div>}
      </div>
      <p style={{color:'var(--theme-secondary)',fontSize:'0.95rem',margin:0,fontWeight:600,minHeight:'1.2rem',textAlign:'center'}}>
        {flash ? '¡Código detectado!' : 'Apunta a un código QR o Código de Barras (EAN/UPC)'}
      </p>
    </div>
  )
}
