import { Router } from 'express'
import db from '../db.js'

const router = Router()

// GET /api/categories — список категорий для фильтра
// (можно вынести в отдельный файл routes/categories.js)
router.get('/categories', (req, res) => {
  const rows = db.prepare('SELECT id, name FROM categories ORDER BY name').all()
  res.json(rows)
})

// GET /api/services?category=1&maxPrice=5000
// JOIN с categories — название категории сразу в ответе
router.get('/', (req, res) => {
  const { category, maxPrice } = req.query

  let sql = `
    SELECT s.id, s.title, s.description, s.duration_min, s.price, s.image_url, c.id AS category_id, c.name AS category_name
    FROM services s
    LEFT JOIN categories c ON c.id = s.category_id
    WHERE 1=1
  `
  const params = []
  if (category) {
    sql += ' AND s.category_id = ?'
    params.push(category)
  }
  if (maxPrice) {
    sql += ' AND s.price <= ?'
    params.push(maxPrice)
  }
  sql += ' ORDER BY s.id'

  const rows = db.prepare(sql).all(...params)
  res.json(rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    durationMin: r.duration_min,
    price: r.price,
    imageUrl: r.image_url,
    category: r.category_id
      ? { id: r.category_id, name: r.category_name }
      : null,
  })))
})

// GET /api/services/:id — услуга со средней оценкой и категорией
router.get('/:id', (req, res) => {
  const r = db.prepare(`
    SELECT s.id, s.title, s.description, s.duration_min, s.price, s.image_url, c.id AS category_id, c.name AS category_name, AVG(rv.rating) AS avg_rating, COUNT(rv.id) AS reviews_count
    FROM services s
    LEFT JOIN categories c ON c.id = s.category_id
    LEFT JOIN reviews rv ON rv.service_id = s.id
    WHERE s.id = ?
    GROUP BY s.id
  `).get(req.params.id)

  if (!r) return res.status(404).json({ error: 'Услуга не найдена' })

  res.json({
    id: r.id,
    title: r.title,
    description: r.description,
    durationMin: r.duration_min,
    price: r.price,
    imageUrl: r.image_url,
    category: r.category_id
      ? { id: r.category_id, name: r.category_name }
      : null,
    avgRating: r.avg_rating ? Number(r.avg_rating.toFixed(1)) : null,
    reviewsCount: r.reviews_count,
  })
})


export default router