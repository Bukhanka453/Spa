import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()
router.use(authRequired)

// PUT /api/profile — редактирование личных данных
router.put('/', (req, res) => {
  const { fullName, email, phone, defaultAddress } = req.body

  if (email) {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Некорректный email' })
    }
    const existing = db.prepare(
      'SELECT id FROM users WHERE email = ? AND id != ?'
    ).get(email, req.user.id)
    if (existing) {
      return res.status(409).json({ error: 'Email уже занят' })
    }
  }

  db.prepare(`
    UPDATE users
    SET full_name = COALESCE(?, full_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        default_address = COALESCE(?, default_address)
    WHERE id = ?
  `).run(
    fullName ?? null,
    email ?? null,
    phone ?? null,
    defaultAddress ?? null,
    req.user.id
  )

  const updated = db.prepare(`
    SELECT id, email, full_name, phone, default_address, role_id
    FROM users WHERE id = ?
  `).get(req.user.id)

  res.json({
    user: {
      id: updated.id,
      email: updated.email,
      fullName: updated.full_name,
      phone: updated.phone,
      defaultAddress: updated.default_address,
      roleId: updated.role_id,
    },
  })
})

// PUT /api/profile/password — смена пароля
router.put('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Оба пароля обязательны' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Новый пароль минимум 6 символов' })
  }

  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?')
    .get(req.user.id)

  const ok = await bcrypt.compare(currentPassword, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'Неверный текущий пароль' })

  const hash = await bcrypt.hash(newPassword, 10)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    .run(hash, req.user.id)

  res.json({ ok: true })
})

export default router