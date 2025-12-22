import type { ChartPoint } from './aggregate'

export type SortDir = 'asc' | 'desc'

export function sortChartData(data: ChartPoint[], dir: SortDir) {
  if (dir === 'asc') return [...data].sort((a, b) => a.y - b.y)
  return [...data].sort((a, b) => b.y - a.y)
}
