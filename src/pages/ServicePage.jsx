import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import Loader from '../components/Loader'
import ErrorMessage from '../components/ErrorMessage'

export default function ServicePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addToCart } = useCart()

  const [service, setService] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewError, setReviewError] = useState('')
  const [sending, setSending] = useState(false)

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [s, r] = await Promise.all([
        api.get(`/services/${id}`),
        api.get('/reviews', { params: { serviceId: id } }),
      ])
      setService(s.data)
      setReviews(r.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const handleReview = async (e) => {
    e.preventDefault()
    setReviewError('')
    setSending(true)
    try {
      await api.post('/reviews', {
        serviceId: Number(id),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      })
      setReviewForm({ rating: 5, comment: '' })
      await load()
    } catch (e) {
      setReviewError(e.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) return <Loader text="Загружаем услугу..." />

  return (
    <div className="container">
      <ErrorMessage onRetry={load}>{error}</ErrorMessage>

      {service && (
        <>
          <div className="service-header">
            {service.imageUrl && (
              <img src={service.imageUrl} alt={service.title} className="service-image" />
            )}
            <div>
              <h1>{service.title}</h1>
              {service.category && <span className="badge">{service.category.name}</span>}
              <p>{service.description}</p>
              <p>{service.durationMin} мин</p>
              <p className="price">{service.price.toLocaleString()} ₽</p>
              {service.avgRating && (
                <p>{service.avgRating} ({service.reviewsCount} отзывов)</p>
              )}
              <button className="btn primary" onClick={() => addToCart(service.id)}>
                В корзину
              </button>
            </div>
          </div>

          <h2>Отзывы</h2>
          {reviews.length === 0 && <p>Пока нет отзывов.</p>}
          <ul className="reviews">
            {reviews.map((r) => (
              <li key={r.id} className="review">
                <strong>{r.authorName}</strong>
                <span className="rating">{'⭐'.repeat(r.rating)}</span>
                <p>{r.comment}</p>
                <small>{new Date(r.createdAt).toLocaleString('ru-RU')}</small>
              </li>
            ))}
          </ul>

          {user ? (
            <form onSubmit={handleReview} className="form">
              <h3>Оставить отзыв</h3>
              <label>
                Оценка
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                >
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <label>
                Комментарий
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                />
              </label>
              {reviewError && <p className="error">{reviewError}</p>}
              <button className="btn primary" disabled={sending}>
                {sending ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          ) : (
            <p>Чтобы оставить отзыв, <a href="/login">войдите</a>.</p>
          )}
        </>
      )}
    </div>
  )
}