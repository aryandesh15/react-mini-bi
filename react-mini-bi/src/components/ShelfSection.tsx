import Shelf from './Shelf'
import type { ChartSpec, ShelfId } from '../hooks/useChartSpec'

type Props = {
  spec: ChartSpec
  allFields: string[]
  onAdd: (shelfId: ShelfId, field: string) => void
  onRemove: (shelfId: ShelfId, field: string) => void
  onMove: (shelfId: ShelfId, fromIdx: number, toIdx: number) => void
  onClearAll: () => void
}

export default function ShelfSection({ spec, allFields, onAdd, onRemove, onMove, onClearAll }: Props) {
  return (
    <div style={{ border: '1px solid #333', borderRadius: 10, padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 }}>
        <h2 style={{ margin: 0 }}>Shelves</h2>
        <button onClick={onClearAll}>Clear</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 12 }}>
        <Shelf
          title="X"
          shelfId="x"
          items={spec.shelves.x}
          onAdd={onAdd}
          onRemove={onRemove}
          onMove={onMove}
          allFields={allFields}
        />
        <Shelf
          title="Y"
          shelfId="y"
          items={spec.shelves.y}
          onAdd={onAdd}
          onRemove={onRemove}
          onMove={onMove}
          allFields={allFields}
        />
        <Shelf
          title="Color"
          shelfId="color"
          items={spec.shelves.color}
          onAdd={onAdd}
          onRemove={onRemove}
          onMove={onMove}
          allFields={allFields}
        />
        <Shelf
          title="Size (optional)"
          shelfId="size"
          items={spec.shelves.size}
          onAdd={onAdd}
          onRemove={onRemove}
          onMove={onMove}
          allFields={allFields}
        />
      </div>
    </div>
  )
}
