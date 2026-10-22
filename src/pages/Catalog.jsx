import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useCart } from '../context/CartContext'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'

export default function Catalog() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState({ category: '', maxPrice: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { addToCart } = useCart()

  // Категории — один раз
  useEffect(() => {
    api.get('/services/categories').then(({ data }) => setCategories(data)).catch(() => {})
  }, [])

  // Услуги — при изменении фильтров
  useEffect(() => {
    setLoading(true)
    setError('')
    const params = {}
    if (filters.category) params.category = filters.category
    if (filters.maxPrice) params.maxPrice = filters.maxPrice

    api.get('/services', { params })
      .then(({ data }) => setServices(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  const handleAdd = async (service) => {
    try {
      await addToCart(service.id)
    } catch (e) {
      alert(e.message)
    }
  }

  return (
    <div className="container">
      <h1>Каталог услуг</h1>

      <div className="filters">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Макс. цена"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
        />

        <button className="btn" onClick={() => setFilters({ category: '', maxPrice: '' })}>
          Сбросить
        </button>
      </div>

      {loading && <Loader text="Загружаем каталог..." />}
      <ErrorMessage>{error}</ErrorMessage>

      <div className="grid">
        {services.map((s) => (
          <div key={s.id} className="card">
            <Link to={`/service/${s.id}`} className="card-link">
              {s.imageUrl && (
                <img src={s.imageUrl} alt={s.title} className="card-image" loading="lazy" />
              )}
              <h3>{s.title}</h3>
            </Link>
            {s.category && <span className="badge">{s.category.name}</span>}
            <p className="muted">{s.description}</p>
            <p className="meta">⏱ {s.durationMin} мин</p>
            <p className="price">{s.price.toLocaleString()} ₽</p>
            <button className="btn primary" onClick={() => handleAdd(s)}>
              В корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}