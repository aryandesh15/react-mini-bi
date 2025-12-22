import { useMemo, useState } from 'react'
import { parseCsvText } from '../lib/parseCsv'
import type { Row } from '../lib/parseCsv'
import { inferFieldTypes } from '../lib/inferTypes'
import type { FieldInfo } from '../lib/inferTypes'
import { computeFieldStats } from '../lib/fieldStats'

type FieldStatsShape = Record<
  string,
  { nonEmpty: number; empty: number; distinct?: number; min?: number; max?: number }
>

type DatasetState = {
  rows: Row[]
  fields: FieldInfo[]
  fieldStats: FieldStatsShape
  error: string | null
  isLoading: boolean
}

export function useDataset() {
  const [rows, setRows] = useState<Row[]>([])
  const [fields, setFields] = useState<FieldInfo[]>([])
  const [fieldStats, setFieldStats] = useState<FieldStatsShape>({})
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
      const stats = computeFieldStats(parsed.rows, infos)
      setRows(parsed.rows)
      setFields(infos)
      setFieldStats(stats)
    } catch (e) {
      setRows([])
      setFields([])
      setFieldStats({})
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
      const stats = computeFieldStats(parsed.rows, infos)
      setRows(parsed.rows)
      setFields(infos)
      setFieldStats(stats)
    } catch (e) {
      setRows([])
      setFields([])
      setFieldStats({})
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const state: DatasetState = useMemo(
    () => ({ rows, fields, fieldStats, error, isLoading }),
    [rows, fields, fieldStats, error, isLoading]
  )

  return { ...state, loadFromUrl, loadFromFile }
}
