import { useMemo, useState } from 'react'

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

const emptyShelves: Record<ShelfId, ShelfItem[]> = { x: [], y: [], color: [], size: [] }

export function useChartSpec() {
  const [spec, setSpec] = useState<ChartSpec>({
    chartType: 'bar',
    agg: 'sum',
    bucket: 'month',
    shelves: emptyShelves,
  })

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
      return {
        ...s,
        shelves: { ...s.shelves, [shelf]: [...s.shelves[shelf], { field }] },
      }
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
