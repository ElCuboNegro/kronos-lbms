import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PeatPHProtocol from '../PeatPHProtocol';

describe('PeatPHProtocol Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('guides the user through the 1:2 volume prep', () => {
    render(<PeatPHProtocol />);
    // Check for specific quantities using more precise matching or just ensuring they exist
    expect(screen.getByText(/50 cc/)).toBeInTheDocument();
    expect(screen.getByText(/100 ml/)).toBeInTheDocument();
    // Look for the specific mention in the list item
    expect(screen.getByText(/Turba Rubia \(sin compactar\)/i)).toBeInTheDocument();
  });

  it('requires waiting for the timer before allowing pH input', async () => {
    render(<PeatPHProtocol />);

    // Step 1: Click "Confirmar Mezcla y Siguiente"
    // Use the button role to be sure
    const nextBtn = screen.getByRole('button', { name: /Confirmar Mezcla y Siguiente/i });
    fireEvent.click(nextBtn);

    // Step 2: Now expanded. Check for the timer label specifically
    expect(screen.getByText('Tiempo de Reposo')).toBeInTheDocument();

    // Click "Ir al Registro"
    fireEvent.click(screen.getByRole('button', { name: /Ir al Registro/i }));

    // Step 3: Now expanded.
    const submitBtn = screen.getByRole('button', { name: /Registrar Medición/i });

    // It should be disabled because phValue is empty
    expect(submitBtn).toBeDisabled();

    // Input some value
    const input = screen.getByPlaceholderText(/Ej: 4.25/i);
    fireEvent.change(input, { target: { value: '4.5' } });

    expect(submitBtn).toBeEnabled();
  });
});
