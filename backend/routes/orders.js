import { Router } from 'express'
import db from '../db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()
router.use(authRequired)

// POST /api/orders — оформить заказ из текущей корзины
router.post('/', (req, res) => {
  const { deliveryAddress, deliveryDate } = req.body

  if (!deliveryAddress || !deliveryDate) {
    return res.status(400).json({ error: 'Адрес и дата доставки обязательны' })
  }

  // Проверка: дата не раньше сегодня
  const today = new Date().toISOString().slice(0, 10)
  if (deliveryDate < today) {
    return res.status(400).json({ error: 'Дата доставки не может быть в прошлом' })
  }

  // Получаем корзину пользователя
  const cartRows = db.prepare(`
    SELECT ci.service_id, ci.qty, s.price
    FROM cart_items ci
    JOIN services s ON s.id = ci.service_id
    WHERE ci.user_id = ?
  `).all(req.user.id)

  if (cartRows.length === 0) {
    return res.status(400).json({ error: 'Корзина пуста' })
  }

  const total = cartRows.reduce((s, r) => s + r.price * r.qty, 0)

  // Транзакция: создать заказ, позиции, очистить корзину
  const tx = db.transaction(() => {
    const orderResult = db.prepare(`
      INSERT INTO orders (user_id, delivery_address, delivery_date, total_amount)
      VALUES (?, ?, ?, ?)
    `).run(req.user.id, deliveryAddress, deliveryDate, total)

    const orderId = orderResult.lastInsertRowid

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, service_id, qty, price_at_moment)
      VALUES (?, ?, ?, ?)
    `)
    for (const r of cartRows) {
      insertItem.run(orderId, r.service_id, r.qty, r.price)
    }

    db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id)
    return orderId
  })

  try {
    const orderId = tx()
    res.status(201).json({ orderId, total })
  } catch (e) {
    res.status(500).json({ error: 'Не удалось оформить заказ' })
  }
})

// GET /api/orders — все заказы пользователя
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT o.id, o.delivery_address, o.delivery_date, o.total_amount,
           o.status, o.created_at
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(req.user.id)

  res.json(rows.map((o) => ({
    id: o.id,
    deliveryAddress: o.delivery_address,
    deliveryDate: o.delivery_date,
    totalAmount: o.total_amount,
    status: o.status,
    createdAt: o.created_at,
  })))
})

// GET /api/orders/:id — заказ с позициями
router.get('/:id', (req, res) => {
  const order = db.prepare(`
    SELECT * FROM orders WHERE id = ? AND user_id = ?
  `).get(req.params.id, req.user.id)

  if (!order) return res.status(404).json({ error: 'Заказ не найден' })

  const items = db.prepare(`
    SELECT oi.qty, oi.price_at_moment, s.title
    FROM order_items oi
    JOIN services s ON s.id = oi.service_id
    WHERE oi.order_id = ?
  `).all(order.id)

  res.json({
    id: order.id,
    deliveryAddress: order.delivery_address,
    deliveryDate: order.delivery_date,
    totalAmount: order.total_amount,
    status: order.status,
    createdAt: order.created_at,
    items: items.map((i) => ({
      title: i.title,
      qty: i.qty,
      price: i.price_at_moment,
    })),
  })
})

export default router