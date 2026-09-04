import { render, screen, waitFor } from '@testing-library/react'
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
