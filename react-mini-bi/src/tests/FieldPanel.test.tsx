import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FieldPanel from '../components/FieldPanel'

describe('FieldPanel', () => {
  it('renders field names', () => {
    const fields = [
      { name: 'city', type: 'string' },
      { name: 'sales', type: 'number' },
    ] as any

    const fieldStats = {
      city: { distinct: 2 },
      sales: { min: 1, max: 10, mean: 5.5 },
    } as any

    render(<FieldPanel fields={fields} fieldStats={fieldStats} />)

    expect(screen.getByText('city')).toBeInTheDocument()
    expect(screen.getByText('sales')).toBeInTheDocument()
  })
})
