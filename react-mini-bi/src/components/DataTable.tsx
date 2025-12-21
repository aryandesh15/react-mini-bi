import { useMemo, useState } from 'react'
import type { Row } from '../lib/parseCsv'

type Props = {
  rows: Row[]
  columns: string[]
  pageSize?: number
}

export default function DataTable({ rows, columns, pageSize = 10 }: Props) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, page, pageSize])

  function goPrev() {
    setPage((p) => Math.max(1, p - 1))
  }

  function goNext() {
    setPage((p) => Math.min(totalPages, p + 1))
  }

  const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  }

  const cellStyle: React.CSSProperties = {
    borderBottom: '1px solid #222',
    padding: '8px 6px',
    verticalAlign: 'top',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    maxWidth: 240,
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, rows.length)} of {rows.length}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={goPrev} disabled={page === 1}>
            Prev
          </button>
          <span style={{ fontSize: 12 }}>
            Page {page} / {totalPages}
          </span>
          <button onClick={goNext} disabled={page === totalPages}>
            Next
          </button>
        </div>
      </div>

      <div style={{ marginTop: 10, overflowX: 'auto' }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} style={{ ...cellStyle, textAlign: 'left', fontSize: 12, opacity: 0.85 }}>
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, idx) => (
              <tr key={idx}>
                {columns.map((c) => (
                  <td key={c} style={cellStyle}>
                    {String(r[c] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 ? (
          <div style={{ padding: 12, fontSize: 13, opacity: 0.8 }}>No rows to preview.</div>
        ) : null}
      </div>
    </div>
  )
}
