'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, User } from 'lucide-react'

const BLOGS = [
  {
    id: 'shipping-tips',
    title: 'How to Choose Reliable Medical Supplies for a Busy Clinic',
    excerpt: 'A practical checklist for selecting equipment that lasts longer, performs well, and supports patient care.',
    image: '/astermedlogo.png',
    author: 'AsterMed Team',
    date: new Date().toISOString(),
    category: 'Buying Guide',
  },
  {
    id: 'infection-control',
    title: 'Simple Infection Control Practices Every Team Can Follow',
    excerpt: 'Daily routines that improve safety, reduce waste, and keep essential supplies organized.',
    image: '/astermedlogo.png',
    author: 'AsterMed Team',
    date: new Date().toISOString(),
    category: 'Clinic Tips',
  },
  {
    id: 'restocking',
    title: 'Why Stock Planning Matters in Healthcare Procurement',
    excerpt: 'How to avoid shortages, plan restocking cycles, and keep frontline teams ready.',
    image: '/astermedlogo.png',
    author: 'AsterMed Team',
    date: new Date().toISOString(),
    category: 'Operations',
  },
]

export default function BlogsPage() {
  const featuredBlog = BLOGS[0]
  const latestBlogs = BLOGS.slice(1)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 pt-32 md:pt-32 lg:pt-28">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Healthcare Insights</h1>
          <p className="text-lg text-muted-foreground">Expert articles and tips for medical professionals</p>
        </div>

        <Card className="mb-12 overflow-hidden hover:shadow-lg transition cursor-pointer">
          <div className="grid md:grid-cols-2 h-96 md:h-auto">
            <div className="bg-muted overflow-hidden">
              <img src={featuredBlog.image} alt={featuredBlog.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <span className="text-accent font-bold text-sm mb-3">FEATURED</span>
              <h2 className="text-3xl font-bold mb-4">{featuredBlog.title}</h2>
              <p className="text-muted-foreground mb-6">{featuredBlog.excerpt}</p>
              <div className="flex gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {featuredBlog.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(featuredBlog.date).toLocaleDateString()}
                </div>
              </div>
              <Button className="w-fit bg-primary hover:bg-primary/90">
                Read More <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>

        <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestBlogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden h-full hover:shadow-lg transition cursor-pointer">
              <div className="aspect-video overflow-hidden bg-muted">
                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <span className="text-xs bg-secondary text-foreground px-2 py-1 rounded font-semibold">
                  {blog.category}
                </span>
                <h3 className="text-xl font-bold my-3 line-clamp-2">{blog.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{blog.excerpt}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{blog.author}</span>
                  <span>{new Date(blog.date).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
