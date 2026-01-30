'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#1f2a7c] text-white mt-auto">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-6">
          {/* Company Info */}
          <div>
            <img src="/astermedlogo.png" alt="AsterMed" className="h-8 mb-3 brightness-0 invert" />
            <p className="text-xs opacity-90 mb-4 leading-relaxed">Premium medical supplies and equipment for healthcare professionals.</p>
            <div className="flex gap-3">
              <Facebook className="w-4 h-4 cursor-pointer hover:text-[#e53935] transition" />
              <Twitter className="w-4 h-4 cursor-pointer hover:text-[#e53935] transition" />
              <Linkedin className="w-4 h-4 cursor-pointer hover:text-[#e53935] transition" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3 tracking-tight">Quick Links</h4>
            <ul className="space-y-2 text-xs opacity-90">
              <li><Link href="/products" className="hover:text-[#e53935] transition">Products</Link></li>
              <li><Link href="/blogs" className="hover:text-[#e53935] transition">Blog</Link></li>
              <li><Link href="/news" className="hover:text-[#e53935] transition">News</Link></li>
              <li><Link href="/jobs" className="hover:text-[#e53935] transition">Career</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-3 tracking-tight">Support</h4>
            <ul className="space-y-2 text-xs opacity-90">
              <li><Link href="#" className="hover:text-[#e53935] transition">FAQ</Link></li>
              <li><Link href="#" className="hover:text-[#e53935] transition">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-[#e53935] transition">Shipping Info</Link></li>
              <li><Link href="#" className="hover:text-[#e53935] transition">Returns</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-sm mb-3 tracking-tight">Contact</h4>
            <div className="space-y-2 text-xs opacity-90">
              <div className="flex gap-2 items-start">
                <Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <p>+254746 999 725</p>
              </div>
              <div className="flex gap-2 items-start">
                <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <p>info@astermedsupplies.co.ke</p>
              </div>
              <div className="flex gap-2 items-start">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <p>123 Medical Drive<br />Healthcare City, HC 12345</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white border-opacity-20 pt-6 flex flex-col md:flex-row justify-between items-center text-xs opacity-80">
          <p>&copy; 2024 AsterMed. All rights reserved.</p>
          <div className="flex gap-6 mt-3 md:mt-0">
            <Link href="#" className="hover:text-[#e53935] transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#e53935] transition">Terms of Service</Link>
            <Link href="#" className="hover:text-[#e53935] transition">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
