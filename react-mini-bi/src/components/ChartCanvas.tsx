import { useEffect, useRef } from 'react'
import type { ChartPoint } from '../lib/aggregate'
import type { ChartType } from '../hooks/useChartSpec'

type Props = {
  data: ChartPoint[]
  chartType: ChartType
  width?: number
  height?: number
  onSvgRef?: (el: SVGSVGElement | null) => void
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

function formatXLabel(v: string) {
  const s = String(v)
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(5, 10)
  if (s.length > 12) return s.slice(0, 12) + '…'
  return s
}

export default function ChartCanvas({ data, chartType, width = 520, height = 280, onSvgRef }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    onSvgRef?.(svgRef.current)
    return () => onSvgRef?.(null)
  }, [onSvgRef])

  const pad = { l: 44, r: 14, t: 14, b: 56 }

  const minPxPerPoint = 64
  const vbW = Math.max(width, data.length * minPxPerPoint)
  const vbH = height

  const innerW = Math.max(1, vbW - pad.l - pad.r)
  const innerH = Math.max(1, vbH - pad.t - pad.b)

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

  const n = data.length
  const xLabelY = pad.t + innerH + 30

  return (
    <div style={{ width: '100%', height: '100%', overflowX: 'auto' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${vbW} ${vbH}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Chart"
        style={{ display: 'block', overflow: 'hidden' }}
      >
        <defs>
          <clipPath id="chartClip">
            <rect x="0" y="0" width={vbW} height={vbH} />
          </clipPath>
        </defs>

        <g clipPath="url(#chartClip)">
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

          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={pad.t + innerH} style={axisStyle} />
          <line x1={pad.l} y1={pad.t + innerH} x2={pad.l + innerW} y2={pad.t + innerH} style={axisStyle} />

          {data.map((d, i) => {
            const step = n > 14 ? Math.ceil(n / 14) : 1
            if (i % step !== 0) return null

            const rawX = xPos(i, n)
            const x = clamp(rawX, pad.l + 2, pad.l + innerW - 2)
            const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'

            return (
              <text
                key={String(d.x) + i}
                x={x}
                y={xLabelY}
                fontSize={11}
                textAnchor={anchor}
                fill="currentColor"
                opacity={0.8}
              >
                {formatXLabel(d.x)}
              </text>
            )
          })}

          {chartType === 'bar' ? (
            <BarSeries data={data} xPos={xPos} yPos={yPos} padL={pad.l} baseY={pad.t + innerH} innerW={innerW} />
          ) : null}

          {chartType === 'line' ? <LineSeries data={data} xPos={xPos} yPos={yPos} /> : null}

          {chartType === 'scatter' ? <ScatterSeries data={data} xPos={xPos} yPos={yPos} /> : null}
        </g>
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
  const barW = Math.max(6, Math.min(40, band * 0.7))

  return (
    <>
      {data.map((d, i) => {
        const cx = xPos(i, n)
        const minX = padL + 2
        const maxX = padL + innerW - barW - 2
        const x = Math.max(minX, Math.min(maxX, cx - barW / 2))
        const y = yPos(d.y)
        const h = Math.max(0, baseY - y)
        return <rect key={String(d.x) + i} x={x} y={y} width={barW} height={h} fill="currentColor" opacity={0.8} />
      })}
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
        return <circle key={String(d.x) + i} cx={x} cy={y} r={3} fill="currentColor" opacity={0.9} />
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
        return <circle key={String(d.x) + i} cx={x} cy={y} r={4} fill="currentColor" opacity={0.85} />
      })}
    </>
  )
}
