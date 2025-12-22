import { useMemo, useState } from 'react'
import type { FieldInfo } from '../lib/inferTypes'
import { useDraggable } from '@dnd-kit/core'

type FieldStatsShape = Record<
  string,
  { nonEmpty: number; empty: number; distinct?: number; min?: number; max?: number }
>

type FilterMode = 'all' | 'dimensions' | 'measures'

type Props = {
  fields: FieldInfo[]
  fieldStats: FieldStatsShape
}

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

function isMeasure(type: FieldInfo['type']) {
  return type === 'number'
}

function DraggableFieldRow({ f, stats }: { f: FieldInfo; stats?: FieldStatsShape[string] }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `field:${f.name}`,
    data: { kind: 'field', field: f.name },
  })

  const style: React.CSSProperties = {
    padding: '6px 0',
    borderBottom: '1px solid #222',
    cursor: 'grab',
    opacity: isDragging ? 0.5 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  }

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span>{f.name}</span>
        {typeBadge(f.type)}
      </div>

      {stats ? (
        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.75 }}>
          <span>
            {stats.nonEmpty} values · {stats.empty} empty
          </span>
          {typeof stats.distinct === 'number' ? <span> · {stats.distinct} distinct</span> : null}
          {f.type === 'number' && stats.min !== undefined && stats.max !== undefined ? (
            <span>
              {' '}
              · min {stats.min} / max {stats.max}
            </span>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

export default function FieldPanel({ fields, fieldStats }: Props) {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<FilterMode>('all')

  const filteredFields = useMemo(() => {
    const q = query.trim().toLowerCase()

    return fields.filter((f) => {
      if (mode === 'measures' && !isMeasure(f.type)) return false
      if (mode === 'dimensions' && isMeasure(f.type)) return false
      if (!q) return true
      return f.name.toLowerCase().includes(q)
    })
  }, [fields, query, mode])

  return (
    <div style={{ border: '1px solid #333', borderRadius: 10, padding: 12 }}>
      <h2 style={{ marginTop: 0 }}>Fields</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fields…"
          aria-label="Search fields"
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #333',
            background: 'transparent',
            color: 'inherit',
          }}
        />

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as FilterMode)}
          aria-label="Filter fields"
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid #333',
            background: 'transparent',
            color: 'inherit',
          }}
        >
          <option value="all">All</option>
          <option value="dimensions">Dimensions</option>
          <option value="measures">Measures</option>
        </select>
      </div>

      {filteredFields.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, opacity: 0.8 }}>No matching fields.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredFields.map((f) => (
            <DraggableFieldRow key={f.name} f={f} stats={fieldStats[f.name]} />
          ))}
        </ul>
      )}
    </div>
  )
}
