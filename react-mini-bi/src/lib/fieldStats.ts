import type { Row } from './parseCsv'
import type { FieldInfo, FieldType } from './inferTypes'

export type FieldStats = {
  nonEmpty: number
  empty: number
  distinct?: number
  min?: number
  max?: number
}

function isEmpty(v: unknown) {
  if (v === null || v === undefined) return true
  const s = String(v).trim()
  return s === ''
}

function asNumber(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function computeFieldStats(rows: Row[], fields: FieldInfo[]) {
  const out: Record<string, FieldStats> = {}

  for (const f of fields) {
    const name = f.name
    const type: FieldType = f.type

    let nonEmpty = 0
    let empty = 0
    const distinctSet = new Set<string>()

    let min: number | undefined
    let max: number | undefined

    for (const r of rows) {
      const v = r[name]
      if (isEmpty(v)) {
        empty++
        continue
      }
      nonEmpty++

      distinctSet.add(String(v))

      if (type === 'number') {
        const n = asNumber(v)
        if (n === null) continue
        if (min === undefined || n < min) min = n
        if (max === undefined || n > max) max = n
      }
    }

    const stats: FieldStats = {
      nonEmpty,
      empty,
      distinct: distinctSet.size,
    }

    if (type === 'number') {
      stats.min = min
      stats.max = max
    }

    out[name] = stats
  }

  return out
}
