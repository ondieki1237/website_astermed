'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import useCart from '@/hooks/use-cart'
import { formatPrice } from '@/lib/currency'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export default function CartPage() {
  const { items: cartItems, removeItem, updateQuantity, subtotal } = useCart()
  const [promoCode, setPromoCode] = useState('')

  // Shipping: free over KSH 5,000
  const shipping = subtotal > 5000 ? 0 : 200
  const total = subtotal + shipping

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-[#f9fbff] to-white">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 pt-24 lg:pt-28 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and checkout</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.length > 0 ? (
              <>
                {cartItems.map(item => (
                  <div key={item.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 p-6 group">
                    <div className="flex gap-6">
                      <div className="relative w-32 h-32 bg-gradient-to-br from-[#f3f6ff] to-white rounded-xl overflow-hidden flex-shrink-0 group-hover:shadow-lg transition-shadow">
                        <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-contain p-2" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#1f2a7c] transition-colors">{item.name}</h3>
                        <p className="text-[#1f2a7c] font-bold text-xl mb-4">{formatPrice(item.price)}</p>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-3 hover:bg-gray-50 transition-colors text-gray-600 font-bold">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-6 py-3 font-bold text-gray-900">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-3 hover:bg-gray-50 transition-colors text-gray-600 font-bold">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <p className="font-bold text-xl text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                            <button onClick={() => removeItem(item.id)} className="p-3 text-[#e53935] hover:bg-red-50 rounded-xl transition-all duration-200">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-lg">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-6 text-lg">Your cart is empty</p>
                <Link href="/products">
                  <Button className="bg-gradient-to-r from-[#1f2a7c] to-[#2535a0] hover:shadow-xl transition-all duration-200 text-white font-bold rounded-xl px-8">Continue Shopping</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-8 sticky top-28 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1f2a7c]/5 to-transparent rounded-full -mr-16 -mt-16"></div>
              
              <h2 className="font-bold text-2xl mb-6 text-gray-900 relative">Order Summary</h2>

              <div className="space-y-4 mb-6 relative">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-[#e53935] font-bold">FREE</span>
                  ) : (
                    <span className="font-semibold text-gray-900">{formatPrice(shipping)}</span>
                  )}
                </div>
                {shipping === 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
                    <p className="text-xs text-green-700 font-medium">🎉 Free shipping on orders over KSH 5000!</p>
                  </div>
                )}
              </div>

              <div className="border-t-2 border-gray-200 pt-6 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Total</span>
                  <span className="text-3xl font-bold text-[#1f2a7c]">{formatPrice(total)}</span>
                </div>
              </div>

              {cartItems.length > 0 && (
                <Link href="/checkout">
                  <Button className="w-full bg-gradient-to-r from-[#e53935] to-[#d32f2f] hover:shadow-2xl hover:scale-105 transition-all duration-200 text-white text-lg py-6 font-bold rounded-xl">
                    Proceed to Checkout
                  </Button>
                </Link>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                  🔒 Secure checkout powered by industry-standard encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
