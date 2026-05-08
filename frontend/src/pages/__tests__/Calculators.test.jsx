import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Calculators from '../Calculators'

// Mocking fetch
global.fetch = vi.fn()

// Mocking localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString() }),
    clear: vi.fn(() => { store = {} }),
    removeItem: vi.fn(key => { delete store[key] }),
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('Calculators Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => []
    })
  })

  it('renders the calculators tabs', () => {
    render(<Calculators />)
    expect(screen.getByText('Dilución DB')).toBeDefined()
    expect(screen.getByText('C1V1 Estándar')).toBeDefined()
  })

  it('calculates Integrated Dilution correctly (V_solvent based)', async () => {
    await act(async () => {
      render(<Calculators />)
    })

    // Default tab is Dilución DB
    const inputs = screen.getAllByRole('spinbutton')
    // C1, C2, V_solv
    await act(async () => {
      fireEvent.change(inputs[0], { target: { value: '50' } }) // C1
      fireEvent.change(inputs[1], { target: { value: '1' } })  // C2
      fireEvent.change(inputs[2], { target: { value: '245' } }) // V_solv
    })

    // V1 = (1 * 245) / (50 - 1) = 245 / 49 = 5.00
    expect(screen.getByText(/Tomar/).textContent).toContain('5.00 ml')
    expect(screen.getByText(/Volumen Total/).textContent).toContain('250.00 ml')
  })

  it('calculates dilution correctly when selecting a batch (lote)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => [] // reactivos
    }).mockResolvedValueOnce({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => [{
        id: 'batch-123',
        uid: 'REAC-260505-001',
        concentracion_x: 10,
        formulacion: { nombre: 'Solución Madre A' }
      }]
    })

    await act(async () => {
      render(<Calculators />)
    })

    const searchInput = screen.getByPlaceholderText(/Escribe nombre/)
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'REAC' } })
    })

    const batchOption = screen.getByText('REAC-260505-001')
    await act(async () => {
      fireEvent.click(batchOption)
    })

    // C1 should be auto-filled with 10
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0].value).toBe('10')

    await act(async () => {
      fireEvent.change(inputs[1], { target: { value: '1' } })  // C2
      fireEvent.change(inputs[2], { target: { value: '9' } })  // V_solv
    })

    // V1 = (1 * 9) / (10 - 1) = 9 / 9 = 1.00
    expect(screen.getByText(/Tomar/).textContent).toContain('1.00 ml')
    expect(screen.getByText(/Volumen Total/).textContent).toContain('10.00 ml')
  })

  it('calculates C1V1 correctly in standard tab', async () => {
    render(<Calculators />)

    const standardTab = screen.getByText('C1V1 Estándar')
    fireEvent.click(standardTab)

    const inputs = screen.getAllByRole('spinbutton')
    // C1, C2, V2
    fireEvent.change(inputs[0], { target: { value: '10' } }) // C1
    fireEvent.change(inputs[1], { target: { value: '1' } })  // C2
    fireEvent.change(inputs[2], { target: { value: '1000' } }) // V2

    expect(screen.getAllByText(/Añadir/)[0].textContent).toContain('100.00 ml') // V1
    expect(screen.getAllByText(/Añadir/)[1].textContent).toContain('900.00 ml') // Diluent
  })
})
