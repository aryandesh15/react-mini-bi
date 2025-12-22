import type { Row } from './parseCsv'
import type { Agg } from '../hooks/useChartSpec'

export type ChartPoint = {
  x: string
  y: number
  color?: string
  size?: number
}

function isEmpty(v: unknown) {
  if (v === null || v === undefined) return true
  return String(v).trim() === ''
}

function toNumber(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function buildChartData(args: {
  rows: Row[]
  xField?: string
  yField?: string
  colorField?: string
  sizeField?: string
  agg: Agg
}) {
  const { rows, xField, yField, colorField, sizeField, agg } = args
  if (!xField || !yField) return []

  type Acc = { sum: number; count: number; min?: number; max?: number }
  const groups = new Map<string, Acc>()

  for (const r of rows) {
    const xRaw = r[xField]
    const yRaw = r[yField]
    if (isEmpty(xRaw)) continue

    const x = String(xRaw)

    if (agg === 'count') {
      const key = x
      const acc = groups.get(key) ?? { sum: 0, count: 0 }
      acc.count += 1
      groups.set(key, acc)
      continue
    }

    if (isEmpty(yRaw)) continue
    const yNum = toNumber(yRaw)
    if (yNum === null) continue

    const key = x
    const acc = groups.get(key) ?? { sum: 0, count: 0 }
    acc.sum += yNum
    acc.count += 1
    groups.set(key, acc)
  }

  const out: ChartPoint[] = []
  for (const [x, acc] of groups.entries()) {
    let y = 0
    if (agg === 'count') y = acc.count
    else if (agg === 'avg') y = acc.count === 0 ? 0 : acc.sum / acc.count
    else y = acc.sum

    out.push({ x, y })
  }

  out.sort((a, b) => a.x.localeCompare(b.x))

  // color/size will be handled later (after we decide chart semantics)
  void colorField
  void sizeField

  return out
}
