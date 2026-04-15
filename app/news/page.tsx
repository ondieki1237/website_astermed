'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { MapPin, Phone, Mail } from 'lucide-react'

export default function NewsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 pt-32 md:pt-32 lg:pt-28">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">Reach AsterMed for product support and quotations</p>
        </div>

        {/* Featured Contact */}
        <Card className="mb-12 overflow-hidden shadow-lg">
          <div className="grid md:grid-cols-2 h-96 md:h-auto">
            <div className="bg-muted overflow-hidden">
              <img src="/astermedlogo.png" alt="AsterMed" className="w-full h-full object-contain p-8 md:p-12" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <span className="text-accent font-bold text-sm mb-3 uppercase">Featured</span>
              <h2 className="text-3xl font-bold mb-6">AsterMed Contact Details</h2>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Location</p>
                    <p>Nairobi City, Kenya</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 mt-0.5 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Phone / WhatsApp</p>
                    <p>+254 746 999 725</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 mt-0.5 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <p>info@astermedsupplies.co.ke</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
