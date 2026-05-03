import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LotePreparacionForm from '../LotePreparacionForm';

describe('LotePreparacionForm', () => {
  const mockFormulacion = {
    id: 'f-1',
    nombre: 'Medio MS Basal',
    codigo_referencia: 'MS-1',
    volumen_base_l: 1.0,
    componentes: [
      {
        id: 'c-1',
        cantidad_base: 4.4,
        reactivo: {
          id: 'r-1',
          nombre: 'Sales MS',
          unidad_medida: 'g'
        }
      }
    ]
  };

  it('renders correctly with valid data', () => {
    render(
      <LotePreparacionForm
        formulacion={mockFormulacion}
        onSaved={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Medio MS Basal')).toBeInTheDocument();
    expect(screen.getByText('Sales MS')).toBeInTheDocument();
  });

  it('handles missing items in components gracefully', () => {
    const brokenFormulacion = {
      ...mockFormulacion,
      componentes: [
        { id: 'c-broken', cantidad_base: 1.0, reactivo: null, formulacion_ingrediente: null }
      ]
    };
    render(
      <LotePreparacionForm
        formulacion={brokenFormulacion}
        onSaved={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText('Item desconocido')).toBeInTheDocument();
  });
});
