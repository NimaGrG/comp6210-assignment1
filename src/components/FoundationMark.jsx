export default function FoundationMark({ compact = false }) {
  return (
    <span className={`foundation-mark${compact ? ' foundation-mark--compact' : ''}`} aria-hidden="true">
      <span className="foundation-mark__ring" />
      <span className="foundation-mark__core">SCP</span>
    </span>
  )
}
