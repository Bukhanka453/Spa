import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import ErrorMessage from '../components/ErrorMessage'

export default function Checkout() {
  const { items, total, refresh } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({ deliveryAddress: '', deliveryDate: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  const validate = () => {
    const e = {}
    if (!form.deliveryAddress.trim()) e.deliveryAddress = 'Укажите адрес'
    if (!form.deliveryDate) e.deliveryDate = 'Укажите дату'
    else if (form.deliveryDate < today) e.deliveryDate = 'Дата не может быть в прошлом'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    setLoading(true)
    try {
      await api.post('/orders', form)
      await refresh()
      navigate('/profile')
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return <div className="container"><h1>Корзина пуста</h1></div>
  }

  return (
    <div className="container narrow">
      <h1>Оформление заказа</h1>
      <form onSubmit={handleSubmit} className="form" noValidate>
        <label>
          Адрес доставки
          <input
            value={form.deliveryAddress}
            onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
            className={errors.deliveryAddress ? 'invalid' : ''}
          />
          {errors.deliveryAddress && <span className="field-error">{errors.deliveryAddress}</span>}
        </label>

        <label>
          Дата доставки
          <input
            type="date"
            min={today}
            value={form.deliveryDate}
            onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
            className={errors.deliveryDate ? 'invalid' : ''}
          />
          {errors.deliveryDate && <span className="field-error">{errors.deliveryDate}</span>}
        </label>

        <p className="total-line">Итого: <strong>{total.toLocaleString()} ₽</strong></p>

        <ErrorMessage>{serverError}</ErrorMessage>

        <button className="btn primary" disabled={loading}>
          {loading ? 'Отправка...' : 'Оформить заказ'}
        </button>
      </form>
    </div>
  )
}