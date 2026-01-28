"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const PUBLIC_ADMIN = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
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
    } catch (err: any) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 border rounded bg-card">
        <h2 className="text-2xl font-bold mb-4">Admin login</h2>
        <p className="text-sm mb-4">Enter the admin email to receive a one-time code.</p>
        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="info@yourdomain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
          <button className="w-full btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send code'}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!error && PUBLIC_ADMIN && (
            <p className="text-sm text-muted-foreground">Admin email: {PUBLIC_ADMIN}</p>
          )}
        </form>
      </div>
    </div>
  )
}
