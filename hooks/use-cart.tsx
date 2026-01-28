"use client"

import { useEffect, useState } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

const STORAGE_KEY = 'cart'

export default function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch (e) {
      setItems([])
    }

    const onUpdate = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        setItems(raw ? JSON.parse(raw) : [])
      } catch (e) {
        setItems([])
      }
    }

    window.addEventListener('cart_updated', onUpdate)
    window.addEventListener('storage', onUpdate)
    return () => {
      window.removeEventListener('cart_updated', onUpdate)
      window.removeEventListener('storage', onUpdate)
    }
  }, [])

  const persist = (next: CartItem[]) => {
    setItems(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch (e) {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('cart_updated'))
  }

  const addItem = (item: CartItem, qty = 1) => {
    const existing = items.find(i => i.id === item.id)
    if (existing) {
      persist(items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i))
    } else {
      persist([...items, { ...item, quantity: qty }])
    }
  }

  const removeItem = (id: string) => {
    persist(items.filter(i => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(id)
    persist(items.map(i => i.id === id ? { ...i, quantity } : i))
  }

  const clearCart = () => persist([])

  const count = items.reduce((s, it) => s + it.quantity, 0)
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0)

  return { items, addItem, removeItem, updateQuantity, clearCart, count, subtotal }
}
