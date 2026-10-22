import { Router } from 'express'
import db from '../db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

// GET /api/reviews?serviceId=1 — отзывы по услуге (публично)
// JOIN с users — сразу отдаём имя автора
router.get('/', (req, res) => {
  const { serviceId } = req.query
  if (!serviceId) return res.status(400).json({ error: 'serviceId обязателен' })

  const rows = db.prepare(`
    SELECT r.id, r.rating, r.comment, r.created_at,
           u.full_name, u.email
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.service_id = ?
    ORDER BY r.created_at DESC
  `).all(serviceId)

  res.json(rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    authorName: r.full_name || r.email.split('@')[0],
  })))
})

// POST /api/reviews — оставить отзыв (только для авторизованных)
router.post('/', authRequired, (req, res) => {
  const { serviceId, rating, comment } = req.body

  if (!serviceId || !rating) {
    return res.status(400).json({ error: 'serviceId и rating обязательны' })
  }
  const r = Number(rating)
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return res.status(400).json({ error: 'Оценка должна быть от 1 до 5' })
  }

  const service = db.prepare('SELECT id FROM services WHERE id = ?').get(serviceId)
  if (!service) return res.status(404).json({ error: 'Услуга не найдена' })

  const result = db.prepare(`
    INSERT INTO reviews (user_id, service_id, rating, comment)
    VALUES (?, ?, ?, ?)
  `).run(req.user.id, serviceId, r, comment?.trim() || null)

  res.status(201).json({ id: result.lastInsertRowid })
})

// DELETE /api/reviews/:id — удалить свой отзыв
router.delete('/:id', authRequired, (req, res) => {
  const result = db.prepare(
    'DELETE FROM reviews WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.user.id)

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Отзыв не найден или не ваш' })
  }
  res.json({ ok: true })
})

export default router