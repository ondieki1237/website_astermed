'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus } from 'lucide-react'
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <Card key={item.id} className="p-4 border-none shadow-md">
                    <div className="flex gap-4">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-24 h-24 object-cover rounded" />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-accent font-semibold">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button onClick={() => removeItem(item.id)} className="text-accent hover:text-red-700">
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="flex items-center border rounded">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border-none shadow-md">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Link href="/products">
                  <Button className="bg-primary hover:bg-primary/90">Continue Shopping</Button>
                </Link>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-none shadow-md sticky top-24">
              <h2 className="font-bold text-xl mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-accent">FREE</span>
                  ) : (
                    <span>{formatPrice(shipping)}</span>
                  )}
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-accent">Free shipping on orders over KSH 5000!</p>
                )}
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              

              {cartItems.length > 0 && (
                <Link href="/checkout">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-lg py-6">
                    Proceed to Checkout
                  </Button>
                </Link>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
