export default function LoadingSpinner({ text = 'Loading...', size = 'default' }) {
  return (
    <div className="loading-container">
      <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
      {text && <p className="text-secondary text-sm">{text}</p>}
    </div>
  )
}
