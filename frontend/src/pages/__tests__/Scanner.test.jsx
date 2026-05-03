import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Scanner from '../Scanner';
import { MemoryRouter } from 'react-router-dom';
import { api } from '../../api/client';

vi.mock('../../api/client', () => ({
  api: {
    get: vi.fn()
  }
}));

// Mock QRScanner component
vi.mock('../../components/QRScanner', () => ({
  default: ({ onResult, onError }) => (
    <div data-testid="mock-scanner">
      <button onClick={() => onResult('UID:12345')}>Scan Known UID</button>
      <button onClick={() => {
         // Simulate what the backend returns for an unknown generic barcode
         api.get.mockResolvedValueOnce({ tipo: 'desconocido' });
         onResult('7501031311309');
      }}>Scan Unknown Barcode</button>
    </div>
  )
}));

describe('Scanner Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the "Registrar en Inventario de Reactivos" button when scanning an unknown generic barcode', async () => {
    render(
      <MemoryRouter>
        <Scanner />
      </MemoryRouter>
    );

    // Simulate scanning a generic barcode (e.g., a commercial reagent bottle)
    const scanBtn = screen.getByText('Scan Unknown Barcode');
    fireEvent.click(scanBtn);

    // Wait for the component to handle the API response and update the UI
    await waitFor(() => {
      expect(screen.getByText('Registrar en Inventario de Reactivos')).toBeInTheDocument();
    });
  });
});
