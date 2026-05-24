'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, DollarSign, Clock } from 'lucide-react'

const JOBS = [
  {
    id: 'warehouse-assistant',
    title: 'Warehouse Assistant',
    department: 'Operations',
    location: 'Nairobi, Kenya',
    jobType: 'Full-time',
    description: 'Support stock receiving, order preparation, and warehouse organization for medical supplies.',
    requirements: ['Strong attention to detail', 'Basic inventory handling experience', 'Reliable and organized'],
  },
  {
    id: 'sales-exec',
    title: 'Sales Executive',
    department: 'Commercial',
    location: 'Nairobi, Kenya',
    jobType: 'Full-time',
    description: 'Help clients choose the right equipment and provide quotations for healthcare procurement.',
    requirements: ['Excellent communication skills', 'Sales experience preferred', 'Customer-focused mindset'],
  },
]

export default function JobsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 pt-32 md:pt-32 lg:pt-28">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-lg text-muted-foreground">Exciting career opportunities at AsterMed</p>
        </div>

        <div className="space-y-6">
          {JOBS.map((job) => (
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
                      {job.jobType}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-accent" />
                      Salary negotiable
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Deadline to apply:</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">Open until filled</span>
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
