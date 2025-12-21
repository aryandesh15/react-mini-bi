import { useEffect } from 'react'
import { useDataset } from '../hooks/useDataset'

function typeBadge(t: string) {
  const style: React.CSSProperties = {
    fontSize: 12,
    padding: '2px 8px',
    borderRadius: 999,
    border: '1px solid #444',
    display: 'inline-block',
    marginLeft: 8,
  }
  return <span style={style}>{t}</span>
}

export default function Workspace() {
  const { rows, fields, error, isLoading, loadFromFile, loadFromUrl } = useDataset()

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
        <div style={{ flex: '0 0 340px', border: '1px solid #333', borderRadius: 10, padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Fields</h2>
          {fields.length === 0 ? (
            <p style={{ margin: 0 }}>No fields loaded.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {fields.map((f) => (
                <li key={f.name} style={{ padding: '6px 0', borderBottom: '1px solid #222' }}>
                  <span>{f.name}</span>
                  {typeBadge(f.type)}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ flex: 1, border: '1px solid #333', borderRadius: 10, padding: 12 }}>
          <h2 style={{ marginTop: 0 }}>Dataset</h2>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Rows</div>
              <div style={{ fontSize: 20 }}>{rows.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Fields</div>
              <div style={{ fontSize: 20 }}>{fields.length}</div>
            </div>
          </div>

          <div style={{ marginTop: 16, fontSize: 13, opacity: 0.8 }}>
            Next: preview table + pagination.
          </div>
        </div>
      </div>
    </div>
  )
}
