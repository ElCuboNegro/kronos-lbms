import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LotePreparacionForm from '../LotePreparacionForm';
import { api } from '../../api/client';

// Mock del cliente API
vi.mock('../../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('Recursividad en LotePreparacionForm', () => {
  const mockFormulacionBase = {
    id: 'f-padre',
    nombre: 'Receta Padre Modular',
    volumen_base_l: 1.0,
    componentes: [
      {
        id: 'c-sub',
        cantidad_base: 1.0,
        formulacion_ingrediente: { id: 'f-hijo', nombre: 'Sub-receta Base' }
      }
    ]
  };

  const mockFlattenedData = [
    {
      id: 'c-final-1',
      cantidad_base: 5.0,
      reactivo: { id: 'r-1', nombre: 'Ingrediente Oculto 1', unidad_medida: 'g' }
    },
    {
      id: 'c-final-2',
      cantidad_base: 0.1,
      reactivo: { id: 'r-2', nombre: 'Ingrediente Oculto 2', unidad_medida: 'ml' }
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe cargar y mostrar los componentes aplanados (recursivos)', async () => {
    api.get.mockResolvedValue(mockFlattenedData);

    render(
      <LotePreparacionForm
        formulacion={mockFormulacionBase}
        onSaved={() => {}}
        onCancel={() => {}}
      />
    );

    // 1. Verificar que llamó al endpoint de aplanamiento
    await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/reactivos/formulaciones/f-padre/flatten');
    });

    // 2. Ir al Paso 2 (Pesaje) para que se rendericen los componentes
    const nextBtn = screen.getByText(/Siguiente/i);
    fireEvent.click(nextBtn);

    // 3. Verificar que aparezcan los items del aplanamiento
    await waitFor(() => {
      expect(screen.getByText('Ingrediente Oculto 1')).toBeInTheDocument();
      expect(screen.getByText('Ingrediente Oculto 2')).toBeInTheDocument();
    });

    // Verificar cantidades escaladas (ratio 1.0)
    expect(screen.getByText('5.00 g')).toBeInTheDocument();
    expect(screen.getByText('0.10 ml')).toBeInTheDocument();
  });
});
