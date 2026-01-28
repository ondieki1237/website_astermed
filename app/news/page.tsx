'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  content: string
  image: string
  date: string
  featured?: boolean
}

const NEWS_ITEMS: NewsItem[] = [
  {
    id: '1',
    title: 'AsterMed Launches New Product Line',
    content: 'We are excited to announce the launch of our newest range of diagnostic equipment, designed with cutting-edge technology and user-friendly interfaces.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
    date: '2024-01-25',
    featured: true,
  },
  {
    id: '2',
    title: 'Partnership with Leading Healthcare Provider',
    content: 'AsterMed is proud to announce a strategic partnership with St. Medical Center to supply comprehensive medical equipment and supplies.',
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=600&h=400&fit=crop',
    date: '2024-01-20',
  },
  {
    id: '3',
    title: 'Sustainability Initiative Underway',
    content: 'Our commitment to environmental responsibility includes new sustainable packaging and reduced carbon footprint in our supply chain.',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop',
    date: '2024-01-18',
  },
  {
    id: '4',
    title: 'Quality Certifications Renewed',
    content: 'AsterMed has successfully renewed all ISO certifications, ensuring the highest standards in product quality and customer service.',
    image: 'https://images.unsplash.com/photo-1631217314830-4db48516e8ab?w=600&h=400&fit=crop',
    date: '2024-01-15',
  },
]

export default function NewsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Latest News</h1>
          <p className="text-lg text-muted-foreground">Stay updated with AsterMed</p>
        </div>

        {/* Featured News */}
        {NEWS_ITEMS.filter(n => n.featured).map(news => (
          <Card key={news.id} className="mb-12 overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2 h-96 md:h-auto">
              <div className="bg-muted overflow-hidden">
                <img src={news.image || "/placeholder.svg"} alt={news.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="text-accent font-bold text-sm mb-3 uppercase">Featured</span>
                <h2 className="text-3xl font-bold mb-4">{news.title}</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">{news.content}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(news.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* News Grid */}
        <h2 className="text-3xl font-bold mb-8">All News</h2>
        <div className="space-y-6">
          {NEWS_ITEMS.filter(n => !n.featured).map(news => (
            <Card key={news.id} className="overflow-hidden hover:shadow-lg transition p-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-1 aspect-video bg-muted overflow-hidden rounded">
                  <img src={news.image || "/placeholder.svg"} alt={news.title} className="w-full h-full object-cover" />
                </div>
                <div className="md:col-span-3">
                  <h3 className="text-2xl font-bold mb-2">{news.title}</h3>
                  <p className="text-muted-foreground mb-4">{news.content}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(news.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
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
