 'use client'

import Link from 'next/link'
import { ShoppingCart, Search, Home } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useCart from '@/hooks/use-cart'
import { resolveImageSrc } from '@/lib/image'
import { formatPrice } from '@/lib/currency'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [loadingSuggest, setLoadingSuggest] = useState(false)
  const suggestTimer = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { count } = useCart()
  const router = useRouter()

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
        const API_BASE = (process.env.NEXT_PUBLIC_API_URL as string) || 'http://localhost:5088'
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
      <div className="px-6 py-3">
        <div className="flex items-center justify-between gap-4 max-w-full">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <img src="/astermedlogo.png" alt="AsterMed" className="h-12 w-auto ml-3 md:ml-6 object-contain" />
          </Link>

          {/* Center Navigation Pill */}
          <div ref={containerRef} className="hidden lg:flex items-center bg-primary text-white rounded-full px-4 py-2 gap-4 flex-1 max-w-3xl mx-auto relative">
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
            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1.5 ml-auto flex-1 max-w-xs">
              <input
                type="text"
                placeholder="type something ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') doSearch(searchQuery) }}
                className="bg-transparent text-xs outline-none text-gray-800 placeholder-gray-400 w-full font-light"
              />
              <Search onClick={() => doSearch(searchQuery)} className="w-4 h-4 text-primary flex-shrink-0 cursor-pointer hover:opacity-70 transition" />
            </div>

            {/* Suggestions dropdown */}
            {suggestOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white text-sm rounded shadow-lg overflow-hidden z-50">
                {suggestions.map((s) => (
                  <div key={s._id} onClick={() => { router.push(`/products/${s._id}`); setSuggestOpen(false) }} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <img src={resolveImageSrc(s.image)} alt={s.name} className="w-10 h-10 object-cover rounded" />
                    <div className="flex-1">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.isOnOffer ? formatPrice((s.price || 0) * (1 - (s.discountPercentage || 0) / 100)) : (s.price ? formatPrice(s.price) : '')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Icon - Right Side */}
          <Link href="/cart" className="relative flex-shrink-0">
            <div className="bg-primary text-white rounded-full p-2 hover:bg-primary/90 transition">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{count || 0}</span>
            </div>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden mt-3 flex items-center gap-2 bg-primary text-white rounded-full px-3 py-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') doSearch(searchQuery) }}
            className="bg-transparent text-xs outline-none text-white placeholder-white/70 w-full"
          />
          <Search onClick={() => doSearch(searchQuery)} className="w-4 h-4" />
        </div>
      </div>
    </header>
  )
}
