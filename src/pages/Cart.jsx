import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, total, removeFromCart, updateQty, clearCart, loading } = useCart()

  if (loading) return <div className="container">Загрузка корзины...</div>

  if (items.length === 0) {
    return (
      <div className="container">
        <h1>Корзина пуста</h1>
        <Link className="btn primary" to="/">Перейти в каталог</Link>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>Корзина</h1>
      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.id} className="cart-item">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} className="cart-thumb" />
            )}
            <span className="cart-name">{item.title}</span>

            <div className="qty-controls">
              <button className="btn" onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}>−</button>
              <span>{item.qty}</span>
              <button className="btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
            </div>

            <span className="cart-price">
              {(item.price * item.qty).toLocaleString()} ₽
            </span>

            <button className="btn danger" onClick={() => removeFromCart(item.id)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-footer">
        <h2>Итого: {total.toLocaleString()} ₽</h2>
        <div className="cart-actions">
          <button className="btn" onClick={clearCart}>Очистить</button>
          <Link className="btn primary" to="/checkout">Оформить заказ</Link>
        </div>
      </div>
    </div>
  )
}