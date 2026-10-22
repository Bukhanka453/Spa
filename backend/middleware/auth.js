import jwt from 'jsonwebtoken'

export const JWT_SECRET = 'super-secret-change-me-in-prod'

export function authRequired(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Требуется авторизация' })
  }
  try {
    const token = header.slice(7)
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Неверный или просроченный токен' })
  }
}