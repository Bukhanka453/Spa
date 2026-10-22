import { Router } from 'express'
import db from '../db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

// POST /api/appointments — оформить запись (например, при checkout)
router.post('/', authRequired, (req, res) => {
  const { items, scheduledAt } = req.body
  // items: [{ serviceId, qty }]
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Корзина пуста' })
  }
  if (!scheduledAt) {
    return res.status(400).json({ error: 'Укажите дату/время' })
  }

  const insertAppointment = db.prepare(
    'INSERT INTO appointments (user_id, service_id, scheduled_at) VALUES (?, ?, ?)'
  )
  const insertPayment = db.prepare(
    'INSERT INTO payments (appointment_id, amount, method) VALUES (?, ?, ?)'
  )

  const tx = db.transaction(() => {
    const created = []
    for (const item of items) {
      const svc = db.prepare('SELECT * FROM services WHERE id = ?').get(item.serviceId)
      if (!svc) throw new Error(`Услуга ${item.serviceId} не найдена`)
      const qty = item.qty || 1
      for (let i = 0; i < qty; i++) {
        const result = insertAppointment.run(req.user.id, svc.id, scheduledAt)
        const amount = svc.price
        insertPayment.run(result.lastInsertRowid, amount, 'card')
        created.push({ appointmentId: result.lastInsertRowid, service: svc.title })
      }
    }
    return created
  })

  try {
    const created = tx()
    res.status(201).json({ created })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

// GET /api/appointments — мои записи
router.get('/', authRequired, (req, res) => {
  const rows = db.prepare(`
    SELECT a.id, a.scheduled_at, a.status, s.title, s.price, s.duration_min, p.amount, p.status AS payment_status
    FROM appointments a
    JOIN services s ON s.id = a.service_id
    LEFT JOIN payments p ON p.appointment_id = a.id
    WHERE a.user_id = ?
    ORDER BY a.scheduled_at DESC
  `).all(req.user.id)
  res.json(rows.map((r) => ({
    id: r.id,
    scheduledAt: r.scheduled_at,
    status: r.status,
    serviceTitle: r.title,
    price: r.price,
    durationMin: r.duration_min,
    paymentAmount: r.amount,
    paymentStatus: r.payment_status,
  })))
})

export default router