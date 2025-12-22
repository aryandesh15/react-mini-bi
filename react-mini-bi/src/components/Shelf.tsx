import ShelfChip from './ShelfChip'
import type { ShelfId, ShelfItem } from '../hooks/useChartSpec'

type Props = {
  title: string
  shelfId: ShelfId
  items: ShelfItem[]
  onAdd?: (shelfId: ShelfId, field: string) => void
  onRemove: (shelfId: ShelfId, field: string) => void
  onMove: (shelfId: ShelfId, fromIdx: number, toIdx: number) => void
  allFields: string[]
}

export default function Shelf({ title, shelfId, items, onAdd, onRemove, onMove, allFields }: Props) {
  return (
    <div style={{ border: '1px solid #333', borderRadius: 10, padding: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <div style={{ fontWeight: 600 }}>{title}</div>

        {onAdd ? (
          <select
            value=""
            onChange={(e) => {
              const v = e.target.value
              if (v) onAdd(shelfId, v)
            }}
            aria-label={`Add field to ${title}`}
            style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #333', background: 'transparent' }}
          >
            <option value="">Add…</option>
            {allFields.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        ) : null}
      </div>

      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 38 }}>
        {items.length === 0 ? (
          <div style={{ fontSize: 12, opacity: 0.7 }}>Drop field here (next step) or use Add…</div>
        ) : (
          items.map((it, idx) => (
            <ShelfChip
              key={it.field}
              label={it.field}
              onRemove={() => onRemove(shelfId, it.field)}
              onMoveLeft={idx > 0 ? () => onMove(shelfId, idx, idx - 1) : undefined}
              onMoveRight={idx < items.length - 1 ? () => onMove(shelfId, idx, idx + 1) : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}
