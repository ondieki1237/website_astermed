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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 xl:px-8 max-w-[1400px] mx-auto relative">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Toggle - Left on mobile */}
            <div className="lg:hidden w-10 flex items-center justify-start">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-[#5A946A] hover:bg-gray-50 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Centered Logo */}
            <div className="lg:hidden flex-1 flex items-center justify-center px-2">
              <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
                <img src="/astermedlogo.png" alt="AsterMed" className="h-7 w-auto object-contain" />
              </Link>
            </div>

            {/* Desktop Logo */}
            <Link href="/" className="hidden lg:block flex-shrink-0 hover:opacity-80 transition-opacity">
              <img src="/astermedlogo.png" alt="AsterMed" className="h-10 lg:h-12 w-auto object-contain" />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className={`text-[15px] font-semibold transition-colors ${pathname === '/' ? 'text-[#5A946A] border-b-2 border-[#5A946A] pb-1' : 'text-gray-700 hover:text-[#5A946A]'}`}>
                Home
              </Link>
              <Link href="/products" className={`text-[15px] font-semibold transition-colors ${pathname.startsWith('/products') ? 'text-[#5A946A] border-b-2 border-[#5A946A] pb-1' : 'text-gray-700 hover:text-[#5A946A]'}`}>
                Products
              </Link>
              <Link href="/news" className="text-[15px] font-semibold text-gray-700 hover:text-[#5A946A] transition-colors">
                Contact Us
              </Link>
              <Link href="/blogs" className="text-[15px] font-semibold text-gray-700 hover:text-[#5A946A] transition-colors">
                Blog
              </Link>
              <Link href="/jobs" className="text-[15px] font-semibold text-gray-700 hover:text-[#5A946A] transition-colors">
                Career
              </Link>
            </div>

            {/* Right Side: Search and Cart */}
            <div className="flex items-center justify-end w-10 lg:w-auto gap-2 lg:gap-4">
              {/* Desktop Search */}
              <div className="hidden lg:flex items-center border border-gray-300 rounded-md px-3 py-1.5 focus-within:border-[#5A946A] focus-within:ring-1 focus-within:ring-[#5A946A] transition-all bg-white w-[250px] relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') doSearch(searchQuery) }}
                  className="bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400 flex-1"
                />
                <Search onClick={() => doSearch(searchQuery)} className="w-4 h-4 text-gray-400 hover:text-[#5A946A] cursor-pointer transition-colors" />
                
                {/* Search Suggestions */}
                {suggestOpen && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-50">
                    {suggestions.map((s) => (
                      <div key={s._id} onClick={() => { router.push(`/products/${s._id}`); setSuggestOpen(false) }} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors">
                        <img src={resolveImageSrc(s.image)} alt={s.name} className="w-10 h-10 object-cover rounded border border-gray-100" />
                        <div className="flex-1 overflow-hidden">
                          <div className="font-medium text-gray-800 text-xs truncate">{s.name}</div>
                          <div className="text-xs text-[#5A946A] font-bold mt-0.5">{s.isOnOffer ? formatPrice((s.price || 0) * (1 - (s.discountPercentage || 0) / 100)) : (s.price ? formatPrice(s.price) : '')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Cart Toggle */}
              <Link href="/cart" className="relative p-2 text-gray-700 hover:text-[#5A946A] transition-colors rounded-lg hover:bg-gray-50" aria-label="Cart">
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                {count > 0 && (
                  <span className="absolute 0 top-0 right-0 bg-[#5A946A] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{count}</span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar (under main header if needed) */}
          <div className="lg:hidden pb-3">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 focus-within:border-[#5A946A] transition-colors">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') doSearch(searchQuery) }}
                className="bg-transparent text-sm outline-none text-gray-800 placeholder-gray-500 flex-1"
              />
              <Search onClick={() => doSearch(searchQuery)} className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] flex">
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[300px] max-w-[80vw] bg-white h-full shadow-2xl overflow-y-auto duration-300 transform translate-x-0">
            {/* Header with Logo */}
            <div className="p-5 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <img src="/astermedlogo.png" alt="AsterMed" className="h-8 w-auto object-contain" />
                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-[#5A946A] p-1">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Main Menu Section */}
            <div className="p-3">
              <div className="space-y-1">
                <Link href="/" className="flex items-center gap-3 p-3 text-[15px] font-medium text-gray-800 hover:text-[#5A946A] hover:bg-gray-50 rounded-md transition-colors">
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </Link>
                <Link href="/products" className="flex items-center gap-3 p-3 text-[15px] font-medium text-gray-800 hover:text-[#5A946A] hover:bg-gray-50 rounded-md transition-colors">
                  <span className="w-5 h-5 flex items-center justify-center">📦</span>
                  <span>Products</span>
                </Link>
              </div>
            </div>

            {/* Categories Section */}
            <div className="px-3 pb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">Product Categories</h3>
              <div onClick={(e) => e.stopPropagation()}>
                <CategorySidebar />
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="px-3 pb-6 border-t border-gray-100 pt-4 mt-2">
              <div className="space-y-1">
                <Link href="/news" className="flex items-center gap-3 p-3 text-[15px] font-medium text-gray-600 hover:text-[#5A946A] hover:bg-gray-50 rounded-md transition-colors">
                  <span>Contact Us</span>
                </Link>
                <Link href="/blogs" className="flex items-center gap-3 p-3 text-[15px] font-medium text-gray-600 hover:text-[#5A946A] hover:bg-gray-50 rounded-md transition-colors">
                  <span>Blog</span>
                </Link>
                <Link href="/jobs" className="flex items-center gap-3 p-3 text-[15px] font-medium text-gray-600 hover:text-[#5A946A] hover:bg-gray-50 rounded-md transition-colors">
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
