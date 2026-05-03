import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

// Constantes de configuración de la placa de 96 pozos
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const COLS = Array.from({ length: 12 }, (_, i) => i + 1);

// Paleta semántica
const COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-gray-400'
];

interface Specimen {
  id: string;
  uid: string;
  tipo: string;
}

interface WellData {
  id: string;
  color?: string;
  title?: string;
  specimenId?: string; // ID interno de LBMS
  specimenUid?: string; // Human-readable UID (Ej. SP-1024)
}

const PlateMap: React.FC = () => {
  const [wellsData, setWellsData] = useState<Record<string, WellData>>({});
  const [selectedWells, setSelectedWells] = useState<string[]>([]);

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Specimen[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      // El backend de LBMS normalmente soporta queries tipo ?q= o búsqueda directa
      // Si falla la búsqueda estricta, la mock resolverá el array de test
      api.get(`/especimenes`)
        .then((data: any) => {
          // Filtrado básico en cliente (idealmente el backend lo hace)
          const matches = Array.isArray(data) ? data.filter(e => e.uid.toLowerCase().includes(searchQuery.toLowerCase())) : [];
          setSearchResults(matches);
        })
        .catch(console.error)
        .finally(() => setIsSearching(false));
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleWellClick = (id: string, isMulti: boolean) => {
    if (isMulti) {
      if (selectedWells.includes(id)) {
        setSelectedWells(selectedWells.filter(w => w !== id));
      } else {
        setSelectedWells([...selectedWells, id]);
      }
    } else {
      setSelectedWells([id]);
    }
  };

  const applyColor = (colorClass: string) => {
    setWellsData(prev => {
      const next = { ...prev };
      selectedWells.forEach(id => {
        next[id] = { ...next[id] || {}, id, color: colorClass };
      });
      return next;
    });
  };

  const linkSpecimen = (specimen: Specimen) => {
    setWellsData(prev => {
      const next = { ...prev };
      selectedWells.forEach(id => {
        next[id] = { ...next[id] || {}, id, specimenId: specimen.id, specimenUid: specimen.uid };
      });
      return next;
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const clearMap = () => {
    if (window.confirm('¿Estás seguro de que deseas limpiar todo el mapa?')) {
      setWellsData({});
      setSelectedWells([]);
    }
  };

  // Helper para decidir el texto del panel inferior
  const getEditorTitle = () => {
    if (selectedWells.length === 0) return 'Selecciona un pozo';
    if (selectedWells.length === 1) return `Editando pozo: ${selectedWells[0]}`;
    return `Editando ${selectedWells.length} pozos`;
  };

  // Determinar si todos los pocillos seleccionados tienen el mismo espécimen (para mostrarlo)
  const getCommonSpecimen = () => {
    if (selectedWells.length === 0) return null;
    const firstSpec = wellsData[selectedWells[0]]?.specimenUid;
    if (!firstSpec) return null;
    const allMatch = selectedWells.every(id => wellsData[id]?.specimenUid === firstSpec);
    return allMatch ? firstSpec : null;
  };

  const commonSpecimen = getCommonSpecimen();

  return (
    <div className="flex flex-col h-full bg-white relative pb-48">

      {/* Barra de herramientas superior */}
      <div className="flex justify-between items-center p-4 border-b">
        <div>
          <h2 className="text-xl font-bold">Mapa de Placa</h2>
          <span className="text-sm text-gray-500">96-well plate</span>
        </div>
        <button
          onClick={clearMap}
          className="text-red-500 font-medium px-3 py-1 bg-red-50 rounded hover:bg-red-100"
        >
          Limpiar mapa
        </button>
      </div>

      {/* Área del mapa con scroll si la pantalla es pequeña */}
      <div className="overflow-auto p-4 flex-1">
        {/* Usamos grid-cols-13 (1 de etiquetas + 12 de datos) */}
        <div className="grid grid-cols-[auto_repeat(12,minmax(0,1fr))] gap-1 md:gap-2 max-w-4xl mx-auto">

          {/* Cabecera vacía superior izquierda */}
          <div className="w-8 h-8 md:w-10 md:h-10"></div>

          {/* Cabeceras de Columnas (1-12) */}
          {COLS.map(col => (
            <div key={`col-${col}`} className="flex justify-center items-center font-bold text-gray-400 text-xs md:text-sm">
              {col}
            </div>
          ))}

          {/* Filas */}
          {ROWS.map(row => (
            <React.Fragment key={`row-${row}`}>
              {/* Cabecera de Fila (A-H) */}
              <div className="flex justify-center items-center font-bold text-gray-400 text-xs md:text-sm h-8 w-8 md:h-10 md:w-10">
                {row}
              </div>

              {/* Pozos de la Fila */}
              {COLS.map(col => {
                const wellId = `${row}${col}`;
                const data = wellsData[wellId];
                const isSelected = selectedWells.includes(wellId);
                const bgClass = data?.color || 'bg-gray-100';

                return (
                  <button
                    key={wellId}
                    aria-label={`Pozo ${wellId}`}
                    onClick={(e) => handleWellClick(wellId, e.metaKey || e.ctrlKey || e.shiftKey)}
                    className={`
                      relative aspect-square rounded-full border-2 transition-all
                      ${isSelected ? 'ring-4 ring-blue-300 border-blue-600 scale-95' : 'border-gray-200 hover:border-gray-400'}
                      ${bgClass}
                    `}
                    title={data?.specimenUid ? `${wellId}: ${data.specimenUid}` : wellId}
                  >
                    {/* Indicador visual de muestra asignada */}
                    {data?.specimenUid && (
                      <span className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-gray-800 opacity-50" />
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Editor Sheet (Panel inferior anclado) */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 max-h-64 overflow-y-auto z-10">
        <h3 className="font-bold text-lg mb-3">{getEditorTitle()}</h3>

        {selectedWells.length > 0 ? (
          <div className="flex flex-col gap-4 pb-2">

            {/* Color Swatches */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asignar Color</label>
              <div className="flex gap-2">
                <button
                  onClick={() => applyColor('')}
                  aria-label="Color "
                  className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-gray-50"
                >
                  ✕
                </button>
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => applyColor(color)}
                    aria-label={`Color ${color}`}
                    className={`w-10 h-10 rounded-full border-2 border-white ring-2 ring-transparent focus:ring-gray-400 ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Buscador de Espécimen LBMS */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Muestra / Espécimen LBMS</label>

              {commonSpecimen ? (
                 <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                   <span className="font-mono text-gray-800 font-bold">Muestra asignada: {commonSpecimen}</span>
                   <button onClick={() => linkSpecimen({ id: '', uid: '', tipo: '' })} className="text-red-500 text-sm hover:underline">Quitar</button>
                 </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar UID de muestra (Ej. SP-1024)..."
                    className="w-full border-2 border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {isSearching && <div className="absolute right-3 top-9 text-gray-400 text-sm">Buscando...</div>}

                  {searchResults.length > 0 && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                      {searchResults.map(specimen => (
                        <li
                          key={specimen.id}
                          onClick={() => linkSpecimen(specimen)}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between"
                        >
                          <span className="font-mono font-bold text-gray-800">{specimen.uid}</span>
                          <span className="text-xs text-gray-500">{specimen.tipo}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 italic text-center py-4">
            Haz clic en un pozo de la placa para editarlo. Usa Shift/Ctrl para seleccionar varios.
          </div>
        )}
      </div>

    </div>
  );
};

export default PlateMap;
