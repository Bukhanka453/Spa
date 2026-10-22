import { Router } from 'express'
import db from '../db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

// Все запросы корзины требуют авторизации
router.use(authRequired)

// GET /api/cart — получить корзину текущего пользователя
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT ci.id, ci.qty,
           s.id AS service_id, s.title, s.price, s.image_url, s.duration_min,
           c.name AS category_name
    FROM cart_items ci
    JOIN services s ON s.id = ci.service_id
    LEFT JOIN categories c ON c.id = s.category_id
    WHERE ci.user_id = ?
    ORDER BY ci.added_at
  `).all(req.user.id)

  const items = rows.map((r) => ({
    id: r.id,               // id записи в корзине (не услуги!)
    serviceId: r.service_id,
    title: r.title,
    price: r.price,
    imageUrl: r.image_url,
    durationMin: r.duration_min,
    categoryName: r.category_name,
    qty: r.qty,
  }))

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  res.json({ items, total, count })
})

// POST /api/cart — добавить услугу (или увеличить количество)
router.post('/', (req, res) => {
  const { serviceId, qty = 1 } = req.body
  if (!serviceId) return res.status(400).json({ error: 'serviceId обязателен' })

  const service = db.prepare('SELECT id FROM services WHERE id = ?').get(serviceId)
  if (!service) return res.status(404).json({ error: 'Услуга не найдена' })

  // UPSERT: если есть — увеличиваем qty, иначе вставляем
  db.prepare(`
    INSERT INTO cart_items (user_id, service_id, qty)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, service_id)
    DO UPDATE SET qty = qty + excluded.qty
  `).run(req.user.id, serviceId, qty)

  res.status(201).json({ ok: true })
})

// PUT /api/cart/:id — изменить количество
router.put('/:id', (req, res) => {
  const { qty } = req.body
  if (!qty || qty < 1) return res.status(400).json({ error: 'qty должен быть ≥ 1' })

  const item = db.prepare(
    'SELECT id FROM cart_items WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.user.id)

  if (!item) return res.status(404).json({ error: 'Позиция не найдена' })

  db.prepare('UPDATE cart_items SET qty = ? WHERE id = ?').run(qty, item.id)
  res.json({ ok: true })
})

// DELETE /api/cart/:id — удалить позицию
router.delete('/:id', (req, res) => {
  const result = db.prepare(
    'DELETE FROM cart_items WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.user.id)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Позиция не найдена' })
  }
  res.json({ ok: true })
})

// DELETE /api/cart — очистить всю корзину
router.delete('/', (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id)
  res.json({ ok: true })
})

export default router