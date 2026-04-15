'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, ChevronRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#2D2D2D] text-gray-300 mt-auto border-t-4 border-[#5A946A]">
      <div className="px-4 xl:px-8 py-12 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Company Info */}
          <div>
            <img src="/astermedlogo.png" alt="AsterMed" className="h-10 mb-6 brightness-0 invert" />
            <p className="text-[13px] leading-relaxed mb-6 text-gray-400">
              Premium medical supplies and equipment for healthcare professionals across Kenya and beyond. We verify the authenticity of all our professional tools.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com/astermedKe" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[#3d3d3d] hover:bg-[#5A946A] text-white flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/astermedKe" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[#3d3d3d] hover:bg-[#5A946A] text-white flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com/company/astermedKe" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-[#3d3d3d] hover:bg-[#5A946A] text-white flex items-center justify-center transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white text-[15px] mb-5 tracking-wide uppercase border-l-2 border-[#5A946A] pl-3">Quick Links</h4>
            <ul className="space-y-2 text-[13px]">
              <li><Link href="/products" className="hover:text-[#5A946A] transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-[#5A946A]"/> Products Catalog</Link></li>
              <li><Link href="/blogs" className="hover:text-[#5A946A] transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-[#5A946A]"/> Blog & News</Link></li>
              <li><Link href="/news" className="hover:text-[#5A946A] transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-[#5A946A]"/> Contact Us</Link></li>
              <li><Link href="/jobs" className="hover:text-[#5A946A] transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-[#5A946A]"/> Careers</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-white text-[15px] mb-5 tracking-wide uppercase border-l-2 border-[#5A946A] pl-3">Customer Service</h4>
            <ul className="space-y-2 text-[13px]">
              <li><Link href="#" className="hover:text-[#5A946A] transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-[#5A946A]"/> Frequently Asked Questions</Link></li>
              <li><Link href="#" className="hover:text-[#5A946A] transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-[#5A946A]"/> Shipping & Delivery Info</Link></li>
              <li><Link href="#" className="hover:text-[#5A946A] transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-[#5A946A]"/> Returns & Exchanges</Link></li>
              <li><Link href="#" className="hover:text-[#5A946A] transition-colors flex items-center gap-2"><ChevronRight className="w-3 h-3 text-[#5A946A]"/> Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-white text-[15px] mb-5 tracking-wide uppercase border-l-2 border-[#5A946A] pl-3">Contact Information</h4>
            <div className="space-y-4 text-[13px]">
              <div className="flex gap-3 items-start">
                <MapPin className="w-4 h-4 text-[#5A946A] mt-1 shrink-0" />
                <p className="text-gray-400">Nairobi City<br />Kenya</p>
              </div>
              <div className="flex gap-3 items-start">
                <Phone className="w-4 h-4 text-[#5A946A] mt-0.5 shrink-0" />
                <p className="text-gray-400">+254 746 999 725</p>
              </div>
              <div className="flex gap-3 items-start">
                <Mail className="w-4 h-4 text-[#5A946A] mt-0.5 shrink-0" />
                <p className="text-gray-400 break-all">info@astermedsupplies.co.ke</p>
              </div>
            </div>
            
            <div className="mt-6">
              <Link href="/news" className="inline-block bg-[#5A946A] text-white text-[12px] font-bold uppercase tracking-wider px-6 py-2.5 hover:bg-[#487a55] transition-colors">
                Request a Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#3d3d3d] bg-[#222222]">
        <div className="max-w-[1400px] mx-auto px-4 xl:px-8 py-4 flex flex-col md:flex-row justify-between items-center text-[12px] text-gray-500">
          <p>&copy; {new Date().getFullYear()} AsterMed Medical Supplies. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/512px-M-PESA_LOGO-01.svg.png?20191120100524" alt="M-Pesa" className="h-6 opacity-60 filter grayscale hover:grayscale-0 transition-all" />
            <span className="flex items-center gap-1"><span className="text-lg">🔒</span> SSL Secure Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
