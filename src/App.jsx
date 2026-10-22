import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Catalog from './pages/Catalog'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import ServicePage from './pages/ServicePage'   // ← СКОРЕЕ ВСЕГО ЭТОЙ СТРОКИ НЕТ
import Profile from './pages/Profile'           // ← и, возможно, ЭТОЙ

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Catalog />} />
        <Route path="/service/:id" element={<ServicePage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}