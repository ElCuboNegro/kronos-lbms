import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ReactivosList from '../ReactivosList';
import { vi } from 'vitest';

// Mock the API client
vi.mock('../../api/client', () => ({
  api: {
    get: vi.fn().mockResolvedValue([]),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('ReactivosList', () => {
  it('renders without crashing and can open the ReactivoForm', async () => {
    render(
      <MemoryRouter>
        <ReactivosList />
      </MemoryRouter>
    );

    // Verify the list title is rendered
    expect(screen.getByText('Inventario de Reactivos')).toBeInTheDocument();

    // Find and click the button to open the form
    const addButton = screen.getByText('+');
    fireEvent.click(addButton);

    // Verify the form opens without throwing a ReferenceError for useNavigate
    // The form contains specific fields, let's verify one of them is present
    expect(await screen.findByText(/Código de barras/i)).toBeInTheDocument();
  });
});
