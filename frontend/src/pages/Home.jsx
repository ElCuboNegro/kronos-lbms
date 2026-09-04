import { useEffect, useState } from 'react'
import { api } from '../api/client'

const HOY = new Date().toISOString().slice(0, 10)

export default function Home() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [abierto, setAbierto] = useState(null)     // especimen_id con el formulario abierto
  const [tipo, setTipo] = useState('bacteriana')   // bacteriana | hongo
  const [fecha, setFecha] = useState(HOY)

  async function cargar() {
    setError(null)
    try {
      setData(await api.get('/diagnostico'))
    } catch (e) {
      setError(e.message || 'No se pudo cargar el diagnóstico')
    }
  }
  useEffect(() => { cargar() }, [])

  function abrirMarcar(especimen_id) {
    setAbierto(especimen_id)
    setTipo('bacteriana')
    setFecha(HOY)
  }

  async function confirmarMarcar(especimen_id) {
    if (enviando) return
    setEnviando(true)
    try {
      await api.post('/eventos', {
        tipo: 'contaminacion',
        descripcion: 'Marcado como contaminado desde el tablero de diagnóstico',
        especimen_id,
        meta: { contaminacion: 'confirmada', tipo_contaminante: tipo, fecha_deteccion: fecha },
      })
      setAbierto(null)
      await cargar()
    } finally {
      setEnviando(false)
    }
  }

  async function deshacer(especimen_id) {
    if (enviando) return
    setEnviando(true)
    try {
      await api.post('/eventos', {
        tipo: 'observacion',
        descripcion: 'Marca de contaminación deshecha desde el tablero',
        especimen_id,
        meta: { contaminacion: 'descartada' },
      })
      await cargar()
    } finally {
      setEnviando(false)
    }
  }

  if (error) return (
    <div style={s.wrap}>
      <div style={s.aviso}>{error}</div>
      <button style={s.btn} onClick={cargar}>Reintentar</button>
    </div>
  )
  if (!data) return <div style={s.wrap}><p style={s.muted}>Cargando tu diagnóstico…</p></div>

  const { recordatorio_revision: rec, alertas, metodo_resultado, mejor_metodo, germinacion_crecimiento } = data

  const accionesMarcar = (it) => (
    abierto === it.especimen_id
      ? <FormMarcar tipo={tipo} setTipo={setTipo} fecha={fecha} setFecha={setFecha}
                    enviando={enviando}
                    onConfirmar={() => confirmarMarcar(it.especimen_id)}
                    onCancelar={() => setAbierto(null)} />
      : <button style={s.btnMini} onClick={() => abrirMarcar(it.especimen_id)}>Marcar contaminado</button>
  )

  return (
    <div style={s.wrap}>
      {rec?.activo && <div style={s.recordatorio}>🗓️ {rec.mensaje}</div>}

      <section style={s.card}>
        <h3 style={s.h3}>① Lo que necesita tu atención</h3>
        <Bloque titulo="🔴 Contaminación" items={alertas.contaminacion}
                render={(a) => `${a.uid} — ${a.especie} (${a.estado})`
                  + (a.tipo_contaminante ? ` · ${etiquetaContaminante(a.tipo_contaminante)}` : '')
                  + (a.fecha ? ` · detectado ${a.fecha}` : '')}
                acciones={(a) => (
                  <button style={s.btnUndo} disabled={enviando}
                          onClick={() => deshacer(a.especimen_id)}>Deshacer</button>)} />
        <Bloque titulo="🟡 Germinación tardía" items={alertas.germinacion_tardia}
                render={(a) => `${a.uid} — ${a.especie}: ${a.dias} días (esperado ${a.esperado})`}
                acciones={accionesMarcar} />
        <Bloque titulo="🔵 Sin revisar" items={alertas.sin_revisar}
                render={(a) => `${a.uid} — ${a.especie}: ${a.dias_sin_registro} días sin registro`}
                acciones={accionesMarcar} />
      </section>

      <section style={s.card}>
        <h3 style={s.h3}>② Método de desinfección ↔ resultado</h3>
        {mejor_metodo && (
          <p style={s.mejor}>🏆 El mejor método con tus datos: <b>{mejor_metodo.metodo}</b> ({mejor_metodo.motivo})</p>)}
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

function Bloque({ titulo, items, render, acciones }) {
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <div style={s.bloqueTitulo}>{titulo}</div>
      {items.length === 0
        ? <p style={s.muted}>Nada pendiente.</p>
        : items.map((it) => (
            <div key={it.especimen_id} style={s.item}>
              <span>{render(it)}</span>
              {acciones && <span style={s.acciones}>{acciones(it)}</span>}
            </div>))}
    </div>
  )
}

function FormMarcar({ tipo, setTipo, fecha, setFecha, onConfirmar, onCancelar, enviando }) {
  return (
    <span style={s.form}>
      <button style={tipo === 'bacteriana' ? s.chipOn : s.chip}
              onClick={() => setTipo('bacteriana')}>Bacterias</button>
      <button style={tipo === 'hongo' ? s.chipOn : s.chip}
              onClick={() => setTipo('hongo')}>Hongos</button>
      <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={s.fecha} />
      <button style={s.btnMini} disabled={enviando} onClick={onConfirmar}>Confirmar</button>
      <button style={s.btnCancel} onClick={onCancelar}>Cancelar</button>
    </span>
  )
}

function etiquetaEstado(e) {
  return { a_tiempo: 'a tiempo', lento: 'lento', por_definir: 'por definir' }[e] || e
}

function etiquetaContaminante(t) {
  return { bacteriana: 'bacterias', hongo: 'hongos' }[t] || t
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
  acciones: { display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 },
  form: { display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' },
  chip: { background: '#24382a', color: '#cfe9d6', border: '1px solid #3a5a44', borderRadius: 6,
          padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' },
  chipOn: { background: '#4a8c5c', color: '#fff', border: '1px solid #4a8c5c', borderRadius: 6,
            padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  fecha: { background: '#0f1f13', color: '#eafff0', border: '1px solid #3a5a44', borderRadius: 6,
           padding: '0.15rem 0.35rem', fontSize: '0.8rem' },
  hallazgo: { color: '#eafff0', margin: '0.2rem 0' },
  mejor: { color: '#eafff0', background: '#24382a', border: '1px solid #4a8c5c', borderRadius: 8,
           padding: '0.5rem 0.7rem', margin: '0 0 0.5rem' },
  fila: { color: '#eafff0', margin: '0.2rem 0' },
  muted: { color: '#7f9c86', fontSize: '0.9rem', margin: '0.2rem 0' },
  aviso: { background: '#3a1e1e', color: '#ffd6d6', padding: '0.8rem', borderRadius: 8 },
  btn: { background: '#4a8c5c', color: '#fff', border: 'none', borderRadius: 8,
         padding: '0.5rem 1rem', cursor: 'pointer', alignSelf: 'flex-start' },
  btnMini: { background: '#7a2d2d', color: '#fff', border: 'none', borderRadius: 6,
             padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' },
  btnUndo: { background: '#3a5a44', color: '#eafff0', border: 'none', borderRadius: 6,
             padding: '0.25rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap' },
  btnCancel: { background: 'transparent', color: '#7f9c86', border: '1px solid #3a5a44', borderRadius: 6,
               padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' },
}
