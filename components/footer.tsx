'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-[#b8c92e] via-[#d0dc36] to-[#b8c92e] text-gray-800 mt-auto relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#e53935]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      
      <div className="relative px-6 py-12 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          {/* Company Info */}
          <div className="space-y-4">
            <img src="/astermedlogo.png" alt="AsterMed" className="h-10 mb-4 brightness-0 invert" />
            <p className="text-sm opacity-90 leading-relaxed">
              Premium medical supplies and equipment for healthcare professionals across Kenya and beyond.
            </p>
            <div className="flex gap-4 pt-2">
              <div className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 group">
                <Facebook className="w-5 h-5 group-hover:text-[#e53935] transition-colors" />
              </div>
              <div className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 group">
                <Twitter className="w-5 h-5 group-hover:text-[#e53935] transition-colors" />
              </div>
              <div className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 group">
                <Linkedin className="w-5 h-5 group-hover:text-[#e53935] transition-colors" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-base mb-5 tracking-tight">Quick Links</h4>
            <ul className="space-y-3 text-sm opacity-90">
              <li><Link href="/products" className="hover:text-[#e53935] transition-all hover:translate-x-1 inline-block">Products</Link></li>
              <li><Link href="/blogs" className="hover:text-[#e53935] transition-all hover:translate-x-1 inline-block">Blog</Link></li>
              <li><Link href="/news" className="hover:text-[#e53935] transition-all hover:translate-x-1 inline-block">News</Link></li>
              <li><Link href="/jobs" className="hover:text-[#e53935] transition-all hover:translate-x-1 inline-block">Career</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-base mb-5 tracking-tight">Support</h4>
            <ul className="space-y-3 text-sm opacity-90">
              <li><Link href="#" className="hover:text-[#e53935] transition-all hover:translate-x-1 inline-block">FAQ</Link></li>
              <li><Link href="#" className="hover:text-[#e53935] transition-all hover:translate-x-1 inline-block">Contact Us</Link></li>
              <li><Link href="#" className="hover:text-[#e53935] transition-all hover:translate-x-1 inline-block">Shipping Info</Link></li>
              <li><Link href="#" className="hover:text-[#e53935] transition-all hover:translate-x-1 inline-block">Returns</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-base mb-5 tracking-tight">Get in Touch</h4>
            <div className="space-y-4 text-sm opacity-90">
              <div className="flex gap-3 items-start group">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#e53935] transition-all duration-200">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white/95 mb-1">Phone</p>
                  <p>+254746 999 725</p>
                </div>
              </div>
              <div className="flex gap-3 items-start group">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#e53935] transition-all duration-200">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white/95 mb-1">Email</p>
                  <p className="break-all">info@astermedsupplies.co.ke</p>
                </div>
              </div>
              <div className="flex gap-3 items-start group">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#e53935] transition-all duration-200">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white/95 mb-1">Location</p>
                  <p>123 Medical Drive<br />Healthcare City, HC 12345</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm opacity-90">
          <p className="mb-4 md:mb-0">&copy; 2024 AsterMed. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-[#e53935] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#e53935] transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-[#e53935] transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
