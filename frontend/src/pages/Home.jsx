import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Home() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [marcando, setMarcando] = useState(false)

  async function cargar() {
    setError(null)
    try {
      setData(await api.get('/diagnostico'))
    } catch (e) {
      setError(e.message || 'No se pudo cargar el diagnóstico')
    }
  }
  useEffect(() => { cargar() }, [])

  async function marcarContaminado(especimen_id) {
    if (marcando) return
    setMarcando(true)
    try {
      await api.post('/eventos', {
        tipo: 'contaminacion',
        descripcion: 'Marcado como contaminado desde el tablero de diagnóstico',
        especimen_id,
        meta: { contaminacion: 'confirmada' },
      })
      await cargar()
    } finally {
      setMarcando(false)
    }
  }

  if (error) return (
    <div style={s.wrap}>
      <div style={s.aviso}>{error}</div>
      <button style={s.btn} onClick={cargar}>Reintentar</button>
    </div>
  )
  if (!data) return <div style={s.wrap}><p style={s.muted}>Cargando tu diagnóstico…</p></div>

  const { recordatorio_revision: rec, alertas, metodo_resultado, germinacion_crecimiento } = data

  return (
    <div style={s.wrap}>
      {rec?.activo && <div style={s.recordatorio}>🗓️ {rec.mensaje}</div>}

      <section style={s.card}>
        <h3 style={s.h3}>① Lo que necesita tu atención</h3>
        <Bloque titulo="🔴 Contaminación" items={alertas.contaminacion}
                render={(a) => `${a.uid} — ${a.especie} (${a.estado})`} />
        <Bloque titulo="🟡 Germinación tardía" items={alertas.germinacion_tardia}
                render={(a) => `${a.uid} — ${a.especie}: ${a.dias} días (esperado ${a.esperado})`}
                onMarcar={marcarContaminado} marcando={marcando} />
        <Bloque titulo="🔵 Sin revisar" items={alertas.sin_revisar}
                render={(a) => `${a.uid} — ${a.especie}: ${a.dias_sin_registro} días sin registro`}
                onMarcar={marcarContaminado} marcando={marcando} />
      </section>

      <section style={s.card}>
        <h3 style={s.h3}>② Método de desinfección ↔ resultado</h3>
        {metodo_resultado.length === 0
          ? <p style={s.muted}>Aún no hay datos de métodos.</p>
          : metodo_resultado.map((m) => <p key={m.metodo} style={s.hallazgo}>• {m.hallazgo}</p>)}
      </section>

      <section style={s.card}>
        <h3 style={s.h3}>③ Germinación y crecimiento</h3>
        {germinacion_crecimiento.length === 0
          ? <p style={s.muted}>Aún no hay cultivos para mostrar.</p>
          : germinacion_crecimiento.map((g) => (
              <p key={g.especie} style={s.fila}>
                {g.especie}: {g.germinadas}/{g.total} germinadas
                {g.altura_mm != null ? `, ${g.altura_mm} mm` : ''} — {etiquetaEstado(g.estado_crecimiento)}
              </p>))}
      </section>
    </div>
  )
}

function Bloque({ titulo, items, render, onMarcar, marcando }) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <div style={s.bloqueTitulo}>{titulo}</div>
      {items.length === 0
        ? <p style={s.muted}>Nada pendiente.</p>
        : items.map((it) => (
            <div key={it.especimen_id} style={s.item}>
              <span>{render(it)}</span>
              {onMarcar && (
                <button style={s.btnMini} disabled={marcando}
                        onClick={() => onMarcar(it.especimen_id)}>
                  Marcar contaminado
                </button>)}
            </div>))}
    </div>
  )
}

function etiquetaEstado(e) {
  return { a_tiempo: 'a tiempo', lento: 'lento', por_definir: 'por definir' }[e] || e
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  recordatorio: { background: '#2d7a47', color: '#eafff0', padding: '0.8rem 1rem',
                  borderRadius: 8, fontWeight: 600 },
  card: { background: '#1a2e1e', border: '1px solid #234', borderRadius: 10, padding: '1rem' },
  h3: { color: '#7dca8f', margin: '0 0 0.6rem' },
  bloqueTitulo: { color: '#cfe9d6', fontWeight: 600, marginBottom: '0.2rem' },
  item: { color: '#eafff0', padding: '0.25rem 0', borderBottom: '1px solid #234',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' },
  btnMini: { background: '#7a2d2d', color: '#fff', border: 'none', borderRadius: 6,
             padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' },
  hallazgo: { color: '#eafff0', margin: '0.2rem 0' },
  fila: { color: '#eafff0', margin: '0.2rem 0' },
  muted: { color: '#7f9c86', fontSize: '0.9rem', margin: '0.2rem 0' },
  aviso: { background: '#3a1e1e', color: '#ffd6d6', padding: '0.8rem', borderRadius: 8 },
  btn: { background: '#4a8c5c', color: '#fff', border: 'none', borderRadius: 8,
         padding: '0.5rem 1rem', cursor: 'pointer', alignSelf: 'flex-start' },
}
