import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'
import { JWT_SECRET, authRequired } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
  const { email, password, fullName, phone } = req.body
  // ... проверки email/password ...

  const hash = await bcrypt.hash(password, 10)
  const result = db.prepare(`
    INSERT INTO users (email, password_hash, full_name, phone, role_id)
    VALUES (?, ?, ?, ?, 2)
  `).run(email, hash, fullName || null, phone || null)

  const user = {
    id: result.lastInsertRowid,
    email,
    fullName: fullName || null,
    phone: phone || null,
    roleId: 2,
  }
  const token = jwt.sign({ id: user.id, email, roleId: 2 }, JWT_SECRET, { expiresIn: '7d' })
  res.status(201).json({ user, token })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' })
  }

  const row = db.prepare(`
    SELECT u.id, u.email, u.password_hash, u.full_name, u.role_id, r.name AS role, u.phone, u.default_address
    FROM users u JOIN roles r ON r.id = u.role_id
    WHERE u.email = ?
  `).get(email)

  if (!row) return res.status(401).json({ error: 'Неверный email или пароль' })

  const ok = await bcrypt.compare(password, row.password_hash)
  if (!ok) return res.status(401).json({ error: 'Неверный email или пароль' })

  const user = {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    roleId: row.role_id,
    role: row.role,
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, roleId: user.roleId },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({ user, token })
})

router.get('/me', authRequired, (req, res) => {
  const row = db.prepare(`
    SELECT u.id, u.email, u.full_name, u.role_id, r.name AS role, u.phone, u.default_address
    FROM users u JOIN roles r ON r.id = u.role_id
    WHERE u.id = ?
  `).get(req.user.id)

  if (!row) return res.status(404).json({ error: 'Пользователь не найден' })

  res.json({
    user: {
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      roleId: row.role_id,
      role: row.role,
      phone: row.phone,
      defaultAddress: row.default_address
    },
  })
})

export default router