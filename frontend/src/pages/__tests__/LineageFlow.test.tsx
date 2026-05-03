import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EspecimenDetail from '../EspecimenDetail';
import IndividuoCreate from '../IndividuoCreate';
import { api } from '../../api/client';

vi.mock('../../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

describe('Specimen Lineage Flow', () => {
  const mockMother = {
    id: 'madre-uuid',
    uid: 'MOSS-001',
    especie: 'Sphagnum magellanicum',
    especie_id: 'especie-uuid',
    estado: 'activo',
    eventos: [],
    fecha_ingreso: '2026-01-01'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('navigates from SpecimenDetail to IndividuoCreate with correct params', async () => {
    (api.get as any).mockImplementation((path: string) => {
      if (path === '/especimenes/madre-uuid') return Promise.resolve(mockMother);
      if (path === '/especies') return Promise.resolve([{ id: 'especie-uuid', nombre_cientifico: 'Sphagnum magellanicum' }]);
      if (path === '/especies/especie-uuid') return Promise.resolve({ id: 'especie-uuid', nombre_cientifico: 'Sphagnum magellanicum', lineas: [] });
      if (path.includes('/printer/generar-uid')) return Promise.resolve({ uid: 'MOSS-002' });
      return Promise.resolve([]);
    });

    render(
      <MemoryRouter initialEntries={['/especimen/madre-uuid']}>
        <Routes>
          <Route path="/especimen/:id" element={<EspecimenDetail />} />
          <Route path="/nuevo-individuo" element={<IndividuoCreate />} />
        </Routes>
      </MemoryRouter>
    );

    // 1. Wait for detail page to load. Use exact matcher or regex for broken text.
    await waitFor(() => expect(screen.getByText(/MOSS-001/)).toBeInTheDocument());

    // 2. Click "Propagar"
    const propagarBtn = screen.getByRole('button', { name: /propagar/i });
    fireEvent.click(propagarBtn);

    // 3. Verify we are on creation page and fields are pre-filled
    await waitFor(() => {
      // Check for pre-filled UID in the EspecimenSearch child component for mother
      expect(screen.getByDisplayValue('MOSS-001')).toBeInTheDocument();
      // Check for suggested origin
      expect(screen.getByDisplayValue('Explante / Propagación')).toBeInTheDocument();
    });
  });
});
