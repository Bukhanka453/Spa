import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'

export default function Profile() {
  const { user, updateUser } = useAuth()   // updateUser — добавим в AuthContext
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [profileForm, setProfileForm] = useState({
    fullName: '', email: '', phone: '', defaultAddress: '',
  })
  const [profileMsg, setProfileMsg] = useState('')

  const [pwdForm, setPwdForm] = useState({
    currentPassword: '', newPassword: '', confirm: '',
  })
  const [pwdMsg, setPwdMsg] = useState('')

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        defaultAddress: user.defaultAddress || '',
      })
    }
  }, [user])

  const loadOrders = () => {
    setLoading(true); setError('')
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadOrders, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    setProfileMsg('')
    try {
      const { data } = await api.put('/profile', profileForm)
      updateUser(data.user)
      setProfileMsg('Сохранено')
    } catch (err) {
      setProfileMsg(err.message)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPwdMsg('')
    if (pwdForm.newPassword !== pwdForm.confirm) {
      setPwdMsg('Пароли не совпадают')
      return
    }
    try {
      await api.put('/profile/password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      })
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' })
      setPwdMsg('Пароль изменён')
    } catch (err) {
      setPwdMsg(err.message)
    }
  }

  return (
    <div className="container">
      <h1>Личный кабинет</h1>
      <p>Привет, <strong>{user.fullName || user.email}</strong>!</p>

      <section className="profile-section">
        <h2>Мои данные</h2>
        <form onSubmit={saveProfile} className="form">
          <label>ФИО
            <input value={profileForm.fullName}
              onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })} />
          </label>
          <label>Email
            <input type="email" value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
          </label>
          <label>Телифон
            <input value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
          </label>
          <label>Адрес по умолчанию
            <input value={profileForm.defaultAddress}
              onChange={(e) => setProfileForm({ ...profileForm, defaultAddress: e.target.value })} />
          </label>
          {profileMsg && <p>{profileMsg}</p>}
          <button className="btn primary">Сохранить</button>
        </form>
      </section>

      <section className="profile-section">
        <h2>Смена пароля</h2>
        <form onSubmit={changePassword} className="form">
          <label>Текущий пароль
            <input type="password" value={pwdForm.currentPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} />
          </label>
          <label>Новый пароль
            <input type="password" value={pwdForm.newPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} />
          </label>
          <label>Повтор нового пароля
            <input type="password" value={pwdForm.confirm}
              onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })} />
          </label>
          {pwdMsg && <p>{pwdMsg}</p>}
          <button className="btn primary">Изменить пароль</button>
        </form>
      </section>

      <section className="profile-section">
        <h2>Мои заказы</h2>
        {loading && <Loader />}
        <ErrorMessage onRetry={loadOrders}>{error}</ErrorMessage>
        {!loading && orders.length === 0 && <p>Заказов пока нет.</p>}
        <ul className="orders">
          {orders.map((o) => (
            <li key={o.id} className="order">
              <div>Заказ №{o.id}</div>
              <div>Адрес: {o.deliveryAddress}</div>
              <div>Дата: {o.deliveryDate}</div>
              <div>Сумма: {o.totalAmount.toLocaleString()} ₽</div>
              <span className="badge">{o.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}