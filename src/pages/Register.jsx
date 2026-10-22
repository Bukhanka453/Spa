import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email обязателен'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Некорректный email'
    if (!form.password) e.password = 'Пароль обязателен'
    else if (form.password.length < 6) e.password = 'Минимум 6 символов'
    if (form.password !== form.confirm) e.confirm = 'Пароли не совпадают'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return

    setLoading(true)
    try {
      await register(form.email, form.password, form.fullName)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setServerError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }))
  }

  return (
    <div className="container narrow">
      <h1>Регистрация</h1>
      <form onSubmit={handleSubmit} className="form" noValidate>
        <label>
          Имя (необязательно)
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setField('email', e.target.value)}
            className={errors.email ? 'invalid' : ''}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label>
          Телифон
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setField('phone', e.target.value)}
          />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            className={errors.password ? 'invalid' : ''}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>
        <label>
          Повтор пароля
          <input
            type="password"
            value={form.confirm}
            onChange={(e) => setField('confirm', e.target.value)}
            className={errors.confirm ? 'invalid' : ''}
          />
          {errors.confirm && <span className="field-error">{errors.confirm}</span>}
        </label>

        {serverError && <p className="error">{serverError}</p>}

        <button className="btn primary" disabled={loading}>
          {loading ? 'Отправка...' : 'Зарегистрироваться'}
        </button>
      </form>
      <p>Уже есть аккаунт? <Link to="/login">Войти</Link></p>
    </div>
  )
}