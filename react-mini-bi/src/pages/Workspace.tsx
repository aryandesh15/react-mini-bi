import { useEffect, useState } from 'react'
import { useDataset } from '../hooks/useDataset'
import DataTable from '../components/DataTable'
import FieldPanel from '../components/FieldPanel'
import ShelfSection from '../components/ShelfSection'
import { useChartSpec } from '../hooks/useChartSpec'
import { DndContext } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { buildChartData } from '../lib/aggregate'
import ChartCanvas from '../components/ChartCanvas'
import { suggestChartType } from '../lib/chartSuggestions'
import { applyFilters, type Filter } from '../lib/filters'
import { sortChartData, type SortDir } from '../lib/sort'
import { useTheme } from '../hooks/useTheme'
import { downloadPng, downloadSvg } from '../lib/exportChart'



export default function Workspace() {
  const { rows, fields, fieldStats, error, isLoading, loadFromFile, loadFromUrl } = useDataset()
  const [chartSvg, setChartSvg] = useState<SVGSVGElement | null>(null)

  const {
    spec,
    setChartType,
    setChartTypeMode,
    applySuggestedChartType,
    setAgg,
    setBucket,
    addToShelf,
    removeFromShelf,
    moveInShelf,
    clearAll,
  } = useChartSpec()

  const [filters, setFilters] = useState<Filter[]>([])
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const xField = spec.shelves.x[0]?.field
  const yField = spec.shelves.y[0]?.field
  const colorField = spec.shelves.color[0]?.field
  const sizeField = spec.shelves.size[0]?.field

  const suggestedChart = suggestChartType({
    fields,
    xField,
    yField,
    colorField,
    sizeField,
  })

  const { theme, toggleTheme } = useTheme()


  useEffect(() => {
    applySuggestedChartType(suggestedChart)
  }, [suggestedChart])

  const filteredRows = applyFilters(rows, filters)

  const chartData = sortChartData(
    buildChartData({
      rows: filteredRows,
      xField,
      yField,
      colorField,
      sizeField,
      agg: spec.agg,
      bucket: spec.bucket,
    }),
    sortDir
  )

  function onDragEnd(event: DragEndEvent) {
    const activeData = event.active.data.current as any
    const overData = event.over?.data.current as any

    if (!event.over) return
    if (activeData?.kind !== 'field') return
    if (overData?.kind !== 'shelf') return

    const field = String(activeData.field)
    const shelfId = overData.shelfId as any

    addToShelf(shelfId, field)
  }

  useEffect(() => {
    loadFromUrl('/data/sample.csv')
  }, [])

  return (
    <div style={{padding: 24, maxWidth: '100%', margin: 0 }}>
      <div
        aria-live="polite"
        style={{ position: 'absolute', left: -9999, top: 'auto', width: 1, height: 1, overflow: 'hidden' }}
      >
        {error ? `Error: ${error}` : ''}
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <h1 style={{ marginBottom: 8 }}>Mini BI Workspace</h1>
        <p style={{ marginTop: 0, marginBottom: 16, opacity: 0.85 }}>Load a CSV to begin</p>
      </div>

  <button onClick={toggleTheme} aria-label="Toggle theme">
    {theme === 'dark' ? 'Light mode' : 'Dark mode'}
  </button>
</div>


      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <label>
          <span style={{ marginRight: 8 }}>Upload CSV:</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) loadFromFile(f)
            }}
          />
        </label>

        <button
          onClick={() => loadFromUrl('/data/sample.csv')}
          disabled={isLoading}
          style={{ padding: '6px 10px' }}
        >
          Load sample.csv
        </button>

        {isLoading ? <span>Loading…</span> : null}
      </div>

      {error ? (
        <div role="alert" style={{ padding: 12, border: '1px solid #aa3333', borderRadius: 8 }}>
          {error}
        </div>
      ) : null}

      <DndContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 16 }}>
          {/* LEFT PANEL */}
          <div style={{ flex: '0 0 340px' }}>
            <FieldPanel fields={fields} fieldStats={fieldStats} />
          </div>

          {/* RIGHT PANEL */}
          <div style={{ flex: 1, border: '1px solid #333', borderRadius: 10, padding: 12 }}>
            <h2 style={{ marginTop: 0 }}>Workspace</h2>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Mode</span>
                <select
                  value={spec.chartTypeMode}
                  onChange={(e) => setChartTypeMode(e.target.value as any)}
                  style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #333', background: 'transparent' }}
                >
                  <option value="auto">Auto</option>
                  <option value="manual">Manual</option>
                </select>
              </label>

              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Chart</span>
                <select
                  value={spec.chartType}
                  onChange={(e) => setChartType(e.target.value as any)}
                  disabled={spec.chartTypeMode === 'auto'}
                  style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #333', background: 'transparent' }}
                >
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="scatter">Scatter</option>
                </select>
              </label>

              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Agg</span>
                <select
                  value={spec.agg}
                  onChange={(e) => setAgg(e.target.value as any)}
                  style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #333', background: 'transparent' }}
                >
                  <option value="sum">Sum</option>
                  <option value="avg">Avg</option>
                  <option value="count">Count</option>
                </select>
              </label>

              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Bucket</span>
                <select
                  value={spec.bucket}
                  onChange={(e) => setBucket(e.target.value as any)}
                  style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #333', background: 'transparent' }}
                >
                  <option value="day">Day</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </label>

              {spec.chartTypeMode === 'auto' ? (
                <div style={{ fontSize: 12, opacity: 0.75 }}>Suggested: {suggestedChart}</div>
              ) : null}
            </div>

            {/* FILTERS + SORT */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
              <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Filter field</span>
                <select
                  onChange={(e) => {
                    const f = e.target.value
                    if (!f) return
                    setFilters([{ field: f, op: 'contains', value: '' }])
                  }}
                  style={{ padding: '4px 6px' }}
                >
                  <option value="">—</option>
                  {fields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </label>

              {filters[0] ? (
                <>
                  <select
                    value={filters[0].op}
                    onChange={(e) => setFilters([{ ...filters[0], op: e.target.value as any }])}
                    style={{ padding: '4px 6px' }}
                  >
                    <option value="contains">contains</option>
                    <option value="eq">=</option>
                    <option value="gt">&gt;</option>
                    <option value="lt">&lt;</option>
                  </select>

                  <input
                    value={filters[0].value}
                    onChange={(e) => setFilters([{ ...filters[0], value: e.target.value }])}
                    placeholder="value"
                    style={{ padding: '4px 6px', width: 120 }}
                  />

                  <button onClick={() => setFilters([])}>Clear</button>
                </>
              ) : null}

              <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>Sort</span>
                <select
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value as SortDir)}
                  style={{ padding: '4px 6px' }}
                >
                  <option value="desc">Y ↓</option>
                  <option value="asc">Y ↑</option>
                </select>
              </label>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '380px 1fr', gap: 12 }}>
              <ShelfSection
                spec={spec}
                allFields={fields.map((f) => f.name)}
                onAdd={addToShelf}
                onRemove={removeFromShelf}
                onMove={moveInShelf}
                onClearAll={clearAll}
              />

              <div style={{ border: '1px solid #333', borderRadius: 10, padding: 12 }}>
                <h3 style={{ marginTop: 0 }}>Chart</h3>

                {spec.shelves.x.length === 0 || spec.shelves.y.length === 0 ? (
                  <div style={{ fontSize: 13, opacity: 0.8 }}>
                    Add at least one field to <b>X</b> and <b>Y</b> to render a chart.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ fontSize: 13, opacity: 0.8 }}>Data ready: {chartData.length} points</div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => chartSvg && downloadSvg(chartSvg, 'chart.svg')}
                          disabled={!chartSvg}
                          aria-label="Export chart as SVG"
                        >
                          Export SVG
                        </button>
                        <button
                          onClick={async () => chartSvg && (await downloadPng(chartSvg, 'chart.png'))}
                          disabled={!chartSvg}
                          aria-label="Export chart as PNG"
                        >
                          Export PNG
                        </button>
                      </div>
                    </div>


                    <div
                      style={{
                        marginTop: 10,
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: 10,
                        height: 320,
                      }}
                    >
                      <ChartCanvas data={chartData} chartType={spec.chartType} onSvgRef={setChartSvg} />
                    </div>

                  </>
                )}

                <div style={{ marginTop: 16 }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>Preview</h3>
                  <DataTable rows={filteredRows} columns={fields.map((f) => f.name)} pageSize={8} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  )
}
