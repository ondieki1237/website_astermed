'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, User } from 'lucide-react'
import Link from 'next/link'

interface Blog {
  id: string
  title: string
  excerpt: string
  image: string
  author: string
  date: string
  category: string
  views: number
}

const BLOGS: Blog[] = [
  {
    id: '1',
    title: 'Tips for Home Healthcare',
    excerpt: 'Learn essential tips and best practices for providing quality home healthcare to your loved ones.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
    author: 'Dr. Sarah Smith',
    date: '2024-01-20',
    category: 'Healthcare Tips',
    views: 1250,
  },
  {
    id: '2',
    title: 'Medical Equipment Maintenance Guide',
    excerpt: 'Proper maintenance of medical equipment ensures accuracy and longevity. Here\'s our comprehensive guide.',
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=600&h=400&fit=crop',
    author: 'Dr. James Wilson',
    date: '2024-01-15',
    category: 'Equipment',
    views: 890,
  },
  {
    id: '3',
    title: 'Common Medical Supply Mistakes',
    excerpt: 'Avoid these common mistakes when ordering medical supplies to ensure optimal patient care.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
    author: 'Dr. Emily Brown',
    date: '2024-01-10',
    category: 'Best Practices',
    views: 756,
  },
]

export default function BlogsPage() {
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
        <Link href={`/blogs/${BLOGS[0].id}`}>
          <Card className="mb-12 overflow-hidden hover:shadow-lg transition cursor-pointer">
            <div className="grid md:grid-cols-2 h-96 md:h-auto">
              <div className="bg-muted overflow-hidden">
                <img src={BLOGS[0].image || "/placeholder.svg"} alt={BLOGS[0].title} className="w-full h-full object-cover" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="text-accent font-bold text-sm mb-3">FEATURED</span>
                <h2 className="text-3xl font-bold mb-4">{BLOGS[0].title}</h2>
                <p className="text-muted-foreground mb-6">{BLOGS[0].excerpt}</p>
                <div className="flex gap-6 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {BLOGS[0].author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(BLOGS[0].date).toLocaleDateString()}
                  </div>
                </div>
                <Button className="w-fit bg-primary hover:bg-primary/90">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </Link>

        {/* Blog Grid */}
        <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOGS.slice(1).map(blog => (
            <Link key={blog.id} href={`/blogs/${blog.id}`}>
              <Card className="overflow-hidden h-full hover:shadow-lg transition cursor-pointer">
                <div className="aspect-video overflow-hidden bg-muted">
                  <img src={blog.image || "/placeholder.svg"} alt={blog.title} className="w-full h-full object-cover" />
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
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
