import { useState, useEffect } from 'react'
import { api } from '../api/client'

export default function VoiceController() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return alert("Tu navegador no soporta comandos de voz.")

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-MX'
    recognition.onstart = () => setIsListening(true)
    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript
      setTranscript(text)

      // Enviar comando al backend
      try {
        const res = await api.post('/agent/command', {
          text,
          context_url: window.location.pathname
        })
        if (res.msg) {
           // Usar síntesis de voz para responder
           const utterance = new SpeechSynthesisUtterance(res.msg)
           window.speechSynthesis.speak(utterance)
        }
      } catch (e) { console.error(e) }
    }
    recognition.onend = () => setIsListening(false)
    recognition.start()
  }

  return (
    <div style={{ position: 'fixed', bottom: '80px', right: '1rem', zIndex: 100 }}>
       <button
         onClick={startListening}
         className={`btn ${isListening ? 'btn--danger' : 'btn--secondary'}`}
         style={{ borderRadius: '50%', width: '60px', height: '60px', boxShadow: 'var(--shadow-base)' }}
       >
         {isListening ? '🛑' : '🎙️'}
       </button>
       {transcript && (
         <div style={{ position: 'absolute', bottom: '70px', right: 0, background: 'rgba(0,0,0,0.8)', color: 'white', padding: '0.5rem', borderRadius: '8px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
           "{transcript}"
         </div>
       )}
    </div>
  )
}
