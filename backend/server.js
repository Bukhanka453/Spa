import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import serviceRoutes from './routes/services.js'
import appointmentRoutes from './routes/appointments.js'   // оставляем, если есть
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import reviewRoutes from './routes/reviews.js'
import profileRoutes from './routes/profile.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/profile', profileRoutes)

app.get('/api/health', (_, res) => res.json({ ok: true }))

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Внутренняя ошибка сервера' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`API ready on http://localhost:${PORT}`))