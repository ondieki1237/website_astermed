'use client'

import Link from 'next/link'
import { ShoppingCart, Search, Home } from 'lucide-react'
import { useState } from 'react'
import useCart from '@/hooks/use-cart'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const { count } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="px-8 py-5">
        <div className="flex items-center justify-between gap-6 max-w-full">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/astermedlogo.png" alt="AsterMed" className="h-24 w-auto" />
          </Link>

          {/* Center Navigation Pill */}
          <div className="hidden lg:flex items-center bg-primary text-white rounded-full px-6 py-3 gap-6 flex-1 max-w-3xl mx-auto">
            {/* Home Icon */}
            <Link href="/" className="flex items-center justify-center hover:opacity-70 transition p-2">
              <Home className="w-5 h-5" />
            </Link>

            {/* Navigation Links */}
            <Link href="/news" className="text-sm font-medium hover:opacity-70 transition whitespace-nowrap">
              Contact Us
            </Link>
            <Link href="/blogs" className="text-sm font-medium hover:opacity-70 transition whitespace-nowrap">
              Blog
            </Link>
            <Link href="/jobs" className="text-sm font-medium hover:opacity-70 transition whitespace-nowrap">
              Career
            </Link>

            {/* Search Bar - White Rounded Pill */}
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 ml-auto flex-1 max-w-xs">
              <input
                type="text"
                placeholder="type something ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs outline-none text-gray-800 placeholder-gray-400 w-full font-light"
              />
              <Search className="w-4 h-4 text-primary flex-shrink-0 cursor-pointer hover:opacity-70 transition" />
            </div>
          </div>

          {/* Cart Icon - Right Side */}
          <Link href="/cart" className="relative flex-shrink-0">
            <div className="bg-primary text-white rounded-full p-3 hover:bg-primary/90 transition">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{count || 0}</span>
            </div>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden mt-4 flex items-center gap-2 bg-primary text-white rounded-full px-4 py-2">
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-xs outline-none text-white placeholder-white/70 w-full"
          />
          <Search className="w-4 h-4" />
        </div>
      </div>
    </header>
  )
}
