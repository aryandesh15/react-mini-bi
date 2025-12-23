import { describe, it, expect } from 'vitest'
import { buildChartData } from '../lib/aggregate'

describe('buildChartData', () => {
  it('aggregates SUM by x', () => {
    const rows = [
      { city: 'A', sales: 10 },
      { city: 'A', sales: 5 },
      { city: 'B', sales: 7 },
    ] as any[]

    const out = buildChartData({
      rows,
      xField: 'city',
      yField: 'sales',
      colorField: undefined,
      sizeField: undefined,
      agg: 'sum',
      bucket: 'day',
    })

    expect(out).toHaveLength(2)

    const a = out.find((d: any) => d.x === 'A')
    const b = out.find((d: any) => d.x === 'B')

    expect(a?.y).toBe(15)
    expect(b?.y).toBe(7)
  })

  it('aggregates COUNT by x', () => {
    const rows = [
      { dept: 'X', v: 1 },
      { dept: 'X', v: 2 },
      { dept: 'Y', v: 3 },
    ] as any[]

    const out = buildChartData({
      rows,
      xField: 'dept',
      yField: 'v',
      colorField: undefined,
      sizeField: undefined,
      agg: 'count',
      bucket: 'day',
    })

    const x = out.find((d: any) => d.x === 'X')
    const y = out.find((d: any) => d.x === 'Y')

    expect(x?.y).toBe(2)
    expect(y?.y).toBe(1)
  })
})
