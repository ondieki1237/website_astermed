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
  const whatsappNumber = '254746999725'

  const openWhatsAppQuote = () => {
    if (!cartItems.length) return
    const itemLines = cartItems
      .map((item, index) => `${index + 1}. ${item.name} x ${item.quantity}`)
      .join('\n')
    const message = `Hello AsterMed, I would like a quote for:\n${itemLines}`
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

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
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{item.name}</h3>
                        {/* Price hidden - quote-based system */}
                        
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
                            {/* Total hidden - quote-based system */}
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
                  <Button className="bg-gradient-to-r from-[#d0dc36] to-[#c5d030] hover:shadow-xl transition-all duration-200 text-white font-bold rounded-xl px-8">Continue Shopping</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-8 sticky top-28 overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#d0dc36]/5 to-transparent rounded-full -mr-16 -mt-16"></div>
              
              <h2 className="font-bold text-2xl mb-6 text-gray-900 relative">Quote Summary</h2>

              <div className="space-y-4 mb-6 relative">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Items</span>
                  <span className="font-semibold text-gray-900">{cartItems.length}</span>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
                  <p className="text-xs text-blue-700 font-medium">💡 Request a quote to get pricing for your selection</p>
                </div>
              </div>

              {cartItems.length > 0 && (
                <Button
                  onClick={openWhatsAppQuote}
                  className="w-full bg-gradient-to-r from-[#e53935] to-[#d32f2f] hover:shadow-2xl hover:scale-105 transition-all duration-200 text-white text-lg py-6 font-bold rounded-xl"
                >
                  Request Quote
                </Button>
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
