'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getApiBase } from '@/lib/api'

interface Blog {
  _id: string
  title: string
  excerpt?: string
  content?: string
  image: string
  author: string
  date: string
  category: string
  views: number
  createdAt?: string
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const API_BASE = getApiBase()
        const res = await fetch(`${API_BASE}/api/blogs`)
        if (!res.ok) throw new Error('Failed to load blogs')
        const data = await res.json()
        setBlogs(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(error)
        setBlogs([])
      } finally {
        setLoading(false)
      }
    }
    loadBlogs()
  }, [])

  const featuredBlog = blogs[0]
  const latestBlogs = blogs.slice(1)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Healthcare Insights</h1>
          <p className="text-lg text-muted-foreground">Expert articles and tips for medical professionals</p>
        </div>

        {/* Featured Blog */}
        {loading ? (
          <Card className="mb-12 p-8 text-muted-foreground">Loading blogs...</Card>
        ) : featuredBlog ? (
          <Link href={`/blogs/${featuredBlog._id}`}>
            <Card className="mb-12 overflow-hidden hover:shadow-lg transition cursor-pointer">
              <div className="grid md:grid-cols-2 h-96 md:h-auto">
                <div className="bg-muted overflow-hidden">
                  <img src={featuredBlog.image || "/placeholder.svg"} alt={featuredBlog.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-accent font-bold text-sm mb-3">FEATURED</span>
                  <h2 className="text-3xl font-bold mb-4">{featuredBlog.title}</h2>
                  <p className="text-muted-foreground mb-6">{featuredBlog.excerpt || featuredBlog.content || 'No summary available.'}</p>
                  <div className="flex gap-6 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {featuredBlog.author || 'AsterMed Team'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(featuredBlog.createdAt || featuredBlog.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Button className="w-fit bg-primary hover:bg-primary/90">
                    Read More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        ) : (
          <Card className="mb-12 p-8 text-muted-foreground">No blog posts published yet.</Card>
        )}

        {/* Blog Grid */}
        <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>
        {latestBlogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestBlogs.map((blog) => (
              <Link key={blog._id} href={`/blogs/${blog._id}`}>
                <Card className="overflow-hidden h-full hover:shadow-lg transition cursor-pointer">
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img src={blog.image || "/placeholder.svg"} alt={blog.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <span className="text-xs bg-secondary text-foreground px-2 py-1 rounded font-semibold">
                      {blog.category || 'General'}
                    </span>
                    <h3 className="text-xl font-bold my-3 line-clamp-2">{blog.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{blog.excerpt || blog.content || 'No summary available.'}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{blog.author || 'AsterMed Team'}</span>
                      <span>{new Date(blog.createdAt || blog.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          !loading && <Card className="p-8 text-muted-foreground">No additional blog posts available.</Card>
        )}
      </main>

      <Footer />
    </div>
  )
}
