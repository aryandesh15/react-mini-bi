import { useEffect, useMemo, useState } from 'react'
import { readJson, writeJson } from '../lib/storage'

export type ShelfId = 'x' | 'y' | 'color' | 'size'
export type ChartType = 'bar' | 'line' | 'scatter'
export type Agg = 'sum' | 'avg' | 'count'
export type DateBucket = 'day' | 'month' | 'year'

export type ShelfItem = { field: string }

export type ChartSpec = {
  chartType: ChartType
  agg: Agg
  bucket: DateBucket
  shelves: Record<ShelfId, ShelfItem[]>
}

const STORAGE_KEY = 'miniBI.chartSpec'

const emptyShelves: Record<ShelfId, ShelfItem[]> = { x: [], y: [], color: [], size: [] }

const defaultSpec: ChartSpec = {
  chartType: 'bar',
  agg: 'sum',
  bucket: 'month',
  shelves: emptyShelves,
}

function sanitizeSpec(v: any): ChartSpec {
  if (!v || typeof v !== 'object') return defaultSpec
  const shelves = v.shelves && typeof v.shelves === 'object' ? v.shelves : {}
  const safeShelves: ChartSpec['shelves'] = {
    x: Array.isArray(shelves.x) ? shelves.x.filter((it: any) => it?.field).map((it: any) => ({ field: String(it.field) })) : [],
    y: Array.isArray(shelves.y) ? shelves.y.filter((it: any) => it?.field).map((it: any) => ({ field: String(it.field) })) : [],
    color: Array.isArray(shelves.color)
      ? shelves.color.filter((it: any) => it?.field).map((it: any) => ({ field: String(it.field) }))
      : [],
    size: Array.isArray(shelves.size)
      ? shelves.size.filter((it: any) => it?.field).map((it: any) => ({ field: String(it.field) }))
      : [],
  }

  const chartType: ChartType = v.chartType === 'line' || v.chartType === 'scatter' ? v.chartType : 'bar'
  const agg: Agg = v.agg === 'avg' || v.agg === 'count' ? v.agg : 'sum'
  const bucket: DateBucket = v.bucket === 'day' || v.bucket === 'year' ? v.bucket : 'month'

  return { chartType, agg, bucket, shelves: safeShelves }
}

export function useChartSpec() {
  const [spec, setSpec] = useState<ChartSpec>(() => {
    const saved = readJson<ChartSpec>(STORAGE_KEY)
    return sanitizeSpec(saved)
  })

  useEffect(() => {
    writeJson(STORAGE_KEY, spec)
  }, [spec])

  function setChartType(chartType: ChartType) {
    setSpec((s) => ({ ...s, chartType }))
  }

  function setAgg(agg: Agg) {
    setSpec((s) => ({ ...s, agg }))
  }

  function setBucket(bucket: DateBucket) {
    setSpec((s) => ({ ...s, bucket }))
  }

  function addToShelf(shelf: ShelfId, field: string) {
    setSpec((s) => {
      const exists = s.shelves[shelf].some((it) => it.field === field)
      if (exists) return s
      return { ...s, shelves: { ...s.shelves, [shelf]: [...s.shelves[shelf], { field }] } }
    })
  }

  function removeFromShelf(shelf: ShelfId, field: string) {
    setSpec((s) => ({
      ...s,
      shelves: { ...s.shelves, [shelf]: s.shelves[shelf].filter((it) => it.field !== field) },
    }))
  }

  function moveInShelf(shelf: ShelfId, fromIdx: number, toIdx: number) {
    setSpec((s) => {
      const arr = [...s.shelves[shelf]]
      if (fromIdx < 0 || fromIdx >= arr.length) return s
      if (toIdx < 0 || toIdx >= arr.length) return s
      const [it] = arr.splice(fromIdx, 1)
      arr.splice(toIdx, 0, it)
      return { ...s, shelves: { ...s.shelves, [shelf]: arr } }
    })
  }

  function clearAll() {
    setSpec((s) => ({ ...s, shelves: emptyShelves }))
  }

  const value = useMemo(
    () => ({ spec, setChartType, setAgg, setBucket, addToShelf, removeFromShelf, moveInShelf, clearAll }),
    [spec]
  )

  return value
}
