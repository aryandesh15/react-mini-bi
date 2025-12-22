import { useEffect } from 'react'
import { useDataset } from '../hooks/useDataset'
import DataTable from '../components/DataTable'
import FieldPanel from '../components/FieldPanel'
import ShelfSection from '../components/ShelfSection'
import { useChartSpec } from '../hooks/useChartSpec'


export default function Workspace() {
  const { rows, fields, fieldStats, error, isLoading, loadFromFile, loadFromUrl } = useDataset()
  const { spec, setChartType, setAgg, setBucket, addToShelf, removeFromShelf, moveInShelf, clearAll } = useChartSpec()


  useEffect(() => {
    loadFromUrl('/data/sample.csv')
  }, [])

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>Mini BI Workspace</h1>
      <p style={{ marginTop: 0, marginBottom: 16 }}>Load a CSV to begin</p>

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
              <span style={{ fontSize: 12, opacity: 0.8 }}>Chart</span>
              <select
                value={spec.chartType}
                onChange={(e) => setChartType(e.target.value as any)}
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
              <div style={{ fontSize: 13, opacity: 0.8 }}>Next: render charts based on shelves.</div>

              <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '0 0 8px 0' }}>Preview</h3>
                <DataTable rows={rows} columns={fields.map((f) => f.name)} pageSize={8} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
