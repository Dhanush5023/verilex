export default function RiskBadge({ level, score }) {
  const map = {
    SAFE:     'badge-safe',
    LOW:      'badge-low',
    MEDIUM:   'badge-medium',
    HIGH:     'badge-high',
    CRITICAL: 'badge-critical',
  }
  const cls = map[level?.toUpperCase()] || 'badge-medium'
  return (
    <span className={`badge ${cls}`}>
      {level || 'UNKNOWN'} {score != null ? `(${typeof score === 'number' ? score.toFixed(1) : score})` : ''}
    </span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    uploaded:   'badge-processing',
    processing: 'badge-processing',
    ready:      'badge-ready',
    error:      'badge-error',
  }
  return <span className={`badge ${map[status] || 'badge-blue'}`}>{status}</span>
}
