'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, DollarSign, Clock } from 'lucide-react'

interface Job {
  id: string
  title: string
  department: string
  location: string
  type: string
  salary: string
  description: string
  requirements: string[]
  deadline: string
}

const JOBS: Job[] = [
  {
    id: '1',
    title: 'Sales Manager',
    department: 'Sales',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$60,000 - $80,000',
    description: 'Lead our sales team and drive revenue growth through strategic partnerships and customer relationship management.',
    requirements: [
      '5+ years of sales experience',
      'Proven track record in medical supplies',
      'Strong leadership skills',
      'MBA preferred',
    ],
    deadline: '2024-02-28',
  },
  {
    id: '2',
    title: 'Product Manager',
    department: 'Product',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$90,000 - $120,000',
    description: 'Manage product development and strategy for our growing line of medical equipment.',
    requirements: [
      '7+ years of product management experience',
      'Experience with medical devices',
      'Data-driven decision making',
      'Cross-functional team leadership',
    ],
    deadline: '2024-02-15',
  },
  {
    id: '3',
    title: 'Clinical Support Specialist',
    department: 'Customer Support',
    location: 'Chicago, IL',
    type: 'Full-time',
    salary: '$45,000 - $55,000',
    description: 'Provide clinical expertise and support to our healthcare facility customers.',
    requirements: [
      'RN or equivalent clinical background',
      'Excellent communication skills',
      'Patient care experience',
      'Customer service excellence',
    ],
    deadline: '2024-03-10',
  },
  {
    id: '4',
    title: 'Supply Chain Analyst',
    department: 'Operations',
    location: 'Remote',
    type: 'Full-time',
    salary: '$55,000 - $70,000',
    description: 'Optimize our supply chain operations and inventory management systems.',
    requirements: [
      '3+ years in supply chain management',
      'SAP or similar ERP experience',
      'Data analysis skills',
      'Problem-solving abilities',
    ],
    deadline: '2024-02-20',
  },
]

export default function JobsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-lg text-muted-foreground">Exciting career opportunities at AsterMed</p>
        </div>

        {/* Jobs Grid */}
        <div className="space-y-6">
          {JOBS.map(job => (
            <Card key={job.id} className="p-8 border-none shadow-md hover:shadow-lg transition">
              <div className="grid md:grid-cols-4 gap-6 mb-6">
                <div className="md:col-span-2">
                  <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
                  <p className="text-muted-foreground mb-4">{job.department}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-accent" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Briefcase className="w-4 h-4 text-accent" />
                      {job.type}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-accent" />
                      {job.salary}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Deadline to apply:</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button className="bg-accent hover:bg-accent/90 mt-4">Apply Now</Button>
                </div>
              </div>

              <div className="mb-6 pb-6 border-t">
                <p className="text-muted-foreground mb-4">{job.description}</p>
              </div>

              <div>
                <h3 className="font-bold mb-3">Requirements:</h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex gap-3 text-sm">
                      <span className="text-accent font-bold">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
