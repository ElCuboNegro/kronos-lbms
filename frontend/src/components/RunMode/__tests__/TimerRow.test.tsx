import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TimerRow from '../TimerRow';

describe('TimerRow Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly with initial duration', () => {
    render(<TimerRow id="1" label="Muestra 1" initialSeconds={300} />);
    expect(screen.getByText('Muestra 1')).toBeInTheDocument();
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });

  it('starts counting down when play button is clicked', () => {
    render(<TimerRow id="1" label="Muestra 1" initialSeconds={300} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    // Avanzar 1 segundo
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('04:59')).toBeInTheDocument();
  });

  it('pauses the countdown when pause button is clicked', () => {
    render(<TimerRow id="1" label="Muestra 1" initialSeconds={300} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    // Avanzar 2 segundos
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('04:58')).toBeInTheDocument();

    // Pausar
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);

    // Avanzar 5 segundos más (estando en pausa)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Debería seguir en 04:58
    expect(screen.getByText('04:58')).toBeInTheDocument();
  });

  it('resets the timer when reset button is clicked', () => {
    render(<TimerRow id="1" label="Muestra 1" initialSeconds={300} />);

    const playButton = screen.getByRole('button', { name: /play/i });
    fireEvent.click(playButton);

    act(() => {
      vi.advanceTimersByTime(10000); // 10s
    });
    expect(screen.getByText('04:50')).toBeInTheDocument();

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    expect(screen.getByText('05:00')).toBeInTheDocument();
  });
});
