interface MusicalContextToggleProps {
  expanded: boolean
  disabled?: boolean
  onToggle: () => void
}

export function MusicalContextToggle({ expanded, disabled = false, onToggle }: MusicalContextToggleProps) {
  return (
    <button
      type="button"
      className="auto-chords-toggle"
      aria-expanded={expanded}
      aria-controls="musical-context-panel"
      disabled={disabled}
      onClick={onToggle}
    >
      Musical context: {expanded ? 'Hide' : 'Show'}
    </button>
  )
}
