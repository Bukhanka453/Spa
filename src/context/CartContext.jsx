import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Загрузка корзины с сервера при входе
  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]); setTotal(0); setCount(0)
      return
    }
    setLoading(true)
    try {
      const { data } = await api.get('/cart')
      setItems(data.items)
      setTotal(data.total)
      setCount(data.count)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const addToCart = async (serviceId, qty = 1) => {
    await api.post('/cart', { serviceId, qty })
    await refresh()
  }

  const updateQty = async (itemId, qty) => {
    await api.put(`/cart/${itemId}`, { qty })
    await refresh()
  }

  const removeFromCart = async (itemId) => {
    await api.delete(`/cart/${itemId}`)
    await refresh()
  }

  const clearCart = async () => {
    await api.delete('/cart')
    await refresh()
  }

  return (
    <CartContext.Provider value={{
      items, total, count, loading,
      addToCart, updateQty, removeFromCart, clearCart, refresh,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)