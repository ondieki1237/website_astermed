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
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="px-4 max-w-[1800px] mx-auto relative">
          <div className="flex items-center justify-between lg:justify-center gap-4 max-w-full h-14 lg:h-20">
            {/* Mobile: Hamburger left, Logo centered, Cart right */}
            {/* Desktop: Logo left, Nav center */}

            {/* Mobile Menu Toggle - Left on mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#d0dc36] hover:bg-[#d0dc36]/10 rounded-lg transition-all duration-200 relative z-10 order-1"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo - Centered on mobile (absolute), left on desktop (static) */}
            <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity lg:order-1 order-2 absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
              <img src="/astermedlogo.png" alt="AsterMed" className="h-20 lg:h-20 w-auto object-contain" />
            </Link>



            {/* Mobile Cart - Right on mobile */}
            <Link href="/cart" className="lg:hidden relative p-2 text-[#d0dc36] hover:bg-[#d0dc36]/10 rounded-lg transition-all duration-200 z-10 order-3">
              <ShoppingCart className="w-6 h-6" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-br from-[#e53935] to-[#d32f2f] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">{count}</span>
              )}
            </Link>

            {/* Center Navigation Pill - Enhanced */}
            <div ref={containerRef} className="hidden lg:flex items-center bg-gradient-to-r from-[#d0dc36] via-[#c5d030] to-[#d0dc36] text-white rounded-full px-3 py-2 gap-3 flex-1 max-w-4xl relative shadow-lg">
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
                <Search onClick={() => doSearch(searchQuery)} className="w-4 h-4 text-[#d0dc36] flex-shrink-0 cursor-pointer hover:scale-110 transition-transform" />
              </div>

              {/* Cart Icon - Inside Nav */}
              <Link href="/cart" className="relative flex-shrink-0 ml-2 group">
                <div className="bg-white text-[#d0dc36] rounded-full p-2 hover:bg-white/95 transition-all duration-200 group-hover:shadow-lg">
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
                        <div className="text-sm text-[#d0dc36] font-bold">{s.isOnOffer ? formatPrice((s.price || 0) * (1 - (s.discountPercentage || 0) / 100)) : (s.price ? formatPrice(s.price) : '')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="lg:hidden px-4 pb-3">
            <div className="flex items-center gap-3 bg-gradient-to-r from-[#d0dc36] to-[#c5d030] text-white rounded-2xl px-4 py-3 shadow-lg">
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
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[320px] max-w-[85vw] bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
            {/* Header with Logo */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#9FA80E] to-[#B8C20D] text-white">
              <div className="flex items-center justify-between mb-4">
                <img src="/astermedlogo.png" alt="AsterMed" className="h-12 w-auto object-contain brightness-0 invert" />
                <button onClick={() => setMobileMenuOpen(false)} className="hover:bg-white/20 rounded-lg p-2 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div>
                <h2 className="font-bold text-lg">Menu</h2>
                <p className="text-xs text-white/80 mt-0.5">Navigate AsterMed</p>
              </div>
            </div>

            {/* Main Menu Section */}
            <div className="p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Main Menu</h3>
              <Link href="/" className="flex items-center gap-4 p-4 text-base font-semibold text-gray-800 hover:text-[#9FA80E] hover:bg-gradient-to-r hover:from-[#9FA80E]/5 hover:to-transparent rounded-xl transition-all duration-200 min-h-[48px]">
                <Home className="w-6 h-6 text-[#9FA80E]" />
                <span>Home</span>
              </Link>
            </div>

            {/* Categories Section */}
            <div className="px-4 pb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Product Categories</h3>
              <div onClick={(e) => e.stopPropagation()}>
                <CategorySidebar />
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="px-4 pb-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Quick Links</h3>
              <div className="space-y-2">
                <Link href="/news" className="flex items-center gap-4 p-4 text-base font-medium text-gray-700 hover:text-[#9FA80E] hover:bg-gradient-to-r hover:from-[#9FA80E]/5 hover:to-transparent rounded-xl transition-all min-h-[48px]">
                  <svg className="w-6 h-6 text-[#9FA80E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Contact Us</span>
                </Link>
                <Link href="/blogs" className="flex items-center gap-4 p-4 text-base font-medium text-gray-700 hover:text-[#9FA80E] hover:bg-gradient-to-r hover:from-[#9FA80E]/5 hover:to-transparent rounded-xl transition-all min-h-[48px]">
                  <svg className="w-6 h-6 text-[#9FA80E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span>Blog</span>
                </Link>
                <Link href="/jobs" className="flex items-center gap-4 p-4 text-base font-medium text-gray-700 hover:text-[#9FA80E] hover:bg-gradient-to-r hover:from-[#9FA80E]/5 hover:to-transparent rounded-xl transition-all min-h-[48px]">
                  <svg className="w-6 h-6 text-[#9FA80E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Career</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
