import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Home from '../Home'
import { api } from '../../api/client'

vi.mock('../../api/client', () => ({ api: { get: vi.fn(), post: vi.fn() } }))

const PAYLOAD = {
  recordatorio_revision: { activo: true, mensaje: 'Hoy es día de revisión — revisa tus cultivos' },
  alertas: {
    contaminacion: [{ especimen_id: '1', uid: 'MOSB-1', especie: 'Mostaza', estado: 'confirmada' }],
    germinacion_tardia: [], sin_revisar: [],
  },
  metodo_resultado: [], germinacion_crecimiento: [],
}

test('muestra el recordatorio y la alerta de contaminación', async () => {
  api.get.mockResolvedValue(PAYLOAD)
  render(<MemoryRouter><Home /></MemoryRouter>)
  await waitFor(() => expect(screen.getByText(/día de revisión/i)).toBeInTheDocument())
  expect(screen.getByText(/MOSB-1/)).toBeInTheDocument()
})

test('marcar contaminado hace POST y recarga', async () => {
  const conPendiente = {
    ...PAYLOAD,
    alertas: {
      contaminacion: [],
      germinacion_tardia: [{ especimen_id: '9', uid: 'ZINN-9', especie: 'Zinnia', dias: 30, esperado: 21 }],
      sin_revisar: [],
    },
  }
  api.get.mockResolvedValue(conPendiente)
  api.post.mockResolvedValue({})
  render(<MemoryRouter><Home /></MemoryRouter>)
  await waitFor(() => expect(screen.getByText(/ZINN-9/)).toBeInTheDocument())
  fireEvent.click(screen.getByRole('button', { name: /marcar contaminado/i }))
  await waitFor(() => expect(api.post).toHaveBeenCalledWith('/eventos', expect.objectContaining({
    tipo: 'contaminacion', especimen_id: '9',
  })))
  await waitFor(() => expect(api.get.mock.calls.length).toBeGreaterThanOrEqual(2))
})
