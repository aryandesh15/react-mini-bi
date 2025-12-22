import type { FieldInfo } from './inferTypes'
import type { ChartType } from '../hooks/useChartSpec'

function typeOf(fields: FieldInfo[], name?: string) {
  if (!name) return null
  return fields.find((f) => f.name === name)?.type ?? null
}

export function suggestChartType(args: {
  fields: FieldInfo[]
  xField?: string
  yField?: string
  colorField?: string
  sizeField?: string
}): ChartType {
  const { fields, xField, yField, colorField, sizeField } = args

  const xType = typeOf(fields, xField)
  const yType = typeOf(fields, yField)
  const colorType = typeOf(fields, colorField)
  const sizeType = typeOf(fields, sizeField)

  // Bubble / scatter
  if (sizeType === 'number') return 'scatter'

  // Numeric vs numeric
  if (xType === 'number' && yType === 'number') return 'scatter'

  // Time series
  if (xType === 'date' && yType === 'number') return 'line'

  // Split series over time
  if (colorType && xType === 'date') return 'line'

  return 'bar'
}
