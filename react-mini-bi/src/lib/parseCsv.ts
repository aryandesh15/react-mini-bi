import Papa from 'papaparse'

export type Row = Record<string, unknown>

export type ParseResult = {
  rows: Row[]
  fields: string[]
}

export function parseCsvText(csvText: string): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors?.length) {
          reject(new Error(results.errors[0].message))
          return
        }
        const rows = (results.data as Row[]) ?? []
        const fields = (results.meta.fields ?? []).filter(Boolean) as string[]
        resolve({ rows, fields })
      },
    })
  })
}
