import { NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const { count } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="nav-links">
        <NavLink to="/" end>Каталог</NavLink>
        <NavLink to="/cart">Корзина ({count})</NavLink>
        {user ? (
          <NavLink to="/profile">Кабинет</NavLink>
        ) : (
          <>
            <NavLink to="/login">Вход</NavLink>
            <NavLink to="/register">Регистрация</NavLink>
          </>
        )}
      </div>

      <div className="nav-right">
        {user && <span className="user-info">{user.fullName}</span>}
        {user && (
          <button className="btn" onClick={handleLogout}>
            Выйти
          </button>
        )}
        <button className="btn theme-btn" onClick={toggleTheme}>
          {theme === 'light' ? 'Тёмная' : 'Светлая'}
        </button>
      </div>
    </nav>
  )
}