type Props = {
  label: string
  onRemove: () => void
  onMoveLeft?: () => void
  onMoveRight?: () => void
}

export default function ShelfChip({ label, onRemove, onMoveLeft, onMoveRight }: Props) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        border: '1px solid #333',
        borderRadius: 999,
        padding: '6px 10px',
      }}
    >
      <span style={{ fontSize: 13 }}>{label}</span>

      <div style={{ display: 'inline-flex', gap: 4 }}>
        {onMoveLeft ? (
          <button onClick={onMoveLeft} aria-label={`Move ${label} left`} style={{ padding: '0 6px' }}>
            ◀
          </button>
        ) : null}
        {onMoveRight ? (
          <button onClick={onMoveRight} aria-label={`Move ${label} right`} style={{ padding: '0 6px' }}>
            ▶
          </button>
        ) : null}
        <button onClick={onRemove} aria-label={`Remove ${label}`} style={{ padding: '0 6px' }}>
          ✕
        </button>
      </div>
    </div>
  )
}
