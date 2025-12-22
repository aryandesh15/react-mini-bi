import type { Row } from './parseCsv'
import type { Agg, DateBucket } from '../hooks/useChartSpec'

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

function tryParseDate(v: unknown) {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  if (!s) return null
  const t = Date.parse(s)
  return Number.isFinite(t) ? new Date(t) : null
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function bucketDate(d: Date, bucket: DateBucket) {
  const y = d.getFullYear()
  const m = pad2(d.getMonth() + 1)
  const day = pad2(d.getDate())

  if (bucket === 'year') return `${y}`
  if (bucket === 'month') return `${y}-${m}`
  return `${y}-${m}-${day}`
}

function shouldTreatXAsDate(rows: Row[], xField: string) {
  const sampleSize = Math.min(rows.length, 25)
  let tried = 0
  let parsed = 0

  for (let i = 0; i < sampleSize; i++) {
    const v = rows[i]?.[xField]
    if (isEmpty(v)) continue
    tried++
    if (tryParseDate(v)) parsed++
  }

  if (tried === 0) return false
  return parsed / tried >= 0.7
}

export function buildChartData(args: {
  rows: Row[]
  xField?: string
  yField?: string
  colorField?: string
  sizeField?: string
  agg: Agg
  bucket: DateBucket
}) {
  const { rows, xField, yField, colorField, sizeField, agg, bucket } = args
  if (!xField || !yField) return []

  const xIsDate = shouldTreatXAsDate(rows, xField)

  type Acc = { sum: number; count: number }
  const groups = new Map<string, Acc>()

  for (const r of rows) {
    const xRaw = r[xField]
    if (isEmpty(xRaw)) continue

    let x = String(xRaw)

    if (xIsDate) {
      const d = tryParseDate(xRaw)
      if (!d) continue
      x = bucketDate(d, bucket)
    }

    if (agg === 'count') {
      const acc = groups.get(x) ?? { sum: 0, count: 0 }
      acc.count += 1
      groups.set(x, acc)
      continue
    }

    const yRaw = r[yField]
    if (isEmpty(yRaw)) continue
    const yNum = toNumber(yRaw)
    if (yNum === null) continue

    const acc = groups.get(x) ?? { sum: 0, count: 0 }
    acc.sum += yNum
    acc.count += 1
    groups.set(x, acc)
  }

  const out: ChartPoint[] = []
  for (const [x, acc] of groups.entries()) {
    let y = 0
    if (agg === 'count') y = acc.count
    else if (agg === 'avg') y = acc.count === 0 ? 0 : acc.sum / acc.count
    else y = acc.sum

    out.push({ x, y })
  }

  // if it's date buckets, lexical sort works with YYYY-MM(-DD)
  out.sort((a, b) => a.x.localeCompare(b.x))

  void colorField
  void sizeField

  return out
}

