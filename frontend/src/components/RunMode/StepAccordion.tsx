import React, { useState } from 'react';
import TimerRow from './TimerRow';

interface TimerDef {
  id: string;
  label: string;
  initialSeconds: number;
}

interface StepAccordionProps {
  stepNumber: number;
  icon?: string;
  title: string;
  description?: string;
  timers?: TimerDef[];
  isInitialExpanded?: boolean;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  children?: React.ReactNode;
}

const StepAccordion: React.FC<StepAccordionProps> = ({
  stepNumber,
  icon = '🧪',
  title,
  description,
  timers = [],
  isInitialExpanded = false,
  expanded,
  onToggle,
  children
}) => {
  const [internalExpanded, setInternalExpanded] = useState(isInitialExpanded);

  const isExpanded = expanded !== undefined ? expanded : internalExpanded;

  const handleToggle = () => {
    if (onToggle) {
      onToggle(!isExpanded);
    } else {
      setInternalExpanded(!isExpanded);
    }
  };

  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl mb-4 overflow-hidden shadow-sm">
      {/* Header / Toggle */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center p-4 text-left active:bg-gray-50 transition-colors"
      >
        <span className="text-2xl mr-3" aria-hidden="true">{icon}</span>
        <div className="flex-1">
          <span className="text-sm font-bold tracking-widest text-gray-400 uppercase">
            PASO {stepNumber}
          </span>
          <h3 className="text-lg font-bold text-gray-900 mt-0.5">{title}</h3>
        </div>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
        </div>
      </button>

      {/* Body */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t-2 border-gray-50 bg-gray-50/50">

          {description && (
            <p className="text-gray-600 text-base leading-relaxed mb-5 mt-4">
              {description}
            </p>
          )}

          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}

          {timers.length > 0 && (
            <div className="mt-4">
              {timers.length > 1 && (
                <button className="w-full bg-indigo-100 text-indigo-700 font-bold py-3 px-4 rounded-xl mb-4 active:scale-95 transition-transform hover:bg-indigo-200">
                  ▶ Iniciar todos los temporizadores
                </button>
              )}

              <div className="flex flex-col gap-2">
                {timers.map((t) => (
                  <TimerRow key={t.id} id={t.id} label={t.label} initialSeconds={t.initialSeconds} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default StepAccordion;
