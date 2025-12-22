import type { ChartPoint } from '../lib/aggregate'
import type { ChartType } from '../hooks/useChartSpec'

type Props = {
  data: ChartPoint[]
  chartType: ChartType
  width?: number
  height?: number
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

export default function ChartCanvas({ data, chartType, width = 520, height = 280 }: Props) {
  const pad = { l: 44, r: 14, t: 14, b: 34 }
  const innerW = Math.max(1, width - pad.l - pad.r)
  const innerH = Math.max(1, height - pad.t - pad.b)

  const ys = data.map((d) => d.y)
  const yMin = 0
  const yMax = ys.length ? Math.max(...ys) : 1

  function xPos(i: number, n: number) {
    if (n <= 1) return pad.l + innerW / 2
    return pad.l + (i / (n - 1)) * innerW
  }

  function yPos(v: number) {
    const t = yMax === yMin ? 0 : (v - yMin) / (yMax - yMin)
    return pad.t + (1 - clamp(t, 0, 1)) * innerH
  }

  const axisStyle = { stroke: '#444', strokeWidth: 1 }
  const gridStyle = { stroke: '#222', strokeWidth: 1 }

  const ticks = 4
  const yTickVals = Array.from({ length: ticks + 1 }, (_, i) => (yMax * i) / ticks)

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={width} height={height} role="img" aria-label="Chart">
        {/* Grid + y ticks */}
        {yTickVals.map((v) => {
          const y = yPos(v)
          return (
            <g key={v}>
              <line x1={pad.l} y1={y} x2={pad.l + innerW} y2={y} style={gridStyle} />
              <text x={pad.l - 8} y={y + 4} fontSize={11} textAnchor="end" fill="currentColor" opacity={0.8}>
                {Number.isFinite(v) ? (v % 1 === 0 ? String(v) : v.toFixed(2)) : ''}
              </text>
            </g>
          )
        })}

        {/* Axes */}
        <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} style={axisStyle} />
        <line x1={pad.l} y1={pad.t + innerH} x2={pad.l + innerW} y2={pad.t + innerH} style={axisStyle} />

        {/* X labels (downsample if many) */}
        {data.map((d, i) => {
          const n = data.length
          const step = n > 14 ? Math.ceil(n / 14) : 1
          if (i % step !== 0) return null
          const x = xPos(i, n)
          return (
            <text
              key={d.x + i}
              x={x}
              y={pad.t + innerH + 22}
              fontSize={11}
              textAnchor="middle"
              fill="currentColor"
              opacity={0.8}
            >
              {d.x}
            </text>
          )
        })}

        {/* Series */}
        {chartType === 'bar' ? (
          <BarSeries data={data} xPos={xPos} yPos={yPos} padL={pad.l} baseY={pad.t + innerH} innerW={innerW} />
        ) : null}

        {chartType === 'line' ? <LineSeries data={data} xPos={xPos} yPos={yPos} /> : null}

        {chartType === 'scatter' ? <ScatterSeries data={data} xPos={xPos} yPos={yPos} /> : null}
      </svg>
    </div>
  )
}

function BarSeries({
  data,
  xPos,
  yPos,
  baseY,
  innerW,
  padL,
}: {
  data: ChartPoint[]
  xPos: (i: number, n: number) => number
  yPos: (v: number) => number
  baseY: number
  innerW: number
  padL: number
}) {
  const n = data.length
  const band = n <= 1 ? innerW : innerW / n
  const barW = Math.max(6, Math.min(32, band * 0.7))

  return (
    <>
      {data.map((d, i) => {
        const cx = xPos(i, n)
        const minX = padL + 2
        const maxX = padL + innerW - barW - 2
        const x = Math.max(minX, Math.min(maxX, cx - barW / 2))
        const y = yPos(d.y)
        const h = Math.max(0, baseY - y)
        return <rect key={d.x + i} x={x} y={y} width={barW} height={h} fill="currentColor" opacity={0.8} />
      })}
      {/* keep bars inside axis */}
      <rect x={padL} y={0} width={0} height={0} fill="transparent" />
    </>
  )
}

function LineSeries({
  data,
  xPos,
  yPos,
}: {
  data: ChartPoint[]
  xPos: (i: number, n: number) => number
  yPos: (v: number) => number
}) {
  const n = data.length
  const path = data
    .map((d, i) => {
      const x = xPos(i, n)
      const y = yPos(d.y)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  return (
    <>
      <path d={path} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.9} />
      {data.map((d, i) => {
        const x = xPos(i, n)
        const y = yPos(d.y)
        return <circle key={d.x + i} cx={x} cy={y} r={3} fill="currentColor" opacity={0.9} />
      })}
    </>
  )
}

function ScatterSeries({
  data,
  xPos,
  yPos,
}: {
  data: ChartPoint[]
  xPos: (i: number, n: number) => number
  yPos: (v: number) => number
}) {
  const n = data.length
  return (
    <>
      {data.map((d, i) => {
        const x = xPos(i, n)
        const y = yPos(d.y)
        return <circle key={d.x + i} cx={x} cy={y} r={4} fill="currentColor" opacity={0.85} />
      })}
    </>
  )
}
