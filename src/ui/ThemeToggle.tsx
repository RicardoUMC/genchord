interface ThemeToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export function ThemeToggle({ enabled, onChange }: ThemeToggleProps) {
  return (
    <button
      type="button"
      className={`studio-mode-toggle${enabled ? ' is-active' : ''}`}
      aria-pressed={enabled}
      onClick={() => onChange(!enabled)}
    >
      Studio Mode: {enabled ? 'On' : 'Off'}
    </button>
  )
}
