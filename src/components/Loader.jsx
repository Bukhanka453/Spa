export default function Loader({ text = 'Загрузка...' }) {
  return (
    <div className="loader">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  )
}