import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import ScanInput from './ScanInput';
import StepAccordion from './RunMode/StepAccordion';

export default function LotePreparacionForm({ formulacion, onSaved, onCancel }) {
  // Debug mount
  useEffect(() => {
    console.log("LotePreparacionForm montado para:", formulacion?.nombre);
  }, []);

  const [volumen, setVolumen] = useState(formulacion?.volumen_base_l || 1.0);
  const [concentracion, setConcentracion] = useState(1.0);
  const [phFinal, setPhFinal] = useState('');
  const [trazabilidad, setTrazabilidad] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Paso activo para el acordeón controlado
  const [activeStep, setActiveStep] = useState(1);

  if (!formulacion) return null;

  // Ratio multiplicador para escalar reactivos automáticamente
  const volNum = parseFloat(volumen) || 0;
  const baseVolNum = parseFloat(formulacion.volumen_base_l) || 1.0;
  const ratio = baseVolNum > 0 ? (volNum / baseVolNum) * (parseFloat(concentracion) || 1.0) : 0;

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTrazabilidad = (id, valor) => {
    setTrazabilidad(prev => ({ ...prev, [id]: valor }));
  };

  async function preparar(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanTrazabilidad = Object.fromEntries(
        Object.entries(trazabilidad).filter(([k, v]) => v && v.trim() !== '')
      );

      const lote = await api.post('/reactivos/lotes', {
        formulacion_id: formulacion.id,
        volumen_l: parseFloat(volumen),
        concentracion_x: parseFloat(concentracion),
        ph_final: phFinal ? parseFloat(phFinal) : null,
        trazabilidad_reactivos: cleanTrazabilidad,
        notas: `Preparación guiada de ${volumen}L de ${formulacion.nombre}`
      });
      onSaved(lote);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Precalculamos los componentes con salvaguardas
  const componentes = (formulacion.componentes || []).map(c => {
    const isReactivo = !!c.reactivo;
    const item = c.reactivo || c.formulacion_ingrediente;

    if (!item) {
      return { ...c, item: { nombre: 'Item desconocido' }, unidad: '?', requiredAmount: '0.00', isReactivo: false };
    }

    const unidad = isReactivo ? (item.unidad_medida || 'g') : (item.unidad_medida || 'ml');
    const baseAmount = parseFloat(c.cantidad_base) || 0;
    const requiredAmount = (baseAmount * ratio).toFixed(2);

    return { ...c, item, unidad, requiredAmount, isReactivo };
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--theme-background)', color: 'var(--theme-text)', overflowY: 'auto', padding: '1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <span className="badge badge--info" style={{ marginBottom: '0.5rem' }}>Modo Preparación</span>
            <h2 style={{ margin: 0 }}>{formulacion.nombre}</h2>
            <p className="text-muted font-mono" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{formulacion.codigo_referencia || 'SIN CÓDIGO'}</p>
          </div>
          <button onClick={onCancel} className="btn btn--ghost" style={{ padding: '0.5rem', minHeight: 'auto', borderRadius: '50%' }}>✕</button>
        </div>

        {error && <div className="card" style={{ background: 'rgba(255,0,0,0.1)', color: 'var(--error)', border: '1px solid var(--error)', marginBottom: '1rem' }}>{error}</div>}

        {/* PASO 1 */}
        <StepAccordion
          stepNumber={1}
          icon="⚖️"
          title="Configuración"
          expanded={activeStep === 1}
          onToggle={() => setActiveStep(1)}
        >
          <div className="grid-2">
            <div className="form-group">
              <label>Volumen (L)</label>
              <input type="number" step="0.01" value={volumen} onChange={e => setVolumen(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Concentración (X)</label>
              <input type="number" step="0.1" value={concentracion} onChange={e => setConcentracion(e.target.value)} />
            </div>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>💡 Factor de escalado: x{ratio.toFixed(2)}</p>
          <button type="button" className="btn btn--primary btn--block" style={{ marginTop: '1rem' }} onClick={() => setActiveStep(2)}>Siguiente</button>
        </StepAccordion>

        {/* PASO 2 */}
        <StepAccordion
          stepNumber={2}
          icon="🧪"
          title="Pesaje y Mezcla"
          expanded={activeStep === 2}
          onToggle={() => setActiveStep(2)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {componentes.map(c => (
              <div key={c.id} className="card" style={{ padding: '1rem', margin: 0, opacity: checkedItems[c.id] ? 0.5 : 1 }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={!!checkedItems[c.id]}
                    onChange={() => toggleCheck(c.id)}
                    style={{ width: '24px', height: '24px', marginTop: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', textDecoration: checkedItems[c.id] ? 'line-through' : 'none' }}>{c.item.nombre}</span>
                      <span className="text-primary" style={{ fontWeight: 'bold' }}>{c.requiredAmount} {c.unidad}</span>
                    </div>
                    {c.isReactivo && !checkedItems[c.id] && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <ScanInput
                          placeholder="Lote origen..."
                          value={trazabilidad[c.item.id] || ''}
                          onChange={val => handleTrazabilidad(c.item.id, val)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn--primary btn--block" style={{ marginTop: '1rem' }} onClick={() => setActiveStep(3)}>Ir al cierre</button>
        </StepAccordion>

        {/* PASO 3 */}
        <StepAccordion
          stepNumber={3}
          icon="⚗️"
          title="Cierre y Registro"
          expanded={activeStep === 3}
          onToggle={() => setActiveStep(3)}
        >
          {formulacion.procedimiento && (
            <div className="card" style={{ background: 'var(--theme-surface-hover)', fontSize: '0.9rem' }}>
              <label>Procedimiento</label>
              <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{formulacion.procedimiento}</p>
            </div>
          )}
          <div className="form-group">
            <label>pH Final (Opcional)</label>
            <input type="number" step="0.01" value={phFinal} onChange={e => setPhFinal(e.target.value)} placeholder="Ej: 5.8" />
          </div>
          <button type="button" className="btn btn--secondary btn--block" onClick={preparar} disabled={loading}>
            {loading ? 'Guardando...' : 'Completar y Guardar Lote'}
          </button>
        </StepAccordion>

      </div>
    </div>
  );
}
