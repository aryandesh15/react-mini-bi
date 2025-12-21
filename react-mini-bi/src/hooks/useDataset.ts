import { useMemo, useState } from 'react'
import { parseCsvText, Row } from '../lib/parseCsv'
import { FieldInfo, inferFieldTypes } from '../lib/inferTypes'

type DatasetState = {
  rows: Row[]
  fields: FieldInfo[]
  error: string | null
  isLoading: boolean
}

export function useDataset() {
  const [rows, setRows] = useState<Row[]>([])
  const [fields, setFields] = useState<FieldInfo[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function loadFromUrl(url: string) {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`)
      const text = await res.text()
      const parsed = await parseCsvText(text)
      const infos = inferFieldTypes(parsed.rows, parsed.fields)
      setRows(parsed.rows)
      setFields(infos)
    } catch (e) {
      setRows([])
      setFields([])
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadFromFile(file: File) {
    setIsLoading(true)
    setError(null)
    try {
      const text = await file.text()
      const parsed = await parseCsvText(text)
      const infos = inferFieldTypes(parsed.rows, parsed.fields)
      setRows(parsed.rows)
      setFields(infos)
    } catch (e) {
      setRows([])
      setFields([])
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const state: DatasetState = useMemo(
    () => ({ rows, fields, error, isLoading }),
    [rows, fields, error, isLoading]
  )

  return { ...state, loadFromUrl, loadFromFile }
}
