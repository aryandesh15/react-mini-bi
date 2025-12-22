import type { Row } from './parseCsv'

export type FilterOp = 'contains' | 'eq' | 'gt' | 'lt'

export type Filter = {
  field: string
  op: FilterOp
  value: string
}

export function applyFilters(rows: Row[], filters: Filter[]) {
  if (filters.length === 0) return rows

  return rows.filter((r) => {
    return filters.every((f) => {
      const raw = r[f.field]
      if (raw == null) return false

      const v = String(raw)
      const q = f.value

      if (f.op === 'contains') return v.toLowerCase().includes(q.toLowerCase())
      if (f.op === 'eq') return v === q

      const n = Number(v)
      const qn = Number(q)
      if (!Number.isFinite(n) || !Number.isFinite(qn)) return false

      if (f.op === 'gt') return n > qn
      if (f.op === 'lt') return n < qn

      return true
    })
  })
}
