import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MetodologiaCard } from '../ExperimentoDetail'

describe('MetodologiaCard', () => {
  it('muestra las condiciones de germinación con nombres amigables (pH y luz)', () => {
    render(<MetodologiaCard config={{ ph_sustrato: 5.7, fotoperiodo: '16/8', medio: 'MED-GERM-01' }} />)
    // Título de la tarjeta
    expect(screen.getByText(/Metodología/)).toBeDefined()
    // Clave conocida -> etiqueta en español + valor
    expect(screen.getByText(/pH objetivo/)).toBeDefined()
    expect(screen.getByText('5.7')).toBeDefined()
    // Medio de cultivo
    expect(screen.getByText(/Medio de cultivo/)).toBeDefined()
    expect(screen.getByText('MED-GERM-01')).toBeDefined()
  })

  it('humaniza una clave desconocida (sin dejar el nombre técnico crudo)', () => {
    render(<MetodologiaCard config={{ dias_riego: 3 }} />)
    // "dias_riego" -> "Dias Riego"
    expect(screen.getByText(/Dias Riego/)).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('muestra objetos anidados (condiciones_cultivo) como subsección', () => {
    render(<MetodologiaCard config={{ condiciones_cultivo: { ph_sustrato: 5.7 } }} />)
    expect(screen.getByText(/Condiciones de cultivo/)).toBeDefined()
    expect(screen.getByText(/pH objetivo/)).toBeDefined()
  })

  it('no revienta con config vacío y avisa que no hay metodología', () => {
    render(<MetodologiaCard config={{}} />)
    expect(screen.getByText(/Sin metodología registrada aún/)).toBeDefined()
  })

  it('no renderiza nada si config es null', () => {
    const { container } = render(<MetodologiaCard config={null} />)
    expect(container.firstChild).toBeNull()
  })
})
