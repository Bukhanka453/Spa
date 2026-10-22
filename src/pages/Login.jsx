import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email обязателен'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Некорректный email'
    if (!form.password) e.password = 'Пароль обязателен'
    else if (form.password.length < 6) e.password = 'Минимум 6 символов'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return

    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
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
      <h1>Вход</h1>
      <form onSubmit={handleSubmit} className="form" noValidate>
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
          Пароль
          <input
            type="password"
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            className={errors.password ? 'invalid' : ''}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </label>

        {serverError && <p className="error">{serverError}</p>}

        <button className="btn primary" disabled={loading}>
          {loading ? 'Проверка...' : 'Войти'}
        </button>
      </form>

      <p>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  )
}