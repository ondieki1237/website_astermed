'use client'

import Link from 'next/link'
import { ShoppingCart, Search, Home, Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import useCart from '@/hooks/use-cart'
import { resolveImageSrc } from '@/lib/image'
import { getApiBase } from '@/lib/api'
import { formatPrice } from '@/lib/currency'
import CategorySidebar from './category-sidebar'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const suggestTimer = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { count } = useCart()
  const router = useRouter()
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const doSearch = (q: string) => {
    const term = String(q || '').trim()
    if (!term) return
    router.push(`/products?search=${encodeURIComponent(term)}`)
  }

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setSuggestOpen(false)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  useEffect(() => {
    if (suggestTimer.current) window.clearTimeout(suggestTimer.current)
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([])
      setSuggestOpen(false)
      return
    }
    setLoadingSuggest(true)
    suggestTimer.current = window.setTimeout(async () => {
      try {
        const API_BASE = getApiBase()
        const res = await fetch(`${API_BASE}/api/products/suggest?q=${encodeURIComponent(searchQuery)}&limit=6`)
        if (!res.ok) throw new Error('fail')
        const data = await res.json()
        setSuggestions(data || [])
        setSuggestOpen(true)
      } catch (e) {
        setSuggestions([])
        setSuggestOpen(false)
      } finally {
        setLoadingSuggest(false)
      }
    }, 250)
    return () => { if (suggestTimer.current) window.clearTimeout(suggestTimer.current) }
  }, [searchQuery])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm h-14 lg:h-20">
      <div className="px-4 max-w-[1800px] mx-auto relative h-full">
        <div className="flex items-center justify-between lg:justify-center gap-4 max-w-full h-full">
          {/* Logo - left, above categories area */}
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <img src="/astermedlogo.png" alt="AsterMed" className="h-10 lg:h-20 w-auto object-contain" />
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1f2a7c] hover:bg-[#1f2a7c]/10 rounded-lg transition-all duration-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Cart */}
          <Link href="/cart" className="lg:hidden relative p-2 text-[#1f2a7c] hover:bg-[#1f2a7c]/10 rounded-lg transition-all duration-200">
            <ShoppingCart className="w-6 h-6" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-br from-[#e53935] to-[#d32f2f] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">{count}</span>
            )}
          </Link>

          {/* Center Navigation Pill - Enhanced */}
          <div ref={containerRef} className="hidden lg:flex items-center bg-gradient-to-r from-[#1f2a7c] via-[#2535a0] to-[#1f2a7c] text-white rounded-full px-3 py-2 gap-3 flex-1 max-w-4xl relative shadow-lg">
            {/* Home Icon */}
            <Link href="/" className="flex items-center justify-center hover:bg-white/20 transition-all duration-200 p-2 bg-white/10 rounded-full group">
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </Link>

            {/* Navigation Links */}
            <Link href="/news" className="text-sm font-medium hover:text-white/80 transition-all duration-200 whitespace-nowrap px-3 py-1 rounded-full hover:bg-white/10">
              Contact Us
            </Link>
            <Link href="/blogs" className="text-sm font-medium hover:text-white/80 transition-all duration-200 whitespace-nowrap px-3 py-1 rounded-full hover:bg-white/10">
              Blog
            </Link>
            <Link href="/jobs" className="text-sm font-medium hover:text-white/80 transition-all duration-200 whitespace-nowrap px-3 py-1 rounded-full hover:bg-white/10">
              Career
            </Link>

            {/* Search Bar - White Rounded Pill */}
            <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 ml-auto flex-1 max-w-md shadow-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') doSearch(searchQuery) }}
                className="bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400 w-full"
              />
              <Search onClick={() => doSearch(searchQuery)} className="w-4 h-4 text-[#1f2a7c] flex-shrink-0 cursor-pointer hover:scale-110 transition-transform" />
            </div>

            {/* Cart Icon - Inside Nav */}
            <Link href="/cart" className="relative flex-shrink-0 ml-2 group">
              <div className="bg-white text-[#1f2a7c] rounded-full p-2 hover:bg-white/95 transition-all duration-200 group-hover:shadow-lg">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-[#e53935] to-[#d32f2f] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">{count}</span>
                )}
              </div>
            </Link>

            {/* Suggestions dropdown */}
            {suggestOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-3 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 border border-gray-100">
                {suggestions.map((s) => (
                  <div key={s._id} onClick={() => { router.push(`/products/${s._id}`); setSuggestOpen(false) }} className="flex items-center gap-4 px-4 py-3 hover:bg-gradient-to-r hover:from-[#f9fbff] hover:to-white cursor-pointer transition-all duration-200 border-b border-gray-50 last:border-0">
                    <img src={resolveImageSrc(s.image)} alt={s.name} className="w-14 h-14 object-cover rounded-lg shadow-sm" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm">{s.name}</div>
                      <div className="text-sm text-[#1f2a7c] font-bold">{s.isOnOffer ? formatPrice((s.price || 0) * (1 - (s.discountPercentage || 0) / 100)) : (s.price ? formatPrice(s.price) : '')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden mt-4 flex items-center gap-3 bg-gradient-to-r from-[#1f2a7c] to-[#2535a0] text-white rounded-2xl px-4 py-3 shadow-lg">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') doSearch(searchQuery) }}
            className="bg-transparent text-sm outline-none text-white placeholder-white/70 w-full"
          />
          <Search onClick={() => doSearch(searchQuery)} className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-[#1f2a7c] to-[#2535a0] text-white">
              <span className="font-bold text-base">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="hover:bg-white/20 rounded-lg p-2 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3">
              <Link href="/" className="flex items-center gap-3 p-4 text-sm font-semibold text-[#1f2a7c] hover:bg-gradient-to-r hover:from-[#f9fbff] hover:to-white rounded-xl transition-all duration-200">
                <Home className="w-5 h-5" /> Home
              </Link>
              <div className="my-3 border-t border-gray-100" />
              <div onClick={(e) => e.stopPropagation()}>
                <CategorySidebar />
              </div>
              <div className="my-3 border-t border-gray-100" />
              <div className="space-y-1 p-1">
                <Link href="/news" className="block p-3 text-sm font-medium text-gray-700 hover:text-[#1f2a7c] hover:bg-gradient-to-r hover:from-[#f9fbff] hover:to-white rounded-xl transition-all">Contact Us</Link>
                <Link href="/blogs" className="block p-3 text-sm font-medium text-gray-700 hover:text-[#1f2a7c] hover:bg-gradient-to-r hover:from-[#f9fbff] hover:to-white rounded-xl transition-all">Blog</Link>
                <Link href="/jobs" className="block p-3 text-sm font-medium text-gray-700 hover:text-[#1f2a7c] hover:bg-gradient-to-r hover:from-[#f9fbff] hover:to-white rounded-xl transition-all">Career</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
