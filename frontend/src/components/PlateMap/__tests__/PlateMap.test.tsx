import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlateMap from '../PlateMap';
import { api } from '../../../api/client';

// Mock the API client
vi.mock('../../../api/client', () => ({
  api: {
    get: vi.fn()
  }
}));

describe('PlateMap Component (96-well)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock response for /especimenes
    (api.get as any).mockResolvedValue([
      { id: '123', uid: 'SP-1024', tipo: 'Planta' }
    ]);
  });

  it('renders the grid with correct headers (A-H, 1-12)', () => {
    render(<PlateMap />);
    // Check some row headers
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('H')).toBeInTheDocument();
    // Check some col headers
    expect(screen.getAllByText('1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('12')[0]).toBeInTheDocument();
  });

  it('selects a well and opens the editor sheet', () => {
    render(<PlateMap />);
    // Initial state: editor should not display a specific well ID
    expect(screen.queryByText(/Editando pozo: A1/)).not.toBeInTheDocument();

    // Find and click well A1. Use getByLabelText to avoid multiple button role conflicts
    const wellA1 = screen.getByLabelText('Pozo A1');
    fireEvent.click(wellA1);

    // Editor should appear
    expect(screen.getByText(/Editando pozo: A1/)).toBeInTheDocument();
  });

  it('allows selecting multiple wells and batch coloring', () => {
    render(<PlateMap />);

    // Select A1, A2
    const wellA1 = screen.getByLabelText('Pozo A1');
    const wellA2 = screen.getByLabelText('Pozo A2');

    // Simular click con metaKey para selección múltiple
    fireEvent.click(wellA1);
    fireEvent.click(wellA2, { metaKey: true });

    // Editor should show multiple selection
    expect(screen.getByText(/Editando 2 pozos/)).toBeInTheDocument();

    // Click color swatch (e.g. Red / bg-red-500)
    const redColorBtn = screen.getByLabelText('Color bg-red-500');
    fireEvent.click(redColorBtn);

    // Both wells should have the red class
    expect(wellA1.className).toContain('bg-red-500');
    expect(wellA2.className).toContain('bg-red-500');
  });

  it('clears the map when requested', () => {
    render(<PlateMap />);
    const wellA1 = screen.getByLabelText('Pozo A1');

    // Assign a color
    fireEvent.click(wellA1);
    fireEvent.click(screen.getByLabelText('Color bg-red-500'));
    expect(wellA1.className).toContain('bg-red-500');

    // Click clear map
    const clearBtn = screen.getByRole('button', { name: /Limpiar mapa/i });

    // Auto-confirm window.confirm
    window.confirm = () => true;
    fireEvent.click(clearBtn);

    // Color should be gone
    expect(wellA1.className).not.toContain('bg-red-500');
  });

  it('allows linking a specimen from the API to a well', async () => {
    render(<PlateMap />);
    const wellA1 = screen.getByLabelText('Pozo A1');

    fireEvent.click(wellA1);

    // Input for specimen search
    const searchInput = screen.getByPlaceholderText(/Buscar UID de muestra/i);
    fireEvent.change(searchInput, { target: { value: 'SP' } });

    // Wait for the mock API result to be rendered
    const option = await screen.findByText('SP-1024');
    fireEvent.click(option);

    // The well should now visually indicate it has a specimen assigned in the editor
    expect(screen.getByText('Muestra asignada: SP-1024')).toBeInTheDocument();
  });
});
