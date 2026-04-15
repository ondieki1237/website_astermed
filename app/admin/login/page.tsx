"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://astermed.codewithseth.co.ke'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginMethod, setLoginMethod] = useState<'password' | 'code'>('password')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const PUBLIC_ADMIN = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      if (loginMethod === 'password') {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.message || 'Login failed')
          return
        }
        
        if (data.token) {
          localStorage.setItem('admin_token', data.token)
          router.push('/admin')
        } else {
          setError('No token returned')
        }

      } else {
        const res = await fetch(`${API_BASE}/api/auth/admin/request-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (!res.ok) {
          if (res.status === 403) {
            setError(data.message || 'Unauthorized: check admin email or server ADMIN_EMAIL setting')
          } else {
            setError(data.message || 'Request failed')
          }
          return
        }
        router.push(`/admin/verify?email=${encodeURIComponent(email)}`)
      }
    } catch (err: any) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 border rounded bg-card">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <p className="text-sm mb-6 text-gray-500">
          {loginMethod === 'password' ? 'Login with your admin password.' : 'Enter your email to receive a one-time code.'}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="admin@astermed.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#5A946A]"
            />
          </div>

          {loginMethod === 'password' && (
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#5A946A]"
              />
            </div>
          )}

          <button className="w-full bg-[#5A946A] hover:bg-[#487a55] text-white py-2.5 rounded font-bold transition-colors shadow-sm" disabled={loading}>
            {loading ? 'Processing...' : loginMethod === 'password' ? 'Login' : 'Send Code'}
          </button>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
          {!error && PUBLIC_ADMIN && loginMethod === 'code' && (
            <p className="text-sm text-muted-foreground">Admin email: {PUBLIC_ADMIN}</p>
          )}

          <div className="pt-4 mt-4 border-t text-center">
            <button 
              type="button" 
              onClick={() => setLoginMethod(loginMethod === 'password' ? 'code' : 'password')}
              className="text-sm text-[#5A946A] hover:underline font-medium"
            >
              {loginMethod === 'password' ? 'Login with one-time code instead' : 'Login with password instead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
