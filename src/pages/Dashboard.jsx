import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'

export default function Dashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    setError('')
    api.get('/appointments')
      .then(({ data }) => setAppointments(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div className="container">
      <h1>Личный кабинет</h1>
      <p>Привет, <strong>{user.fullName}</strong>!</p>

      <h2>Мои записи</h2>
      {loading && <Loader text="Загружаем записи..." />}
      <ErrorMessage onRetry={load}>{error}</ErrorMessage>

      {!loading && !error && appointments.length === 0 && (
        <p>Записей пока нет.</p>
      )}

      {!loading && appointments.length > 0 && (
        <ul className="cart-list">
          {appointments.map((a) => (
            <li key={a.id} className="cart-item">
              <span className="cart-name">
                {a.serviceTitle}
                <em> · {new Date(a.scheduledAt).toLocaleString('ru-RU')}</em>
              </span>
              <span className="cart-price">{a.price.toLocaleString()} ₽</span>
              <span className="badge">{a.paymentStatus === 'pending' ? 'Ожидает оплаты' : 'Оплачено'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}