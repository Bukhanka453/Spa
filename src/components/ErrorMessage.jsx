export default function ErrorMessage({ children, onRetry }) {
  if (!children) return null
  return (
    <div className="error-box">
      <p>{children}</p>
      {onRetry && (
        <button className="btn" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  )
}