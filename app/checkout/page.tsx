"use client"

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState } from 'react'
import useCart from '@/hooks/use-cart'

export default function CheckoutPage() {
  const [quoteSubmitted, setQuoteSubmitted] = useState(false)
  const { items, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astermed.codewithseth.co.ke'

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
  })

  // Submit quote request
  const handleQuoteRequest = async () => {
    try {
      setLoading(true)
      setError('')

      // Validation
      if (!form.name || !form.email || !form.contact) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      const quoteData = {
        customer: {
          name: form.name,
          email: form.email,
          phone: form.contact,
          role: form.role,
          facility: form.facility,
          county: form.county,
          location: form.location,
        },
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          image: item.image,
        })),
        status: 'quote_requested',
        type: 'quote',
      }

      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit quote request')
      }

      clearCart()
      setQuoteSubmitted(true)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to submit quote request')
      setLoading(false)
    }
  }

  if (quoteSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md border-none shadow-lg">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold mb-4">Quote Request Submitted!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your interest! Our team will review your quote request and get back to you within 24 hours with pricing and availability.
            </p>
            <div className="space-y-2 mb-6 text-left bg-secondary/50 p-4 rounded">
              <p><strong>What's Next?</strong></p>
              <p className="text-sm">• Our team will review your request</p>
              <p className="text-sm">• You'll receive a detailed quote via email</p>
              <p className="text-sm">• We'll contact you to discuss delivery</p>
            </div>
            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">Home</Button>
              </Link>
              <Link href="/products" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90">Browse More Products</Button>
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
        <h1 className="text-4xl font-bold mb-8">Request Quote</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quote Request Form */}
          <div className="lg:col-span-2">
            <Card className="p-6 border-none shadow-md">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-2">Full Name *</label>
                    <Input placeholder="John Doe" className="bg-input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-2">Role / Position</label>
                    <Input placeholder="e.g. Lab Manager" className="bg-input" value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Email *</label>
                  <Input placeholder="john@example.com" type="email" className="bg-input" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Phone *</label>
                  <Input placeholder="+254 7XX XXX XXX" className="bg-input" value={form.contact} onChange={(e)=>setForm({...form,contact:e.target.value})} />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold block mb-2">Facility / Organization</label>
                    <Input placeholder="e.g. City Hospital" className="bg-input" value={form.facility} onChange={(e)=>setForm({...form,facility:e.target.value})} />
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
                  <label className="text-sm font-semibold block mb-2">Location / Area</label>
                  <Input placeholder="e.g. Westlands, Nairobi" className="bg-input" value={form.location} onChange={(e)=>setForm({...form,location:e.target.value})} />
                </div>
                
                <Button
                  onClick={handleQuoteRequest}
                  className="w-full bg-gradient-to-r from-[#e53935] to-[#d32f2f] hover:shadow-2xl hover:scale-105 transition-all duration-200 text-white text-lg py-6 font-bold rounded-xl mt-6"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Request Quote'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Items Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-none shadow-md sticky top-24">
              <h2 className="font-bold text-xl mb-4">Selected Items</h2>
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {items && items.length > 0 ? (
                  items.map(it => (
                    <div key={it.id} className="text-sm p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold">{it.name}</p>
                      <p className="text-muted-foreground">Quantity: {it.quantity}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-center py-8 text-muted-foreground">
                    <p>No items selected</p>
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between font-bold">
                  <span>Total Items</span>
                  <span>{items?.length || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Our team will provide detailed pricing and availability for all selected items.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
