'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-12">
      <div className="px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8 max-w-7xl mx-auto">
          {/* Company Info */}
          <div>
            <img src="/images/heroes-20square-two.png" alt="AsterMed" className="h-10 mb-4" />
            <p className="text-xs opacity-75 mb-4 leading-relaxed font-light">Premium medical supplies and equipment for healthcare professionals.</p>
            <div className="flex gap-3">
              <Facebook className="w-4 h-4 cursor-pointer hover:text-accent transition" />
              <Twitter className="w-4 h-4 cursor-pointer hover:text-accent transition" />
              <Linkedin className="w-4 h-4 cursor-pointer hover:text-accent transition" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 tracking-tight">Quick Links</h4>
            <ul className="space-y-2 text-xs opacity-75 font-light">
              <li><Link href="/products" className="hover:text-accent transition">Products</Link></li>
              <li><Link href="/blogs" className="hover:text-accent transition">Blog</Link></li>
              <li><Link href="/news" className="hover:text-accent transition">News</Link></li>
              <li><Link href="/jobs" className="hover:text-accent transition">Careers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4 tracking-tight">Support</h4>
            <ul className="space-y-2 text-xs opacity-75 font-light">
              <li><Link href="#" className="hover:text-accent transition">FAQ</Link></li>
              <li><Link href="#" className="hover:text-accent transition">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-accent transition">Shipping Info</Link></li>
              <li><Link href="#" className="hover:text-accent transition">Returns</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-sm mb-4 tracking-tight">Contact</h4>
            <div className="space-y-3 text-xs opacity-75 font-light">
              <div className="flex gap-2 items-start">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                <p>+254746 999 725</p>
              </div>
              <div className="flex gap-2 items-start">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                <p>info@astermedsupplies.co.ke</p>
              </div>
              <div className="flex gap-2 items-start">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <p>123 Medical Drive<br />Healthcare City, HC 12345</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white border-opacity-20 pt-8 flex flex-col md:flex-row justify-between items-center text-sm opacity-80">
          <p>&copy; 2024 AsterMed. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-accent transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-accent transition">Terms of Service</Link>
            <Link href="#" className="hover:text-accent transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
