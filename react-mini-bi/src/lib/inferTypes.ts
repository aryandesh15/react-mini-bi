export type FieldType = 'string' | 'number' | 'date' | 'boolean'

export type FieldInfo = {
  name: string
  type: FieldType
}

function isBoolean(v: string) {
  const x = v.trim().toLowerCase()
  return x === 'true' || x === 'false'
}

function isNumber(v: string) {
  if (v.trim() === '') return false
  return Number.isFinite(Number(v))
}

function isDate(v: string) {
  const t = Date.parse(v)
  return Number.isFinite(t)
}

export function inferFieldTypes(rows: Record<string, unknown>[], fields: string[]): FieldInfo[] {
  const sampleSize = Math.min(rows.length, 50)

  return fields.map((name) => {
    let nBool = 0
    let nNum = 0
    let nDate = 0
    let nStr = 0
    let seen = 0

    for (let i = 0; i < sampleSize; i++) {
      const raw = rows[i]?.[name]
      if (raw === null || raw === undefined) continue
      const s = String(raw).trim()
      if (s === '') continue

      seen++
      if (isBoolean(s)) nBool++
      else if (isNumber(s)) nNum++
      else if (isDate(s)) nDate++
      else nStr++
    }

    const type =
      seen === 0
        ? 'string'
        : nStr > 0
          ? 'string'
          : nDate > 0 && nDate >= nNum
            ? 'date'
            : nNum > 0
              ? 'number'
              : nBool > 0
                ? 'boolean'
                : 'string'

    return { name, type }
  })
}
