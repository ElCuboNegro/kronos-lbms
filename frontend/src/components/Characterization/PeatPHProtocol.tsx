import React, { useState } from 'react';
import StepAccordion from '../RunMode/StepAccordion';
import TimerRow from '../RunMode/TimerRow';

const PeatPHProtocol: React.FC = () => {
  const [step, setStep] = useState(1);
  const [phValue, setPhValue] = useState('');
  const [isTimerFinished, setIsTimerFinished] = useState(false);

  const handleMixConfirmed = () => {
    setStep(2);
  };

  const handleMeasurement = () => {
    // Aquí se conectaría con el backend para guardar el resultado
    alert(`pH registrado: ${phValue}. Los datos han sido normalizados.`);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primary">Protocolo de Caracterización</h2>
        <p className="text-gray-500">Medición de pH de Turba (Método 1:2 v/v)</p>
      </div>

      <StepAccordion
        stepNumber={1}
        icon="⚖️"
        title="Preparación de Muestra"
        expanded={step === 1}
        onToggle={() => setStep(1)}
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-blue-800 font-medium">Proporción Normalizada:</p>
            <ul className="list-disc ml-5 mt-2 text-blue-700">
              <li><strong>50 cc</strong> de Turba Rubia (sin compactar)</li>
              <li><strong>100 ml</strong> de Agua Destilada (0 ppm)</li>
            </ul>
          </div>
          <p className="text-gray-600">Mezcle vigorosamente en un recipiente limpio durante 1 minuto.</p>
          <button
            onClick={handleMixConfirmed}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark transition-colors"
          >
            Confirmar Mezcla y Siguiente
          </button>
        </div>
      </StepAccordion>

      <StepAccordion
        stepNumber={2}
        icon="⏱️"
        title="Equilibrio Químico"
        expanded={step === 2}
        onToggle={() => setStep(2)}
      >
        <div className="space-y-4">
          <p className="text-gray-600 italic">
            La turba libera ácidos orgánicos lentamente. Debe esperar el tiempo de reposo para una lectura veraz.
          </p>

          <TimerRow
            id="peat-timer"
            label="Tiempo de Reposo"
            initialSeconds={3600}
          />

          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
            ⚠️ Se recomienda no realizar la lectura hasta que el temporizador llegue a 00:00.
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-xl"
          >
            Ir al Registro
          </button>
        </div>
      </StepAccordion>

      <StepAccordion
        stepNumber={3}
        icon="🧪"
        title="Registro y Normalización"
        expanded={step === 3}
        onToggle={() => setStep(3)}
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-gray-700 font-bold text-sm uppercase">pH Observado (Medidor Digital)</span>
            <input
              type="number"
              step="0.01"
              value={phValue}
              onChange={(e) => setPhValue(e.target.value)}
              className="mt-1 block w-full border-2 border-gray-200 rounded-xl p-3 text-xl focus:ring-primary"
              placeholder="Ej: 4.25"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
              <strong>Ratio:</strong> 1:2 v/v
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
              <strong>Normalización:</strong> ISO-LBMS-Peat
            </div>
          </div>

          <button
            disabled={!phValue}
            onClick={handleMeasurement}
            className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50"
          >
            Registrar Medición
          </button>
        </div>
      </StepAccordion>
    </div>
  );
};

export default PeatPHProtocol;
