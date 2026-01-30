'use client'

import Link from 'next/link'
import { ShoppingCart, Search, Home, Menu, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import useCart from '@/hooks/use-cart'
import { resolveImageSrc } from '@/lib/image'
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
        const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || 'https://astermed.codewithseth.co.ke'
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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="px-3 py-2 max-w-7xl mx-auto">
        <div className="flex items-center justify-between lg:justify-center gap-3 max-w-full">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#1f2a7c] hover:bg-gray-100 rounded-md transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo - Slightly Larger and Centered */}
          <Link href="/" className="flex-shrink-0">
            <img src="/astermedlogo.png" alt="AsterMed" className="h-8 w-auto object-contain" />
          </Link>

          {/* Mobile Cart */}
          <Link href="/cart" className="lg:hidden relative p-1.5 text-[#1f2a7c] hover:bg-gray-100 rounded-md transition">
            <ShoppingCart className="w-6 h-6" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#e53935] text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center border-2 border-white">{count}</span>
            )}
          </Link>

          {/* Center Navigation Pill - More Compact */}
          <div ref={containerRef} className="hidden lg:flex items-center bg-[#1f2a7c] text-white rounded-full px-2 py-1 gap-2 flex-1 max-w-3xl relative">
            {/* Home Icon */}
            <Link href="/" className="flex items-center justify-center hover:opacity-70 transition p-1 bg-white/10 rounded-full">
              <Home className="w-3.5 h-3.5" />
            </Link>

            {/* Navigation Links */}
            <Link href="/news" className="text-[12px] font-medium hover:opacity-70 transition whitespace-nowrap px-2">
              Contact Us
            </Link>
            <Link href="/blogs" className="text-xs font-medium hover:opacity-70 transition whitespace-nowrap px-2">
              Blog
            </Link>
            <Link href="/jobs" className="text-xs font-medium hover:opacity-70 transition whitespace-nowrap px-2">
              Career
            </Link>

            {/* Search Bar - White Rounded Pill */}
            <div className="flex items-center gap-1 bg-white rounded-full px-2 py-1 ml-auto flex-1 max-w-xs">
              <input
                type="text"
                placeholder="type something ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') doSearch(searchQuery) }}
                className="bg-transparent text-[11px] outline-none text-gray-800 placeholder-gray-400 w-full font-light"
              />
              <Search onClick={() => doSearch(searchQuery)} className="w-3 h-3 text-[#1f2a7c] flex-shrink-0 cursor-pointer hover:opacity-70 transition" />
            </div>

            {/* Cart Icon - Inside Nav */}
            <Link href="/cart" className="relative flex-shrink-0 ml-2">
              <div className="bg-white text-[#1f2a7c] rounded-full p-1 hover:bg-white/90 transition">
                <ShoppingCart className="w-3.5 h-3.5" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{count}</span>
                )}
              </div>
            </Link>

            {/* Suggestions dropdown */}
            {suggestOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white text-sm rounded shadow-lg overflow-hidden z-50">
                {suggestions.map((s) => (
                  <div key={s._id} onClick={() => { router.push(`/products/${s._id}`); setSuggestOpen(false) }} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <img src={resolveImageSrc(s.image)} alt={s.name} className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{s.name}</div>
                      <div className="text-xs text-gray-600">{s.isOnOffer ? formatPrice((s.price || 0) * (1 - (s.discountPercentage || 0) / 100)) : (s.price ? formatPrice(s.price) : '')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden mt-3 flex items-center gap-2 bg-[#1f2a7c] text-white rounded-full px-3 py-2">
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') doSearch(searchQuery) }}
            className="bg-transparent text-xs outline-none text-white placeholder-white/70 w-full"
          />
          <Search onClick={() => doSearch(searchQuery)} className="w-4 h-4 cursor-pointer" />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#1f2a7c] text-white">
              <span className="font-bold text-sm">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5 opacity-80" />
              </button>
            </div>
            <div className="p-2">
              <Link href="/" className="flex items-center gap-3 p-3 text-sm font-medium text-[#1f2a7c] hover:bg-blue-50 rounded-md transition">
                <Home className="w-4 h-4" /> Home
              </Link>
              <div className="my-2 border-t border-gray-100" />
              <div onClick={(e) => e.stopPropagation()}>
                <CategorySidebar />
              </div>
              <div className="my-2 border-t border-gray-100" />
              <div className="space-y-1 p-1">
                <Link href="/news" className="block p-2 text-xs font-medium text-gray-600 hover:text-[#1f2a7c] hover:bg-blue-50 rounded transition">Contact Us</Link>
                <Link href="/blogs" className="block p-2 text-xs font-medium text-gray-600 hover:text-[#1f2a7c] hover:bg-blue-50 rounded transition">Blog</Link>
                <Link href="/jobs" className="block p-2 text-xs font-medium text-gray-600 hover:text-[#1f2a7c] hover:bg-blue-50 rounded transition">Career</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
