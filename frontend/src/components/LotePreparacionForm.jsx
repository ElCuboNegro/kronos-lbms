import React, { useState } from 'react';
import { api } from '../api/client';
import ScanInput from './ScanInput';
import StepAccordion from './RunMode/StepAccordion';

export default function LotePreparacionForm({ formulacion, onSaved, onCancel }) {
  const [volumen, setVolumen] = useState(formulacion.volumen_base_l);
  const [concentracion, setConcentracion] = useState(1.0);
  const [phFinal, setPhFinal] = useState('');
  const [trazabilidad, setTrazabilidad] = useState({});
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ratio multiplicador para escalar reactivos automáticamente
  const ratio = (volumen / formulacion.volumen_base_l) * concentracion;

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
      // Limpiar trazabilidad vacía
      const cleanTrazabilidad = Object.fromEntries(
        Object.entries(trazabilidad).filter(([k, v]) => v.trim() !== '')
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

  // Precalculamos los componentes
  const componentes = formulacion.componentes.map(c => {
    const isReactivo = !!c.reactivo;
    const item = c.reactivo || c.formulacion_ingrediente;
    const unidad = isReactivo ? item.unidad_medida : (item.unidad_medida || 'ml');
    const requiredAmount = (c.cantidad_base * ratio).toFixed(2);

    return { ...c, item, unidad, requiredAmount, isReactivo };
  });

  return (
    <div className="bg-white fixed inset-0 z-50 overflow-y-auto flex flex-col p-4 md:p-8" style={{ background: 'var(--theme-surface)', color: 'var(--theme-text)' }}>
      <div className="max-w-3xl w-full mx-auto pb-24">
        {/* Header tipo Run Mode */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
              Modo Preparación
            </span>
            <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">{formulacion.nombre}</h2>
            <p className="text-gray-500 mt-1 font-mono text-sm">{formulacion.codigo_referencia || 'Sin código'}</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full dark:bg-gray-800">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium">{error}</div>}

        <form onSubmit={preparar}>

          {/* STEP 1: CONFIGURATION */}
          <StepAccordion stepNumber={1} icon="⚖️" title="Paso 1: Configuración" isInitialExpanded={true}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label htmlFor="volumen" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Volumen a preparar (L)</label>
                <input
                  id="volumen"
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={volumen}
                  onChange={(e) => setVolumen(e.target.value)}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 rounded-xl p-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="concentracion" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Concentración (X)</label>
                <input
                  id="concentracion"
                  type="number"
                  step="0.1"
                  required
                  min="0.1"
                  value={concentracion}
                  onChange={(e) => setConcentracion(e.target.value)}
                  className="w-full border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 rounded-xl p-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl border border-amber-100 dark:border-amber-800">
              <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                💡 Al ajustar el volumen, las cantidades en el Paso 2 se recalcularán automáticamente (x{ratio.toFixed(2)}).
              </p>
            </div>
          </StepAccordion>

          {/* STEP 2: MISE EN PLACE & PESAJE */}
          <StepAccordion stepNumber={2} icon="🧪" title="Paso 2: Pesaje y Mezcla">
            <div className="flex flex-col gap-3 mt-2">
              <p className="text-gray-500 text-sm mb-2">Marca cada ingrediente a medida que lo agregues a la mezcla.</p>

              {componentes.map((c) => {
                const isChecked = !!checkedItems[c.id];
                return (
                  <div key={c.id} className={`border-2 rounded-xl p-4 transition-all ${isChecked ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60' : 'bg-white dark:bg-gray-900 border-blue-100 dark:border-blue-900 shadow-sm'}`}>
                    <div className="flex items-start gap-4">

                      {/* Checkbox gigante */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          className="w-8 h-8 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                          checked={isChecked}
                          onChange={() => toggleCheck(c.id)}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className={`text-lg font-bold ${isChecked ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                            {c.item.nombre}
                          </h4>
                          <span className={`font-mono text-xl font-bold ${isChecked ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
                            {c.requiredAmount} {c.unidad}
                          </span>
                        </div>

                        {/* Trazabilidad opcional si es reactivo base */}
                        {c.isReactivo && !isChecked && (
                          <div className="mt-3">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">
                              Lote Origen / Trazabilidad (Opcional)
                            </label>
                            <ScanInput
                              placeholder="Escanear UID del frasco origen..."
                              value={trazabilidad[c.item.id] || ''}
                              onChange={(val) => handleTrazabilidad(c.item.id, val)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </StepAccordion>

          {/* STEP 3: PROCEDURE & FINISH */}
          <StepAccordion stepNumber={3} icon="⚗️" title="Paso 3: Cierre y Registro">
            <div className="mt-2">
              {formulacion.procedimiento && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4 mb-6">
                  <h4 className="text-indigo-900 dark:text-indigo-200 font-bold text-sm uppercase tracking-wider mb-2">Procedimiento</h4>
                  <p className="text-indigo-800 dark:text-indigo-300 text-base whitespace-pre-wrap">{formulacion.procedimiento}</p>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="ph" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">pH Final Registrado (Opcional)</label>
                <input
                  id="ph"
                  type="number"
                  step="0.01"
                  value={phFinal}
                  onChange={(e) => setPhFinal(e.target.value)}
                  placeholder="Ej. 5.8"
                  className="w-full md:w-1/2 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 rounded-xl p-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="border-t dark:border-gray-700 pt-6 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-md active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
                >
                  {loading ? 'Guardando...' : (
                    <>
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                      Completar y Guardar Lote
                    </>
                  )}
                </button>
              </div>
            </div>
          </StepAccordion>

        </form>
      </div>
    </div>
  );
}
