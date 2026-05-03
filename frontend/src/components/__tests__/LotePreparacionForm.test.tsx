import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LotePreparacionForm from '../LotePreparacionForm';
import { api } from '../../api/client';

// Mock the API client
vi.mock('../../api/client', () => ({
  api: {
    post: vi.fn()
  }
}));

// Mock ScanInput to just be a standard input for tests
vi.mock('../ScanInput', () => ({
  default: ({ value, onChange, placeholder }) => (
    <input
      data-testid="mock-scan-input"
      placeholder={placeholder}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}));

// Mock StepAccordion since it uses internal state
vi.mock('../RunMode/StepAccordion', () => ({
  default: ({ title, children, isInitialExpanded }) => (
    <div data-testid={`accordion-${title}`} className={isInitialExpanded ? 'expanded' : 'collapsed'}>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  )
}));

describe('LotePreparacionForm Component (Run Mode UX)', () => {
  const mockFormulacion = {
    id: 'f1',
    nombre: 'Medio MS',
    volumen_base_l: 1.0,
    procedimiento: 'Ajustar pH a 5.8',
    componentes: [
      {
        id: 'c1',
        cantidad_base: 4.4,
        reactivo: { id: 'r1', nombre: 'Sales MS', unidad_medida: 'g' }
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the initial configuration step', () => {
    render(<LotePreparacionForm formulacion={mockFormulacion} onSaved={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Paso 1: Configuración')).toBeInTheDocument();
    expect(screen.getByText('Paso 2: Pesaje y Mezcla')).toBeInTheDocument();
    expect(screen.getByText('Paso 3: Cierre y Registro')).toBeInTheDocument();
  });

  it('scales quantities dynamically based on volume input', () => {
    render(<LotePreparacionForm formulacion={mockFormulacion} onSaved={vi.fn()} onCancel={vi.fn()} />);

    // Initial amount for 1L should be 4.4
    expect(screen.getByText(/4.40 g/)).toBeInTheDocument();

    // Change volume to 2L
    const volumeInput = screen.getByLabelText(/Volumen a preparar/i);
    fireEvent.change(volumeInput, { target: { value: '2' } });

    // Scaled amount should be 8.8 (4.4 * 2)
    expect(screen.getByText(/8.80 g/)).toBeInTheDocument();
  });

  it('allows checking off ingredients like a checklist', () => {
    render(<LotePreparacionForm formulacion={mockFormulacion} onSaved={vi.fn()} onCancel={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('submits the correct data payload to the backend', async () => {
    (api.post as any).mockResolvedValue({ id: 'lote123' });
    const mockOnSaved = vi.fn();

    render(<LotePreparacionForm formulacion={mockFormulacion} onSaved={mockOnSaved} onCancel={vi.fn()} />);

    // Change volume to 1.5L
    const volumeInput = screen.getByLabelText(/Volumen a preparar/i);
    fireEvent.change(volumeInput, { target: { value: '1.5' } });

    // Input pH
    const phInput = screen.getByLabelText(/pH Final/i);
    fireEvent.change(phInput, { target: { value: '5.8' } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Completar y Guardar Lote/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/reactivos/lotes', expect.objectContaining({
        formulacion_id: 'f1',
        volumen_l: 1.5,
        concentracion_x: 1,
        ph_final: 5.8
      }));
      expect(mockOnSaved).toHaveBeenCalled();
    });
  });
});
