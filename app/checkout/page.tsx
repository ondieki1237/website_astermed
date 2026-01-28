"use client"

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { useState } from 'react'
import { formatPrice } from '@/lib/currency'
import useCart from '@/hooks/use-cart'

export default function CheckoutPage() {
  const [step, setStep] = useState('shipping')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const { items, subtotal, clearCart } = useCart()
  const [orderTotal, setOrderTotal] = useState(0)

  const counties = [
    'Mombasa','Kwale','Kilifi','Tana River','Lamu','Taita-Taveta','Garissa','Wajir','Mandera','Marsabit','Isiolo','Meru','Tharaka-Nithi','Embu','Kitui','Machakos','Makueni','Nyandarua','Nyeri','Kirinyaga',"Murang'a",'Kiambu','Turkana','West Pokot','Samburu','Trans-Nzoia','Uasin Gishu','Elgeyo-Marakwet','Nandi','Baringo','Laikipia','Nakuru','Narok','Kajiado','Kericho','Bomet','Kakamega','Vihiga','Bungoma','Busia','Siaya','Kisumu','Homa Bay','Migori','Kisii','Nyamira','Nairobi'
  ]

  const [form, setForm] = useState({
    name: '',
    role: '',
    contact: '',
    email: '',
    facility: '',
    county: '',
    location: '',
    phoneForPayment: '',
  })

  const handlePlaceOrder = (amount = 0) => {
    setOrderTotal(amount)
    clearCart()
    setOrderPlaced(true)
  }

  const computeShipping = () => {
    // Free within Nairobi
    if (form.county === 'Nairobi') return 0

    // determine package size from total quantity in cart
    const totalQty = items?.reduce((s, it) => s + (it.quantity || 0), 0) || 0
    const size = totalQty <= 2 ? 'small' : totalQty <= 5 ? 'medium' : 'large'

    const baseBySize: Record<string, number> = { small: 500, medium: 1200, large: 2500 }
    const near = ['Kiambu', 'Kajiado', 'Machakos']
    const far = [
      'Mombasa','Wajir','Mandera','Marsabit','Turkana','Samburu','Garissa'
    ]

    const distanceMultiplier = near.includes(form.county) ? 1 : far.includes(form.county) ? 2 : 1.5

    return Math.round((baseBySize[size] || 500) * distanceMultiplier)
  }

  const shipping = computeShipping()
  const total = Math.round(subtotal + shipping)

  const handleMpesaPush = async () => {
    try {
      const amount = total
      const resp = await fetch('/api/mpesa/stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phoneForPayment, amount, reference: form.facility || 'ASTERMED' }),
      })
      const data = await resp.json()
      if (resp.ok) {
        setOrderTotal(amount)
        clearCart()
        setOrderPlaced(true)
      } else {
        alert(data.message || 'Payment failed')
      }
    } catch (e) {
      alert('Payment request failed')
    }
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md border-none shadow-lg">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold mb-4">Order Placed Successfully!</h1>
            <p className="text-muted-foreground mb-6">
              Your order #12345 has been confirmed. You will receive an email shortly with your shipping details.
            </p>
            <div className="space-y-2 mb-6 text-left bg-secondary/50 p-4 rounded">
              <p><strong>Order Total:</strong> {formatPrice(orderTotal || subtotal)}</p>
              <p><strong>Estimated Delivery:</strong> 5-7 business days</p>
              <p><strong>Tracking:</strong> Will be emailed to you</p>
            </div>
            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">Home</Button>
              </Link>
              <Link href="/products" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90">Continue Shopping</Button>
              </Link>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <Tabs value={step} onValueChange={setStep}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>

              {/* Shipping Tab */}
              <TabsContent value="shipping">
                <Card className="p-6 border-none shadow-md">
                  <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold block mb-2">First Name</label>
                        <Input placeholder="John" className="bg-input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
                      </div>
                      <div>
                        <label className="text-sm font-semibold block mb-2">Last Name</label>
                        <Input placeholder="Role / Position" className="bg-input" value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-2">Email</label>
                      <Input placeholder="john@example.com" type="email" className="bg-input" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
                    </div>
                    {/* Street Address removed per requirements */}
                    
                    {/* ZIP Code and Country removed */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold block mb-2">Facility</label>
                        <Input placeholder="Facility" className="bg-input" value={form.facility} onChange={(e)=>setForm({...form,facility:e.target.value})} />
                      </div>
                      <div>
                        <label className="text-sm font-semibold block mb-2">County</label>
                        <select className="w-full border rounded p-2" value={form.county} onChange={(e)=>setForm({...form,county:e.target.value})}>
                          <option value="">Select county</option>
                          {counties.map(c=> <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold block mb-2">Package Size</label>
                      <select className="w-full border rounded p-2" value={form.packageSize} onChange={(e)=>setForm({...form,packageSize:e.target.value})}>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-2">Location / Area</label>
                      <Input placeholder="e.g. Westlands, Nairobi" className="bg-input" value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold block mb-2">Phone</label>
                      <Input placeholder="+2547XXXXXXXX" className="bg-input" value={form.contact} onChange={(e)=>setForm({...form,contact:e.target.value})} />
                    </div>
                    <Button
                      onClick={() => setStep('payment')}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </Card>
              </TabsContent>

              {/* Payment Tab */}
              <TabsContent value="payment">
                <Card className="p-6 border-none shadow-md">
                  <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
                  <div className="space-y-4">
                    <div className="border-2 border-primary rounded p-4">
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="payment" defaultChecked className="mr-3" />
                        <span className="font-semibold">M-Pesa (STK Push)</span>
                      </label>
                      <div className="mt-4">
                        <label className="text-sm font-semibold block mb-2">Phone for M-Pesa</label>
                        <Input placeholder="+2547XXXXXXXX" className="bg-input" value={form.phoneForPayment} onChange={(e)=>setForm({...form,phoneForPayment:e.target.value})} />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setStep('shipping')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={() => setStep('review')}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        Review Order
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Review Tab */}
              <TabsContent value="review">
                <Card className="p-6 border-none shadow-md">
                  <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>
                  <div className="space-y-4 mb-6">
                    <div className="p-4 bg-secondary/50 rounded">
                      <p className="font-semibold mb-2">Shipping Address</p>
                      <p className="text-sm text-muted-foreground">
                        {form.name} ({form.role})<br />
                        {form.contact} • {form.email}<br />
                        {form.facility} - {form.location}<br />
                        {form.county}
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded">
                      <p className="font-semibold mb-2">Payment Method</p>
                      <p className="text-sm text-muted-foreground">M-Pesa STK Push to {form.phoneForPayment}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setStep('payment')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleMpesaPush}
                      className="flex-1 bg-accent hover:bg-accent/90"
                    >
                      Pay with M-Pesa
                    </Button>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-none shadow-md sticky top-24">
              <h2 className="font-bold text-xl mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                {items && items.length > 0 ? (
                  items.map(it => (
                    <div key={it.id} className="text-sm">
                      <p>{it.name} × {it.quantity}</p>
                      <p className="text-muted-foreground">{formatPrice(it.price * it.quantity)}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-sm">
                    <p>No items</p>
                  </div>
                )}
              </div>
              <div className="space-y-3 mb-6 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-accent">FREE</span> : formatPrice(shipping)}</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
